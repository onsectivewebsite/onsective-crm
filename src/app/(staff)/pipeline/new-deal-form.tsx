"use client";

import { DealStage, Service } from "@prisma/client";
import { Button, Field, inputClass } from "@/components/ui";
import { labelize } from "@/lib/format";
import { createDeal } from "./actions";

export default function NewDealForm({ clients }: { clients: { id: string; company: string }[] }) {
  return (
    <form action={createDeal} className="grid gap-4 md:grid-cols-3">
      <Field label="Deal title">
        <input name="title" required className={inputClass} placeholder="SEO retainer — Acme" />
      </Field>
      <Field label="Contact name">
        <input name="contactName" required className={inputClass} />
      </Field>
      <Field label="Contact email">
        <input name="contactEmail" type="email" className={inputClass} />
      </Field>
      <Field label="Existing client">
        <select name="clientId" className={inputClass} defaultValue="">
          <option value="">New prospect</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.company}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Service">
        <select name="service" className={inputClass} defaultValue={Service.SEO}>
          {Object.values(Service).map((service) => (
            <option key={service} value={service}>
              {labelize(service)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Stage">
        <select name="stage" className={inputClass} defaultValue={DealStage.LEAD}>
          {Object.values(DealStage).map((stage) => (
            <option key={stage} value={stage}>
              {labelize(stage)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Value (USD)">
        <input name="value" type="number" min="0" step="100" defaultValue={0} className={inputClass} />
      </Field>
      <Field label="Source">
        <input name="source" className={inputClass} placeholder="Referral, LinkedIn…" />
      </Field>
      <Field label="Expected close">
        <input name="expectedCloseDate" type="date" className={inputClass} />
      </Field>
      <div className="md:col-span-3">
        <Button type="submit">Create deal</Button>
      </div>
    </form>
  );
}
