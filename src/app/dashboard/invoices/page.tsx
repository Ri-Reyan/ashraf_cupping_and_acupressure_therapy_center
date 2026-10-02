// Staff invoice search route driven by URL query parameters.
// Search results are assembled in the invoice service and rendered below.
import { InvoiceSearchResults } from "@/features/invoices/components/InvoiceSearchResults";
import { searchInvoices } from "@/features/invoices/service";
import { requireUser } from "@/lib/auth";

type InvoicesPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

export default async function InvoicesPage({
  searchParams,
}: InvoicesPageProps) {
  await requireUser();
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const pageValue = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const result = await searchInvoices(search, page);

  return (
    <section>
      <header className="mb-6 border-b border-[#d9e7e3] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#116c61]">
          Records
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Invoices</h1>
      </header>
      <InvoiceSearchResults {...result} />
    </section>
  );
}
