"use server";

import { revalidatePath } from "next/cache";
import { Priority, ProjectStatus, Service, TaskStatus } from "@prisma/client";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createProject(formData: FormData) {
  await requireStaff();

  await prisma.project.create({
    data: {
      name: String(formData.get("name")),
      description: String(formData.get("description") ?? "") || null,
      clientId: String(formData.get("clientId")),
      service: String(formData.get("service")) as Service,
      status: String(formData.get("status")) as ProjectStatus,
      budget: Number(formData.get("budget") ?? 0),
      managerId: String(formData.get("managerId") ?? "") || null,
      dueDate: formData.get("dueDate") ? new Date(String(formData.get("dueDate"))) : null,
    },
  });

  revalidatePath("/projects");
}

export async function updateProjectStatus(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("projectId"));

  await prisma.project.update({
    where: { id },
    data: { status: String(formData.get("status")) as ProjectStatus },
  });

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
}

export async function createTask(formData: FormData) {
  await requireStaff();
  const projectId = String(formData.get("projectId"));

  await prisma.task.create({
    data: {
      projectId,
      title: String(formData.get("title")),
      description: String(formData.get("description") ?? "") || null,
      status: String(formData.get("status")) as TaskStatus,
      priority: String(formData.get("priority")) as Priority,
      assigneeId: String(formData.get("assigneeId") ?? "") || null,
      estimateHours: formData.get("estimateHours") ? Number(formData.get("estimateHours")) : null,
      clientVisible: formData.get("clientVisible") === "on",
      dueDate: formData.get("dueDate") ? new Date(String(formData.get("dueDate"))) : null,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
}

export async function setTaskStatus(taskId: string, status: TaskStatus) {
  await requireStaff();
  const task = await prisma.task.update({ where: { id: taskId }, data: { status } });

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function logTime(formData: FormData) {
  const user = await requireStaff();
  if (!user.employeeId) return;
  const taskId = String(formData.get("taskId"));

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      timeEntries: {
        create: {
          employeeId: user.employeeId,
          hours: Number(formData.get("hours")),
          note: String(formData.get("note") ?? "") || null,
        },
      },
    },
  });

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/tasks");
}
