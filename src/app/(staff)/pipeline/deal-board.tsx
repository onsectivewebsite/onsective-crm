"use client";

import { useTransition } from "react";
import type { DealStage } from "@prisma/client";
import { labelize, money } from "@/lib/format";
import { moveDeal } from "./actions";

type BoardDeal = {
  id: string;
  title: string;
  stage: DealStage;
  value: number;
  probability: number;
  service: string;
  contactName: string;
  company: string | null;
  owner: string;
};

export default function DealBoard({ stages, deals }: { stages: DealStage[]; deals: BoardDeal[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 ${pending ? "opacity-70" : ""}`}>
      {stages.map((stage) => {
        const stageDeals = deals.filter((deal) => deal.stage === stage);
        const total = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
        return (
          <div
            key={stage}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const id = event.dataTransfer.getData("text/deal-id");
              if (id) startTransition(() => moveDeal(id, stage));
            }}
            className="min-h-40 min-w-0 rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{labelize(stage)}</p>
              <span className="text-xs text-slate-400">{stageDeals.length}</span>
            </div>
            <p className="mb-3 text-xs text-slate-400">{money(total)}</p>
            <ul className="space-y-2">
              {stageDeals.map((deal) => (
                <li
                  key={deal.id}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("text/deal-id", deal.id)}
                  className="cursor-grab break-words rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm active:cursor-grabbing"
                >
                  <p className="font-medium text-slate-800">{deal.title}</p>
                  <p className="text-xs text-slate-500">{deal.company ?? deal.contactName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {labelize(deal.service)} · {deal.probability}%
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{money(deal.value)}</span>
                    <span className="text-slate-400">{deal.owner}</span>
                  </div>
                  <select
                    aria-label={`Move ${deal.title}`}
                    value={deal.stage}
                    onChange={(event) =>
                      startTransition(() => moveDeal(deal.id, event.target.value as DealStage))
                    }
                    className="mt-2 w-full rounded border border-slate-300 bg-white px-1 py-1 text-xs"
                  >
                    {stages.map((option) => (
                      <option key={option} value={option}>
                        {labelize(option)}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
