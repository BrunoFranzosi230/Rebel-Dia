import { useColorScheme } from "react-native";

const L = { bg: "#f6f5f3", card: "#fff", tx: "#17171a", mu: "#85858c", ln: "#e3e2df", ac: "#17171a", ak: "#fff", cy: "#0e9fbc", bt: "#ecebe8", bs: 85, bl: 90, dg: "#ff453a" };
const D = { bg: "#0d0d0f", card: "#1a1a1e", tx: "#f5f5f7", mu: "#8e8e96", ln: "#2a2a2f", ac: "#f5f5f7", ak: "#111", cy: "#22d3ee", bt: "#2c2c31", bs: 40, bl: 22, dg: "#ff453a" };
export type Theme = typeof L;
export const useTheme = (): Theme => (useColorScheme() === "dark" ? D : L);
export const hsl = (h: number, s: number, l: number) => `hsl(${h}, ${s}%, ${l}%)`;
