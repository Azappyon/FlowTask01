"use client";

import { useMemo, useState } from "react";
import { useData } from "./DataProvider";
import { Avatar, Chip, Modal, Drawer, Field, FieldRow, statusColor, priorityColor } from "./ui";
import { PageHead, Empty, PlusIcon } from "./PageHead";
import { TASK_STATUS, PRIORITY, PRIORITY_ORDER, label } from "@/lib/constants";
import { daysFrom, fmt, todayISO } from "@/lib/format";
import type { Task } from "@/lib/types";

const isDone = (t: Task) => ["concluido", "aprovado"].includes(t.status);
const isOverdue = (t: Task) => !!t.due_date && daysFrom(t.due_date) < 0 && !isDone(t);

export function dueLabel(t: Task) {
  if (!t.due_date) return <span style={{ color: "var(--faint)" }}>sem prazo</span>;
  const d = daysFrom(t.due_date);
  if (isDone(t)) return <span>{fmt(t.due_date)}</span>;
  if (d < 0) return <span style={{ color: "var(--red)", fontWeight: 600 }}>Atrasada {Math.abs(d)}d</span>;
  if (d === 0) return <span style={{ color: "var(--amber)", fontWeight: 600 }}>Hoje</span>;
  return <span>{fmt(t.due_date)}</span>;
}

export function TasksView() {
  const { tasks, projects, members, deps, toggleTaskDone } = useData();
  const [editing, setEditing] = useState<Task | null | undefined>(undefined); // undefined=closed
  const [openId, setOpenId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: "", priority: "", project: "", assignee: "", sort: "prazo" });

  const blockingCount = (t: Task) =>
    deps
      .filter((d) => d.task_id === t.id)
      .map((d) => tasks.find((x) => x.id === d.depends_on_id))
      .filter((x) => x && !isDone(x)).length;

  const list = useMemo(() => {
    let l = tasks.filter(
      (t) =>
        (!filters.status || t.status === filters.status) &&
        (!filters.priority || t.priority === filters.priority) &&
        (!filters.project || t.project_id === filters.project) &&
        (!filters.assignee || t.assignee_id === filters.assignee)
    );
    const sorters: Record<string, (a: Task, b: Task) => number> = {
      prazo: (a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"),
      prioridade: (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
      titulo: (a, b) => a.title.localeCompare(b.title),
    };
    return [...l].sort(sorters[filters.sort] || sorters.prazo);
  }, [tasks, filters]);

  const openTask = openId ? tasks.find((t) => t.id === openId) : null;

  return (
    <>
      <PageHead
        title="Tarefas"
        subtitle={`${tasks.length} tarefas no total`}
        action={
          <button className="btn btn-primary" onClick={() => setEditing(null)}>
            <PlusIcon /> Nova tarefa
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Sel value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} placeholder="Todos os status" options={TASK_STATUS} />
        <Sel value={filters.priority} onChange={(v) => setFilters({ ...filters, priority: v })} placeholder="Toda prioridade" options={PRIORITY} />
        <Sel value={filters.project} onChange={(v) => setFilters({ ...filters, project: v })} placeholder="Todos os projetos" options={projects.map((p) => [p.id, p.name])} />
        <Sel value={filters.assignee} onChange={(v) => setFilters({ ...filters, assignee: v })} placeholder="Todos responsáveis" options={members.map((m) => [m.id, m.name || ""])} />
        <select className="select w-auto" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="prazo">Ordenar: prazo</option>
          <option value="prioridade">Ordenar: prioridade</option>
          <option value="titulo">Ordenar: título</option>
        </select>
      </div>

      <div className="card divide-y" style={{ borderColor: "var(--line)" }}>
        {list.length === 0 && <Empty>Nenhuma tarefa com esses filtros.</Empty>}
        {list.map((t) => {
          const member = members.find((m) => m.id === t.assignee_id);
          const blocked = blockingCount(t) > 0;
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderColor: "var(--line)" }}>
              <button
                onClick={() => { void toggleTaskDone(t); }}
                className="flex h-5 w-5 flex-none items-center justify-center rounded-md border"
                style={{ borderColor: isDone(t) ? "var(--green)" : "var(--line)", background: isDone(t) ? "var(--green)" : "transparent" }}
                aria-label="Concluir"
              >
                {isDone(t) && <CheckSvg />}
              </button>
              <button className="min-w-0 flex-1 text-left" onClick={() => setOpenId(t.id)}>
                <span className={`text-sm ${isDone(t) ? "line-through opacity-60" : ""}`}>
                  {blocked && <LockSvg />} {t.title}
                </span>
              </button>
              <Chip color={statusColor(t.status)}>{label(t.status, TASK_STATUS)}</Chip>
              <Chip color={priorityColor(t.priority)}>{label(t.priority, PRIORITY)}</Chip>
              <span className="hidden w-20 text-right text-xs sm:block" style={{ color: "var(--muted)" }}>{dueLabel(t)}</span>
              <Avatar member={member} />
            </div>
          );
        })}
      </div>

      {editing !== undefined && <TaskModal task={editing} onClose={() => setEditing(undefined)} />}
      <Drawer open={!!openTask} onClose={() => setOpenId(null)}>
        {openTask && (
          <TaskDrawer
            task={openTask}
            onEdit={() => { setEditing(openTask); }}
            onClose={() => setOpenId(null)}
          />
        )}
      </Drawer>
    </>
  );
}

