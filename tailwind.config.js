/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // o tema é controlado pelo app; em "media" o NativeWind lança erro na web
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
