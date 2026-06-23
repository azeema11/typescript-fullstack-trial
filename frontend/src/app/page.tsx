import React from "react";
import Link from "next/link";
import { ArrowRight, Users, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl py-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          ACME Salary Management Portal
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
          A high-performance, secure system for managing employee profiles, tracking historical compensation revisions, and analyzing organizational payroll distributions.
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        {/* Employees Directory Card */}
        <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">Employee Directory</h3>
            <p className="mt-2 text-slate-500">
              View, filter, search, and manage 10,000+ employee records. Record promotions, salary adjustments, leaves of absence, and terminations.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/employees"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Go to Directory
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Analytics Dashboard Card */}
        <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">Compensation Analytics</h3>
            <p className="mt-2 text-slate-500">
              Explore interactive visualizations of department averages, country headcount distributions, salary range histograms, and historical salary trends.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Go to Analytics
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-8 sm:grid-cols-3 text-center sm:text-left">
          <div>
            <p className="text-sm font-medium text-slate-500">Target Scale</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">10,000+</p>
            <p className="mt-1 text-xs text-slate-400">Realistic employee records</p>
          </div>
          <div className="border-t border-slate-100 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <p className="text-sm font-medium text-slate-500">Performance Target</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">&lt; 50ms</p>
            <p className="mt-1 text-xs text-slate-400">Sub-50ms API response time</p>
          </div>
          <div className="border-t border-slate-100 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <p className="text-sm font-medium text-slate-500">Data Integrity</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">100%</p>
            <p className="mt-1 text-xs text-slate-400">ACID temporal salary tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
