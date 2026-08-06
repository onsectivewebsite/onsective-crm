"use server";

import { revalidatePath } from "next/cache";
import { InvoiceStatus } from "@prisma/client";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createInvoice(formData: FormData) {
  await requireStaff();

  const count = await prisma.invoice.count();
  const number = `ONS-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  await prisma.invoice.create({
    data: {
      number,
      clientId: String(formData.get("clientId")),
      projectId: String(formData.get("projectId") ?? "") || null,
      amount: Number(formData.get("amount")),
      status: String(formData.get("status")) as InvoiceStatus,
      dueDate: new Date(String(formData.get("dueDate"))),
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  revalidatePath("/invoices");
}

export async function setInvoiceStatus(formData: FormData) {
  await requireStaff();

  await prisma.invoice.update({
    where: { id: String(formData.get("invoiceId")) },
    data: { status: String(formData.get("status")) as InvoiceStatus },
  });

  revalidatePath("/invoices");
}
