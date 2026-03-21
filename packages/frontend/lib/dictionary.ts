import en from '../messages/en.json';
import zh from '../messages/zh.json';

export type Locale = 'zh-CN' | 'en-US';

export const dictionaries = {
  'zh-CN': zh,
  'en-US': en
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
