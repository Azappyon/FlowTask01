export const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function parseD(s: string): Date {
  return new Date(s + "T00:00:00");
}

export function isoOf(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysFrom(s: string | null): number {
  if (!s) return Infinity;
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((parseD(s).getTime() - today.getTime()) / 864e5);
}

export function fmt(s: string | null): string {
  if (!s) return "—";
  return parseD(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function fmtLong(s: string): string {
  return parseD(s).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function colorFromId(id: string, palette: string[]): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}
