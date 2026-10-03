// ADMIN-only staff account management route.
// Blocked users remain in the database for historical created-by relations.
import { StaffManager } from "@/features/staff/components/StaffManager";
import { listStaffRecords } from "@/features/staff/repository";
import { requireRole } from "@/lib/auth";

type StaffPageProps = {
  searchParams: Promise<{ showBlocked?: string | string[] }>;
};

export default async function StaffPage({ searchParams }: StaffPageProps) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const showBlocked = params.showBlocked === "1";
  const staff = await listStaffRecords(showBlocked);

  return (
    <section>
      <header className="mb-6 border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Administration
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Staff</h1>
      </header>
      <StaffManager staff={staff} showBlocked={showBlocked} />
    </section>
  );
}
