import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalyticsService } from "../src/services/analytics.service";
import { prisma } from "../src/utils/prisma";
import { EmployeeStatus } from "@prisma/client";

// Mock the Prisma Client
vi.mock("../src/utils/prisma", () => {
  const mockPrisma = {
    employee: {
      groupBy: vi.fn(),
      count: vi.fn(),
    },
    department: {
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  };
  return { prisma: mockPrisma };
});

describe("AnalyticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSummary", () => {
    it("should return global counts summary", async () => {
      vi.mocked(prisma.employee.groupBy).mockResolvedValue([
        { status: EmployeeStatus.active, _count: { id: 9000 } },
        { status: EmployeeStatus.inactive, _count: { id: 800 } },
        { status: EmployeeStatus.on_leave, _count: { id: 200 } },
      ] as any);

      vi.mocked(prisma.department.count).mockResolvedValue(15);

      // Mock unique countries groupBy
      (vi.mocked(prisma.employee.groupBy) as any).mockImplementation(async (args: any) => {
        if (args.by.includes("status")) {
          return [
            { status: EmployeeStatus.active, _count: { id: 9000 } },
            { status: EmployeeStatus.inactive, _count: { id: 800 } },
            { status: EmployeeStatus.on_leave, _count: { id: 200 } },
          ] as any;
        }
        if (args.by.includes("country")) {
          return [{ country: "US" }, { country: "IN" }, { country: "UK" }] as any;
        }
        return [];
      });

      const result = await AnalyticsService.getSummary();

      expect(result).toEqual({
        headcount: 9200, // active + on_leave
        activeCount: 9000,
        onLeaveCount: 200,
        inactiveCount: 800,
        departmentCount: 15,
        countryCount: 3,
      });
    });
  });

  describe("getByDepartment", () => {
    it("should run raw SQL and return department salary stats", async () => {
      const mockResult = [
        {
          department: "Engineering",
          currency: "USD",
          headcount: 10,
          avgSalary: "120000.00",
          medianSalary: "115000.00",
          minSalary: "90000.00",
          maxSalary: "160000.00",
        },
      ];

      vi.mocked(prisma.$queryRaw).mockResolvedValue(mockResult);

      const result = await AnalyticsService.getByDepartment();

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe("getByCountry", () => {
    it("should run raw SQL and return country salary stats", async () => {
      const mockResult = [
        {
          country: "US",
          currency: "USD",
          headcount: 100,
          avgSalary: "110000.00",
          medianSalary: "105000.00",
          totalPayroll: "11000000.00",
        },
      ];

      vi.mocked(prisma.$queryRaw).mockResolvedValue(mockResult);

      const result = await AnalyticsService.getByCountry();

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe("getSalaryDistribution", () => {
    it("should bucket active salaries correctly for a country", async () => {
      // Mock raw salaries for US (min: 45k, max: 250k)
      // step = (250k - 45k) / 5 = 41k
      // Buckets: 45k-86k, 86k-127k, 127k-168k, 168k-209k, 209k-250k
      const mockSalaries = [
        { baseSalary: 50000 },  // Bucket 1
        { baseSalary: 100000 }, // Bucket 2
        { baseSalary: 105000 }, // Bucket 2
        { baseSalary: 150000 }, // Bucket 3
        { baseSalary: 220000 }, // Bucket 5
      ];

      vi.mocked(prisma.$queryRaw).mockResolvedValue(mockSalaries);

      const result = await AnalyticsService.getSalaryDistribution("US");

      expect(result.currency).toBe("USD");
      expect(result.buckets).toHaveLength(5);
      expect(result.buckets[0].count).toBe(1); // 50k
      expect(result.buckets[1].count).toBe(2); // 100k, 105k
      expect(result.buckets[2].count).toBe(1); // 150k
      expect(result.buckets[3].count).toBe(0);
      expect(result.buckets[4].count).toBe(1); // 220k
    });
  });
});
