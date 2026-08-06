"use server";

import { revalidatePath } from "next/cache";
import { Priority, TicketStatus } from "@prisma/client";
import { requireStaff, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createTicket(formData: FormData) {
  const user = await requireUser();
  const clientId = user.role === "CLIENT" ? user.clientId : String(formData.get("clientId") ?? "");
  if (!clientId) return;

  await prisma.ticket.create({
    data: {
      clientId,
      subject: String(formData.get("subject")),
      priority: String(formData.get("priority")) as Priority,
      assigneeId: user.role === "CLIENT" ? null : user.employeeId,
      messages: {
        create: {
          body: String(formData.get("body")),
          authorId: user.role === "CLIENT" ? null : user.employeeId,
          authorName: user.name,
          fromClient: user.role === "CLIENT",
        },
      },
    },
  });

  revalidatePath("/tickets");
  revalidatePath("/portal/tickets");
}

export async function replyToTicket(formData: FormData) {
  const user = await requireUser();
  const ticketId = String(formData.get("ticketId"));

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return;
  if (user.role === "CLIENT" && ticket.clientId !== user.clientId) return;

  await prisma.ticketMessage.create({
    data: {
      ticketId,
      body: String(formData.get("body")),
      authorId: user.role === "CLIENT" ? null : user.employeeId,
      authorName: user.name,
      fromClient: user.role === "CLIENT",
    },
  });

  if (user.role !== "CLIENT" && ticket.status === "OPEN") {
    await prisma.ticket.update({ where: { id: ticketId }, data: { status: "IN_PROGRESS" } });
  }

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath(`/portal/tickets/${ticketId}`);
}

export async function setTicketStatus(formData: FormData) {
  const user = await requireStaff();
  const ticketId = String(formData.get("ticketId"));

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: String(formData.get("status")) as TicketStatus,
      assigneeId: user.employeeId,
    },
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);
}
