"use client";

import { useEffect, useState } from "react";
import { RequireAuth, RequireRole } from "@/app/features/auth/guard";
import { useAuth } from "@/app/features/auth/auth-provider";
import { ROLES, parseRole } from "@/app/features/rbac/roles";
import type { UserProfile } from "@/app/features/users/schema";
import { subscribeToAllUsers } from "@/app/features/users/service";
import { auth } from "@/app/lib/firebase/client";

function UsersTable() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeToAllUsers(
        (list) => setUsers(list),
        (err) => setError(err.message),
      ),
    [],
  );

  async function changeRole(uid: string, role: string) {
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/users/${uid}/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error ?? "Request failed");
      // The table updates by itself through the Firestore listener.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change role");
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Users</h1>
      {error && (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {users.map((u) => (
          <li
            key={u.uid}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div>
              <p>{u.displayName ?? "(no name)"}</p>
              <p className="text-sm text-zinc-500">{u.email}</p>
            </div>
            <select
              value={u.role}
              disabled={u.uid === user?.uid} // the API also rejects this
              onChange={(e) => changeRole(u.uid, parseRole(e.target.value))}
              className="rounded-lg border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth>
      <RequireRole min="admin">
        <UsersTable />
      </RequireRole>
    </RequireAuth>
  );
}
