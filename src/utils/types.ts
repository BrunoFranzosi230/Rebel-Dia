import type { Sub, Task } from "@/utils/rotina";

export type FormOpts = {
  id: number;
  task: Task | null;
  ctx: string | null;
  ibSrc: string | null;
  pre?: { t: string; n: string; u: Sub[] };
};

export type CalOpts = { value: string; onPick: (key: string) => void };
