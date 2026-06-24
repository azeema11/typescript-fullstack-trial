"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, CreateEmployeeInput } from "@/lib/api";
import { COUNTRIES } from "@/lib/constants";
import { X, Loader2 } from "lucide-react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const queryClient = useQueryClient();

  // Fetch departments for dropdown
  const { data: deptsResponse, isLoading: isDeptsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: api.getDepartments,
    enabled: isOpen,
  });

  const departments = deptsResponse?.data || [];

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designation, setDesignation] = useState("");
  const [country, setCountry] = useState("US");
  const [city, setCity] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  // Auto-populate currency when country changes
  useEffect(() => {
    if (country && COUNTRIES[country]) {
      setCurrency(COUNTRIES[country].currency);
    }
  }, [country]);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setDateOfBirth("");
      setGender("");
      setHireDate("");
      setDepartmentId("");
      setDesignation("");
      setCountry("US");
      setCity("");
      setBaseSalary("");
      setCurrency("USD");
      setErrors({});
      setSubmitError("");
    }
  }, [isOpen]);

  // Create Employee Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeInput) => api.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["analyticsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["recentHires"] });
      onClose();
    },
    onError: (error: Error) => {
      setSubmitError(error.message || "Failed to create employee. Please try again.");
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!hireDate) newErrors.hireDate = "Hire date is required";
    if (!departmentId) newErrors.departmentId = "Department is required";
    if (!designation.trim()) newErrors.designation = "Designation is required";
    if (!country) newErrors.country = "Country is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!baseSalary) {
      newErrors.baseSalary = "Base salary is required";
    } else if (isNaN(Number(baseSalary)) || Number(baseSalary) <= 0) {
      newErrors.baseSalary = "Salary must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    createMutation.mutate({
      firstName,
      lastName,
      email,
      dateOfBirth,
      gender,
      hireDate,
      departmentId,
      designation,
      country,
      city,
      baseSalary: Number(baseSalary),
      currency,
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
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Employee</h3>
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                  placeholder="John"
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
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                    errors.email
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                  placeholder="john.doe@acme.com"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.email}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none bg-white transition-all ${
                    errors.gender
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.gender}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                    errors.dateOfBirth
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.dateOfBirth}</p>
                )}
              </div>

              {/* Hire Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hire Date
                </label>
                <input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                    errors.hireDate
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {errors.hireDate && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.hireDate}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={isDeptsLoading}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none bg-white transition-all ${
                    errors.departmentId
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                >
                  <option value="">
                    {isDeptsLoading ? "Loading Departments..." : "Select Department"}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.departmentId}</p>
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
                  placeholder="Software Engineer"
                />
                {errors.designation && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.designation}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none bg-white transition-all ${
                    errors.country
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                >
                  {Object.entries(COUNTRIES).map(([code, config]) => (
                    <option key={code} value={code}>
                      {config.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.country}</p>
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
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.city}</p>
                )}
              </div>

              {/* Base Salary */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Base Salary
                </label>
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className={`block w-full rounded-xl border py-3 pl-4 pr-16 text-sm outline-none transition-all ${
                      errors.baseSalary
                        ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                    placeholder="75000"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-sm font-bold text-slate-400">{currency}</span>
                  </div>
                </div>
                {errors.baseSalary && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.baseSalary}</p>
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
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
