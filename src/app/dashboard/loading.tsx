// Shared dashboard loading skeleton for protected page transitions.
// Reserves stable space while server-side queries resolve.
export default function DashboardLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading dashboard"
      className="space-y-6"
    >
      <div className="animate-pulse border-b border-[#d9e7e3] pb-5">
        <div className="h-3 w-24 bg-[#e2ebe8]" />
        <div className="mt-3 h-7 w-48 bg-[#e2ebe8]" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-24 border-y border-[#e2ebe8] bg-white p-4"
          >
            <div className="h-3 w-20 animate-pulse bg-[#e2ebe8]" />
            <div className="mt-4 h-6 w-28 animate-pulse bg-[#e2ebe8]" />
          </div>
        ))}
      </div>
      <div className="h-72 animate-pulse border border-[#e2ebe8] bg-white" />
    </section>
  );
}
