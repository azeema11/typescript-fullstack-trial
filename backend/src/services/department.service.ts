import { prisma } from "../utils/prisma";

export class DepartmentService {
  /**
   * Get all departments
   */
  static async getDepartments() {
    return await prisma.department.findMany({
      orderBy: { name: "asc" },
    });
  }
}
