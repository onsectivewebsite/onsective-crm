import Link from "next/link";
import { Badge, Card, Empty, PageHeader, Stat, Table, Td } from "@/components/ui";
import { shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export default async function TicketsPage() {
  await requireStaff();

  const tickets = await prisma.ticket.findMany({
    include: {
      client: true,
      assignee: { include: { user: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <>
      <PageHeader title="Support tickets" subtitle="Requests raised by clients through the portal." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Open" value={tickets.filter((ticket) => ticket.status === "OPEN").length} />
        <Stat label="In progress" value={tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length} />
        <Stat label="Resolved" value={tickets.filter((ticket) => ticket.status === "RESOLVED").length} />
      </div>

      <div className="mt-6">
        <Card title="All tickets">
          {tickets.length === 0 ? (
            <Empty>No tickets raised.</Empty>
          ) : (
            <Table head={["Subject", "Client", "Assignee", "Priority", "Updated", "Status"]}>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <Td>
                    <Link href={`/tickets/${ticket.id}`} className="font-medium hover:underline">
                      {ticket.subject}
                    </Link>
                    <p className="max-w-md truncate text-xs text-slate-400">{ticket.messages[0]?.body}</p>
                  </Td>
                  <Td>{ticket.client.company}</Td>
                  <Td>{ticket.assignee?.user.name ?? "Unassigned"}</Td>
                  <Td>
                    <Badge value={ticket.priority} />
                  </Td>
                  <Td>{shortDate(ticket.updatedAt)}</Td>
                  <Td>
                    <Badge value={ticket.status} />
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
