// Conditional package fields shown when an appointment is a session.
// Continue options are limited to the patient's incomplete active packages.

export type OpenSessionPackage = {
  sessionGroupId: string;
  sessionCount: number;
  currentCount: number;
  label: string;
};

export function SessionOptions({
  enabled,
  onEnabledChange,
  mode,
  onModeChange,
  sessionCount,
  onSessionCountChange,
  sessionGroupId,
  onSessionGroupChange,
  packages,
}: {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  mode: "new" | "continue";
  onModeChange: (mode: "new" | "continue") => void;
  sessionCount: string;
  onSessionCountChange: (value: string) => void;
  sessionGroupId: string;
  onSessionGroupChange: (value: string) => void;
  packages: OpenSessionPackage[];
}) {
  return (
    <fieldset className="space-y-4 border-b border-[#d9e7e3] pb-6">
      <legend className="mb-4 text-sm font-semibold">Session package</legend>
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
          className="size-4 accent-[#116c61]"
        />
        This appointment is part of a session package
      </label>

      {enabled && (
        <div className="space-y-4 border-l-2 border-[#b7d4cc] pl-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex min-h-11 items-center gap-3 border border-[#e0e9e6] px-3 text-sm">
              <input
                type="radio"
                name="session-mode"
                value="new"
                checked={mode === "new"}
                onChange={() => onModeChange("new")}
                className="size-4 accent-[#116c61]"
              />
              Start a new package
            </label>
            <label className="flex min-h-11 items-center gap-3 border border-[#e0e9e6] px-3 text-sm">
              <input
                type="radio"
                name="session-mode"
                value="continue"
                checked={mode === "continue"}
                disabled={packages.length === 0}
                onChange={() => onModeChange("continue")}
                className="size-4 accent-[#116c61]"
              />
              Continue an existing package
            </label>
          </div>

          {mode === "new" ? (
            <label className="block max-w-xs space-y-2 text-sm font-medium">
              <span>Total sessions in package</span>
              <input
                type="number"
                required
                min={1}
                max={100}
                step={1}
                value={sessionCount}
                onChange={(event) => onSessionCountChange(event.target.value)}
                className="h-11 w-full border border-[#cbdad6] bg-white px-3 outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
              />
            </label>
          ) : packages.length > 0 ? (
            <label className="block max-w-xl space-y-2 text-sm font-medium">
              <span>Existing package</span>
              <select
                required
                value={sessionGroupId}
                onChange={(event) => onSessionGroupChange(event.target.value)}
                className="h-11 w-full border border-[#cbdad6] bg-white px-3 outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
              >
                <option value="">Choose a package</option>
                {packages.map((session) => (
                  <option
                    key={session.sessionGroupId}
                    value={session.sessionGroupId}
                  >
                    {session.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-sm text-[#69807c]">
              Look up an existing patient with an unfinished package to continue
              one.
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
