"use client";

import { useTransition } from "react";
import { TaskStatus } from "@prisma/client";
import { labelize } from "@/lib/format";
import { setTaskStatus } from "../projects/actions";

export default function TaskStatusSelect({ taskId, status }: { taskId: string; status: TaskStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label="Task status"
      disabled={pending}
      value={status}
      onChange={(event) => startTransition(() => setTaskStatus(taskId, event.target.value as TaskStatus))}
      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
    >
      {Object.values(TaskStatus).map((option) => (
        <option key={option} value={option}>
          {labelize(option)}
        </option>
      ))}
    </select>
  );
}
