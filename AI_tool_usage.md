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

