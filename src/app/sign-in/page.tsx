import { RedirectIfAuthenticated } from "@/app/features/auth/guard";
import { AuthForm } from "@/app/features/auth/auth-form";

export default function SignInPage() {
  return (
    <RedirectIfAuthenticated>
      <main className="flex flex-1 items-center justify-center p-8">
        <AuthForm mode="signin" />
      </main>
    </RedirectIfAuthenticated>
  );
}
