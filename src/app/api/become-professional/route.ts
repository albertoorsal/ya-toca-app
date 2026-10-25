import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { parseRole } from "@/app/features/rbac/roles";
import { adminAuth, adminDb } from "@/app/lib/firebase/admin";

export async function POST(req: Request) {
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

  // Already professional or admin: nothing to do (and never downgrade an admin).
  const current = parseRole(caller.role);
  if (current !== "user") {
    return NextResponse.json({ role: current });
  }

  // Optional hardening: require a verified email before allowing this.
  // if (!caller.email_verified) { return NextResponse.json({ error: "Verify your email first" }, { status: 403 }); }

  await adminAuth.setCustomUserClaims(caller.uid, { role: "professional" });

  const ref = adminDb.doc(`users/${caller.uid}`);
  if ((await ref.get()).exists) {
    await ref.update({
      role: "professional",
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return NextResponse.json({ role: "professional" });
}
