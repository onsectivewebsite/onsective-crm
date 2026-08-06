import Link from "next/link";
import { ProjectStatus, Service } from "@prisma/client";
import { Badge, Button, Card, Empty, Field, PageHeader, Table, Td, inputClass } from "@/components/ui";
import { labelize, money, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { createProject } from "./actions";

export default async function ProjectsPage() {
  await requireStaff();

  const [projects, clients, employees] = await Promise.all([
    prisma.project.findMany({
      include: {
        client: true,
        manager: { include: { user: true } },
        tasks: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { company: "asc" } }),
    prisma.employee.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
  ]);

  return (
    <>
      <PageHeader title="Projects" subtitle="Delivery pipeline across every client engagement." />

      <Card title={`${projects.length} projects`}>
        {projects.length === 0 ? (
          <Empty>No projects yet.</Empty>
        ) : (
          <Table head={["Project", "Client", "Service", "Manager", "Progress", "Due", "Status"]}>
            {projects.map((project) => {
              const done = project.tasks.filter((task) => task.status === "DONE").length;
              const pct = project.tasks.length ? Math.round((done / project.tasks.length) * 100) : 0;
              return (
                <tr key={project.id}>
                  <Td>
                    <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                      {project.name}
                    </Link>
                    <p className="text-xs text-slate-400">{money(project.budget)} budget</p>
                  </Td>
                  <Td>{project.client.company}</Td>
                  <Td>{labelize(project.service)}</Td>
                  <Td>{project.manager?.user.name ?? "—"}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-slate-200">
                        <div className="h-1.5 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{pct}%</span>
                    </div>
                  </Td>
                  <Td>{shortDate(project.dueDate)}</Td>
                  <Td>
                    <Badge value={project.status} />
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      <div className="mt-6">
        <Card title="New project">
          <form action={createProject} className="grid gap-4 md:grid-cols-3">
            <Field label="Name">
              <input name="name" required className={inputClass} />
            </Field>
            <Field label="Client">
              <select name="clientId" required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select client
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Service">
              <select name="service" className={inputClass} defaultValue={Service.SEO}>
                {Object.values(Service).map((service) => (
                  <option key={service} value={service}>
                    {labelize(service)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Project manager">
              <select name="managerId" className={inputClass} defaultValue="">
                <option value="">Unassigned</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.user.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select name="status" className={inputClass} defaultValue={ProjectStatus.PLANNING}>
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>
                    {labelize(status)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Budget (USD)">
              <input name="budget" type="number" min="0" step="100" defaultValue={0} className={inputClass} />
            </Field>
            <Field label="Due date">
              <input name="dueDate" type="date" className={inputClass} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <input name="description" className={inputClass} />
              </Field>
            </div>
            <div className="md:col-span-3">
              <Button type="submit">Create project</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