function Sel({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: [string, string][];
}) {
  return (
    <select className="select w-auto" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );
}

function CheckSvg() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
export function LockSvg() {
  return (
    <svg viewBox="0 0 24 24" className="mr-1 inline h-3.5 w-3.5 align-[-2px]" style={{ color: "var(--red)" }} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

// ---------------------------------------------------------------- Modal
function TaskModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { projects, members, saveTask, deleteTask } = useData();
  const [f, setF] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    project_id: task?.project_id ?? "",
    assignee_id: task?.assignee_id ?? members[0]?.id ?? "",
    status: task?.status ?? "a_fazer",
    priority: task?.priority ?? "media",
    due_date: task?.due_date ?? todayISO(),
    client: task?.client ?? "",
    labels: (task?.labels ?? []).join(", "),
  });

  async function save() {
    if (!f.title.trim()) return;
    await saveTask(
      {
        title: f.title.trim(),
        description: f.description || null,
        project_id: f.project_id || null,
        assignee_id: f.assignee_id || null,
        status: f.status as Task["status"],
        priority: f.priority as Task["priority"],
        due_date: f.due_date || null,
        client: f.client || null,
        labels: f.labels ? f.labels.split(",").map((s) => s.trim()).filter(Boolean) : [],
      },
      task?.id
    );
    onClose();
  }

  return (
    <Modal
      open
      title={task ? "Editar tarefa" : "Nova tarefa"}
      onClose={onClose}
      footer={
        <>
          {task && (
            <button className="btn btn-danger mr-auto" onClick={async () => { await deleteTask(task.id); onClose(); }}>
              Excluir
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Salvar</button>
        </>
      }
    >
      <Field label="Título">
        <input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Ex.: Aprovar arte do post" />
      </Field>
      <Field label="Descrição">
        <textarea className="textarea" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      </Field>
      <FieldRow>
        <div>
          <label className="field-label">Projeto</label>
          <select className="select" value={f.project_id} onChange={(e) => setF({ ...f, project_id: e.target.value })}>
            <option value="">— Sem projeto —</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Responsável</label>
          <select className="select" value={f.assignee_id} onChange={(e) => setF({ ...f, assignee_id: e.target.value })}>
            <option value="">— Ninguém —</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </FieldRow>
      <FieldRow>
        <div>
          <label className="field-label">Status</label>
          <select className="select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Task["status"] })}>
            {TASK_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Prioridade</label>
          <select className="select" value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as Task["priority"] })}>
            {PRIORITY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </FieldRow>
      <FieldRow>
        <div>
          <label className="field-label">Prazo</label>
          <input type="date" className="input" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Cliente</label>
          <input className="input" value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} />
        </div>
      </FieldRow>
      <Field label="Etiquetas (separadas por vírgula)">
        <input className="input" value={f.labels} onChange={(e) => setF({ ...f, labels: e.target.value })} />
      </Field>
    </Modal>
  );
}

