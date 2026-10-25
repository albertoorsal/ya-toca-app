"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/app/features/auth/auth-provider";
import { auth } from "@/app/lib/firebase/client";

export function PublishBusinessCta() {
  const { role, refreshRole } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!role) return null;

  // Already allowed to publish.
  if (role !== "user") {
    return (
      <Link href="/my-business" className="text-sm underline">
        Manage my business
      </Link>
    );
  }

  async function handleClick() {
    try {
      setBusy(true);
      setError(null);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/become-professional", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error((await res.json()).error ?? "Request failed");
      }
      await refreshRole(); // pick up the new claim before navigating
      router.push("/my-business");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-1">
      <button
        onClick={handleClick}
        disabled={busy}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
      >
        {busy ? "Setting things up…" : "Publish your business"}
      </button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
