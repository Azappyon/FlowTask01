"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered")) return "Este e-mail já tem conta. Tente entrar.";
  if (m.includes("password") && m.includes("6")) return "A senha precisa ter ao menos 6 caracteres.";
  if (m.includes("email") && m.includes("confirm")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("fetch")) return "Sem conexão com o Supabase. Confira a configuração.";
  return msg || "Não foi possível autenticar.";
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!email || !pass) {
      setMsg({ type: "err", text: "Preencha e-mail e senha." });
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { name: name || email.split("@")[0] } },
        });
        if (error) throw error;
        if (!data.session) {
          setMsg({ type: "ok", text: "Conta criada! Se for pedido, confirme pelo e-mail e depois entre." });
          setBusy(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setMsg({ type: "err", text: translateError((err as Error).message) });
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-black text-white"
            style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-2))" }}
          >
            F
          </div>
          <div>
            <div className="text-xl font-extrabold">Flowtask</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              {mode === "signin" ? "Entre na sua conta" : "Crie sua conta"}
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="field-label">Nome</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
          )}
          <div>
            <label className="field-label">E-mail</label>
            <input
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <label className="field-label">Senha</label>
            <input
              className="input"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {msg && (
            <div
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                color: msg.type === "err" ? "var(--red)" : "var(--green)",
                background: "var(--accent-soft)",
              }}
            >
              {msg.text}
            </div>
          )}

          <button className="btn btn-primary w-full" disabled={busy} type="submit">
            {busy ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm" style={{ color: "var(--muted)" }}>
          {mode === "signin" ? (
            <>
              Não tem conta?{" "}
              <button className="font-semibold" style={{ color: "var(--accent)" }} onClick={() => { setMode("signup"); setMsg(null); }}>
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button className="font-semibold" style={{ color: "var(--accent)" }} onClick={() => { setMode("signin"); setMsg(null); }}>
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
