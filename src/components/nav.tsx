"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; group: string };

export default function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const groups = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  return (
    <nav className="space-y-5">
      {Object.entries(groups).map(([group, groupItems]) => (
        <div key={group}>
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">{group}</p>
          <ul className="space-y-0.5">
            {groupItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
