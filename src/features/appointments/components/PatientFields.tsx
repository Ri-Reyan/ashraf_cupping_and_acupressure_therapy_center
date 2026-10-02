// Patient details section for the appointment form.
// Mobile lookup and record matching are orchestrated by AppointmentForm.

type Gender = "MALE" | "FEMALE" | "OTHER";
type PatientFieldsProps = {
  name: string;
  mobile: string;
  age: string;
  gender: Gender;
  onChange: (
    field: "name" | "mobile" | "age" | "gender",
    value: string,
  ) => void;
};

const inputClass =
  "h-11 w-full border border-[#cbdad6] bg-white px-3 text-sm outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]";

export function PatientFields({
  name,
  mobile,
  age,
  gender,
  onChange,
}: PatientFieldsProps) {
  return (
    <fieldset className="grid gap-4 border-b border-[#d9e7e3] pb-6 sm:grid-cols-2">
      <legend className="mb-4 text-sm font-semibold">Patient</legend>
      <label className="space-y-2 text-sm font-medium">
        <span>Mobile</span>
        <input
          type="tel"
          required
          autoComplete="tel"
          value={mobile}
          onChange={(event) => onChange("mobile", event.target.value)}
          placeholder="01XXXXXXXXX"
          className={inputClass}
        />
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>Patient name</span>
        <input
          required
          maxLength={120}
          autoComplete="name"
          value={name}
          onChange={(event) => onChange("name", event.target.value)}
          className={inputClass}
        />
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>Age</span>
        <input
          type="number"
          required
          min={0}
          max={130}
          step={1}
          value={age}
          onChange={(event) => onChange("age", event.target.value)}
          className={inputClass}
        />
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>Gender</span>
        <select
          required
          value={gender}
          onChange={(event) => onChange("gender", event.target.value)}
          className={inputClass}
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
    </fieldset>
  );
}
