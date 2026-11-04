import useRoutineState from "@/hooks/useRoutineState";
import React, { createContext, useContext } from "react";

export type { CalOpts, FormOpts } from "@/utils/types";
export type AppCtx = ReturnType<typeof useRoutineState>;
const Ctx = createContext<AppCtx>(null as unknown as AppCtx);
export const useApp = () => useContext(Ctx);
export function RotinaProvider({ children }: { children: React.ReactNode }) {
  const v = useRoutineState();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
