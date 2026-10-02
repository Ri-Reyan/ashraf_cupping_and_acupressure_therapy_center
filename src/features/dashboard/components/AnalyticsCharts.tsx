// Responsive daily and six-month analytics charts.
// All data is aggregated server-side before reaching this client component.
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBDT } from "@/lib/format";
import type { DashboardAnalytics } from "@/lib/services/analytics";

const chartColors = {
  income: "#116c61",
  expenses: "#b34d42",
  payouts: "#bd8124",
};

function moneyTick(value: number) {
  return new Intl.NumberFormat("en-BD", {
    notation: value >= 100_000 ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AnalyticsCharts({
  daily,
  monthly,
}: Pick<DashboardAnalytics, "daily" | "monthly">) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="border border-[#d9e7e3] bg-white p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Daily income and expenses</h2>
          <p className="mt-1 text-xs text-[#69807c]">
            Current Dhaka month · BDT
          </p>
        </div>
        <div
          className="h-72 w-full"
          role="img"
          aria-label="Bar chart comparing daily income and expenses for this month"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={daily}
              margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke="#e2ebe8" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#526965", fontSize: 11 }}
              />
              <YAxis
                tickFormatter={moneyTick}
                tickLine={false}
                axisLine={false}
                width={58}
                tick={{ fill: "#526965", fontSize: 10 }}
              />
              <Tooltip formatter={(value) => formatBDT(Number(value))} />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill={chartColors.income}
                radius={[2, 2, 0, 0]}
                maxBarSize={18}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill={chartColors.expenses}
                radius={[2, 2, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="border border-[#d9e7e3] bg-white p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Six-month financial trend</h2>
          <p className="mt-1 text-xs text-[#69807c]">
            Income, expenses, and payouts · BDT
          </p>
        </div>
        <div
          className="h-72 w-full"
          role="img"
          aria-label="Line chart of income, expenses, and therapist payouts over six months"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthly}
              margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke="#e2ebe8" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#526965", fontSize: 11 }}
              />
              <YAxis
                tickFormatter={moneyTick}
                tickLine={false}
                axisLine={false}
                width={58}
                tick={{ fill: "#526965", fontSize: 10 }}
              />
              <Tooltip formatter={(value) => formatBDT(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke={chartColors.income}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke={chartColors.expenses}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="payouts"
                name="Payouts"
                stroke={chartColors.payouts}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
