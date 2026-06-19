import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DataProvider } from "@/components/DataProvider";
import { Shell } from "@/components/Shell";
import type { Profile } from "@/lib/types";

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
          Seu usuário existe, mas não há um perfil/empresa vinculado. Rode o <b>supabase/schema.sql</b> no
          SQL Editor do Supabase e crie a conta novamente. O perfil é criado automaticamente no cadastro.
        </p>
        <form action="/auth/signout" method="post" className="mt-4">
          <button className="btn btn-ghost" type="submit">Sair</button>
        </form>
      </div>
    );
  }

  return (
    <DataProvider initialProfile={profile as Profile}>
      <Shell>{children}</Shell>
    </DataProvider>
  );
}
