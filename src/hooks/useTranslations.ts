import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '../types';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../constants';

const detectLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0] as Language;
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';
};

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: detectLanguage(),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'note-meister-language',
    }
  )
);

export const useTranslations = () => {
  const { language, setLanguage } = useLanguageStore();
  return {
    t: TRANSLATIONS[language],
    language,
    setLanguage,
  };
};
