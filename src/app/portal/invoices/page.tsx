import { Badge, Card, Empty, PageHeader, Stat, Table, Td } from "@/components/ui";
import { money, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";

export default async function PortalInvoicesPage() {
  const user = await requireClient();

  const invoices = await prisma.invoice.findMany({
    where: { clientId: user.clientId, status: { not: "DRAFT" } },
    include: { project: true },
    orderBy: { issueDate: "desc" },
  });

  const outstanding = invoices
    .filter((invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const paid = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  return (
    <>
      <PageHeader title="Invoices" subtitle="Your billing history with Onsective Inc." />

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Outstanding" value={money(outstanding)} />
        <Stat label="Paid to date" value={money(paid)} />
      </div>

      <div className="mt-6">
        <Card title="All invoices">
          {invoices.length === 0 ? (
            <Empty>No invoices issued yet.</Empty>
          ) : (
            <Table head={["Number", "Project", "Amount", "Issued", "Due", "Status"]}>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <Td>{invoice.number}</Td>
                  <Td>{invoice.project?.name ?? "—"}</Td>
                  <Td>{money(invoice.amount)}</Td>
                  <Td>{shortDate(invoice.issueDate)}</Td>
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
