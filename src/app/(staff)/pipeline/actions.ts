"use server";

import { revalidatePath } from "next/cache";
import { DealStage, Service } from "@prisma/client";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stageProbability: Record<DealStage, number> = {
  LEAD: 10,
  QUALIFIED: 25,
  PROPOSAL: 50,
  NEGOTIATION: 75,
  WON: 100,
  LOST: 0,
};

export async function createDeal(formData: FormData) {
  const user = await requireStaff();
  const clientId = String(formData.get("clientId") ?? "");

  await prisma.deal.create({
    data: {
      title: String(formData.get("title")),
      contactName: String(formData.get("contactName")),
      contactEmail: String(formData.get("contactEmail") ?? "") || null,
      service: String(formData.get("service")) as Service,
      value: Number(formData.get("value") ?? 0),
      source: String(formData.get("source") ?? "") || null,
      stage: String(formData.get("stage")) as DealStage,
      probability: stageProbability[String(formData.get("stage")) as DealStage],
      clientId: clientId || null,
      ownerId: user.employeeId,
      expectedCloseDate: formData.get("expectedCloseDate")
        ? new Date(String(formData.get("expectedCloseDate")))
        : null,
    },
  });

  revalidatePath("/pipeline");
}

export async function moveDeal(dealId: string, stage: DealStage) {
  const user = await requireStaff();
  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: { stage, probability: stageProbability[stage] },
  });

  await prisma.activity.create({
    data: {
      type: "STAGE_CHANGE",
      body: `${deal.title} moved to ${stage.toLowerCase().replace("_", " ")}`,
      dealId,
      clientId: deal.clientId,
      authorId: user.employeeId,
    },
  });

  if (stage === "WON" && deal.clientId) {
    await prisma.client.update({ where: { id: deal.clientId }, data: { status: "ACTIVE" } });
  }

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
}

export async function logActivity(formData: FormData) {
  const user = await requireStaff();
  const dealId = String(formData.get("dealId") ?? "") || null;
  const clientId = String(formData.get("clientId") ?? "") || null;

  await prisma.activity.create({
    data: {
      type: (formData.get("type") as "NOTE" | "CALL" | "EMAIL" | "MEETING") ?? "NOTE",
      body: String(formData.get("body")),
      dealId,
      clientId,
      authorId: user.employeeId,
    },
  });

  revalidatePath("/pipeline");
  if (clientId) revalidatePath(`/clients/${clientId}`);
}
