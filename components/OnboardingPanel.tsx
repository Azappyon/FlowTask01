"use client";

import { useState } from "react";
import Link from "next/link";
import { useData } from "./DataProvider";

export function OnboardingPanel() {
  const { profile, seedDemo } = useData();
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    await seedDemo();
    setBusy(false);
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
          Sua workspace está vazia. Carregue um conjunto completo de dados de exemplo (fictícios)
          para explorar tudo em segundos — depois é só editar ou apagar o que quiser.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={load} disabled={busy}>
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
