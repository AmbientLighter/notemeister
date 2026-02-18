import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import { Gauge, Zap } from 'lucide-react';
import Dropdown from '@/components/common/Dropdown';

import { useStandardStore } from '@/store/useStandardStore';
import { useScrollingStore } from '@/store/useScrollingStore';

const TempoSelector: React.FC = () => {
  const { t } = useTranslations();
  const gameMode = useGameStore((state) => state.settings.gameMode);

  const standardTempo = useStandardStore((state) => state.settings.tempo);
  const updateStandardSettings = useStandardStore((state) => state.updateSettings);

  // For scrolling mode, we can add tempo support later or keep it separate if needed.
  // For now, let's assume standard mode isolation is the priority.
  const isScrolling = gameMode === 'scrolling' || gameMode === 'demo';

  const tempos = [
    { id: 'slow', label: t.tempoSlow, icon: <Gauge className="w-5 h-5 text-emerald-500" /> },
    { id: 'normal', label: t.tempoNormal, icon: <Gauge className="w-5 h-5 text-blue-500" /> },
    { id: 'fast', label: t.tempoFast, icon: <Zap className="w-5 h-5 text-rose-500" /> },
  ] as const;

  return (
    <Dropdown
      label={t.selectTempo}
      options={tempos}
      value={isScrolling ? 'normal' : standardTempo}
      onChange={(val) => {
        if (!isScrolling) {
          updateStandardSettings({ tempo: val });
        }
      }}
      className="mb-8"
    />
  );
};

export default TempoSelector;
