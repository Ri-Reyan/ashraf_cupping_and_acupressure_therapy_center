// Authenticated patient directory route for ADMIN and RECEPTIONIST.
// Search and pagination state is reflected in the URL query parameters.
import { PatientDirectory } from "@/features/patients/components/PatientDirectory";
import { searchPatients } from "@/features/patients/service";
import { requireUser } from "@/lib/auth";

type PatientsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

export default async function PatientsPage({
  searchParams,
}: PatientsPageProps) {
  await requireUser();
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const value = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(value) && value > 0 ? value : 1;
  const result = await searchPatients(search, page);

  return (
    <section>
      <header className="mb-6 border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Records
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Patients</h1>
      </header>
      <PatientDirectory {...result} />
    </section>
  );
}
