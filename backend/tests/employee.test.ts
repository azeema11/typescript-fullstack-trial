import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmployeeService } from "../src/services/employee.service";
import { prisma } from "../src/utils/prisma";
import { EmployeeStatus, SalaryRevisionType, Prisma } from "@prisma/client";
import { AppError } from "../src/middleware/errorHandler";

// Mock the Prisma Client
vi.mock("../src/utils/prisma", () => {
  const mockPrisma: any = {
    employee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      groupBy: vi.fn(),
    },
    salary: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((cb: any) => cb(mockPrisma)),
  };
  return { prisma: mockPrisma };
});

describe("EmployeeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEmployees", () => {
    it("should fetch paginated employees with active salaries", async () => {
      const mockEmployees = [
        {
          id: "emp-uuid-1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@acme.com",
          employeeCode: "EMP-001",
          status: EmployeeStatus.active,
          department: { name: "Engineering" },
          salaries: [{ baseSalary: new Prisma.Decimal(100000), currency: "USD" }],
        },
      ];

      vi.mocked(prisma.employee.findMany).mockResolvedValue(mockEmployees as any);

      const result = await EmployeeService.getEmployees({ limit: 10 });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 11,
          where: {},
        })
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].activeSalary).toEqual({
        baseSalary: mockEmployees[0].salaries[0].baseSalary,
        currency: "USD",
      });
      expect(result.nextCursor).toBeUndefined();
    });

    it("should apply status and country filters", async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);

      await EmployeeService.getEmployees({
        status: EmployeeStatus.active,
        country: "US",
      });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: EmployeeStatus.active,
            country: "US",
          },
        })
      );
    });
  });

  describe("getEmployeeById", () => {
    it("should return employee with full salary history", async () => {
      const mockEmployee = {
        id: "emp-uuid-1",
        firstName: "John",
        lastName: "Doe",
        department: { id: "dept-uuid-1", name: "Engineering" },
        salaries: [
          { id: "sal-uuid-2", baseSalary: new Prisma.Decimal(110000), currency: "USD", revisionType: SalaryRevisionType.promotion, endDate: null },
          { id: "sal-uuid-1", baseSalary: new Prisma.Decimal(100000), currency: "USD", revisionType: SalaryRevisionType.initial, endDate: new Date() },
        ],
      };

      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);

      const result = await EmployeeService.getEmployeeById("emp-uuid-1");

      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: "emp-uuid-1" },
        include: {
          department: { select: { id: true, name: true } },
          salaries: { orderBy: { effectiveDate: "desc" } },
        },
      });
      expect(result).toEqual({
        ...mockEmployee,
        activeSalary: {
          baseSalary: mockEmployee.salaries[0].baseSalary,
          currency: mockEmployee.salaries[0].currency,
        },
      });
    });

    it("should throw 404 AppError if employee not found", async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);

      await expect(EmployeeService.getEmployeeById("non-existent-uuid")).rejects.toThrow(
        new AppError("Employee not found", 404)
      );
    });
  });

  describe("createEmployee", () => {
    it("should create employee and initial salary record in a transaction", async () => {
      const mockEmployeeData = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@acme.com",
        dateOfBirth: "1995-04-12",
        gender: "female",
        hireDate: "2026-06-22",
        departmentId: "dept-uuid-1",
        designation: "Software Engineer",
        country: "US",
        city: "New York",
        baseSalary: 95000,
        currency: "USD",
      };

      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.employee.create).mockResolvedValue({ id: "emp-uuid-2", ...mockEmployeeData } as any);

      const result = await EmployeeService.createEmployee(mockEmployeeData);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.employee.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            firstName: "Jane",
            email: "jane.smith@acme.com",
          }),
        })
      );
      expect(prisma.salary.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            employeeId: "emp-uuid-2",
            baseSalary: new Prisma.Decimal(95000),
            currency: "USD",
            revisionType: SalaryRevisionType.initial,
          }),
        })
      );
      expect(result.id).toBe("emp-uuid-2");
    });
  });

  describe("deleteEmployee", () => {
    it("should soft delete employee and close active salary record", async () => {
      const mockEmployee = { id: "emp-uuid-1", status: EmployeeStatus.active };
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);
      vi.mocked(prisma.employee.update).mockResolvedValue({ ...mockEmployee, status: EmployeeStatus.inactive } as any);

      await EmployeeService.deleteEmployee("emp-uuid-1", "Resigned");

      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: "emp-uuid-1" },
        data: expect.objectContaining({
          status: EmployeeStatus.inactive,
          statusNote: "Resigned",
          endDate: expect.any(Date),
        }),
      });

      expect(prisma.salary.updateMany).toHaveBeenCalledWith({
        where: {
          employeeId: "emp-uuid-1",
          endDate: null,
        },
        data: {
          endDate: expect.any(Date),
        },
      });
    });
  });

  describe("adjustSalary", () => {
    it("should close active salary and create a new salary record", async () => {
      const mockEmployee = { id: "emp-uuid-1", country: "US", city: "New York" };
      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);

      await EmployeeService.adjustSalary("emp-uuid-1", {
        baseSalary: 120000,
        currency: "USD",
        effectiveDate: "2026-07-01",
        revisionType: SalaryRevisionType.promotion,
        newCity: "San Francisco",
      });

      expect(prisma.salary.updateMany).toHaveBeenCalledWith({
        where: {
          employeeId: "emp-uuid-1",
          endDate: null,
        },
        data: {
          endDate: expect.any(Date),
        },
      });

      expect(prisma.salary.create).toHaveBeenCalledWith({
        data: {
          employeeId: "emp-uuid-1",
          baseSalary: new Prisma.Decimal(120000),
          currency: "USD",
          effectiveDate: new Date("2026-07-01"),
          revisionType: SalaryRevisionType.promotion,
        },
      });

      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: "emp-uuid-1" },
        data: {
          country: undefined,
          city: "San Francisco",
        },
      });
    });
  });
});
