"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ensureUserProfile } from "@/app/features/users/service";
import { auth } from "@/app/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (
    displayName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Single source of truth for auth state. Mounted once in the root layout so
 * every route (guards, forms, pages) shares the same user/loading state.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (next) => {
        setUser(next);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  // Google: sign-in and sign-up are the same flow. ensureUserProfile only
  // writes the profile the first time, so it is safe on every login.
  const signInWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    await ensureUserProfile(cred.user);
  }, []);

  // Email signup: create the account, set the Auth display name, then save the profile.
  const signUpWithEmail = useCallback(
    async (displayName: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      await ensureUserProfile(cred.user, displayName);
    },
    [],
  );

  // Also calls ensureUserProfile so an account whose profile write failed
  // earlier gets repaired on its next sign-in.
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(cred.user);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      signOut,
    }),
    [
      user,
      loading,
      error,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
