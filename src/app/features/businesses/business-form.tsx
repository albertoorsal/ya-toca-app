import {
  BusinessInput,
  businessInputSchema,
  CATEGORIES,
  CATEGORY_LABELS,
  STATUSES,
} from "@/app/features/businesses/schema";
import { FormEvent, ReactNode, useState } from "react";

const EMPTY: BusinessInput = {
  name: "",
  category: "barber",
  description: "",
  phone: "",
  city: "",
  address: "",
  status: "draft",
};

const inputClass =
  "rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-base outline-none focus:border-blue-500 aria-[invalid=true]:border-red-500 disabled:opacity-60 dark:border-zinc-700";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm text-zinc-600 dark:text-zinc-400">
      {label}
      {children}
      {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}

type Props = {
  initial?: BusinessInput;
  submitLabel: string;
  resetOnSuccess?: boolean;
  onSubmit: (values: BusinessInput) => Promise<void>;
  onCancel?: () => void;
};

export function BusinessForm({
  initial = EMPTY,
  submitLabel,
  resetOnSuccess = false,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState<BusinessInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof BusinessInput>(key: K, value: BusinessInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = businessInputSchema.safeParse(values);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        out[String(issue.path[0] ?? "form")] ??= issue.message;
      }
      setErrors(out);
      return;
    }
    setErrors({});

    try {
      setSubmitting(true);
      await onSubmit(parsed.data);
      if (resetOnSuccess) setValues(EMPTY);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3" noValidate>
      <Field label="Business name" error={errors.name}>
        <input
          className={inputClass}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          maxLength={80}
          aria-invalid={!!errors.name}
          disabled={submitting}
        />
      </Field>

      <Field label="Category">
        <select
          className={inputClass}
          value={values.category}
          onChange={(e) =>
            set("category", e.target.value as BusinessInput["category"])
          }
          disabled={submitting}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Phone" error={errors.phone}>
        <input
          className={inputClass}
          type="tel"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          aria-invalid={!!errors.phone}
          disabled={submitting}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="City" error={errors.city}>
          <input
            className={inputClass}
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            aria-invalid={!!errors.city}
            disabled={submitting}
          />
        </Field>
        <Field label="Address" error={errors.address}>
          <input
            className={inputClass}
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
            aria-invalid={!!errors.address}
            disabled={submitting}
          />
        </Field>
      </div>

      <Field label="Description" error={errors.description}>
        <textarea
          className={inputClass}
          rows={3}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={1000}
          disabled={submitting}
        />
      </Field>

      <Field label="Visibility">
        <select
          className={inputClass}
          value={values.status}
          onChange={(e) =>
            set("status", e.target.value as BusinessInput["status"])
          }
          disabled={submitting}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "draft" ? "Draft (only you)" : "Published (public)"}
            </option>
          ))}
        </select>
      </Field>

      {formError && (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-zinc-300 px-4 py-2 disabled:opacity-60 dark:border-zinc-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
