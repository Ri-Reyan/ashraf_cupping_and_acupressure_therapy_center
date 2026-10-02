// Recorded payout date and amount history for one therapist.
// Payout rows remain visible when a therapist is inactive.
import { formatBDT } from "@/lib/format";

export function TherapistPaymentHistory({
  payouts,
}: {
  payouts: { id: string; date: string; amount: number }[];
}) {
  return (
    <section className="border-y border-[#d9e7e3] py-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Payment history</h2>
        <span className="text-sm text-[#526965]">{payouts.length} payouts</span>
      </div>
      {payouts.length === 0 ? (
        <p className="py-6 text-sm text-[#69807c]">No payouts recorded.</p>
      ) : (
        <div className="mt-3 divide-y divide-[#e2ebe8]">
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <time>{payout.date.replace("T", " ").slice(0, 16)}</time>
              <span className="font-semibold">{formatBDT(payout.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
