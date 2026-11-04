import Dropdown, { type DropdownOption } from "@/components/Dropdown";
import TarotGlyph from "@/components/TarotGlyph";
import { Actions, Btn, Chip, Label, Sheet, Txt } from "@/components/ui";
import { useApp } from "@/store/RotinaProvider";
import { useTheme } from "@/theme";
import type { ThemeSet } from "@/utils/settings";
import { TAROT, tarotOf } from "@/utils/tarot";
import { Pressable, View } from "react-native";
import RotinaIcon from "../../../modules/rotina-icon";

const SETS: DropdownOption[] = [
  { key: "default", label: "Padrão", icon: "palette-outline" },
  { key: "persona5", label: "Persona 5", icon: "drama-masks" },
];

// Modal "Temas": primeiro o conjunto (Padrão ou Persona 5). No Padrão: claro/escuro e os 22 arcanos
// maiores, que definem o ícone do app e o da abertura. Persona 5 ainda está em construção: escolher
// esse conjunto não muda nada na aparência e esconde o resto do modal.
export default function ThemesSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const A = useApp(),
    c = useTheme(),
    s = A.settings;
  const current = tarotOf(s.tarot);
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Txt style={{ fontSize: 20, fontWeight: "700" }}>Temas</Txt>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Txt style={{ fontSize: 16 }}>Tema</Txt>
        <Dropdown
          value={s.themeSet}
          options={SETS}
          onSelect={(key) => A.setSettings({ themeSet: key as ThemeSet })}
        />
      </View>

      {s.themeSet === "default" ? (
        <>
          <Label>Aparência</Label>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Chip label="Claro" on={s.theme === "light"} onPress={() => A.setSettings({ theme: "light" })} />
            <Chip label="Escuro" on={s.theme === "dark"} onPress={() => A.setSettings({ theme: "dark" })} />
          </View>

          <Label>Ícone do app (arcanos maiores)</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, rowGap: 14 }}>
            {TAROT.map((t) => {
              const on = t.key === s.tarot;
              return (
                <Pressable
                  key={t.key}
                  accessibilityLabel={t.numeral + " " + t.name}
                  onPress={() => A.setSettings({ tarot: t.key })}
                  style={{ width: 72, alignItems: "center", gap: 4 }}
                >
                  <View
                    style={{
                      width: 72,
                      height: 62,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: on ? c.tx : "transparent",
                      backgroundColor: c.bg,
                    }}
                  >
                    <TarotGlyph
                      k={t.key}
                      size={48}
                      mode={on ? "lit" : "mono"}
                      color={c.tx}
                    />
                  </View>
                  <Txt
                    numberOfLines={2}
                    style={{
                      fontSize: 11,
                      lineHeight: 13,
                      textAlign: "center",
                      color: on ? c.tx : c.mu,
                      fontWeight: on ? "700" : "400",
                    }}
                  >
                    {t.name}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
          <Txt style={{ fontSize: 15, fontWeight: "600" }}>
            {current.numeral} · {current.name}
          </Txt>
          <Txt mu style={{ fontSize: 13 }}>
            {RotinaIcon
              ? "A abertura muda na hora. O ícone do app pode levar alguns segundos para atualizar no launcher."
              : "A abertura muda na hora. O ícone do app só muda depois de gerar o app de novo (rebuild)."}
          </Txt>
        </>
      ) : (
        <Txt mu>
          Tema em construção. Já estão ativos a tela de abertura (“Take your
          heart”) e o ícone do app. As cores do app ainda não mudam.
        </Txt>
      )}

      <Actions>
        <Btn kind="sv" label="Concluir" onPress={onClose} />
      </Actions>
    </Sheet>
  );
}
