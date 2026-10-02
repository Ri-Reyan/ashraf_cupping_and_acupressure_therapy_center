// URL-driven patient search, paginated table, and detail links.
// Read access is granted to both ADMIN and RECEPTIONIST roles.
import Link from "next/link";
import { Search, X } from "lucide-react";

function pageHref(search: string, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/dashboard/patients?${query}` : "/dashboard/patients";
}

export type PatientDirectoryRow = {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  visitCount: number;
  lastVisit: string | null;
};

export function PatientDirectory({
  search,
  patients,
  total,
  page,
  pageCount,
  pageSize,
}: {
  search: string;
  patients: PatientDirectoryRow[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div>
      <form
        action="/dashboard/patients"
        method="get"
        className="flex flex-col gap-3 border-b border-[#d9e7e3] pb-6 sm:flex-row"
      >
        <label className="min-w-0 flex-1 space-y-2 text-sm font-medium">
          <span>Patient name or mobile</span>
          <span className="flex h-11 items-center gap-3 border border-[#cbdad6] bg-white px-3 focus-within:border-[#116c61] focus-within:ring-1 focus-within:ring-[#116c61]">
            <Search aria-hidden="true" className="size-4 text-[#69807c]" />
            <input
              type="search"
              name="q"
              maxLength={120}
              defaultValue={search}
              placeholder="Search name or mobile"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa9a5]"
            />
          </span>
        </label>
        <button
          type="submit"
          className="mt-auto flex h-11 items-center justify-center gap-2 bg-[#116c61] px-4 text-sm font-semibold text-white hover:bg-[#0d5d53]"
        >
          <Search aria-hidden="true" className="size-4" />
          Search
        </button>
        {search && (
          <Link
            href="/dashboard/patients"
            className="mt-auto flex h-11 items-center justify-center gap-2 border border-[#cbdad6] px-4 text-sm font-medium text-[#526965] hover:bg-[#f1f5f4]"
          >
            <X aria-hidden="true" className="size-4" />
            Clear
          </Link>
        )}
      </form>

      <p className="py-4 text-sm text-[#526965]">
        {total === 0
          ? "No patients found."
          : `Showing ${first}–${last} of ${total}`}
      </p>

      {patients.length === 0 ? (
        <p className="border-y border-[#e2ebe8] py-10 text-center text-sm text-[#69807c]">
          {search
            ? "Try a different name or mobile number."
            : "Patients will appear after their first appointment."}
        </p>
      ) : (
        <div className="overflow-x-auto border-y border-[#d9e7e3]">
          <table className="w-full min-w-200 border-collapse text-left text-sm">
            <thead className="bg-[#edf4f1] text-xs uppercase text-[#526965]">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Name
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Mobile
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Age
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Gender
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Visits
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Last visit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2ebe8]">
              {patients.map((patient) => (
                <tr key={patient.id} className="bg-white hover:bg-[#f8fbf9]">
                  <td className="px-3 py-3 font-medium">
                    <Link
                      href={`/dashboard/patients/${patient.id}`}
                      className="text-[#116c61] underline-offset-4 hover:underline"
                    >
                      {patient.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{patient.mobile}</td>
                  <td className="px-3 py-3">{patient.age}</td>
                  <td className="px-3 py-3">{patient.gender.toLowerCase()}</td>
                  <td className="px-3 py-3 text-right">{patient.visitCount}</td>
                  <td className="px-3 py-3">{patient.lastVisit ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav
          aria-label="Patient pages"
          className="flex items-center justify-between border-b border-[#d9e7e3] py-4"
        >
          <Link
            href={pageHref(search, page - 1)}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={`min-h-11 px-3 py-3 text-sm font-medium ${page <= 1 ? "pointer-events-none text-[#9aa9a5]" : "text-[#116c61] hover:bg-[#edf5f1]"}`}
          >
            Previous
          </Link>
          <p className="text-sm text-[#526965]">
            Page {page} of {pageCount}
          </p>
          <Link
            href={pageHref(search, page + 1)}
            aria-disabled={page >= pageCount}
            tabIndex={page >= pageCount ? -1 : undefined}
            className={`min-h-11 px-3 py-3 text-sm font-medium ${page >= pageCount ? "pointer-events-none text-[#9aa9a5]" : "text-[#116c61] hover:bg-[#edf5f1]"}`}
          >
            Next
          </Link>
        </nav>
      )}
    </div>
  );
}
