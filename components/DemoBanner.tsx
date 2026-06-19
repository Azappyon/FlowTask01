"use client";

import { useState } from "react";
import { useData } from "./DataProvider";

export function DemoBanner() {
  const { hasDemo, clearDemo } = useData();
  const [busy, setBusy] = useState(false);
  if (!hasDemo) return null;

  async function clear() {
    if (!confirm("Apagar todos os dados de exemplo? Isso remove apenas os itens fictícios — o que você criou é preservado.")) return;
    setBusy(true);
    await clearDemo();
    setBusy(false);
  }

  return (
    <div className="ft-fade mb-5 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "var(--accent-2)", background: "var(--accent-soft)" }}>
      <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--accent-strong)" }}>
        <circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" />
      </svg>
      <div className="min-w-0 flex-1 text-sm" style={{ color: "var(--accent-strong)" }}>
        <b>Dados de exemplo.</b> Tudo aqui é fictício, só para você explorar o sistema — edite ou exclua qualquer item à vontade, quando quiser.
      </div>
      <button className="btn btn-ghost" disabled={busy} onClick={clear}>
        {busy ? "Apagando…" : "Apagar dados de exemplo"}
      </button>
    </div>
  );
}
