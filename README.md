# Flowtask

Sistema de gestão de demandas, projetos, tarefas e calendário editorial de marketing.
Construído com **Next.js (App Router) + TypeScript + Tailwind CSS** e **Supabase**
(PostgreSQL + Auth + Row Level Security). Banco relacional completo, isolado por
empresa (multi-tenant).

---

## Visão geral

- **Dashboard** — foco do dia, atrasadas, em revisão, publicações próximas.
- **Tarefas** — CRUD, filtros, drawer com checklist, dependências e comentários.
- **Projetos** — CRUD com progresso, tarefas e conteúdos vinculados.
- **Calendário editorial** — grade mensal, sazonalidades e arrastar para reagendar.
- **Linhas editoriais** — estratégia de conteúdo (objetivo, público, formatos, canais).
- **Kanban** — arrastar tarefas e conteúdos entre status.
- **Relatórios** — produtividade e produção com filtro de período.
- **Equipe** — membros e papéis; perfil próprio editável.
- **Auth** — login/cadastro por e-mail; cada empresa só enxerga os próprios dados (RLS).

---

## 1. Configurar o Supabase (uma vez, ~5 min)

1. Acesse o painel do seu projeto em https://supabase.com.
2. **SQL Editor → New query** → cole TODO o conteúdo de `supabase/schema.sql` → **Run**.
   Isso cria as tabelas, índices, segurança (RLS) e os gatilhos que criam
   empresa + perfil automaticamente no primeiro cadastro.
3. **Authentication → Providers → Email**: deixe ativo.
   Para entrar sem precisar confirmar e-mail, desative **"Confirm email"**.
4. **Project Settings → API**: copie o **Project URL** e a chave **anon public**.

---

## 2. Rodar localmente (opcional)

```bash
npm install
cp .env.local.example .env.local   # preencha URL e chave anon
npm run dev                         # http://localhost:3000
```

Crie sua conta na tela de login — o perfil e a empresa são criados automaticamente.

---

## 3. Subir no GitHub

Recomendado: este app (`flowtask-app/`) é a **raiz** do repositório.

```bash
cd flowtask-app
git init
git add .
git commit -m "Flowtask: app Next.js + Supabase"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/flowtask.git
git push -u origin main
```

> O `.gitignore` já exclui `node_modules`, `.next` e `.env.local`
> (suas chaves nunca vão para o GitHub).

---

## 4. Publicar na Vercel

1. https://vercel.com → **Add New → Project** → importe o repositório.
2. Se você subiu a pasta `flowtask-app` como raiz do repo, deixe o **Root Directory**
   padrão. Se subiu a pasta `Flowtask` inteira, defina **Root Directory = `flowtask-app`**.
3. Framework: **Next.js** (detectado automaticamente).
4. **Environment Variables** — adicione as duas:

   | Nome | Valor |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | seu Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sua chave anon public |

5. **Deploy**. Ao final, a Vercel te dá a URL pública do sistema.

> Depois do primeiro deploy, em **Supabase → Authentication → URL Configuration**,
> adicione a URL da Vercel em **Site URL** e em **Redirect URLs** para o login
> funcionar 100% no domínio publicado.

---

## Stack e segurança

- A chave **anon** é pública e segura no navegador: o acesso é controlado por
  **Row Level Security** no Postgres — cada usuário só lê/grava dados da própria empresa.
- O schema segue boas práticas do Supabase: `auth.uid()` envolto em `(select ...)`,
  helper `SECURITY DEFINER` em schema privado, índices em todas as FKs e nos campos
  mais filtrados, e gatilhos de `updated_at`.

## Estrutura

```
app/                 rotas (App Router)
  (app)/             área autenticada (dashboard, tarefas, ...)
  login/             tela de login/cadastro
components/          telas e componentes de UI
lib/                 supabase, tipos, constantes e helpers
supabase/schema.sql  banco de dados (rode no SQL Editor)
```
