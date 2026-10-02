// Confirmation panel shown after the appointment transaction commits.
// The PDF link uses the persisted appointment ID, never a client-built invoice.
import Link from "next/link";
import { Download, ReceiptText } from "lucide-react";

export function AppointmentSuccess({
  appointmentId,
  invoiceNo,
}: {
  appointmentId: string;
  invoiceNo: number;
}) {
  return (
    <section
      className="border border-[#c9e3da] bg-white p-6 md:p-8"
      role="status"
    >
      <div className="flex size-11 items-center justify-center bg-[#edf5f1] text-[#116c61]">
        <ReceiptText aria-hidden="true" className="size-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">Appointment recorded</h2>
      <p className="mt-2 text-sm text-[#526965]">
        Invoice number <span className="font-semibold">{invoiceNo}</span>
      </p>
      <Link
        href={`/api/invoices/${appointmentId}/pdf`}
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 bg-[#116c61] px-4 text-sm font-semibold text-white hover:bg-[#0d5d53]"
      >
        <Download aria-hidden="true" className="size-4" />
        Download invoice PDF
      </Link>
    </section>
  );
}
