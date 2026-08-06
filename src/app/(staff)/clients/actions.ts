"use server";

import { revalidatePath } from "next/cache";
import { ClientStatus } from "@prisma/client";
import { hashPassword, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createClient(formData: FormData) {
  const user = await requireStaff();

  await prisma.client.create({
    data: {
      company: String(formData.get("company")),
      contactName: String(formData.get("contactName")),
      email: String(formData.get("email")).toLowerCase().trim(),
      phone: String(formData.get("phone") ?? "") || null,
      website: String(formData.get("website") ?? "") || null,
      industry: String(formData.get("industry") ?? "") || null,
      status: String(formData.get("status")) as ClientStatus,
      ownerId: user.employeeId,
    },
  });

  revalidatePath("/clients");
}

export async function createPortalAccount(formData: FormData) {
  await requireStaff();
  const clientId = String(formData.get("clientId"));
  const email = String(formData.get("email")).toLowerCase().trim();

  await prisma.user.create({
    data: {
      email,
      name: String(formData.get("name")),
      passwordHash: await hashPassword(String(formData.get("password"))),
      role: "CLIENT",
      clientId,
    },
  });

  revalidatePath(`/clients/${clientId}`);
}
