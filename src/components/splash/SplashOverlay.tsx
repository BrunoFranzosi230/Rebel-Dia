import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import TarotGlyph, { GLYPH_ON } from "../TarotGlyph";
import { DEFAULT_TAROT, tarotOf } from "@/utils/tarot";
import { STORAGE_KEYS } from "@/hooks/useRoutineState";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mesmo tamanho (dp) do imageWidth da splash nativa no app.json: sem "pulo" na troca.
const SIZE = 128,
  GLOW = 340,
  MIN_MS = 1200; // tempo mínimo de "acendimento", mesmo que os dados carreguem rápido
const P5_RED = "#C70000"; // vermelho de fundo da imagem do Persona 5 (a imagem é contida, sem bordas)
const P5_SPLASH = require("../../../assets/images/persona5-splash.png");

// o que mostrar na abertura: o arcano escolhido ou o tema Persona 5
type Boot = { tarot: string; persona5: boolean };

// Tela de abertura. Tema padrão: fundo preto e o arcano escolhido no centro, que vai acendendo
// (cinza -> vermelho-alaranjado) enquanto o app carrega. Tema Persona 5: a imagem "Take your heart"
// entra com um zoom. Ao terminar de carregar, a tela some com um fade.
export default function SplashOverlay({ ready }: { ready: boolean }) {
  const [p] = useState(() => new Animated.Value(0)); // 0 = apagado, 1 = aceso
  const [flick] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));
  const [boot, setBoot] = useState<Boot | null>(null); // null = ainda lendo os ajustes
  const [minDone, setMinDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.settings)
      .then((raw) => {
        let b: Boot = { tarot: DEFAULT_TAROT, persona5: false };
        try {
          if (raw) {
            const saved = JSON.parse(raw);
            b = { tarot: tarotOf(saved.tarot).key, persona5: saved.themeSet === "persona5" };
          }
        } catch {}
        setBoot(b);
      })
      .catch(() => setBoot({ tarot: DEFAULT_TAROT, persona5: false }));
  }, []);

  useEffect(() => {
    if (!boot) return; // só começa quando já sabe o que mostrar
    // acende até ~70% durante o carregamento
    const ignite = Animated.timing(p, { toValue: 0.7, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    ignite.start();
    // leve tremulação da chama
    const flicker = Animated.loop(
      Animated.sequence([
        Animated.timing(flick, { toValue: 1, duration: 170, useNativeDriver: true }),
        Animated.timing(flick, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]),
    );
    if (!boot.persona5) flicker.start(); // a chama só treme no tema padrão
    const t = setTimeout(() => setMinDone(true), MIN_MS);
    return () => {
      ignite.stop();
      flicker.stop();
      clearTimeout(t);
    };
  }, [p, flick, boot]);

  useEffect(() => {
    if (!boot || !(ready && minDone)) return;
    // carregou: acende por completo, segura um instante e some
    const finish = Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(250),
      Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]);
    finish.start(() => setGone(true));
    return () => finish.stop();
  }, [ready, minDone, boot, p, fade]);

  if (gone) return null;

  const glowOpacity = Animated.multiply(p, flick.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }));
  const glowScale = p.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.05] });
  const p5Opacity = p.interpolate({ inputRange: [0, 0.35], outputRange: [0, 1], extrapolate: "clamp" });
  const p5Scale = p.interpolate({ inputRange: [0, 1], outputRange: [1.12, 1] });

  return (
    <Animated.View
      // só esconde a splash nativa depois que esta tela (idêntica) já está desenhada
      onLayout={() => SplashScreen.hideAsync().catch(() => {})}
      pointerEvents="auto"
      style={[StyleSheet.absoluteFill, { backgroundColor: boot?.persona5 ? P5_RED : "#000000", alignItems: "center", justifyContent: "center", opacity: fade, zIndex: 100 }]}
    >
      <StatusBar style="light" />
      {boot && !boot.persona5 && (
        <>
        <Animated.View style={{ position: "absolute", opacity: glowOpacity, transform: [{ scale: glowScale }] }}>
          <Svg width={GLOW} height={GLOW}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={GLYPH_ON} stopOpacity={0.5} />
                <Stop offset="1" stopColor={GLYPH_ON} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#glow)" />
          </Svg>
        </Animated.View>
          <View style={{ width: SIZE, height: SIZE }}>
            <TarotGlyph k={boot.tarot} size={SIZE} mode="off" />
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: p }]}>
              <TarotGlyph k={boot.tarot} size={SIZE} mode="lit" />
            </Animated.View>
          </View>
        </>
      )}
      {boot?.persona5 && (
        <Animated.Image
          source={P5_SPLASH}
          resizeMode="contain"
          style={[StyleSheet.absoluteFill, { width: "100%", height: "100%", opacity: p5Opacity, transform: [{ scale: p5Scale }] }]}
        />
      )}
    </Animated.View>
  );
}
