import type { Role } from "@/app/features/rbac/roles";
import { z } from "zod";

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 chars")
  .max(100, "Name must be 100 chars or fewer");

export const profileUpdateSchema = z.object({
  displayName: displayNameSchema,
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  role: Role;
};
