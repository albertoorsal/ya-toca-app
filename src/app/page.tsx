"use client";

import { useState } from "react";

import { RequireAuth } from "@/app/features/auth/guard";
import { useAuth } from "@/app/features/auth/auth-provider";
import { useUserProfile } from "@/app/features/users/use-user-profile";

function HomeManager() {
  return <h2 className="text-lg">Hello from Manager</h2>;
}

// TODO(RBAC): admin-only list of user profiles. Needs a Firestore rule that
// lets admins list /users before it can be built.

function HomeContent() {
  const { user, signOut } = useAuth();
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
          <span className="text-sm text-zinc-500">
            {profile?.displayName ?? user?.email}
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

      {signOutError && (
        <p className="text-sm text-red-600" role="alert">
          {signOutError}
        </p>
      )}

      <HomeManager />
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
