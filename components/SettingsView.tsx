"use client";

import { useData } from "./DataProvider";
import { PageHead } from "./PageHead";
import { ROLES, label } from "@/lib/constants";

export function SettingsView() {
  const { profile } = useData();

  function toggleTheme() {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("flowtask_theme", dark ? "dark" : "light"); } catch {}
  }

  return (
    <>
      <PageHead title="Configurações" subtitle="Perfil, aparência e conta" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="sec-title mt-0">Perfil</div>
          <Row label="Nome" value={profile.name ?? "—"} />
          <Row label="E-mail" value={profile.email ?? "—"} />
          <Row label="Papel" value={label(profile.role, ROLES)} />
        </div>
        <div className="card p-5">
          <div className="sec-title mt-0">Aparência</div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--muted)" }}>Tema da interface</span>
            <button className="btn btn-ghost" onClick={toggleTheme}>Alternar claro / escuro</button>
          </div>
        </div>
        <div className="card p-5">
          <div className="sec-title mt-0">Conta</div>
          <p className="mb-3 text-sm" style={{ color: "var(--muted)" }}>Seus dados são salvos com segurança no Supabase e isolados por empresa (RLS).</p>
          <form action="/auth/signout" method="post">
            <button className="btn btn-danger" type="submit">Sair da conta</button>
          </form>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <div className="field-label">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
