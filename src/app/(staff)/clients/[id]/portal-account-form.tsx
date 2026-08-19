"use client";

import { useActionState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { createPortalAccount } from "../actions";

export default function PortalAccountForm({ clientId }: { clientId: string }) {
  const [state, formAction, pending] = useActionState(createPortalAccount, null);

  const values = state?.values ?? {};

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-4">
      <input type="hidden" name="clientId" value={clientId} />
      <Field label="Full name">
        <input name="name" required className={inputClass} defaultValue={values.name ?? ""} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required className={inputClass} defaultValue={values.email ?? ""} />
      </Field>
      <Field label="Temporary password">
        <input name="password" type="text" required minLength={8} className={inputClass} />
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Inviting…" : "Invite to portal"}
        </Button>
      </div>
      {state && <p className="text-sm text-rose-600 md:col-span-4">{state.error}</p>}
    </form>
  );
}
