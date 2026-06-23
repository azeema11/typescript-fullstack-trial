import React from "react";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Compensation Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Visualizations and aggregations of salary distributions, department comparisons, and payroll trends.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">No charts available</h3>
        <p className="mt-1 text-sm text-slate-500">
          The analytics charts are being prepared. It will be fully implemented in Phase 7.
        </p>
      </div>
    </div>
  );
}
