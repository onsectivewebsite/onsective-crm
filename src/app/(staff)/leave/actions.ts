"use server";

import { revalidatePath } from "next/cache";
import { LeaveStatus, LeaveType } from "@prisma/client";
import { isAdmin, requireAdmin, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requestLeave(formData: FormData) {
  const user = await requireStaff();
  if (!user.employeeId) return;

  await prisma.leaveRequest.create({
    data: {
      employeeId: user.employeeId,
      type: String(formData.get("type")) as LeaveType,
      startDate: new Date(String(formData.get("startDate"))),
      endDate: new Date(String(formData.get("endDate"))),
      reason: String(formData.get("reason")),
    },
  });

  revalidatePath("/leave");
}

export async function reviewLeave(formData: FormData) {
  const user = await requireAdmin();
  if (!isAdmin(user)) return;

  await prisma.leaveRequest.update({
    where: { id: String(formData.get("leaveId")) },
    data: {
      status: String(formData.get("status")) as LeaveStatus,
      reviewerId: user.employeeId,
    },
  });

  revalidatePath("/leave");
}
