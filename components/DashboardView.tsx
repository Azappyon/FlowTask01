"use client";

import Link from "next/link";
import { useData } from "./DataProvider";
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

export function DashboardView() {
  const { profile, tasks, contents, members } = useData();
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

  const stat = (lbl: string, val: number, color: string, href: string) => (
    <Link href={href} className="card p-4">
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{lbl}</div>
      <div className="mt-1 text-3xl font-extrabold" style={{ color: val ? color : "var(--faint)" }}>{val}</div>
    </Link>
  );

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">{greet}, {profile.name?.split(" ")[0]}</h1>
        <div className="mt-0.5 text-sm capitalize" style={{ color: "var(--muted)" }}>{dateStr}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat("Hoje", todayTasks.length, "var(--blue)", "/tarefas")}
        {stat("Atrasadas", overdue.length, "var(--red)", "/tarefas")}
        {stat("Em revisão", review.length, "var(--violet)", "/kanban")}
        {stat("Publicações próximas", scheduled.length, "var(--accent)", "/calendario")}
      </div>

      <div className="sec-title">Foco de hoje</div>
      <div className="card flex items-center gap-4 p-4">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl" style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M13 2 3 14h7l-1 8 10-12h-7z" /></svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold">A prioridade número 1</h3>
          <p className="text-sm">{top ? top.title : "Tudo em dia — nenhum item crítico."}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="sec-title">Tarefas de hoje</div>
          <div className="card divide-y" style={{ borderColor: "var(--line)" }}>
            {todayTasks.length === 0 && <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--faint)" }}>Sem tarefas para hoje.</div>}
            {todayTasks.map((t) => {
              const member = members.find((m) => m.id === t.assignee_id);
              return (
                <Link key={t.id} href="/tarefas" className="flex items-center gap-3 px-4 py-2.5" style={{ borderColor: "var(--line)" }}>
                  <span className="flex-1 text-sm">{t.title}</span>
                  <Chip color={priorityColor(t.priority)}>{label(t.priority, PRIORITY)}</Chip>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{dueLabel(t)}</span>
                  <Avatar member={member} size={22} />
                </Link>
              );
            })}
          </div>
        </div>
        <div>
          <div className="sec-title">Publicações próximas</div>
          <div className="card divide-y" style={{ borderColor: "var(--line)" }}>
            {scheduled.length === 0 && <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--faint)" }}>Nada programado.</div>}
            {scheduled.slice(0, 5).map((c) => (
              <Link key={c.id} href="/calendario" className="block px-4 py-2.5 text-sm" style={{ borderColor: "var(--line)" }}>
                {c.title}<span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>{fmt(c.publish_date)}</span>
              </Link>
            ))}
          </div>
          {season && (
            <>
              <div className="sec-title">Na agenda</div>
              <Link href="/calendario" className="card block p-4">
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  {daysFrom(season.date) === 0 ? "hoje" : `em ${daysFrom(season.date)} dias`}
                </div>
                <div className="mt-1 font-semibold">{season.name}</div>
                <div className="text-sm" style={{ color: "var(--muted)" }}>{season.idea}</div>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
