// Dashboard route error boundary with a safe recovery action.
// Internal exception details are not shown to staff.
"use client";

export default function DashboardError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section role="alert" className="border-y border-[#e7c7c2] py-8">
      <p className="text-sm font-semibold text-[#9b3f35]">
        Dashboard data could not be loaded.
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-4 min-h-11 border border-[#cbdad6] px-4 text-sm font-medium text-[#526965] hover:bg-[#f1f5f4]"
      >
        Try again
      </button>
    </section>
  );
}
