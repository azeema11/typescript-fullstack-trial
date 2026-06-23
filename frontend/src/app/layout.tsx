import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";
import { LayoutDashboard, Users, BarChart3, DollarSign } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ACME Salary Management System",
  description: "Manage employee profiles, salaries, and compensation analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full text-slate-900 antialiased`}>
        <Providers>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
              {/* Logo / Header */}
              <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-200">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-base font-bold leading-none text-slate-900">ACME Inc.</h1>
                  <span className="text-xs font-medium text-slate-500">Salary Portal</span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-1 px-4 py-6">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <LayoutDashboard className="h-5 w-5 text-slate-400" />
                  Dashboard
                </Link>
                <Link
                  href="/employees"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Users className="h-5 w-5 text-slate-400" />
                  Employees
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                  Analytics
                </Link>
              </nav>

              {/* Footer / User Info */}
              <div className="border-t border-slate-100 p-4">
                <div className="flex items-center gap-3 px-2 py-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    HR
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-none">HR Manager</p>
                    <span className="text-xs font-medium text-slate-400">admin@acme.com</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col pl-64">
              {/* Top Header */}
              <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <span className="h-6 w-px bg-slate-200" />
                  <span className="text-sm font-medium text-slate-500">Welcome back, HR Manager</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                    System Online
                  </span>
                </div>
              </header>

              {/* Page Content */}
              <main className="flex-1 p-8">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
