import type { User } from "firebase/auth";
import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase/client";
import {
  profileUpdateSchema,
  type ProfileUpdate,
  type UserProfile,
} from "./schema";

const COLLECTION = "users";

function toProfile(snap: DocumentSnapshot<DocumentData>): UserProfile | null {
  if (!snap.exists()) return null;
  const data = snap.data({ serverTimestamps: "estimate" });
  const toDate = (v: unknown) => (v instanceof Timestamp ? v.toDate() : null);
  return {
    uid: snap.id,
    email: (data.email as string | null) ?? null,
    displayName: (data.displayName as string | null) ?? null,
    photoURL: (data.photoURL as string | null) ?? null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function ensureUserProfile(
  user: User,
  displayName?: string,
): Promise<void> {
  const ref = doc(db, COLLECTION, user.uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) return;
    tx.set(ref, {
      uid: user.uid,
      email: user.email,
      displayName: displayName ?? user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export function subscribeToUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTION, uid),
    (snap) => onData(toProfile(snap)),
    onError,
  );
}

/** UPDATE. Only displayName is editable; the rules lock every other field. */
export async function updateUserProfile(
  uid: string,
  input: ProfileUpdate,
): Promise<void> {
  const data = profileUpdateSchema.parse(input);
  await updateDoc(doc(db, COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
