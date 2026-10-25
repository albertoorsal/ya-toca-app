"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "./schema";
import { subscribeToUserProfile } from "./service";

type Snapshot = {
  uid: string;
  profile: UserProfile | null;
  error: string | null;
};

type State = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
};

/** Realtime profile of the given user. `loading` is derived, not stored. */
export function useUserProfile(uid: string | undefined): State {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeToUserProfile(
      uid,
      (profile) => setSnapshot({ uid, profile, error: null }),
      (err) => setSnapshot({ uid, profile: null, error: err.message }),
    );
  }, [uid]);

  if (!uid) return { profile: null, loading: false, error: null };
  // No snapshot yet, or it belongs to a previous user.
  if (!snapshot || snapshot.uid !== uid) {
    return { profile: null, loading: true, error: null };
  }
  return { profile: snapshot.profile, loading: false, error: snapshot.error };
}
