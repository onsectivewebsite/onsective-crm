import Link from "next/link";
import { ClientStatus } from "@prisma/client";
import { Badge, Button, Card, Empty, Field, PageHeader, Table, Td, inputClass } from "@/components/ui";
import { labelize, money } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { createClient } from "./actions";

export default async function ClientsPage() {
  await requireStaff();

  const clients = await prisma.client.findMany({
    include: {
      owner: { include: { user: true } },
      projects: { select: { id: true, status: true } },
      invoices: { select: { amount: true, status: true } },
    },
    orderBy: { company: "asc" },
  });

  return (
    <>
      <PageHeader title="Clients" subtitle="Every account Onsective works with." />

      <Card title={`${clients.length} accounts`}>
        {clients.length === 0 ? (
          <Empty>No clients yet — add your first below.</Empty>
        ) : (
          <Table head={["Company", "Contact", "Status", "Owner", "Projects", "Billed"]}>
            {clients.map((client) => (
              <tr key={client.id}>
                <Td>
                  <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                    {client.company}
                  </Link>
                  <p className="text-xs text-slate-400">{client.industry ?? "—"}</p>
                </Td>
                <Td>
                  {client.contactName}
                  <p className="text-xs text-slate-400">{client.email}</p>
                </Td>
                <Td>
                  <Badge value={client.status} />
                </Td>
                <Td>{client.owner?.user.name ?? "Unassigned"}</Td>
                <Td>{client.projects.length}</Td>
                <Td>
                  {money(
                    client.invoices
                      .filter((invoice) => invoice.status === "PAID")
                      .reduce((sum, invoice) => sum + Number(invoice.amount), 0),
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <div className="mt-6">
        <Card title="Add client">
          <form action={createClient} className="grid gap-4 md:grid-cols-3">
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
              <Button type="submit">Add client</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
