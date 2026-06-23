import { Request, Response, NextFunction } from "express";
import { EmployeeService } from "../services/employee.service";
import { serializeDecimal } from "../utils/serialization";
import { EmployeeStatus, SalaryRevisionType } from "@prisma/client";
import { z } from "zod";
import { COUNTRY_CODES } from "../constants/countries";

// Zod Validation Schemas
export const getEmployeesQuerySchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    search: z.string().optional(),
    departmentId: z.string().optional(),
    country: z.enum(COUNTRY_CODES).optional(),
    status: z.nativeEnum(EmployeeStatus).optional(),
    sortBy: z.enum(["name", "hireDate", "salary"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const createEmployeeBodySchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date of birth"),
    gender: z.string().min(1, "Gender is required"),
    hireDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid hire date"),
    departmentId: z.string().uuid("Invalid department ID"),
    designation: z.string().min(1, "Designation is required"),
    country: z.enum(COUNTRY_CODES),
    city: z.string().min(1, "City is required"),
    baseSalary: z.number().positive("Salary must be positive"),
    currency: z.string().min(3, "Currency must be 3 characters"),
  }),
});

export const updateEmployeeBodySchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    designation: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    status: z.nativeEnum(EmployeeStatus).optional(),
    statusNote: z.string().optional(),
  }),
});

export const adjustSalaryBodySchema = z.object({
  body: z.object({
    baseSalary: z.number().positive("Salary must be positive"),
    currency: z.string().min(3, "Currency must be 3 characters"),
    effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid effective date"),
    revisionType: z.nativeEnum(SalaryRevisionType),
    newCountry: z.enum(COUNTRY_CODES).optional(),
    newCity: z.string().optional(),
  }),
});

export const employeeIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid employee ID"),
  }),
});

export class EmployeeController {
  static async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EmployeeService.getEmployees(req.query as any);
      res.status(200).json({
        status: "success",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEmployeeById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = (req.params as any).id;
      const employee = await EmployeeService.getEmployeeById(id);
      res.status(200).json({
        status: "success",
        data: serializeDecimal(employee),
      });
    } catch (error) {
      next(error);
    }
  }

  static async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      res.status(201).json({
        status: "success",
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const id = (req.params as any).id;
      const employee = await EmployeeService.updateEmployee(id, req.body);
      res.status(200).json({
        status: "success",
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const id = (req.params as any).id;
      const reason = req.body.reason || "Employment Resigned";
      await EmployeeService.deleteEmployee(id, reason);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async adjustSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const id = (req.params as any).id;
      const salary = await EmployeeService.adjustSalary(id, req.body);
      res.status(201).json({
        status: "success",
        data: serializeDecimal(salary),
      });
    } catch (error) {
      next(error);
    }
  }
}
