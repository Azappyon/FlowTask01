-- =====================================================================
-- Flowtask · Migração: dados de exemplo (fictícios) por empresa
-- Rode no Supabase → SQL Editor → New query → Run.
-- (Pré-requisito: schema.sql e migration_admin.sql já aplicados.)
--
-- O que faz:
--  • marca linhas com is_demo (para poder limpar só os fictícios depois)
--  • função que popula uma empresa com dados de exemplo realistas
--  • RPC seed_demo() para popular a empresa do usuário logado
--  • trigger de cadastro passa a popular automaticamente cada conta nova
-- =====================================================================

alter table public.editorial_lines add column if not exists is_demo boolean not null default false;
alter table public.projects        add column if not exists is_demo boolean not null default false;
alter table public.tasks           add column if not exists is_demo boolean not null default false;
alter table public.contents        add column if not exists is_demo boolean not null default false;

-- ---------------------------------------------------------------------
-- Função interna: popula uma empresa com dados de exemplo (is_demo=true)
-- ---------------------------------------------------------------------
create or replace function private.seed_demo_data(p_company uuid, p_owner uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  l1 uuid; l2 uuid; l3 uuid; l4 uuid; l5 uuid; l6 uuid; l7 uuid; l8 uuid;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  t1 uuid; t2 uuid;
begin
  -- Linhas editoriais (8)
  insert into public.editorial_lines (company_id,name,color,strategic_goal,target_audience,main_themes,content_formats,channels,frequency,owner_id,notes,is_demo) values
    (p_company,'Autoridade','#4f46e5','Posicionar a marca como referência técnica do setor','Decisores B2B e gestores',array['Cases','Dados de mercado','Tendências'],array['Artigo','Carrossel'],array['LinkedIn','Blog'],'2x por semana',p_owner,'Tom consultivo, baseado em dados.',true) returning id into l1;
  insert into public.editorial_lines (company_id,name,color,strategic_goal,target_audience,main_themes,content_formats,channels,frequency,owner_id,notes,is_demo) values
    (p_company,'Crescimento de base','#16a34a','Ampliar alcance e atrair novos seguidores','Topo de funil amplo',array['Dicas rápidas','Listas'],array['Reels','Carrossel'],array['Instagram','TikTok'],'Diário',p_owner,'Foco em formatos virais.',true) returning id into l2;
  insert into public.editorial_lines (company_id,name,color,strategic_goal,target_audience,main_themes,content_formats,channels,frequency,owner_id,notes,is_demo) values
    (p_company,'Conexão','#d97706','Humanizar a marca e gerar identificação','Base atual',array['Histórias','Comunidade'],array['Story','Post estático'],array['Instagram'],'3x por semana',p_owner,'',true) returning id into l3;
  insert into public.editorial_lines (company_id,name,color,strategic_goal,target_audience,main_themes,content_formats,channels,frequency,owner_id,notes,is_demo) values
    (p_company,'Objeção','#dc2626','Quebrar objeções de compra','Meio/fundo de funil',array['FAQ','Comparativos','Mitos'],array['Carrossel','Vídeo curto'],array['Instagram','LinkedIn'],'Semanal',p_owner,'',true) returning id into l4;
  insert into public.editorial_lines (company_id,name,color,strategic_goal,target_audience,main_themes,content_formats,channels,frequency,owner_id,notes,is_demo) values
    (p_company,'Institucional','#0891b2','Comunicar marcos e valores da empresa','Stakeholders e público geral',array['Conquistas','Cultura'],array['Post estático','Newsletter'],array['LinkedIn','E-mail'],'Quinzenal',p_owner,'',true) returning id into l5;
  insert into public.editorial_lines (company_id,name,color,strategic_goal,target_audience,main_themes,content_formats,channels,frequency,owner_id,notes,is_demo) values
    (p_company,'Bastidores','#7c3aed','Mostrar o dia a dia e os processos','Base engajada',array['Rotina','Equipe'],array['Reels','Story'],array['Instagram'],'Semanal',p_owner,'',true) returning id into l6;
  insert into public.editorial_lines (company_id,name,color,strategic_goal,target_audience,main_themes,content_formats,channels,frequency,owner_id,notes,is_demo) values
    (p_company,'Prova técnica','#0d9488','Demonstrar resultados e expertise','Fundo de funil',array['Resultados','Demonstrações'],array['Vídeo curto','Carrossel'],array['LinkedIn','YouTube'],'Semanal',p_owner,'',true) returning id into l7;
  insert into public.editorial_lines (company_id,name,color,strategic_goal,target_audience,main_themes,content_formats,channels,frequency,owner_id,notes,is_demo) values
    (p_company,'Comercial','#db2777','Gerar oportunidades e conversões diretas','Leads qualificados',array['Ofertas','CTAs'],array['Criativo de anúncio','Story'],array['Meta Ads','Instagram'],'Por campanha',p_owner,'',true) returning id into l8;

  -- Projetos (5)
  insert into public.projects (company_id,name,client,description,status,due_date,owner_id,is_demo) values
    (p_company,'Campanha de Lançamento Q3','Acme Corp','Campanha de lançamento do novo produto para o trimestre.','em_andamento',current_date+12,p_owner,true) returning id into p1;
  insert into public.projects (company_id,name,client,description,status,due_date,owner_id,is_demo) values
    (p_company,'Rebranding Institucional','Beta Ltda','Atualização completa da identidade e materiais.','planejamento',current_date+40,p_owner,true) returning id into p2;
  insert into public.projects (company_id,name,client,description,status,due_date,owner_id,is_demo) values
    (p_company,'Calendário Editorial do Mês','Interno','Produção mensal de conteúdo orgânico.','em_andamento',current_date+2,p_owner,true) returning id into p3;
  insert into public.projects (company_id,name,client,description,status,due_date,owner_id,is_demo) values
    (p_company,'Funil de Anúncios','Gamma Inc','Estruturação dos criativos pagos.','em_revisao',current_date+5,p_owner,true) returning id into p4;
  insert into public.projects (company_id,name,client,description,status,due_date,owner_id,is_demo) values
    (p_company,'Site Novo — Conteúdo','Acme Corp','Textos e SEO do novo site.','pausado',current_date+60,p_owner,true) returning id into p5;

  -- Tarefas com checklist + dependência (2 primeiras com id)
  insert into public.tasks (company_id,title,description,project_id,assignee_id,status,priority,due_date,labels,is_demo) values
    (p_company,'Aprovar roteiro do vídeo de lançamento','Revisar e aprovar o roteiro final antes da gravação.',p1,p_owner,'em_revisao','urgente',current_date,array['Vídeo','Aprovação'],true) returning id into t1;
  insert into public.tasks (company_id,title,description,project_id,assignee_id,status,priority,due_date,labels,is_demo) values
    (p_company,'Gravar vídeo de lançamento','Gravação após aprovação do roteiro.',p1,p_owner,'a_fazer','alta',current_date+3,array['Vídeo'],true) returning id into t2;
  insert into public.task_checklist_items (company_id,task_id,label,is_done,position) values
    (p_company,t1,'Ler roteiro v3',true,0),
    (p_company,t1,'Validar CTA',false,1),
    (p_company,t1,'Enviar feedback',false,2);
  insert into public.task_dependencies (company_id,task_id,depends_on_id) values (p_company,t2,t1);

  -- Demais tarefas (12)
  insert into public.tasks (company_id,title,description,project_id,assignee_id,status,priority,due_date,labels,is_demo) values
    (p_company,'Briefing dos criativos pagos','Montar briefing dos 5 criativos de anúncio.',p4,p_owner,'em_andamento','alta',current_date,array['Tráfego'],true),
    (p_company,'Postar carrossel "5 mitos sobre automação"','Conteúdo da linha Objeção.',p3,p_owner,'a_fazer','media',current_date,array['Instagram'],true),
    (p_company,'Atualizar planilha de resultados','Consolidar métricas da semana passada.',p1,p_owner,'a_fazer','baixa',current_date-2,array['Relatório'],true),
    (p_company,'Enviar proposta de rebranding','Finalizar e enviar a proposta comercial.',p2,p_owner,'em_andamento','alta',current_date-1,array['Comercial'],true),
    (p_company,'Definir paleta do rebranding','Escolher cores e tipografia da nova marca.',p2,p_owner,'em_andamento','media',current_date+4,array['Design'],true),
    (p_company,'Newsletter mensal','Revisar texto e links da newsletter do mês.',p3,p_owner,'em_revisao','alta',current_date+1,array['E-mail'],true),
    (p_company,'Aprovar artes do funil','Itens parados aguardando aprovação há dias.',p4,p_owner,'em_revisao','urgente',current_date-3,array['Design','Aprovação'],true),
    (p_company,'Pesquisar tendências do setor','Levantar pautas para o próximo mês.',p1,p_owner,'concluido','baixa',current_date-4,array['Pesquisa'],true),
    (p_company,'Briefing de SEO do site','Palavras-chave e estrutura de páginas.',p5,p_owner,'pausado','baixa',current_date+20,array['SEO'],true),
    (p_company,'Agendar posts da semana','Programar publicações no planejador.',p3,p_owner,'a_fazer','media',current_date+1,array['Instagram'],true),
    (p_company,'Gravar depoimento de cliente','Coletar prova social em vídeo.',p1,p_owner,'backlog','media',current_date+7,array['Vídeo','Prova'],true),
    (p_company,'Revisar copy dos anúncios','Ajustar headlines e CTAs dos criativos.',p4,p_owner,'a_fazer','alta',current_date+2,array['Tráfego','Copy'],true);

  -- Conteúdos (10)
  insert into public.contents (company_id,title,editorial_line_id,project_id,channel,format,publish_date,status,owner_id,is_demo) values
    (p_company,'Carrossel: 5 mitos sobre automação',l4,p3,'Instagram','Carrossel',current_date,'design',p_owner,true),
    (p_company,'Reels: bastidores da gravação',l6,p3,'Instagram','Reels',current_date+1,'roteiro',p_owner,true),
    (p_company,'Artigo: tendências de marketing B2B',l1,p1,'Blog','Artigo',current_date+2,'revisao',p_owner,true),
    (p_company,'Post: case de sucesso Acme',l7,p1,'LinkedIn','Carrossel',current_date+3,'aprovado',p_owner,true),
    (p_company,'Story: enquete com a audiência',l3,p3,'Instagram','Story',current_date+4,'ideia',p_owner,true),
    (p_company,'Newsletter do mês',l5,p3,'E-mail','Newsletter',current_date+5,'revisao',p_owner,true),
    (p_company,'Criativo de anúncio — oferta',l8,p4,'Meta Ads','Criativo de anúncio',current_date+6,'design',p_owner,true),
    (p_company,'Vídeo curto: demonstração do produto',l7,p1,'YouTube','Vídeo curto',current_date+8,'ideia',p_owner,true),
    (p_company,'Carrossel: dica rápida da semana',l2,p3,'Instagram','Carrossel',current_date-1,'publicado',p_owner,true),
    (p_company,'Post institucional — aniversário da marca',l5,p2,'LinkedIn','Post estático',current_date+10,'agendado',p_owner,true);
end;
$$;

revoke execute on function private.seed_demo_data(uuid, uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- RPC: popular a empresa do usuário logado (para contas já existentes)
-- ---------------------------------------------------------------------
create or replace function public.seed_demo()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare cid uuid; uid uuid;
begin
  uid := (select auth.uid());
  select company_id into cid from public.profiles where id = uid;
  if cid is null then return; end if;
  perform private.seed_demo_data(cid, uid);
end;
$$;
revoke execute on function public.seed_demo() from public, anon;
grant execute on function public.seed_demo() to authenticated;

-- ---------------------------------------------------------------------
-- Cadastro: cria empresa + perfil e JÁ POPULA com dados de exemplo
-- ---------------------------------------------------------------------
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
      new.id, new_company,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email, 'admin', admin_flag
    );

  perform private.seed_demo_data(new_company, new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Pronto. Contas novas já nascem populadas. Para popular uma conta que já
-- existe, o app chama seed_demo() pelo botão "Carregar dados de exemplo".
