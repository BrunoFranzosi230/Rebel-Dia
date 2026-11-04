import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function useSave(key: string, value: unknown, ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const timeout = setTimeout(
      () => AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {}),
      400,
    );
    return () => clearTimeout(timeout);
  }, [key, ready, value]);
}
