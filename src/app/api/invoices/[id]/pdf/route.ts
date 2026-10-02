// Authenticated invoice PDF download for persisted appointments.
// PDF rendering and database access run in the Node.js route runtime.
import { renderToBuffer } from "@react-pdf/renderer";
import { buildInvoicePdfDocument } from "@/features/invoices/components/InvoicePdfDocument";
import { getInvoiceData } from "@/features/invoices/service";
import { requireRole } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole("ADMIN");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return new Response("Invoice not found", { status: 404 });
  }
  const invoice = await getInvoiceData(id);
  if (!invoice) return new Response("Invoice not found", { status: 404 });

  const document = buildInvoicePdfDocument({
    invoice,
    clinic: {
      name: process.env.CLINIC_NAME || "Acupressure Clinic",
      address: process.env.CLINIC_ADDRESS || "",
      phone: process.env.CLINIC_PHONE || "",
    },
  });
  const buffer = await renderToBuffer(document);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNo}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
