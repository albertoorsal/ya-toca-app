import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type FirestoreError,
  type Query,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import {
  businessInputSchema,
  type Business,
  type BusinessInput,
  type BusinessStatus,
  type Category,
} from "./schema";

import { db } from "@/app/lib/firebase/client";

const COLLECTION = "businesses";

function toBusiness(snap: QueryDocumentSnapshot<DocumentData>): Business {
  const data = snap.data({ serverTimestamps: "estimate" });
  const toDate = (v: unknown) => (v instanceof Timestamp ? v.toDate() : null);

  return {
    id: snap.id,
    ownerId: data.ownerId as string,
    name: data.name as string,
    category: data.category as Category,
    description: (data.description as string) ?? "",
    phone: data.phone as string,
    city: data.city as string,
    address: data.address as string,
    status: data.status as BusinessStatus,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function subscribe(
  q: Query<DocumentData>,
  onData: (businesses: Business[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(q, (snap) => onData(snap.docs.map(toBusiness)), onError);
}

/** READ: the owner's businesses (drafts included). */
export function subscribeToMyBusinesses(
  ownerId: string,
  onData: (businesses: Business[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  return subscribe(
    query(
      collection(db, COLLECTION),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc"),
    ),
    onData,
    onError,
  );
}

/** READ: public listing. The status filter is required by the rules. */
export function subscribeToPublishedBusinesses(
  onData: (businesses: Business[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  return subscribe(
    query(
      collection(db, COLLECTION),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
    ),
    onData,
    onError,
  );
}

// CREATE
export async function createBusiness(
  ownerId: string,
  input: BusinessInput,
): Promise<string> {
  const data = businessInputSchema.parse(input);
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

// Update (partial)
export async function updateBusiness(
  id: string,
  input: Partial<BusinessInput>,
): Promise<void> {
  const data = businessInputSchema.partial().parse(input);
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// DELETE
export async function deleteBusiness(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
