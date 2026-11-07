import useSave from "@/hooks/useSave";
import {
  NOTIFICATION_CHANNEL,
  getNotifications,
  setupChannel,
} from "@/services/notifications";
import {
    Day,
    Inb,
    Path,
    Task,
    act,
    dk,
    dur,
    m,
    ntl,
    vis
} from "@/utils/rotina";
import { DEFAULT_SETTINGS, type Settings } from "@/utils/settings";
import { APP_ICON_KEYS, PERSONA5_ICON, tarotOf } from "@/utils/tarot";
import RotinaIcon from "../../modules/rotina-icon";
import { CalOpts, FormOpts } from "@/utils/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { Appearance, AppState } from "react-native";

const EMPTY: Day = { c: {}, d: {} };
// tema do celular, lido na importação do módulo (antes de o app sobrepor o esquema de cores)
const SYSTEM_SCHEME = Appearance.getColorScheme() === "light" ? "light" : "dark";

export const STORAGE_KEYS = {
  tasks: "rotina:tasks2",
  paths: "rotina:paths",
  inbox: "rotina:inbox",
  days: "rotina:days",
  settings: "rotina:settings",
};

export default function useRoutineState() {
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [PA, setPA] = useState<Path[]>([]);
  const [IB, setIB] = useState<Inb[]>([]);
  const [days, setDays] = useState<Record<string, Day>>({});
  const [sel, setSel] = useState(dk(new Date()));
  const [tab, setTab] = useState<"h" | "i" | "s">("h");
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [form, setForm] = useState<FormOpts | null>(null);
  const [view, setView] = useState<{ id: string; kind: "t" | "i" } | null>(
    null,
  );
  const [del, setDel] = useState<Task | null>(null);
  const [ibEdit, setIbEdit] = useState<string | null>(null);
  const [pathsOpen, setPathsOpen] = useState(false);
  const [cal, setCal] = useState<CalOpts | null>(null);
  const [msg, setMsg] = useState("");
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationSignature = useRef("");
  const syncGen = useRef(0);
  const syncLock = useRef<Promise<void>>(Promise.resolve());
  const channelReady = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    (async () => {
      try {
        const values = await AsyncStorage.multiGet([
          STORAGE_KEYS.tasks,
          STORAGE_KEYS.paths,
          STORAGE_KEYS.inbox,
          STORAGE_KEYS.days,
          STORAGE_KEYS.settings,
        ]);
        const getValue = (index: number) =>
          values[index][1] ? JSON.parse(values[index][1] as string) : null;
        if (getValue(0)) setTasks(getValue(0));
        if (getValue(1)) setPA(getValue(1));
        if (getValue(2)) setIB(getValue(2));
        if (getValue(3)) setDays(getValue(3));
        const saved = getValue(4);
        if (saved) {
          // lê só os campos conhecidos (ajustes de versões antigas, como o som, são descartados)
          const merged: Settings = {
            weekStart: saved.weekStart === 1 ? 1 : 0,
            // "automático" (versão antiga) vira o tema que o celular está usando agora
            theme: saved.theme === "light" || saved.theme === "dark" ? saved.theme : SYSTEM_SCHEME,
            themeSet: saved.themeSet === "persona5" ? "persona5" : "default",
            tarot: tarotOf(saved.tarot).key,
          };
          setSettingsState(merged);
          // aplica o tema antes de mostrar a tela (sem piscar no tema errado)
          Appearance.setColorScheme?.(merged.theme); // não existe na web
        }
      } catch {}
      setReady(true);
    })();

    const notifications = getNotifications();
    if (notifications) {
      (async () => {
        try {
          let status = (await notifications.getPermissionsAsync()).status;
          if (status !== "granted")
            status = (await notifications.requestPermissionsAsync()).status;
          if (status !== "granted")
            toast(
              "Permissão de notificações negada. Ative nas configurações do app.",
            );
        } catch (error) {
          console.warn("notificações: init", error);
        }
      })();
    }
  }, []);

  useSave(STORAGE_KEYS.tasks, tasks, ready);
  useSave(STORAGE_KEYS.paths, PA, ready);
  useSave(STORAGE_KEYS.inbox, IB, ready);
  useSave(STORAGE_KEYS.days, days, ready);
  useSave(STORAGE_KEYS.settings, settings, ready);

  // tema: sobrepõe o esquema de cores do app inteiro (claro ou escuro)
  useEffect(() => {
    Appearance.setColorScheme?.(settings.theme);
  }, [settings.theme]);

  // canal de notificação do som escolhido (cada som tem o seu; o agendamento espera ele existir)
  useEffect(() => {
    const notifications = getNotifications();
    if (!ready || !notifications) return;
    channelReady.current = setupChannel(notifications).catch((error) =>
      console.warn("notificações: canal", error),
    );
  }, [ready]);

  // ícone do app no launcher (Android): com o tema Persona 5, o olho; senão, o arcano escolhido.
  // Sem o módulo nativo (Expo Go ou app ainda sem o rebuild) não faz nada.
  useEffect(() => {
    if (!ready || !RotinaIcon) return;
    const key = settings.themeSet === "persona5" ? PERSONA5_ICON : settings.tarot;
    RotinaIcon.setAppIcon(key, APP_ICON_KEYS).catch((error) =>
      console.warn("ícone do app", error),
    );
  }, [ready, settings.themeSet, settings.tarot]);

  // Agendamento em fila: uma execução nunca roda junto com outra, e uma execução desatualizada
  // (o usuário mudou/apagou algo no meio) para de agendar. Antes, o laço antigo seguia agendando a
  // tarefa apagada depois que a nova execução já tinha cancelado tudo.
  useEffect(() => {
    const notifications = getNotifications();
    if (!ready || !notifications) return;
    const sync = async (gen: number) => {
      try {
        if (gen !== syncGen.current) return;
        const now = new Date();
        const reminders: { at: Date; title: string; body: string }[] = [];
        for (let offset = 0; offset < 14; offset++) {
          const date = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + offset,
          );
          const key = dk(date);
          vis(tasks, PA, days[key] ?? EMPTY, key).forEach((task) => {
            // dia inteiro: avisos nos horários escolhidos; com horário: "x antes" e/ou no início
            const alerts = task.ad
              ? (task.na ?? []).map((t) => ({
                  min: t,
                  body: "Tarefa do dia inteiro",
                }))
              : ntl(task).map((o) => ({
                  min: m(task.s) - o,
                  body: o ? "Começa em " + dur(o) : "Começa agora",
                }));
            alerts.forEach((a) => {
              const at = new Date(date.getTime() + a.min * 60000);
              if (at > now)
                reminders.push({ at, title: task.t, body: a.body });
            });
          });
        }
        reminders.sort((a, b) => +a.at - +b.at);
        const plan = reminders.slice(0, 60);
        const signature = JSON.stringify(
          plan.map((item) => [+item.at, item.title, item.body]),
        );
        if (signature === notificationSignature.current) return;
        notificationSignature.current = ""; // até terminar, o que está agendado não é confiável
        await channelReady.current;
        await notifications.cancelAllScheduledNotificationsAsync();
        for (const item of plan) {
          if (gen !== syncGen.current) return; // surgiu uma versão mais nova: ela refaz tudo
          await notifications.scheduleNotificationAsync({
            content: {
              title: item.title,
              body: item.body,
              sound: true,
            },
            trigger: {
              type: notifications.SchedulableTriggerInputTypes.DATE,
              date: item.at,
              channelId: NOTIFICATION_CHANNEL,
            },
          });
        }
        notificationSignature.current = signature;
      } catch (error) {
        console.warn("notificações: agendamento", error);
      }
    };
    const run = () => {
      const gen = ++syncGen.current;
      syncLock.current = syncLock.current.then(() => sync(gen));
    };
    const timeout = setTimeout(run, 600);
    // ao sair do app, aplica na hora (não perde a mudança se o app for fechado logo depois)
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        clearTimeout(timeout);
        run();
      }
    });
    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [ready, tasks, PA, days]);

  const ds = (key: string): Day => days[key] ?? EMPTY;
  const upDay = useCallback((key: string, update: (day: Day) => void) => {
    setDays((previous) => {
      const current = previous[key];
      const day: Day = {
        c: { ...(current?.c || {}) },
        d: { ...(current?.d || {}) },
      };
      update(day);
      return { ...previous, [key]: day };
    });
  }, []);
  const toast = (text: string) => {
    setMsg(text);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setMsg(""), 8000);
  };
  const rmT = (id: string) => {
    setTasks((previous) => previous.filter((task) => task.id !== id));
    setPA((previous) =>
      previous.map((path) => ({
        ...path,
        t: path.t.filter((taskId) => taskId !== id),
      })),
    );
  };
  const openForm = (options: Partial<Omit<FormOpts, "id">> = {}) =>
    setForm({
      id: Date.now(),
      task: options.task ?? null,
      ctx: options.ctx ?? null,
      ibSrc: options.ibSrc ?? null,
      pre: options.pre,
    });
  const setSettings = (patch: Partial<Settings>) =>
    setSettingsState((previous) => ({ ...previous, ...patch }));
  // Hard reset: apaga tarefas e caminhos do dia (e as marcações de concluído deles, que ficariam
  // órfãs). O Inbox e os ajustes ficam. Os lembretes são cancelados pelo próprio agendamento,
  // que passa a ver um plano vazio.
  const resetAll = () => {
    setTasks([]);
    setPA([]);
    setDays({});
    setSel(dk(new Date()));
    setTab("h");
    toast("Rotina resetada");
  };
  const pct = (key: string) => {
    const visible = vis(tasks, PA, ds(key), key);
    const day = ds(key);
    return visible.length
      ? visible.filter((task) => day.d[task.id]).length / visible.length
      : 0;
  };

  return {
    ready,
    settings,
    setSettings,
    resetAll,
    tasks,
    setTasks,
    PA,
    setPA,
    days,
    IB,
    setIB,
    sel,
    setSel,
    tab,
    setTab,
    form,
    openForm,
    closeForm: () => setForm(null),
    view,
    setView,
    del,
    setDel,
    ibEdit,
    setIbEdit,
    pathsOpen,
    setPathsOpen,
    cal,
    openCal: setCal,
    closeCal: () => setCal(null),
    msg,
    toast,
    ds,
    upDay,
    rmT,
    pct,
    act: (period: "m" | "t" | "n", key: string) =>
      act(PA, ds(key), period, key),
    vis: (key: string) => vis(tasks, PA, ds(key), key),
  };
}
