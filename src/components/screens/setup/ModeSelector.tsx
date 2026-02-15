import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import { List, Play } from 'lucide-react';
import Dropdown from '@/components/common/Dropdown';

const ModeSelector: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const modes = [
    { id: 'standard', label: t.modeStandard, icon: <List className="w-5 h-5 text-blue-500" /> },
    { id: 'scrolling', label: t.modeScrolling, icon: <Play className="w-5 h-5 text-indigo-500" /> },
  ] as const;

  return (
    <Dropdown
      label={t.gameMode}
      options={modes}
      value={settings.gameMode}
      onChange={(val) => updateSettings({ gameMode: val as any })}
      className="mb-8"
    />
  );
};

export default ModeSelector;
