import en from "../messages/en.json";
import zh from "../messages/zh.json";

export type Locale = "zh-CN" | "en-US";

export const defaultLocale: Locale =
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "en-US" ? "en-US" : "zh-CN";

export const dictionaries = {
  "zh-CN": zh,
  "en-US": en,
} as const;

export type Dictionary = (typeof dictionaries)["zh-CN"];

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
