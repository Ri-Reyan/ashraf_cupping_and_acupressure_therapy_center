// Authenticated patient profile with visit, package, and paid-total summaries.
// ADMIN can edit/delete subject to the no-appointments delete rule.
import { notFound } from "next/navigation";
import { z } from "zod";
import { PatientProfileActions } from "@/features/patients/components/PatientProfileActions";
import { PatientSessionPackages } from "@/features/patients/components/PatientSessionPackages";
import { PatientVisitHistory } from "@/features/patients/components/PatientVisitHistory";
import { getPatientDetail } from "@/features/patients/service";
import { formatBDT } from "@/lib/format";
import { requireUser } from "@/lib/auth";

type PatientPageProps = { params: Promise<{ id: string }> };

export default async function PatientDetailPage({ params }: PatientPageProps) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const detail = await getPatientDetail(id);
  if (!detail) notFound();
  const { patient } = detail;

  return (
    <section>
      <header className="mb-6 border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Patient profile
        </p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{patient.name}</h1>
            <p className="mt-2 text-sm text-[#526965]">
              {patient.mobile} · {patient.age} years ·{" "}
              {patient.gender.toLowerCase()}
            </p>
          </div>
          {user.role === "ADMIN" && (
            <PatientProfileActions
              patient={{
                id: patient.id,
                name: patient.name,
                mobile: patient.mobile,
                age: patient.age,
                gender: patient.gender,
              }}
              hasAppointments={detail.hasAppointments}
            />
          )}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <section className="border border-[#d9e7e3] bg-white p-5">
          <p className="text-xs font-medium uppercase text-[#69807c]">
            Active visits
          </p>
          <p className="mt-2 text-xl font-semibold">{detail.visits.length}</p>
        </section>
        <section className="border border-[#b7d4cc] bg-[#edf5f1] p-5">
          <p className="text-xs font-medium uppercase text-[#526965]">
            Total amount paid
          </p>
          <p className="mt-2 text-xl font-semibold">
            {formatBDT(detail.totalPaid)}
          </p>
        </section>
        <section className="border border-[#d9e7e3] bg-white p-5">
          <p className="text-xs font-medium uppercase text-[#69807c]">
            Active packages
          </p>
          <p className="mt-2 text-xl font-semibold">
            {detail.activePackages.length}
          </p>
        </section>
      </div>

      <PatientSessionPackages packages={detail.activePackages} />
      <PatientVisitHistory visits={detail.visits} />
    </section>
  );
}
