"use client";

import { useState } from "react";
import { useData } from "./DataProvider";
import { Avatar, Modal, Drawer, Field, FieldRow, Chip, statusColor } from "./ui";
import { PageHead, Empty, PlusIcon } from "./PageHead";
import { CONTENT_STATUS, FORMATS, SEASONS, label, type Season } from "@/lib/constants";
import { pad, isoOf, parseD, fmt, fmtLong, daysFrom, todayISO } from "@/lib/format";
import type { Content } from "@/lib/types";

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function seasonsInMonth(month: number, year: number) {
  return SEASONS.filter((s) => s.m - 1 === month).map((s) => ({ ...s, date: `${year}-${pad(s.m)}-${pad(s.d)}` }));
}
function seasonByDate(dateISO: string) {
  const d = parseD(dateISO);
  return SEASONS.find((s) => s.m - 1 === d.getMonth() && s.d === d.getDate());
}
function upcomingSeasons() {
  const out: (Season & { date: string })[] = [];
  const y = new Date().getFullYear();
  [y, y + 1].forEach((yy) => SEASONS.forEach((s) => {
    const date = `${yy}-${pad(s.m)}-${pad(s.d)}`;
    if (daysFrom(date) >= 0) out.push({ ...s, date });
  }));
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function CalendarView() {
  const { contents, lines, saveContent, openCreate } = useData();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState<"cal" | "seasons">("cal");
  const [editing, setEditing] = useState<{ content: Content | null; date?: string } | undefined>(undefined);
  const [openId, setOpenId] = useState<string | null>(null);
  const [seasonModal, setSeasonModal] = useState<string | null>(null);
  const open = openId ? contents.find((c) => c.id === openId) : null;

  function nav(d: number) {
    let m = month + d, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m); setYear(y);
  }

  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  const monthName = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const seas = seasonsInMonth(month, year);

  async function onDropDay(dateISO: string, contentId: string) {
    const c = contents.find((x) => x.id === contentId);
    if (c && c.publish_date !== dateISO) await saveContent({ publish_date: dateISO }, c.id);
  }

  const head = (
    <PageHead
      title="Calendário editorial"
      subtitle={`${contents.length} conteúdos · ${SEASONS.length} sazonalidades no ano`}
      action={
        <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: "var(--line)" }}>
          <button onClick={() => setTab("cal")} className="rounded-md px-3 py-1 text-sm font-semibold" style={tab === "cal" ? { background: "var(--accent-soft)", color: "var(--accent-strong)" } : { color: "var(--muted)" }}>Calendário</button>
          <button onClick={() => setTab("seasons")} className="rounded-md px-3 py-1 text-sm font-semibold" style={tab === "seasons" ? { background: "var(--accent-soft)", color: "var(--accent-strong)" } : { color: "var(--muted)" }}>Sazonalidades</button>
        </div>
      }
    />
  );

  if (tab === "seasons") {
    return (
      <>
        {head}
        <p className="-mt-2 mb-4 text-sm" style={{ color: "var(--muted)" }}>Datas comerciais e sazonais do ano. Clique para planejar um conteúdo já na data certa.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {upcomingSeasons().map((s) => {
            const dd = daysFrom(s.date);
            const when = dd === 0 ? "Hoje" : dd === 1 ? "Amanhã" : `Em ${dd} dias`;
            return (
              <div key={s.date} className="card p-4" style={{ borderLeft: "4px solid var(--accent)" }}>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold">★ {s.name}</h3>
                  <Chip color="var(--accent)">{when}</Chip>
                </div>
                <div className="mt-1 text-sm capitalize" style={{ color: "var(--muted)" }}>{fmtLong(s.date)} · {s.cat}</div>
                <div className="field-label mt-3">O que dá para fazer</div>
                <ul className="ml-4 list-disc text-sm" style={{ color: "var(--muted)" }}>
                  {s.ideas.map((i) => <li key={i}>{i}</li>)}
                </ul>
                <button className="btn btn-ghost mt-3 w-full" onClick={() => setEditing({ content: null, date: s.date })}><PlusIcon /> Criar conteúdo nesta data</button>
              </div>
            );
          })}
        </div>
        {editing !== undefined && <ContentModal content={editing.content} presetDate={editing.date} onClose={() => setEditing(undefined)} />}
      </>
    );
  }

  return (
    <>
      {head}
      <div className="mb-3 flex items-center gap-2">
        <button className="btn btn-ghost px-2 py-1.5" onClick={() => nav(-1)} aria-label="Mês anterior">‹</button>
        <span className="min-w-[150px] text-center font-bold capitalize">{monthName}</span>
        <button className="btn btn-ghost px-2 py-1.5" onClick={() => nav(1)} aria-label="Próximo mês">›</button>
        <button className="btn btn-ghost" onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }}>Hoje</button>
        <button className="btn btn-primary ml-auto" onClick={() => openCreate("conteudo")}><PlusIcon /> Novo conteúdo</button>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--line)" }}>
          {DOW.map((d) => <div key={d} className="px-2 py-2 text-center text-[11px] font-bold uppercase" style={{ color: "var(--muted)" }}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((c, i) => {
            if (!c) return <div key={i} className="min-h-[96px] border-b border-r" style={{ borderColor: "var(--line)", background: "var(--bg)" }} />;
            const ci = isoOf(c);
            const evs = contents.filter((x) => x.publish_date === ci);
            const sev = seas.filter((s) => s.date === ci);
            const isToday = ci === todayISO();
            return (
              <div key={i} className="min-h-[96px] border-b border-r p-1.5"
                style={{ borderColor: "var(--line)" }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) onDropDay(ci, id); }}>
                <div className="mb-1 text-xs font-semibold" style={{ color: "var(--muted)" }}>
                  <span className={isToday ? "inline-flex h-5 w-5 items-center justify-center rounded-full text-white" : ""} style={isToday ? { background: "var(--accent)" } : undefined}>{c.getDate()}</span>
                </div>
                {sev.map((s) => (
                  <div key={s.name} onClick={() => setSeasonModal(ci)} className="mb-1 cursor-pointer truncate rounded border border-dashed px-1.5 py-0.5 text-[11px] font-semibold"
                    style={{ background: "var(--accent-soft)", color: "var(--accent-strong)", borderColor: "var(--accent-2)" }}>★ {s.name}</div>
                ))}
                {evs.map((e) => {
                  const l = lines.find((x) => x.id === e.editorial_line_id);
                  return (
                    <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} onClick={() => setOpenId(e.id)}
                      className="mb-1 cursor-pointer truncate rounded px-1.5 py-0.5 text-[11px] text-white" style={{ background: l?.color || "#888" }} title={e.title}>
                      {e.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs" style={{ color: "var(--muted)" }}>
        <span className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded border border-dashed" style={{ borderColor: "var(--accent-2)", background: "var(--accent-soft)" }} /> Sazonalidade</span>
        {lines.map((l) => <span key={l.id} className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ background: l.color }} />{l.name}</span>)}
      </div>

      {editing !== undefined && <ContentModal content={editing.content} presetDate={editing.date} onClose={() => setEditing(undefined)} />}
      <Drawer open={!!open} onClose={() => setOpenId(null)}>
        {open && <ContentDrawer content={open} onEdit={() => setEditing({ content: open })} onClose={() => setOpenId(null)} />}
      </Drawer>
      {seasonModal && (() => {
        const s = seasonByDate(seasonModal);
        if (!s) return null;
        return (
          <Modal open title={`★ ${s.name}`} onClose={() => setSeasonModal(null)}
            footer={<>
              <button className="btn btn-ghost" onClick={() => setSeasonModal(null)}>Fechar</button>
              <button className="btn btn-primary" onClick={() => { setEditing({ content: null, date: seasonModal }); setSeasonModal(null); }}>Criar conteúdo</button>
            </>}>
            <p className="mb-2 text-sm capitalize" style={{ color: "var(--muted)" }}>{fmtLong(seasonModal)} · {s.cat}</p>
            <div className="field-label">O que dá para fazer</div>
            <ul className="ml-4 list-disc text-sm">{s.ideas.map((i) => <li key={i}>{i}</li>)}</ul>
          </Modal>
        );
      })()}
    </>
  );
}

function ContentModal({ content, presetDate, onClose }: { content: Content | null; presetDate?: string; onClose: () => void }) {
  const { lines, projects, members, saveContent, deleteContent } = useData();
  const [f, setF] = useState({
    title: content?.title ?? "",
    editorial_line_id: content?.editorial_line_id ?? lines[0]?.id ?? "",
    status: content?.status ?? "ideia",
    channel: content?.channel ?? "",
    format: content?.format ?? FORMATS[0],
    publish_date: content?.publish_date ?? presetDate ?? todayISO(),
    owner_id: content?.owner_id ?? members[0]?.id ?? "",
    project_id: content?.project_id ?? "",
    caption: content?.caption ?? "",
    creative_text: content?.creative_text ?? "",
    design_link: content?.design_link ?? "",
    refs: content?.refs ?? "",
    notes: content?.notes ?? "",
  });
  async function save() {
    if (!f.title.trim()) return;
    await saveContent(
      {
        title: f.title.trim(),
        editorial_line_id: f.editorial_line_id || null,
        status: f.status as Content["status"],
        channel: f.channel || null,
        format: f.format || null,
        publish_date: f.publish_date || null,
        owner_id: f.owner_id || null,
        project_id: f.project_id || null,
        caption: f.caption || null,
        creative_text: f.creative_text || null,
        design_link: f.design_link || null,
        refs: f.refs || null,
        notes: f.notes || null,
      },
      content?.id
    );
    onClose();
  }
  return (
    <Modal open title={content ? "Editar conteúdo" : "Novo conteúdo"} onClose={onClose}
      footer={<>
        {content && <button className="btn btn-danger mr-auto" onClick={async () => { await deleteContent(content.id); onClose(); }}>Excluir</button>}
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={save}>Salvar</button>
      </>}>
      <Field label="Título"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Ex.: Carrossel sobre tendências" /></Field>
      <FieldRow>
        <div><label className="field-label">Linha editorial</label>
          <select className="select" value={f.editorial_line_id} onChange={(e) => setF({ ...f, editorial_line_id: e.target.value })}>
            <option value="">— Nenhuma —</option>
            {lines.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div><label className="field-label">Status</label>
          <select className="select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Content["status"] })}>
            {CONTENT_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </FieldRow>
      <FieldRow>
        <div><label className="field-label">Canal</label><input className="input" value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })} placeholder="Ex.: Instagram" /></div>
        <div><label className="field-label">Formato</label>
          <select className="select" value={f.format} onChange={(e) => setF({ ...f, format: e.target.value })}>
            {FORMATS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </FieldRow>
      <FieldRow>
        <div><label className="field-label">Data de publicação</label><input type="date" className="input" value={f.publish_date} onChange={(e) => setF({ ...f, publish_date: e.target.value })} /></div>
        <div><label className="field-label">Responsável</label>
          <select className="select" value={f.owner_id} onChange={(e) => setF({ ...f, owner_id: e.target.value })}>
            <option value="">— Ninguém —</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </FieldRow>
      <Field label="Projeto (opcional)">
        <select className="select" value={f.project_id} onChange={(e) => setF({ ...f, project_id: e.target.value })}>
          <option value="">— Sem projeto —</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field label="Legenda"><textarea className="textarea" rows={2} value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} /></Field>
      <Field label="Texto do criativo"><textarea className="textarea" rows={2} value={f.creative_text} onChange={(e) => setF({ ...f, creative_text: e.target.value })} /></Field>
      <FieldRow>
        <div><label className="field-label">Link do design</label><input className="input" value={f.design_link} onChange={(e) => setF({ ...f, design_link: e.target.value })} /></div>
        <div><label className="field-label">Referências</label><input className="input" value={f.refs} onChange={(e) => setF({ ...f, refs: e.target.value })} /></div>
      </FieldRow>
    </Modal>
  );
}

function ContentDrawer({ content, onEdit, onClose }: { content: Content; onEdit: () => void; onClose: () => void }) {
  const { lines, members, deleteContent } = useData();
  const l = lines.find((x) => x.id === content.editorial_line_id);
  const owner = members.find((m) => m.id === content.owner_id);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b px-5 py-4" style={{ borderColor: "var(--line)" }}>
        <div>
          {l && <span className="rounded px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: l.color }}>{l.name}</span>}
          <h2 className="mt-2 text-lg font-bold">{content.title}</h2>
        </div>
        <button onClick={onClose} className="text-xl" style={{ color: "var(--muted)" }}>×</button>
      </div>
      <div className="flex gap-2 border-b px-5 py-3" style={{ borderColor: "var(--line)" }}>
        <button className="btn btn-ghost" onClick={onEdit}>Editar</button>
        <button className="btn btn-danger ml-auto" onClick={async () => { await deleteContent(content.id); onClose(); }}>Excluir</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status"><Chip color={statusColor(content.status)}>{label(content.status, CONTENT_STATUS)}</Chip></Field>
          <Field label="Publicação"><div className="text-sm">{fmt(content.publish_date)}</div></Field>
          <Field label="Canal"><div className="text-sm">{content.channel || "—"}</div></Field>
          <Field label="Formato"><div className="text-sm">{content.format || "—"}</div></Field>
          <Field label="Responsável"><div className="flex items-center gap-2 text-sm"><Avatar member={owner} size={22} />{owner?.name || "—"}</div></Field>
        </div>
        {content.caption && <Field label="Legenda"><div className="rounded-lg p-2 text-sm" style={{ background: "var(--bg)" }}>{content.caption}</div></Field>}
        {content.creative_text && <Field label="Texto do criativo"><div className="rounded-lg p-2 text-sm" style={{ background: "var(--bg)" }}>{content.creative_text}</div></Field>}
        {content.design_link && <Field label="Link do design"><div className="break-all text-sm" style={{ color: "var(--accent)" }}>{content.design_link}</div></Field>}
        {content.refs && <Field label="Referências"><div className="break-all text-sm" style={{ color: "var(--accent)" }}>{content.refs}</div></Field>}
        {content.notes && <Field label="Observações"><div className="text-sm" style={{ color: "var(--muted)" }}>{content.notes}</div></Field>}
      </div>
    </div>
  );
}
