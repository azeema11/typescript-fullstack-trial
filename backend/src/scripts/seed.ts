/// <reference types="node" />
import { PrismaClient, EmployeeStatus, SalaryRevisionType } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { COUNTRIES } from "../constants/countries";

const prisma = new PrismaClient();

const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "Finance",
  "HR",
  "Operations",
  "Legal",
  "Support",
  "Product",
  "Design",
  "Data",
  "Security",
  "QA",
  "DevOps",
  "Executive",
];

const GENDERS = ["male", "female", "non-binary"];

const LEAVE_NOTES = [
  "Maternity leave",
  "Paternity leave",
  "Medical leave (extended)",
  "Sabbatical",
  "Personal leave",
  "Educational leave",
];

const TERMINATION_NOTES = [
  "Resigned for personal reasons",
  "Resigned to join another company",
  "Contract ended",
  "Laid off due to restructuring",
  "Retired",
];

async function main() {
  console.log("Starting database seeding...");

  // 1. Clean existing data
  console.log("Cleaning database...");
  await prisma.salary.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  // 2. Seed Departments
  console.log("Seeding departments...");
  const departments = await Promise.all(
    DEPARTMENTS.map((name) =>
      prisma.department.create({
        data: { name },
      })
    )
  );
  const departmentIds = departments.map((d) => d.id);

  // 3. Seed 10,000 Employees
  console.log("Generating 10,000 employees and salary histories...");
  const totalEmployees = 10000;
  const batchSize = 500;
  const countriesKeys = Object.keys(COUNTRIES);

  for (let i = 0; i < totalEmployees; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, totalEmployees - i);
    console.log(`Processing batch ${i / batchSize + 1} (${i} to ${i + currentBatchSize})...`);

    const employeePromises = Array.from({ length: currentBatchSize }).map(async (_, index) => {
      const globalIndex = i + index;
      
      // Determine country and its config
      const country = countriesKeys[globalIndex % countriesKeys.length];
      const countryConfig = COUNTRIES[country];
      const currency = countryConfig.currency;

      // Determine status
      let status: EmployeeStatus = EmployeeStatus.active;
      let statusNote: string | null = null;
      const statusRand = Math.random();
      if (statusRand < 0.08) {
        status = EmployeeStatus.inactive;
        statusNote = faker.helpers.arrayElement(TERMINATION_NOTES);
      } else if (statusRand < 0.10) {
        status = EmployeeStatus.on_leave;
        statusNote = faker.helpers.arrayElement(LEAVE_NOTES);
      }

      // Dates
      const hireDate = faker.date.between({
        from: "2016-01-01T00:00:00.000Z",
        to: "2026-05-01T00:00:00.000Z",
      });
      
      let endDate: Date | null = null;
      if (status === EmployeeStatus.inactive) {
        endDate = faker.date.between({
          from: hireDate,
          to: new Date(),
        });
      }

      // Employee code
      const hireYearMonth = hireDate.toISOString().slice(0, 7).replace("-", "");
      const employeeCode = `EMP-${hireYearMonth}-${String(globalIndex + 1000).padStart(5, "0")}`;

      // Personal Info
      const gender = faker.helpers.arrayElement(GENDERS);
      const firstName = faker.person.firstName(gender as any);
      const lastName = faker.person.lastName(gender as any);
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();

      // Create Employee
      const employee = await prisma.employee.create({
        data: {
          employeeCode,
          firstName,
          lastName,
          email: `${globalIndex}_${email}`, // Ensure unique email across 10k
          dateOfBirth: faker.date.birthdate({ min: 20, max: 60, mode: "age" }),
          gender,
          hireDate,
          endDate,
          departmentId: faker.helpers.arrayElement(departmentIds),
          designation: faker.person.jobTitle(),
          country,
          city: faker.location.city(),
          status,
          statusNote,
        },
      });

      // Generate Salary History
      // Calculate how many salary reviews they've had based on tenure (approx 1 per year)
      const tenureInYears = (endDate ? endDate.getTime() : Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      const reviewCount = Math.min(4, Math.max(1, Math.floor(tenureInYears) + 1));

      let currentSalary = faker.number.int({
        min: countryConfig.minSalary,
        max: countryConfig.minSalary + (countryConfig.maxSalary - countryConfig.minSalary) * 0.4, // start on lower half
      });

      let currentEffectiveDate = new Date(hireDate);

      for (let r = 0; r < reviewCount; r++) {
        const isLast = r === reviewCount - 1;
        
        let salaryEndDate: Date | null = null;
        if (!isLast) {
          // Next review date is approx 1 year later
          const nextReviewDate = new Date(currentEffectiveDate);
          nextReviewDate.setMonth(nextReviewDate.getMonth() + faker.number.int({ min: 10, max: 15 }));
          salaryEndDate = new Date(nextReviewDate);
          salaryEndDate.setDate(salaryEndDate.getDate() - 1);
        } else if (status === EmployeeStatus.inactive) {
          salaryEndDate = endDate;
        }

        const revisionType = r === 0 
          ? SalaryRevisionType.initial 
          : faker.helpers.arrayElement([SalaryRevisionType.promotion, SalaryRevisionType.annual_review, SalaryRevisionType.adjustment]);

        await prisma.salary.create({
          data: {
            employeeId: employee.id,
            baseSalary: currentSalary,
            currency,
            effectiveDate: currentEffectiveDate,
            endDate: salaryEndDate,
            revisionType,
          },
        });

        if (!isLast) {
          // Increase salary for next review (5% to 15% raise)
          currentSalary = Math.round(currentSalary * (1 + faker.number.float({ min: 0.05, max: 0.15 })));
          const nextEffectiveDate = new Date(currentEffectiveDate);
          nextEffectiveDate.setMonth(nextEffectiveDate.getMonth() + faker.number.int({ min: 10, max: 15 }));
          currentEffectiveDate = nextEffectiveDate;
        }
      }
    });

    await Promise.all(employeePromises);
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
