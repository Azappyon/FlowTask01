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
import { todayISO } from "@/lib/format";
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
  // mutations
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

  const reload = useCallback(async () => {
    const [m, p, t, l, c, ck, d, cm] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("projects").select("*").order("created_at"),
      supabase.from("tasks").select("*").order("created_at"),
      supabase.from("editorial_lines").select("*").order("created_at"),
      supabase.from("contents").select("*").order("publish_date"),
      supabase.from("task_checklist_items").select("*").order("position"),
      supabase.from("task_dependencies").select("*"),
      supabase.from("comments").select("*").order("created_at"),
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
  }, [supabase, profile.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout((toast as any)._t);
    (toast as any)._t = window.setTimeout(() => setToastMsg(null), 2400);
  }, []);

  // ---- mutations -----------------------------------------------------
  async function saveTask(patch: Partial<Task>, id?: string) {
    if (id) {
      await supabase.from("tasks").update(patch).eq("id", id);
    } else {
      await supabase.from("tasks").insert({ ...patch, company_id });
    }
    await reload();
    toast(id ? "Tarefa atualizada" : "Tarefa criada");
  }
  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    await reload();
    toast("Tarefa excluída");
  }
  async function toggleTaskDone(t: Task) {
    const next = t.status === "concluido" ? "a_fazer" : "concluido";
    await supabase.from("tasks").update({ status: next }).eq("id", t.id);
    await reload();
  }
  async function saveProject(patch: Partial<Project>, id?: string) {
    if (id) await supabase.from("projects").update(patch).eq("id", id);
    else await supabase.from("projects").insert({ ...patch, company_id });
    await reload();
    toast(id ? "Projeto atualizado" : "Projeto criado");
  }
  async function deleteProject(id: string) {
    await supabase.from("projects").delete().eq("id", id);
    await reload();
    toast("Projeto excluído");
  }
  async function saveLine(patch: Partial<EditorialLine>, id?: string) {
    if (id) await supabase.from("editorial_lines").update(patch).eq("id", id);
    else await supabase.from("editorial_lines").insert({ ...patch, company_id });
    await reload();
    toast(id ? "Linha atualizada" : "Linha criada");
  }
  async function deleteLine(id: string) {
    await supabase.from("editorial_lines").delete().eq("id", id);
    await reload();
    toast("Linha excluída");
  }
  async function saveContent(patch: Partial<Content>, id?: string) {
    if (id) await supabase.from("contents").update(patch).eq("id", id);
    else await supabase.from("contents").insert({ ...patch, company_id });
    await reload();
    toast(id ? "Conteúdo atualizado" : "Conteúdo criado");
  }
  async function deleteContent(id: string) {
    await supabase.from("contents").delete().eq("id", id);
    await reload();
    toast("Conteúdo excluído");
  }
  async function addChecklist(taskId: string, label: string) {
    const pos = checklist.filter((c) => c.task_id === taskId).length;
    await supabase.from("task_checklist_items").insert({ company_id, task_id: taskId, label, position: pos });
    await reload();
  }
  async function toggleChecklist(item: ChecklistItem) {
    await supabase.from("task_checklist_items").update({ is_done: !item.is_done }).eq("id", item.id);
    await reload();
  }
  async function deleteChecklist(id: string) {
    await supabase.from("task_checklist_items").delete().eq("id", id);
    await reload();
  }
  async function addDep(taskId: string, dependsOn: string) {
    if (taskId === dependsOn) return;
    await supabase.from("task_dependencies").insert({ company_id, task_id: taskId, depends_on_id: dependsOn });
    await reload();
  }
  async function removeDep(taskId: string, dependsOn: string) {
    await supabase.from("task_dependencies").delete().eq("task_id", taskId).eq("depends_on_id", dependsOn);
    await reload();
  }
  async function addComment(entity_type: Comment["entity_type"], entity_id: string, body: string) {
    await supabase.from("comments").insert({ company_id, entity_type, entity_id, author_id: profile.id, body });
    await reload();
  }
  async function updateProfile(patch: Partial<Profile>) {
    await supabase.from("profiles").update(patch).eq("id", profile.id);
    await reload();
    toast("Perfil atualizado");
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

export { todayISO };
