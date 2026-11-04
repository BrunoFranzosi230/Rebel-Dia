import { useTheme } from "@/theme";
import { useRef, useState } from "react";
import { Modal, Pressable, View, useWindowDimensions } from "react-native";
import Icon from "./Icon";
import { Txt } from "./ui";

export type DropdownOption = { key: string; label: string; icon: string };

// Menu suspenso: o botão mostra a opção atual; ao tocar, abre um cartão logo abaixo dele com as
// opções (ícone, nome e um check na escolhida). Tocar fora fecha. Usa um Modal próprio e a posição
// real do botão na janela, então não é cortado pelo scroll da gaveta nem perde toques no Android.
export default function Dropdown({
  value,
  options,
  onSelect,
}: {
  value: string;
  options: DropdownOption[];
  onSelect: (key: string) => void;
}) {
  const c = useTheme(),
    { width } = useWindowDimensions();
  const btn = useRef<View>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const cur = options.find((o) => o.key === value) ?? options[0];
  const open = () =>
    btn.current?.measureInWindow((x, y, w, h) =>
      setPos({ top: y + h + 6, right: Math.max(12, width - (x + w)) }),
    );
  const close = () => setPos(null);
  return (
    <>
      <Pressable
        ref={btn}
        onPress={open}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingVertical: 7,
          paddingLeft: 12,
          paddingRight: 8,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: c.ln,
        }}
      >
        <Icon name={cur.icon} size={16} />
        <Txt style={{ fontSize: 14 }}>{cur.label}</Txt>
        <Icon name="chevron-down" size={16} color={c.mu} />
      </Pressable>
      <Modal
        visible={!!pos}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <Pressable style={{ flex: 1 }} onPress={close}>
          {pos && (
            <View
              style={{
                position: "absolute",
                top: pos.top,
                right: pos.right,
                minWidth: 220,
                paddingVertical: 6,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: c.ln,
                backgroundColor: c.card,
                elevation: 10,
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 6 },
              }}
            >
              {options.map((o) => {
                const on = o.key === value;
                return (
                  <Pressable
                    key={o.key}
                    onPress={() => {
                      onSelect(o.key);
                      close();
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      marginHorizontal: 6,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: on ? c.bt : "transparent",
                    }}
                  >
                    <Icon name={o.icon} size={20} />
                    <Txt style={{ flex: 1, fontSize: 16 }}>{o.label}</Txt>
                    {on && <Icon name="check" size={18} color={c.cy} />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}
