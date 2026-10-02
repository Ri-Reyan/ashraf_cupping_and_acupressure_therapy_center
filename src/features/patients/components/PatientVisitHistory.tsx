// Active visit history with links to the persisted invoice PDFs.
// Soft-deleted appointments are omitted from patient totals and history.
import Link from "next/link";
import { Download } from "lucide-react";
import type { PatientDetailVisit } from "../service";
import { formatBDT } from "@/lib/format";

export function PatientVisitHistory({
  visits,
}: {
  visits: PatientDetailVisit[];
}) {
  return (
    <section className="pt-7">
      <div className="flex items-center justify-between gap-3 border-b border-[#d9e7e3] pb-3">
        <h2 className="text-base font-semibold">Visits</h2>
        <span className="text-sm text-[#526965]">
          {visits.length} active visits
        </span>
      </div>

      {visits.length === 0 ? (
        <p className="py-8 text-sm text-[#69807c]">No visits recorded.</p>
      ) : (
        <div className="overflow-x-auto border-b border-[#d9e7e3]">
          <table className="w-full min-w-225 border-collapse text-left text-sm">
            <thead className="bg-[#edf4f1] text-xs uppercase text-[#526965]">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Invoice
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Service(s)
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Therapist
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Fee paid
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2ebe8]">
              {visits.map((visit) => (
                <tr key={visit.id} className="bg-white hover:bg-[#f8fbf9]">
                  <td className="px-3 py-2">
                    <Link
                      href={`/api/invoices/${visit.id}/pdf`}
                      title={`Download invoice ${visit.invoiceNo} PDF`}
                      aria-label={`Download invoice ${visit.invoiceNo} PDF`}
                      className="inline-flex min-h-10 items-center gap-2 font-medium text-[#116c61] hover:underline"
                    >
                      {visit.invoiceNo}
                      <Download aria-hidden="true" className="size-4" />
                    </Link>
                  </td>
                  <td className="px-3 py-3">{visit.date}</td>
                  <td className="max-w-80 px-3 py-3">
                    {visit.services.join(", ")}
                  </td>
                  <td className="px-3 py-3">{visit.therapistName}</td>
                  <td className="px-3 py-3 text-right">
                    {formatBDT(visit.fee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
