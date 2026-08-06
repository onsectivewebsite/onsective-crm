import Shell from "@/components/shell";
import type { NavItem } from "@/components/nav";
import { isAdmin, requireStaff } from "@/lib/auth";
import { labelize } from "@/lib/format";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();

  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", group: "Overview" },
    { href: "/pipeline", label: "Sales Pipeline", group: "Revenue" },
    { href: "/clients", label: "Clients", group: "Revenue" },
    { href: "/invoices", label: "Invoices", group: "Revenue" },
    { href: "/projects", label: "Projects", group: "Delivery" },
    { href: "/tasks", label: "My Tasks", group: "Delivery" },
    { href: "/tickets", label: "Support Tickets", group: "Delivery" },
    { href: "/leave", label: "Leave Requests", group: "People" },
  ];
  if (isAdmin(user)) items.push({ href: "/employees", label: "Employees", group: "People" });

  return (
    <Shell items={items} user={{ ...user, role: labelize(user.role) }} badge={labelize(user.role)}>
      {children}
    </Shell>
  );
}
