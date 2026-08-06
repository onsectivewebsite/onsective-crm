import { notFound } from "next/navigation";
import { TicketStatus } from "@prisma/client";
import { Badge, Button, Card, Field, PageHeader, inputClass } from "@/components/ui";
import { labelize, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { replyToTicket, setTicketStatus } from "@/lib/tickets";
import TicketThread from "@/components/ticket-thread";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { client: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!ticket) notFound();

  return (
    <>
      <PageHeader
        title={ticket.subject}
        subtitle={`${ticket.client.company} · opened ${shortDate(ticket.createdAt)}`}
        action={
          <form action={setTicketStatus} className="flex items-center gap-2">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <select
              name="status"
              defaultValue={ticket.status}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            >
              {Object.values(TicketStatus).map((status) => (
                <option key={status} value={status}>
                  {labelize(status)}
                </option>
              ))}
            </select>
            <Button type="submit" variant="ghost">
              Update
            </Button>
          </form>
        }
      />

      <div className="flex gap-2">
        <Badge value={ticket.status} />
        <Badge value={ticket.priority} />
      </div>

      <div className="mt-6">
        <Card title="Conversation">
          <TicketThread messages={ticket.messages} />
          <form action={replyToTicket} className="mt-4 space-y-3">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <Field label="Reply">
              <textarea name="body" rows={3} required className={inputClass} />
            </Field>
            <Button type="submit">Send reply</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
