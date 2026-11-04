import CalendarSheet from "@/components/calendar/CalendarSheet";
import Icon from "@/components/Icon";
import InboxEdit from "@/components/inbox/InboxEdit";
import PathsModal from "@/components/paths/PathsModal";
import TaskForm from "@/components/task/TaskForm";
import { DeleteSheet, TaskView } from "@/components/task/TaskView";
import { Txt } from "@/components/ui";
import Home from "@/screens/Home";
import Inbox from "@/screens/Inbox";
import Settings from "@/screens/Settings";
import { useApp } from "@/store/RotinaProvider";
import { useTheme } from "@/theme";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Tabs() {
  const A = useApp(),
    c = useTheme(),
    { bottom } = useSafeAreaInsets();
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.card).catch(() => {});
  }, [c.card]);
  if (!A.ready) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  const tab = (id: "h" | "i" | "s", ico: string, label: string) => (
    // ícone cheio quando ativo, só contorno quando inativo
    <Pressable
      key={id}
      onPress={() => A.setTab(id)}
      style={{
        flex: 1,
        maxWidth: 260,
        alignItems: "center",
        gap: 2,
        padding: 4,
      }}
    >
      <Icon
        name={A.tab === id ? ico : ico + "-outline"}
        size={26}
        color={A.tab === id ? c.tx : c.mu}
      />
      <Txt
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: A.tab === id ? c.tx : c.mu,
        }}
      >
        {label}
      </Txt>
    </Pressable>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.card }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: c.bg }}>
        <View style={{ flex: 1, display: A.tab === "h" ? "flex" : "none" }}>
          <Home />
        </View>
        <View style={{ flex: 1, display: A.tab === "i" ? "flex" : "none" }}>
          <Inbox />
        </View>
        <View style={{ flex: 1, display: A.tab === "s" ? "flex" : "none" }}>
          <Settings />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: c.card,
            borderTopWidth: 1,
            borderTopColor: c.ln,
            paddingTop: 8,
            paddingBottom: 8 + bottom,
          }}
        >
          {tab("i", "inbox", "Inbox")}
          {tab("h", "home", "Home")}
          {tab("s", "cog", "Ajustes")}
        </View>
        {!!A.msg && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 12 + 40,
              alignSelf: "center",
              backgroundColor: c.ac,
              paddingVertical: 12,
              paddingHorizontal: 18,
              borderRadius: 18,
              maxWidth: "90%",
              zIndex: 30,
            }}
          >
            <Txt style={{ color: c.ak, fontWeight: "600" }}>{A.msg}</Txt>
          </View>
        )}
        <PathsModal />
        <TaskForm />
        <TaskView />
        <DeleteSheet />
        <InboxEdit />
        <CalendarSheet />
      </SafeAreaView>
    </View>
  );
}
