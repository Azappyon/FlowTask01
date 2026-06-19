"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useData } from "./DataProvider";
import { Avatar } from "./ui";
import { daysFrom } from "@/lib/format";

const NAV: [string, string, string][] = [
  ["/dashboard", "Dashboard", "M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z"],
  ["/tarefas", "Tarefas", "M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"],
  ["/projetos", "Projetos", "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
  ["/calendario", "Calendário", "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
  ["/linhas", "Linhas editoriais", "M4 6h16M4 12h10M4 18h7"],
  ["/kanban", "Kanban", "M4 4h6v16H4zM14 4h6v10h-6z"],
  ["/relatorios", "Relatórios", "M3 3v18h18M7 14l3-3 3 3 5-6"],
  ["/equipe", "Equipe", "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 .01"],
  ["/configuracoes", "Configurações", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8"],
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d.split("M").filter(Boolean).map((p, i) => (
        <path key={i} d={"M" + p} />
      ))}
    </svg>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { profile, tasks } = useData();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  const overdue = tasks.filter(
    (t) => t.due_date && daysFrom(t.due_date) < 0 && !["concluido", "aprovado"].includes(t.status)
  ).length;

  const navItems: [string, string, string][] = profile.is_super_admin
    ? [...NAV, ["/admin", "Admin", "M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"]]
    : NAV;

  function toggleTheme() {
    const root = document.documentElement;
    const dark = root.classList.toggle("dark");
    try {
      localStorage.setItem("flowtask_theme", dark ? "dark" : "light");
    } catch {}
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed z-40 flex h-full w-60 flex-col border-r transition-transform md:static md:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--surface)", borderColor: "var(--line)" }}
      >
        <div className="flex items-center gap-2.5 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-black text-white" style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-2))" }}>
            F
          </div>
          <span className="text-lg font-extrabold">Flowtask</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {navItems.map(([href, label, d]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setNavOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
                style={
                  active
                    ? { background: "var(--accent-soft)", color: "var(--accent-strong)", fontWeight: 600 }
                    : { color: "var(--muted)" }
                }
              >
                <Icon d={d} />
                <span className="flex-1">{label}</span>
                {href === "/tarefas" && overdue > 0 && (
                  <span className="rounded-full px-1.5 text-[11px] font-bold text-white" style={{ background: "var(--red)" }}>
                    {overdue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t px-3 py-3" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-2.5 px-2">
            <Avatar member={profile} size={30} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{profile.name}</div>
              <div className="truncate text-xs" style={{ color: "var(--faint)" }}>{profile.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {navOpen && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setNavOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 md:px-6" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
          <button className="btn btn-ghost px-2 py-1.5 md:hidden" onClick={() => setNavOpen(true)} aria-label="Menu">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <div className="flex-1" />
          <button className="btn btn-ghost px-2 py-1.5" onClick={toggleTheme} aria-label="Tema" title="Alternar tema">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          </button>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost px-3 py-1.5 text-sm" type="submit">Sair</button>
          </form>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
