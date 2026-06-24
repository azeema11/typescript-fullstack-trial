"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { convertCurrency } from "@/lib/constants";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart3,
  Globe2,
  Building2,
  DollarSign,
  Loader2,
} from "lucide-react";

// Static country configuration matching backend
const COUNTRIES_CONFIG: Record<string, { name: string; currency: string }> = {
  US: { name: "United States", currency: "USD" },
  UK: { name: "United Kingdom", currency: "GBP" },
  IN: { name: "India", currency: "INR" },
  DE: { name: "Germany", currency: "EUR" },
  CA: { name: "Canada", currency: "CAD" },
  AU: { name: "Australia", currency: "AUD" },
  JP: { name: "Japan", currency: "JPY" },
  BR: { name: "Brazil", currency: "BRL" },
  SG: { name: "Singapore", currency: "SGD" },
  AE: { name: "United Arab Emirates", currency: "AED" },
};

const COLORS = [
  "#4f46e5", // indigo-600
  "#0ea5e9", // sky-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#8b5cf6", // purple-500
  "#f43f5e", // rose-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
  "#64748b", // slate-500
];

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedCountry, setSelectedCountry] = useState("US");

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Queries
  const { data: departmentData, isLoading: isDeptLoading } = useQuery({
    queryKey: ["analyticsByDepartment"],
    queryFn: api.getAnalyticsByDepartment,
  });

  const { data: countryData, isLoading: isCountryLoading } = useQuery({
    queryKey: ["analyticsByCountry"],
    queryFn: api.getAnalyticsByCountry,
  });

  const { data: distributionData, isLoading: isDistLoading } = useQuery({
    queryKey: ["analyticsDistribution", selectedCountry],
    queryFn: () => api.getAnalyticsSalaryDistribution(selectedCountry),
  });

  const { data: trendData, isLoading: isTrendLoading } = useQuery({
    queryKey: ["analyticsTrends"],
    queryFn: api.getAnalyticsSalaryTrends,
  });

  if (!isMounted) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Convert and aggregate department data to the selected currency
  const filteredDeptData = (() => {
    if (!departmentData) return [];
    
    // Group by department
    const deptGroups: Record<string, { totalSalary: number; totalHeadcount: number; medianSalaries: number[] }> = {};
    
    departmentData.forEach((item) => {
      const dept = item.department;
      const headcount = item.headcount;
      const avgSalary = parseFloat(item.avgSalary);
      const medianSalary = parseFloat(item.medianSalary);
      
      // Convert to selected currency
      const avgInSelected = convertCurrency(avgSalary, item.currency, selectedCurrency);
      const medianInSelected = convertCurrency(medianSalary, item.currency, selectedCurrency);
      
      if (!deptGroups[dept]) {
        deptGroups[dept] = { totalSalary: 0, totalHeadcount: 0, medianSalaries: [] };
      }
      
      deptGroups[dept].totalSalary += avgInSelected * headcount;
      deptGroups[dept].totalHeadcount += headcount;
      deptGroups[dept].medianSalaries.push(medianInSelected);
    });
    
    return Object.entries(deptGroups).map(([dept, data]) => {
      const avg = data.totalHeadcount > 0 ? data.totalSalary / data.totalHeadcount : 0;
      const median = data.medianSalaries.length > 0 
        ? data.medianSalaries.reduce((sum, val) => sum + val, 0) / data.medianSalaries.length 
        : 0;
        
      return {
        department: dept,
        "Average Salary": Math.round(avg),
        "Median Salary": Math.round(median),
      };
    });
  })();

  // Format country data for Pie Chart
  const pieChartData =
    countryData?.map((item) => ({
      name: COUNTRIES_CONFIG[item.country]?.name || item.country,
      value: item.headcount,
    })) || [];

  // Format distribution data for Histogram
  const histogramData =
    distributionData?.buckets.map((b) => ({
      range: b.range,
      Employees: b.count,
    })) || [];

  // Format trend data for selected country (converting and aggregating multiple currencies to local currency)
  const lineChartData = (() => {
    if (!trendData) return [];
    
    const targetCurrency = COUNTRIES_CONFIG[selectedCountry]?.currency || "USD";
    
    // Find all trend series for the selected country
    const countryTrends = trendData.filter((t) => t.country === selectedCountry);
    
    // Group by year
    const yearGroups: Record<number, { totalSalary: number; totalHeadcount: number }> = {};
    
    countryTrends.forEach((trend) => {
      trend.data.forEach((d) => {
        const year = d.year;
        const avgSalary = parseFloat(d.avgSalary);
        const headcount = d.headcount || 0;
        
        // Convert average salary to target local currency
        const convertedAvg = convertCurrency(avgSalary, trend.currency, targetCurrency);
        
        if (!yearGroups[year]) {
          yearGroups[year] = { totalSalary: 0, totalHeadcount: 0 };
        }
        
        yearGroups[year].totalSalary += convertedAvg * headcount;
        yearGroups[year].totalHeadcount += headcount;
      });
    });
    
    // Map to array sorted by year
    return Object.entries(yearGroups)
      .map(([year, data]) => {
        const avg = data.totalHeadcount > 0 ? data.totalSalary / data.totalHeadcount : 0;
        return {
          year: year.toString(),
          "Average Salary": Math.round(avg),
        };
      })
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  })();

  const currencies = ["USD", "GBP", "EUR", "INR", "CAD", "AUD", "JPY", "BRL", "SGD", "AED"];

  const countries = Object.keys(COUNTRIES_CONFIG);

  const isLoading = isDeptLoading || isCountryLoading || isDistLoading || isTrendLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Compensation Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Interactive insights into department pay scales, country distributions, and salary trends.
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            Loading data...
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Department Comparison (Bar Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Department Compensation</h3>
                <p className="text-xs text-slate-500">Average and median salaries by department</p>
              </div>
            </div>
            {/* Currency Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Currency:</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 h-80 w-full">
            {filteredDeptData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                No data available for {selectedCurrency}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredDeptData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="department"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any) => [`${Number(val).toLocaleString()} ${selectedCurrency}`, ""]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                  <Bar dataKey="Average Salary" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Median Salary" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Country Headcount Distribution (Pie Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Global Distribution</h3>
              <p className="text-xs text-slate-500">Employee headcount distribution by country</p>
            </div>
          </div>

          <div className="mt-6 flex h-80 flex-col sm:flex-row items-center justify-center gap-4">
            <div className="h-64 w-64">
              {pieChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(val: any) => [`${val} Employees`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Custom Legend */}
            <div className="flex-1 max-h-64 overflow-y-auto pr-2 space-y-2 text-xs">
              {pieChartData.map((item, index) => {
                const total = pieChartData.reduce((acc, curr) => acc + curr.value, 0);
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                return (
                  <div key={item.name} className="flex items-center justify-between gap-4 py-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <div className="text-right text-slate-500">
                      <span className="font-bold text-slate-800">{item.value}</span> ({percentage}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Salary Range Histogram (Bar Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Salary Distribution</h3>
                <p className="text-xs text-slate-500">
                  Headcount distribution by salary range in local currency
                </p>
              </div>
            </div>
            {/* Country Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Country:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {countries.map((code) => (
                  <option key={code} value={code}>
                    {COUNTRIES_CONFIG[code].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 h-80 w-full">
            {histogramData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                No distribution data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="range"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any) => [`${val} Employees`, ""]}
                  />
                  <Bar dataKey="Employees" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Historical Salary Trends (Line Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Compensation Trends</h3>
                <p className="text-xs text-slate-500">
                  5-year historical average salary trend in local currency
                </p>
              </div>
            </div>
            {/* Country Selector (reused for line chart currency alignment) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Country:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {countries.map((code) => (
                  <option key={code} value={code}>
                    {COUNTRIES_CONFIG[code].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 h-80 w-full">
            {lineChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                No trend data available for {COUNTRIES_CONFIG[selectedCountry].name}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="year"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any) => [
                      `${Number(val).toLocaleString()} ${COUNTRIES_CONFIG[selectedCountry].currency}`,
                      "",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="Average Salary"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
