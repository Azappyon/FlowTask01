"use client";

import { useState } from "react";
import { useData } from "./DataProvider";
import { PageHead } from "./PageHead";
import { TASK_STATUS } from "@/lib/constants";
import { daysFrom } from "@/lib/format";
import type { Task } from "@/lib/types";

const isDone = (t: Task) => ["concluido", "aprovado"].includes(t.status);

export function ReportsView() {
  const { tasks, contents, projects, lines, members } = useData();
  const [period, setPeriod] = useState(30);

  const inPeriod = (iso: string | null | undefined) => {
    if (!iso) return false;
    const d = daysFrom(iso);
    return d <= 0 && d >= -period;
  };
  const compDate = (t: Task) => t.updated_at?.slice(0, 10) || t.due_date;
  const periodLabel = period >= 3650 ? "todo o período" : `últimos ${period} dias`;
  const done = tasks.filter((t) => t.status === "concluido" && inPeriod(compDate(t))).length;
  const week = tasks.filter((t) => t.status === "concluido" && daysFrom(compDate(t)) >= -7 && daysFrom(compDate(t)) <= 0).length;
  const doneAll = tasks.filter((t) => t.status === "concluido").length;
  const rate = tasks.length ? Math.round((doneAll / tasks.length) * 100) : 0;
  const pub = contents.filter((c) => c.status === "publicado" && inPeriod(c.publish_date)).length;

  const byPerson = members.map((m) => [m.name || "—", tasks.filter((t) => t.assignee_id === m.id && !isDone(t)).length] as [string, number]);
  const maxP = Math.max(...byPerson.map((x) => x[1]), 1);
  const byStatus = TASK_STATUS.map(([s, l]) => [l, tasks.filter((t) => t.status === s).length] as [string, number]).filter((x) => x[1] > 0);
  const byLine = lines.map((l) => [l.name, contents.filter((c) => c.editorial_line_id === l.id).length, l.color] as [string, number, string]).filter((x) => x[1] > 0);

  const kpi = (l: string, v: number | string, c: string) => (
    <div className="card p-4">
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{l}</div>
      <div className="mt-1 text-3xl font-extrabold" style={{ color: c }}>{v}</div>
    </div>
  );

  return (
    <>
      <PageHead
        title="Relatórios"
        subtitle="Produtividade e produção"
        action={
          <select className="select w-auto" value={period} onChange={(e) => setPeriod(parseInt(e.target.value))}>
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={3650}>Todo o período</option>
          </select>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpi(`Concluídas (${periodLabel})`, done, "var(--green)")}
        {kpi("Entregas (7 dias)", week, "var(--accent)")}
        {kpi(`Publicados (${periodLabel})`, pub, "var(--violet)")}
        {kpi("Taxa de conclusão", rate + "%", rate >= 60 ? "var(--green)" : "var(--amber)")}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="sec-title mt-0">Demandas por responsável</div>
          {byPerson.map(([name, n]) => (
            <div key={name} className="mb-2 flex items-center gap-3">
              <div className="w-28 truncate text-sm">{name}</div>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--accent-soft)" }}>
                <div className="h-full rounded-full" style={{ width: `${(n / maxP) * 100}%`, background: "var(--accent)" }} />
              </div>
              <div className="w-6 text-right text-sm font-semibold">{n}</div>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <div className="sec-title mt-0">Demandas por status</div>
          {byStatus.map(([name, n]) => (
            <div key={name} className="mb-2 flex items-center gap-3">
              <div className="w-28 truncate text-sm">{name}</div>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--accent-soft)" }}>
                <div className="h-full rounded-full" style={{ width: `${(n / (tasks.length || 1)) * 100}%`, background: "var(--accent2)" }} />
              </div>
              <div className="w-6 text-right text-sm font-semibold">{n}</div>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <div className="sec-title mt-0">Conteúdos por linha editorial</div>
          {byLine.length ? byLine.map(([name, n, color]) => (
            <div key={name} className="mb-2 flex items-center gap-2 text-sm">
              <span className="inline-block h-3 w-3 rounded" style={{ background: color }} />
              <span className="flex-1">{name}</span>
              <span className="font-semibold">{n}</span>
            </div>
          )) : <div className="text-sm" style={{ color: "var(--faint)" }}>Sem dados.</div>}
        </div>
        <div className="card p-5">
          <div className="sec-title mt-0">Pipeline</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Projetos em andamento: <b style={{ color: "var(--ink)" }}>{projects.filter((p) => p.status === "em_andamento").length}</b><br />
            Conteúdos no pipeline: <b style={{ color: "var(--ink)" }}>{contents.filter((c) => c.status !== "publicado").length}</b><br />
            Entregas concluídas (total): <b style={{ color: "var(--ink)" }}>{doneAll}</b>
          </p>
        </div>
      </div>
    </>
  );
}
