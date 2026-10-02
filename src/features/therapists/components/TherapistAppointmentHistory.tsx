// Paginated active appointment history for one therapist.
// The table shows persisted invoice, patient, service, fee, and share data.
import Link from "next/link";
import type { TherapistDetailAppointment } from "../service";
import { formatBDT } from "@/lib/format";

function pageHref(therapistId: string, page: number) {
  return page > 1
    ? `/dashboard/therapists/${therapistId}?page=${page}`
    : `/dashboard/therapists/${therapistId}`;
}

export function TherapistAppointmentHistory({
  therapistId,
  appointments,
  page,
  pageCount,
  total,
  pageSize,
}: {
  therapistId: string;
  appointments: TherapistDetailAppointment[];
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
}) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <section className="pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Appointments</h2>
        <p className="text-sm text-[#526965]">
          {total === 0
            ? "No appointments"
            : `Showing ${first}–${last} of ${total}`}
        </p>
      </div>

      {appointments.length === 0 ? (
        <p className="py-8 text-sm text-[#69807c]">
          No active appointments recorded.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto border-y border-[#d9e7e3]">
          <table className="w-full min-w-225 border-collapse text-left text-sm">
            <thead className="bg-[#edf4f1] text-xs uppercase text-[#526965]">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Invoice no
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Patient
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Service(s)
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Fee
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Therapist share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2ebe8]">
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="bg-white hover:bg-[#f8fbf9]"
                >
                  <td className="px-3 py-3 font-semibold">
                    {appointment.invoiceNo}
                  </td>
                  <td className="px-3 py-3">{appointment.date}</td>
                  <td className="px-3 py-3">{appointment.patientName}</td>
                  <td className="max-w-72 px-3 py-3">
                    {appointment.services.join(", ")}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatBDT(appointment.fee)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatBDT(appointment.therapistShare)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav
          aria-label="Therapist appointment pages"
          className="flex items-center justify-between border-b border-[#d9e7e3] py-3"
        >
          <Link
            href={pageHref(therapistId, page - 1)}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={`min-h-11 px-3 py-3 text-sm font-medium ${page <= 1 ? "pointer-events-none text-[#9aa9a5]" : "text-[#116c61] hover:bg-[#edf5f1]"}`}
          >
            Previous
          </Link>
          <span className="text-sm text-[#526965]">
            Page {page} of {pageCount}
          </span>
          <Link
            href={pageHref(therapistId, page + 1)}
            aria-disabled={page >= pageCount}
            tabIndex={page >= pageCount ? -1 : undefined}
            className={`min-h-11 px-3 py-3 text-sm font-medium ${page >= pageCount ? "pointer-events-none text-[#9aa9a5]" : "text-[#116c61] hover:bg-[#edf5f1]"}`}
          >
            Next
          </Link>
        </nav>
      )}
    </section>
  );
}
