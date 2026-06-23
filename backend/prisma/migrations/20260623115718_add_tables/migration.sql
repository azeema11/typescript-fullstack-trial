-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('active', 'inactive', 'on_leave');

-- CreateEnum
CREATE TYPE "SalaryRevisionType" AS ENUM ('initial', 'promotion', 'annual_review', 'adjustment', 'relocation');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "departmentId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'active',
    "statusNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salary" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "baseSalary" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "revisionType" "SalaryRevisionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

-- CreateIndex
CREATE INDEX "Employee_country_idx" ON "Employee"("country");

-- CreateIndex
CREATE INDEX "Employee_status_idx" ON "Employee"("status");

-- CreateIndex
CREATE INDEX "Salary_employeeId_idx" ON "Salary"("employeeId");

-- CreateIndex
CREATE INDEX "Salary_endDate_idx" ON "Salary"("endDate");

-- CreateIndex
CREATE INDEX "Salary_employeeId_endDate_idx" ON "Salary"("employeeId", "endDate");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
