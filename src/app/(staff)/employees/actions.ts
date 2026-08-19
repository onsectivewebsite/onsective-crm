"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Department, EmployeeStatus, EmploymentType, Role } from "@prisma/client";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const employeeSchema = z.object({
  name: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid work email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  jobTitle: z.string().trim().min(1, "Job title is required."),
  department: z.nativeEnum(Department),
  employmentType: z.nativeEnum(EmploymentType),
  role: z.enum([Role.ADMIN, Role.MANAGER, Role.EMPLOYEE]),
  phone: z.string().trim().optional(),
  salary: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)),
  managerId: z.string().optional(),
  hireDate: z.string().optional(),
});

export async function createEmployee(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireAdmin();

  const parsed = employeeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;
  const data = parsed.data;

  if (await prisma.user.findUnique({ where: { email: data.email } })) {
    return `${data.email} is already used by another account.`;
  }

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await hashPassword(data.password),
      role: data.role,
      employee: {
        create: {
          jobTitle: data.jobTitle,
          department: data.department,
          employmentType: data.employmentType,
          phone: data.phone || null,
          salary: typeof data.salary === "number" ? data.salary : null,
          managerId: data.managerId || null,
          hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
        },
      },
    },
  });

  revalidatePath("/employees");
  return null;
}

export async function setEmployeeStatus(formData: FormData) {
  await requireAdmin();

  await prisma.employee.update({
    where: { id: String(formData.get("employeeId")) },
    data: { status: String(formData.get("status")) as EmployeeStatus },
  });

  revalidatePath("/employees");
}
