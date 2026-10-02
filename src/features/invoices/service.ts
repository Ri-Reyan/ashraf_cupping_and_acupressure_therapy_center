// Assembles the persisted appointment and related names for invoice rendering.
// Presentation-specific PDF generation stays in the API route/component.
import "server-only";
import {
  findActiveAppointment,
  findInvoicePatient,
  findInvoiceTherapist,
  searchInvoiceRecords,
} from "./repository";

export type InvoiceData = {
  id: string;
  invoiceNo: number;
  serialDate: string;
  services: string[];
  isSession: boolean;
  currentCount: number | null;
  sessionCount: number | null;
  fee: number;
  patient: {
    name: string;
    mobile: string;
    age: number;
    gender: "MALE" | "FEMALE" | "OTHER";
  };
  therapistName: string;
};

export async function getInvoiceData(id: string): Promise<InvoiceData | null> {
  const appointment = await findActiveAppointment(id);
  if (!appointment) return null;

  const [patient, therapist] = await Promise.all([
    findInvoicePatient(appointment.patientId),
    findInvoiceTherapist(appointment.therapistId),
  ]);
  if (!patient || !therapist) return null;

  return {
    id: appointment.id,
    invoiceNo: appointment.invoiceNo,
    serialDate: appointment.serialDate.toString(),
    services: [...(appointment.services ?? [])],
    isSession: appointment.isSession,
    currentCount: appointment.currentCount,
    sessionCount: appointment.sessionCount,
    fee: appointment.fee,
    patient,
    therapistName: therapist.name,
  };
}

export type InvoiceSearchRow = {
  id: string;
  invoiceNo: number;
  date: string;
  patientName: string;
  mobile: string;
  therapistName: string;
  fee: number;
};

export async function searchInvoices(search: string, requestedPage: number) {
  const normalizedSearch = search.trim().slice(0, 120);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const result = await searchInvoiceRecords(normalizedSearch, page);

  return {
    search: normalizedSearch,
    total: result.total,
    page: result.page,
    pageCount: result.pageCount,
    pageSize: result.pageSize,
    rows: result.rows.flatMap((row): InvoiceSearchRow[] => {
      if (!row.patient || !row.therapist) return [];
      return [
        {
          id: row.id,
          invoiceNo: row.invoiceNo,
          date: row.serialDate.toString(),
          patientName: row.patient.name,
          mobile: row.patient.mobile,
          therapistName: row.therapist.name,
          fee: row.fee,
        },
      ];
    }),
  };
}
