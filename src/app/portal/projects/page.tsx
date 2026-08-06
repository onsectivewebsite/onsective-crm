import { Badge, Card, Empty, PageHeader, Table, Td } from "@/components/ui";
import { labelize, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";

export default async function PortalProjectsPage() {
  const user = await requireClient();

  const projects = await prisma.project.findMany({
    where: { clientId: user.clientId },
    include: {
      manager: { include: { user: true } },
      tasks: { where: { clientVisible: true }, orderBy: [{ status: "asc" }, { dueDate: "asc" }] },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="My projects" subtitle="Live status of every engagement with Onsective." />

      {projects.length === 0 ? (
        <Card>
          <Empty>No projects yet.</Empty>
        </Card>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              title={`${project.name} — ${labelize(project.service)}`}
              action={<Badge value={project.status} />}
            >
              <p className="mb-4 text-sm text-slate-500">
                Managed by {project.manager?.user.name ?? "Onsective team"} · Due {shortDate(project.dueDate)}
              </p>
              {project.tasks.length === 0 ? (
                <Empty>Work is being planned — check back soon.</Empty>
              ) : (
                <Table head={["Deliverable", "Due", "Status"]}>
                  {project.tasks.map((task) => (
                    <tr key={task.id}>
                      <Td>
                        {task.title}
                        {task.description && <p className="text-xs text-slate-400">{task.description}</p>}
                      </Td>
                      <Td>{shortDate(task.dueDate)}</Td>
                      <Td>
                        <Badge value={task.status} />
                      </Td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
