import { useApp } from "@/store/RotinaProvider";
import { useTheme } from "@/theme";
import { MN, WDL, dk, fromKey, pd, weekOrder } from "@/utils/rotina";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Icon from "../Icon";
import { Actions, Btn, Sheet, Txt } from "../ui";

export default function CalendarSheet() {
  const A = useApp(),
    c = useTheme(),
    cal = A.cal;
  const [v, setV] = useState<"d" | "m" | "y">("d"),
    [y, setY] = useState(2026),
    [mo, setMo] = useState(0);
  useEffect(() => {
    if (cal) {
      const d = fromKey(cal.value);
      setV("d");
      setY(d.getFullYear());
      setMo(d.getMonth());
    }
  }, [cal]);
  const pick = (k: string) => {
    cal?.onPick(k);
    A.closeCal();
  };
  const step = (d: number) => {
    if (v === "d") {
      let nm = mo + d,
        ny = y;
      if (nm < 0) {
        nm = 11;
        ny--;
      } else if (nm > 11) {
        nm = 0;
        ny++;
      }
      setMo(nm);
      setY(ny);
    } else setY(y + (v === "m" ? d : 12 * d));
  };
  const td = dk(new Date()),
    sk = cal?.value ?? "",
    y0 = y - (y % 12);
  const title =
    v === "d"
      ? MN[mo] + " " + y
      : v === "m"
        ? String(y)
        : y0 + " – " + (y0 + 11);
  const cell = (
    key: string | number,
    label: string | number,
    on: boolean,
    onPress: () => void,
    extra: object = {},
    w = "33.33%",
  ) => (
    <View key={key} style={{ width: w as any, padding: 4 }}>
      <Pressable
        onPress={onPress}
        style={[
          {
            height: 48,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: on ? c.ac : "transparent",
          },
          extra,
        ]}
      >
        <Txt style={{ color: on ? c.ak : c.tx, textTransform: "capitalize" }}>
          {label}
        </Txt>
      </Pressable>
    </View>
  );
  const first = (new Date(y, mo, 1).getDay() - A.settings.weekStart + 7) % 7,
    n = new Date(y, mo + 1, 0).getDate();
  return (
    <Sheet visible={!!cal} onClose={A.closeCal}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Pressable onPress={() => step(-1)} hitSlop={10}>
          <View style={{ paddingHorizontal: 10 }}>
            <Icon name="chevron-left" size={28} />
          </View>
        </Pressable>
        <Pressable
          onPress={() => setV(v === "d" ? "m" : v === "m" ? "y" : "d")}
        >
          <Txt
            style={{
              fontSize: 18,
              fontWeight: "700",
              textTransform: "capitalize",
            }}
          >
            {title}
          </Txt>
        </Pressable>
        <Pressable onPress={() => step(1)} hitSlop={10}>
          <View style={{ paddingHorizontal: 10 }}>
            <Icon name="chevron-right" size={28} />
          </View>
        </Pressable>
      </View>
      {v === "d" && (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {weekOrder(A.settings.weekStart).map((wd) => (
            <View
              key={"w" + wd}
              style={{
                width: "14.28%",
                alignItems: "center",
                paddingVertical: 4,
              }}
            >
              <Txt mu style={{ fontSize: 12 }}>
                {WDL[wd]}
              </Txt>
            </View>
          ))}
          {Array.from({ length: first }, (_, i) => (
            <View key={"b" + i} style={{ width: "14.28%" }} />
          ))}
          {Array.from({ length: n }, (_, i) => {
            const k = y + "-" + pd(mo + 1) + "-" + pd(i + 1);
            return (
              <View
                key={k}
                style={{
                  width: "14.28%",
                  alignItems: "center",
                  paddingVertical: 2,
                }}
              >
                <Pressable
                  onPress={() => pick(k)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: k === sk ? c.ac : "transparent",
                    borderWidth: k === td ? 2 : 0,
                    borderColor: c.cy,
                  }}
                >
                  <Txt style={{ color: k === sk ? c.ak : c.tx }}>{i + 1}</Txt>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
      {v === "m" && (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {MN.map((nm, i) =>
            cell(
              i,
              nm.slice(0, 3),
              !!cal &&
                fromKey(cal.value).getMonth() === i &&
                fromKey(cal.value).getFullYear() === y,
              () => {
                setMo(i);
                setV("d");
              },
            ),
          )}
        </View>
      )}
      {v === "y" && (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {Array.from({ length: 12 }, (_, i) =>
            cell(
              i,
              y0 + i,
              !!cal && fromKey(cal.value).getFullYear() === y0 + i,
              () => {
                setY(y0 + i);
                setV("m");
              },
            ),
          )}
        </View>
      )}
      <Actions>
        <Btn label="Hoje" onPress={() => pick(td)} />
        <Btn kind="sv" label="Fechar" onPress={A.closeCal} />
      </Actions>
    </Sheet>
  );
}
