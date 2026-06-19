"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "./DataProvider";
import { createClient } from "@/lib/supabase/client";

export function OnboardingPanel() {
  const { profile, reload, toast } = useData();
  const [busy, setBusy] = useState(false);
  const supabase = createClient();

  function plus(n: number) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  async function seed() {
    setBusy(true);
    const cid = profile.company_id;
    try {
      const { data: lines } = await supabase
        .from("editorial_lines")
        .insert([
          { company_id: cid, name: "Autoridade", color: "#4f46e5", strategic_goal: "Posicionar a marca como referência do setor", target_audience: "Decisores B2B", frequency: "2x por semana", owner_id: profile.id },
          { company_id: cid, name: "Conexão", color: "#d97706", strategic_goal: "Humanizar a marca e gerar identificação", target_audience: "Base atual", frequency: "Semanal", owner_id: profile.id },
        ])
        .select();
      const lineId = lines?.[0]?.id ?? null;

      const { data: projects } = await supabase
        .from("projects")
        .insert([
          { company_id: cid, name: "Campanha de Lançamento", client: "Cliente Exemplo", description: "Projeto de exemplo para você explorar o Flowtask.", status: "em_andamento", due_date: plus(14), owner_id: profile.id },
        ])
        .select();
      const projId = projects?.[0]?.id ?? null;

      await supabase.from("tasks").insert([
        { company_id: cid, title: "Definir briefing da campanha", status: "a_fazer", priority: "alta", due_date: plus(2), project_id: projId, assignee_id: profile.id },
        { company_id: cid, title: "Aprovar identidade visual", status: "em_revisao", priority: "media", due_date: plus(5), project_id: projId, assignee_id: profile.id },
        { company_id: cid, title: "Agendar primeira publicação", status: "backlog", priority: "media", due_date: plus(7), project_id: projId, assignee_id: profile.id },
      ]);

      await supabase.from("contents").insert([
        { company_id: cid, title: "Post de apresentação da marca", editorial_line_id: lineId, channel: "Instagram", format: "Carrossel", status: "ideia", publish_date: plus(3), owner_id: profile.id, project_id: projId },
      ]);

      await reload();
      toast("Dados de exemplo carregados ✓");
    } finally {
      setBusy(false);
    }
  }

  const steps: [string, string, string][] = [
    ["Crie uma tarefa", "Adicione sua primeira demanda com prazo e prioridade.", "/tarefas"],
    ["Abra um projeto", "Agrupe tarefas e conteúdos por cliente ou iniciativa.", "/projetos"],
    ["Defina uma linha editorial", "Organize a estratégia de conteúdo da sua marca.", "/linhas"],
  ];

  return (
    <div className="card mb-6 overflow-hidden">
      <div className="p-6" style={{ background: "linear-gradient(135deg, var(--accent-soft), transparent)" }}>
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent-strong)" }}>
          Bem-vindo ao Flowtask
        </div>
        <h2 className="mt-1 text-xl font-extrabold">Vamos começar, {profile.name?.split(" ")[0]}?</h2>
        <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--muted)" }}>
          Sua workspace está pronta e vazia. Escolha por onde começar — ou carregue dados de exemplo
          para explorar o sistema em segundos.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={seed} disabled={busy}>
            {busy ? "Carregando…" : "Carregar dados de exemplo"}
          </button>
          <Link href="/tarefas" className="btn btn-ghost">Criar minha primeira tarefa</Link>
        </div>
      </div>
      <div className="grid gap-px sm:grid-cols-3" style={{ background: "var(--line)" }}>
        {steps.map(([title, desc, href], i) => (
          <Link key={title} href={href} className="block p-5" style={{ background: "var(--surface)" }}>
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "var(--accent)" }}>
              {i + 1}
            </div>
            <div className="font-semibold">{title}</div>
            <div className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
