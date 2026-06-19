"use client";

import { useState } from "react";
import { useData } from "./DataProvider";
import { Avatar, Modal, Drawer, Field, FieldRow } from "./ui";
import { PageHead, Empty, PlusIcon } from "./PageHead";
import { LINE_COLORS } from "@/lib/constants";
import type { EditorialLine } from "@/lib/types";

export function LinesView() {
  const { lines, contents, members, openCreate } = useData();
  const [editing, setEditing] = useState<EditorialLine | null | undefined>(undefined);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? lines.find((l) => l.id === openId) : null;

  return (
    <>
      <PageHead
        title="Linhas editoriais"
        subtitle="Estratégias que orientam toda a produção de conteúdo"
        action={<button className="btn btn-primary" onClick={() => openCreate("linha")}><PlusIcon /> Nova linha</button>}
      />
      {lines.length === 0 ? (
        <div className="card"><Empty>Nenhuma linha editorial ainda.</Empty></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lines.map((l) => {
            const n = contents.filter((c) => c.editorial_line_id === l.id).length;
            const owner = members.find((m) => m.id === l.owner_id);
            return (
              <button key={l.id} className="card p-4 text-left" style={{ borderLeft: `4px solid ${l.color}` }} onClick={() => setOpenId(l.id)}>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold">{l.name}</h3>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{n} conteúdos</span>
                </div>
                <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{l.strategic_goal}</div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {[...l.content_formats, ...l.channels].map((t, i) => (
                    <span key={i} className="rounded border px-2 py-0.5 text-[11px]" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>{t}</span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <Avatar member={owner} size={22} /> {l.frequency}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {editing !== undefined && <LineModal line={editing} onClose={() => setEditing(undefined)} />}
      <Drawer open={!!open} onClose={() => setOpenId(null)}>
        {open && <LineDrawer line={open} onEdit={() => setEditing(open)} onClose={() => setOpenId(null)} />}
      </Drawer>
    </>
  );
}

function LineModal({ line, onClose }: { line: EditorialLine | null; onClose: () => void }) {
  const { members, saveLine, deleteLine } = useData();
  const [f, setF] = useState({
    name: line?.name ?? "",
    color: line?.color ?? LINE_COLORS[0],
    strategic_goal: line?.strategic_goal ?? "",
    target_audience: line?.target_audience ?? "",
    frequency: line?.frequency ?? "",
    main_themes: (line?.main_themes ?? []).join(", "),
    content_formats: (line?.content_formats ?? []).join(", "),
    channels: (line?.channels ?? []).join(", "),
    owner_id: line?.owner_id ?? members[0]?.id ?? "",
    notes: line?.notes ?? "",
  });
  const sp = (s: string) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);
  async function save() {
    if (!f.name.trim()) return;
    await saveLine(
      {
        name: f.name.trim(),
        color: f.color,
        strategic_goal: f.strategic_goal || null,
        target_audience: f.target_audience || null,
        frequency: f.frequency || null,
        main_themes: sp(f.main_themes),
        content_formats: sp(f.content_formats),
        channels: sp(f.channels),
        owner_id: f.owner_id || null,
        notes: f.notes || null,
      },
      line?.id
    );
    onClose();
  }
  return (
    <Modal open title={line ? "Editar linha editorial" : "Nova linha editorial"} onClose={onClose}
      footer={<>
        {line && <button className="btn btn-danger mr-auto" onClick={async () => { await deleteLine(line.id); onClose(); }}>Excluir</button>}
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={save}>Salvar</button>
      </>}>
      <FieldRow>
        <div><label className="field-label">Nome</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex.: Autoridade" /></div>
        <div><label className="field-label">Cor</label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {LINE_COLORS.map((c) => (
              <button key={c} onClick={() => setF({ ...f, color: c })} className="h-6 w-6 rounded-full" style={{ background: c, outline: f.color === c ? "2px solid var(--ink)" : "none", outlineOffset: 2 }} />
            ))}
          </div>
        </div>
      </FieldRow>
      <Field label="Objetivo estratégico"><textarea className="textarea" rows={2} value={f.strategic_goal} onChange={(e) => setF({ ...f, strategic_goal: e.target.value })} /></Field>
      <FieldRow>
        <div><label className="field-label">Público-alvo</label><input className="input" value={f.target_audience} onChange={(e) => setF({ ...f, target_audience: e.target.value })} /></div>
        <div><label className="field-label">Frequência</label><input className="input" value={f.frequency} onChange={(e) => setF({ ...f, frequency: e.target.value })} /></div>
      </FieldRow>
      <Field label="Temas (vírgula)"><input className="input" value={f.main_themes} onChange={(e) => setF({ ...f, main_themes: e.target.value })} /></Field>
      <Field label="Formatos (vírgula)"><input className="input" value={f.content_formats} onChange={(e) => setF({ ...f, content_formats: e.target.value })} /></Field>
      <Field label="Canais (vírgula)"><input className="input" value={f.channels} onChange={(e) => setF({ ...f, channels: e.target.value })} /></Field>
      <FieldRow>
        <div><label className="field-label">Responsável</label>
          <select className="select" value={f.owner_id} onChange={(e) => setF({ ...f, owner_id: e.target.value })}>
            <option value="">— Ninguém —</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div><label className="field-label">Observações</label><input className="input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
      </FieldRow>
    </Modal>
  );
}

function LineDrawer({ line, onEdit, onClose }: { line: EditorialLine; onEdit: () => void; onClose: () => void }) {
  const { contents, members, deleteLine } = useData();
  const cs = contents.filter((c) => c.editorial_line_id === line.id);
  const owner = members.find((m) => m.id === line.owner_id);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b px-5 py-4" style={{ borderColor: "var(--line)" }}>
        <div>
          <span className="rounded px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: line.color }}>Linha editorial</span>
          <h2 className="mt-2 text-lg font-bold">{line.name}</h2>
        </div>
        <button onClick={onClose} className="text-xl" style={{ color: "var(--muted)" }}>×</button>
      </div>
      <div className="flex gap-2 border-b px-5 py-3" style={{ borderColor: "var(--line)" }}>
        <button className="btn btn-ghost" onClick={onEdit}>Editar</button>
        <button className="btn btn-danger ml-auto" onClick={async () => { await deleteLine(line.id); onClose(); }}>Excluir</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
        <Field label="Objetivo estratégico"><div className="text-sm">{line.strategic_goal || "—"}</div></Field>
        <Field label="Público-alvo"><div className="text-sm">{line.target_audience || "—"}</div></Field>
        <FieldRow>
          <Field label="Frequência"><div className="text-sm">{line.frequency || "—"}</div></Field>
          <Field label="Responsável"><div className="flex items-center gap-2 text-sm"><Avatar member={owner} size={22} />{owner?.name || "—"}</div></Field>
        </FieldRow>
        <Field label={`Conteúdos vinculados (${cs.length})`}>
          {cs.length ? cs.map((c) => <div key={c.id} className="border-b py-1.5 text-sm" style={{ borderColor: "var(--line)" }}>{c.title}</div>) : <span className="text-sm" style={{ color: "var(--faint)" }}>Nenhum conteúdo ainda.</span>}
        </Field>
      </div>
    </div>
  );
}
