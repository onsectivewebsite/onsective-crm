import Link from "next/link";
import { notFound } from "next/navigation";
import { Priority, ProjectStatus, TaskStatus } from "@prisma/client";
import { Badge, Button, Card, Empty, Field, PageHeader, Stat, inputClass } from "@/components/ui";
import { labelize, money, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { createTask, updateProjectStatus } from "../actions";
import TaskBoard from "./task-board";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;

  const [project, employees] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        manager: { include: { user: true } },
        tasks: {
          include: { assignee: { include: { user: true } }, timeEntries: true },
          orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        },
      },
    }),
    prisma.employee.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
  ]);

  if (!project) notFound();

  const loggedHours = project.tasks.reduce(
    (sum, task) => sum + task.timeEntries.reduce((inner, entry) => inner + entry.hours, 0),
    0,
  );
  const done = project.tasks.filter((task) => task.status === "DONE").length;

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={
          <>
            <Link href={`/clients/${project.clientId}`} className="hover:underline">
              {project.client.company}
            </Link>{" "}
            · {labelize(project.service)}
          </>
        }
        action={<Badge value={project.status} />}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Budget" value={money(project.budget)} />
        <Stat label="Tasks complete" value={`${done}/${project.tasks.length}`} />
        <Stat label="Hours logged" value={loggedHours.toFixed(1)} />
        <Stat label="Due" value={shortDate(project.dueDate)} />
      </div>

      <div className="mt-6">
        <Card
          title="Delivery board"
          action={
            <form action={updateProjectStatus} className="flex items-center gap-2">
              <input type="hidden" name="projectId" value={project.id} />
              <select name="status" defaultValue={project.status} className="rounded-lg border border-slate-300 px-2 py-1 text-sm">
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>
                    {labelize(status)}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="ghost">
                Update
              </Button>
            </form>
          }
        >
          {project.tasks.length === 0 ? (
            <Empty>No tasks yet — add the first one below.</Empty>
          ) : (
            <TaskBoard
              statuses={Object.values(TaskStatus)}
              tasks={project.tasks.map((task) => ({
                id: task.id,
                title: task.title,
                status: task.status,
                priority: task.priority,
                assignee: task.assignee?.user.name ?? "Unassigned",
                dueDate: task.dueDate ? shortDate(task.dueDate) : null,
                hours: task.timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
              }))}
            />
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Add task">
          <form action={createTask} className="grid gap-4 md:grid-cols-3">
            <input type="hidden" name="projectId" value={project.id} />
            <Field label="Title">
              <input name="title" required className={inputClass} />
            </Field>
            <Field label="Assignee">
              <select name="assigneeId" className={inputClass} defaultValue="">
                <option value="">Unassigned</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.user.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select name="status" className={inputClass} defaultValue={TaskStatus.TODO}>
                {Object.values(TaskStatus).map((status) => (
                  <option key={status} value={status}>
                    {labelize(status)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select name="priority" className={inputClass} defaultValue={Priority.MEDIUM}>
                {Object.values(Priority).map((priority) => (
                  <option key={priority} value={priority}>
                    {labelize(priority)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date">
              <input name="dueDate" type="date" className={inputClass} />
            </Field>
            <Field label="Estimate (hours)">
              <input name="estimateHours" type="number" min="0" step="0.5" className={inputClass} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <input name="description" className={inputClass} />
              </Field>
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm text-slate-600">
              <input type="checkbox" name="clientVisible" defaultChecked /> Visible in client portal
            </label>
            <div className="md:col-span-3">
              <Button type="submit">Add task</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
