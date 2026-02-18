import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import Dropdown from '@/components/common/Dropdown';

import { useStandardStore } from '@/store/useStandardStore';

const ClefSelector: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const handleClefChange = useGameStore((state) => state.handleClefChange);
  const initializeStandard = useStandardStore((state) => state.initializeSettings);

  const options = [
    { id: 'treble', label: t.trebleClef, icon: <span className="text-xl">𝄞</span> },
    { id: 'bass', label: t.bassClef, icon: <span className="text-xl">𝄢</span> },
  ] as const;

  return (
    <Dropdown
      label={t.selectClef}
      options={options}
      value={settings.clef}
      onChange={(val) => {
        handleClefChange(val);
        initializeStandard();
      }}
      className="mb-8"
    />
  );
};

export default ClefSelector;
