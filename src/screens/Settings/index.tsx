import Icon from "@/components/Icon";
import { Actions, Btn, Chip, Label, Sheet, Txt } from "@/components/ui";
import { useApp } from "@/store/RotinaProvider";
import { useTheme } from "@/theme";
import { tarotOf } from "@/utils/tarot";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import ThemesSheet from "./ThemesSheet";

function Card({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  const c = useTheme();
  return (
    <View
      style={{ backgroundColor: c.card, borderRadius: 20, padding: 16, gap: 12 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Icon name={icon} size={20} color={c.mu} />
        <Txt style={{ fontSize: 17, fontWeight: "700" }}>{title}</Txt>
      </View>
      {children}
    </View>
  );
}

export default function Settings() {
  const A = useApp(),
    c = useTheme(),
    s = A.settings;
  const [confirm, setConfirm] = useState(false),
    [themes, setThemes] = useState(false);

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          padding: 14,
          paddingTop: 18,
          paddingBottom: 40,
          gap: 12,
          maxWidth: 520,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <Txt
          style={{
            fontSize: 34,
            fontWeight: "800",
            letterSpacing: -1,
            marginBottom: 6,
          }}
        >
          Ajustes
        </Txt>

        <Card icon="calendar-week" title="Semana">
          <Label>A semana começa em</Label>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Chip
              label="Domingo"
              on={s.weekStart === 0}
              onPress={() => A.setSettings({ weekStart: 0 })}
            />
            <Chip
              label="Segunda"
              on={s.weekStart === 1}
              onPress={() => A.setSettings({ weekStart: 1 })}
            />
          </View>
        </Card>

        <Card icon="palette-outline" title="Temas">
          <Pressable
            onPress={() => setThemes(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
          >
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 16 }}>
                {s.themeSet === "default" ? "Padrão" : "Persona 5"}
              </Txt>
              <Txt mu style={{ fontSize: 13 }}>
                {s.themeSet === "default"
                  ? (s.theme === "dark" ? "Escuro" : "Claro") + " · " + tarotOf(s.tarot).name
                  : "Em desenvolvimento"}
              </Txt>
            </View>
            <Icon name="chevron-right" size={20} color={c.mu} />
          </Pressable>
        </Card>

        <Card icon="database-outline" title="Dados">
          <Pressable
            onPress={() => setConfirm(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
          >
            <Icon name="delete-outline" size={22} color={c.dg} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 16, color: c.dg, fontWeight: "600" }}>
                Resetar rotina
              </Txt>
              <Txt mu style={{ fontSize: 13 }}>
                Apaga tarefas e caminhos do dia para reestruturar a semana
              </Txt>
            </View>
            <Icon name="chevron-right" size={20} color={c.mu} />
          </Pressable>
        </Card>
      </ScrollView>

      <ThemesSheet visible={themes} onClose={() => setThemes(false)} />

      <Sheet visible={confirm} onClose={() => setConfirm(false)}>
        <Txt style={{ fontSize: 20, fontWeight: "700" }}>Resetar rotina?</Txt>
        <Txt mu>
          Isso apaga todas as tarefas e os caminhos do dia (com as marcações de
          concluído deles) e cancela os lembretes agendados. Não dá para
          desfazer. O Inbox e os ajustes são mantidos.
        </Txt>
        <Actions>
          <Btn label="Cancelar" onPress={() => setConfirm(false)} />
          <Pressable
            onPress={() => {
              setConfirm(false);
              A.resetAll();
            }}
            style={{
              paddingVertical: 11,
              paddingHorizontal: 18,
              borderRadius: 14,
              backgroundColor: c.dg,
            }}
          >
            <Txt style={{ color: "#fff", fontWeight: "600" }}>Apagar tudo</Txt>
          </Pressable>
        </Actions>
      </Sheet>
    </>
  );
}
