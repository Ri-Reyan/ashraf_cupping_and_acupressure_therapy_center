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
  const comparisons = [
    {
      label: "Income",
      current: data.comparison.income.current,
      previous: data.comparison.income.previous,
      change: data.comparison.income.changePercent,
      increaseIsBad: false,
      format: formatBDT,
    },
    {
      label: "Expenses",
      current: data.comparison.expenses.current,
      previous: data.comparison.expenses.previous,
      change: data.comparison.expenses.changePercent,
      increaseIsBad: true,
      format: formatBDT,
    },
    {
      label: "Patients",
      current: data.comparison.patients.current,
      previous: data.comparison.patients.previous,
      change: data.comparison.patients.changePercent,
      increaseIsBad: false,
      format: (value: number) => value.toLocaleString("en-BD"),
    },
    {
      label: "Net",
      current: data.comparison.net.current,
      previous: data.comparison.net.previous,
      change: data.comparison.net.changePercent,
      increaseIsBad: false,
      format: formatBDT,
    },
  ];

  return (
    <section>
      <header className="mb-6 border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Admin analytics
        </p>
        <h2 className="mt-2 text-xl font-semibold">Monthly overview</h2>
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

      <section className="mb-8">
        <div className="border-b border-[#d9e7e3] pb-3">
          <h2 className="text-base font-semibold">Month comparison</h2>
          <p className="mt-1 text-xs text-[#69807c]">
            {data.monthLabel} vs {data.previousMonthLabel}
          </p>
        </div>
        <div className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-4">
          {comparisons.map((metric) => {
            const isUp = metric.change !== null && metric.change > 0;
            const isBad =
              metric.change !== null && (metric.increaseIsBad ? isUp : !isUp);
            return (
              <div
                key={metric.label}
                className="border-b border-[#e2ebe8] py-4"
              >
                <p className="text-xs font-medium uppercase text-[#69807c]">
                  {metric.label}
                </p>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                  <span className="font-semibold">
                    {metric.format(metric.current)}
                  </span>
                  <span className="text-[#69807c]">
                    was {metric.format(metric.previous)}
                  </span>
                </div>
                <p
                  className={`mt-2 text-xs font-semibold ${metric.change === null ? "text-[#69807c]" : isBad ? "text-[#a13f37]" : "text-[#116c61]"}`}
                >
                  {metric.change === null
                    ? "New"
                    : `${isUp ? "Up" : "Down"} ${Math.abs(metric.change).toFixed(1)}%`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <AnalyticsCharts
        daily={data.daily}
        monthly={data.monthly}
        cumulativeIncome={data.cumulativeIncome}
      />

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
