import { useTheme } from "@/theme";
import { pd } from "@/utils/rotina";
import { memo, useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import { Label, Txt } from "../ui";

const H = 40, // altura de cada linha
  ROWS = 5, // linhas visíveis (a do meio é a selecionada)
  MSTEP = 5; // minutos por item da coluna de minutos

const Item = memo(function Item({ text, dist }: { text: string; dist: number }) {
  return (
    <View style={{ height: H, alignItems: "center", justifyContent: "center" }}>
      <Txt
        mu={dist !== 0}
        style={{
          fontSize: dist === 0 ? 24 : 20,
          fontWeight: dist === 0 ? "700" : "400",
          opacity: dist === 0 ? 1 : dist === 1 ? 0.6 : 0.3,
        }}
      >
        {text}
      </Txt>
    </View>
  );
});

// Uma coluna rolável com "encaixe" (como alarme de celular). O destaque acompanha o dedo localmente;
// quem está fora só é avisado quando a coluna para (onSettle).
function Column({
  count,
  index,
  fmt,
  onSettle,
}: {
  count: number;
  index: number;
  fmt: (i: number) => string;
  onSettle: (i: number) => void;
}) {
  const ref = useRef<ScrollView>(null);
  const curRef = useRef(index);
  const [cur, setCur] = useState(index);
  const at = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    Math.max(0, Math.min(count - 1, Math.round(e.nativeEvent.contentOffset.y / H)));
  const live = (i: number) => {
    if (i !== curRef.current) {
      curRef.current = i;
      setCur(i);
    }
  };
  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = at(e);
    live(i);
    onSettle(i);
  };
  // mudança vinda de fora (ex.: o "Fim" acompanha o "Início"): rola até o novo valor
  useEffect(() => {
    if (index !== curRef.current)
      ref.current?.scrollTo({ y: index * H, animated: true });
  }, [index]);
  return (
    <ScrollView
      ref={ref}
      style={{ flex: 1 }}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={H}
      decelerationRate="fast"
      scrollEventThrottle={32}
      contentOffset={{ x: 0, y: index * H }}
      onContentSizeChange={() =>
        ref.current?.scrollTo({ y: curRef.current * H, animated: false })
      }
      contentContainerStyle={{ paddingVertical: H * Math.floor(ROWS / 2) }}
      onScroll={(e) => live(at(e))}
      onMomentumScrollEnd={settle}
      onScrollEndDrag={(e) => {
        // soltou parado em cima de um item: não haverá "momentum", então confirma aqui
        if (Math.abs(e.nativeEvent.velocity?.y ?? 0) < 0.1) settle(e);
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} text={fmt(i)} dist={Math.abs(i - cur)} />
      ))}
    </ScrollView>
  );
}

export function TimeField({
  label,
  minutes,
  onChange,
}: {
  label?: string;
  minutes: number;
  onChange: (minutes: number) => void;
}) {
  const c = useTheme();
  const h = Math.floor(minutes / 60),
    mi = Math.min(60 / MSTEP - 1, Math.round((minutes % 60) / MSTEP));
  return (
    <View style={{ flex: 1, gap: 6 }}>
      {label ? <Label>{label}</Label> : null}
      <View
        style={{
          height: H * ROWS,
          borderRadius: 18,
          backgroundColor: c.bg,
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            top: H * Math.floor(ROWS / 2),
            height: H,
            borderRadius: 12,
            backgroundColor: c.bt,
          }}
        />
        <View style={{ flex: 1, flexDirection: "row" }}>
          <Column
            count={24}
            index={h}
            fmt={pd}
            onSettle={(i) => onChange(i * 60 + mi * MSTEP)}
          />
          <Column
            count={60 / MSTEP}
            index={mi}
            fmt={(i) => pd(i * MSTEP)}
            onSettle={(i) => onChange(h * 60 + i * MSTEP)}
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: H * Math.floor(ROWS / 2),
            height: H,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Txt style={{ fontSize: 24, fontWeight: "700" }}>:</Txt>
        </View>
      </View>
    </View>
  );
}

const fmtDur = (v: number) => {
  const h = Math.floor(v / 60),
    m = v % 60;
  return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
};

// Dois seletores lado a lado: Início (esquerda) e Fim (direita), em minutos desde 00:00.
// Mudar o início leva o fim junto (mantém a duração); o fim nunca fica antes do início.
// Fim igual ao início = tarefa sem horário de fim.
export default function TimeRange({
  start,
  end,
  onChange,
}: {
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
}) {
  const [s, setS] = useState(start),
    [e, setE] = useState(end);
  const apply = (ns: number, ne: number) => {
    setS(ns);
    setE(ne);
    onChange(ns, ne);
  };
  const d = Math.max(0, e - s);
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TimeField
          label="Início"
          minutes={s}
          onChange={(v) => apply(v, Math.min(1439, v + d))}
        />
        <TimeField
          label="Fim"
          minutes={e}
          onChange={(v) => apply(s, Math.max(v, s))}
        />
      </View>
      <Txt mu style={{ fontSize: 13, textAlign: "center" }}>
        {d > 0 ? "Duração: " + fmtDur(d) : "Sem horário de fim"}
      </Txt>
    </View>
  );
}
