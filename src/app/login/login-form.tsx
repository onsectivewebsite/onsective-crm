"use client";

import { useActionState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { login } from "./actions";

export default function LoginForm() {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <Field label="Email">
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
