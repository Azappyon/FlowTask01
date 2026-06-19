export type Role = "admin" | "manager" | "collaborator" | "viewer";

export type TaskStatus =
  | "backlog"
  | "a_fazer"
  | "em_andamento"
  | "em_revisao"
  | "aprovado"
  | "concluido"
  | "pausado";

export type ProjectStatus =
  | "planejamento"
  | "em_andamento"
  | "em_revisao"
  | "concluido"
  | "pausado";

export type ContentStatus =
  | "ideia"
  | "roteiro"
  | "design"
  | "revisao"
  | "aprovado"
  | "agendado"
  | "publicado";

export type Priority = "baixa" | "media" | "alta" | "urgente";

export type CompanyStatus = "pending" | "active" | "suspended";

export interface Company {
  id: string;
  name: string;
  slug: string | null;
  status: CompanyStatus;
  created_at?: string;
}

export interface Profile {
  id: string;
  company_id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: Role;
  is_super_admin?: boolean;
  created_at?: string;
}

export interface Project {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  client: string | null;
  owner_id: string | null;
  status: ProjectStatus;
  due_date: string | null;
  links: { url: string; name?: string }[];
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  assignee_id: string | null;
  client: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  labels: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistItem {
  id: string;
  company_id: string;
  task_id: string;
  label: string;
  is_done: boolean;
  position: number;
}

export interface TaskDependency {
  company_id: string;
  task_id: string;
  depends_on_id: string;
}

export interface Comment {
  id: string;
  company_id: string;
  entity_type: "task" | "content" | "project";
  entity_id: string;
  author_id: string | null;
  body: string;
  created_at?: string;
}

export interface EditorialLine {
  id: string;
  company_id: string;
  name: string;
  color: string;
  strategic_goal: string | null;
  target_audience: string | null;
  main_themes: string[];
  content_formats: string[];
  channels: string[];
  frequency: string | null;
  owner_id: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Content {
  id: string;
  company_id: string;
  title: string;
  editorial_line_id: string | null;
  project_id: string | null;
  owner_id: string | null;
  channel: string | null;
  format: string | null;
  publish_date: string | null;
  status: ContentStatus;
  caption: string | null;
  creative_text: string | null;
  refs: string | null;
  design_link: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}
