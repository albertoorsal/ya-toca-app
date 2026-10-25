import { z } from "zod";

export const ROLES = ["user", "professional", "admin"] as const;
export const roleSchema = z.enum(ROLES);
export type Role = z.infer<typeof roleSchema>;

export const DEFAULT_ROLE: Role = "user";

const RANK: Record<Role, number> = { user: 0, professional: 1, admin: 2 };

export function parseRole(value: unknown): Role {
  const parsed = roleSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_ROLE;
}

export function hasAtLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}
