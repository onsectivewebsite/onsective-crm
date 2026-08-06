import { DealStage } from "@prisma/client";
import { Card, PageHeader, Stat } from "@/components/ui";
import { money } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import DealBoard from "./deal-board";
import NewDealForm from "./new-deal-form";

export default async function PipelinePage() {
  await requireStaff();

  const [deals, clients] = await Promise.all([
    prisma.deal.findMany({
      include: { client: true, owner: { include: { user: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { company: "asc" } }),
  ]);

  const open = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
  const won = deals.filter((d) => d.stage === "WON");
  const weighted = open.reduce((sum, d) => sum + (Number(d.value) * d.probability) / 100, 0);

  return (
    <>
      <PageHeader title="Sales pipeline" subtitle="Track leads through to signed retainers." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Open deals" value={open.length} />
        <Stat label="Weighted forecast" value={money(weighted)} />
        <Stat label="Won this period" value={money(won.reduce((s, d) => s + Number(d.value), 0))} />
      </div>

      <div className="mt-6">
        <DealBoard
          stages={Object.values(DealStage)}
          deals={deals.map((deal) => ({
            id: deal.id,
            title: deal.title,
            stage: deal.stage,
            value: Number(deal.value),
            service: deal.service,
            contactName: deal.contactName,
            company: deal.client?.company ?? null,
            owner: deal.owner?.user.name ?? "Unassigned",
          }))}
        />
      </div>

      <div className="mt-6">
        <Card title="Add a deal">
          <NewDealForm clients={clients.map((c) => ({ id: c.id, company: c.company }))} />
        </Card>
      </div>
    </>
  );
}
