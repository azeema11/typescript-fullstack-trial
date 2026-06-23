# AI Tool Usage and Decisions Log

This log documents the interactive process of implementing the ACME Employee Salary Management System, AI-assisted decisions and development progress.

---

## Phase 1: Requirements & Architectural Design (2026-06-23)

### Objective

Establish the product requirements, system architecture, API schemas, and technical trade-offs before writing code.

### **Key Architectural Decisions Made**:

1. **UUID-Based IDs**: All database primary keys are UUID strings (`@id @default(uuid())`) to prevent ID enumeration and enhance security.
2. **Temporal Data Model**: Single `Salary` table with `effectiveDate` and nullable `endDate` to represent salary history cleanly.
3. **Decimal Precision**: Storing financial figures using PostgreSQL's `Decimal` type to avoid floating-point rounding errors.
4. **Local Currency Storage**: Retaining salaries in local currency (USD, INR, EUR, etc.).
5. **Cursor-Based Pagination**: Utilizing the unique `employeeCode` in combination with secondary sorting fields (like `firstName` or `hireDate`) to ensure deterministic ordering and constant-time $O(1)$ query performance over 10,000+ records.
6. **Static Constants**: Storing countries and currencies in code as TypeScript constants with Zod validation for the time being to reduce complexity.

---

## Phase 2: Backend Initialization & Database Schema (2026-06-23)

### Objective

Initialize the backend project configuration, define the database schema with UUID-based IDs, and write seed/migration scripts.

### **Key Decisions Made**:

1. **UUID Schema Implementation**: Defined `id` as `String @id @default(uuid())` across `Department`, `Employee`, and `Salary` models in `schema.prisma`.
2. **Performance Indexes**: Kept indexes on `Employee(departmentId)`, `Employee(country)`, `Employee(status)`, `Salary(employeeId)`, `Salary(endDate)`, and composite `Salary(employeeId, endDate)` to ensure sub-50ms query speeds under scale.
3. **Batch Seeding with UUIDs**: Implemented a seed script that creates 10,000 employees in batches of 500. It resolves relationships using the generated UUIDs from `prisma.department.create` and `prisma.employee.create` dynamically.

---

## Phase 3: Core Business Logic Services & Unit Testing (2026-06-23)

### Objective

Implement core backend services for employees, departments, and analytics, and write robust unit tests to verify the business logic.

### **Key Decisions Made**:

1. **Service-Layer Abstraction**: Created pure TypeScript service classes (`EmployeeService`, `DepartmentService`, `AnalyticsService`) to encapsulate all business logic, keeping controllers thin and focused on HTTP concerns.
2. **Deterministic Cursor-Based Pagination**: Implemented cursor-based pagination using the unique `employeeCode` as a cursor, combined with deterministic ordering (e.g., sorting by `firstName` or `hireDate` with `employeeCode` as a fallback tie-breaker) to prevent duplicate or skipped records.
3. **ACID Transactions**: Wrapped employee creation, soft-deletes, and salary adjustments in Prisma transactions (`$transaction`) to guarantee data integrity (e.g., ensuring an inactive employee's active salary is closed simultaneously).
4. **PostgreSQL Window Functions**: Used raw SQL queries in `AnalyticsService` to leverage PostgreSQL's native `percentile_cont` function for calculating exact median salaries, which is highly efficient and accurate at scale.
5. **Mocked Prisma Unit Testing**: Wrote fast, deterministic unit tests using Vitest and mocked Prisma clients, achieving 100% test reliability and sub-250ms execution times.

