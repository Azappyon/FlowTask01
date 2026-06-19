"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useData } from "./DataProvider";
import { Avatar, Modal } from "./ui";
import { DemoBanner } from "./DemoBanner";
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

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} className="flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d.split("M").filter(Boolean).map((p, i) => (
        <path key={i} d={"M" + p} />
      ))}
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-5 h-8 w-48 rounded-lg" style={{ background: "var(--line)" }} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl" style={{ background: "var(--line)" }} />)}
      </div>
      <div className="mt-5 space-y-2">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-lg" style={{ background: "var(--line)" }} />)}
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { profile, tasks, loading, saveTask } = useData();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [qtitle, setQtitle] = useState("");

  useEffect(() => {
    try { setCollapsed(localStorage.getItem("flowtask_sidebar") === "1"); } catch {}
  }, []);
  function toggleCollapsed() {
    setCollapsed((c) => {
      const n = !c;
      try { localStorage.setItem("flowtask_sidebar", n ? "1" : "0"); } catch {}
      return n;
    });
  }

  const overdue = tasks.filter(
    (t) => t.due_date && daysFrom(t.due_date) < 0 && !["concluido", "aprovado"].includes(t.status)
  ).length;

  const navItems: [string, string, string][] = profile.is_super_admin
    ? [...NAV, ["/admin", "Admin", "M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"]]
    : NAV;
  const current = navItems.find(([href]) => href === pathname)?.[1] ?? "";

  function toggleTheme() {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("flowtask_theme", dark ? "dark" : "light"); } catch {}
  }

  async function quickCreate() {
    if (!qtitle.trim()) return;
    await saveTask({ title: qtitle.trim(), status: "a_fazer", priority: "media" });
    setQtitle("");
    setQuickOpen(false);
  }

  const railW = collapsed ? "76px" : "248px";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed z-40 flex h-full flex-col border-r transition-all duration-200 md:static md:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: navOpen ? "248px" : railW, background: "var(--surface)", borderColor: "var(--line)" }}
      >
        <div className={`flex items-center gap-2.5 px-4 py-4 ${collapsed && !navOpen ? "justify-center px-0" : ""}`}>
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl text-base font-black text-white" style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-2))" }}>F</div>
          {(!collapsed || navOpen) && <span className="text-lg font-extrabold tracking-tight">Flowtask</span>}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map(([href, label, d]) => {
            const active = pathname === href;
            const showLabel = !collapsed || navOpen;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setNavOpen(false)}
                title={label}
                className={`relative flex items-center rounded-xl py-2.5 text-sm font-medium transition ${showLabel ? "gap-3 px-3" : "justify-center px-0"}`}
                style={active ? { background: "var(--accent-soft)", color: "var(--accent-strong)", fontWeight: 600 } : { color: "var(--muted)" }}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r" style={{ background: "var(--accent)" }} />}
                <Icon d={d} />
                {showLabel && <span className="flex-1">{label}</span>}
                {showLabel && href === "/tarefas" && overdue > 0 && (
                  <span className="rounded-full px-1.5 text-[11px] font-bold text-white" style={{ background: "var(--red)" }}>{overdue}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* user + collapse toggle */}
        <div className="border-t px-3 py-3" style={{ borderColor: "var(--line)" }}>
          <div className={`flex items-center gap-2.5 ${collapsed && !navOpen ? "justify-center" : "px-1"}`}>
            <Avatar member={profile} size={30} />
            {(!collapsed || navOpen) && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{profile.name}</div>
                <div className="truncate text-xs" style={{ color: "var(--faint)" }}>{profile.email}</div>
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapsed}
            className="mt-3 hidden w-full items-center justify-center rounded-lg border py-1.5 text-xs font-medium transition hover:bg-[var(--accent-soft)] md:flex"
            style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ transform: collapsed ? "rotate(180deg)" : "none" }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {!collapsed && <span className="ml-1.5">Recolher</span>}
          </button>
        </div>
      </aside>

      {navOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setNavOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 md:px-6" style={{ background: "color-mix(in srgb, var(--surface) 88%, transparent)", borderColor: "var(--line)", backdropFilter: "blur(8px)" }}>
          <button className="btn btn-ghost px-2 py-1.5 md:hidden" onClick={() => setNavOpen(true)} aria-label="Abrir menu">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          {current && <div className="hidden text-sm font-semibold sm:block" style={{ color: "var(--muted)" }}>{current}</div>}
          <div className="flex-1" />
          <button className="btn btn-primary px-3 py-1.5 text-sm" onClick={() => { setQtitle(""); setQuickOpen(true); }}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            <span className="hidden sm:inline">Nova tarefa</span>
          </button>
          <button className="btn btn-ghost px-2 py-1.5" onClick={toggleTheme} aria-label="Alternar tema" title="Alternar tema">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          </button>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost px-3 py-1.5 text-sm" type="submit">Sair</button>
          </form>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">
          {!loading && <DemoBanner />}
          {loading ? <LoadingSkeleton /> : children}
        </main>
      </div>

      <Modal
        open={quickOpen}
        title="Nova tarefa"
        onClose={() => setQuickOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setQuickOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={quickCreate}>Criar tarefa</button>
          </>
        }
      >
        <label className="field-label">Título</label>
        <input
          autoFocus
          className="input"
          placeholder="O que precisa ser feito?"
          value={qtitle}
          onChange={(e) => setQtitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") quickCreate(); }}
        />
        <p className="mt-2 text-xs" style={{ color: "var(--faint)" }}>
          Criada como “Para fazer”. Você ajusta projeto, prazo e prioridade depois, em Tarefas.
        </p>
      </Modal>
    </div>
  );
}
