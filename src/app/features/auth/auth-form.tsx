"use client";

import { FirebaseError } from "firebase/app";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { z } from "zod";

import { useAuth } from "@/app/features/auth/auth-provider";
import { displayNameSchema } from "@/app/features/users/schema";

const emailSchema = z.email("Enter a valid email address");

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer"),
});

type Mode = "signin" | "signup";

function authErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/email-already-in-use":
        return "That email is already registered. Try signing in instead.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";
      case "auth/weak-password":
        return "That password is too weak.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled.";
      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled in the Firebase console.";
      case "permission-denied":
        return "Your account was created but the profile could not be saved. Check the Firestore rules.";
    }
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

function collectErrors(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

const inputClass =
  "rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-base outline-none focus:border-blue-500 aria-[invalid=true]:border-red-500 disabled:opacity-60 dark:border-zinc-700";
const labelClass = "grid gap-1 text-sm text-zinc-600 dark:text-zinc-400";
const errorClass = "text-sm text-red-600 dark:text-red-400";

/**
 * Used by /sign-in and /sign-up. The mode is decided by the route, and the
 * redirect after a successful login is handled by <RedirectIfAuthenticated>.
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [values, setValues] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === "signup";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (isSignUp) {
      const result = signUpSchema.safeParse(values);
      if (!result.success) {
        setErrors(collectErrors(result.error.issues));
        return;
      }
      setErrors({});
      try {
        setSubmitting(true);
        await signUpWithEmail(
          result.data.displayName,
          result.data.email,
          result.data.password,
        );
      } catch (err) {
        setFormError(authErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const result = signInSchema.safeParse(values);
    if (!result.success) {
      setErrors(collectErrors(result.error.issues));
      return;
    }
    setErrors({});
    try {
      setSubmitting(true);
      await signInWithEmail(result.data.email, result.data.password);
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    try {
      setSubmitting(true);
      setFormError(null);
      await signInWithGoogle();
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h1 className="mb-4 text-xl font-semibold">
        {isSignUp ? "Create your account" : "Sign in"}
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-3" noValidate>
        {isSignUp && (
          <label className={labelClass}>
            Name
            <input
              className={inputClass}
              value={values.displayName}
              onChange={(e) =>
                setValues({ ...values, displayName: e.target.value })
              }
              maxLength={100}
              autoComplete="name"
              aria-invalid={!!errors.displayName}
              disabled={submitting}
            />
            {errors.displayName && (
              <span className={errorClass}>{errors.displayName}</span>
            )}
          </label>
        )}

        <label className={labelClass}>
          Email
          <input
            className={inputClass}
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            autoComplete="email"
            aria-invalid={!!errors.email}
            disabled={submitting}
          />
          {errors.email && <span className={errorClass}>{errors.email}</span>}
        </label>

        <label className={labelClass}>
          Password
          <input
            className={inputClass}
            type="password"
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            aria-invalid={!!errors.password}
            disabled={submitting}
          />
          {errors.password && (
            <span className={errorClass}>{errors.password}</span>
          )}
        </label>

        {formError && (
          <p className={errorClass} role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {submitting
            ? "Please wait…"
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="my-3 text-center text-sm text-zinc-500">or</p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={submitting}
        className="w-full rounded-lg border border-zinc-300 px-4 py-2 disabled:opacity-60 dark:border-zinc-700"
      >
        Continue with Google
      </button>

      <p className="mt-4 text-center text-sm">
        {isSignUp ? "Already have an account?" : "New here?"}{" "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="text-blue-600 underline dark:text-blue-400"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
