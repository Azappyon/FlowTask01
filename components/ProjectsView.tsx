"use client";

import { useState } from "react";
import { useData } from "./DataProvider";
import { Avatar, Chip, Modal, Drawer, Field, FieldRow, statusColor } from "./ui";
import { PageHead, Empty, PlusIcon } from "./PageHead";
import { PROJECT_STATUS, label } from "@/lib/constants";
import { fmt, todayISO } from "@/lib/format";
import type { Project, Task } from "@/lib/types";

const isDone = (t: Task) => ["concluido", "aprovado"].includes(t.status);

export function ProjectsView() {
  const { projects, tasks, members } = useData();
  const [editing, setEditing] = useState<Project | null | undefined>(undefined);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? projects.find((p) => p.id === openId) : null;

  return (
    <>
      <PageHead
        title="Projetos"
        subtitle={`${projects.length} projetos`}
        action={<button className="btn btn-primary" onClick={() => setEditing(null)}><PlusIcon /> Novo projeto</button>}
      />
      {projects.length === 0 ? (
        <div className="card"><Empty>Nenhum projeto ainda.</Empty></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const pt = tasks.filter((t) => t.project_id === p.id);
            const done = pt.filter(isDone).length;
            const pct = pt.length ? Math.round((done / pt.length) * 100) : 0;
            const owner = members.find((m) => m.id === p.owner_id);
            return (
              <button key={p.id} className="card p-4 text-left" onClick={() => setOpenId(p.id)}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold">{p.name}</h3>
                  <Chip color={statusColor(p.status)}>{label(p.status, PROJECT_STATUS)}</Chip>
                </div>
                <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{p.client || "Sem cliente"}</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--accent-soft)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--accent)" }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs" style={{ color: "var(--muted)" }}>
                  <span>{done}/{pt.length} tarefas · {pct}%</span>
                  <span>Prazo {fmt(p.due_date)}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <Avatar member={owner} size={22} /> {owner?.name || "—"}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {editing !== undefined && <ProjectModal project={editing} onClose={() => setEditing(undefined)} />}
      <Drawer open={!!open} onClose={() => setOpenId(null)}>
        {open && <ProjectDrawer project={open} onEdit={() => setEditing(open)} onClose={() => setOpenId(null)} />}
      </Drawer>
    </>
  );
}

function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const { members, saveProject, deleteProject } = useData();
  const [f, setF] = useState({
    name: project?.name ?? "",
    description: project?.description ?? "",
    client: project?.client ?? "",
    owner_id: project?.owner_id ?? members[0]?.id ?? "",
    status: project?.status ?? "planejamento",
    due_date: project?.due_date ?? todayISO(),
  });
  async function save() {
    if (!f.name.trim()) return;
    await saveProject(
      {
        name: f.name.trim(),
        description: f.description || null,
        client: f.client || null,
        owner_id: f.owner_id || null,
        status: f.status as Project["status"],
        due_date: f.due_date || null,
      },
      project?.id
    );
    onClose();
  }
  return (
    <Modal open title={project ? "Editar projeto" : "Novo projeto"} onClose={onClose}
      footer={<>
        {project && <button className="btn btn-danger mr-auto" onClick={async () => { await deleteProject(project.id); onClose(); }}>Excluir</button>}
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={save}>Salvar</button>
      </>}>
      <Field label="Nome"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex.: Campanha de Natal" /></Field>
      <Field label="Descrição"><textarea className="textarea" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      <FieldRow>
        <div><label className="field-label">Cliente / empresa</label><input className="input" value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} /></div>
        <div><label className="field-label">Responsável</label>
          <select className="select" value={f.owner_id} onChange={(e) => setF({ ...f, owner_id: e.target.value })}>
            <option value="">— Ninguém —</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </FieldRow>
      <FieldRow>
        <div><label className="field-label">Status</label>
          <select className="select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Project["status"] })}>
            {PROJECT_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div><label className="field-label">Prazo final</label><input type="date" className="input" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></div>
      </FieldRow>
    </Modal>
  );
}

function ProjectDrawer({ project, onEdit, onClose }: { project: Project; onEdit: () => void; onClose: () => void }) {
  const { tasks, contents, members, deleteProject } = useData();
  const [tab, setTab] = useState<"visao" | "tarefas" | "conteudos">("visao");
  const pt = tasks.filter((t) => t.project_id === project.id);
  const pc = contents.filter((c) => c.project_id === project.id);
  const done = pt.filter(isDone).length;
  const pct = pt.length ? Math.round((done / pt.length) * 100) : 0;
  const owner = members.find((m) => m.id === project.owner_id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b px-5 py-4" style={{ borderColor: "var(--line)" }}>
        <div>
          <Chip color={statusColor(project.status)}>{label(project.status, PROJECT_STATUS)}</Chip>
          <h2 className="mt-2 text-lg font-bold">{project.name}</h2>
        </div>
        <button onClick={onClose} className="text-xl" style={{ color: "var(--muted)" }}>×</button>
      </div>
      <div className="flex gap-2 border-b px-5 py-3" style={{ borderColor: "var(--line)" }}>
        <button className="btn btn-ghost" onClick={onEdit}>Editar</button>
        <button className="btn btn-danger ml-auto" onClick={async () => { await deleteProject(project.id); onClose(); }}>Excluir</button>
      </div>
      <div className="flex gap-1 px-5 pt-3">
        {(["visao", "tarefas", "conteudos"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className="rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={tab === k ? { background: "var(--accent-soft)", color: "var(--accent-strong)" } : { color: "var(--muted)" }}>
            {k === "visao" ? "Visão geral" : k === "tarefas" ? `Tarefas ${pt.length}` : `Conteúdos ${pc.length}`}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
        {tab === "visao" && (
          <>
            <Field label="Descrição"><div className="text-sm" style={{ color: project.description ? "var(--ink)" : "var(--faint)" }}>{project.description || "Sem descrição"}</div></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cliente"><div className="text-sm">{project.client || "—"}</div></Field>
              <Field label="Responsável"><div className="flex items-center gap-2 text-sm"><Avatar member={owner} size={22} />{owner?.name || "—"}</div></Field>
              <Field label="Prazo"><div className="text-sm">{fmt(project.due_date)}</div></Field>
            </div>
            <Field label={`Progresso (${done}/${pt.length} · ${pct}%)`}>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--accent-soft)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--accent)" }} />
              </div>
            </Field>
          </>
        )}
        {tab === "tarefas" && (pt.length ? pt.map((t) => (
          <div key={t.id} className="border-b py-2 text-sm" style={{ borderColor: "var(--line)" }}>{t.title}</div>
        )) : <Empty>Nenhuma tarefa vinculada.</Empty>)}
        {tab === "conteudos" && (pc.length ? pc.map((c) => (
          <div key={c.id} className="border-b py-2 text-sm" style={{ borderColor: "var(--line)" }}>{c.title}</div>
        )) : <Empty>Nenhum conteúdo vinculado.</Empty>)}
      </div>
    </div>
  );
}
