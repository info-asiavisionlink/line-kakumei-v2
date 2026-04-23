"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Bot, LayoutDashboard, Menu, Settings, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/dashboard/simulator", label: "Simulator", icon: Bot },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r border-[#06C755]/20 bg-white/90 p-4 md:block">
        <SidebarContent pathname={pathname} onNavigate={() => undefined} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-[#06C755]/20 bg-white p-4 transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#06C755]/20 bg-white/90 px-4 backdrop-blur md:hidden">
          <p className="font-semibold text-zinc-900">LINE革命</p>
          <button
            type="button"
            className="rounded-md p-2 text-zinc-700 hover:bg-[#06C755]/10"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="メニューを開く"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <>
      <div className="mb-6 rounded-lg bg-[#06C755]/10 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[#06C755]">
          LINE Revolution
        </p>
        <p className="text-lg font-semibold text-zinc-900">管理コンソール</p>
      </div>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#06C755] text-white"
                  : "text-zinc-700 hover:bg-[#06C755]/10 hover:text-[#06C755]",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
