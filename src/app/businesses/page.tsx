"use client";

import Link from "next/link";

import { CATEGORY_LABELS } from "@/app/features/businesses/schema";
import { usePublishedBusinesses } from "@/app/features/businesses/use-businesses";

export default function BusinessesPage() {
  const { businesses, loading, error } = usePublishedBusinesses();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Businesses</h1>
        <Link href="/" className="text-sm underline">
          Home
        </Link>
      </header>

      {loading && <p>Loading…</p>}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && businesses.length === 0 && (
        <p className="text-zinc-500">No businesses published yet.</p>
      )}

      <ul className="grid gap-3">
        {businesses.map((b) => (
          <li
            key={b.id}
            className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <h2 className="text-lg font-semibold">{b.name}</h2>
            <p className="text-sm text-zinc-500">
              {CATEGORY_LABELS[b.category]} · {b.city}
            </p>
            {b.description && <p className="mt-2 text-sm">{b.description}</p>}
            <p className="mt-2 text-sm text-zinc-500">
              {b.address} · {b.phone}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
