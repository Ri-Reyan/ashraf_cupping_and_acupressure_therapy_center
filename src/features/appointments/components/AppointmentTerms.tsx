// Therapist and integer BDT fields for a new appointment.
// Option rows are serialized by the dashboard page before rendering.

type Option = { id: string; name: string };
const inputClass =
  "h-11 w-full border border-[#cbdad6] bg-white px-3 text-sm outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]";

export function AppointmentTerms({
  therapists,
  therapistId,
  fee,
  therapistPercent,
  onChange,
}: {
  therapists: Option[];
  therapistId: string;
  fee: string;
  therapistPercent: string;
  onChange: (
    field: "therapistId" | "fee" | "therapistPercent",
    value: string,
  ) => void;
}) {
  return (
    <fieldset className="grid gap-4 border-b border-[#d9e7e3] pb-6 sm:grid-cols-3">
      <legend className="mb-4 text-sm font-semibold">
        Appointment details
      </legend>
      <label className="space-y-2 text-sm font-medium sm:col-span-3">
        <span>Therapist</span>
        <select
          required
          value={therapistId}
          onChange={(event) => onChange("therapistId", event.target.value)}
          className={inputClass}
        >
          <option value="">Choose an active therapist</option>
          {therapists.map((therapist) => (
            <option key={therapist.id} value={therapist.id}>
              {therapist.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>Fee (BDT)</span>
        <input
          type="number"
          required
          min={1}
          step={1}
          value={fee}
          onChange={(event) => onChange("fee", event.target.value)}
          className={inputClass}
        />
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>Therapist percent</span>
        <input
          type="number"
          required
          min={0}
          max={100}
          step={1}
          value={therapistPercent}
          onChange={(event) => onChange("therapistPercent", event.target.value)}
          className={inputClass}
        />
      </label>
    </fieldset>
  );
}
