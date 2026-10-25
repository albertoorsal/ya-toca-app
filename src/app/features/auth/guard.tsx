"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/features/auth/auth-provider";
import { hasAtLeast, type Role } from "@/app/features/rbac/roles";

function AuthStatus({ message }: { message: string }) {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <p className="text-sm text-gray-500" role="status">
        {message}
      </p>
    </main>
  );
}

/**
 * Renders `children` only if the user's role is at least `min`.
 * Use inside <RequireAuth>. UX only: Firestore rules and the API enforce it.
 */
export function RequireRole({
  min,
  children,
}: {
  min: Role;
  children: React.ReactNode;
}) {
  const { role, loading } = useAuth();

  if (loading) return <AuthStatus message="Checking permissions…" />;

  if (!role || !hasAtLeast(role, min)) {
    return <AuthStatus message="You don't have access to this page." />;
  }

  return <>{children}</>;
}

/**
 * Renders `children` only for a signed-in user. Anyone else is sent to
 * /sign-in, so protected pages never paint their content to a guest.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !error && !user) {
      router.replace("/sign-in");
    }
  }, [user, loading, error, router]);

  if (loading) {
    return <AuthStatus message="Initialising user…" />;
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-red-600" role="alert">
          Error: {error.message}
        </p>
      </main>
    );
  }

  if (!user) {
    return <AuthStatus message="Redirecting to sign in…" />;
  }

  return <>{children}</>;
}

/**
 * The inverse guard for /sign-in and /sign-up: an already signed-in user is
 * bounced to the home page instead of being shown the credential form again.
 */
export function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <AuthStatus message="Checking your session…" />;
  }

  if (user) {
    return <AuthStatus message="Already signed in. Redirecting…" />;
  }

  return <>{children}</>;
}
