"use client";

import { useEffect } from "react";
import { AVATAR_COLORS } from "@/lib/constants";
import { initials, colorFromId } from "@/lib/format";
import type { Profile } from "@/lib/types";

export function Avatar({ member, size = 26 }: { member?: Profile | null; size?: number }) {
  if (!member) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ width: size, height: size, background: "var(--faint)" }}
        title="Sem responsável"
      >
        —
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ width: size, height: size, background: colorFromId(member.id, AVATAR_COLORS) }}
      title={member.name ?? ""}
    >
      {initials(member.name)}
    </span>
  );
}

export function Chip({
  children,
  color,
  soft = true,
}: {
  children: React.ReactNode;
  color?: string;
  soft?: boolean;
}) {
  const c = color ?? "var(--muted)";
  return (
    <span
      className="chip"
      style={
        soft
          ? { background: "color-mix(in srgb," + c + " 15%, transparent)", color: c }
          : { background: c, color: "#fff" }
      }
    >
      {children}
    </span>
  );
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    backlog: "var(--faint)",
    a_fazer: "var(--blue)",
    em_andamento: "var(--accent)",
    em_revisao: "var(--violet)",
    aprovado: "var(--green)",
    concluido: "var(--green)",
    pausado: "var(--muted)",
    planejamento: "var(--blue)",
    // content
    ideia: "var(--faint)",
    roteiro: "var(--blue)",
    design: "var(--accent)",
    revisao: "var(--violet)",
    agendado: "var(--amber)",
    publicado: "var(--green)",
  };
  return map[status] ?? "var(--muted)";
}

export function priorityColor(p: string): string {
  return { baixa: "var(--muted)", media: "var(--blue)", alta: "var(--amber)", urgente: "var(--red)" }[p] ?? "var(--muted)";
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--line)" }}>
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: "var(--muted)" }}>
            ×
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4 scrollbar-thin">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t px-5 py-3" style={{ borderColor: "var(--line)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-[460px] overflow-y-auto scrollbar-thin transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "var(--surface)", borderLeft: "1px solid var(--line)" }}
      >
        {open && children}
      </aside>
    </>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 grid grid-cols-2 gap-3">{children}</div>;
}
