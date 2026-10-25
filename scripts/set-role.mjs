import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Keep in sync with src/app/features/rbac/roles.ts
const ROLES = ["user", "professional", "admin"];

const [email, role = "admin"] = process.argv.slice(2);

if (!email) {
  console.error(
    "Usage: node --env-file=.env.local scripts/set-role.mjs <email> [user|professional|admin]",
  );
  process.exit(1);
}

if (!ROLES.includes(role)) {
  console.error(`Invalid role "${role}". Use one of: ${ROLES.join(", ")}`);
  process.exit(1);
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth(app);
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { role });
console.log(
  `${email} (${user.uid}) is now "${role}". They must sign out and in again.`,
);
