import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";

import { roleSchema } from "@/app/features/rbac/roles";
import { adminAuth, adminDb } from "@/app/lib/firebase/admin";

const bodySchema = z.object({ role: roleSchema });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  // Authenticate : verify the ID token (checkRevoked=true)

  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  let caller;
  try {
    caller = await adminAuth.verifyIdToken(token, true);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Authorize : admin only
  if (caller.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate input
  const { uid } = await params;
  if (uid === caller.uid) {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 },
    ); // prevents locking out the last admin
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const { role } = parsed.data;

  // Apply claim first (source of truth), then mirror in Firestore.
  try {
    await adminAuth.setCustomUserClaims(uid, { role });
  } catch {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  const ref = adminDb.doc(`users/${uid}`);
  if ((await ref.get()).exists) {
    await ref.update({ role, updatedAt: FieldValue.serverTimestamp() });
  }

  return NextResponse.json({ uid, role });
}
