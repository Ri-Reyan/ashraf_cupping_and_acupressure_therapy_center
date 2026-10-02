// Multi-selects catalog services and accepts new service names.
// Newly typed names are added to the catalog inside appointment transaction.
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type ServiceOption = { id: string; name: string };

export function ServicePicker({
  options,
  selected,
  onChange,
}: {
  options: ServiceOption[];
  selected: string[];
  onChange: (services: string[]) => void;
}) {
  const [customName, setCustomName] = useState("");

  function toggle(name: string) {
    onChange(
      selected.includes(name)
        ? selected.filter((service) => service !== name)
        : [...selected, name],
    );
  }

  function addCustom() {
    const normalized = customName.trim();
    if (!normalized) return;
    if (!selected.includes(normalized)) onChange([...selected, normalized]);
    setCustomName("");
  }

  function handleCustomKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustom();
    }
  }

  return (
    <fieldset className="space-y-4 border-b border-[#d9e7e3] pb-6">
      <legend className="mb-4 text-sm font-semibold">Service(s)</legend>
      {options.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((service) => (
            <label
              key={service.id}
              className="flex min-h-11 items-center gap-3 border border-[#e0e9e6] px-3 text-sm hover:bg-[#f5f9f7]"
            >
              <input
                type="checkbox"
                checked={selected.includes(service.name)}
                onChange={() => toggle(service.name)}
                className="size-4 accent-[#116c61]"
              />
              <span>{service.name}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#69807c]">
          No catalog services yet. Add one below.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="min-w-0 flex-1 space-y-2 text-sm font-medium">
          <span>Type a new service</span>
          <input
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
            onKeyDown={handleCustomKeyDown}
            maxLength={120}
            className="h-11 w-full border border-[#cbdad6] bg-white px-3 outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
          />
        </label>
        <button
          type="button"
          onClick={addCustom}
          className="mt-auto flex h-11 items-center justify-center gap-2 border border-[#116c61] px-4 text-sm font-semibold text-[#116c61] hover:bg-[#edf5f1]"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add service
        </button>
      </div>

      <p className="text-xs text-[#69807c]" aria-live="polite">
        {selected.length > 0
          ? `${selected.length} selected: ${selected.join(", ")}`
          : "Select at least one service."}
      </p>
    </fieldset>
  );
}
