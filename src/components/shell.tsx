import type { ReactNode } from "react";
import { logout } from "@/app/login/actions";
import Nav, { type NavItem } from "./nav";

export default function Shell({
  items,
  user,
  badge,
  children,
}: {
  items: NavItem[];
  user: { name: string; email: string; role: string };
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <div className="px-3 pb-6">
          <p className="text-sm font-semibold text-slate-900">Onsective OS</p>
          <p className="text-xs text-slate-400">{badge}</p>
        </div>
        <Nav items={items} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="md:hidden text-sm font-semibold text-slate-900">Onsective OS</div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <form action={logout}>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-6">{children}</main>
      </div>
    </div>
  );
}
