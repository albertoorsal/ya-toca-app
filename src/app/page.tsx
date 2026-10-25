"use client";

import Link from "next/link";
import { useState } from "react";

import { RequireAuth } from "@/app/features/auth/guard";
import { useAuth } from "@/app/features/auth/auth-provider";
import { hasAtLeast } from "@/app/features/rbac/roles";
import { useUserProfile } from "@/app/features/users/use-user-profile";
import { PublishBusinessCta } from "@/app/features/businesses/publish-cta";

function ProfessionalPanel() {
  return <h2 className="text-lg">Hello from Professional</h2>;
}

function HomeContent() {
  const { user, role, signOut } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      // Awaiting matters: RequireAuth redirects to /sign-in once the auth
      // state flips to null, which happens after this resolves.
      await signOut();
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : "Sign out failed.");
      setSigningOut(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Ya Toca</h1>
        <div className="flex items-center gap-3">
          {role === "admin" && (
            <Link href="/admin" className="text-sm underline">
              Admin
            </Link>
          )}
          <span className="text-sm text-zinc-500">
            {profile?.displayName ?? user?.email}
            {role ? ` · ${role}` : ""}
          </span>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </header>

      {/* Routes publish my business */}
      <div className="flex items-center gap-4">
        <PublishBusinessCta />
        <Link href="/businesses" className="text-sm underline">
          Browse businesses
        </Link>
      </div>

      {signOutError && (
        <p className="text-sm text-red-600" role="alert">
          {signOutError}
        </p>
      )}

      {role && hasAtLeast(role, "professional") && <ProfessionalPanel />}
    </main>
  );
}

export default function Home() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  );
}
