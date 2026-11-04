export type Per = "m" | "t" | "n";
export type Rep = {
  f: "o" | "d" | "w" | "m" | "y";
  n: number;
  w: number[];
  a: string;
};
export type Sub = { id: string; t: string; d?: boolean };
export type Task = {
  id: string;
  t: string;
  s: string;
  e: string;
  b?: string;
  i: string;
  c: number;
  r: Rep;
  n?: string;
  u?: Sub[];
  nt?: number[];
  ni?: boolean;
  g?: boolean;
  xd?: string[];
  eu?: string;
  na?: number[]; // dia inteiro: horários dos avisos (minutos desde 00:00)
  ad?: boolean; // dia inteiro: sem horário, aparece no topo da lista do dia
  st?: string; // primeiro dia em que aparece: o dia em que foi criada (nunca antes de hoje)
  cl?: number; // luminosidade (15–85) da cor; sem ele vale 60
  ch?: number; // matiz (0–359) escolhido na roda de cores; sem ele vale HUE[c]
};
export type Path = {
  id: string;
  n: string;
  per: Per;
  d: number[];
  r: Rep;
  t: string[];
};
export type Day = { c: Record<string, string>; d: Record<string, boolean> };
export type Inb = { id: string; t: string; n: string; d: boolean; u?: Sub[] };

export const HUE = [355, 25, 48, 140, 175, 210, 265, 322];
export const IC = [
  "🛏️",
  "☕",
  "💧",
  "🚿",
  "🪥",
  "🍽️",
  "🚜",
  "🎨",
  "🖌️",
  "🎮",
  "🎬",
  "🍿",
  "🧠",
  "📚",
  "🗣️",
  "🧴",
  "🏃",
  "💪",
  "📖",
  "🙏",
  "🎲",
  "🍝",
  "💼",
  "⭐",
];
// Os emojis acima são só os IDs salvos nas tarefas; a tela mostra o ícone minimalista na mesma posição.
export const ICN = [
  "bed-outline",
  "coffee-outline",
  "water-outline",
  "shower",
  "toothbrush",
  "silverware-fork-knife",
  "tractor",
  "palette-outline",
  "brush",
  "gamepad-variant-outline",
  "movie-open-outline",
  "popcorn",
  "brain",
  "book-multiple-outline",
  "account-voice",
  "lotion-outline",
  "run",
  "arm-flex-outline",
  "book-open-page-variant-outline",
  "hands-pray",
  "dice-multiple-outline",
  "pasta",
  "briefcase-outline",
  "star-outline",
];
// Tarefas antigas guardam um emoji (IC); as novas guardam direto o nome do ícone.
export const iconName = (e: string) => {
  const i = IC.indexOf(e);
  return i >= 0 ? ICN[i] : e || "star-outline";
};
// Cor do ícone sobre o círculo colorido: escuro quando o fundo é claro (senão o branco some)
export const contrastOf = (l: number) => (l > 68 ? "#17171a" : "#fff");
// Índices dos dias (0 = domingo) na ordem em que a semana é exibida, conforme o início escolhido
export const weekOrder = (weekStart: number) =>
  Array.from({ length: 7 }, (_, j) => (weekStart + j) % 7);
export const lightOf = (x: { cl?: number }) => x.cl ?? 60;
// Dia de início ao criar: o dia selecionado no app, mas nunca antes de hoje.
export const startFrom = (sel: string) => {
  const t = dk(new Date());
  return sel > t ? sel : t;
};
export const hueOf = (x: { c: number; ch?: number }) => x.ch ?? HUE[x.c % 8];
export const PER: [Per, string][] = [
  ["m", "Manhã"],
  ["t", "Tarde"],
  ["n", "Noite"],
];
export const PX = 76,
  MIN = 40;
export const WDL = ["D", "S", "T", "Q", "Q", "S", "S"];
export const WDS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const WDN = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];
export const MN = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
export const UN: Record<string, string[]> = {
  d: ["dia", "dias"],
  w: ["semana", "semanas"],
  m: ["mês", "meses"],
  y: ["ano", "anos"],
};
export const REP: [Rep["f"], string][] = [
  ["o", "Não repetir"],
  ["d", "Diariamente"],
  ["w", "Semanalmente"],
  ["m", "Mensalmente"],
  ["y", "Anualmente"],
];

export const pd = (n: number) => String(n).padStart(2, "0");
export const hm = (n: number) => pd(Math.floor(n / 60)) + ":" + pd(n % 60);
export const m = (h: string) => {
  const p = h.split(":");
  return +p[0] * 60 + +p[1];
};
export const dk = (d: Date) =>
  `${d.getFullYear()}-${pd(d.getMonth() + 1)}-${pd(d.getDate())}`;
const P3 = (k: string) => k.split("-").map(Number) as [number, number, number];
export const fromKey = (k: string) => {
  const [y, mo, d] = P3(k);
  return new Date(y, mo - 1, d, 12);
};
const U = (k: string) => {
  const [y, mo, d] = P3(k);
  return Date.UTC(y, mo - 1, d) / 864e5;
};
export const per = (x: { s: string }): Per => {
  const s = m(x.s);
  return s < 720 ? "m" : s < 1080 ? "t" : "n";
};
export const DR = (): Rep => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return { f: "d", n: 1, w: [], a: dk(d) };
};

