"use client";

import { useAuth } from "@/app/features/auth/auth-provider";
import { RequireAuth, RequireRole } from "@/app/features/auth/guard";
import { BusinessForm } from "@/app/features/businesses/business-form";
import { BusinessItem } from "@/app/features/businesses/business-item";
import { createBusiness } from "@/app/features/businesses/service";
import { useMyBusinesses } from "@/app/features/businesses/use-businesses";
import Link from "next/link";

function MyBusinesses() {
  const { user } = useAuth();
  const { businesses, loading, error } = useMyBusinesses(user?.uid);

  if (!user) return null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My business</h1>
        <Link href="/" className="text-sm underline">
          Home
        </Link>
      </header>

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-3 text-lg font-semibold">New business</h2>
        <BusinessForm
          submitLabel="Create business"
          resetOnSuccess
          onSubmit={async (values) => {
            await createBusiness(user.uid, values);
          }}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your businesses</h2>
        {loading && <p>Loading…</p>}
        {error && (
          <p className="text-sm text-red-600" role="alert">
            Could not load businesses: {error}. If it mentions an index, deploy
            it with <code>firebase deploy --only firestore:indexes</code>.
          </p>
        )}
        {!loading && !error && businesses.length === 0 && (
          <p className="text-zinc-500">You have no businesses yet.</p>
        )}
        <ul className="grid gap-3">
          {businesses.map((b) => (
            <BusinessItem key={b.id} business={b} />
          ))}
        </ul>
      </section>
    </main>
  );
}

export default function MyBusinessPage() {
  return (
    <RequireAuth>
      <RequireRole min="professional">
        <MyBusinesses />
      </RequireRole>
    </RequireAuth>
  );
}
