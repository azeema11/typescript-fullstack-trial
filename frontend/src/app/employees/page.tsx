"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { api, EmployeeStatus } from "@/lib/api";
import { COUNTRIES, convertToUSD } from "@/lib/constants";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  Eye,
} from "lucide-react";

function EmployeesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter & Query States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<EmployeeStatus | "">("");
  const [sortBy, setSortBy] = useState<"name" | "hireDate" | "salary">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Cursor Pagination States
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      // Reset pagination when search changes
      setCursor(undefined);
      setCursorHistory([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle Action from search params (e.g., ?action=add)
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsAddModalOpen(true);
      // Clear the query parameter so it doesn't reopen on reload
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("action");
      router.replace(`/employees?${newParams.toString()}`);
    }
  }, [searchParams, router]);

  // Fetch departments for filter dropdown
  const { data: deptsResponse } = useQuery({
    queryKey: ["departments"],
    queryFn: api.getDepartments,
  });
  const departments = deptsResponse?.data || [];

  // Fetch employees list
  const {
    data: employeesResponse,
    isLoading,
    isPlaceholderData,
  } = useQuery({
    queryKey: [
      "employees",
      debouncedSearch,
      departmentId,
      country,
      status,
      sortBy,
      sortOrder,
      cursor,
    ],
    queryFn: () =>
      api.getEmployees({
        limit: 15,
        search: debouncedSearch || undefined,
        departmentId: departmentId || undefined,
        country: country || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
        cursor,
      }),
    placeholderData: (previousData) => previousData,
  });

  const employees = employeesResponse?.data || [];
  const nextCursor = employeesResponse?.nextCursor;

  // Handle Filter Changes
  const handleFilterChange = (type: "dept" | "country" | "status" | "sortBy" | "sortOrder", value: string) => {
    if (type === "dept") setDepartmentId(value);
    if (type === "country") setCountry(value);
    if (type === "status") setStatus(value as EmployeeStatus | "");
    if (type === "sortBy") setSortBy(value as "name" | "hireDate" | "salary");
    if (type === "sortOrder") setSortOrder(value as "asc" | "desc");

    // Reset cursor pagination on filter change
    setCursor(undefined);
    setCursorHistory([]);
  };

  // Pagination Handlers
  const handleNextPage = () => {
    if (nextCursor) {
      setCursorHistory((prev) => [...prev, cursor]);
      setCursor(nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const prevHistory = [...cursorHistory];
      const prevCursor = prevHistory.pop();
      setCursorHistory(prevHistory);
      setCursor(prevCursor);
    }
  };

  const getStatusBadge = (empStatus: EmployeeStatus) => {
    const styles = {
      active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      on_leave: "bg-amber-50 text-amber-700 ring-amber-600/20",
      inactive: "bg-rose-50 text-rose-700 ring-rose-600/20",
    };
    const labels = {
      active: "Active",
      on_leave: "On Leave",
      inactive: "Inactive",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[empStatus]}`}
      >
        {labels[empStatus]}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Employee Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter, and manage employee profiles and salary revisions.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or employee code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filters Toggle or Quick Filters */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:flex md:items-center">
            {/* Department */}
            <select
              value={departmentId}
              onChange={(e) => handleFilterChange("dept", e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Country */}
            <select
              value={country}
              onChange={(e) => handleFilterChange("country", e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Countries</option>
              {Object.entries(COUNTRIES).map(([code, config]) => (
                <option key={code} value={code}>
                  {config.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>Sort By:</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm outline-none hover:bg-slate-50"
            >
              <option value="name">Name</option>
              <option value="hireDate">Hire Date</option>
              <option value="salary">Salary</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm outline-none hover:bg-slate-50"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Employee Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Active Salary</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading && !isPlaceholderData ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4 text-right"><div className="ml-auto h-4 w-8 rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <Users className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-slate-900">No employees found</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Try adjusting your search query or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-bold text-slate-600">
                      {employee.employeeCode}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs font-medium text-slate-400">{employee.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-600">
                      {employee.designation}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-600">
                      {employee.department.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-600">
                      {COUNTRIES[employee.country]?.name || employee.country}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(employee.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-900">
                      {employee.activeSalary ? (
                        <div>
                          <div>
                            {parseFloat(employee.activeSalary.baseSalary).toLocaleString()} {employee.activeSalary.currency}
                          </div>
                          {employee.activeSalary.currency !== "USD" && (
                            <div className="text-xs font-medium text-slate-400">
                              ≈ {Math.round(convertToUSD(parseFloat(employee.activeSalary.baseSalary), employee.activeSalary.currency)).toLocaleString()} USD
                            </div>
                          )}
                        </div>
                      ) : (
                        "No Active Salary"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        href={`/employees/${employee.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {employees.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <div className="text-xs font-semibold text-slate-500">
              Showing page {cursorHistory.length + 1}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={cursorHistory.length === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!nextCursor}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <EmployeesContent />
    </Suspense>
  );
}
