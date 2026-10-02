// Server-rendered dashboard metrics and top-therapist summary.
// Recharts receives only pre-aggregated serializable data from analytics.ts.
import { AnalyticsCharts } from "./AnalyticsCharts";
import type { DashboardAnalytics as DashboardAnalyticsData } from "@/lib/services/analytics";
import { formatBDT } from "@/lib/format";

export function DashboardAnalytics({ data }: { data: DashboardAnalyticsData }) {
  const stats = [
    {
      label: "Patients",
      value: data.patientCount.toLocaleString("en-BD"),
      tone: "text-[#183330]",
    },
    { label: "Income", value: formatBDT(data.income), tone: "text-[#116c61]" },
    {
      label: "Expenses",
      value: formatBDT(data.expenses),
      tone: "text-[#a13f37]",
    },
    {
      label: "Therapist payouts",
      value: formatBDT(data.payouts),
      tone: "text-[#a3691c]",
    },
    {
      label: "Net",
      value: formatBDT(data.net),
      tone: data.net < 0 ? "text-[#a13f37]" : "text-[#116c61]",
    },
  ];

  return (
    <section>
      <header className="mb-6 border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Clinic analytics
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-[#69807c]">{data.monthLabel}</p>
      </header>

      <dl className="mb-8 grid grid-cols-2 border-y border-[#d9e7e3] sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-b border-r border-[#e2ebe8] px-4 py-4 last:border-r-0 sm:px-5"
          >
            <dt className="text-xs font-medium uppercase text-[#69807c]">
              {stat.label}
            </dt>
            <dd className={`mt-2 text-xl font-semibold ${stat.tone}`}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <AnalyticsCharts daily={data.daily} monthly={data.monthly} />

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#d9e7e3] pb-3">
          <div>
            <h2 className="text-base font-semibold">Top therapists</h2>
            <p className="mt-1 text-xs text-[#69807c]">
              Ranked by appointment fees this month
            </p>
          </div>
        </div>
        {data.topTherapists.length === 0 ? (
          <p className="py-8 text-sm text-[#69807c]">
            No appointments recorded this month.
          </p>
        ) : (
          <div className="overflow-x-auto border-b border-[#d9e7e3]">
            <table className="w-full min-w-120 border-collapse text-left text-sm">
              <thead className="bg-[#edf4f1] text-xs uppercase text-[#526965]">
                <tr>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Rank
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Therapist
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-right font-semibold"
                  >
                    Fee generated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2ebe8]">
                {data.topTherapists.map((therapist, index) => (
                  <tr
                    key={therapist.id}
                    className="bg-white hover:bg-[#f8fbf9]"
                  >
                    <td className="px-3 py-3 text-[#69807c]">{index + 1}</td>
                    <td className="px-3 py-3 font-medium">{therapist.name}</td>
                    <td className="px-3 py-3 text-right font-semibold">
                      {formatBDT(therapist.fee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
