"use server";

import { revalidatePath } from "next/cache";
import { Department, EmployeeStatus, EmploymentType, Role } from "@prisma/client";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createEmployee(formData: FormData) {
  await requireAdmin();

  await prisma.user.create({
    data: {
      name: String(formData.get("name")),
      email: String(formData.get("email")).toLowerCase().trim(),
      passwordHash: await hashPassword(String(formData.get("password"))),
      role: String(formData.get("role")) as Role,
      employee: {
        create: {
          jobTitle: String(formData.get("jobTitle")),
          department: String(formData.get("department")) as Department,
          employmentType: String(formData.get("employmentType")) as EmploymentType,
          phone: String(formData.get("phone") ?? "") || null,
          salary: formData.get("salary") ? Number(formData.get("salary")) : null,
          managerId: String(formData.get("managerId") ?? "") || null,
          hireDate: formData.get("hireDate") ? new Date(String(formData.get("hireDate"))) : new Date(),
        },
      },
    },
  });

  revalidatePath("/employees");
}

export async function setEmployeeStatus(formData: FormData) {
  await requireAdmin();

  await prisma.employee.update({
    where: { id: String(formData.get("employeeId")) },
    data: { status: String(formData.get("status")) as EmployeeStatus },
  });

  revalidatePath("/employees");
}
