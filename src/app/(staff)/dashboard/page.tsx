import Link from "next/link";
import { Badge, Card, Empty, PageHeader, Stat, Table, Td } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { money, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireStaff();

  const [clients, openDeals, projects, openTickets, unpaid, myTasks, recentActivities] = await Promise.all([
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.deal.findMany({ where: { stage: { notIn: ["WON", "LOST"] } }, select: { value: true } }),
    prisma.project.count({ where: { status: { in: ["PLANNING", "IN_PROGRESS", "REVIEW"] } } }),
    prisma.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.invoice.findMany({ where: { status: { in: ["SENT", "OVERDUE"] } }, select: { amount: true } }),
    user.employeeId
      ? prisma.task.findMany({
          where: { assigneeId: user.employeeId, status: { not: "DONE" } },
          include: { project: { include: { client: true } } },
          orderBy: [{ dueDate: "asc" }],
          take: 8,
        })
      : Promise.resolve([]),
    prisma.activity.findMany({
      include: { deal: true, client: true, author: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const pipelineValue = openDeals.reduce((sum, deal) => sum + Number(deal.value), 0);
  const receivables = unpaid.reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} subtitle="Company-wide snapshot for Onsective Inc." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Active clients" value={clients} />
        <Stat label="Open pipeline" value={money(pipelineValue)} hint={`${openDeals.length} live deals`} />
        <Stat label="Active projects" value={projects} />
        <Stat label="Open tickets" value={openTickets} />
        <Stat label="Receivables" value={money(receivables)} hint="Sent + overdue" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="My open tasks">
          {myTasks.length === 0 ? (
            <Empty>Nothing assigned to you right now.</Empty>
          ) : (
            <Table head={["Task", "Client", "Due", "Status"]}>
              {myTasks.map((task) => (
                <tr key={task.id}>
                  <Td>
                    <Link href={`/projects/${task.projectId}`} className="font-medium hover:underline">
                      {task.title}
                    </Link>
                  </Td>
                  <Td>{task.project.client.company}</Td>
                  <Td>{shortDate(task.dueDate)}</Td>
                  <Td>
                    <Badge value={task.status} />
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card title="Latest CRM activity">
          {recentActivities.length === 0 ? (
            <Empty>No activity logged yet.</Empty>
          ) : (
            <ul className="space-y-4">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <Badge value={activity.type} />
                    <span className="text-slate-500">
                      {activity.deal?.title ?? activity.client?.company ?? "General"} ·{" "}
                      {shortDate(activity.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700">{activity.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
