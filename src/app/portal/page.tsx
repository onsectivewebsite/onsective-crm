import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, Empty, PageHeader, Stat, Table, Td } from "@/components/ui";
import { labelize, money, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";

export default async function PortalHome() {
  const user = await requireClient();

  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    include: {
      owner: { include: { user: true } },
      projects: { include: { tasks: { select: { status: true, clientVisible: true } } }, orderBy: { createdAt: "desc" } },
      invoices: { where: { status: { not: "DRAFT" } }, orderBy: { dueDate: "asc" } },
      tickets: { orderBy: { updatedAt: "desc" }, take: 5 },
    },
  });

  if (!client) notFound();

  const outstanding = client.invoices
    .filter((invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const activeProjects = client.projects.filter((project) =>
    ["PLANNING", "IN_PROGRESS", "REVIEW"].includes(project.status),
  );

  return (
    <>
      <PageHeader
        title={`Hello, ${client.company}`}
        subtitle={`Your Onsective account manager is ${client.owner?.user.name ?? "being assigned"}.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active projects" value={activeProjects.length} />
        <Stat label="Outstanding balance" value={money(outstanding)} />
        <Stat label="Open tickets" value={client.tickets.filter((t) => t.status !== "CLOSED").length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Project progress">
          {client.projects.length === 0 ? (
            <Empty>No projects yet.</Empty>
          ) : (
            <Table head={["Project", "Service", "Progress", "Status"]}>
              {client.projects.map((project) => {
                const visible = project.tasks.filter((task) => task.clientVisible);
                const done = visible.filter((task) => task.status === "DONE").length;
                const pct = visible.length ? Math.round((done / visible.length) * 100) : 0;
                return (
                  <tr key={project.id}>
                    <Td>
                      <Link href="/portal/projects" className="font-medium hover:underline">
                        {project.name}
                      </Link>
                    </Td>
                    <Td>{labelize(project.service)}</Td>
                    <Td>{pct}%</Td>
                    <Td>
                      <Badge value={project.status} />
                    </Td>
                  </tr>
                );
              })}
            </Table>
          )}
        </Card>

        <Card title="Upcoming invoices">
          {client.invoices.length === 0 ? (
            <Empty>Nothing billed yet.</Empty>
          ) : (
            <Table head={["Number", "Amount", "Due", "Status"]}>
              {client.invoices.slice(0, 6).map((invoice) => (
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
      </div>
    </>
  );
}
