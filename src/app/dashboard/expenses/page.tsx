// Authenticated expense ledger for ADMIN and RECEPTIONIST.
// The selected month is read from the URL and calculated in Dhaka local time.
import { ExpenseManager } from "@/features/expenses/components/ExpenseManager";
import { getExpenseMonth } from "@/features/expenses/service";
import { requireUser } from "@/lib/auth";

type ExpensesPageProps = {
  searchParams: Promise<{ month?: string | string[] }>;
};

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const month = typeof params.month === "string" ? params.month : "";
  const result = await getExpenseMonth(month, user.role);

  return (
    <section>
      <header className="mb-6 border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Ledger
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Expenses</h1>
      </header>
      <ExpenseManager {...result} />
    </section>
  );
}
