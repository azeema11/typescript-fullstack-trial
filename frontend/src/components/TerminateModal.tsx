"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Employee } from "@/lib/api";
import { X, Loader2, AlertTriangle } from "lucide-react";

interface TerminateModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export default function TerminateModal({ isOpen, onClose, employee }: TerminateModalProps) {
  const queryClient = useQueryClient();

  // Form states
  const [reason, setReason] = useState("");

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  // Populate form when modal opens or employee changes
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setErrors({});
      setSubmitError("");
    }
  }, [isOpen]);

  // Delete Mutation (Soft-delete)
  const terminateMutation = useMutation({
    mutationFn: (terminationReason: string) => api.deleteEmployee(employee.id, terminationReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["analyticsSummary"] });
      onClose();
    },
    onError: (error: Error) => {
      setSubmitError(error.message || "Failed to terminate employment. Please try again.");
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!reason.trim()) {
      newErrors.reason = "Reason for termination is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    terminateMutation.mutate(reason);
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
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Terminate Employment
            </h3>
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
              <div className="rounded-xl bg-rose-50 p-4 border border-rose-100">
                <p className="text-sm text-rose-800 leading-relaxed font-medium">
                  Warning: This action is irreversible. It will soft-delete the employee profile, set their status to <span className="font-bold">Inactive</span>, close their active salary record, and record today as their end date.
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reason for Termination
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all resize-none ${
                    errors.reason
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                  placeholder="e.g., Voluntary Resignation, Contract Completed, Performance Issues"
                />
                {errors.reason && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.reason}</p>
                )}
              </div>
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
                disabled={terminateMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-rose-100 hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50"
              >
                {terminateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Terminate Employment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
