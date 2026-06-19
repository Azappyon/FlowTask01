"use client";

import { useState } from "react";
import { useData } from "./DataProvider";
import { Avatar, Chip, Modal, Field, FieldRow } from "./ui";
import { PageHead } from "./PageHead";
import { ROLES, label } from "@/lib/constants";

export function TeamView() {
  const { members, profile, tasks, updateProfile } = useData();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(profile.name ?? "");
  const [role, setRole] = useState(profile.role);

  const openCount = (id: string) => tasks.filter((t) => t.assignee_id === id && !["concluido", "aprovado"].includes(t.status)).length;

  return (
    <>
      <PageHead
        title="Equipe"
        subtitle={`${members.length} membro(s) · responsáveis usados em todo o sistema`}
        action={<button className="btn btn-ghost" onClick={() => { setName(profile.name ?? ""); setRole(profile.role); setEditOpen(true); }}>Editar meu perfil</button>}
      />
      <div className="card divide-y" style={{ borderColor: "var(--line)" }}>
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: "var(--line)" }}>
            <Avatar member={m} size={32} />
            <div className="flex-1">
              <div className="text-sm font-semibold">{m.name} {m.id === profile.id && <span className="text-xs" style={{ color: "var(--faint)" }}>(você)</span>}</div>
              <div className="text-xs" style={{ color: "var(--faint)" }}>{m.email}</div>
            </div>
            <Chip color="var(--accent)">{label(m.role, ROLES)}</Chip>
            <span className="text-xs" style={{ color: "var(--muted)" }}>{openCount(m.id)} aberta(s)</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2 rounded-xl border p-4 text-sm" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
        <span>ℹ️</span>
        <span>Para adicionar novos membros, convide-os pelo Supabase (Authentication → Users) ou compartilhe o link de cadastro — cada pessoa cria sua conta e entra na mesma empresa quando você liberar convites. A edição de papel de outros membros entra na fase de colaboração.</span>
      </div>

      <Modal open={editOpen} title="Meu perfil" onClose={() => setEditOpen(false)}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setEditOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={async () => { await updateProfile({ name, role }); setEditOpen(false); }}>Salvar</button>
        </>}>
        <Field label="Nome"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <FieldRow>
          <div><label className="field-label">Papel</label>
            <select className="select" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
              {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label className="field-label">E-mail</label><input className="input" value={profile.email ?? ""} disabled /></div>
        </FieldRow>
      </Modal>
    </>
  );
}
