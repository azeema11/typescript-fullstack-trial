"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Employee, AdjustSalaryInput, SalaryRevisionType } from "@/lib/api";
import { COUNTRIES } from "@/lib/constants";
import { X, Loader2 } from "lucide-react";

interface AdjustSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export default function AdjustSalaryModal({ isOpen, onClose, employee }: AdjustSalaryModalProps) {
  const queryClient = useQueryClient();

  // Form states
  const [baseSalary, setBaseSalary] = useState("");
  const [currency, setCurrency] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [revisionType, setRevisionType] = useState<SalaryRevisionType>("annual_review");

  // Relocation states
  const [newCountry, setNewCountry] = useState("");
  const [newCity, setNewCity] = useState("");

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  // Populate form when modal opens or employee changes
  useEffect(() => {
    if (isOpen && employee) {
      const activeSalary = employee.activeSalary;
      setBaseSalary(activeSalary ? parseFloat(activeSalary.baseSalary).toString() : "");
      setCurrency(activeSalary ? activeSalary.currency : "USD");
      setEffectiveDate(new Date().toISOString().slice(0, 10));
      setRevisionType("annual_review");
      setNewCountry(employee.country);
      setNewCity(employee.city);
      setErrors({});
      setSubmitError("");
    }
  }, [isOpen, employee]);

  // Update currency when newCountry changes (only if revisionType is relocation)
  useEffect(() => {
    const activeSalary = employee.activeSalary;
    if (revisionType === "relocation" && newCountry && COUNTRIES[newCountry]) {
      setCurrency(COUNTRIES[newCountry].currency);
    } else if (revisionType !== "relocation" && activeSalary) {
      setCurrency(activeSalary.currency);
    }
  }, [newCountry, revisionType, employee]);

  // Adjust Salary Mutation
  const adjustMutation = useMutation({
    mutationFn: (data: AdjustSalaryInput) => api.adjustSalary(employee.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["analyticsSummary"] });
      onClose();
    },
    onError: (error: Error) => {
      setSubmitError(error.message || "Failed to adjust salary. Please try again.");
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!baseSalary) {
      newErrors.baseSalary = "Base salary is required";
    } else if (isNaN(Number(baseSalary)) || Number(baseSalary) <= 0) {
      newErrors.baseSalary = "Salary must be a positive number";
    }

    if (!effectiveDate) newErrors.effectiveDate = "Effective date is required";

    if (revisionType === "relocation") {
      if (!newCountry) newErrors.newCountry = "New country is required";
      if (!newCity.trim()) newErrors.newCity = "New city is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    const payload: AdjustSalaryInput = {
      baseSalary: Number(baseSalary),
      currency,
      effectiveDate,
      revisionType,
    };

    if (revisionType === "relocation") {
      payload.newCountry = newCountry;
      payload.newCity = newCity;
    }

    adjustMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">Adjust Salary</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {submitError && (
              <div className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-600">
                {submitError}
              </div>
            )}

            <div className="space-y-4">
              {/* Revision Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Revision Type
                </label>
                <select
                  value={revisionType}
                  onChange={(e) => setRevisionType(e.target.value as SalaryRevisionType)}
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="annual_review">Annual Review</option>
                  <option value="promotion">Promotion</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="relocation">Relocation</option>
                </select>
              </div>

              {/* Base Salary */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  New Base Salary
                </label>
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className={`block w-full rounded-xl border py-3 pl-4 pr-16 text-sm outline-none transition-all ${errors.baseSalary
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      }`}
                    placeholder="85000"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-sm font-bold text-slate-400">{currency}</span>
                  </div>
                </div>
                {errors.baseSalary && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.baseSalary}</p>
                )}
              </div>

              {/* Effective Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${errors.effectiveDate
                    ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                />
                {errors.effectiveDate && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.effectiveDate}</p>
                )}
              </div>

              {/* Relocation Fields (Conditional) */}
              {revisionType === "relocation" && (
                <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Relocation Details
                  </h4>

                  {/* New Country */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      New Country
                    </label>
                    <select
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className={`mt-2 block w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all ${errors.newCountry
                        ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        }`}
                    >
                      <option value="">Select Country</option>
                      {Object.entries(COUNTRIES).map(([code, config]) => (
                        <option key={code} value={code}>
                          {config.name}
                        </option>
                      ))}
                    </select>
                    {errors.newCountry && (
                      <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.newCountry}</p>
                    )}
                  </div>

                  {/* New City */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      New City
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${errors.newCity
                        ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        }`}
                      placeholder="San Francisco"
                    />
                    {errors.newCity && (
                      <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.newCity}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjustMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {adjustMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Adjust Salary
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
