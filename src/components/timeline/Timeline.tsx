import { useApp } from "@/store/RotinaProvider";
import { hsl, useTheme } from "@/theme";
import { PX, Task, contrastOf, dk, hueOf, iconName, lightOf, lay, m } from "@/utils/rotina";
import { memo, useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Icon from "../Icon";
import { Txt } from "../ui";

type BP = {
  x: Task;
  k: string;
  on: boolean;
  sub: string;
  top: number;
  left: number;
  w: number;
  h: number;
  sm: boolean;
  setView: (v: { id: string; kind: "t" | "i" }) => void;
  upDay: (k: string, fn: (s: any) => void) => void;
};
// memo: só o bloco que mudou é redesenhado (antes, tocar numa tarefa redesenhava a timeline inteira)
const Block = memo(function Block({
  x,
  k,
  on,
  sub,
  top,
  left,
  w,
  h,
  sm,
  setView,
  upDay,
}: BP) {
  const c = useTheme(),
    hue = hueOf(x),
    mini = w < 120 || h < 40,
    isz = mini ? 30 : sm ? 26 : 32,
    light = lightOf(x),
    fg = contrastOf(light),
    ghost = fg === "#fff" ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.14)";
  return (
    <Pressable
      onPress={() => setView({ id: x.id, kind: "t" })}
      style={{
        position: "absolute",
        top,
        height: h,
        left,
        width: w,
        flexDirection: "row",
        gap: 8,
        alignItems: mini ? "center" : "flex-start",
        justifyContent: mini ? "center" : "flex-start",
        padding: mini ? 4 : 7,
        paddingHorizontal: mini ? 4 : 8,
        borderRadius: 18,
        backgroundColor: hsl(hue, 60, light), // a cor exata escolhida
        overflow: "hidden",
        opacity: on ? 0.55 : 1,
      }}
    >
      <Pressable
        onPress={() =>
          upDay(k, (d) => {
            d.d[x.id] = !d.d[x.id];
          })
        }
        hitSlop={4}
        style={{
          width: isz,
          height: isz,
          borderRadius: isz / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: on ? c.ac : ghost,
        }}
      >
        <Icon
          name={on ? "check" : iconName(x.i)}
          size={mini ? 17 : sm ? 15 : 18}
          color={on ? c.ak : fg}
        />
      </Pressable>
      {!mini && (
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt
            numberOfLines={2}
            style={{
              fontSize: 14.5,
              fontWeight: "600",
              lineHeight: 18,
              color: fg,
              textDecorationLine: on ? "line-through" : "none",
            }}
          >
            {x.t}
          </Txt>
          {!sm && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 2,
              }}
            >
              <Txt
                numberOfLines={1}
                style={{ fontSize: 12, flexShrink: 1, color: fg, opacity: 0.75 }}
              >
                {x.s + (x.e ? " – " + x.e : "") + sub}
              </Txt>
              {x.r && x.r.f !== "o" && (
                <Icon name="repeat" size={12} color={fg} />
              )}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
});

// Tarefa de dia inteiro: pílula de largura total no topo, com a cor exata escolhida
const AllDayPill = memo(function AllDayPill({
  x,
  k,
  on,
  setView,
  upDay,
}: {
  x: Task;
  k: string;
  on: boolean;
  setView: BP["setView"];
  upDay: BP["upDay"];
}) {
  const c = useTheme(),
    light = lightOf(x),
    fg = contrastOf(light),
    ghost = fg === "#fff" ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.14)";
  return (
    <Pressable
      onPress={() => setView({ id: x.id, kind: "t" })}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        height: 42,
        flexGrow: 1, // divide o espaço livre com as outras
        flexShrink: 0, // nunca encolhe abaixo do tamanho do título
        paddingHorizontal: 8,
        borderRadius: 16,
        backgroundColor: hsl(hueOf(x), 60, light),
        opacity: on ? 0.55 : 1,
      }}
    >
      <Pressable
        onPress={() =>
          upDay(k, (d) => {
            d.d[x.id] = !d.d[x.id];
          })
        }
        hitSlop={4}
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: on ? c.ac : ghost,
        }}
      >
        <Icon name={on ? "check" : iconName(x.i)} size={16} color={on ? c.ak : fg} />
      </Pressable>
      <Txt
        numberOfLines={1}
        style={{
          flexGrow: 1,
          flexShrink: 0,
          maxWidth: 240,
          fontSize: 14.5,
          fontWeight: "600",
          color: fg,
          textDecorationLine: on ? "line-through" : "none",
        }}
      >
        {x.t}
      </Txt>
      {x.r && x.r.f !== "o" && <Icon name="repeat" size={12} color={fg} />}
    </Pressable>
  );
});

