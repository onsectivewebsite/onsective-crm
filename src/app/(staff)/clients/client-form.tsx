"use client";

import { useActionState } from "react";
import { ClientStatus } from "@prisma/client";
import { Button, Field, inputClass } from "@/components/ui";
import { labelize } from "@/lib/format";
import { createClient } from "./actions";

export default function ClientForm() {
  const [state, formAction, pending] = useActionState(createClient, null);

  const values = state?.values ?? {};

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-3">
      <Field label="Company">
        <input name="company" required className={inputClass} defaultValue={values.company ?? ""} />
      </Field>
      <Field label="Primary contact">
        <input name="contactName" required className={inputClass} defaultValue={values.contactName ?? ""} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required className={inputClass} defaultValue={values.email ?? ""} />
      </Field>
      <Field label="Phone">
        <input name="phone" className={inputClass} defaultValue={values.phone ?? ""} />
      </Field>
      <Field label="Website">
        <input name="website" className={inputClass} defaultValue={values.website ?? ""} />
      </Field>
      <Field label="Industry">
        <input name="industry" className={inputClass} defaultValue={values.industry ?? ""} />
      </Field>
      <Field label="Status">
        <select name="status" className={inputClass} defaultValue={values.status ?? ClientStatus.PROSPECT}>
          {Object.values(ClientStatus).map((status) => (
            <option key={status} value={status}>
              {labelize(status)}
            </option>
          ))}
        </select>
      </Field>
      <div className="md:col-span-3">
        {state && <p className="mb-2 text-sm text-rose-600">{state.error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add client"}
        </Button>
      </div>
    </form>
  );
}
