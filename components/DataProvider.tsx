"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Profile,
  Project,
  Task,
  EditorialLine,
  Content,
  ChecklistItem,
  TaskDependency,
  Comment,
} from "@/lib/types";

interface DataState {
  profile: Profile;
  members: Profile[];
  projects: Project[];
  tasks: Task[];
  lines: EditorialLine[];
  contents: Content[];
  checklist: ChecklistItem[];
  deps: TaskDependency[];
  comments: Comment[];
  loading: boolean;
  reload: () => Promise<void>;
  toast: (msg: string) => void;
  saveTask: (patch: Partial<Task>, id?: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskDone: (t: Task) => Promise<void>;
  saveProject: (patch: Partial<Project>, id?: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveLine: (patch: Partial<EditorialLine>, id?: string) => Promise<void>;
  deleteLine: (id: string) => Promise<void>;
  saveContent: (patch: Partial<Content>, id?: string) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  addChecklist: (taskId: string, label: string) => Promise<void>;
  toggleChecklist: (item: ChecklistItem) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  addDep: (taskId: string, dependsOn: string) => Promise<void>;
  removeDep: (taskId: string, dependsOn: string) => Promise<void>;
  addComment: (entityType: Comment["entity_type"], entityId: string, body: string) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  hasDemo: boolean;
  clearDemo: () => Promise<void>;
  seedDemo: () => Promise<void>;
}

const Ctx = createContext<DataState | null>(null);

export function useData(): DataState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useData precisa estar dentro de <DataProvider>");
  return c;
}

export function DataProvider({
  initialProfile,
  children,
}: {
  initialProfile: Profile;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [members, setMembers] = useState<Profile[]>([initialProfile]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lines, setLines] = useState<EditorialLine[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [deps, setDeps] = useState<TaskDependency[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const company_id = profile.company_id;
  const hasDemo =
    projects.some((x) => x.is_demo) || tasks.some((x) => x.is_demo) ||
    lines.some((x) => x.is_demo) || contents.some((x) => x.is_demo);

  const reload = useCallback(async () => {
    const cid = profile.company_id;
    const [m, p, t, l, c, ck, d, cm] = await Promise.all([
      supabase.from("profiles").select("*").eq("company_id", cid).order("created_at"),
      supabase.from("projects").select("*").eq("company_id", cid).order("created_at"),
      supabase.from("tasks").select("*").eq("company_id", cid).order("created_at"),
      supabase.from("editorial_lines").select("*").eq("company_id", cid).order("created_at"),
      supabase.from("contents").select("*").eq("company_id", cid).order("publish_date"),
      supabase.from("task_checklist_items").select("*").eq("company_id", cid).order("position"),
      supabase.from("task_dependencies").select("*").eq("company_id", cid),
      supabase.from("comments").select("*").eq("company_id", cid).order("created_at"),
    ]);
    if (m.data) setMembers(m.data as Profile[]);
    if (p.data) setProjects(p.data as Project[]);
    if (t.data) setTasks(t.data as Task[]);
    if (l.data) setLines(l.data as EditorialLine[]);
    if (c.data) setContents(c.data as Content[]);
    if (ck.data) setChecklist(ck.data as ChecklistItem[]);
    if (d.data) setDeps(d.data as TaskDependency[]);
    if (cm.data) setComments(cm.data as Comment[]);
    const me = (m.data as Profile[] | null)?.find((x) => x.id === profile.id);
    if (me) setProfile(me);
    setLoading(false);
  }, [supabase, profile.id, profile.company_id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout((toast as any)._t);
    (toast as any)._t = window.setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const upsertLocal = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    row: T
  ) => setter((prev) => (prev.some((x) => x.id === row.id) ? prev.map((x) => (x.id === row.id ? row : x)) : [...prev, row]));

  // ---- mutations: persistem e atualizam o estado local (sem recarregar tudo)
  async function saveTask(patch: Partial<Task>, id?: string) {
    if (id) {
      const { data } = await supabase.from("tasks").update(patch).eq("id", id).select().single();
      if (data) upsertLocal(setTasks, data as Task);
      toast("Tarefa atualizada");
    } else {
      const { data } = await supabase.from("tasks").insert({ ...patch, company_id }).select().single();
      if (data) setTasks((p) => [...p, data as Task]);
      toast("Tarefa criada");
    }
  }
  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((p) => p.filter((t) => t.id !== id));
    setChecklist((p) => p.filter((c) => c.task_id !== id));
    setDeps((p) => p.filter((d) => d.task_id !== id && d.depends_on_id !== id));
    toast("Tarefa excluída");
  }
  async function toggleTaskDone(t: Task) {
    const next = t.status === "concluido" ? "a_fazer" : "concluido";
    const { data } = await supabase.from("tasks").update({ status: next }).eq("id", t.id).select().single();
    if (data) upsertLocal(setTasks, data as Task);
  }
  async function saveProject(patch: Partial<Project>, id?: string) {
    if (id) {
      const { data } = await supabase.from("projects").update(patch).eq("id", id).select().single();
      if (data) upsertLocal(setProjects, data as Project);
      toast("Projeto atualizado");
    } else {
      const { data } = await supabase.from("projects").insert({ ...patch, company_id }).select().single();
      if (data) setProjects((p) => [...p, data as Project]);
      toast("Projeto criado");
    }
  }
  async function deleteProject(id: string) {
    await supabase.from("projects").delete().eq("id", id);
    setProjects((p) => p.filter((x) => x.id !== id));
    toast("Projeto excluído");
  }
  async function saveLine(patch: Partial<EditorialLine>, id?: string) {
    if (id) {
      const { data } = await supabase.from("editorial_lines").update(patch).eq("id", id).select().single();
      if (data) upsertLocal(setLines, data as EditorialLine);
      toast("Linha atualizada");
    } else {
      const { data } = await supabase.from("editorial_lines").insert({ ...patch, company_id }).select().single();
      if (data) setLines((p) => [...p, data as EditorialLine]);
      toast("Linha criada");
    }
  }
  async function deleteLine(id: string) {
    await supabase.from("editorial_lines").delete().eq("id", id);
    setLines((p) => p.filter((x) => x.id !== id));
    toast("Linha excluída");
  }
  async function saveContent(patch: Partial<Content>, id?: string) {
    if (id) {
      const { data } = await supabase.from("contents").update(patch).eq("id", id).select().single();
      if (data) upsertLocal(setContents, data as Content);
      toast("Conteúdo atualizado");
    } else {
      const { data } = await supabase.from("contents").insert({ ...patch, company_id }).select().single();
      if (data) setContents((p) => [...p, data as Content]);
      toast("Conteúdo criado");
    }
  }
  async function deleteContent(id: string) {
    await supabase.from("contents").delete().eq("id", id);
    setContents((p) => p.filter((x) => x.id !== id));
    toast("Conteúdo excluído");
  }
  async function addChecklist(taskId: string, label: string) {
    const pos = checklist.filter((c) => c.task_id === taskId).length;
    const { data } = await supabase.from("task_checklist_items").insert({ company_id, task_id: taskId, label, position: pos }).select().single();
    if (data) setChecklist((p) => [...p, data as ChecklistItem]);
  }
  async function toggleChecklist(item: ChecklistItem) {
    const { data } = await supabase.from("task_checklist_items").update({ is_done: !item.is_done }).eq("id", item.id).select().single();
    if (data) upsertLocal(setChecklist, data as ChecklistItem);
  }
  async function deleteChecklist(id: string) {
    await supabase.from("task_checklist_items").delete().eq("id", id);
    setChecklist((p) => p.filter((c) => c.id !== id));
  }
  async function addDep(taskId: string, dependsOn: string) {
    if (taskId === dependsOn) return;
    const { data } = await supabase.from("task_dependencies").insert({ company_id, task_id: taskId, depends_on_id: dependsOn }).select().single();
    if (data) setDeps((p) => [...p, data as TaskDependency]);
  }
  async function removeDep(taskId: string, dependsOn: string) {
    await supabase.from("task_dependencies").delete().eq("task_id", taskId).eq("depends_on_id", dependsOn);
    setDeps((p) => p.filter((d) => !(d.task_id === taskId && d.depends_on_id === dependsOn)));
  }
  async function addComment(entity_type: Comment["entity_type"], entity_id: string, body: string) {
    const { data } = await supabase.from("comments").insert({ company_id, entity_type, entity_id, author_id: profile.id, body }).select().single();
    if (data) setComments((p) => [...p, data as Comment]);
  }
  async function updateProfile(patch: Partial<Profile>) {
    const { data } = await supabase.from("profiles").update(patch).eq("id", profile.id).select().single();
    if (data) {
      setProfile(data as Profile);
      upsertLocal(setMembers, data as Profile);
    }
    toast("Perfil atualizado");
  }

  async function clearDemo() {
    const cid = company_id;
    await supabase.from("contents").delete().eq("company_id", cid).eq("is_demo", true);
    await supabase.from("tasks").delete().eq("company_id", cid).eq("is_demo", true);
    await supabase.from("editorial_lines").delete().eq("company_id", cid).eq("is_demo", true);
    await supabase.from("projects").delete().eq("company_id", cid).eq("is_demo", true);
    await reload();
    toast("Dados de exemplo removidos");
  }
  async function seedDemo() {
    const { error } = await supabase.rpc("seed_demo");
    if (error) {
      toast("Rode a migração 'migration_demo.sql' no Supabase primeiro.");
      return;
    }
    await reload();
    toast("Dados de exemplo carregados ✓");
  }

  const value: DataState = {
    profile, members, projects, tasks, lines, contents, checklist, deps, comments, loading,
    reload, toast,
    saveTask, deleteTask, toggleTaskDone,
    saveProject, deleteProject,
    saveLine, deleteLine,
    saveContent, deleteContent,
    addChecklist, toggleChecklist, deleteChecklist,
    addDep, removeDep, addComment, updateProfile,
    hasDemo, clearDemo, seedDemo,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      {toastMsg && (
        <div
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          style={{ background: "var(--ink)" }}
        >
          {toastMsg}
        </div>
      )}
    </Ctx.Provider>
  );
}
