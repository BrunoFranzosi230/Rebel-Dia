import { useApp } from "@/store/RotinaProvider";
import { useTheme } from "@/theme";
import {
    startFrom,
    PER,
    Path,
    Per,
    REP,
    Rep,
    UN,
    WDL,
    weekOrder,
    fromKey,
    iconName,
    m,
    rtxt
} from "@/utils/rotina";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Icon from "../Icon";
import { Actions, Btn, Chip, Field, Label, Sheet, Txt } from "../ui";

type PE = { id: string | null; n: string; per: Per; r: Rep };
export default function PathsModal() {
  const A = useApp(),
    c = useTheme();
  const [mode, setMode] = useState<"l" | "e">("l"),
    [pe, setPe] = useState<PE | null>(null),
    [err, setErr] = useState("");
  useEffect(() => {
    if (A.pathsOpen) setMode("l");
  }, [A.pathsOpen]);
  const q = pe?.id ? A.PA.find((z) => z.id === pe.id) : null;
  const tl = q
    ? A.tasks.filter((x) => q.t.includes(x.id)).sort((a, b) => m(a.s) - m(b.s))
    : [];
  const close = () => A.setPathsOpen(false);
  const edit = (p?: Path) => {
    setPe(
      p
        ? { id: p.id, n: p.n, per: p.per, r: { ...p.r, w: [...p.r.w] } }
        : { id: null, n: "", per: "m", r: { f: "d", n: 1, w: [], a: startFrom(A.sel) } },
    );
    setErr("");
    setMode("e");
  };
  const psv = (): Path | null => {
    if (!pe) return null;
    const n = pe.n.trim();
    if (!n) {
      setErr("Dê um nome ao caminho.");
      return null;
    }
    if (pe.r.f === "w" && !pe.r.w.length) {
      setErr("Escolha ao menos um dia da semana.");
      return null;
    }
    const r: Rep = {
      ...pe.r,
      n: Math.max(1, pe.r.n || 1),
      w: [...pe.r.w].sort(),
      a: pe.r.a || A.sel,
    };
    if (q) {
      const nq = { ...q, n, per: pe.per, r };
      A.setPA((p) => p.map((z) => (z.id === q.id ? nq : z)));
      return nq;
    }
    const nq: Path = { id: "p" + Date.now(), n, per: pe.per, d: [], r, t: [] };
    A.setPA((p) => [...p, nq]);
    setPe({ ...pe, id: nq.id });
    return nq;
  };
  const row = (
    key: string,
    onPress: () => void,
    left: React.ReactNode,
    right: React.ReactNode,
    x?: React.ReactNode,
  ) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        padding: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: c.bg,
        marginTop: 8,
      }}
    >
      {left}
      {right}
      {x}
    </Pressable>
  );
  const upR = (p: Partial<Rep>) => pe && setPe({ ...pe, r: { ...pe.r, ...p } });
  return (
    <Sheet visible={A.pathsOpen} onClose={close}>
      {mode === "l" || !pe ? (
        <>
          <Txt style={{ fontSize: 20, fontWeight: "700" }}>Caminhos do dia</Txt>
          {PER.map(([pk, nm]) => {
            const ps = A.PA.filter((z) => z.per === pk);
            return (
              <View key={pk}>
                <Txt
                  mu
                  style={{ fontSize: 13, fontWeight: "600", marginTop: 6 }}
                >
                  {nm}
                </Txt>
                {!ps.length && (
                  <Txt mu style={{ fontSize: 15 }}>
                    Nenhum caminho.
                  </Txt>
                )}
                {ps.map((p) =>
                  row(
                    p.id,
                    () => edit(p),
                    <Txt style={{ fontWeight: "700", flexShrink: 1 }}>
                      {p.n}
                    </Txt>,
                    <Txt
                      mu
                      style={{
                        fontSize: 13,
                        textAlign: "right",
                        flexShrink: 1,
                      }}
                    >
                      {p.t.length} tarefas · {rtxt(p.r)}
                    </Txt>,
                  ),
                )}
              </View>
            );
          })}
          <Actions>
            <Btn label="+ Novo caminho" onPress={() => edit()} />
            <Btn kind="sv" label="Fechar" onPress={close} />
          </Actions>
        </>
      ) : (
        <>
          <Txt style={{ fontSize: 20, fontWeight: "700" }}>
            {pe.id ? "Editar caminho" : "Novo caminho"}
          </Txt>
          <View style={{ gap: 5 }}>
            <Label>Nome</Label>
            <Field
              value={pe.n}
              maxLength={30}
              onChangeText={(n) => setPe({ ...pe, n })}
            />
          </View>
          <Label>Período</Label>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {PER.map(([k, l]) => (
              <Chip
                key={k}
                label={l}
                on={pe.per === k}
                onPress={() => setPe({ ...pe, per: k })}
              />
            ))}
          </View>
          <Label>Repetir</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {REP.map(([k, l]) => (
              <Chip
                key={k}
                label={l}
                on={pe.r.f === k}
                onPress={() =>
                  upR({
                    f: k,
                    w:
                      k === "w" && !pe.r.w.length
                        ? [fromKey(pe.r.a).getDay()]
                        : pe.r.w,
                  })
                }
              />
            ))}
          </View>
          {pe.r.f !== "o" && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Label>A cada</Label>
              <Field
                style={{ width: 70 }}
                keyboardType="number-pad"
                maxLength={2}
                value={pe.r.n ? String(pe.r.n) : ""}
                onChangeText={(v) => upR({ n: parseInt(v) || 0 })}
              />
              <Txt>{UN[pe.r.f][pe.r.n === 1 ? 0 : 1]}</Txt>
            </View>
          )}
          {pe.r.f === "w" && (
            <View style={{ flexDirection: "row", gap: 6 }}>
              {weekOrder(A.settings.weekStart).map((i) => {
                    const l = WDL[i];
                const on = pe.r.w.includes(i);
                return (
                  <Pressable
                    key={i}
                    onPress={() =>
                      upR({
                        w: on ? pe.r.w.filter((z) => z !== i) : [...pe.r.w, i],
                      })
                    }
                    style={{
                      flex: 1,
                      maxWidth: 44,
                      height: 40,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: on ? c.ac : c.ln,
                      backgroundColor: on ? c.ac : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Txt
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: on ? c.ak : c.tx,
                      }}
                    >
                      {l}
                    </Txt>
                  </Pressable>
                );
              })}
            </View>
          )}
          <View style={{ gap: 5 }}>
            <Label>{pe.r.f === "o" ? "Data" : "Começa em"}</Label>
            <Pressable
              onPress={() =>
                A.openCal({
                  value: pe.r.a,
                  onPick: (k) =>
                    setPe((p) => (p ? { ...p, r: { ...p.r, a: k } } : p)),
                })
              }
            >
              <Field
                editable={false}
                pointerEvents="none"
                value={fromKey(pe.r.a).toLocaleDateString("pt-BR")}
              />
            </Pressable>
          </View>
          <Label>Tarefas deste caminho</Label>
          <View>
            {!tl.length && (
              <Txt mu style={{ fontSize: 15 }}>
                Nenhuma tarefa ainda.
              </Txt>
            )}
            {tl.map((x) =>
              row(
                x.id,
                () => A.openForm({ task: x }),
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Icon name={iconName(x.i)} size={18} />
                  <Txt style={{ flexShrink: 1 }}>{x.t}</Txt>
                </View>,
                <Txt mu style={{ fontSize: 13 }}>
                  {x.ad ? "Dia inteiro" : x.s + (x.e ? " – " + x.e : "")}
                </Txt>,
                <Pressable
                  hitSlop={8}
                  onPress={() => {
                    if (!q) return;
                    A.setPA((p) =>
                      p.map((z) =>
                        z.id === q.id
                          ? { ...z, t: z.t.filter((i) => i !== x.id) }
                          : z,
                      ),
                    );
                    if (!A.PA.some((z) => z.id !== q.id && z.t.includes(x.id)))
                      A.setTasks((p) => p.filter((z) => z.id !== x.id));
                  }}
                >
                  <Icon name="close" size={18} color={c.mu} />
                </Pressable>,
              ),
            )}
          </View>
          <View style={{ alignItems: "flex-start" }}>
            <Chip
              label="+ Nova tarefa neste caminho"
              onPress={() => {
                const p = psv();
                if (p) A.openForm({ ctx: p.id });
              }}
            />
          </View>
          {!!err && <Txt style={{ color: c.dg, fontSize: 14 }}>{err}</Txt>}
          <Actions>
            {pe.id && (
              <Btn
                kind="dl"
                label="Excluir"
                onPress={() => {
                  A.setPA((p) => p.filter((z) => z.id !== pe.id));
                  setMode("l");
                }}
              />
            )}
            <Btn label="Voltar" onPress={() => setMode("l")} />
            <Btn
              kind="sv"
              label="Salvar"
              onPress={() => {
                if (psv()) setMode("l");
              }}
            />
          </Actions>
        </>
      )}
    </Sheet>
  );
}
