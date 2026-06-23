import { Router } from "express";
import {
  EmployeeController,
  getEmployeesQuerySchema,
  createEmployeeBodySchema,
  updateEmployeeBodySchema,
  adjustSalaryBodySchema,
  employeeIdParamSchema,
} from "../controllers/employee.controller";
import { validate } from "../middleware/validation";

const router = Router();

router.get("/", validate(getEmployeesQuerySchema), EmployeeController.getEmployees);
router.get("/:id", validate(employeeIdParamSchema), EmployeeController.getEmployeeById);
router.post("/", validate(createEmployeeBodySchema), EmployeeController.createEmployee);
router.put("/:id", validate(employeeIdParamSchema), validate(updateEmployeeBodySchema), EmployeeController.updateEmployee);
router.delete("/:id", validate(employeeIdParamSchema), EmployeeController.deleteEmployee);
router.post("/:id/salary", validate(employeeIdParamSchema), validate(adjustSalaryBodySchema), EmployeeController.adjustSalary);

export default router;
