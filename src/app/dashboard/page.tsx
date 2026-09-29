// Landing view for authenticated staff; operational summaries arrive in a later phase.
// The dashboard shell and route protection are shared with all dashboard pages.
export default function DashboardPage() {
  return (
    <section>
      <div className="border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Overview
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
      </div>
      <div className="py-10 text-sm text-[#69807c]">
        No activity to show yet.
      </div>
    </section>
  );
}
