import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { useTranslations } from '../hooks/useTranslations';

const LanguagePicker: React.FC = () => {
  const { language, setLanguage } = useTranslations();

  return (
    <div className="flex justify-center gap-2 mb-8 animate-fade-in-down">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 transform active:scale-95 ${
            language === lang
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguagePicker;
