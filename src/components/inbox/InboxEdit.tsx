import { useApp } from "@/store/RotinaProvider";
import { useTheme } from "@/theme";
import { Inb, Sub } from "@/utils/rotina";
import { useState } from "react";
import { View } from "react-native";
import { Actions, Btn, Field, Label, Sheet, SubList, Txt } from "../ui";

const BLANK: Inb = { id: "", t: "", n: "", d: false };
// Mesma gaveta para criar ("new") e editar uma tarefa do Inbox
function Body({ x, isNew }: { x: Inb; isNew: boolean }) {
  const A = useApp(),
    c = useTheme(),
    [t, setT] = useState(x.t),
    [n, setN] = useState(x.n || ""),
    [u, setU] = useState<Sub[]>((x.u || []).map((z) => ({ ...z }))),
    [err, setErr] = useState("");
  const clean = () =>
    u
      .filter((z) => z.t.trim())
      .map((z) => ({ id: z.id, t: z.t.trim(), d: !!z.d }));
  const save = () => {
    const tt = t.trim();
    if (!tt) {
      setErr("Preencha o título.");
      return false;
    }
    if (isNew)
      A.setIB((p) => [
        { id: "i" + Date.now(), t: tt, n: n.trim(), d: false, u: clean() },
        ...p,
      ]);
    else
      A.setIB((p) =>
        p.map((z) =>
          z.id === x.id ? { ...z, t: tt, n: n.trim(), u: clean() } : z,
        ),
      );
    return true;
  };
  return (
    <>
      <Txt style={{ fontSize: 20, fontWeight: "700" }}>
        {isNew ? "Nova tarefa" : "Tarefa do Inbox"}
      </Txt>
      <View style={{ gap: 5 }}>
        <Label>Título</Label>
        <Field
          value={t}
          onChangeText={setT}
          maxLength={80}
          autoFocus={isNew}
          returnKeyType="done"
        />
      </View>
      <View style={{ gap: 5 }}>
        <Label>Descrição</Label>
        <Field
          value={n}
          onChangeText={setN}
          multiline
          maxLength={500}
          placeholder="Opcional"
          style={{ minHeight: 60, textAlignVertical: "top" }}
        />
      </View>
      <SubList list={u} setList={setU} />
      {!!err && <Txt style={{ color: c.dg, fontSize: 14 }}>{err}</Txt>}
      <Actions>
        {isNew ? (
          <Btn label="Cancelar" onPress={() => A.setIbEdit(null)} />
        ) : (
          <>
            <Btn
              kind="dl"
              label="Excluir"
              onPress={() => {
                A.setIB((p) => p.filter((z) => z.id !== x.id));
                A.setIbEdit(null);
              }}
            />
            <Btn
              label="Agendar"
              onPress={() => {
                if (!save()) return;
                A.setIbEdit(null);
                A.setTab("h");
                A.openForm({
                  ibSrc: x.id,
                  pre: { t: t.trim(), n: n.trim(), u: clean() },
                });
              }}
            />
          </>
        )}
        <Btn
          kind="sv"
          label="Salvar"
          onPress={() => {
            if (save()) A.setIbEdit(null);
          }}
        />
      </Actions>
    </>
  );
}
export default function InboxEdit() {
  const A = useApp(),
    isNew = A.ibEdit === "new",
    x = isNew ? BLANK : A.ibEdit ? A.IB.find((z) => z.id === A.ibEdit) : null;
  return (
    <Sheet visible={!!x} onClose={() => A.setIbEdit(null)}>
      {x ? <Body key={isNew ? "new" : x.id} x={x} isNew={isNew} /> : null}
    </Sheet>
  );
}
