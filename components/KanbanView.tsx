"use client";

import { useState } from "react";
import { useData } from "./DataProvider";
import { Avatar, Chip, priorityColor } from "./ui";
import { PageHead } from "./PageHead";
import { TASK_STATUS, CONTENT_STATUS, PRIORITY, label } from "@/lib/constants";
import { fmt } from "@/lib/format";

export function KanbanView() {
  const { tasks, contents, lines, members, saveTask, saveContent } = useData();
  const [mode, setMode] = useState<"tarefas" | "conteudos">("tarefas");
  const cols = mode === "tarefas" ? TASK_STATUS : CONTENT_STATUS;

  function onDrop(status: string, id: string) {
    if (mode === "tarefas") {
      const t = tasks.find((x) => x.id === id);
      if (t && t.status !== status) saveTask({ status: status as any }, t.id);
    } else {
      const c = contents.find((x) => x.id === id);
      if (c && c.status !== status) saveContent({ status: status as any }, c.id);
    }
  }

  return (
    <>
      <PageHead
        title="Kanban"
        subtitle="Arraste os cartões entre as colunas para mudar o status"
        action={
          <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: "var(--line)" }}>
            <button onClick={() => setMode("tarefas")} className="rounded-md px-3 py-1 text-sm font-semibold" style={mode === "tarefas" ? { background: "var(--accent-soft)", color: "var(--accent-strong)" } : { color: "var(--muted)" }}>Tarefas</button>
            <button onClick={() => setMode("conteudos")} className="rounded-md px-3 py-1 text-sm font-semibold" style={mode === "conteudos" ? { background: "var(--accent-soft)", color: "var(--accent-strong)" } : { color: "var(--muted)" }}>Conteúdos</button>
          </div>
        }
      />
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {cols.map(([status, lbl]) => {
          const items = mode === "tarefas" ? tasks.filter((t) => t.status === status) : contents.filter((c) => c.status === status);
          return (
            <div key={status} className="w-64 flex-none rounded-xl p-2" style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) onDrop(status, id); }}>
              <div className="mb-2 flex items-center justify-between px-1 text-sm font-bold">
                <span>{lbl}</span>
                <span className="rounded-full px-1.5 text-xs" style={{ background: "var(--surface)", color: "var(--muted)" }}>{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((it) => {
                  if (mode === "tarefas") {
                    const t = it as typeof tasks[number];
                    const member = members.find((m) => m.id === t.assignee_id);
                    return (
                      <div key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)} className="card cursor-grab p-2.5">
                        <div className="text-sm font-medium">{t.title}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <Chip color={priorityColor(t.priority)}>{label(t.priority, PRIORITY)}</Chip>
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>{fmt(t.due_date)}<Avatar member={member} size={20} /></div>
                        </div>
                      </div>
                    );
                  }
                  const c = it as typeof contents[number];
                  const l = lines.find((x) => x.id === c.editorial_line_id);
                  return (
                    <div key={c.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)} className="card cursor-grab p-2.5">
                      <div className="text-sm font-medium">{c.title}</div>
                      {l && <span className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[11px] text-white" style={{ background: l.color }}>{l.name}</span>}
                      <div className="mt-1.5 text-xs" style={{ color: "var(--muted)" }}>{[c.channel, c.format].filter(Boolean).join(" · ")}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
