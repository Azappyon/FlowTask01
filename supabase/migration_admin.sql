-- =====================================================================
-- Flowtask · Migração: Superadmin + aprovação de contas (Fase 1)
-- Rode no Supabase → SQL Editor → New query → Run.
-- (Pré-requisito: o schema.sql já foi aplicado neste projeto.)
-- =====================================================================

-- 1) Colunas novas -----------------------------------------------------
alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

alter table public.companies
  add column if not exists status text not null default 'active'
  check (status in ('pending','active','suspended'));

-- 2) Helper: o usuário autenticado é superadmin? ----------------------
create or replace function private.is_super_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce(
    (select is_super_admin from public.profiles where id = (select auth.uid())),
    false
  );
$$;
revoke execute on function private.is_super_admin() from public, anon;
grant execute on function private.is_super_admin() to authenticated;

-- 3) Cadastro: superadmin reconhecido pelo e-mail; ---------------------
--    novas empresas nascem "pending" (aguardando aprovação).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_company uuid;
  admin_flag  boolean := lower(new.email) = 'hgdesignergrf@gmail.com';
begin
  insert into public.companies (name, status)
    values (
      coalesce(split_part(new.email, '@', 1), 'Minha empresa') || ' · workspace',
      case when admin_flag then 'active' else 'pending' end
    )
    returning id into new_company;

  insert into public.profiles (id, company_id, name, email, role, is_super_admin)
    values (
      new.id,
      new_company,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email,
      'admin',
      admin_flag
    );
  return new;
end;
$$;

-- 4) Caso a conta superadmin já exista, marca agora --------------------
update public.profiles
   set is_super_admin = true
 where lower(email) = 'hgdesignergrf@gmail.com';

update public.companies
   set status = 'active'
 where id in (
   select company_id from public.profiles
   where lower(email) = 'hgdesignergrf@gmail.com'
 );

-- 5) RLS: superadmin enxerga tudo (leitura) e gerencia status ----------
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies for select to authenticated
  using (id = (select private.user_company_id()) or (select private.is_super_admin()));

drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies for update to authenticated
  using (id = (select private.user_company_id()) or (select private.is_super_admin()))
  with check (id = (select private.user_company_id()) or (select private.is_super_admin()));

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (company_id = (select private.user_company_id()) or (select private.is_super_admin()));

-- Tabelas de domínio: superadmin pode LER (para painel/métricas/visão).
-- Escrita continua restrita à própria empresa.
do $$
declare t text;
begin
  foreach t in array array[
    'projects','tasks','task_checklist_items','task_dependencies',
    'comments','editorial_lines','contents'
  ] loop
    execute format('drop policy if exists %1$s_select on public.%1$s;', t);
    execute format('create policy %1$s_select on public.%1$s for select to authenticated using (company_id = (select private.user_company_id()) or (select private.is_super_admin()));', t);
  end loop;
end $$;

-- Pronto. Crie a conta com hgdesignergrf@gmail.com (se ainda não existir)
-- e ela já entra como superadmin, com a empresa ativa.
