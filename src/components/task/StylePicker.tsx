import { hsl, useTheme } from "@/theme";
import { ICON_GROUPS } from "@/utils/iconLibrary";
import { HUE, contrastOf } from "@/utils/rotina";
import { memo, useCallback, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { scheduleOnRN } from "react-native-worklets";
import Icon from "../Icon";
import { Actions, Btn, Chip, Field, Label, Sheet, Txt } from "../ui";

const thumbShadow = {
  elevation: 5,
  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
} as const;

const BAR_H = 28,
  THUMB = 32,
  PAD = THUMB / 2;
const clamp01 = (n: number) => {
  "worklet";
  return Math.min(1, Math.max(0, n));
};

// Trilhas estáticas (desenhadas uma vez; o arrasto nunca as redesenha)
const HueTrack = memo(function HueTrack({ width }: { width: number }) {
  return (
    <Svg width={width} height={BAR_H}>
      <Defs>
        <LinearGradient id="hue" x1="0" y1="0" x2="1" y2="0">
          {Array.from({ length: 13 }, (_, i) => (
            <Stop key={i} offset={i / 12} stopColor={hsl(i * 30, 60, 50)} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={BAR_H} fill="url(#hue)" />
    </Svg>
  );
});
// preto -> transparente -> branco, por cima da cor (o fundo da barra de brilho muda de matiz sozinho)
const LightOverlay = memo(function LightOverlay({ width }: { width: number }) {
  return (
    <Svg width={width} height={BAR_H}>
      <Defs>
        <LinearGradient id="lt" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#000" stopOpacity={1} />
          <Stop offset="0.5" stopColor="#000" stopOpacity={0} />
          <Stop offset="0.5" stopColor="#fff" stopOpacity={0} />
          <Stop offset="1" stopColor="#fff" stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={BAR_H} fill="url(#lt)" />
    </Svg>
  );
});

// Barra arrastável: valor (0..1) num SharedValue, bolinha e cor animadas na thread de UI.
// Nada do React é re-renderizado durante o arrasto; o resultado só sobe ao soltar o dedo.
function Bar({
  value,
  hue,
  light,
  width,
  onEnd,
  children,
}: {
  value: SharedValue<number>;
  hue: SharedValue<number>;
  light: SharedValue<number>;
  width: number;
  onEnd: (v: number) => void;
  children: ReactNode;
}) {
  const pos = useAnimatedStyle(() => ({
    transform: [{ translateX: value.value * width }],
  }));
  const col = useAnimatedStyle(() => ({
    backgroundColor: `hsl(${Math.round(hue.value * 360)}, 60%, ${Math.round(light.value * 100)}%)`,
  }));
  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      value.set(clamp01((e.x - PAD) / width));
    })
    .onUpdate((e) => {
      value.set(clamp01((e.x - PAD) / width));
    })
    .onFinalize(() => {
      scheduleOnRN(onEnd, value.get());
    });
  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={{
          width: width + 2 * PAD,
          height: THUMB + 4,
          alignSelf: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            left: PAD,
            width,
            height: BAR_H,
            borderRadius: BAR_H / 2,
            overflow: "hidden",
          }}
        >
          {children}
        </View>
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              borderWidth: 3,
              borderColor: "#fff",
            },
            thumbShadow,
            pos,
            col,
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

// Aba de cor (como no Canva): barra de cor + barra de brilho, com prévia ao vivo.
function ColorTab({
  hue,
  light,
  icon,
  onCommit,
}: {
  hue: number;
  light: number;
  icon: string;
  onCommit: (h: number, l: number) => void;
}) {
  const c = useTheme(),
    { width: screenW } = useWindowDimensions();
  const BW = Math.min(320, screenW - 36 - 2 * PAD - 8);
  const h = useSharedValue(hue / 360),
    l = useSharedValue(light / 100);
  const latest = useRef({ h: hue, l: light });
  const endHue = useCallback(
    (v: number) => {
      latest.current.h = Math.min(359, Math.round(v * 360));
      onCommit(latest.current.h, latest.current.l);
    },
    [onCommit],
  );
  const endLight = useCallback(
    (v: number) => {
      latest.current.l = Math.round(v * 100);
      onCommit(latest.current.h, latest.current.l);
    },
    [onCommit],
  );
  const pick = (x: number) => {
    h.set(x / 360);
    latest.current.h = x;
    onCommit(x, latest.current.l);
  };
  const preview = useAnimatedStyle(() => ({
    backgroundColor: `hsl(${Math.round(h.value * 360)}, 60%, ${Math.round(l.value * 100)}%)`,
  }));
  const trackBase = useAnimatedStyle(() => ({
    backgroundColor: `hsl(${Math.round(h.value * 360)}, 60%, 50%)`,
  }));
  const onDark = useAnimatedStyle(() => ({
    opacity: l.value * 100 > 68 ? 1 : 0,
  }));
  const onLight = useAnimatedStyle(() => ({
    opacity: l.value * 100 > 68 ? 0 : 1,
  }));
  const center = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  } as const;
  return (
    // no Android o Modal é outra janela: precisa do seu próprio GestureHandlerRootView
    <GestureHandlerRootView style={{ gap: 14 }}>
      <Animated.View
        style={[
          {
            width: 96,
            height: 96,
            borderRadius: 48,
            alignSelf: "center",
            borderWidth: 1,
            borderColor: c.ln,
          },
          preview,
        ]}
      >
        <Animated.View style={[center, onLight]}>
          <Icon name={icon} size={44} color="#fff" />
        </Animated.View>
        <Animated.View style={[center, onDark]}>
          <Icon name={icon} size={44} color="#17171a" />
        </Animated.View>
      </Animated.View>
      <Label>Cor</Label>
      <Bar value={h} hue={h} light={l} width={BW} onEnd={endHue}>
        <HueTrack width={BW} />
      </Bar>
      <Label>Brilho</Label>
      <Bar value={l} hue={h} light={l} width={BW} onEnd={endLight}>
        <Animated.View style={[StyleSheet.absoluteFill, trackBase]} />
        <LightOverlay width={BW} />
      </Bar>
      <Label>Sugestões</Label>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {HUE.map((x) => (
          <Pressable
            key={x}
            onPress={() => pick(x)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 2,
              borderColor: "transparent",
              backgroundColor: hsl(x, 60, 60),
            }}
          />
        ))}
      </View>
    </GestureHandlerRootView>
  );
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function StylePicker({
  visible,
  icon,
  hue,
  light,
  onIcon,
  onColor,
  onClose,
}: {
  visible: boolean;
  icon: string;
  hue: number;
  light: number;
  onIcon: (name: string) => void;
  onColor: (h: number, l: number) => void;
  onClose: () => void;
}) {
  const c = useTheme();
  const [tab, setTab] = useState<"i" | "c">("i"),
    [q, setQ] = useState("");
  const nq = norm(q.trim());
  const groups = ICON_GROUPS.map((g) => ({
    ...g,
    icons: nq
      ? g.icons.filter((i) => norm(i.kw + " " + i.name).includes(nq))
      : g.icons,
  })).filter((g) => g.icons.length);
  return (
    // na aba de cor o scroll da gaveta fica travado, para o arrasto na roda não rolar a tela
    <Sheet visible={visible} onClose={onClose} lock={tab === "c"}>
      <Txt style={{ fontSize: 20, fontWeight: "700" }}>Ícone e cor</Txt>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Chip label="Ícones" on={tab === "i"} onPress={() => setTab("i")} />
        <Chip label="Cor" on={tab === "c"} onPress={() => setTab("c")} />
      </View>
      {tab === "i" ? (
        <>
          <Field
            placeholder="Buscar ícone"
            value={q}
            onChangeText={setQ}
            autoCorrect={false}
          />
          {groups.map((g) => (
            <View key={g.title} style={{ gap: 8 }}>
              <Label>{g.title}</Label>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {g.icons.map((i) => {
                  const on = icon === i.name;
                  return (
                    <Pressable
                      key={i.name}
                      onPress={() => onIcon(i.name)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: on ? c.tx : "transparent",
                        backgroundColor: on ? hsl(hue, 60, light) : c.bg,
                      }}
                    >
                      <Icon
                        name={i.name}
                        size={22}
                        color={on ? contrastOf(light) : c.tx}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
          {!groups.length && <Txt mu>Nenhum ícone encontrado.</Txt>}
        </>
      ) : (
        <ColorTab hue={hue} light={light} icon={icon} onCommit={onColor} />
      )}
      <Actions>
        <Btn kind="sv" label="Concluir" onPress={onClose} />
      </Actions>
    </Sheet>
  );
}
