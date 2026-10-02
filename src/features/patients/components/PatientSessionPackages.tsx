// Shows unfinished session packages and their recorded progress.
// Each row reflects the latest active appointment in that package.
import type { PatientSessionPackage } from "../service";

export function PatientSessionPackages({
  packages,
}: {
  packages: PatientSessionPackage[];
}) {
  return (
    <section className="border-y border-[#d9e7e3] py-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Active session packages</h2>
        <span className="text-sm text-[#526965]">{packages.length}</span>
      </div>
      {packages.length === 0 ? (
        <p className="py-5 text-sm text-[#69807c]">
          No active session packages.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-[#e2ebe8]">
          {packages.map((session, index) => (
            <li
              key={session.sessionGroupId}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4"
            >
              <div className="min-w-36 flex-1">
                <p className="text-sm font-medium">Package {index + 1}</p>
                <p className="mt-1 text-sm text-[#526965]">
                  {session.currentCount} of {session.sessionCount} sessions
                </p>
              </div>
              <progress
                value={session.currentCount}
                max={session.sessionCount}
                aria-label={`Package ${index + 1}: ${session.currentCount} of ${session.sessionCount} sessions`}
                className="h-2 w-40 accent-[#116c61]"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
