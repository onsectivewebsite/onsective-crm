import Link from "next/link";
import { Priority } from "@prisma/client";
import { Badge, Button, Card, Empty, Field, PageHeader, Table, Td, inputClass } from "@/components/ui";
import { labelize, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";
import { createTicket } from "@/lib/tickets";

export default async function PortalTicketsPage() {
  const user = await requireClient();

  const tickets = await prisma.ticket.findMany({
    where: { clientId: user.clientId },
    include: { assignee: { include: { user: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Support" subtitle="Raise a request and track our response." />

      <Card title="Your requests">
        {tickets.length === 0 ? (
          <Empty>No requests yet.</Empty>
        ) : (
          <Table head={["Subject", "Owner", "Priority", "Updated", "Status"]}>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <Td>
                  <Link href={`/portal/tickets/${ticket.id}`} className="font-medium hover:underline">
                    {ticket.subject}
                  </Link>
                </Td>
                <Td>{ticket.assignee?.user.name ?? "Onsective team"}</Td>
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

      <div className="mt-6">
        <Card title="New request">
          <form action={createTicket} className="grid gap-4 md:grid-cols-2">
            <Field label="Subject">
              <input name="subject" required className={inputClass} />
            </Field>
            <Field label="Priority">
              <select name="priority" className={inputClass} defaultValue={Priority.MEDIUM}>
                {Object.values(Priority).map((priority) => (
                  <option key={priority} value={priority}>
                    {labelize(priority)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Details">
                <textarea name="body" rows={3} required className={inputClass} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Submit request</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
