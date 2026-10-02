// ADMIN-only therapist balance, payout, and appointment-history page.
// All lifetime figures are calculated from appointment and payout records.
import Link from "next/link";
import { notFound } from "next/navigation";
import { TherapistAppointmentHistory } from "@/features/therapists/components/TherapistAppointmentHistory";
import { TherapistPaymentHistory } from "@/features/therapists/components/TherapistPaymentHistory";
import { TherapistPayoutForm } from "@/features/therapists/components/TherapistPayoutForm";
import { getTherapistDetail } from "@/features/therapists/service";
import { formatBDT } from "@/lib/format";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

type TherapistPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function TherapistDetailPage({
  params,
  searchParams,
}: TherapistPageProps) {
  await requireRole("ADMIN");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const query = await searchParams;
  const pageValue = typeof query.page === "string" ? Number(query.page) : 1;
  const requestedPage =
    Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const data = await getTherapistDetail(id, requestedPage);
  if (!data) notFound();

  return (
    <section>
      <Link
        href="/dashboard/therapists"
        className="text-sm font-medium text-[#116c61] hover:underline"
      >
        Back to therapists
      </Link>
      <header className="mb-6 mt-4 border-b border-[#d9e7e3] pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
              Therapist account
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              {data.therapist.name}
            </h1>
            <p className="mt-1 text-sm text-[#526965]">
              {data.therapist.mobile}
            </p>
          </div>
          {data.therapist.status === "BLOCKED" && (
            <span className="border border-[#e7c7c2] px-3 py-2 text-sm font-medium text-[#9b3f35]">
              Deleted / inactive
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <section className="border border-[#d9e7e3] bg-white p-5">
          <p className="text-xs font-medium uppercase text-[#69807c]">
            Lifetime earnings
          </p>
          <p className="mt-2 text-xl font-semibold">
            {formatBDT(data.lifetime)}
          </p>
        </section>
        <section className="border border-[#b7d4cc] bg-[#edf5f1] p-5">
          <p className="text-xs font-medium uppercase text-[#526965]">
            Current balance
          </p>
          <p className="mt-2 text-xl font-semibold">
            {formatBDT(data.balance)}
          </p>
        </section>
        <section className="border border-[#d9e7e3] bg-white p-5">
          <p className="text-xs font-medium uppercase text-[#69807c]">
            Total paid
          </p>
          <p className="mt-2 text-xl font-semibold">{formatBDT(data.paid)}</p>
        </section>
      </div>

      <TherapistPayoutForm therapistId={id} balance={data.balance} />
      <TherapistPaymentHistory payouts={data.payouts} />
      <TherapistAppointmentHistory
        therapistId={id}
        appointments={data.appointments}
        page={data.page}
        pageCount={data.pageCount}
        total={data.totalAppointments}
        pageSize={data.pageSize}
      />
    </section>
  );
}
