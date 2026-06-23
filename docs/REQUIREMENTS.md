# Requirements Document: Employee Salary Management System (v1)

## 1. Executive Summary & Goal

The ACME organization manages salary data for 10,000 employees across multiple countries. Currently, this process is managed entirely via Excel spreadsheets, which is tedious, error-prone, and makes it difficult to answer questions about organizational compensation. 

The goal of this project is to build a web-based Employee Salary Management System that enables the HR Manager to manage employee profiles, track salary histories, analyze compensation distributions, and answer critical questions about how the organization pays its people.

---

## 2. Scope & Features

### 2.1. Backend API (Node.js, Express, TypeScript, Prisma, PostgreSQL)

- **Employee Management (CRUD)**:
  - Create, Read, Update, and Soft-Delete employees.
  - Soft-delete: Sets employee `status` to `inactive`, records `endDate`, and closes active salary records.
  - Fields: ID (UUID), Employee Code (unique), First/Last Name, Email (unique), Date of Birth, Gender, Hire Date, End Date, Department, Designation, Country, City, Status, Status Note.
- **Salary History Tracking (Temporal Data Model)**:
  - Track every salary change (hikes, promotions, relocations, adjustments) as a historical record.
  - Active salary is represented by `endDate IS NULL`.
  - Salary changes close the current active record (`endDate` set to change date) and insert a new active record.
  - Fields: ID (UUID), Employee ID (UUID), Base Salary (Decimal), Currency, Effective Date, End Date, Revision Type (Enum: `initial`, `promotion`, `annual_review`, `adjustment`, `relocation`).
- **Querying & Pagination**:
  - Cursor-based pagination for the 10,000 employee list to ensure high performance.
  - Comprehensive filtering by Department, Country, Status, and Salary Range.
  - Full-text search across Employee Name, Email, and Employee Code.
- **Analytics Engine**:
  - **Summary Stats**: Headcount, country count, department count, and active/inactive/on-leave distributions.
  - **Department Breakdown**: Headcount, average/median salary, and salary range grouped by department and currency.
  - **Country Breakdown**: Compensation stats in local currencies.
  - **Salary Distribution**: Histogram data for salary ranges per country/currency.
  - **Salary Trends**: Salary growth trends over time.

### 2.2. Frontend UI (Next.js, TypeScript, Tailwind CSS, Recharts)

- **Dashboard**: High-level KPI cards (headcount, department count, country count, active/on-leave status), recent hires list, and quick search.
- **Employee Directory**: Rich, interactive data table with cursor pagination, sorting, search, and multi-filter controls (Department, Country, Status).
- **Employee Detail Page**:
  - Employee profile card showing current status and history notes.
  - Active salary display and salary history timeline.
  - Interactive forms to update profile details, record leaves (changing status to `on_leave` with a note), or terminate employment (soft-delete).
  - "Adjust Salary" form to record promotions, adjustments, or relocations (changing country and currency).
- **Analytics Dashboard**: Visual charts powered by Recharts:
  - Department comparison (bar charts of average salary, grouped by currency).
  - Country distribution (pie chart of headcount).
  - Salary range histograms.
  - Historical salary trends (line charts).

---

## 3. Out of Scope (Deliberate Exclusions & Rationale)

To maintain high craftsmanship and focus on the core problem (salary management and analytics at scale), the following features are deliberately excluded from v1:

1. **Authentication and Role-Based Access Control (RBAC)**:
  - *Rationale*: The target persona is a single HR Manager using a secure internal tool. Adding login, JWTs, refresh tokens, and password hashing adds commodity code that does not demonstrate domain-specific engineering judgment.
2. **Cross-Currency Conversion (Unified USD Analytics)**:
  - *Rationale*: Real-time conversions require external APIs. Static exchange rates go stale immediately and give a false sense of accuracy. HR managers benchmark salaries *within* local markets and currencies (e.g., comparing INR to INR, not INR to USD).
3. **Redis/External Caching Layer**:
  - *Rationale*: PostgreSQL with proper indexes (on `departmentId`, `country`, `status`, and `endDate`) handles 10,000 rows in single-digit milliseconds. Adding Redis introduces premature infrastructure complexity, cache invalidation risks, and synchronization overhead.
4. **Country and Currency Database Tables**:
  - *Rationale*: The list of ~10 countries (US, UK, India, Germany, Canada, Australia, Japan, Brazil, Singapore, UAE) and their currencies is static. HR does not manage countries. Currently storing them as TypeScript constants with Zod schemas.
5. **Payroll Processing & Payslip Generation**:
  - *Rationale*: This is a separate, highly regulated domain involving bank integrations, tax compliance, and local labor laws, which is out of scope for a salary management system.
6. **Approval Workflows**:
  - *Rationale*: In a single-user HR manager system, approvals are redundant. If multi-user access is added in v2, a workflow engine (e.g., Temporal or custom state machine) would be introduced.

---

## 4. Non-Functional Requirements & Quality Standards

- **Performance**: All API endpoints must respond in < 50ms for 10,000 records.
- **Data Integrity**: Salary changes and soft-deletes must run in ACID transactions to prevent dangling records.
- **Accuracy**: Salaries must be stored as `Decimal` (numeric) in PostgreSQL to avoid floating-point rounding errors.
- **Test Coverage**: Core business logic (salary updates, status transitions, pagination, analytics calculations) must have robust unit and integration tests.
- **Modern UX**: The UI must be fully responsive, accessible, and follow professional design guidelines (clean spacing, clear typography, intuitive forms).

