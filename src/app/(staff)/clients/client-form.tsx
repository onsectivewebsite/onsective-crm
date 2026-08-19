"use client";

import { useActionState } from "react";
import { ClientStatus } from "@prisma/client";
import { Button, Field, inputClass } from "@/components/ui";
import { labelize } from "@/lib/format";
import { createClient } from "./actions";

export default function ClientForm() {
  const [error, formAction, pending] = useActionState(createClient, null);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-3">
      <Field label="Company">
        <input name="company" required className={inputClass} />
      </Field>
      <Field label="Primary contact">
        <input name="contactName" required className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" className={inputClass} />
      </Field>
      <Field label="Website">
        <input name="website" className={inputClass} />
      </Field>
      <Field label="Industry">
        <input name="industry" className={inputClass} />
      </Field>
      <Field label="Status">
        <select name="status" className={inputClass} defaultValue={ClientStatus.PROSPECT}>
          {Object.values(ClientStatus).map((status) => (
            <option key={status} value={status}>
              {labelize(status)}
            </option>
          ))}
        </select>
      </Field>
      <div className="md:col-span-3">
        {error && <p className="mb-2 text-sm text-rose-600">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add client"}
        </Button>
      </div>
    </form>
  );
}
