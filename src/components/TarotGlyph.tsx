import { tarotOf, type TarotEl } from "@/utils/tarot";
import Svg, { Path } from "react-native-svg";

export const GLYPH_OFF = "#4a4a50";
export const GLYPH_ON = "#ff4d1a";

// Desenha um arcano (src/utils/tarot.ts).
// "off" = apagado (cinza), "lit" = aceso (vermelho-alaranjado, com brilho e chama),
// "mono" = uma cor só (a de `color`), sem brilho nem chama.
export default function TarotGlyph({
  k,
  size,
  mode = "mono",
  color = "#fff",
}: {
  k: string;
  size: number;
  mode?: "off" | "lit" | "mono";
  color?: string;
}) {
  const lit = mode === "lit",
    line = lit ? GLYPH_ON : mode === "off" ? GLYPH_OFF : color;
  const draw = (e: TarotEl, i: number) => {
    if (e[0] === "s")
      return (
        <Path
          key={i}
          d={e[1]}
          stroke={line}
          strokeWidth={e[2]}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    if (e[0] === "f") return <Path key={i} d={e[1]} fill={line} />;
    if (e[0] === "c") return <Path key={i} d={e[1]} fill={lit ? "#ffe3b8" : line} />;
    if (!lit) return null; // brilho, chama e miolo só existem acesos
    if (e[0] === "g") return <Path key={i} d={e[1]} fill={GLYPH_ON} fillOpacity={0.14} />;
    return <Path key={i} d={e[1]} fill={e[0] === "a" ? "#ff6a1a" : "#ffd08a"} />;
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {tarotOf(k).els.map(draw)}
    </Svg>
  );
}
