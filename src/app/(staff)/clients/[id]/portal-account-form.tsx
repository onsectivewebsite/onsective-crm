"use client";

import { useActionState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { createPortalAccount } from "../actions";

export default function PortalAccountForm({ clientId }: { clientId: string }) {
  const [error, formAction, pending] = useActionState(createPortalAccount, null);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-4">
      <input type="hidden" name="clientId" value={clientId} />
      <Field label="Full name">
        <input name="name" required className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Temporary password">
        <input name="password" type="text" required minLength={8} className={inputClass} />
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Inviting…" : "Invite to portal"}
        </Button>
      </div>
      {error && <p className="text-sm text-rose-600 md:col-span-4">{error}</p>}
    </form>
  );
}
