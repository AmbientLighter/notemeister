import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import Dropdown from '@/components/common/Dropdown';
import type { Instrument } from '@/types';

const InstrumentSelector: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const instruments = [
    { id: 'piano', label: t.instrumentPiano, icon: <span className="text-lg">🎹</span> },
    { id: 'guitar', label: t.instrumentGuitar, icon: <span className="text-lg">🎸</span> },
    { id: 'flute', label: t.instrumentFlute, icon: <span className="text-lg">🎷</span> },
    { id: 'silence', label: t.instrumentSilence, icon: <span className="text-lg">🔇</span> },
  ] as const;

  return (
    <Dropdown
      label={t.selectInstrument}
      options={instruments}
      value={settings.instrument}
      onChange={(val) => updateSettings({ instrument: val as Instrument })}
      className="mb-8"
    />
  );
};

export default InstrumentSelector;
