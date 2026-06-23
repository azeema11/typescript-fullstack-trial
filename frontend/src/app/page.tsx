"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Users,
  UserCheck,
  UserMinus,
  Building2,
  Globe2,
  ArrowRight,
  PlusCircle,
  BarChart3,
  TrendingUp,
  Briefcase,
} from "lucide-react";

export default function DashboardPage() {
  // Fetch analytics summary
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: api.getAnalyticsSummary,
  });

  // Fetch recent hires (5 employees sorted by hireDate desc)
  const {
    data: recentHiresResponse,
    isLoading: isRecentHiresLoading,
  } = useQuery({
    queryKey: ["recentHires"],
    queryFn: () => api.getEmployees({ limit: 5, sortBy: "hireDate", sortOrder: "desc" }),
  });

  const recentHires = recentHiresResponse?.data || [];

  const kpis = [
    {
      name: "Total Headcount",
      value: summary?.headcount ?? 0,
      description: "Active & On Leave employees",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      name: "Active Employees",
      value: summary?.activeCount ?? 0,
      description: "Currently working",
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      name: "On Leave",
      value: summary?.onLeaveCount ?? 0,
      description: "Temporarily away",
      icon: UserMinus,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      name: "Inactive (Terminated)",
      value: summary?.inactiveCount ?? 0,
      description: "Former employees",
      icon: UserMinus,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      name: "Departments",
      value: summary?.departmentCount ?? 0,
      description: "Functional areas",
      icon: Building2,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      name: "Countries",
      value: summary?.countryCount ?? 0,
      description: "Global presence",
      icon: Globe2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  if (isSummaryError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <UserMinus className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Failed to load dashboard</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          We couldn&apos;t connect to the backend API. Please make sure the backend server is running and database is seeded.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time summary of ACME&apos;s global workforce and compensation metrics.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.name}</p>
                  {isSummaryLoading ? (
                    <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-100" />
                  ) : (
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                      {kpi.value.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className={`rounded-xl p-3 ${kpi.bg} ${kpi.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-400">{kpi.description}</p>
            </div>
          );
        })}
      </div>

      {/* Main Sections */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Hires */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Hires</h3>
              <p className="text-xs text-slate-500">The latest employees joined the organization.</p>
            </div>
            <Link
              href="/employees"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {isRecentHiresLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                </div>
              ))
            ) : recentHires.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-slate-500">No recent hires found</p>
              </div>
            ) : (
              recentHires.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
                      {employee.firstName[0]}
                      {employee.lastName[0]}
                    </div>
                    <div>
                      <Link
                        href={`/employees/${employee.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
                      >
                        {employee.firstName} {employee.lastName}
                      </Link>
                      <p className="text-xs font-medium text-slate-400">
                        {employee.designation} • {employee.department.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {employee.activeSalary
                        ? `${parseFloat(employee.activeSalary.baseSalary).toLocaleString()} ${
                            employee.activeSalary.currency
                          }`
                        : "No Active Salary"}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      Joined {new Date(employee.hireDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="border-b border-slate-100 pb-4 text-lg font-bold text-slate-900">
              Quick Actions
            </h3>
            <div className="mt-4 space-y-3">
              <Link
                href="/employees?action=add"
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <PlusCircle className="h-5 w-5 text-indigo-600" />
                Add New Employee
              </Link>
              <Link
                href="/analytics"
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                View Salary Analytics
              </Link>
              <Link
                href="/employees"
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Manage Compensation
              </Link>
            </div>
          </div>

          {/* Quick Insights Card */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h4 className="mt-4 text-lg font-bold">Compensation Insights</h4>
            <p className="mt-2 text-xs font-medium text-indigo-100 leading-relaxed">
              Compensation distributions and salary trends are updated in real-time based on historical revisions. Use the Analytics tab to explore trends, medians, and salary histograms by country.
            </p>
            <Link
              href="/analytics"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline"
            >
              Explore Analytics Charts
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
