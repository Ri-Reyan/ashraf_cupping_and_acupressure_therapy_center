// Admin-only route for managing the clinic's selectable service catalog.
// Reads are kept here; mutations live in features/services/actions.ts.
import { ServicesManager } from "@/features/services/components/ServicesManager";
import { listServices } from "@/features/services/repository";
import { requireRole } from "@/lib/auth";

export default async function ServicesPage() {
  await requireRole("ADMIN");
  const services = await listServices();

  return (
    <section>
      <header className="mb-6 border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Catalog
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Services</h1>
      </header>
      <ServicesManager
        initialServices={services.map(({ id, name }) => ({ id, name }))}
      />
    </section>
  );
}
