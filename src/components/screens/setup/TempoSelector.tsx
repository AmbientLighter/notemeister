import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import Dropdown from '@/components/common/Dropdown';

const TempoSelector: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const tempos = [
    { id: 'slow', label: t.tempoSlow },
    { id: 'normal', label: t.tempoNormal },
    { id: 'fast', label: t.tempoFast },
  ] as const;

  return (
    <Dropdown
      label={t.selectTempo}
      options={tempos}
      value={settings.tempo}
      onChange={(val) => updateSettings({ tempo: val })}
      className="mb-8"
    />
  );
};

export default TempoSelector;
