import { notFound } from "next/navigation";
import { Badge, Button, Card, Field, PageHeader, inputClass } from "@/components/ui";
import { shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";
import { replyToTicket } from "@/lib/tickets";
import TicketThread from "@/components/ticket-thread";

export default async function PortalTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireClient();
  const { id } = await params;

  const ticket = await prisma.ticket.findFirst({
    where: { id, clientId: user.clientId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!ticket) notFound();

  return (
    <>
      <PageHeader
        title={ticket.subject}
        subtitle={`Opened ${shortDate(ticket.createdAt)}`}
        action={<Badge value={ticket.status} />}
      />

      <Card title="Conversation">
        <TicketThread messages={ticket.messages} />
        {ticket.status !== "CLOSED" && (
          <form action={replyToTicket} className="mt-4 space-y-3">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <Field label="Add a message">
              <textarea name="body" rows={3} required className={inputClass} />
            </Field>
            <Button type="submit">Send</Button>
          </form>
        )}
      </Card>
    </>
  );
}
