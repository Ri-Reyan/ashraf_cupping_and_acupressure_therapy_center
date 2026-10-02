// Interactive reception form coordinating patient lookup and appointment entry.
// Mutations and lookup always go through authenticated Server Actions.
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createAppointmentAction, lookupPatient } from "../actions";
import { AppointmentSuccess } from "./AppointmentSuccess";
import { AppointmentTerms } from "./AppointmentTerms";
import { PatientFields } from "./PatientFields";
import { ServicePicker } from "./ServicePicker";
import { SessionOptions, type OpenSessionPackage } from "./SessionOptions";
import { BD_MOBILE_PATTERN, normalizeBdMobile } from "@/lib/mobile";

type Option = { id: string; name: string };
type Gender = "MALE" | "FEMALE" | "OTHER";

export function AppointmentForm({
  services,
  therapists,
}: {
  services: Option[];
  therapists: Option[];
}) {
  const [patient, setPatient] = useState({
    name: "",
    mobile: "",
    age: "",
    gender: "OTHER" as Gender,
  });
  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "searching" | "found" | "new" | "failed"
  >("idle");
  const [previousVisits, setPreviousVisits] = useState<number | null>(null);
  const [openPackages, setOpenPackages] = useState<OpenSessionPackage[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [therapistId, setTherapistId] = useState("");
  const [fee, setFee] = useState("");
  const [therapistPercent, setTherapistPercent] = useState("");
  const [isSession, setIsSession] = useState(false);
  const [sessionMode, setSessionMode] = useState<"new" | "continue">("new");
  const [sessionCount, setSessionCount] = useState("");
  const [sessionGroupId, setSessionGroupId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{
    id: string;
    invoiceNo: number;
  } | null>(null);

  useEffect(() => {
    if (!BD_MOBILE_PATTERN.test(normalizeBdMobile(patient.mobile))) return;
    let active = true;
    const timer = setTimeout(() => {
      void lookupPatient({ mobile: patient.mobile })
        .then((result) => {
          if (!active || !result.ok) {
            if (active) setLookupStatus("failed");
            return;
          }
          if (!result.data) {
            setPreviousVisits(0);
            setOpenPackages([]);
            setLookupStatus("new");
            return;
          }

          const {
            patient: found,
            previousVisits: visits,
            openPackages: packages,
          } = result.data;
          setPatient({
            name: found.name,
            mobile: found.mobile,
            age: String(found.age),
            gender: found.gender,
          });
          setPreviousVisits(visits);
          setOpenPackages(packages);
          setSessionGroupId("");
          setSessionMode("new");
          setLookupStatus("found");
        })
        .catch(() => {
          if (active) setLookupStatus("failed");
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [patient.mobile]);

  function handlePatientChange(
    field: "name" | "mobile" | "age" | "gender",
    value: string,
  ) {
    if (field === "mobile") {
      setPatient({ name: "", mobile: value, age: "", gender: "OTHER" });
      setPreviousVisits(null);
      setOpenPackages([]);
      setSessionGroupId("");
      setSessionMode("new");
      setLookupStatus(
        BD_MOBILE_PATTERN.test(normalizeBdMobile(value)) ? "searching" : "idle",
      );
      return;
    }
    if (field === "gender") {
      if (value === "MALE" || value === "FEMALE" || value === "OTHER") {
        setPatient((current) => ({ ...current, gender: value }));
      }
      return;
    }
    setPatient((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await createAppointmentAction({
        patient: { ...patient, age: Number(patient.age) },
        therapistId,
        services: selectedServices,
        fee: Number(fee),
        therapistPercent: Number(therapistPercent),
        isSession,
        sessionMode: isSession ? sessionMode : null,
        sessionCount:
          isSession && sessionMode === "new" ? Number(sessionCount) : null,
        sessionGroupId:
          isSession && sessionMode === "continue" ? sessionGroupId : null,
      });
      if (!result.ok) setError(result.error);
      else setCreated(result.data);
    } catch {
      setError("Could not create the appointment. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (created)
    return (
      <AppointmentSuccess
        appointmentId={created.id}
        invoiceNo={created.invoiceNo}
      />
    );

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <PatientFields {...patient} onChange={handlePatientChange} />
      <p aria-live="polite" className="-mt-4 text-xs text-[#526965]">
        {lookupStatus === "searching" && "Checking patient history..."}
        {lookupStatus === "found" && `${previousVisits} previous visits found.`}
        {lookupStatus === "new" &&
          "New patient. Details will be saved with this appointment."}
        {lookupStatus === "failed" &&
          "Patient history could not be checked. You can still continue."}
      </p>
      <ServicePicker
        options={services}
        selected={selectedServices}
        onChange={setSelectedServices}
      />
      <SessionOptions
        enabled={isSession}
        onEnabledChange={setIsSession}
        mode={sessionMode}
        onModeChange={setSessionMode}
        sessionCount={sessionCount}
        onSessionCountChange={setSessionCount}
        sessionGroupId={sessionGroupId}
        onSessionGroupChange={setSessionGroupId}
        packages={openPackages}
      />
      <AppointmentTerms
        therapists={therapists}
        therapistId={therapistId}
        fee={fee}
        therapistPercent={therapistPercent}
        onChange={(field, value) => {
          if (field === "therapistId") setTherapistId(value);
          if (field === "fee") setFee(value);
          if (field === "therapistPercent") setTherapistPercent(value);
        }}
      />
      {therapists.length === 0 && (
        <p role="status" className="text-sm text-[#9b3f35]">
          No active therapists are available for appointment booking.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="border border-[#e7c7c2] bg-[#fbf2f0] px-3 py-2 text-sm text-[#9b3f35]"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={
          pending || therapists.length === 0 || selectedServices.length === 0
        }
        className="flex min-h-11 items-center justify-center bg-[#116c61] px-5 text-sm font-semibold text-white hover:bg-[#0d5d53] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Saving appointment..." : "Create appointment"}
      </button>
    </form>
  );
}
