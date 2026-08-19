import { EmployeeStatus } from "@prisma/client";
import { Button, Card, Empty, PageHeader, Stat, Table, Td } from "@/components/ui";
import { labelize, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { setEmployeeStatus } from "./actions";
import EmployeeForm from "./employee-form";

export default async function EmployeesPage() {
  await requireAdmin();

  const employees = await prisma.employee.findMany({
    include: {
      user: true,
      manager: { include: { user: true } },
      tasks: { where: { status: { not: "DONE" } }, select: { id: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const active = employees.filter((employee) => employee.status === "ACTIVE").length;

  return (
    <>
      <PageHeader title="Employees" subtitle="Team directory, roles and reporting lines." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Headcount" value={employees.length} />
        <Stat label="Active" value={active} />
        <Stat label="On leave" value={employees.filter((e) => e.status === "ON_LEAVE").length} />
      </div>

      <div className="mt-6">
        <Card title="Directory">
          {employees.length === 0 ? (
            <Empty>No employees yet.</Empty>
          ) : (
            <Table head={["Name", "Role", "Department", "Manager", "Hired", "Open tasks", "Status"]}>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <Td>
                    <span className="font-medium">{employee.user.name}</span>
                    <p className="text-xs text-slate-400">{employee.user.email}</p>
                  </Td>
                  <Td>
                    {employee.jobTitle}
                    <p className="text-xs text-slate-400">{labelize(employee.user.role)}</p>
                  </Td>
                  <Td>{labelize(employee.department)}</Td>
                  <Td>{employee.manager?.user.name ?? "—"}</Td>
                  <Td>{shortDate(employee.hireDate)}</Td>
                  <Td>{employee.tasks.length}</Td>
                  <Td>
                    <form action={setEmployeeStatus} className="flex items-center gap-2">
                      <input type="hidden" name="employeeId" value={employee.id} />
                      <select
                        name="status"
                        key={employee.status}
                        defaultValue={employee.status}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      >
                        {Object.values(EmployeeStatus).map((status) => (
                          <option key={status} value={status}>
                            {labelize(status)}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" variant="ghost" className="!px-2 !py-1 text-xs">
                        Save
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
        <Card title="Onboard employee">
          <EmployeeForm managers={employees.map((employee) => ({ id: employee.id, name: employee.user.name }))} />
        </Card>
      </div>
    </>
  );
}
