"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useData } from "./DataProvider";

const DEMO_ROUTES = ["/dashboard", "/tarefas", "/projetos", "/linhas", "/calendario", "/kanban", "/relatorios"];

function DemoActions() {
  const pathname = usePathname();
  const { hasDemo, seedDemo, clearDemo } = useData();
  const [busy, setBusy] = useState<"" | "seed" | "clear">("");
  if (!DEMO_ROUTES.includes(pathname)) return null;

  async function seed() {
    setBusy("seed");
    await seedDemo();
    setBusy("");
  }
  async function clear() {
    if (!confirm("Apagar todos os dados de exemplo? Remove apenas os itens fictícios — o que você criou é preservado.")) return;
    setBusy("clear");
    await clearDemo();
    setBusy("");
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button className="btn btn-ghost px-3 py-1.5 text-xs" disabled={hasDemo || busy !== ""} onClick={seed}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /></svg>
        {busy === "seed" ? "Preenchendo…" : "Preencher com exemplos"}
      </button>
      <button className="btn btn-ghost px-3 py-1.5 text-xs" style={{ color: hasDemo ? "var(--red)" : undefined }} disabled={!hasDemo || busy !== ""} onClick={clear}>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
        {busy === "clear" ? "Apagando…" : "Apagar exemplos"}
      </button>
      <span className="text-xs" style={{ color: "var(--faint)" }}>
        {hasDemo ? "Dados fictícios no ar — edite ou exclua à vontade." : "Popule o sistema com dados de exemplo para explorar."}
      </span>
    </div>
  );
}

export function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && (
            <div className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
              {subtitle}
            </div>
          )}
        </div>
        {action}
      </div>
      <DemoActions />
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-10 text-center text-sm" style={{ color: "var(--faint)" }}>
      {children}
    </div>
  );
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
