import type {
  TaskStatus,
  ProjectStatus,
  ContentStatus,
  Priority,
  Role,
} from "./types";

export const TASK_STATUS: [TaskStatus, string][] = [
  ["backlog", "Backlog"],
  ["a_fazer", "Para fazer"],
  ["em_andamento", "Em andamento"],
  ["em_revisao", "Em revisão"],
  ["aprovado", "Aprovado"],
  ["concluido", "Concluído"],
  ["pausado", "Pausado"],
];

export const PROJECT_STATUS: [ProjectStatus, string][] = [
  ["planejamento", "Planejamento"],
  ["em_andamento", "Em andamento"],
  ["em_revisao", "Em revisão"],
  ["concluido", "Concluído"],
  ["pausado", "Pausado"],
];

export const CONTENT_STATUS: [ContentStatus, string][] = [
  ["ideia", "Ideia"],
  ["roteiro", "Roteiro"],
  ["design", "Design"],
  ["revisao", "Revisão"],
  ["aprovado", "Aprovado"],
  ["agendado", "Agendado"],
  ["publicado", "Publicado"],
];

export const PRIORITY: [Priority, string][] = [
  ["baixa", "Baixa"],
  ["media", "Média"],
  ["alta", "Alta"],
  ["urgente", "Urgente"],
];

export const ROLES: [Role, string][] = [
  ["admin", "Administrador"],
  ["manager", "Gestor"],
  ["collaborator", "Colaborador"],
  ["viewer", "Visualizador"],
];

export const FORMATS = [
  "Carrossel",
  "Post estático",
  "Reels",
  "Story",
  "Artigo",
  "Newsletter",
  "Criativo de anúncio",
  "Vídeo curto",
];

export const LINE_COLORS = [
  "#4f46e5",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#7c3aed",
  "#0d9488",
  "#db2777",
  "#2563eb",
  "#ea580c",
];

export const AVATAR_COLORS = [
  "#ef4444",
  "#2563eb",
  "#16a34a",
  "#7c3aed",
  "#d97706",
  "#0891b2",
  "#db2777",
  "#0d9488",
];

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgente: 0,
  alta: 1,
  media: 2,
  baixa: 3,
};

export function label(value: string, map: [string, string][]): string {
  return map.find((x) => x[0] === value)?.[1] ?? value;
}

// Sazonalidades — calendário anual de marketing (datas representativas)
export interface Season {
  m: number;
  d: number;
  name: string;
  cat: string;
  ideas: string[];
}

export const SEASONS: Season[] = [
  { m: 1, d: 1, name: "Ano Novo", cat: "Data comemorativa", ideas: ["Retrospectiva do ano", "Post de metas e propósitos", "Mensagem de boas-festas"] },
  { m: 3, d: 8, name: "Dia da Mulher", cat: "Data comemorativa", ideas: ["Homenagem a mulheres da equipe e clientes", "Conteúdo sobre representatividade", "Campanha com depoimentos"] },
  { m: 3, d: 15, name: "Dia do Consumidor", cat: "Comercial", ideas: ["Promoção esquenta", "Conteúdo sobre direitos do consumidor", "Oferta relâmpago"] },
  { m: 5, d: 1, name: "Dia do Trabalhador", cat: "Data comemorativa", ideas: ["Bastidores da equipe", "Valorização de profissões", "Pausa institucional"] },
  { m: 5, d: 11, name: "Dia das Mães", cat: "Comercial", ideas: ["Guia de presentes", "Campanha emocional", "Oferta especial"] },
  { m: 6, d: 12, name: "Dia dos Namorados", cat: "Comercial", ideas: ["Campanha para casais", "Sorteio para dois", "Combo romântico"] },
  { m: 6, d: 24, name: "Festas Juninas", cat: "Sazonal", ideas: ["Conteúdo temático de arraial", "Promoção quentão", "Enquete divertida"] },
  { m: 8, d: 10, name: "Dia dos Pais", cat: "Comercial", ideas: ["Guia de presentes", "Campanha emocional", "Oferta especial"] },
  { m: 9, d: 15, name: "Semana do Cliente", cat: "Comercial", ideas: ["Agradecimento aos clientes", "Benefício exclusivo", "Depoimentos e cases"] },
  { m: 10, d: 12, name: "Dia das Crianças", cat: "Comercial", ideas: ["Campanha lúdica", "Sorteio", "Conteúdo nostálgico"] },
  { m: 11, d: 28, name: "Black Friday", cat: "Comercial", ideas: ["Esquenta com lista de desejos", "Ofertas principais", "Pós-venda / Cyber Monday"] },
  { m: 12, d: 25, name: "Natal", cat: "Sazonal", ideas: ["Campanha de fim de ano", "Mensagem institucional", "Retrospectiva e agradecimento"] },
];
