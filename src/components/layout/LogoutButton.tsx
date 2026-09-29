// Ends the database-backed staff session and returns to the login route.
// Clears both database-auth tokens and returns to the login route.
// Kept separate from navigation so the auth mutation stays easy to trace.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(landing)/login/actions";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setPending(true);
    await logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
    >
      <LogOut aria-hidden="true" className="size-4.5 shrink-0" />
      <span className="hidden md:inline">
        {pending ? "Signing out..." : "Sign out"}
      </span>
    </button>
  );
}
