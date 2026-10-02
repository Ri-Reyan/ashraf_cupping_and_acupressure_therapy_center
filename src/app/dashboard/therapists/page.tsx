// ADMIN-only therapist grid with reversible inactive/deleted view.
// Profile balances are calculated from appointments and payout records.
import { TherapistManager } from "@/features/therapists/components/TherapistManager";
import { listTherapistsWithBalances } from "@/features/therapists/service";
import { requireRole } from "@/lib/auth";

type TherapistsPageProps = {
  searchParams: Promise<{ showDeleted?: string | string[] }>;
};

export default async function TherapistsPage({
  searchParams,
}: TherapistsPageProps) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const showDeleted = params.showDeleted === "1";
  const therapists = await listTherapistsWithBalances(showDeleted);

  return (
    <section>
      <header className="mb-6 border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Team
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Therapists</h1>
      </header>
      <TherapistManager
        showDeleted={showDeleted}
        therapists={therapists.map(
          ({
            id,
            name,
            mobile,
            age,
            gender,
            location,
            education,
            balance,
          }) => ({
            id,
            name,
            mobile,
            age,
            gender,
            location,
            education,
            balance,
          }),
        )}
      />
    </section>
  );
}
