"use client";

import { useMemo, useState } from "react";
import { useData } from "./DataProvider";
import { TASK_STATUS, PRIORITY, CONTENT_STATUS, PROJECT_STATUS, FORMATS, LINE_COLORS, label } from "@/lib/constants";
import { todayISO } from "@/lib/format";
import type { Task, Content, Project, EditorialLine } from "@/lib/types";

type Kind = "tarefa" | "conteudo" | "projeto" | "linha";

const KINDS: { k: Kind; title: string; desc: string; icon: string }[] = [
  { k: "tarefa", title: "Tarefa", desc: "Uma demanda com prazo e responsável", icon: "M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  { k: "conteudo", title: "Conteúdo", desc: "Um post, reels, artigo… no calendário", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  { k: "projeto", title: "Projeto", desc: "Agrupa tarefas e conteúdos", icon: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { k: "linha", title: "Linha editorial", desc: "Estratégia de conteúdo", icon: "M4 6h16M4 12h10M4 18h7" },
];

export function CreateWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const data = useData();
  const { members, projects, lines } = data;
  const [kind, setKind] = useState<Kind | null>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<Record<string, any>>({});

  const up = (patch: Record<string, any>) => setF((p) => ({ ...p, ...patch }));

  function reset() {
    setKind(null); setStep(0); setBusy(false); setF({});
  }
  function close() { reset(); onClose(); }

  function start(k: Kind) {
    setKind(k);
    setStep(0);
    setF(
      k === "tarefa" ? { title: "", description: "", assignee_id: members[0]?.id ?? "", priority: "media", project_id: "", due_date: todayISO(), labels: "" }
      : k === "conteudo" ? { title: "", editorial_line_id: lines[0]?.id ?? "", channel: "", format: FORMATS[0], publish_date: todayISO(), owner_id: members[0]?.id ?? "", status: "ideia", caption: "" }
      : k === "projeto" ? { name: "", description: "", client: "", owner_id: members[0]?.id ?? "", status: "planejamento", due_date: todayISO() }
      : { name: "", color: LINE_COLORS[0], strategic_goal: "", target_audience: "", frequency: "", main_themes: "", content_formats: "", channels: "", owner_id: members[0]?.id ?? "" }
    );
  }

  // ---- steps per kind: [label, hint, body] ----
  const steps = useMemo(() => {
    if (!kind) return [];
    const sel = (key: string, opts: [string, string][]) => (
      <select className="select" value={f[key] ?? ""} onChange={(e) => up({ [key]: e.target.value })}>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    );
    if (kind === "tarefa") return [
      ["Qual é a tarefa?", "Dê um título claro — você pode ajustar o resto depois.", <input key="t" autoFocus className="input text-base" placeholder="Ex.: Aprovar arte do post de lançamento" value={f.title} onChange={(e) => up({ title: e.target.value })} />],
      ["Quer descrever?", "Contexto, links, o que precisa ser feito. (Opcional)", <textarea key="d" className="textarea" rows={4} placeholder="Detalhes da tarefa…" value={f.description} onChange={(e) => up({ description: e.target.value })} />],
      ["Quem faz e qual a urgência?", "Responsável e prioridade.", <div key="a" className="space-y-3"><div><label className="field-label">Responsável</label>{sel("assignee_id", [["", "— Ninguém —"], ...members.map((m) => [m.id, m.name ?? ""] as [string, string])])}</div><div><label className="field-label">Prioridade</label>{sel("priority", PRIORITY)}</div></div>],
      ["Onde e quando?", "Projeto e prazo.", <div key="p" className="space-y-3"><div><label className="field-label">Projeto</label>{sel("project_id", [["", "— Sem projeto —"], ...projects.map((p) => [p.id, p.name] as [string, string])])}</div><div><label className="field-label">Prazo</label><input type="date" className="input" value={f.due_date} onChange={(e) => up({ due_date: e.target.value })} /></div></div>],
      ["Etiquetas", "Separe por vírgula. (Opcional)", <input key="l" className="input" placeholder="Ex.: Vídeo, Aprovação" value={f.labels} onChange={(e) => up({ labels: e.target.value })} />],
    ] as [string, string, React.ReactNode][];
    if (kind === "conteudo") return [
      ["Qual é o conteúdo?", "Um título que identifique a peça.", <input key="t" autoFocus className="input text-base" placeholder="Ex.: Carrossel sobre tendências" value={f.title} onChange={(e) => up({ title: e.target.value })} />],
      ["Linha editorial", "A qual estratégia este conteúdo pertence?", sel("editorial_line_id", [["", "— Nenhuma —"], ...lines.map((l) => [l.id, l.name] as [string, string])])],
      ["Canal e formato", "Onde e em qual formato será publicado.", <div key="c" className="space-y-3"><div><label className="field-label">Canal</label><input className="input" placeholder="Ex.: Instagram" value={f.channel} onChange={(e) => up({ channel: e.target.value })} /></div><div><label className="field-label">Formato</label>{sel("format", FORMATS.map((x) => [x, x] as [string, string]))}</div></div>],
      ["Quando e quem?", "Data de publicação e responsável.", <div key="d" className="space-y-3"><div><label className="field-label">Data de publicação</label><input type="date" className="input" value={f.publish_date} onChange={(e) => up({ publish_date: e.target.value })} /></div><div><label className="field-label">Responsável</label>{sel("owner_id", [["", "— Ninguém —"], ...members.map((m) => [m.id, m.name ?? ""] as [string, string])])}</div></div>],
      ["Legenda", "Texto da publicação. (Opcional)", <textarea key="l" className="textarea" rows={4} placeholder="Escreva a legenda…" value={f.caption} onChange={(e) => up({ caption: e.target.value })} />],
    ] as [string, string, React.ReactNode][];
    if (kind === "projeto") return [
      ["Nome do projeto", "Como você chama essa iniciativa?", <input key="t" autoFocus className="input text-base" placeholder="Ex.: Campanha de Natal" value={f.name} onChange={(e) => up({ name: e.target.value })} />],
      ["Descrição", "Objetivo e escopo. (Opcional)", <textarea key="d" className="textarea" rows={4} placeholder="Sobre o projeto…" value={f.description} onChange={(e) => up({ description: e.target.value })} />],
      ["Cliente e responsável", "Para quem e quem lidera.", <div key="c" className="space-y-3"><div><label className="field-label">Cliente / empresa</label><input className="input" placeholder="Ex.: Acme Corp" value={f.client} onChange={(e) => up({ client: e.target.value })} /></div><div><label className="field-label">Responsável</label>{sel("owner_id", [["", "— Ninguém —"], ...members.map((m) => [m.id, m.name ?? ""] as [string, string])])}</div></div>],
      ["Status e prazo", "Situação atual e data final.", <div key="s" className="space-y-3"><div><label className="field-label">Status</label>{sel("status", PROJECT_STATUS)}</div><div><label className="field-label">Prazo final</label><input type="date" className="input" value={f.due_date} onChange={(e) => up({ due_date: e.target.value })} /></div></div>],
    ] as [string, string, React.ReactNode][];
    return [
      ["Nome da linha", "Ex.: Autoridade, Conexão, Bastidores…", <div key="n" className="space-y-3"><input autoFocus className="input text-base" placeholder="Nome da linha editorial" value={f.name} onChange={(e) => up({ name: e.target.value })} /><div><label className="field-label">Cor</label><div className="flex flex-wrap gap-1.5">{LINE_COLORS.map((c) => <button key={c} type="button" onClick={() => up({ color: c })} className="h-7 w-7 rounded-full" style={{ background: c, outline: f.color === c ? "2px solid var(--ink)" : "none", outlineOffset: 2 }} />)}</div></div></div>],
      ["Objetivo estratégico", "O que essa linha quer alcançar?", <textarea key="g" className="textarea" rows={3} placeholder="Objetivo…" value={f.strategic_goal} onChange={(e) => up({ strategic_goal: e.target.value })} />],
      ["Público e frequência", "Para quem e com que ritmo.", <div key="p" className="space-y-3"><div><label className="field-label">Público-alvo</label><input className="input" value={f.target_audience} onChange={(e) => up({ target_audience: e.target.value })} /></div><div><label className="field-label">Frequência</label><input className="input" placeholder="Ex.: 2x por semana" value={f.frequency} onChange={(e) => up({ frequency: e.target.value })} /></div></div>],
      ["Temas, formatos e canais", "Separe por vírgula. (Opcional)", <div key="t" className="space-y-3"><div><label className="field-label">Temas</label><input className="input" value={f.main_themes} onChange={(e) => up({ main_themes: e.target.value })} /></div><div><label className="field-label">Formatos</label><input className="input" value={f.content_formats} onChange={(e) => up({ content_formats: e.target.value })} /></div><div><label className="field-label">Canais</label><input className="input" value={f.channels} onChange={(e) => up({ channels: e.target.value })} /></div></div>],
    ] as [string, string, React.ReactNode][];
  }, [kind, f, members, projects, lines]);

  const primaryFilled = kind === "tarefa" || kind === "conteudo" ? !!(f.title && f.title.trim()) : !!(f.name && f.name.trim());

  async function create() {
    if (!kind || !primaryFilled) return;
    setBusy(true);
    const sp = (s: string) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);
    try {
      if (kind === "tarefa") {
        await data.saveTask({ title: f.title.trim(), description: f.description || null, assignee_id: f.assignee_id || null, priority: f.priority as Task["priority"], project_id: f.project_id || null, due_date: f.due_date || null, status: "a_fazer", labels: sp(f.labels) });
      } else if (kind === "conteudo") {
        await data.saveContent({ title: f.title.trim(), editorial_line_id: f.editorial_line_id || null, channel: f.channel || null, format: f.format || null, publish_date: f.publish_date || null, owner_id: f.owner_id || null, status: f.status as Content["status"], caption: f.caption || null });
      } else if (kind === "projeto") {
        await data.saveProject({ name: f.name.trim(), description: f.description || null, client: f.client || null, owner_id: f.owner_id || null, status: f.status as Project["status"], due_date: f.due_date || null });
      } else {
        await data.saveLine({ name: f.name.trim(), color: f.color, strategic_goal: f.strategic_goal || null, target_audience: f.target_audience || null, frequency: f.frequency || null, main_themes: sp(f.main_themes), content_formats: sp(f.content_formats), channels: sp(f.channels), owner_id: f.owner_id || null } as Partial<EditorialLine>);
      }
      close();
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;
  const total = steps.length;
  const last = step >= total - 1;
  const stepData = steps[step];

  return (
    <div className="ft-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10" onClick={close}>
      <div className="ft-pop card w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--line)" }}>
          <h3 className="text-base font-bold">{kind ? `Criar ${KINDS.find((x) => x.k === kind)!.title.toLowerCase()}` : "O que você quer criar?"}</h3>
          <button onClick={close} className="text-xl leading-none" style={{ color: "var(--muted)" }}>×</button>
        </div>

        {/* type chooser */}
        {!kind && (
          <div className="grid grid-cols-2 gap-3 p-5">
            {KINDS.map((x) => (
              <button key={x.k} onClick={() => start(x.k)} className="card flex flex-col items-start gap-2 p-4 text-left">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{x.icon.split("M").filter(Boolean).map((p, i) => <path key={i} d={"M" + p} />)}</svg>
                </span>
                <span className="font-semibold">{x.title}</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{x.desc}</span>
              </button>
            ))}
          </div>
        )}

        {/* stepped form */}
        {kind && stepData && (
          <>
            <div className="px-5 pt-4">
              <div className="mb-1 flex items-center justify-between text-xs" style={{ color: "var(--faint)" }}>
                <span>Passo {step + 1} de {total}</span>
                <button onClick={reset} className="hover:underline">Trocar tipo</button>
              </div>
              <div className="h-1 overflow-hidden rounded-full" style={{ background: "var(--accent-soft)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${((step + 1) / total) * 100}%`, background: "var(--accent)" }} />
              </div>
            </div>
            <div className="px-5 py-5">
              <h4 className="text-lg font-bold">{stepData[0]}</h4>
              <p className="mb-3 text-sm" style={{ color: "var(--muted)" }}>{stepData[1]}</p>
              {stepData[2]}
            </div>
            <div className="flex items-center justify-between gap-2 border-t px-5 py-3" style={{ borderColor: "var(--line)" }}>
              <button className="btn btn-ghost" onClick={() => (step === 0 ? reset() : setStep(step - 1))}>
                {step === 0 ? "Voltar" : "Anterior"}
              </button>
              <div className="flex gap-2">
                {!last && primaryFilled && (
                  <button className="btn btn-ghost" disabled={busy} onClick={create}>{busy ? "Criando…" : "Criar agora"}</button>
                )}
                {last ? (
                  <button className="btn btn-primary" disabled={!primaryFilled || busy} onClick={create}>{busy ? "Criando…" : "Criar"}</button>
                ) : (
                  <button className="btn btn-primary" disabled={step === 0 && !primaryFilled} onClick={() => setStep(step + 1)}>Próximo</button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
