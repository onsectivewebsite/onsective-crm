"use server";

import { revalidatePath } from "next/cache";
import { InvoiceStatus, Prisma } from "@prisma/client";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function nextInvoiceNumber(year: number) {
  const prefix = `ONS-${year}-`;
  const latest = await prisma.invoice.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const sequence = latest ? Number(latest.number.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(sequence).padStart(4, "0")}`;
}

export async function createInvoice(formData: FormData) {
  await requireStaff();

  const data = {
    clientId: String(formData.get("clientId")),
    projectId: String(formData.get("projectId") ?? "") || null,
    amount: Number(formData.get("amount")),
    status: String(formData.get("status")) as InvoiceStatus,
    dueDate: new Date(String(formData.get("dueDate"))),
    notes: String(formData.get("notes") ?? "") || null,
  };

  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await prisma.invoice.create({ data: { ...data, number: await nextInvoiceNumber(year) } });
      break;
    } catch (error) {
      const conflict =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!conflict || attempt === 4) throw error;
    }
  }

  revalidatePath("/invoices");
}

export async function setInvoiceStatus(formData: FormData) {
  await requireStaff();

  await prisma.invoice.update({
    where: { id: String(formData.get("invoiceId")) },
    data: { status: String(formData.get("status")) as InvoiceStatus },
  });

  revalidatePath("/invoices");
  revalidatePath("/portal");
  revalidatePath("/portal/invoices");
}
