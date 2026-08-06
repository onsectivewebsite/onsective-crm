import Shell from "@/components/shell";
import type { NavItem } from "@/components/nav";
import { requireClient } from "@/lib/auth";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireClient();

  const items: NavItem[] = [
    { href: "/portal", label: "Overview", group: "Portal" },
    { href: "/portal/projects", label: "My Projects", group: "Portal" },
    { href: "/portal/invoices", label: "Invoices", group: "Portal" },
    { href: "/portal/tickets", label: "Support", group: "Portal" },
  ];

  return (
    <Shell items={items} user={{ ...user, role: "Client" }} badge="Client Portal">
      {children}
    </Shell>
  );
}