// Tarefas de dia inteiro lado a lado: dividem a largura e encolhem só até o tamanho do título;
// se não couberem na tela, a linha rola na horizontal (e só então captura o gesto lateral,
// senão o deslize de trocar de dia continua funcionando por cima dela).
function AllDayRow({
  items,
  k,
  done,
  setView,
  upDay,
}: {
  items: Task[];
  k: string;
  done: Record<string, boolean>;
  setView: BP["setView"];
  upDay: BP["upDay"];
}) {
  const [lw, setLw] = useState(0),
    [cw, setCw] = useState(0);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flex: 1 }}
      scrollEnabled={cw > lw + 1}
      onLayout={(e) => setLw(e.nativeEvent.layout.width)}
      onContentSizeChange={(w) => setCw(w)}
      contentContainerStyle={{ flexGrow: 1, gap: 8 }}
    >
      {items.map((x) => (
        <AllDayPill
          key={x.id}
          x={x}
          k={k}
          on={!!done[x.id]}
          setView={setView}
          upDay={upDay}
        />
      ))}
    </ScrollView>
  );
}

export default function Timeline({
  k,
  onNowTop,
}: {
  k: string;
  onNowTop?: (y: number) => void;
}) {
  const A = useApp(),
    c = useTheme(),
    [w, setW] = useState(0),
    [, setT] = useState(0),
    [ah, setAh] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);
  const s = A.ds(k),
    all = A.vis(k).filter((x) => x.ad),
    v = A.vis(k)
      .filter((x) => !x.ad)
      .sort(
      (a, b) => m(a.s) - m(b.s) || m(a.e || a.s) - m(b.e || b.s),
    ),
    L = lay(v),
    empty = !L.length;
  const nw = new Date(),
    nm = nw.getHours() * 60 + nw.getMinutes();
  const lo = empty ? 0 : Math.floor(Math.min(...L.map((y) => y.s)) / 60),
    hi = empty ? 0 : Math.ceil(Math.max(...L.map((y) => y.e)) / 60);
  const showNow = !empty && k === dk(nw) && nm >= lo * 60 && nm <= hi * 60,
    nowTop = ((nm - lo * 60) * PX) / 60;
  useEffect(() => {
    if (showNow) onNowTop?.(nowTop + ah);
  }, [showNow, ah]);
  const grid = (
    <View style={{ height: (hi - lo) * PX }}>
      {Array.from({ length: hi - lo + 1 }, (_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: i * PX,
            borderTopWidth: 1,
            borderTopColor: c.ln,
          }}
        >
          <Txt
            mu
            style={{
              position: "absolute",
              top: -8,
              left: 0,
              width: 44,
              fontSize: 12,
              backgroundColor: c.bg,
            }}
          >
            {String(lo + i).padStart(2, "0")}:00
          </Txt>
        </View>
      ))}
      <View
        style={{ position: "absolute", left: 50, right: 0, top: 0, bottom: 0 }}
        onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}
      >
        {w > 0 &&
          L.map((y) => {
            const x = y.x,
              sub =
                x.u && x.u.length
                  ? " · " +
                    x.u.filter((u) => s.d[x.id + "/" + u.id]).length +
                    "/" +
                    x.u.length
                  : "";
            return (
              <Block
                key={x.id}
                x={x}
                k={k}
                on={!!s.d[x.id]}
                sub={sub}
                top={((y.s - lo * 60) * PX) / 60 + 2}
                left={(y.col * w) / y.n + 2}
                w={w / y.n - 4}
                h={((y.e - y.s) * PX) / 60 - 4}
                sm={y.n >= 3}
                setView={A.setView}
                upDay={A.upDay}
              />
            );
          })}
      </View>
      {showNow && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 44,
            right: 0,
            top: nowTop,
            borderTopWidth: 2,
            borderTopColor: "#ff453a",
            zIndex: 3,
          }}
        >
          <View
            style={{
              position: "absolute",
              left: -5,
              top: -6,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#ff453a",
            }}
          />
        </View>
      )}
    </View>
  );
  return (
    <View>
      {all.length > 0 && (
        <View
          onLayout={(e) => setAh(Math.round(e.nativeEvent.layout.height))}
          style={{ flexDirection: "row", gap: 6, marginBottom: 18 }}
        >
          <View style={{ width: 44, paddingTop: 12 }}>
            <Txt mu style={{ fontSize: 11, lineHeight: 13 }}>
              Dia{"\n"}inteiro
            </Txt>
          </View>
          <AllDayRow
            items={all}
            k={k}
            done={s.d}
            setView={A.setView}
            upDay={A.upDay}
          />
        </View>
      )}
      {empty ? (
        all.length ? null : (
          <Txt mu style={{ textAlign: "center", paddingVertical: 50 }}>
            Nenhuma tarefa para este dia.
          </Txt>
        )
      ) : (
        grid
      )}
    </View>
  );
}
