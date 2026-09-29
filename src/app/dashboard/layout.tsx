// Dashboard route shell; staff authentication and active-row checks happen here.
// Feature pages render inside the shared role-aware navigation frame.
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#183330] md:flex">
      <DashboardSidebar role={user.role} name={user.name} />
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-[#d9e7e3] bg-white px-5 md:px-8">
          <p className="text-sm font-medium text-[#526965]">
            Clinic operations
          </p>
          <p className="text-sm font-medium">{user.name}</p>
        </header>
        <main className="mx-auto w-full max-w-360 px-5 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
