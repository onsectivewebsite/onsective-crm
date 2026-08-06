import Link from "next/link";
import { Badge, Button, Card, Empty, PageHeader, Stat, Table, Td, inputClass } from "@/components/ui";
import { shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { logTime } from "../projects/actions";
import TaskStatusSelect from "./task-status-select";

export default async function MyTasksPage() {
  const user = await requireStaff();

  if (!user.employeeId) {
    return (
      <>
        <PageHeader title="My tasks" />
        <Card>
          <Empty>Your login is not linked to an employee record yet.</Empty>
        </Card>
      </>
    );
  }

  const [tasks, entries] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: user.employeeId },
      include: { project: { include: { client: true } }, timeEntries: true },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    }),
    prisma.timeEntry.findMany({
      where: { employeeId: user.employeeId },
      include: { task: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  const open = tasks.filter((task) => task.status !== "DONE");
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <>
      <PageHeader title="My tasks" subtitle="Everything assigned to you across client projects." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Open tasks" value={open.length} />
        <Stat label="Completed" value={tasks.length - open.length} />
        <Stat label="Recent hours logged" value={totalHours.toFixed(1)} />
      </div>

      <div className="mt-6">
        <Card title="Assigned work">
          {tasks.length === 0 ? (
            <Empty>Nothing assigned yet.</Empty>
          ) : (
            <Table head={["Task", "Project", "Client", "Due", "Priority", "Status", "Log time"]}>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <Td>{task.title}</Td>
                  <Td>
                    <Link href={`/projects/${task.projectId}`} className="hover:underline">
                      {task.project.name}
                    </Link>
                  </Td>
                  <Td>{task.project.client.company}</Td>
                  <Td>{shortDate(task.dueDate)}</Td>
                  <Td>
                    <Badge value={task.priority} />
                  </Td>
                  <Td>
                    <TaskStatusSelect taskId={task.id} status={task.status} />
                  </Td>
                  <Td>
                    <form action={logTime} className="flex items-center gap-1">
                      <input type="hidden" name="taskId" value={task.id} />
                      <input
                        name="hours"
                        type="number"
                        min="0.25"
                        step="0.25"
                        required
                        className={`${inputClass} w-20`}
                        placeholder="h"
                      />
                      <Button type="submit" variant="ghost">
                        Log
                      </Button>
                    </form>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Recent time entries">
          {entries.length === 0 ? (
            <Empty>No time logged yet.</Empty>
          ) : (
            <Table head={["Date", "Task", "Hours"]}>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <Td>{shortDate(entry.date)}</Td>
                  <Td>{entry.task.title}</Td>
                  <Td>{entry.hours.toFixed(2)}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}
