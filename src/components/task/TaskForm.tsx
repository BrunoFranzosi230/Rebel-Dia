import { useApp } from "@/store/RotinaProvider";
import { hsl, useTheme } from "@/theme";
import {
    HUE,
    contrastOf,
    hueOf,
    iconName,
    lightOf,
    startFrom,
    REP,
    Rep,
    Sub,
    UN,
    WDL,
    weekOrder,
    fromKey,
    hm,
    nlab,
} from "@/utils/rotina";
import { FormOpts } from "@/utils/types";
import { useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import Icon from "../Icon";
import StylePicker from "./StylePicker";
import Dropdown, { type DropdownOption } from "../Dropdown";
import TimeRange, { TimeField } from "../timeline/TimeRange";
import { Actions, Btn, Chip, Field, Label, Sheet, SubList, Txt } from "../ui";

// modos do "Quando?"
const WHEN: DropdownOption[] = [
  { key: "t", label: "Com horário", icon: "clock-outline" },
  { key: "d", label: "Dia inteiro", icon: "calendar-today" },
  { key: "i", label: "Inbox", icon: "inbox-outline" },
];
const nowMin = () => {
  const n = new Date();
  return Math.min(1435, Math.round((n.getHours() * 60 + n.getMinutes()) / 5) * 5);
};

function Body({ f }: { f: FormOpts }) {
  const A = useApp(),
    c = useTheme(),
    x = f.task,
    dd = A.ds(A.sel).d;
  const cq = f.ctx ? A.PA.find((q) => q.id === f.ctx) : null;
  const inPath = !!(f.ctx || (x && A.PA.some((q) => q.t.includes(x.id))));
  const s0 = x ? x.s : cq ? { m: "07:00", t: "13:00", n: "19:00" }[cq.per] : "";
  const e0 = x ? x.e : "";
  const nw = !x;
  const [t, setT] = useState(x ? x.t : (f.pre?.t ?? ""));
  const [desc, setDesc] = useState(x ? x.n || "" : (f.pre?.n ?? ""));
  const mapSu = (u: Sub[]) =>
    u.map((z) => ({
      id: z.id,
      t: z.t,
      d: x ? !!dd[x.id + "/" + z.id] : !!z.d,
    }));
  const [su, setSu] = useState<Sub[]>(
    x ? mapSu(x.u || []) : mapSu(f.pre?.u || []),
  );
  const [nts, setNts] = useState<number[]>(
    x ? (x.nt || []).filter((v) => v > 0) : [],
  );
  const [nin, setNin] = useState(
    x ? (x.ni !== undefined ? x.ni : x.nt ? x.nt.includes(0) : true) : true,
  );
  const [nA, setNA] = useState("10"),
    [nU, setNU] = useState(1);
  const [tm, setTm] = useState(s0 ? hmM(s0) : nowMin());
  // fim igual ao início = sem horário de fim; tarefa nova começa com 15 min
  const [te, setTe] = useState(
    s0 && e0 ? hmM(e0) : Math.min(1439, tm + (nw ? 15 : 0)),
  );
  const [toInbox, setToInbox] = useState(false),
    [allDay, setAllDay] = useState(!!x?.ad),
    [nas, setNas] = useState<number[]>(x?.na ?? []), // dia inteiro: horários dos avisos
    [pickT, setPickT] = useState(540);
  const [rep, setRep] = useState<Rep>(
    x ? x.r : { f: "o", n: 1, w: [], a: startFrom(A.sel) },
  );
  const [ic, setIc] = useState(x ? iconName(x.i) : "star-outline"),
    [hue, setHue] = useState(x ? hueOf(x) : HUE[5]),
    [light, setLight] = useState(x ? lightOf(x) : 60),
    [picker, setPicker] = useState(false);
  const [err, setErr] = useState("");
  function hmM(h: string) {
    const p = h.split(":");
    return +p[0] * 60 + +p[1];
  }

  const save = () => {
    const tt = t.trim();
    if (!tt) return setErr("Preencha o título.");
    const us = su
      .filter((u) => u.t.trim())
      .map((u) => ({ id: u.id, t: u.t.trim(), d: !!u.d }));
    if (toInbox) {
      if (x) A.rmT(x.id);
      A.setIB((p) => [
        { id: "i" + Date.now(), t: tt, n: desc.trim(), d: false, u: us },
        ...p.filter((z) => z.id !== f.ibSrc),
      ]);
      A.closeForm();
      A.toast("Enviada para o Inbox");
      return;
    }
    if (rep.f === "w" && !rep.w.length)
      return setErr("Escolha ao menos um dia da semana.");
    const s = allDay ? "00:00" : hm(tm),
      e = !allDay && te > tm ? hm(te) : "";
    const r: Rep = {
      f: rep.f,
      n: Math.max(1, rep.n || 1),
      w: [...rep.w].sort(),
      a: rep.a || A.sel,
    };
    const u2 = us.map(({ id, t }) => ({ id, t }));
    let tid: string;
    if (x) {
      tid = x.id;
      A.setTasks((p) =>
        p.map((z) =>
          z.id === x.id
            ? {
                ...z,
                t: tt,
                s,
                e,
                i: ic,
                c: HUE.indexOf(hue) >= 0 ? HUE.indexOf(hue) : (x?.c ?? 5),
                ch: hue,
                cl: light,
                r,
                n: desc.trim(),
                u: u2,
                nt: [...nts],
                ni: nin,
                ad: allDay,
                na: allDay ? [...nas] : [],
              }
            : z,
        ),
      );
    } else {
      tid = "x" + Date.now();
      const nt = {
        id: tid,
        t: tt,
        s,
        e,
        i: ic,
        c: HUE.indexOf(hue) >= 0 ? HUE.indexOf(hue) : 5,
                ch: hue,
                cl: light,
        st: startFrom(A.sel),
        r,
        n: desc.trim(),
        u: u2,
        nt: [...nts],
        ni: nin,
        ad: allDay,
        na: allDay ? [...nas] : [],
        g: f.ctx ? true : undefined,
      };
      if (f.ctx)
        A.setPA((p) =>
          p.map((q) => (q.id === f.ctx ? { ...q, t: [...q.t, tid] } : q)),
        );
      A.setTasks((p) => [...p, nt]);
    }
    A.upDay(A.sel, (sd) => {
      Object.keys(sd.d).forEach((q) => {
        if (q.startsWith(tid + "/")) delete sd.d[q];
      });
      us.forEach((u) => {
        if (u.d) sd.d[tid + "/" + u.id] = true;
      });
    });
    if (f.ibSrc) A.setIB((p) => p.filter((z) => z.id !== f.ibSrc));
    A.closeForm();
  };

  return (
    <>
      <Txt style={{ fontSize: 20, fontWeight: "700" }}>
        {x ? "Editar tarefa" : "Nova tarefa"}
      </Txt>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
        {!toInbox && (
          <Pressable
            accessibilityLabel="Escolher ícone e cor"
            onPress={() => {
              Keyboard.dismiss();
              setPicker(true);
            }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: hsl(hue, 60, light),
            }}
          >
            <Icon name={ic} size={26} color={contrastOf(light)} />
          </Pressable>
        )}
        <View style={{ flex: 1, gap: 5 }}>
          <Label>Título</Label>
          <Field
            value={t}
            onChangeText={setT}
            maxLength={60}
            autoFocus={!x}
            style={{ fontSize: 20, fontWeight: "600" }}
          />
        </View>
      </View>
      <View style={{ gap: 5 }}>
        <Label>Descrição</Label>
        <Field
          value={desc}
          onChangeText={setDesc}
          multiline
          maxLength={500}
          placeholder="Opcional"
          style={{ minHeight: 60, textAlignVertical: "top" }}
        />
      </View>
      <SubList
        list={su}
        setList={setSu}
        onToggle={(i, v) => {
          if (x)
            A.upDay(A.sel, (d) => {
              const k = x.id + "/" + su[i].id;
              if (v) d.d[k] = true;
              else delete d.d[k];
            });
        }}
      />
      {!toInbox && !allDay && (
        <>
          <Label>Notificações</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Pressable
              onPress={() => setNin(!nin)}
              style={{
                backgroundColor: c.bg,
                borderRadius: 16,
                paddingVertical: 6,
                paddingHorizontal: 12,
                opacity: nin ? 1 : 0.55,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Icon
                  name={nin ? "bell-outline" : "bell-off-outline"}
                  size={16}
                />
                <Txt
                  style={{
                    fontSize: 14,
                    textDecorationLine: nin ? "none" : "line-through",
                  }}
                >
                  No início
                </Txt>
                {nin && <Icon name="close" size={14} color={c.mu} />}
              </View>
            </Pressable>
            {[...nts]
              .sort((a, b) => a - b)
              .map((v) => (
                <Pressable
                  key={v}
                  onPress={() => setNts(nts.filter((z) => z !== v))}
                  style={{
                    backgroundColor: c.bg,
                    borderRadius: 16,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Icon name="bell-outline" size={16} />
                    <Txt style={{ fontSize: 14 }}>{nlab(v)}</Txt>
                    <Icon name="close" size={14} color={c.mu} />
                  </View>
                </Pressable>
              ))}
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Field
              style={{ width: 70 }}
              keyboardType="number-pad"
              value={nA}
              onChangeText={setNA}
              maxLength={3}
            />
            {[
              ["min", 1],
              ["h", 60],
              ["dias", 1440],
            ].map(([l, u]) => (
              <Chip
                key={l}
                label={String(l)}
                on={nU === u}
                onPress={() => setNU(+u)}
              />
            ))}
            <Chip
              label="+ Adicionar"
              onPress={() => {
                const v = Math.max(1, Math.round(+nA || 1)) * nU;
                if (!nts.includes(v)) setNts([...nts, v]);
              }}
            />
          </View>
        </>
      )}
      {allDay && (
        <>
          <Label>Notificações</Label>
          {nas.length === 0 && (
            <Txt mu style={{ fontSize: 14 }}>
              Nenhum aviso. Escolha um horário e adicione.
            </Txt>
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[...nas]
              .sort((a, b) => a - b)
              .map((v) => (
                <Pressable
                  key={v}
                  onPress={() => setNas(nas.filter((z) => z !== v))}
                  style={{
                    backgroundColor: c.bg,
                    borderRadius: 16,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                  >
                    <Icon name="bell-outline" size={16} />
                    <Txt style={{ fontSize: 14 }}>{hm(v)}</Txt>
                    <Icon name="close" size={14} color={c.mu} />
                  </View>
                </Pressable>
              ))}
          </View>
          <View style={{ flexDirection: "row" }}>
            <TimeField
              label="Horário do aviso"
              minutes={pickT}
              onChange={setPickT}
            />
          </View>
          <View style={{ alignItems: "flex-start" }}>
            <Chip
              label={"+ Avisar às " + hm(pickT)}
              onPress={() => {
                if (!nas.includes(pickT)) setNas([...nas, pickT]);
              }}
            />
          </View>
        </>
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Label>Quando?</Label>
        <Dropdown
          value={toInbox ? "i" : allDay ? "d" : "t"}
          options={WHEN}
          onSelect={(key) => {
            setToInbox(key === "i");
            setAllDay(key === "d");
          }}
        />
      </View>
      {toInbox ? (
        <Txt mu style={{ fontSize: 15 }}>
          Esta tarefa vai para o Inbox, sem horário.
        </Txt>
      ) : (
        <>
          {allDay ? (
            <Txt mu style={{ fontSize: 15 }}>
              Dura o dia inteiro, sem horário. Aparece no topo da lista do dia.
            </Txt>
          ) : (
            <TimeRange
              start={tm}
              end={te}
              onChange={(a, b) => {
                setTm(a);
                setTe(b);
              }}
            />
          )}
          {!inPath && (
            <View style={{ gap: 5 }}>
              <Label>{rep.f === "o" ? "Data" : "Começa em"}</Label>
              <Pressable
                onPress={() =>
                  A.openCal({
                    value: rep.a,
                    onPick: (k) => setRep((r) => ({ ...r, a: k })),
                  })
                }
              >
                <Field
                  editable={false}
                  pointerEvents="none"
                  value={fromKey(rep.a).toLocaleDateString("pt-BR")}
                />
              </Pressable>
            </View>
          )}
          {!inPath && (
            <View style={{ gap: 12 }}>
              <Label>Repetir</Label>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {REP.map(([k, l]) => (
                  <Chip
                    key={k}
                    label={l}
                    on={rep.f === k}
                    onPress={() =>
                      setRep((r) => ({
                        ...r,
                        f: k,
                        w:
                          k === "w" && !r.w.length
                            ? [fromKey(r.a).getDay()]
                            : r.w,
                      }))
                    }
                  />
                ))}
              </View>
              {rep.f !== "o" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Label>A cada</Label>
                  <Field
                    style={{ width: 70 }}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={rep.n ? String(rep.n) : ""}
                    onChangeText={(v) =>
                      setRep({ ...rep, n: parseInt(v) || 0 })
                    }
                  />
                  <Txt>{UN[rep.f][rep.n === 1 ? 0 : 1]}</Txt>
                </View>
              )}
              {rep.f === "w" && (
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {weekOrder(A.settings.weekStart).map((i) => {
                    const l = WDL[i];
                    const on = rep.w.includes(i);
                    return (
                      <Pressable
                        key={i}
                        onPress={() =>
                          setRep({
                            ...rep,
                            w: on
                              ? rep.w.filter((z) => z !== i)
                              : [...rep.w, i],
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
            </View>
          )}
        </>
      )}
      <StylePicker
        visible={picker}
        icon={ic}
        hue={hue}
        light={light}
        onIcon={setIc}
        onColor={(h, l) => {
          setHue(h);
          setLight(l);
        }}
        onClose={() => setPicker(false)}
      />
      {!!err && <Txt style={{ color: c.dg, fontSize: 14 }}>{err}</Txt>}
      <Actions>
        {x && <Btn kind="dl" label="Excluir" onPress={() => A.setDel(x)} />}
        <Btn label="Cancelar" onPress={A.closeForm} />
        <Btn kind="sv" label="Salvar" onPress={save} />
      </Actions>
    </>
  );
}

export default function TaskForm() {
  const A = useApp();
  return (
    <Sheet visible={!!A.form} onClose={A.closeForm}>
      {A.form ? <Body key={A.form.id} f={A.form} /> : null}
    </Sheet>
  );
}
