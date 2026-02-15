import React from 'react';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/constants';
import { useTranslations } from '@/hooks/useTranslations';
import Dropdown from '@/components/common/Dropdown';
import type { Language } from '@/types';

const LanguagePicker: React.FC = () => {
  const { language, setLanguage, t } = useTranslations();

  const options = SUPPORTED_LANGUAGES.map((lang) => ({
    id: lang,
    label: LANGUAGE_NAMES[lang],
  }));

  return (
    <Dropdown
      label={t.selectLanguage}
      options={options}
      value={language}
      onChange={(val) => setLanguage(val as Language)}
      className="mb-8"
    />
  );
};

export default LanguagePicker;