export function occ(r0: Rep | undefined, k: string) {
  const r = r0 || DR();
  if (k < r.a) return false;
  const n = r.n || 1,
    [y, mo, d] = P3(k),
    [ay, amo, ad] = P3(r.a),
    df = U(k) - U(r.a);
  if (r.f === "o") return k === r.a;
  if (r.f === "d") return df % n === 0;
  if (r.f === "w") {
    const dw = new Date(y, mo - 1, d).getDay(),
      aw = new Date(ay, amo - 1, ad).getDay();
    return Math.floor((df + aw) / 7) % n === 0 && (r.w || []).includes(dw);
  }
  if (r.f === "m") {
    const mf = (y - ay) * 12 + mo - amo;
    return mf % n === 0 && d === Math.min(ad, new Date(y, mo, 0).getDate());
  }
  return (y - ay) % n === 0 && mo === amo && d === ad;
}

// Data de criação embutida no id ("x<ms>" tarefas, "p<ms>" caminhos): nada aparece antes dela.
export const createdOn = (o: { id: string }) => {
  const mm = /^[xp](\d{13})$/.exec(o.id);
  return mm ? dk(new Date(+mm[1])) : "";
};
export const pocc = (q: Path, k: string) => k >= createdOn(q) && occ(q.r, k);

export function act(PA: Path[], day: Day, pk: Per, k: string): string {
  const v = day.c[pk];
  if (
    v === "" ||
    (v !== undefined && PA.some((q) => q.id === v && pocc(q, k)))
  )
    return v;
  const RK = { o: 0, y: 1, m: 2, w: 3, d: 4 };
  const ps = PA.filter((q) => q.per === pk && pocc(q, k)).sort(
    (a, b) => RK[a.r.f] - RK[b.r.f] || PA.indexOf(a) - PA.indexOf(b),
  );
  return ps.length ? ps[0].id : "";
}
export function vis(tasks: Task[], PA: Path[], day: Day, k: string) {
  return tasks.filter((x) => {
    if ((x.xd && x.xd.includes(k)) || (x.eu && k >= x.eu)) return false;
    if (k < (x.st ?? createdOn(x))) return false;
    const ps = PA.filter((q) => q.t.includes(x.id));
    if (!ps.length) return !x.g && occ(x.r, k);
    return ps.some((q) => act(PA, day, q.per, k) === q.id);
  });
}

export type Laid = { x: Task; s: number; e: number; col: number; n: number };
export function lay(v: Task[]): Laid[] {
  const out: Laid[] = [];
  let cl: Laid[] = [],
    ce = 0;
  const fin = () => {
    const n = Math.max(...cl.map((y) => y.col)) + 1;
    cl.forEach((y) => {
      y.n = n;
      out.push(y);
    });
  };
  v.forEach((x) => {
    const s = m(x.s),
      e = Math.max(x.e ? m(x.e) : s, s + MIN);
    if (cl.length && s >= ce) {
      fin();
      cl = [];
      ce = 0;
    }
    let col = 0;
    while (cl.some((y) => y.col === col && y.e > s)) col++;
    cl.push({ x, s, e, col, n: 1 });
    ce = Math.max(ce, e);
  });
  if (cl.length) fin();
  return out;
}

export const dur = (v: number) =>
  v % 1440 === 0
    ? v / 1440 + (v === 1440 ? " dia" : " dias")
    : v % 60 === 0
      ? v / 60 + " h"
      : v + " min";
export const nlab = (v: number) => (v === 0 ? "No início" : dur(v) + " antes");
export const ntl = (x: Task) => {
  const L = (x.nt || []).filter((v) => v > 0);
  if (x.ni !== undefined ? x.ni : x.nt ? x.nt.includes(0) : true) L.push(0);
  return L;
};
export function rtxt(r: Rep) {
  const n = r.n || 1;
  if (r.f === "o") return "uma vez";
  if (r.f === "d") return n === 1 ? "todos os dias" : "a cada " + n + " dias";
  if (r.f === "w")
    return (
      (r.w || []).map((i) => WDS[i]).join(", ") +
      (n > 1 ? " · a cada " + n + " sem." : "")
    );
  return r.f === "m"
    ? n === 1
      ? "todo mês"
      : "a cada " + n + " meses"
    : n === 1
      ? "todo ano"
      : "a cada " + n + " anos";
}
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Reordena só as pendentes (índices da lista de pendentes) e mantém cada concluída onde está:
// assim, uma tarefa desmarcada volta para a posição que tinha.
export function reorderPending(list: Inb[], from: number, to: number): Inb[] {
  const slots = list.flatMap((x, i) => (x.d ? [] : [i]));
  const pend = slots.map((i) => list[i]);
  if (from === to || from < 0 || to < 0 || from >= pend.length || to >= pend.length)
    return list;
  const [moved] = pend.splice(from, 1);
  pend.splice(to, 0, moved);
  const out = [...list];
  slots.forEach((slot, k) => {
    out[slot] = pend[k];
  });
  return out;
}
