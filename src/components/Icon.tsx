import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/theme";

export default function Icon({ name, size = 20, color }: { name: string; size?: number; color?: string }) {
  const c = useTheme();
  return <MaterialCommunityIcons name={name as any} size={size} color={color ?? c.tx} />;
}
