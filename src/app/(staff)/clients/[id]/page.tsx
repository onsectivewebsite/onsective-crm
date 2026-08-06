import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card, Empty, Field, PageHeader, Stat, Table, Td, inputClass } from "@/components/ui";
import { labelize, money, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { logActivity } from "../../pipeline/actions";
import { createPortalAccount } from "../actions";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      owner: { include: { user: true } },
      users: true,
      deals: { orderBy: { updatedAt: "desc" } },
      projects: { include: { manager: { include: { user: true } } }, orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { issueDate: "desc" } },
      tickets: { orderBy: { createdAt: "desc" } },
      activities: { include: { author: { include: { user: true } } }, orderBy: { createdAt: "desc" }, take: 15 },
    },
  });

  if (!client) notFound();

  const billed = client.invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const outstanding = client.invoices
    .filter((invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  return (
    <>
      <PageHeader
        title={client.company}
        subtitle={`${client.contactName} · ${client.email}${client.phone ? ` · ${client.phone}` : ""}`}
        action={<Badge value={client.status} />}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Account owner" value={client.owner?.user.name ?? "Unassigned"} />
        <Stat label="Lifetime billed" value={money(billed)} />
        <Stat label="Outstanding" value={money(outstanding)} />
        <Stat label="Portal accounts" value={client.users.length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Projects">
          {client.projects.length === 0 ? (
            <Empty>No projects yet.</Empty>
          ) : (
            <Table head={["Project", "Service", "Manager", "Status"]}>
              {client.projects.map((project) => (
                <tr key={project.id}>
                  <Td>
                    <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                      {project.name}
                    </Link>
                  </Td>
                  <Td>{labelize(project.service)}</Td>
                  <Td>{project.manager?.user.name ?? "—"}</Td>
                  <Td>
                    <Badge value={project.status} />
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card title="Deals">
          {client.deals.length === 0 ? (
            <Empty>No deals recorded.</Empty>
          ) : (
            <Table head={["Deal", "Value", "Stage"]}>
              {client.deals.map((deal) => (
                <tr key={deal.id}>
                  <Td>{deal.title}</Td>
                  <Td>{money(deal.value)}</Td>
                  <Td>
                    <Badge value={deal.stage} />
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card title="Invoices">
          {client.invoices.length === 0 ? (
            <Empty>No invoices issued.</Empty>
          ) : (
            <Table head={["Number", "Amount", "Due", "Status"]}>
              {client.invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <Td>{invoice.number}</Td>
                  <Td>{money(invoice.amount)}</Td>
                  <Td>{shortDate(invoice.dueDate)}</Td>
                  <Td>
                    <Badge value={invoice.status} />
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card title="Activity">
          <form action={logActivity} className="mb-4 space-y-3">
            <input type="hidden" name="clientId" value={client.id} />
            <Field label="Type">
              <select name="type" className={inputClass} defaultValue="NOTE">
                {["NOTE", "CALL", "EMAIL", "MEETING"].map((type) => (
                  <option key={type} value={type}>
                    {labelize(type)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Details">
              <textarea name="body" required rows={2} className={inputClass} />
            </Field>
            <Button type="submit">Log activity</Button>
          </form>
          {client.activities.length === 0 ? (
            <Empty>No activity logged.</Empty>
          ) : (
            <ul className="space-y-3 text-sm">
              {client.activities.map((activity) => (
                <li key={activity.id} className="border-t border-slate-100 pt-3 first:border-0 first:pt-0">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Badge value={activity.type} />
                    {activity.author?.user.name ?? "System"} · {shortDate(activity.createdAt)}
                  </div>
                  <p className="mt-1 text-slate-700">{activity.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Client portal access">
          {client.users.length > 0 && (
            <ul className="mb-4 space-y-1 text-sm text-slate-600">
              {client.users.map((portalUser) => (
                <li key={portalUser.id}>
                  {portalUser.name} — {portalUser.email}
                </li>
              ))}
            </ul>
          )}
          <form action={createPortalAccount} className="grid gap-4 md:grid-cols-4">
            <input type="hidden" name="clientId" value={client.id} />
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
              <Button type="submit">Invite to portal</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
