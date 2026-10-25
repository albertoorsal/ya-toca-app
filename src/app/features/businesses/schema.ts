import { z } from "zod";
export const CATEGORIES = [
  "barber",
  "dentist",
  "doctor",
  "nutritionist",
  "psychologist",
  "other",
] as const;

export const STATUSES = ["draft", "published"] as const;

export type Category = (typeof CATEGORIES)[number];

export type BusinessStatus = (typeof STATUSES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  barber: "Barber",
  dentist: "Dentist",
  doctor: "Doctor",
  nutritionist: "Nutritionist",
  psychologist: "Psychologist",
  other: "Other",
};

export const businessInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  category: z.enum(CATEGORIES),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or fewer"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{7,20}$/, "Enter a valid phone number"),
  city: z.string().trim().min(2, "City is required").max(80),
  address: z
    .string()
    .trim()
    .min(5, "Address is too short")
    .max(160, "Address must be 160 characters or fewer"),
  status: z.enum(STATUSES),
});

export type BusinessInput = z.infer<typeof businessInputSchema>;

export type Business = BusinessInput & {
  id: string;
  ownerId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};
