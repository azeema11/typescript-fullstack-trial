export type EmployeeStatus = "active" | "inactive" | "on_leave";

export type SalaryRevisionType =
  | "initial"
  | "promotion"
  | "annual_review"
  | "adjustment"
  | "relocation";

export interface Department {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Salary {
  id: string;
  employeeId: string;
  baseSalary: string;
  currency: string;
  effectiveDate: string;
  endDate: string | null;
  revisionType: SalaryRevisionType;
  createdAt?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  hireDate: string;
  endDate: string | null;
  departmentId: string;
  department: Department;
  designation: string;
  country: string;
  city: string;
  status: EmployeeStatus;
  statusNote: string | null;
  createdAt: string;
  updatedAt: string;
  activeSalary: {
    baseSalary: string;
    currency: string;
  } | null;
  salaries?: Salary[];
}

export interface GetEmployeesParams {
  cursor?: string;
  limit?: number;
  search?: string;
  departmentId?: string;
  country?: string;
  status?: EmployeeStatus;
  sortBy?: "name" | "hireDate" | "salary";
  sortOrder?: "asc" | "desc";
}

export interface GetEmployeesResponse {
  status: "success";
  data: Employee[];
  nextCursor?: string;
}

export interface GetEmployeeResponse {
  status: "success";
  data: Employee & { salaries: Salary[] };
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  hireDate: string;
  departmentId: string;
  designation: string;
  country: string;
  city: string;
  baseSalary: number;
  currency: string;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  designation?: string;
  city?: string;
  status?: EmployeeStatus;
  statusNote?: string;
}

export interface AdjustSalaryInput {
  baseSalary: number;
  currency: string;
  effectiveDate: string;
  revisionType: SalaryRevisionType;
  newCountry?: string;
  newCity?: string;
}

export interface AnalyticsSummary {
  headcount: number;
  activeCount: number;
  onLeaveCount: number;
  inactiveCount: number;
  departmentCount: number;
  countryCount: number;
}

export interface AnalyticsByDepartment {
  department: string;
  currency: string;
  headcount: number;
  avgSalary: string;
  medianSalary: string;
  minSalary: string;
  maxSalary: string;
}

export interface AnalyticsByCountry {
  country: string;
  currency: string;
  headcount: number;
  avgSalary: string;
  medianSalary: string;
  totalPayroll: string;
}

export interface SalaryBucket {
  range: string;
  count: number;
}

export interface AnalyticsSalaryDistribution {
  currency: string;
  buckets: SalaryBucket[];
}

export interface TrendDataPoint {
  year: number;
  avgSalary: string;
}

export interface AnalyticsSalaryTrend {
  country: string;
  currency: string;
  data: TrendDataPoint[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ignore JSON parsing errors for non-JSON error responses
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Employees
  getEmployees: async (params: GetEmployeesParams = {}): Promise<GetEmployeesResponse> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });
    const queryString = queryParams.toString();
    return request<GetEmployeesResponse>(`/employees${queryString ? `?${queryString}` : ""}`);
  },

  getEmployeeById: async (id: string): Promise<GetEmployeeResponse> => {
    return request<GetEmployeeResponse>(`/employees/${id}`);
  },

  createEmployee: async (data: CreateEmployeeInput): Promise<{ status: "success"; data: Employee }> => {
    return request<{ status: "success"; data: Employee }>("/employees", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateEmployee: async (id: string, data: UpdateEmployeeInput): Promise<{ status: "success"; data: Employee }> => {
    return request<{ status: "success"; data: Employee }>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteEmployee: async (id: string, reason?: string): Promise<void> => {
    return request<void>(`/employees/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    });
  },

  adjustSalary: async (id: string, data: AdjustSalaryInput): Promise<{ status: "success"; data: Salary }> => {
    return request<{ status: "success"; data: Salary }>(`/employees/${id}/salary`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Departments
  getDepartments: async (): Promise<{ status: "success"; data: Department[] }> => {
    return request<{ status: "success"; data: Department[] }>("/departments");
  },

  // Analytics
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    const res = await request<{ status: "success"; data: AnalyticsSummary }>("/analytics/summary");
    return res.data;
  },

  getAnalyticsByDepartment: async (): Promise<AnalyticsByDepartment[]> => {
    const res = await request<{ status: "success"; data: AnalyticsByDepartment[] }>("/analytics/by-department");
    return res.data;
  },

  getAnalyticsByCountry: async (): Promise<AnalyticsByCountry[]> => {
    const res = await request<{ status: "success"; data: AnalyticsByCountry[] }>("/analytics/by-country");
    return res.data;
  },

  getAnalyticsSalaryDistribution: async (country: string = "US"): Promise<AnalyticsSalaryDistribution> => {
    const res = await request<{ status: "success"; data: AnalyticsSalaryDistribution }>(
      `/analytics/salary-distribution?country=${country}`
    );
    return res.data;
  },

  getAnalyticsSalaryTrends: async (): Promise<AnalyticsSalaryTrend[]> => {
    const res = await request<{ status: "success"; data: AnalyticsSalaryTrend[] }>("/analytics/salary-trends");
    return res.data;
  },
};
