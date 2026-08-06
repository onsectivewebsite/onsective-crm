"use client";

import { useTransition } from "react";
import type { TaskStatus } from "@prisma/client";
import { Badge } from "@/components/ui";
import { labelize } from "@/lib/format";
import { setTaskStatus } from "../actions";

type BoardTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: string;
  assignee: string;
  dueDate: string | null;
  hours: number;
};

export default function TaskBoard({ statuses, tasks }: { statuses: TaskStatus[]; tasks: BoardTask[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`grid gap-3 md:grid-cols-3 xl:grid-cols-5 ${pending ? "opacity-70" : ""}`}>
      {statuses.map((status) => (
        <div
          key={status}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const id = event.dataTransfer.getData("text/task-id");
            if (id) startTransition(() => setTaskStatus(id, status));
          }}
          className="min-h-32 rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{labelize(status)}</p>
          <ul className="space-y-2">
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <li
                  key={task.id}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("text/task-id", task.id)}
                  className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 text-sm"
                >
                  <p className="font-medium text-slate-800">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{task.assignee}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <Badge value={task.priority} />
                    {task.dueDate && <span>{task.dueDate}</span>}
                    {task.hours > 0 && <span>{task.hours.toFixed(1)}h</span>}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
