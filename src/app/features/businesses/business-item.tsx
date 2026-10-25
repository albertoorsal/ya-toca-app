import { BusinessForm } from "@/app/features/businesses/business-form";
import { Business, CATEGORY_LABELS } from "@/app/features/businesses/schema";
import {
  deleteBusiness,
  updateBusiness,
} from "@/app/features/businesses/service";
import { useState } from "react";

export function BusinessItem({ business }: { business: Business }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    try {
      setBusy(true);
      setError(null);
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  // when user is editing...
  if (editing) {
    return (
      <li className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <BusinessForm
          initial={{
            name: business.name,
            category: business.category,
            description: business.description,
            phone: business.phone,
            city: business.city,
            address: business.address,
            status: business.status,
          }}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await updateBusiness(business.id, values);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  const published = business.status === "published";

  return (
    <li className="grid gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{business.name}</h3>
          <p className="text-sm text-zinc-500">
            {CATEGORY_LABELS[business.category]} · {business.city}
          </p>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${
            published
              ? "border-green-600 text-green-600"
              : "border-zinc-400 text-zinc-500"
          }`}
        >
          {published ? "Published" : "Draft"}
        </span>
      </div>

      {business.description && (
        <p className="text-sm">{business.description}</p>
      )}
      <p className="text-sm text-zinc-500">
        {business.address} · {business.phone}
      </p>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={() =>
            run(() =>
              updateBusiness(business.id, {
                status: published ? "draft" : "published",
              }),
            )
          }
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
        >
          {published ? "Unpublish" : "Publish"}
        </button>
        <button
          disabled={busy}
          onClick={() => setEditing(true)}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
        >
          Edit
        </button>
        <button
          disabled={busy}
          onClick={() => {
            if (window.confirm(`Delete "${business.name}"?`)) {
              void run(() => deleteBusiness(business.id));
            }
          }}
          className="rounded-lg border border-red-500 px-3 py-1.5 text-sm text-red-600 disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
