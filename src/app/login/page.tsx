import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect(user.role === "CLIENT" ? "/portal" : "/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Onsective Inc</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Company OS</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your workspace or client portal.</p>
        <LoginForm />
      </div>
    </main>
  );
}
