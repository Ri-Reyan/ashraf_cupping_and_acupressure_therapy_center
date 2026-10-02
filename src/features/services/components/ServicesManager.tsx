// Client controls for adding, renaming, and removing catalog entries.
// Server Actions remain responsible for admin authorization and validation.
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { addService, removeService, updateService } from "../actions";

type ServiceItem = { id: string; name: string };

export function ServicesManager({
  initialServices,
}: {
  initialServices: ServiceItem[];
}) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await addService({ name });
      if (!result.ok) setError(result.error);
      else {
        setName("");
        router.refresh();
      }
    } catch {
      setError("Unable to add the service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    setPending(true);
    setError("");
    try {
      const result = await updateService({ id: editingId, name: editingName });
      if (!result.ok) setError(result.error);
      else {
        setEditingId(null);
        router.refresh();
      }
    } catch {
      setError("Unable to rename the service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleRemove(service: ServiceItem) {
    if (!window.confirm(`Delete “${service.name}” from the service list?`))
      return;
    setPending(true);
    setError("");
    try {
      const result = await removeService({ id: service.id });
      if (!result.ok) setError(result.error);
      else router.refresh();
    } catch {
      setError("Unable to remove the service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-7">
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 border-b border-[#d9e7e3] pb-6 sm:flex-row"
      >
        <label className="min-w-0 flex-1 space-y-2 text-sm font-medium">
          <span>Add service</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            required
            placeholder="e.g. Acupressure therapy"
            className="h-11 w-full border border-[#cbdad6] bg-white px-3 outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-auto flex h-11 items-center justify-center gap-2 bg-[#116c61] px-4 text-sm font-semibold text-white hover:bg-[#0d5d53] disabled:opacity-60"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add service
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="border border-[#e7c7c2] bg-[#fbf2f0] px-3 py-2 text-sm text-[#9b3f35]"
        >
          {error}
        </p>
      )}

      {initialServices.length === 0 ? (
        <p className="py-8 text-sm text-[#69807c]">
          No services have been added yet.
        </p>
      ) : (
        <ul className="divide-y divide-[#e2ebe8]">
          {initialServices.map((service) => (
            <li
              key={service.id}
              className="flex min-h-16 items-center gap-3 py-3"
            >
              {editingId === service.id ? (
                <form
                  onSubmit={handleRename}
                  className="flex min-w-0 flex-1 items-center gap-2"
                >
                  <label className="sr-only" htmlFor={`service-${service.id}`}>
                    Rename {service.name}
                  </label>
                  <input
                    id={`service-${service.id}`}
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    maxLength={120}
                    required
                    autoFocus
                    className="h-10 min-w-0 flex-1 border border-[#cbdad6] px-3 outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    title="Save name"
                    className="grid size-10 place-items-center text-[#116c61] hover:bg-[#edf5f1] disabled:opacity-60"
                  >
                    <Check aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Cancel rename"
                    onClick={() => setEditingId(null)}
                    className="grid size-10 place-items-center text-[#526965] hover:bg-[#f1f5f4]"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </form>
              ) : (
                <>
                  <span className="min-w-0 flex-1 text-sm font-medium">
                    {service.name}
                  </span>
                  <button
                    type="button"
                    title={`Rename ${service.name}`}
                    disabled={pending}
                    onClick={() => {
                      setEditingId(service.id);
                      setEditingName(service.name);
                      setError("");
                    }}
                    className="grid size-10 place-items-center text-[#526965] hover:bg-[#f1f5f4] disabled:opacity-60"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    type="button"
                    title={`Delete ${service.name}`}
                    disabled={pending}
                    onClick={() => handleRemove(service)}
                    className="grid size-10 place-items-center text-[#9b3f35] hover:bg-[#fbf2f0] disabled:opacity-60"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
