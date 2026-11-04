import { useApp } from "@/store/RotinaProvider";
import { hsl, useTheme } from "@/theme";
import { contrastOf, hueOf, iconName, lightOf, startFrom } from "@/utils/rotina";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Icon from "../Icon";
import { Check, Sheet, Txt } from "../ui";

export function TaskView() {
  const A = useApp(),
    c = useTheme(),
    v = A.view,
    [vc, setVc] = useState(false);
  useEffect(() => setVc(false), [v]);
  const inbox = v?.kind === "i";
  const x: any = v
    ? inbox
      ? A.IB.find((z) => z.id === v.id)
      : A.tasks.find((z) => z.id === v.id)
    : null;
  const k = A.sel,
    day = A.ds(k).d,
    on = x ? (inbox ? x.d : !!day[x.id]) : false;
  const close = () => A.setView(null);
  const act = (a: "ok" | "del" | "dup" | "ed") => {
    if (!x) return;
    if (inbox) {
      if (a === "ed") {
        close();
        A.setIbEdit(x.id);
      }
      if (a === "ok") {
        A.setIB((p) => p.map((z) => (z.id === x.id ? { ...z, d: !z.d } : z)));
        close();
      }
      if (a === "dup") {
        const n0 = Date.now();
        A.setIB((p) => [
          {
            ...x,
            id: "i" + n0,
            d: false,
            u: (x.u || []).map((u: any, i: number) => ({
              id: "u" + n0 + i,
              t: u.t,
              d: false,
            })),
          },
          ...p,
        ]);
        close();
      }
      if (a === "del") {
        if (!vc) {
          setVc(true);
          setTimeout(() => setVc(false), 3000);
          return;
        }
        A.setIB((p) => p.filter((z) => z.id !== x.id));
        close();
      }
      return;
    }
    if (a === "ed") {
      close();
      A.openForm({ task: x });
    }
    if (a === "ok") {
      A.upDay(k, (s) => {
        s.d[x.id] = !s.d[x.id];
      });
      close();
    }
    if (a === "dup") {
      const n0 = Date.now(),
        cid = "x" + n0;
      A.setTasks((p) => [
        ...p,
        {
          ...x,
          id: cid,
          st: startFrom(A.sel),
          u: (x.u || []).map((u: any, i: number) => ({
            id: "u" + n0 + i,
            t: u.t,
          })),
        },
      ]);
      A.setPA((p) =>
        p.map((q) => (q.t.includes(x.id) ? { ...q, t: [...q.t, cid] } : q)),
      );
      close();
    }
    if (a === "del") A.setDel(x);
  };
  const toggleSub = (u: any, val: boolean) => {
    if (inbox)
      A.setIB((p) =>
        p.map((z) =>
          z.id === x.id
            ? {
                ...z,
                u: (z.u || []).map((w) =>
                  w.id === u.id ? { ...w, d: val } : w,
                ),
              }
            : z,
        ),
      );
    else
      A.upDay(k, (s) => {
        const kk = x.id + "/" + u.id;
        if (val) s.d[kk] = true;
        else delete s.d[kk];
      });
  };
  const ico = (
    label: string,
    glyph: string,
    a: "ok" | "del" | "dup",
    danger?: boolean,
  ) => (
    <Pressable
      key={a}
      onPress={() => act(a)}
      style={{
        flex: 1,
        alignItems: "center",
        gap: 8,
        paddingVertical: 18,
        borderRadius: 18,
        backgroundColor: c.bt,
      }}
    >
      <Icon name={glyph} size={26} color={danger ? c.dg : c.tx} />
      <Txt style={{ fontSize: 17, color: danger ? c.dg : c.tx }}>{label}</Txt>
    </Pressable>
  );
  return (
    <Sheet visible={!!x} onClose={close}>
      {x && (
        <>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: inbox ? c.bt : hsl(hueOf(x), 60, lightOf(x)),
              }}
            >
              <Icon
                name={inbox ? "inbox-outline" : iconName(x.i)}
                size={24}
                color={inbox ? c.tx : contrastOf(lightOf(x))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 20, fontWeight: "700" }}>{x.t}</Txt>
              <Txt mu style={{ fontSize: 15 }}>
                {inbox ? "Inbox" : x.ad ? "Dia inteiro" : x.s + (x.e ? " – " + x.e : "")}
              </Txt>
            </View>
          </View>
          {!!x.n && <Txt mu>{x.n}</Txt>}
          <View>
            {(x.u || []).map((u: any) => {
              const d = inbox ? !!u.d : !!day[x.id + "/" + u.id];
              return (
                <Pressable
                  key={u.id}
                  onPress={() => toggleSub(u, !d)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: c.ln,
                  }}
                >
                  <Check on={d} onPress={() => toggleSub(u, !d)} />
                  <Txt>{u.t}</Txt>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {ico(on ? "Desmarcar" : "Concluir", "check-circle-outline", "ok")}
            {ico(
              inbox && vc ? "Confirmar?" : "Excluir",
              "trash-can-outline",
              "del",
              inbox && vc,
            )}
            {ico("Duplicar", "content-copy", "dup")}
          </View>
          <Pressable
            onPress={() => act("ed")}
            style={{
              flexDirection: "row",
              gap: 10,
              justifyContent: "center",
              alignItems: "center",
              padding: 18,
              borderRadius: 18,
              backgroundColor: c.bt,
            }}
          >
            <Icon name="pencil-outline" size={22} />
            <Txt style={{ fontSize: 20, fontWeight: "700" }}>Editar Tarefa</Txt>
          </Pressable>
        </>
      )}
    </Sheet>
  );
}

export function DeleteSheet() {
  const A = useApp(),
    c = useTheme(),
    x = A.del;
  const go = (a: "one" | "fut" | "all" | "no") => {
    if (!x) return;
    const k = A.sel;
    if (a !== "no") {
      if (a === "one")
        A.setTasks((p) =>
          p.map((z) =>
            z.id === x.id ? { ...z, xd: [...(z.xd || []), k] } : z,
          ),
        );
      else if (a === "fut")
        A.setTasks((p) =>
          p.map((z) =>
            z.id === x.id ? { ...z, eu: z.eu && z.eu < k ? z.eu : k } : z,
          ),
        );
      else A.rmT(x.id);
      A.setView(null);
      A.closeForm();
    }
    A.setDel(null);
  };
  const b = (l: string, a: "one" | "fut" | "all" | "no") => (
    <Pressable
      key={a}
      onPress={() => go(a)}
      style={{
        padding: 15,
        borderRadius: 16,
        backgroundColor: c.bg,
        alignItems: "center",
        marginTop: a === "no" ? 6 : 0,
      }}
    >
      <Txt
        style={{
          fontSize: 17,
          color: a === "no" ? c.tx : c.dg,
          fontWeight: a === "no" ? "600" : "400",
        }}
      >
        {l}
      </Txt>
    </Pressable>
  );
  return (
    <Sheet visible={!!x} onClose={() => A.setDel(null)}>
      <Txt style={{ fontSize: 20, fontWeight: "700" }}>Apagar tarefa</Txt>
      {b("Excluir essa tarefa", "one")}
      {b("Excluir as tarefas futuras", "fut")}
      {b("Excluir todas as tarefas", "all")}
      {b("Cancelar", "no")}
    </Sheet>
  );
}
