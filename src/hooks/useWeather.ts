import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

const WEATHER_ICONS: Record<number, string> = {
  0: "weather-sunny",
  1: "weather-partly-cloudy",
  2: "weather-partly-cloudy",
  3: "weather-cloudy",
  45: "weather-fog",
  48: "weather-fog",
  51: "weather-partly-rainy",
  53: "weather-partly-rainy",
  55: "weather-partly-rainy",
  56: "weather-rainy",
  57: "weather-rainy",
  61: "weather-rainy",
  63: "weather-rainy",
  65: "weather-rainy",
  66: "weather-rainy",
  67: "weather-rainy",
  71: "weather-snowy",
  73: "weather-snowy",
  75: "weather-snowy",
  77: "weather-snowy",
  80: "weather-partly-rainy",
  81: "weather-rainy",
  82: "weather-lightning-rainy",
  85: "weather-snowy",
  86: "weather-snowy",
  95: "weather-lightning-rainy",
  96: "weather-lightning-rainy",
  99: "weather-lightning-rainy",
};

type Weather = { e: string; t: number };

export default function useWeather() {
  const [weather, setWeather] = useState<Weather | false | null>(null);
  const lastRequest = useRef(0);

  useEffect(() => {
    const load = (force = false) => {
      if (!force && Date.now() - lastRequest.current < 60000) return;
      lastRequest.current = Date.now();
      fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=-24.25&longitude=-52.78&current=temperature_2m,weather_code,is_day&timezone=auto",
      )
        .then((response) => {
          if (!response.ok) throw new Error("Weather request failed");
          return response.json();
        })
        .then((data) => {
          const current = data.current;
          let icon = WEATHER_ICONS[current.weather_code] || "thermometer";
          if (!current.is_day && current.weather_code < 2)
            icon = "weather-night";
          setWeather({ e: icon, t: Math.round(current.temperature_2m) });
        })
        .catch(() => setWeather((previous) => previous || false));
    };

    load(true);
    const interval = setInterval(() => load(true), 5 * 60 * 1000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") load();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return weather;
}
