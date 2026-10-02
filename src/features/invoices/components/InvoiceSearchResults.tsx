// URL-driven invoice search form, result table, and pagination controls.
// Search and page navigation use regular links and GET query parameters.
import Link from "next/link";
import { Download, Search, X } from "lucide-react";
import type { InvoiceSearchRow } from "../service";

function pageHref(search: string, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/dashboard/invoices?${query}` : "/dashboard/invoices";
}

export function InvoiceSearchResults({
  search,
  rows,
  total,
  page,
  pageCount,
  pageSize,
}: {
  search: string;
  rows: InvoiceSearchRow[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}) {
  const firstResult = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastResult = Math.min(page * pageSize, total);

  return (
    <div>
      <form
        action="/dashboard/invoices"
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
              placeholder="Search patient name or mobile"
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
            href="/dashboard/invoices"
            className="mt-auto flex h-11 items-center justify-center gap-2 border border-[#cbdad6] px-4 text-sm font-medium text-[#526965] hover:bg-[#f1f5f4]"
          >
            <X aria-hidden="true" className="size-4" />
            Clear
          </Link>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm text-[#526965]">
        <p>
          {total === 0
            ? "No invoices found."
            : `Showing ${firstResult}–${lastResult} of ${total}`}
        </p>
        {search && (
          <p>
            Search: <span className="font-medium text-[#183330]">{search}</span>
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="border-y border-[#e2ebe8] py-10 text-center text-sm text-[#69807c]">
          {search
            ? "Try another patient name or mobile number."
            : "Invoices will appear here after appointments are recorded."}
        </p>
      ) : (
        <div className="overflow-x-auto border-y border-[#d9e7e3]">
          <table className="w-full min-w-212.5 border-collapse text-left text-sm">
            <thead className="bg-[#edf4f1] text-xs uppercase text-[#526965]">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Invoice no
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Patient
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Mobile
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Therapist
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Fee
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  PDF
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2ebe8]">
              {rows.map((invoice) => (
                <tr key={invoice.id} className="bg-white hover:bg-[#f8fbf9]">
                  <td className="px-3 py-3 font-semibold">
                    {invoice.invoiceNo}
                  </td>
                  <td className="px-3 py-3">{invoice.date}</td>
                  <td className="px-3 py-3">{invoice.patientName}</td>
                  <td className="px-3 py-3">{invoice.mobile}</td>
                  <td className="px-3 py-3">{invoice.therapistName}</td>
                  <td className="px-3 py-3 text-right">{`৳ ${new Intl.NumberFormat("en-BD").format(invoice.fee)}`}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/api/invoices/${invoice.id}/pdf`}
                      title={`Download invoice ${invoice.invoiceNo} PDF`}
                      aria-label={`Download invoice ${invoice.invoiceNo} PDF`}
                      className="inline-flex size-10 items-center justify-center text-[#116c61] hover:bg-[#edf5f1]"
                    >
                      <Download aria-hidden="true" className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav
          aria-label="Invoice pages"
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
