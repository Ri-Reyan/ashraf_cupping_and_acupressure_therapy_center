// Shared today reconciliation for ADMIN and RECEPTIONIST.
// Income, expenses, and therapist payouts remain separate ledger categories.
import type { TodayDashboardSummary } from "@/lib/services/analytics";
import { formatBDT } from "@/lib/format";
import { TodayExpenseForm } from "./TodayExpenseForm";

export function DashboardToday({ data }: { data: TodayDashboardSummary }) {
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#d9e7e3] pb-3">
        <div>
          <h2 className="text-lg font-semibold">Today</h2>
          <p className="mt-1 text-sm text-[#69807c]">
            {data.date} · Asia/Dhaka
          </p>
        </div>
      </header>

      <dl className="grid grid-cols-2 border-y border-[#d9e7e3] sm:grid-cols-4">
        <div className="border-b border-r border-[#e2ebe8] px-4 py-4 sm:px-5">
          <dt className="text-xs font-medium uppercase text-[#69807c]">
            Income
          </dt>
          <dd className="mt-2 text-lg font-semibold text-[#116c61]">
            {formatBDT(data.income)}
          </dd>
        </div>
        <div className="border-b border-r border-[#e2ebe8] px-4 py-4 sm:px-5">
          <dt className="text-xs font-medium uppercase text-[#69807c]">
            Expenses
          </dt>
          <dd className="mt-2 text-lg font-semibold text-[#a13f37]">
            {formatBDT(data.expenses)}
          </dd>
        </div>
        <div className="border-b border-r border-[#e2ebe8] px-4 py-4 sm:px-5">
          <dt className="text-xs font-medium uppercase text-[#69807c]">
            Therapist payouts
          </dt>
          <dd className="mt-2 text-lg font-semibold text-[#a3691c]">
            {formatBDT(data.payouts)}
          </dd>
        </div>
        <div className="border-b border-[#e2ebe8] bg-[#edf5f1] px-4 py-4 sm:px-5">
          <dt className="text-xs font-medium uppercase text-[#526965]">
            Today's closing
          </dt>
          <dd
            className={`mt-2 text-lg font-semibold ${data.closing < 0 ? "text-[#a13f37]" : "text-[#116c61]"}`}
          >
            {formatBDT(data.closing)}
          </dd>
        </div>
      </dl>

      <section>
        <div className="flex items-center justify-between gap-3 border-b border-[#d9e7e3] pb-3">
          <h3 className="text-base font-semibold">Appointments</h3>
          <span className="text-sm text-[#526965]">
            {data.appointments.length}
          </span>
        </div>
        {data.appointments.length === 0 ? (
          <p className="py-6 text-sm text-[#69807c]">
            No appointments recorded today.
          </p>
        ) : (
          <div className="overflow-x-auto border-b border-[#d9e7e3]">
            <table className="w-full min-w-225 border-collapse text-left text-sm">
              <thead className="bg-[#edf4f1] text-xs uppercase text-[#526965]">
                <tr>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Serial
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Patient
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Therapist
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Service
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-right font-semibold"
                  >
                    Fee
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Created by
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2ebe8]">
                {data.appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="bg-white hover:bg-[#f8fbf9]"
                  >
                    <td className="px-3 py-3 font-semibold">
                      {appointment.serial}
                    </td>
                    <td className="px-3 py-3">{appointment.patient}</td>
                    <td className="px-3 py-3">{appointment.therapist}</td>
                    <td className="px-3 py-3">{appointment.service}</td>
                    <td className="px-3 py-3 text-right">
                      {formatBDT(appointment.fee)}
                    </td>
                    <td className="px-3 py-3">{appointment.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <section>
          <div className="border-b border-[#d9e7e3] pb-3">
            <h3 className="text-base font-semibold">Today's expenses</h3>
          </div>
          {data.expenseRows.length === 0 ? (
            <p className="py-4 text-sm text-[#69807c]">
              No expenses recorded today.
            </p>
          ) : (
            <ul className="divide-y divide-[#e2ebe8]">
              {data.expenseRows.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {expense.name}
                    </span>
                    <span className="mt-1 block text-xs text-[#69807c]">
                      {expense.createdBy}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold">
                    {formatBDT(expense.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <TodayExpenseForm date={data.date} />
        </section>

        <section>
          <div className="flex items-center justify-between gap-3 border-b border-[#d9e7e3] pb-3">
            <h3 className="text-base font-semibold">
              Today's therapist payouts
            </h3>
            <span className="text-sm font-semibold text-[#a3691c]">
              {formatBDT(data.payouts)}
            </span>
          </div>
          {data.payoutRows.length === 0 ? (
            <p className="py-4 text-sm text-[#69807c]">
              No therapist payouts recorded today.
            </p>
          ) : (
            <ul className="divide-y divide-[#e2ebe8]">
              {data.payoutRows.map((payout) => (
                <li
                  key={payout.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <span>{payout.therapist}</span>
                  <span className="font-semibold">
                    {formatBDT(payout.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
