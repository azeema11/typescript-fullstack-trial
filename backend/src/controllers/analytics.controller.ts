import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service";
import { z } from "zod";
import { COUNTRY_CODES } from "../constants/countries";

export const getSalaryDistributionQuerySchema = z.object({
  query: z.object({
    country: z.enum(COUNTRY_CODES, {
      errorMap: () => ({ message: "Invalid country code" }),
    }),
  }),
});

export class AnalyticsController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await AnalyticsService.getSummary();
      res.status(200).json({
        status: "success",
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.getByDepartment();
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.getByCountry();
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSalaryDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const country = req.query.country as string;
      const result = await AnalyticsService.getSalaryDistribution(country);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSalaryTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.getSalaryTrends();
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
