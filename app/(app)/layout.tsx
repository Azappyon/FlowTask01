import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DataProvider } from "@/components/DataProvider";
import { Shell } from "@/components/Shell";
import type { Profile } from "@/lib/types";

function GateScreen({ kind }: { kind: "pending" | "suspended" }) {
  const pending = kind === "pending";
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: "var(--accent)" }}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            {pending ? (
              <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="9" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </>
            )}
          </svg>
        </div>
        <h1 className="text-xl font-bold">{pending ? "Conta aguardando aprovação" : "Conta suspensa"}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          {pending
            ? "Seu cadastro foi recebido e está em análise. Você será liberado assim que um administrador aprovar o acesso."
            : "Seu acesso está suspenso no momento. Entre em contato com o administrador para mais informações."}
        </p>
        <form action="/auth/signout" method="post" className="mt-6">
          <button className="btn btn-ghost" type="submit">Sair</button>
        </form>
      </div>
    </div>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="mx-auto mt-20 max-w-lg rounded-xl border p-6" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <h2 className="mb-2 text-lg font-bold">Conta sem perfil</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Seu usuário existe, mas não há um perfil/empresa vinculado. Rode os scripts SQL em
          <b> supabase/</b> no SQL Editor do Supabase e crie a conta novamente.
        </p>
        <form action="/auth/signout" method="post" className="mt-4">
          <button className="btn btn-ghost" type="submit">Sair</button>
        </form>
      </div>
    );
  }

  const typed = profile as Profile;

  if (!typed.is_super_admin) {
    const { data: company } = await supabase
      .from("companies")
      .select("status")
      .eq("id", typed.company_id)
      .single();
    const status = company?.status ?? "active";
    if (status === "pending") return <GateScreen kind="pending" />;
    if (status === "suspended") return <GateScreen kind="suspended" />;
  }

  return (
    <DataProvider initialProfile={typed}>
      <Shell>{children}</Shell>
    </DataProvider>
  );
}
