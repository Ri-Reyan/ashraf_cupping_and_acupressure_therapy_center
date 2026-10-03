// Admin dashboard loads aggregated month analytics; other staff remain restricted.
// Monthly revenue trends and therapist rankings are not exposed to receptionists.
import { DashboardAnalytics } from "@/features/dashboard/components/DashboardAnalytics";
import { DashboardToday } from "@/features/dashboard/components/DashboardToday";
import {
  getDashboardAnalytics,
  getTodayDashboardSummary,
} from "@/lib/services/analytics";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const today = await getTodayDashboardSummary();
  const analytics =
    user.role === "ADMIN" ? await getDashboardAnalytics() : null;

  return (
    <div className="space-y-10">
      <header className="border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Clinic operations
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
      </header>
      <DashboardToday data={today} />
      {analytics && <DashboardAnalytics data={analytics} />}
    </div>
  );
}
