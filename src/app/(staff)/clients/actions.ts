"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ClientStatus } from "@prisma/client";
import { hashPassword, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const clientSchema = z.object({
  company: z.string().trim().min(1, "Company is required."),
  contactName: z.string().trim().min(1, "Primary contact is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  status: z.nativeEnum(ClientStatus),
});

const portalAccountSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function createClient(_prev: string | null, formData: FormData): Promise<string | null> {
  const user = await requireStaff();

  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;
  const data = parsed.data;

  if (await prisma.client.findUnique({ where: { email: data.email } })) {
    return `A client with the email ${data.email} already exists.`;
  }

  await prisma.client.create({
    data: {
      company: data.company,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone || null,
      website: data.website || null,
      industry: data.industry || null,
      status: data.status,
      ownerId: user.employeeId,
    },
  });

  revalidatePath("/clients");
  return null;
}

export async function createPortalAccount(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireStaff();

  const parsed = portalAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;
  const data = parsed.data;

  if (await prisma.user.findUnique({ where: { email: data.email } })) {
    return `${data.email} is already used by another account.`;
  }

  await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash: await hashPassword(data.password),
      role: "CLIENT",
      clientId: data.clientId,
    },
  });

  revalidatePath(`/clients/${data.clientId}`);
  return null;
}
