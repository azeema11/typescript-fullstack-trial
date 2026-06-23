import { Router } from "express";
import {
  AnalyticsController,
  getSalaryDistributionQuerySchema,
} from "../controllers/analytics.controller";
import { validate } from "../middleware/validation";

const router = Router();

router.get("/summary", AnalyticsController.getSummary);
router.get("/by-department", AnalyticsController.getByDepartment);
router.get("/by-country", AnalyticsController.getByCountry);
router.get("/salary-distribution", validate(getSalaryDistributionQuerySchema), AnalyticsController.getSalaryDistribution);
router.get("/salary-trends", AnalyticsController.getSalaryTrends);

export default router;
