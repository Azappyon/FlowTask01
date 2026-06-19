"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Chip, Drawer } from "./ui";
import { PageHead, Empty } from "./PageHead";
import { fmtLong } from "@/lib/format";
import type { Company, Profile, Task, Project, Content } from "@/lib/types";

const statusChip: Record<string, [string, string]> = {
  pending: ["Pendente", "var(--amber)"],
  active: ["Ativa", "var(--green)"],
  suspended: ["Suspensa", "var(--red)"],
};

export function AdminView() {
  const supabase = useMemo(() => createClient(), []);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [counts, setCounts] = useState({ tasks: 0, contents: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pendentes" | "empresas" | "metricas">("pendentes");
  const [viewing, setViewing] = useState<Company | null>(null);

  const reload = useCallback(async () => {
    const [c, p, t, ct] = await Promise.all([
      supabase.from("companies").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,company_id,name,email,role,created_at,is_super_admin"),
      supabase.from("tasks").select("id", { count: "exact", head: true }),
      supabase.from("contents").select("id", { count: "exact", head: true }),
    ]);
    if (c.data) setCompanies(c.data as Company[]);
    if (p.data) setProfiles(p.data as Profile[]);
    setCounts({ tasks: t.count ?? 0, contents: ct.count ?? 0 });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function setStatus(id: string, status: Company["status"]) {
    await supabase.from("companies").update({ status }).eq("id", id);
    await reload();
  }

  const usersOf = (companyId: string) => profiles.filter((p) => p.company_id === companyId);
  const ownerOf = (companyId: string) => usersOf(companyId).find((p) => p.role === "admin") ?? usersOf(companyId)[0];

  const pending = companies.filter((c) => c.status === "pending");
  const managed = companies.filter((c) => c.status !== "pending");

  const tabBtn = (k: typeof tab, label: string, badge?: number) => (
    <button onClick={() => setTab(k)} className="rounded-md px-3 py-1.5 text-sm font-semibold"
      style={tab === k ? { background: "var(--accent-soft)", color: "var(--accent-strong)" } : { color: "var(--muted)" }}>
      {label}{badge ? ` (${badge})` : ""}
    </button>
  );

  return (
    <>
      <PageHead
        title="Admin"
        subtitle="Área exclusiva do superadmin — gestão de todas as empresas e usuários"
        action={
          <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: "var(--line)" }}>
            {tabBtn("pendentes", "Pendentes", pending.length)}
            {tabBtn("empresas", "Empresas")}
            {tabBtn("metricas", "Métricas")}
          </div>
        }
      />

      {loading && <div className="card"><Empty>Carregando…</Empty></div>}

      {!loading && tab === "pendentes" && (
        <div className="card divide-y" style={{ borderColor: "var(--line)" }}>
          {pending.length === 0 && <Empty>Nenhuma conta aguardando aprovação. 🎉</Empty>}
          {pending.map((c) => {
            const owner = ownerOf(c.id);
            return (
              <div key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ borderColor: "var(--line)" }}>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs" style={{ color: "var(--faint)" }}>
                    {owner?.name} · {owner?.email} · criado em {c.created_at ? fmtLong(c.created_at.slice(0, 10)) : "—"}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setStatus(c.id, "active")}>Aprovar</button>
                <button className="btn btn-danger" onClick={() => setStatus(c.id, "suspended")}>Recusar</button>
              </div>
            );
          })}
        </div>
      )}

      {!loading && tab === "empresas" && (
        <div className="card divide-y" style={{ borderColor: "var(--line)" }}>
          {managed.length === 0 && <Empty>Nenhuma empresa ativa ainda.</Empty>}
          {managed.map((c) => {
            const owner = ownerOf(c.id);
            const [lbl, color] = statusChip[c.status] ?? ["—", "var(--muted)"];
            return (
              <div key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ borderColor: "var(--line)" }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{c.name}</span>
                    <Chip color={color}>{lbl}</Chip>
                  </div>
                  <div className="text-xs" style={{ color: "var(--faint)" }}>
                    {usersOf(c.id).length} usuário(s){owner ? ` · ${owner.email}` : ""}
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => setViewing(c)}>Ver empresa</button>
                {c.status === "active" ? (
                  <button className="btn btn-danger" onClick={() => setStatus(c.id, "suspended")}>Suspender</button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setStatus(c.id, "active")}>Reativar</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && tab === "metricas" && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ["Empresas", companies.length, "var(--accent)"],
            ["Usuários", profiles.length, "var(--blue)"],
            ["Tarefas", counts.tasks, "var(--violet)"],
            ["Conteúdos", counts.contents, "var(--green)"],
          ].map(([l, v, c]) => (
            <div key={l as string} className="card p-4">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{l}</div>
              <div className="mt-1 text-3xl font-extrabold" style={{ color: c as string }}>{v}</div>
            </div>
          ))}
          <div className="card col-span-2 p-4 lg:col-span-4">
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Por status</div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              {(["pending", "active", "suspended"] as const).map((s) => (
                <span key={s} className="flex items-center gap-2">
                  <Chip color={statusChip[s][1]}>{statusChip[s][0]}</Chip>
                  {companies.filter((c) => c.status === s).length}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <Drawer open={!!viewing} onClose={() => setViewing(null)}>
        {viewing && <CompanyView company={viewing} users={usersOf(viewing.id)} onClose={() => setViewing(null)} />}
      </Drawer>
    </>
  );
}

function CompanyView({ company, users, onClose }: { company: Company; users: Profile[]; onClose: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contents, setContents] = useState<Content[]>([]);

  useEffect(() => {
    (async () => {
      const cid = company.id;
      const [t, p, c] = await Promise.all([
        supabase.from("tasks").select("*").eq("company_id", cid),
        supabase.from("projects").select("*").eq("company_id", cid),
        supabase.from("contents").select("*").eq("company_id", cid),
      ]);
      if (t.data) setTasks(t.data as Task[]);
      if (p.data) setProjects(p.data as Project[]);
      if (c.data) setContents(c.data as Content[]);
    })();
  }, [supabase, company.id]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b px-5 py-4" style={{ borderColor: "var(--line)" }}>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Visão da empresa (somente leitura)</div>
          <h2 className="mt-1 text-lg font-bold">{company.name}</h2>
        </div>
        <button onClick={onClose} className="text-xl" style={{ color: "var(--muted)" }}>×</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
        <div className="grid grid-cols-3 gap-3">
          {[["Tarefas", tasks.length], ["Projetos", projects.length], ["Conteúdos", contents.length]].map(([l, v]) => (
            <div key={l as string} className="card p-3 text-center">
              <div className="text-2xl font-extrabold">{v}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="sec-title">Usuários ({users.length})</div>
        {users.map((u) => (
          <div key={u.id} className="border-b py-1.5 text-sm" style={{ borderColor: "var(--line)" }}>
            {u.name} <span style={{ color: "var(--faint)" }}>· {u.email} · {u.role}</span>
          </div>
        ))}
        <div className="sec-title">Tarefas recentes</div>
        {tasks.slice(0, 10).map((t) => (
          <div key={t.id} className="border-b py-1.5 text-sm" style={{ borderColor: "var(--line)" }}>{t.title}</div>
        ))}
        {tasks.length === 0 && <Empty>Sem tarefas.</Empty>}
      </div>
    </div>
  );
}
