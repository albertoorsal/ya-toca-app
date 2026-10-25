// HOOK
import {
  subscribeToMyBusinesses,
  subscribeToPublishedBusinesses,
} from "./service";
import { Business } from "@/app/features/businesses/schema";
import { useEffect, useState } from "react";

type Snapshot = {
  key: string;
  businesses: Business[];
  error: string | null;
};

type State = {
  businesses: Business[];
  loading: boolean;
  error: string | null;
};

function derive(snpashot: Snapshot | null, key: string | null): State {
  if (!key)
    return {
      businesses: [],
      loading: false,
      error: null,
    };

  if (!snpashot || snpashot.key !== key) {
    return { businesses: [], loading: true, error: null };
  }

  return {
    businesses: snpashot.businesses,
    loading: false,
    error: snpashot.error,
  };
}

// Realtime : list of the signed-in owner's businesses.
export function useMyBusinesses(ownerId: string | undefined): State {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!ownerId) return;
    return subscribeToMyBusinesses(
      ownerId,
      (businesses) => setSnapshot({ key: ownerId, businesses, error: null }),
      (err) =>
        setSnapshot({ key: ownerId, businesses: [], error: err.message }),
    );
  }, [ownerId]);

  return derive(snapshot, ownerId ?? null);
}

// Rela time publi listing of published businesses.
export function usePublishedBusinesses(): State {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(
    () =>
      subscribeToPublishedBusinesses(
        (businesses) =>
          setSnapshot({ key: "published", businesses, error: null }),
        (err) =>
          setSnapshot({ key: "published", businesses: [], error: err.message }),
      ),
    [],
  );

  return derive(snapshot, "published");
}
