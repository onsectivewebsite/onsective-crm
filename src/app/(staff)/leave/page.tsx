import { LeaveType } from "@prisma/client";
import { Badge, Button, Card, Empty, Field, PageHeader, Table, Td, inputClass } from "@/components/ui";
import { labelize, shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { isAdmin, requireStaff } from "@/lib/auth";
import { requestLeave, reviewLeave } from "./actions";

export default async function LeavePage() {
  const user = await requireStaff();
  const admin = isAdmin(user);

  const requests = await prisma.leaveRequest.findMany({
    where: admin ? {} : { employeeId: user.employeeId ?? "none" },
    include: { employee: { include: { user: true } }, reviewer: { include: { user: true } } },
    orderBy: [{ startDate: "desc" }, { id: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Leave requests"
        subtitle={admin ? "Approve or reject time-off across the team." : "Your time-off history."}
      />

      <Card title={admin ? "All requests" : "My requests"}>
        {requests.length === 0 ? (
          <Empty>No leave requests.</Empty>
        ) : (
          <Table head={["Employee", "Type", "Dates", "Reason", "Reviewer", "Status", ...(admin ? ["Action"] : [])]}>
            {requests.map((request) => (
              <tr key={request.id}>
                <Td>{request.employee.user.name}</Td>
                <Td>{labelize(request.type)}</Td>
                <Td>
                  {shortDate(request.startDate)} → {shortDate(request.endDate)}
                </Td>
                <Td className="max-w-xs">{request.reason}</Td>
                <Td>{request.reviewer?.user.name ?? "—"}</Td>
                <Td>
                  <Badge value={request.status} />
                </Td>
                {admin && (
                  <Td>
                    {request.status === "PENDING" ? (
                      <div className="flex gap-1">
                        <form action={reviewLeave}>
                          <input type="hidden" name="leaveId" value={request.id} />
                          <input type="hidden" name="status" value="APPROVED" />
                          <Button type="submit" variant="ghost" className="!px-2 !py-1 text-xs">
                            Approve
                          </Button>
                        </form>
                        <form action={reviewLeave}>
                          <input type="hidden" name="leaveId" value={request.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <Button type="submit" variant="ghost" className="!px-2 !py-1 text-xs">
                            Reject
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Reviewed</span>
                    )}
                  </Td>
                )}
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {user.employeeId && (
        <div className="mt-6">
          <Card title="Request time off">
            <form action={requestLeave} className="grid gap-4 md:grid-cols-4">
              <Field label="Type">
                <select name="type" className={inputClass} defaultValue={LeaveType.PAID}>
                  {Object.values(LeaveType).map((type) => (
                    <option key={type} value={type}>
                      {labelize(type)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="From">
                <input name="startDate" type="date" required className={inputClass} />
              </Field>
              <Field label="To">
                <input name="endDate" type="date" required className={inputClass} />
              </Field>
              <Field label="Reason">
                <input name="reason" required className={inputClass} />
              </Field>
              <div className="md:col-span-4">
                <Button type="submit">Submit request</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
