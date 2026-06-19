"use client";

import Link from "next/link";
import { useData } from "./DataProvider";
import { OnboardingPanel } from "./OnboardingPanel";
import { Avatar, Chip, priorityColor } from "./ui";
import { dueLabel } from "./TasksView";
import { PRIORITY, SEASONS, label } from "@/lib/constants";
import { daysFrom, fmt, todayISO, pad } from "@/lib/format";
import type { Task } from "@/lib/types";

const isDone = (t: Task) => ["concluido", "aprovado"].includes(t.status);

function nextSeason() {
  const y = new Date().getFullYear();
  const all: { name: string; date: string; idea: string }[] = [];
  [y, y + 1].forEach((yy) => SEASONS.forEach((s) => {
    const date = `${yy}-${pad(s.m)}-${pad(s.d)}`;
    if (daysFrom(date) >= 0) all.push({ name: s.name, date, idea: s.ideas[0] });
  }));
  return all.sort((a, b) => a.date.localeCompare(b.date))[0];
}

function MiniIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d.split("M").filter(Boolean).map((p, i) => <path key={i} d={"M" + p} />)}
    </svg>
  );
}

export function DashboardView() {
  const { profile, tasks, contents, members } = useData();
  const isEmpty = tasks.length === 0 && contents.length === 0;
  const today = todayISO();
  const todayTasks = tasks.filter((t) => t.due_date === today && !isDone(t));
  const overdue = tasks.filter((t) => t.due_date && daysFrom(t.due_date) < 0 && !isDone(t));
  const review = tasks.filter((t) => t.status === "em_revisao");
  const scheduled = contents.filter((c) => c.publish_date && daysFrom(c.publish_date) >= 0 && daysFrom(c.publish_date) <= 7 && c.status !== "publicado");
  const greet = (() => { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; })();
  const dateStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const season = nextSeason();

  const top = [...tasks.filter((t) => !isDone(t))].sort((a, b) => {
    const score = (t: Task) => {
      const pr = { urgente: 100, alta: 60, media: 30, baixa: 10 }[t.priority] || 0;
      const d = daysFrom(t.due_date);
      const due = d < 0 ? 80 + Math.min(Math.abs(d) * 6, 60) : d === 0 ? 70 : Math.max(0, 40 - d * 5);
      return pr + due;
    };
    return score(b) - score(a);
  })[0];

  const stat = (lbl: string, val: number, color: string, href: string, icon: string) => (
    <Link href={href} className="card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{lbl}</div>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb," + color + " 14%, transparent)", color }}>
          <MiniIcon d={icon} />
        </span>
      </div>
      <div className="mt-2 text-3xl font-extrabold" style={{ color: val ? color : "var(--faint)" }}>{val}</div>
    </Link>
  );

  return (
    <>
      {isEmpty && <OnboardingPanel />}
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">{greet}, {profile.name?.split(" ")[0]}</h1>
        <div className="mt-0.5 text-sm capitalize" style={{ color: "var(--muted)" }}>{dateStr}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat("Hoje", todayTasks.length, "var(--blue)", "/tarefas", "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z")}
        {stat("Atrasadas", overdue.length, "var(--red)", "/tarefas", "M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01")}
        {stat("Em revisão", review.length, "var(--violet)", "/kanban", "M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5")}
        {stat("Publicações próximas", scheduled.length, "var(--accent)", "/calendario", "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z")}
      </div>

      <div className="sec-title">Foco de hoje</div>
      <div className="card flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl" style={{ background: "var(--accent)", color: "#fff" }}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z" /></svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Prioridade nº 1</div>
          <p className="truncate text-base font-semibold">{top ? top.title : "Tudo em dia — nenhum item crítico."}</p>
        </div>
        {top && (
          <Link href="/tarefas" className="btn btn-ghost flex-none">Abrir</Link>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="sec-title">Tarefas de hoje</div>
          <div className="card divide-y overflow-hidden" style={{ borderColor: "var(--line)" }}>
            {todayTasks.length === 0 && <div className="px-4 py-10 text-center text-sm" style={{ color: "var(--faint)" }}>Sem tarefas para hoje. Aproveite o respiro. ✨</div>}
            {todayTasks.map((t) => {
              const member = members.find((m) => m.id === t.assignee_id);
              return (
                <Link key={t.id} href="/tarefas" className="flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--accent-soft)]" style={{ borderColor: "var(--line)" }}>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.title}</span>
                  <Chip color={priorityColor(t.priority)}>{label(t.priority, PRIORITY)}</Chip>
                  <span className="hidden text-xs sm:block" style={{ color: "var(--muted)" }}>{dueLabel(t)}</span>
                  <Avatar member={member} size={24} />
                </Link>
              );
            })}
          </div>
        </div>
        <div>
          <div className="sec-title">Publicações próximas</div>
          <div className="card divide-y overflow-hidden" style={{ borderColor: "var(--line)" }}>
            {scheduled.length === 0 && <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--faint)" }}>Nada programado.</div>}
            {scheduled.slice(0, 5).map((c) => (
              <Link key={c.id} href="/calendario" className="flex items-center justify-between gap-2 px-4 py-3 text-sm transition hover:bg-[var(--accent-soft)]" style={{ borderColor: "var(--line)" }}>
                <span className="min-w-0 truncate font-medium">{c.title}</span>
                <span className="flex-none text-xs" style={{ color: "var(--muted)" }}>{fmt(c.publish_date)}</span>
              </Link>
            ))}
          </div>
          {season && (
            <>
              <div className="sec-title">Na agenda</div>
              <Link href="/calendario" className="card block p-4">
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
                  {daysFrom(season.date) === 0 ? "hoje" : `em ${daysFrom(season.date)} dias`}
                </div>
                <div className="mt-1 font-semibold">★ {season.name}</div>
                <div className="text-sm" style={{ color: "var(--muted)" }}>{season.idea}</div>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
