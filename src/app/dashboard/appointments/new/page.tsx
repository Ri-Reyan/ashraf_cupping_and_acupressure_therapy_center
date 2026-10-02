// New-appointment route: load picker options and render the feature form.
// The dashboard shell and every Server Action independently verify staff auth.
import { AppointmentForm } from "@/features/appointments/components/AppointmentForm";
import { getAppointmentOptions } from "@/features/appointments/service";
import { requireUser } from "@/lib/auth";

export default async function NewAppointmentPage() {
  await requireUser();
  const options = await getAppointmentOptions();

  return (
    <section>
      <header className="mb-6 border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Reception
        </p>
        <h1 className="mt-2 text-2xl font-semibold">New appointment</h1>
        <p className="mt-2 text-sm text-[#69807c]">
          Record the patient visit and payment details.
        </p>
      </header>
      <AppointmentForm
        services={options.services}
        therapists={options.therapists}
      />
    </section>
  );
}
