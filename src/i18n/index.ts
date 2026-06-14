import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import zh from "./locales/zh.json";

export const DEFAULT_LANGUAGE: Language = "zh";

export const LANGUAGES: Array<{ id: Language; label: string; shortLabel: string }> = [
  { id: "zh", label: "中文", shortLabel: "中" },
  { id: "en", label: "English", shortLabel: "EN" },
];

export type Language = "zh" | "en";

i18next.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18next;
