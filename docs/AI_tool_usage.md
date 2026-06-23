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

