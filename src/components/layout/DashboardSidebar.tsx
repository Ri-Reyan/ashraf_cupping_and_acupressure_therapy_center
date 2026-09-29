// Role-aware primary navigation for the staff dashboard.
// Links remain presentation-only; server guards enforce access independently.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ContactRound,
  LayoutDashboard,
  List,
  Plus,
  ReceiptText,
  Users,
  Wallet,
} from "lucide-react";
import type { StaffRole } from "@/lib/auth";
import { LogoutButton } from "@/components/layout/LogoutButton";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "RECEPTIONIST"],
  },
  {
    label: "New Appointment",
    href: "/dashboard/appointments/new",
    icon: Plus,
    roles: ["ADMIN", "RECEPTIONIST"],
  },
  {
    label: "Invoices",
    href: "/dashboard/invoices",
    icon: ReceiptText,
    roles: ["ADMIN", "RECEPTIONIST"],
  },
  {
    label: "Therapists",
    href: "/dashboard/therapists",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Patients",
    href: "/dashboard/patients",
    icon: ContactRound,
    roles: ["ADMIN", "RECEPTIONIST"],
  },
  {
    label: "Expenses",
    href: "/dashboard/expenses",
    icon: Wallet,
    roles: ["ADMIN", "RECEPTIONIST"],
  },
  {
    label: "Services",
    href: "/dashboard/services",
    icon: List,
    roles: ["ADMIN"],
  },
] as const;

export function DashboardSidebar({
  role,
  name,
}: {
  role: StaffRole;
  name: string;
}) {
  const pathname = usePathname();
  const items = navigation.filter((item) =>
    item.roles.some((allowedRole) => allowedRole === role),
  );

  return (
    <aside className="flex min-h-16 shrink-0 flex-row items-center justify-between bg-[#123f39] px-2 text-white md:min-h-screen md:w-60 md:flex-col md:items-stretch md:px-3">
      <Link
        href="/dashboard"
        className="flex h-16 items-center gap-3 px-2 md:border-b md:border-white/15"
      >
        <span className="grid size-9 shrink-0 place-items-center bg-[#d9e9d7] text-[#123f39]">
          <Activity className="size-5" />
        </span>
        <span className="hidden min-w-0 md:block">
          <span className="block truncate text-sm font-semibold">
            Ashraf Therapy
          </span>
          <span className="block text-xs text-white/60">Staff workspace</span>
        </span>
      </Link>

      <nav
        aria-label="Dashboard"
        className="flex items-center gap-1 md:block md:flex-1 md:space-y-1 md:py-5"
      >
        {items.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={label}
              className={`flex size-10 items-center justify-center gap-3 text-sm transition-colors md:h-10 md:w-full md:justify-start md:px-3 ${active ? "bg-white text-[#123f39]" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon aria-hidden="true" className="size-4.5 shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 border-t border-white/15 py-3 md:block">
        <p className="hidden truncate px-3 pb-2 text-xs text-white/60 md:block">
          {name}
        </p>
        <LogoutButton />
      </div>
    </aside>
  );
}
