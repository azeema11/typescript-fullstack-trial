"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api, EmployeeStatus } from "@/lib/api";
import { COUNTRIES, convertToUSD } from "@/lib/constants";
import UpdateProfileModal from "@/components/UpdateProfileModal";
import AdjustSalaryModal from "@/components/AdjustSalaryModal";
import RecordLeaveModal from "@/components/RecordLeaveModal";
import TerminateModal from "@/components/TerminateModal";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  User,
  DollarSign,
  Euro,
  PoundSterlingIcon,
  JapaneseYen,
  IndianRupee,
  Coins,
  TrendingUp,
  Loader2,
  UserCheck,
  UserMinus,
  Edit3,
  Percent,
} from "lucide-react";

export default function EmployeeDetailPage() {
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();

  // Modal visibility states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

  // Fetch employee detail
  const {
    data: employeeResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => api.getEmployeeById(id),
  });

  const employee = employeeResponse?.data;
  const salaries = employee?.salaries || [];

  // Find active salary from the full history array (where endDate is null)
  const activeSalary = salaries.find((sal) => sal.endDate === null) || null;

  // Return from Leave Mutation
  const returnFromLeaveMutation = useMutation({
    mutationFn: () =>
      api.updateEmployee(id, {
        status: "active",
        statusNote: "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["analyticsSummary"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <UserMinus className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Employee not found</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          The employee profile you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/employees"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
      </div>
    );
  }

  const getCurrencyIcon = (currency: string | undefined) => {
    switch (currency?.toUpperCase()) {
      case "USD":
      case "CAD":
      case "AUD":
      case "SGD":
        return <DollarSign className="h-6 w-6" />;
      case "EUR":
        return <Euro className="h-6 w-6" />;
      case "GBP":
        return <PoundSterlingIcon className="h-6 w-6" />;
      case "JPY":
        return <JapaneseYen className="h-6 w-6" />;
      case "INR":
        return <IndianRupee className="h-6 w-6" />;
      default:
        return <Coins className="h-6 w-6" />;
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
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[empStatus]}`}
      >
        {labels[empStatus]}
      </span>
    );
  };

  const getRevisionBadge = (type: string) => {
    const styles: Record<string, string> = {
      initial: "bg-slate-50 text-slate-700 ring-slate-600/10",
      promotion: "bg-indigo-50 text-indigo-700 ring-indigo-600/10",
      annual_review: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
      adjustment: "bg-amber-50 text-amber-700 ring-amber-600/10",
      relocation: "bg-purple-50 text-purple-700 ring-purple-600/10",
    };
    const labels: Record<string, string> = {
      initial: "Initial Salary",
      promotion: "Promotion",
      annual_review: "Annual Review",
      adjustment: "Adjustment",
      relocation: "Relocation",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
          styles[type] || "bg-slate-50 text-slate-700 ring-slate-600/10"
        }`}
      >
        {labels[type] || type}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <div>
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employee Directory
        </Link>
      </div>

      {/* Top Profile Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-lg shadow-indigo-100">
            {employee.firstName[0]}
            {employee.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {employee.firstName} {employee.lastName}
              </h1>
              {getStatusBadge(employee.status)}
            </div>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              {employee.designation} • {employee.department.name}
            </p>
            <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {employee.employeeCode}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {employee.status !== "inactive" && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Edit3 className="h-4 w-4" />
              Update Profile
            </button>
            <button
              onClick={() => setIsAdjustModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <TrendingUp className="h-4 w-4" />
              Adjust Salary
            </button>

            {employee.status === "active" && (
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <UserMinus className="h-4 w-4" />
                Record Leave
              </button>
            )}

            {employee.status === "on_leave" && (
              <button
                onClick={() => returnFromLeaveMutation.mutate()}
                disabled={returnFromLeaveMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
              >
                {returnFromLeaveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                Return from Leave
              </button>
            )}

            <button
              onClick={() => setIsTerminateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
            >
              <UserMinus className="h-4 w-4" />
              Terminate
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card & Details */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Notes (Leaves/Terminations) */}
          {employee.statusNote && (
            <div
              className={`rounded-2xl border p-5 ${
                employee.status === "on_leave"
                  ? "bg-amber-50/50 border-amber-100 text-amber-800"
                  : "bg-rose-50/50 border-rose-100 text-rose-800"
              }`}
            >
              <h4 className="text-sm font-bold uppercase tracking-wider">Status Note</h4>
              <p className="mt-2 text-sm leading-relaxed">{employee.statusNote}</p>
            </div>
          )}

          {/* Personal & Employment Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
              Employment Profile
            </h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{employee.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Location
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {employee.city}, {COUNTRIES[employee.country]?.name || employee.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Hire Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {new Date(employee.hireDate).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {employee.endDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-rose-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      End Date
                    </p>
                    <p className="mt-1 text-sm font-semibold text-rose-800">
                      {new Date(employee.endDate).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Gender
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 capitalize">
                    {employee.gender}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Date of Birth
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {new Date(employee.dateOfBirth).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Salary History Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
              Compensation History
            </h3>
            <div className="mt-6 relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8">
              {salaries.map((sal, index) => {
                const isActive = sal.endDate === null;
                return (
                  <div key={sal.id} className="relative">
                    {/* Timeline Dot */}
                    <span
                      className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                        isActive ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900">
                            {parseFloat(sal.baseSalary).toLocaleString()} {sal.currency}
                          </span>
                          {getRevisionBadge(sal.revisionType)}
                        </div>
                        <p className="text-xs font-medium text-slate-400 mt-1">
                          Effective:{" "}
                          {new Date(sal.effectiveDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          –{" "}
                          {sal.endDate
                            ? new Date(sal.endDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Present"}
                        </p>
                      </div>

                      {/* Percentage Increase (Calculated using USD converted values for currency changes) */}
                      {index < salaries.length - 1 && (() => {
                        const currentInUSD = convertToUSD(parseFloat(sal.baseSalary), sal.currency);
                        const prevInUSD = convertToUSD(parseFloat(salaries[index + 1].baseSalary), salaries[index + 1].currency);
                        
                        if (prevInUSD <= 0) return null;
                        
                        const percentIncrease = ((currentInUSD - prevInUSD) / prevInUSD) * 100;
                        const isDifferentCurrency = sal.currency !== salaries[index + 1].currency;
                        
                        if (percentIncrease > 0) {
                          return (
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg self-start sm:self-center">
                              <Percent className="h-3 w-3" />
                              <span>
                                {percentIncrease.toFixed(1)}% Increase
                                {isDifferentCurrency && " (USD converted)"}
                              </span>
                            </div>
                          );
                        } else if (percentIncrease < 0) {
                          return (
                            <div className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg self-start sm:self-center">
                              <Percent className="h-3 w-3" />
                              <span>
                                {Math.abs(percentIncrease).toFixed(1)}% Decrease
                                {isDifferentCurrency && " (USD converted)"}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Salary Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
              Active Compensation
            </h3>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Salary
                </p>
                {activeSalary ? (
                  <div>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                      {parseFloat(activeSalary.baseSalary).toLocaleString()}
                      <span className="text-sm font-bold text-slate-400 ml-1.5">
                        {activeSalary.currency}
                      </span>
                    </p>
                    {activeSalary.currency !== "USD" && (
                      <p className="text-xs font-semibold text-slate-400 mt-1">
                        ≈ {Math.round(convertToUSD(parseFloat(activeSalary.baseSalary), activeSalary.currency)).toLocaleString()} USD
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-lg font-bold text-rose-600">No Active Salary</p>
                )}
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                {getCurrencyIcon(activeSalary?.currency)}
              </div>
            </div>
          </div>

          {/* Quick Stats / Revision Count */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Compensation Stats
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-xs font-semibold text-slate-400">Revisions</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{salaries.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-xs font-semibold text-slate-400">Tenure</span>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {Math.max(
                    1,
                    Math.ceil(
                      (new Date(employee.endDate || new Date()).getTime() -
                        new Date(employee.hireDate).getTime()) /
                        (1000 * 60 * 60 * 24 * 30) // Months
                    )
                  )}{" "}
                  mo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      {employee && (
        <>
          <UpdateProfileModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            employee={employee}
          />
          <AdjustSalaryModal
            isOpen={isAdjustModalOpen}
            onClose={() => setIsAdjustModalOpen(false)}
            employee={employee}
          />
          <RecordLeaveModal
            isOpen={isLeaveModalOpen}
            onClose={() => setIsLeaveModalOpen(false)}
            employee={employee}
          />
          <TerminateModal
            isOpen={isTerminateModalOpen}
            onClose={() => setIsTerminateModalOpen(false)}
            employee={employee}
          />
        </>
      )}
    </div>
  );
}
