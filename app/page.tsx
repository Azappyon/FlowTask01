import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const features: [string, string, string][] = [
    ["Painel do dia", 'Responde "o que eu preciso fazer hoje?" assim que você entra.', "M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z"],
    ["Tarefas & projetos", "Demandas com prioridade, prazo, checklist, dependências e comentários.", "M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"],
    ["Calendário editorial", "Planeje conteúdos por linha editorial, com sazonalidades do ano.", "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
    ["Kanban arrastável", "Mova tarefas e conteúdos entre status com um arrastar.", "M4 4h6v16H4zM14 4h6v10h-6z"],
    ["Relatórios", "Produtividade e produção com filtros de período.", "M3 3v18h18M7 14l3-3 3 3 5-6"],
    ["Multiempresa seguro", "Cada empresa só enxerga os próprios dados (isolamento por RLS).", "M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"],
  ];

  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)" }} className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-black text-white" style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-2))" }}>F</div>
          <span className="text-lg font-extrabold">Flowtask</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost">Entrar</Link>
          <Link href="/login" className="btn btn-primary">Criar conta</Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-10 pt-16 text-center">
        <div className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}>
          Gestão de demandas + conteúdo de marketing
        </div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          Organize a rotina, os projetos e o calendário editorial em um só lugar.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg" style={{ color: "var(--muted)" }}>
          O Flowtask reúne tarefas, projetos e produção de conteúdo numa ferramenta de uso diário —
          feita para profissionais de marketing, gestores e pequenas equipes.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link href="/login" className="btn btn-primary px-5 py-2.5 text-base">Começar agora</Link>
          <Link href="/login" className="btn btn-ghost px-5 py-2.5 text-base">Já tenho conta</Link>
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--faint)" }}>
          Novas contas passam por aprovação antes de liberar o acesso.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, desc, d]) => (
            <div key={title} className="card p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--accent-soft)", color: "var(--accent-strong)" }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {d.split("M").filter(Boolean).map((p, i) => <path key={i} d={"M" + p} />)}
                </svg>
              </div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <div className="card p-10">
          <h2 className="text-2xl font-extrabold">Pronto para organizar seu dia?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm" style={{ color: "var(--muted)" }}>
            Crie sua conta e, assim que aprovada, comece a gerenciar tarefas, projetos e conteúdos sem fricção.
          </p>
          <Link href="/login" className="btn btn-primary mt-5 inline-flex px-5 py-2.5 text-base">Criar minha conta</Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs" style={{ borderColor: "var(--line)", color: "var(--faint)" }}>
        Flowtask · feito para uso diário
      </footer>
    </div>
  );
}
