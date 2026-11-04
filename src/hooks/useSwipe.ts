import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, PanResponder } from "react-native";

const SW = 360; // distância do deslize (maior que a largura da tela)

// Deslizar para os lados: o conteúdo acompanha o dedo; ao soltar (passou de ~60 px ou foi rápido),
// sai pelo lado, chama onShift(dir) e entra pelo lado oposto. dir = +1 (próximo) ou -1 (anterior).
// Serve para a faixa da semana e para a lista de tarefas do dia.
export function useSwipe(onShift: (dir: number) => void) {
  "use no memo"; // gesto imperativo (Animated + refs): o React Compiler não deve otimizar este hook
  const [tx] = useState(() => new Animated.Value(0));
  const busy = useRef(false);
  const shift = useRef(onShift);
  useEffect(() => {
    shift.current = onShift;
  });

  const go = useCallback(
    (dir: number) => {
      if (busy.current) return;
      busy.current = true;
      Animated.timing(tx, {
        toValue: -dir * SW,
        duration: 140,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        shift.current(dir);
        tx.setValue(dir * SW);
        Animated.timing(tx, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          busy.current = false;
        });
      });
    },
    [tx],
  );

  const pan = useMemo(() => {
    const back = () =>
      Animated.spring(tx, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
      }).start();
    return PanResponder.create({
      // só assume o gesto se for claramente horizontal (rolar na vertical continua normal)
      onMoveShouldSetPanResponder: (_, g) =>
        !busy.current &&
        Math.abs(g.dx) > 12 &&
        Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_, g) => tx.setValue(g.dx),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 60 || Math.abs(g.vx) > 0.6) go(g.dx < 0 ? 1 : -1);
        else back();
      },
      onPanResponderTerminate: back,
    });
  }, [tx, go]);

  const style = {
    transform: [{ translateX: tx }],
    opacity: tx.interpolate({
      inputRange: [-SW, 0, SW],
      outputRange: [0.15, 1, 0.15],
      extrapolate: "clamp" as const,
    }),
  };
  return { pan, go, style };
}
