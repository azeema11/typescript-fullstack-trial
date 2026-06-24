"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Employee, UpdateEmployeeInput } from "@/lib/api";
import { X, Loader2 } from "lucide-react";

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export default function UpdateProfileModal({ isOpen, onClose, employee }: UpdateProfileModalProps) {
  const queryClient = useQueryClient();

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [city, setCity] = useState("");

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  // Populate form when modal opens or employee changes
  useEffect(() => {
    if (isOpen && employee) {
      setFirstName(employee.firstName);
      setLastName(employee.lastName);
      setDesignation(employee.designation);
      setCity(employee.city);
      setErrors({});
      setSubmitError("");
    }
  }, [isOpen, employee]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateEmployeeInput) => api.updateEmployee(employee.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
    onError: (error: Error) => {
      setSubmitError(error.message || "Failed to update profile. Please try again.");
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!designation.trim()) newErrors.designation = "Designation is required";
    if (!city.trim()) newErrors.city = "City is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    updateMutation.mutate({
      firstName,
      lastName,
      designation,
      city,
    });
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
            <h3 className="text-lg font-bold text-slate-900">Update Profile</h3>
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
              {/* First Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                    errors.firstName
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                    errors.lastName
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.lastName}</p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                    errors.designation
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {errors.designation && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.designation}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                    errors.city
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.city}</p>
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
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
