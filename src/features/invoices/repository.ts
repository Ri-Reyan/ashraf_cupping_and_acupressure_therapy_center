// Read-only Prisma lookups needed to render an appointment invoice.
// Soft-deleted appointments are not available through the download route.
import "server-only";
import { or } from "@prisma/orm-postgres/orm-client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export function findActiveAppointment(id: string) {
  return prisma.orm.public.Appointment.where({ id })
    .where((appointment) => appointment.deletedAt.isNull())
    .first();
}

export function findInvoicePatient(id: string) {
  return prisma.orm.public.Patient.where({ id })
    .select("name", "mobile", "age", "gender")
    .first();
}

export function findInvoiceTherapist(id: string) {
  return prisma.orm.public.Therapist.where({ id }).select("name").first();
}

function appointmentQuery(patientIds?: string[]) {
  const query = prisma.orm.public.Appointment.where((appointment) =>
    appointment.deletedAt.isNull(),
  );
  return patientIds
    ? query.where((appointment) => appointment.patientId.in(patientIds))
    : query;
}

export async function searchInvoiceRecords(
  search: string,
  requestedPage: number,
) {
  let patientIds: string[] | undefined;
  if (search) {
    const pattern = `%${search}%`;
    const patients = await prisma.orm.public.Patient.where((patient) =>
      or(patient.name.ilike(pattern), patient.mobile.ilike(pattern)),
    )
      .select("id")
      .all();
    patientIds = patients.map((patient) => patient.id);
    if (patientIds.length === 0) {
      return { rows: [], total: 0, page: 1, pageCount: 1, pageSize: PAGE_SIZE };
    }
  }

  const { total } = await appointmentQuery(patientIds).aggregate(
    (aggregate) => ({
      total: aggregate.count(),
    }),
  );
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const rows = await appointmentQuery(patientIds)
    .select("id", "invoiceNo", "serialDate", "fee", "createdAt")
    .include("patient", (patient) => patient.select("name", "mobile"))
    .include("therapist", (therapist) => therapist.select("name"))
    .orderBy([
      (appointment) => appointment.createdAt.desc(),
      (appointment) => appointment.invoiceNo.desc(),
    ])
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .all();

  return { rows, total, page, pageCount, pageSize: PAGE_SIZE };
}
