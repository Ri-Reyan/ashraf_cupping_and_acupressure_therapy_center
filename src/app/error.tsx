// App-wide route error boundary for unexpected page failures.
// It keeps the shared root layout while offering a retry action.
"use client";

export default function AppError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-xl content-center px-6 text-[#183330]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a13f37]">
        Something went wrong
      </p>
      <h1 className="mt-2 text-2xl font-semibold">
        This page could not be loaded.
      </h1>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 w-fit border border-[#cbdad6] px-4 text-sm font-medium text-[#526965] hover:bg-[#f1f5f4]"
      >
        Try again
      </button>
    </main>
  );
}
