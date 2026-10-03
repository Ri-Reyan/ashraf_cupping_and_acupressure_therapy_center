import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  findActiveTherapist: vi.fn(),
  findPatientForCreate: vi.fn(),
  createPatientRecord: vi.fn(),
  updatePatientRecord: vi.fn(),
  findServiceForCreate: vi.fn(),
  createServiceRecord: vi.fn(),
  findLatestPackageAppointment: vi.fn(),
  getMaxSerialForDate: vi.fn(),
  insertAppointmentRecord: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: { transaction: mocks.transaction } }));
vi.mock("@/lib/dhaka-time", () => ({
  getDhakaToday: () => ({ toString: () => "2026-10-02" }),
}));
vi.mock("@/features/therapists/service", () => ({
  getTherapistLedgerForAppointment: vi.fn(),
}));
vi.mock("@/features/appointments/repository", () => ({
  findActiveTherapist: mocks.findActiveTherapist,
  findPatientForCreate: mocks.findPatientForCreate,
  createPatientRecord: mocks.createPatientRecord,
  updatePatientRecord: mocks.updatePatientRecord,
  findServiceForCreate: mocks.findServiceForCreate,
  createServiceRecord: mocks.createServiceRecord,
  findLatestPackageAppointment: mocks.findLatestPackageAppointment,
  getMaxSerialForDate: mocks.getMaxSerialForDate,
  insertAppointmentRecord: mocks.insertAppointmentRecord,
  countPatientVisits: vi.fn(),
  findPatientByMobile: vi.fn(),
  getAppointmentFormOptions: vi.fn(),
  listPatientSessions: vi.fn(),
}));

import { createAppointment } from "@/features/appointments/service";
import type { AppointmentCreateInput } from "@/features/appointments/schema";
import { AppointmentRuleError } from "@/features/appointments/rules";

const newInput = (
  overrides: Partial<AppointmentCreateInput> = {},
): AppointmentCreateInput => ({
  patient: {
    name: "Samira Akter",
    mobile: "01712345678",
    age: 34,
    gender: "FEMALE",
  },
  therapistId: "11111111-1111-4111-8111-111111111111",
  services: ["Acupressure"],
  fee: 1000,
  therapistPercent: 40,
  isSession: false,
  sessionMode: null,
  sessionCount: null,
  sessionGroupId: null,
  ...overrides,
});

function appointmentRows() {
  const rows: {
    id: string;
    invoiceNo: number;
    serial?: number;
    [key: string]: unknown;
  }[] = [];
  mocks.insertAppointmentRecord.mockImplementation(async (input) => {
    const created = { ...input, invoiceNo: 500 + rows.length };
    rows.push(created);
    return created;
  });
  return rows;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.transaction.mockImplementation(async (callback) => callback({}));
  mocks.findActiveTherapist.mockResolvedValue({
    id: "11111111-1111-4111-8111-111111111111",
  });
  mocks.findPatientForCreate.mockResolvedValue(null);
  mocks.createPatientRecord.mockResolvedValue({
    id: "22222222-2222-4222-8222-222222222222",
  });
  mocks.updatePatientRecord.mockResolvedValue({
    id: "22222222-2222-4222-8222-222222222222",
  });
  mocks.findServiceForCreate.mockResolvedValue({ id: "service-id" });
  mocks.createServiceRecord.mockResolvedValue({ id: "service-id" });
  mocks.findLatestPackageAppointment.mockResolvedValue(null);
  mocks.getMaxSerialForDate.mockResolvedValue({ serial: null });
  mocks.insertAppointmentRecord.mockImplementation(async (input) => ({
    ...input,
    invoiceNo: 500,
  }));
});

describe("createAppointment transaction", () => {
  it("creates a patient when the mobile is new", async () => {
    const rows = appointmentRows();
    const result = await createAppointment(newInput(), "creator-id");

    expect(mocks.createPatientRecord).toHaveBeenCalledWith(
      newInput().patient,
      expect.anything(),
    );
    expect(mocks.updatePatientRecord).not.toHaveBeenCalled();
    expect(rows[0]).toMatchObject({
      patientId: "22222222-2222-4222-8222-222222222222",
      createdById: "creator-id",
      therapistShare: 400,
    });
    expect(result.invoiceNo).toBe(500);
  });

  it("updates demographics when the mobile already belongs to a patient", async () => {
    const patient = { id: "33333333-3333-4333-8333-333333333333" };
    mocks.findPatientForCreate.mockResolvedValue(patient);
    const rows = appointmentRows();

    await createAppointment(newInput(), "creator-id");

    expect(mocks.updatePatientRecord).toHaveBeenCalledWith(
      patient.id,
      { name: "Samira Akter", age: 34, gender: "FEMALE" },
      expect.anything(),
    );
    expect(rows[0].patientId).toBe(patient.id);
  });

  it("rejects a therapist who is not active", async () => {
    mocks.findActiveTherapist.mockResolvedValue(null);

    await expect(
      createAppointment(newInput(), "creator-id"),
    ).rejects.toMatchObject({
      code: "THERAPIST_UNAVAILABLE",
    });
    expect(mocks.insertAppointmentRecord).not.toHaveBeenCalled();
  });

  it("increments the serial for consecutive appointments on the same Dhaka day", async () => {
    let maxSerial = 0;
    const rows = appointmentRows();
    mocks.findPatientForCreate.mockResolvedValue({
      id: "33333333-3333-4333-8333-333333333333",
    });
    mocks.getMaxSerialForDate.mockImplementation(async () => ({
      serial: maxSerial || null,
    }));
    mocks.insertAppointmentRecord.mockImplementation(async (input) => {
      maxSerial = input.serial;
      const created = { ...input, invoiceNo: 500 + maxSerial };
      rows.push(created);
      return created;
    });

    await createAppointment(newInput(), "creator-id");
    await createAppointment(newInput(), "creator-id");

    expect(rows.map((row) => row.serial)).toEqual([1, 2]);
  });

  it("continues the selected package using its latest count", async () => {
    const rows = appointmentRows();
    mocks.findPatientForCreate.mockResolvedValue({
      id: "33333333-3333-4333-8333-333333333333",
    });
    mocks.findLatestPackageAppointment.mockResolvedValue({
      sessionGroupId: "44444444-4444-4444-8444-444444444444",
      sessionCount: 6,
      currentCount: 2,
    });

    await createAppointment(
      newInput({
        isSession: true,
        sessionMode: "continue",
        sessionCount: null,
        sessionGroupId: "44444444-4444-4444-8444-444444444444",
      }),
      "creator-id",
    );

    expect(rows[0]).toMatchObject({
      sessionGroupId: "44444444-4444-4444-8444-444444444444",
      sessionCount: 6,
      currentCount: 3,
    });
  });

  it("rejects a completed session package", async () => {
    mocks.findPatientForCreate.mockResolvedValue({
      id: "33333333-3333-4333-8333-333333333333",
    });
    mocks.findLatestPackageAppointment.mockResolvedValue({
      sessionGroupId: "44444444-4444-4444-8444-444444444444",
      sessionCount: 2,
      currentCount: 2,
    });

    await expect(
      createAppointment(
        newInput({
          isSession: true,
          sessionMode: "continue",
          sessionCount: null,
          sessionGroupId: "44444444-4444-4444-8444-444444444444",
        }),
        "creator-id",
      ),
    ).rejects.toBeInstanceOf(AppointmentRuleError);
  });
});
