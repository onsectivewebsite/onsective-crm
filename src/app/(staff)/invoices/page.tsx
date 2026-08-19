import { InvoiceStatus } from "@prisma/client";
import { Button, Card, Empty, Field, PageHeader, Stat, Table, Td, inputClass } from "@/components/ui";
import { labelize, money, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { createInvoice, setInvoiceStatus } from "./actions";

export default async function InvoicesPage() {
  await requireStaff();

  const [invoices, clients, projects] = await Promise.all([
    prisma.invoice.findMany({
      include: { client: true, project: true },
      orderBy: { issueDate: "desc" },
    }),
    prisma.client.findMany({ orderBy: { company: "asc" } }),
    prisma.project.findMany({ include: { client: true }, orderBy: { name: "asc" } }),
  ]);

  const sum = (status: InvoiceStatus[]) =>
    invoices.filter((invoice) => status.includes(invoice.status)).reduce((total, i) => total + Number(i.amount), 0);

  return (
    <>
      <PageHeader title="Invoices" subtitle="Billing across retainers and one-off projects." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Collected" value={money(sum(["PAID"]))} />
        <Stat label="Awaiting payment" value={money(sum(["SENT"]))} />
        <Stat label="Overdue" value={money(sum(["OVERDUE"]))} />
      </div>

      <div className="mt-6">
        <Card title="All invoices">
          {invoices.length === 0 ? (
            <Empty>No invoices yet.</Empty>
          ) : (
            <Table head={["Number", "Client", "Project", "Amount", "Issued", "Due", "Status"]}>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <Td>{invoice.number}</Td>
                  <Td>{invoice.client.company}</Td>
                  <Td>{invoice.project?.name ?? "—"}</Td>
                  <Td>{money(invoice.amount)}</Td>
                  <Td>{shortDate(invoice.issueDate)}</Td>
                  <Td>{shortDate(invoice.dueDate)}</Td>
                  <Td>
                    <form action={setInvoiceStatus} className="flex items-center gap-2">
                      <input type="hidden" name="invoiceId" value={invoice.id} />
                      <select
                        name="status"
                        key={invoice.status}
                        defaultValue={invoice.status}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      >
                        {Object.values(InvoiceStatus).map((status) => (
                          <option key={status} value={status}>
                            {labelize(status)}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" variant="ghost" className="!px-2 !py-1 text-xs">
                        Save
                      </Button>
                    </form>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Create invoice">
          <form action={createInvoice} className="grid gap-4 md:grid-cols-3">
            <Field label="Client">
              <select name="clientId" required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select client
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Project (optional)">
              <select name="projectId" className={inputClass} defaultValue="">
                <option value="">None</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.client.company} — {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Amount (USD)">
              <input name="amount" type="number" min="0" step="50" required className={inputClass} />
            </Field>
            <Field label="Due date">
              <input name="dueDate" type="date" required className={inputClass} />
            </Field>
            <Field label="Status">
              <select name="status" className={inputClass} defaultValue={InvoiceStatus.DRAFT}>
                {Object.values(InvoiceStatus).map((status) => (
                  <option key={status} value={status}>
                    {labelize(status)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Notes">
              <input name="notes" className={inputClass} />
            </Field>
            <div className="md:col-span-3">
              <Button type="submit">Create invoice</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
