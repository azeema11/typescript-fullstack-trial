import { prisma } from "../utils/prisma";
import { EmployeeStatus } from "@prisma/client";
import { COUNTRIES } from "../constants/countries";

export class AnalyticsService {
  /**
   * Global counts summary
   */
  static async getSummary() {
    const counts = await prisma.employee.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const statusCounts = {
      active: 0,
      inactive: 0,
      on_leave: 0,
    };

    counts.forEach((c) => {
      statusCounts[c.status as keyof typeof statusCounts] = c._count.id;
    });

    const departmentCount = await prisma.department.count();
    
    // Get unique countries in DB
    const countriesGroup = await prisma.employee.groupBy({
      by: ["country"],
    });
    const countryCount = countriesGroup.length;

    const headcount = statusCounts.active + statusCounts.on_leave;

    return {
      headcount,
      activeCount: statusCounts.active,
      onLeaveCount: statusCounts.on_leave,
      inactiveCount: statusCounts.inactive,
      departmentCount,
      countryCount,
    };
  }

  /**
   * Department-wise salary breakdown grouped by currency
   */
  static async getByDepartment() {
    // We use raw SQL because PostgreSQL has advanced statistical functions like percentile_cont (median)
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        d.name as "department",
        s.currency as "currency",
        COUNT(e.id)::int as "headcount",
        ROUND(AVG(s."baseSalary")::numeric, 2)::text as "avgSalary",
        ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY s."baseSalary")::numeric, 2)::text as "medianSalary",
        ROUND(MIN(s."baseSalary")::numeric, 2)::text as "minSalary",
        ROUND(MAX(s."baseSalary")::numeric, 2)::text as "maxSalary"
      FROM "Employee" e
      JOIN "Department" d ON e."departmentId" = d.id
      JOIN "Salary" s ON e.id = s."employeeId" AND s."endDate" IS NULL
      WHERE e.status != 'inactive'
      GROUP BY d.name, s.currency
      ORDER BY d.name, s.currency;
    `;

    return result;
  }

  /**
   * Country-wise salary breakdown
   */
  static async getByCountry() {
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        e.country as "country",
        s.currency as "currency",
        COUNT(e.id)::int as "headcount",
        ROUND(AVG(s."baseSalary")::numeric, 2)::text as "avgSalary",
        ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY s."baseSalary")::numeric, 2)::text as "medianSalary",
        ROUND(SUM(s."baseSalary")::numeric, 2)::text as "totalPayroll"
      FROM "Employee" e
      JOIN "Salary" s ON e.id = s."employeeId" AND s."endDate" IS NULL
      WHERE e.status != 'inactive'
      GROUP BY e.country, s.currency
      ORDER BY e.country;
    `;

    return result;
  }

  /**
   * Salary distribution histogram buckets for a given country
   */
  static async getSalaryDistribution(country: string) {
    const config = COUNTRIES[country];
    if (!config) {
      throw new Error(`Invalid country code: ${country}`);
    }

    // Fetch all active base salaries for this country
    const salaries = await prisma.$queryRaw<{ baseSalary: number }[]>`
      SELECT s."baseSalary"::float as "baseSalary"
      FROM "Employee" e
      JOIN "Salary" s ON e.id = s."employeeId" AND s."endDate" IS NULL
      WHERE e.country = ${country} AND e.status != 'inactive';
    `;

    const rawSalaries = salaries.map((s) => s.baseSalary);

    if (rawSalaries.length === 0) {
      return {
        currency: config.currency,
        buckets: [],
      };
    }

    // Generate dynamic buckets based on actual min and max salaries in the database
    const minSalary = Math.min(...rawSalaries);
    const maxSalary = Math.max(...rawSalaries);
    const bucketCount = 5;
    
    // Handle edge case where min and max are equal (e.g., only one employee or all have same salary)
    const step = maxSalary === minSalary 
      ? (minSalary === 0 ? 10000 : minSalary * 0.1) 
      : (maxSalary - minSalary) / bucketCount;

    const buckets: { range: string; count: number }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const start = minSalary + i * step;
      const end = start + step;
      
      // Format range label
      const formatNum = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
        return num.toString();
      };

      const rangeLabel = `${formatNum(start)}-${formatNum(end)}`;
      buckets.push({ range: rangeLabel, count: 0 });
    }

    // Count salaries in buckets
    rawSalaries.forEach((sal) => {
      for (let i = 0; i < bucketCount; i++) {
        const start = minSalary + i * step;
        const end = start + step;
        
        // Include upper bound in the last bucket
        const isLast = i === bucketCount - 1;
        if (sal >= start && (isLast ? sal <= end : sal < end)) {
          buckets[i].count++;
          break;
        }
      }
    });

    return {
      currency: config.currency,
      buckets,
    };
  }

  /**
   * Historical average salary trends over the last 5 years grouped by country
   */
  static async getSalaryTrends() {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i); // e.g., 2022, 2023, 2024, 2025, 2026

    const trends: Record<string, { country: string; currency: string; data: { year: number; avgSalary: string; headcount: number }[] }> = {};

    // For each year, we run a query to find the average salary of employees active on Dec 31st of that year
    for (const year of years) {
      const dateStr = `${year}-12-31T23:59:59.999Z`;
      
      const result = await prisma.$queryRaw<any[]>`
        SELECT 
          e.country as "country",
          s.currency as "currency",
          COUNT(e.id)::int as "headcount",
          ROUND(AVG(s."baseSalary")::numeric, 2)::text as "avgSalary"
        FROM "Employee" e
        JOIN "Salary" s ON e.id = s."employeeId"
        WHERE 
          e."hireDate" <= ${new Date(dateStr)}
          AND (e."endDate" IS NULL OR e."endDate" >= ${new Date(dateStr)})
          AND s."effectiveDate" <= ${new Date(dateStr)}
          AND (s."endDate" IS NULL OR s."endDate" >= ${new Date(dateStr)})
        GROUP BY e.country, s.currency;
      `;

      result.forEach((row) => {
        const key = `${row.country}_${row.currency}`;
        if (!trends[key]) {
          trends[key] = {
            country: row.country,
            currency: row.currency,
            data: [],
          };
        }
        trends[key].data.push({
          year,
          avgSalary: row.avgSalary,
          headcount: row.headcount,
        });
      });
    }

    return Object.values(trends);
  }
}
