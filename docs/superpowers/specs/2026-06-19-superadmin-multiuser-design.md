# Flowtask · Superadmin & multiusuário — Design (2026-06-19)

## Objetivo
Abrir o Flowtask para outras pessoas, com um superadmin que aprova/gerencia contas.

## Decisão de arquitetura (Opção A)
Superadmin resolvido pela própria RLS via `private.is_super_admin()`, sem chave secreta
no servidor. Leitura global liberada ao superadmin; escrita continua restrita à empresa.
O app filtra explicitamente por `company_id` para não misturar dados.

## Fase 1 — Fundação
- `profiles.is_super_admin` e `companies.status` (pending|active|suspended).
- Trigger de signup: `hgdesignergrf@gmail.com` nasce superadmin + empresa ativa; demais `pending`.
- Gate no layout autenticado: empresa pending/suspended vê aviso; superadmin sempre passa.

## Fase 2 — Painel /admin (somente superadmin)
- Guard de rota no servidor + item de menu condicional.
- Pendentes (aprovar/recusar), Empresas (suspender/reativar), Métricas, Ver empresa (read-only).

## Fase 3 — Landing pública
- `/` apresenta o produto a visitantes; logados vão ao dashboard.

## Próximas fases
- Redesign de UI/UX; Onboarding do novo usuário.
