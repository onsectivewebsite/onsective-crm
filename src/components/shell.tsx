"use client";

import { useState, type ReactNode } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const sidebar = (
    <>
      <div className="px-3 pb-6">
        <p className="text-sm font-semibold text-slate-900">Onsective OS</p>
        <p className="text-xs text-slate-400">{badge}</p>
      </div>
      <div onClick={() => setMenuOpen(false)}>
        <Nav items={items} />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
          <aside className="relative h-full w-64 overflow-y-auto border-r border-slate-200 bg-white p-4">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-600 md:hidden"
          >
            ☰
          </button>
          <span className="text-sm font-semibold text-slate-900 md:hidden">Onsective OS</span>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden text-right sm:block">
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
        <main className="flex-1 overflow-x-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
