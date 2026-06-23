import { prisma } from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";
import { EmployeeStatus, SalaryRevisionType, Prisma } from "@prisma/client";

export class EmployeeService {
  /**
   * Get paginated employees with search, filter, and sort
   */
  static async getEmployees(params: {
    cursor?: string;
    limit?: number;
    search?: string;
    departmentId?: string;
    country?: string;
    status?: EmployeeStatus;
    sortBy?: "name" | "hireDate" | "salary";
    sortOrder?: "asc" | "desc";
  }) {
    const {
      cursor,
      limit = 25,
      search,
      departmentId,
      country,
      status,
      sortBy = "name",
      sortOrder = "asc",
    } = params;

    // Build WHERE clause
    const where: Prisma.EmployeeWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (country) {
      where.country = country;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeCode: { contains: search, mode: "insensitive" } },
      ];
    }

    // Pagination query options
    const queryOptions: Prisma.EmployeeFindManyArgs = {
      where,
      take: limit + 1, // Fetch one extra to get the next cursor
      include: {
        department: { select: { name: true } },
        salaries: {
          where: { endDate: null }, // Fetch only active salary
          select: { baseSalary: true, currency: true },
          take: 1,
        },
      },
    };

    if (cursor) {
      queryOptions.cursor = { employeeCode: cursor };
      queryOptions.skip = 1; // Skip the cursor itself
    }

    // Sorting
    if (sortBy === "name") {
      queryOptions.orderBy = [
        { firstName: sortOrder },
        { lastName: sortOrder },
        { employeeCode: sortOrder }, // Ensure deterministic ordering for cursor pagination
      ];
    } else if (sortBy === "hireDate") {
      queryOptions.orderBy = [
        { hireDate: sortOrder },
        { employeeCode: sortOrder },
      ];
    } else if (sortBy === "salary") {
      // Sorting by salary fallback to hireDate + employeeCode in DB
      queryOptions.orderBy = [
        { hireDate: sortOrder },
        { employeeCode: sortOrder },
      ];
    }

    const employees = await prisma.employee.findMany(queryOptions);

    let nextCursor: string | undefined = undefined;
    if (employees.length > limit) {
      const nextItem = employees.pop();
      nextCursor = nextItem?.employeeCode;
    }

    // Format the response to flatten the active salary
    const formattedEmployees = (employees as any[]).map((emp) => {
      const activeSalary = emp.salaries[0] || null;
      const { salaries, ...rest } = emp;
      return {
        ...rest,
        activeSalary: activeSalary
          ? {
              baseSalary: activeSalary.baseSalary.toString(),
              currency: activeSalary.currency,
            }
          : null,
      };
    });

    return {
      data: formattedEmployees,
      nextCursor,
    };
  }

  /**
   * Get single employee with full salary history
   */
  static async getEmployeeById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        salaries: {
          orderBy: { effectiveDate: "desc" },
        },
      },
    });

    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    return employee;
  }

  /**
   * Create employee and initial salary record in a transaction
   */
  static async createEmployee(data: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    hireDate: string;
    departmentId: string;
    designation: string;
    country: string;
    city: string;
    baseSalary: number;
    currency: string;
  }) {
    // Generate a unique employee code: EMP-YYYYMM-RANDOM
    const yearMonth = new Date(data.hireDate).toISOString().slice(0, 7).replace("-", "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const employeeCode = `EMP-${yearMonth}-${randomSuffix}`;

    return await prisma.$transaction(async (tx) => {
      // Check if email already exists
      const existing = await tx.employee.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new AppError("Email already exists", 400);
      }

      // Create employee
      const employee = await tx.employee.create({
        data: {
          employeeCode,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          hireDate: new Date(data.hireDate),
          departmentId: data.departmentId,
          designation: data.designation,
          country: data.country,
          city: data.city,
          status: EmployeeStatus.active,
        },
      });

      // Create initial salary record
      await tx.salary.create({
        data: {
          employeeId: employee.id,
          baseSalary: new Prisma.Decimal(data.baseSalary),
          currency: data.currency,
          effectiveDate: new Date(data.hireDate),
          revisionType: SalaryRevisionType.initial,
        },
      });

      return employee;
    });
  }

  /**
   * Update employee profile details (excluding salary)
   */
  static async updateEmployee(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      designation?: string;
      city?: string;
      status?: EmployeeStatus;
      statusNote?: string;
    }
  ) {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    // If status is changing to inactive, we should use the soft-delete endpoint or handle it here
    if (data.status === EmployeeStatus.inactive && employee.status !== EmployeeStatus.inactive) {
      return await this.deleteEmployee(id, data.statusNote || "Status changed to inactive");
    }

    return await prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        designation: data.designation,
        city: data.city,
        status: data.status,
        statusNote: data.statusNote,
        // If status is changing back to active from on_leave or inactive, make sure endDate is null
        endDate: data.status === EmployeeStatus.active ? null : undefined,
      },
    });
  }

  /**
   * Soft delete employee: set status=inactive, set endDate, close active salary
   */
  static async deleteEmployee(id: string, reason: string = "Employment terminated") {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    const today = new Date();

    return await prisma.$transaction(async (tx) => {
      // Update employee status and end date
      const updatedEmployee = await tx.employee.update({
        where: { id },
        data: {
          status: EmployeeStatus.inactive,
          endDate: today,
          statusNote: reason,
        },
      });

      // Close the active salary record
      await tx.salary.updateMany({
        where: {
          employeeId: id,
          endDate: null,
        },
        data: {
          endDate: today,
        },
      });

      return updatedEmployee;
    });
  }

  /**
   * Adjust salary: close active salary, insert new salary, handle optional relocation
   */
  static async adjustSalary(
    employeeId: string,
    data: {
      baseSalary: number;
      currency: string;
      effectiveDate: string;
      revisionType: SalaryRevisionType;
      newCountry?: string;
      newCity?: string;
    }
  ) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }

    const effectiveDate = new Date(data.effectiveDate);
    const dayBeforeEffective = new Date(effectiveDate);
    dayBeforeEffective.setDate(dayBeforeEffective.getDate() - 1);

    return await prisma.$transaction(async (tx) => {
      // 1. Close current active salary record
      await tx.salary.updateMany({
        where: {
          employeeId,
          endDate: null,
        },
        data: {
          endDate: dayBeforeEffective,
        },
      });

      // 2. Create new salary record
      const newSalary = await tx.salary.create({
        data: {
          employeeId,
          baseSalary: new Prisma.Decimal(data.baseSalary),
          currency: data.currency,
          effectiveDate,
          revisionType: data.revisionType,
        },
      });

      // 3. Handle relocation if country/city is updated
      if (data.newCountry || data.newCity) {
        await tx.employee.update({
          where: { id: employeeId },
          data: {
            country: data.newCountry || undefined,
            city: data.newCity || undefined,
          },
        });
      }

      return newSalary;
    });
  }
}
