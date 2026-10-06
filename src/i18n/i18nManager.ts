import { SupportedLanguage, TranslationDictionary } from '../types';
import { translations } from './translations';

type LanguageChangeListener = (lang: SupportedLanguage, dict: TranslationDictionary) => void;

class I18nManager {
  private currentLanguage: SupportedLanguage = 'en';
  private listeners: Set<LanguageChangeListener> = new Set();
  private readonly STORAGE_KEY = 'rogue_portfolio_lang';

  constructor() {
    this.currentLanguage = this.detectInitialLanguage();
    document.documentElement.lang = this.currentLanguage;
  }

  private detectInitialLanguage(): SupportedLanguage {
    // 1. Check previously saved choice
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY) as SupportedLanguage | null;
      if (saved && ['en', 'es', 'fr', 'pt'].includes(saved)) {
        return saved;
      }
    } catch {
      // LocalStorage access may be restricted
    }

    // 2. Auto-detect from browser/system language
    const languages = navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || 'en'];

    for (const rawLang of languages) {
      const lang = rawLang.toLowerCase();
      if (lang.startsWith('es')) return 'es';
      if (lang.startsWith('fr')) return 'fr';
      if (lang.startsWith('pt')) return 'pt';
      if (lang.startsWith('en')) return 'en';
    }

    return 'en';
  }

  public getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  public getDictionary(): TranslationDictionary {
    return translations[this.currentLanguage];
  }

  public setLanguage(lang: SupportedLanguage): void {
    if (!['en', 'es', 'fr', 'pt'].includes(lang) || lang === this.currentLanguage) {
      return;
    }

    this.currentLanguage = lang;
    document.documentElement.lang = lang;

    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch {
      // Ignore if localStorage unavailable
    }

    const dict = this.getDictionary();
    this.listeners.forEach((listener) => {
      try {
        listener(lang, dict);
      } catch (err) {
        console.error('Error in i18n subscriber:', err);
      }
    });
  }

  public subscribe(listener: LanguageChangeListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state
    listener(this.currentLanguage, this.getDictionary());
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const i18n = new I18nManager();
