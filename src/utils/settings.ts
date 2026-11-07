import { DEFAULT_TAROT } from "./tarot";

export type ThemeMode = "dark" | "light";
export type ThemeSet = "default" | "persona5";
export type Settings = {
  weekStart: 0 | 1; // 0 = domingo, 1 = segunda
  theme: ThemeMode; // claro ou escuro (do conjunto "Padrão")
  themeSet: ThemeSet; // "persona5" ainda está em construção: por enquanto muda só as fontes e o anel dos dias
  tarot: string; // arcano escolhido: define o ícone do app e o da abertura (chave de TAROT)
};
export const DEFAULT_SETTINGS: Settings = {
  weekStart: 0,
  theme: "dark",
  themeSet: "default",
  tarot: DEFAULT_TAROT,
};
