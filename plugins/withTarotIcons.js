/* global __dirname */
// Config plugin: registra um ícone de launcher por arcano (activity-alias + recursos) no Android.
// Os PNGs vêm de assets/tarot-icons (gerados a partir dos desenhos em src/utils/tarot.ts).
// O ícone ativo é trocado em tempo de execução pelo módulo local modules/rotina-icon.
const { withAndroidManifest, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "assets", "tarot-icons");
const { keys: KEYS, default: DEFAULT } = JSON.parse(
  fs.readFileSync(path.join(DIR, "index.json"), "utf8"),
);

const withManifest = (config) =>
  withAndroidManifest(config, (cfg) => {
    const pkg = cfg.android?.package;
    if (!pkg) throw new Error("withTarotIcons: defina android.package no app.json");
    const app = cfg.modResults.manifest.application[0];
    const main = app.activity.find((a) => a.$["android:name"] === ".MainActivity");
    if (!main) throw new Error("withTarotIcons: .MainActivity não encontrada");
    // o filtro MAIN/LAUNCHER passa para os aliases (a MainActivity só mantém os links profundos)
    main["intent-filter"] = (main["intent-filter"] || []).filter(
      (f) => !(f.action || []).some((a) => a.$["android:name"] === "android.intent.action.MAIN"),
    );
    app["activity-alias"] = KEYS.map((k) => ({
      $: {
        "android:name": `${pkg}.tarot.${k}`,
        "android:targetActivity": ".MainActivity",
        "android:enabled": k === DEFAULT ? "true" : "false",
        "android:exported": "true",
        "android:icon": `@mipmap/ic_tarot_${k}`,
        "android:roundIcon": `@mipmap/ic_tarot_${k}`,
        "android:label": "@string/app_name",
      },
      "intent-filter": [
        {
          action: [{ $: { "android:name": "android.intent.action.MAIN" } }],
          category: [{ $: { "android:name": "android.intent.category.LAUNCHER" } }],
        },
      ],
    }));
    return cfg;
  });

const withResources = (config) =>
  withDangerousMod(config, [
    "android",
    async (cfg) => {
      const res = path.join(cfg.modRequest.platformProjectRoot, "app", "src", "main", "res");
      for (const d of ["drawable-nodpi", "mipmap-nodpi", "mipmap-anydpi-v26"])
        fs.mkdirSync(path.join(res, d), { recursive: true });
      fs.copyFileSync(path.join(DIR, "bg.png"), path.join(res, "drawable-nodpi", "ic_tarot_bg.png"));
      for (const k of KEYS) {
        fs.copyFileSync(path.join(DIR, `${k}_fg.png`), path.join(res, "drawable-nodpi", `ic_tarot_${k}_fg.png`));
        fs.copyFileSync(path.join(DIR, `${k}_legacy.png`), path.join(res, "mipmap-nodpi", `ic_tarot_${k}.png`));
        fs.writeFileSync(
          path.join(res, "mipmap-anydpi-v26", `ic_tarot_${k}.xml`),
          `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="@drawable/ic_tarot_bg"/>\n  <foreground android:drawable="@drawable/ic_tarot_${k}_fg"/>\n</adaptive-icon>\n`,
        );
      }
      return cfg;
    },
  ]);

module.exports = (config) => withResources(withManifest(config));
