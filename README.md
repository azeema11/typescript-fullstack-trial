# Employee Salary Management System

A high-performance, full-stack web application designed for ACME's HR managers to manage employee profiles, track comprehensive salary histories using a temporal data model, and analyze compensation metrics across 10,000+ global employees.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management & Caching**: TanStack Query (React Query) v5
- **Data Visualization**: Recharts
- **Icons**: Lucide Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **ORM**: Prisma ORM
- **Database**: PostgreSQL 16
- **Validation**: Zod

### Infrastructure & Tooling
- **Containerization**: Docker & Docker Compose
- **Testing**: Vitest & Supertest

---

## ✨ Key Features

- **Employee Management (CRUD)**: Create, read, update, and soft-delete employee profiles. Soft-deletion automatically closes active salary records and updates employee status to `inactive`.
- **Temporal Salary Tracking**: Track every salary change (hikes, promotions, relocations, adjustments) as a historical timeline. Active salaries are represented by `endDate IS NULL`, and changes are processed within robust ACID database transactions.
- **Cursor-Based Pagination**: Optimized cursor pagination utilizing the unique `employeeCode` to handle 10,000+ records with sub-millisecond response times.
- **Global Currency Conversion**: Built-in hardcoded exchange rates on the frontend to seamlessly convert and aggregate global compensation metrics for unified analytics.
- **Compensation Analytics Dashboard**: 
  - **Department Compensation**: Interactive bar chart displaying average and median salaries by department in any selected currency.
  - **Global Headcount**: Pie chart showing employee distribution by country.
  - **Salary Distribution**: Localized headcount histograms per country.
  - **Compensation Trends**: 5-year historical average salary line charts aggregated and converted to local currency.

---

## 📂 Project Structure

```text
salary_management/
├── backend/                  # Express API & Prisma Schema
│   ├── prisma/               # Database schema & migrations
│   ├── src/
│   │   ├── controllers/      # HTTP request handlers & Zod validation
│   │   ├── services/         # Core business logic & database queries
│   │   ├── constants/        # Static configurations (countries, etc.)
│   │   └── index.ts          # Server entry point
│   └── tests/                # Vitest unit & integration tests
├── frontend/                 # Next.js Web App
│   ├── src/
│   │   ├── app/              # Next.js App Router pages (Dashboard, Directory, Analytics)
│   │   ├── components/       # Reusable React UI components (Modals, Forms)
│   │   └── lib/              # API client, constants, and currency helpers
└── docs/                     # Comprehensive documentation
    ├── REQUIREMENTS.md       # Product & business requirements
    └── ARCHITECTURE.md       # Technical architecture & API specs
```

---

## 🛠️ Setting Up & Running

### Method 1: Full-Stack Docker Compose (Recommended)
The easiest way to run the entire application (Database, Backend, and Frontend) is using Docker Compose.

1. **Prerequisites**: Ensure Docker and Docker Desktop are running.
2. **Start the application**:
   ```bash
   npm run dev:with_docker
   ```
   This will spin up three containers:
   - `salary_db`: PostgreSQL 16 database (port `5432`)
   - `salary_backend`: Express API (port `3001`)
   - `salary_frontend`: Next.js Web App (port `3000`)
3. **Seeding**: The database is automatically migrated and seeded with 10,000 mock employees when the containers start.
4. **Access the Web App**: Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Method 2: Running Concurrently (Local Development)
If you want to run both the backend and frontend locally outside Docker but concurrently using a single command:

1. **Prerequisites**: Ensure you have a PostgreSQL database running locally (or spin up just the database container using `docker-compose up -d db`).
2. **Install Dependencies**:
   ```bash
   npm run install:all
   ```
3. **Configure Environment Variables**:
   - In `backend/.env`, set `DATABASE_URL` to point to your local PostgreSQL instance (e.g., `postgresql://salary_admin:salary_pass@localhost:5432/salary_management?schema=public`).
4. **Run the Full Stack**:
   ```bash
   npm run dev
   ```
   This will run both `npm run dev:backend` and `npm run dev:frontend` concurrently.

---

### Method 3: Running Individually (Local Development)
If you want to run the backend and frontend in separate terminal windows for close monitoring or debugging:

#### 1. Setup the Database
Ensure PostgreSQL is running on port 5432. You can spin up just the database container using:
```bash
docker-compose up -d db
```

#### 2. Run the Backend Individually
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate the Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Seed the database (generates 10,000 mock employees):
   ```bash
   npm run seed
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will be available at [http://localhost:3001](http://localhost:3001).

#### 3. Run the Frontend Individually
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend web application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Running Tests

To run the backend unit and integration tests:

```bash
cd backend
npm run test
```

To run tests in watch mode:
```bash
cd backend
npm run test:watch
```

---

## 📖 Documentation

For a deeper dive into the system's requirements and technical design, refer to the `docs` directory:
- [Product Requirements](./docs/REQUIREMENTS.md)
- [Technical Architecture & API Specifications](./docs/ARCHITECTURE.md)
