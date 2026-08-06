import { Department, EmployeeStatus, EmploymentType, Role } from "@prisma/client";
import { Button, Card, Empty, Field, PageHeader, Stat, Table, Td, inputClass } from "@/components/ui";
import { labelize, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createEmployee, setEmployeeStatus } from "./actions";

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
          <form action={createEmployee} className="grid gap-4 md:grid-cols-3">
            <Field label="Full name">
              <input name="name" required className={inputClass} />
            </Field>
            <Field label="Work email">
              <input name="email" type="email" required className={inputClass} />
            </Field>
            <Field label="Temporary password">
              <input name="password" type="text" required minLength={8} className={inputClass} />
            </Field>
            <Field label="Job title">
              <input name="jobTitle" required className={inputClass} />
            </Field>
            <Field label="Department">
              <select name="department" className={inputClass} defaultValue={Department.SEO}>
                {Object.values(Department).map((department) => (
                  <option key={department} value={department}>
                    {labelize(department)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="System role">
              <select name="role" className={inputClass} defaultValue={Role.EMPLOYEE}>
                {[Role.ADMIN, Role.MANAGER, Role.EMPLOYEE].map((role) => (
                  <option key={role} value={role}>
                    {labelize(role)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Employment type">
              <select name="employmentType" className={inputClass} defaultValue={EmploymentType.FULL_TIME}>
                {Object.values(EmploymentType).map((type) => (
                  <option key={type} value={type}>
                    {labelize(type)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reports to">
              <select name="managerId" className={inputClass} defaultValue="">
                <option value="">No manager</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.user.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <input name="phone" className={inputClass} />
            </Field>
            <Field label="Annual salary (USD)">
              <input name="salary" type="number" min="0" step="1000" className={inputClass} />
            </Field>
            <Field label="Hire date">
              <input name="hireDate" type="date" className={inputClass} />
            </Field>
            <div className="md:col-span-3">
              <Button type="submit">Add employee</Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
