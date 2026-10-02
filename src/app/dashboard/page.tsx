// Admin dashboard loads aggregated month analytics; other staff remain restricted.
// Monthly revenue trends and therapist rankings are not exposed to receptionists.
import { DashboardAnalytics } from "@/features/dashboard/components/DashboardAnalytics";
import { getDashboardAnalytics } from "@/lib/services/analytics";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    return (
      <section>
        <header className="border-b border-[#d9e7e3] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
        </header>
        <p className="py-10 text-sm text-[#69807c]">
          Monthly analytics are available to administrators.
        </p>
      </section>
    );
  }

  const data = await getDashboardAnalytics();
  return <DashboardAnalytics data={data} />;
}
