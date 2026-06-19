-- =====================================================================
-- Flowtask · Schema relacional (Supabase / PostgreSQL)
-- Cole TODO este script no Supabase → SQL Editor → New query → Run.
--
-- Aplica boas práticas do Supabase:
--  • RLS por empresa em todas as tabelas (isolamento multiempresa)
--  • auth.uid() envolto em (select ...) → avaliado uma vez por query
--  • helper SECURITY DEFINER em schema privado para resolver a empresa
--  • índices em todas as FKs, em company_id e nos campos mais filtrados
--  • triggers de updated_at e criação automática de empresa/perfil no signup
-- =====================================================================

create schema if not exists private;

-- ---------------------------------------------------------------------
-- TABELAS
-- ---------------------------------------------------------------------

create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text,
  email       text,
  avatar_url  text,
  role        text not null default 'admin'
              check (role in ('admin','manager','collaborator','viewer')),
  created_at  timestamptz not null default now()
);

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  description text,
  client      text,
  owner_id    uuid references public.profiles(id) on delete set null,
  status      text not null default 'planejamento'
              check (status in ('planejamento','em_andamento','em_revisao','concluido','pausado')),
  due_date    date,
  links       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  title       text not null,
  description text,
  project_id  uuid references public.projects(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  client      text,
  status      text not null default 'a_fazer'
              check (status in ('backlog','a_fazer','em_andamento','em_revisao','aprovado','concluido','pausado')),
  priority    text not null default 'media'
              check (priority in ('baixa','media','alta','urgente')),
  due_date    date,
  labels      text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.task_checklist_items (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  task_id     uuid not null references public.tasks(id) on delete cascade,
  label       text not null,
  is_done     boolean not null default false,
  position    integer not null default 0
);

create table if not exists public.task_dependencies (
  company_id    uuid not null references public.companies(id) on delete cascade,
  task_id       uuid not null references public.tasks(id) on delete cascade,
  depends_on_id uuid not null references public.tasks(id) on delete cascade,
  primary key (task_id, depends_on_id),
  check (task_id <> depends_on_id)
);

create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  entity_type text not null check (entity_type in ('task','content','project')),
  entity_id   uuid not null,
  author_id   uuid references public.profiles(id) on delete set null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.editorial_lines (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  name            text not null,
  color           text not null default '#4f6f52',
  strategic_goal  text,
  target_audience text,
  main_themes     text[] not null default '{}',
  content_formats text[] not null default '{}',
  channels        text[] not null default '{}',
  frequency       text,
  owner_id        uuid references public.profiles(id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.contents (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  title             text not null,
  editorial_line_id uuid references public.editorial_lines(id) on delete set null,
  project_id        uuid references public.projects(id) on delete set null,
  owner_id          uuid references public.profiles(id) on delete set null,
  channel           text,
  format            text,
  publish_date      date,
  status            text not null default 'ideia'
                    check (status in ('ideia','roteiro','design','revisao','aprovado','agendado','publicado')),
  caption           text,
  creative_text     text,
  refs              text,
  design_link       text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ÍNDICES  (FKs, company_id e campos mais filtrados)
-- ---------------------------------------------------------------------
create index if not exists profiles_company_idx        on public.profiles (company_id);
create index if not exists projects_company_idx         on public.projects (company_id);
create index if not exists projects_owner_idx           on public.projects (owner_id);
create index if not exists projects_due_idx             on public.projects (due_date);
create index if not exists tasks_company_idx            on public.tasks (company_id);
create index if not exists tasks_project_idx            on public.tasks (project_id);
create index if not exists tasks_assignee_idx           on public.tasks (assignee_id);
create index if not exists tasks_status_idx             on public.tasks (company_id, status);
create index if not exists tasks_due_idx                on public.tasks (due_date);
create index if not exists checklist_task_idx           on public.task_checklist_items (task_id);
create index if not exists checklist_company_idx        on public.task_checklist_items (company_id);
create index if not exists deps_task_idx                on public.task_dependencies (task_id);
create index if not exists deps_dependson_idx           on public.task_dependencies (depends_on_id);
create index if not exists comments_entity_idx          on public.comments (entity_type, entity_id);
create index if not exists comments_company_idx         on public.comments (company_id);
create index if not exists lines_company_idx            on public.editorial_lines (company_id);
create index if not exists contents_company_idx         on public.contents (company_id);
create index if not exists contents_line_idx            on public.contents (editorial_line_id);
create index if not exists contents_project_idx         on public.contents (project_id);
create index if not exists contents_status_idx          on public.contents (company_id, status);
create index if not exists contents_publish_idx         on public.contents (publish_date);

-- ---------------------------------------------------------------------
-- HELPER: empresa do usuário autenticado (SECURITY DEFINER, schema privado)
-- Lê profiles ignorando RLS e devolve o company_id de quem chamou.
-- ---------------------------------------------------------------------
create or replace function private.user_company_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select company_id from public.profiles where id = (select auth.uid());
$$;

revoke execute on function private.user_company_id() from public, anon;
grant execute on function private.user_company_id() to authenticated;

-- ---------------------------------------------------------------------
-- TRIGGER: updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();
drop trigger if exists trg_tasks_updated on public.tasks;
create trigger trg_tasks_updated before update on public.tasks
  for each row execute function public.set_updated_at();
drop trigger if exists trg_lines_updated on public.editorial_lines;
create trigger trg_lines_updated before update on public.editorial_lines
  for each row execute function public.set_updated_at();
drop trigger if exists trg_contents_updated on public.contents;
create trigger trg_contents_updated before update on public.contents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- TRIGGER: cria empresa + perfil automaticamente no primeiro signup
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_company uuid;
begin
  insert into public.companies (name)
    values (coalesce(split_part(new.email, '@', 1), 'Minha empresa') || ' · workspace')
    returning id into new_company;

  insert into public.profiles (id, company_id, name, email, role)
    values (
      new.id,
      new_company,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email,
      'admin'
    );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Macro: cada tabela só enxerga linhas da própria empresa.
-- ---------------------------------------------------------------------
alter table public.companies         enable row level security;
alter table public.profiles          enable row level security;
alter table public.projects          enable row level security;
alter table public.tasks             enable row level security;
alter table public.task_checklist_items enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.comments          enable row level security;
alter table public.editorial_lines   enable row level security;
alter table public.contents          enable row level security;

-- companies: o usuário enxerda apenas a própria empresa
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies for select to authenticated
  using (id = (select private.user_company_id()));
drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies for update to authenticated
  using (id = (select private.user_company_id()))
  with check (id = (select private.user_company_id()));

-- profiles: membros da mesma empresa; cada um edita o próprio
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (company_id = (select private.user_company_id()));
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Macro de políticas por empresa para as tabelas de domínio.
do $$
declare t text;
begin
  foreach t in array array[
    'projects','tasks','task_checklist_items','task_dependencies',
    'comments','editorial_lines','contents'
  ] loop
    execute format('drop policy if exists %1$s_select on public.%1$s;', t);
    execute format('create policy %1$s_select on public.%1$s for select to authenticated using (company_id = (select private.user_company_id()));', t);
    execute format('drop policy if exists %1$s_insert on public.%1$s;', t);
    execute format('create policy %1$s_insert on public.%1$s for insert to authenticated with check (company_id = (select private.user_company_id()));', t);
    execute format('drop policy if exists %1$s_update on public.%1$s;', t);
    execute format('create policy %1$s_update on public.%1$s for update to authenticated using (company_id = (select private.user_company_id())) with check (company_id = (select private.user_company_id()));', t);
    execute format('drop policy if exists %1$s_delete on public.%1$s;', t);
    execute format('create policy %1$s_delete on public.%1$s for delete to authenticated using (company_id = (select private.user_company_id()));', t);
  end loop;
end $$;

-- Pronto. Depois:
--  • Authentication → Providers → Email: deixe ativo.
--    (Para entrar sem confirmar e-mail, desative "Confirm email".)
--  • Project Settings → API: copie "Project URL" e a chave "anon public"
--    e configure no app (variáveis NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).
