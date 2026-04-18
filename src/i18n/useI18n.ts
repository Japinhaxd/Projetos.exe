import { useStore } from '../store/useStore';
import { TRANSLATIONS, type TranslationKey } from './translations';
import { formatCurrency } from '../lib/money';

/**
 * React hook that returns t() and the active locale helpers.
 * Re-renders automatically when the user changes language.
 */
export function useI18n() {
  const lang = useStore((s) => s.lang);
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['pt-BR'];

  function t(key: TranslationKey): string {
    return dict[key] ?? TRANSLATIONS['en-US'][key] ?? key;
  }

  function tc(cat: string): string {
    const k = `categories.${cat}` as TranslationKey;
    const translated = dict[k];
    return translated ?? cat;
  }

  function money(value: number): string {
    return formatCurrency(value, lang);
  }

  return { t, tc, money, lang };
}
