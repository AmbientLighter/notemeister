import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import { Gauge, Zap } from 'lucide-react';
import Dropdown from '@/components/common/Dropdown';

const TempoSelector: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const tempos = [
    { id: 'slow', label: t.tempoSlow, icon: <Gauge className="w-5 h-5 text-emerald-500" /> },
    { id: 'normal', label: t.tempoNormal, icon: <Gauge className="w-5 h-5 text-blue-500" /> },
    { id: 'fast', label: t.tempoFast, icon: <Zap className="w-5 h-5 text-rose-500" /> },
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
