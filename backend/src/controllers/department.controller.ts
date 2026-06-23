import { Request, Response, NextFunction } from "express";
import { DepartmentService } from "../services/department.service";

export class DepartmentController {
  static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await DepartmentService.getDepartments();
      res.status(200).json({
        status: "success",
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }
}