// --------------------------------------------------------------- Drawer
function TaskDrawer({ task, onEdit, onClose }: { task: Task; onEdit: () => void; onClose: () => void }) {
  const {
    projects, members, checklist, deps, comments, tasks,
    toggleTaskDone, deleteTask, addChecklist, toggleChecklist, deleteChecklist,
    addDep, removeDep, addComment,
  } = useData();
  const [newCheck, setNewCheck] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newDep, setNewDep] = useState("");

  const project = projects.find((p) => p.id === task.project_id);
  const member = members.find((m) => m.id === task.assignee_id);
  const items = checklist.filter((c) => c.task_id === task.id);
  const taskDeps = deps.filter((d) => d.task_id === task.id);
  const taskComments = comments.filter((c) => c.entity_type === "task" && c.entity_id === task.id);
  const blocking = taskDeps
    .map((d) => tasks.find((x) => x.id === d.depends_on_id))
    .filter((x) => x && !isDone(x));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b px-5 py-4" style={{ borderColor: "var(--line)" }}>
        <div>
          <div className="flex flex-wrap gap-2">
            <Chip color={statusColor(task.status)}>{label(task.status, TASK_STATUS)}</Chip>
            {blocking.length > 0 && <Chip color="var(--red)"><LockSvg /> Bloqueada</Chip>}
          </div>
          <h2 className="mt-2 text-lg font-bold">{task.title}</h2>
        </div>
        <button onClick={onClose} className="text-xl" style={{ color: "var(--muted)" }}>×</button>
      </div>

      <div className="flex gap-2 border-b px-5 py-3" style={{ borderColor: "var(--line)" }}>
        <button className="btn btn-ghost" onClick={onEdit}>Editar</button>
        <button className="btn btn-ghost" onClick={() => toggleTaskDone(task)}>{isDone(task) ? "Reabrir" : "Concluir ✓"}</button>
        <button className="btn btn-danger ml-auto" onClick={async () => { await deleteTask(task.id); onClose(); }}>Excluir</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
        <Field label="Descrição">
          <div className="text-sm" style={{ color: task.description ? "var(--ink)" : "var(--faint)" }}>
            {task.description || "Sem descrição"}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Responsável"><div className="flex items-center gap-2 text-sm"><Avatar member={member} size={22} />{member?.name || "—"}</div></Field>
          <Field label="Prazo"><div className="text-sm">{dueLabel(task)}</div></Field>
          <Field label="Projeto"><div className="text-sm">{project?.name || "—"}</div></Field>
          <Field label="Cliente"><div className="text-sm">{task.client || "—"}</div></Field>
          <Field label="Prioridade"><Chip color={priorityColor(task.priority)}>{label(task.priority, PRIORITY)}</Chip></Field>
          <Field label="Etiquetas">
            <div className="flex flex-wrap gap-1">
              {task.labels.length ? task.labels.map((l) => <span key={l} className="rounded border px-2 py-0.5 text-[11px]" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>{l}</span>) : "—"}
            </div>
          </Field>
        </div>

        {/* Checklist */}
        <div className="sec-title">Checklist <span style={{ color: "var(--faint)" }}>{items.filter((i) => i.is_done).length}/{items.length}</span></div>
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2 py-1">
            <button onClick={() => toggleChecklist(it)} className="flex h-4 w-4 items-center justify-center rounded border" style={{ borderColor: it.is_done ? "var(--green)" : "var(--line)", background: it.is_done ? "var(--green)" : "transparent" }}>
              {it.is_done && <CheckSvg />}
            </button>
            <span className={`flex-1 text-sm ${it.is_done ? "line-through opacity-60" : ""}`}>{it.label}</span>
            <button onClick={() => deleteChecklist(it.id)} style={{ color: "var(--faint)" }}>×</button>
          </div>
        ))}
        <div className="mt-2 flex gap-2">
          <input className="input" placeholder="Novo item…" value={newCheck} onChange={(e) => setNewCheck(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newCheck.trim()) { addChecklist(task.id, newCheck.trim()); setNewCheck(""); } }} />
          <button className="btn btn-ghost" onClick={() => { if (newCheck.trim()) { addChecklist(task.id, newCheck.trim()); setNewCheck(""); } }}>Add</button>
        </div>

        {/* Dependencies */}
        <div className="sec-title">Dependências <span style={{ color: "var(--faint)" }}>{taskDeps.length || ""}</span></div>
        {taskDeps.map((d) => {
          const dt = tasks.find((x) => x.id === d.depends_on_id);
          if (!dt) return null;
          return (
            <div key={d.depends_on_id} className="flex items-center justify-between py-1 text-sm">
              <span className={isDone(dt) ? "line-through opacity-60" : ""}>{dt.title}</span>
              <button onClick={() => removeDep(task.id, d.depends_on_id)} style={{ color: "var(--faint)" }}>×</button>
            </div>
          );
        })}
        {blocking.length > 0 && <div className="mt-1 text-xs" style={{ color: "var(--red)" }}>Bloqueada: aguarda {blocking.length} tarefa(s).</div>}
        <div className="mt-2 flex gap-2">
          <select className="select" value={newDep} onChange={(e) => setNewDep(e.target.value)}>
            <option value="">Depende de…</option>
            {tasks.filter((x) => x.id !== task.id && !taskDeps.some((d) => d.depends_on_id === x.id)).map((x) => (
              <option key={x.id} value={x.id}>{x.title}</option>
            ))}
          </select>
          <button className="btn btn-ghost" onClick={() => { if (newDep) { addDep(task.id, newDep); setNewDep(""); } }}>Add</button>
        </div>

        {/* Comments */}
        <div className="sec-title">Comentários <span style={{ color: "var(--faint)" }}>{taskComments.length || ""}</span></div>
        {taskComments.map((c) => {
          const author = members.find((m) => m.id === c.author_id);
          return (
            <div key={c.id} className="mb-2 flex gap-2">
              <Avatar member={author} size={26} />
              <div className="rounded-lg px-3 py-1.5 text-sm" style={{ background: "var(--accent-soft)" }}>
                <b>{author?.name || "Você"}</b>
                <div>{c.body}</div>
              </div>
            </div>
          );
        })}
        <div className="mt-2 flex gap-2">
          <input className="input" placeholder="Escreva um comentário…" value={newComment} onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newComment.trim()) { addComment("task", task.id, newComment.trim()); setNewComment(""); } }} />
          <button className="btn btn-ghost" onClick={() => { if (newComment.trim()) { addComment("task", task.id, newComment.trim()); setNewComment(""); } }}>Enviar</button>
        </div>
      </div>
    </div>
  );
}
