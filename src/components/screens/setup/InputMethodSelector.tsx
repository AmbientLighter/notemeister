import React from 'react';
import { Keyboard, Mic, Usb, Music2 } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import type { InputMode } from '@/types';
import Dropdown from '@/components/common/Dropdown';

const InputMethodSelector: React.FC = () => {
  const { t } = useTranslations();
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const methods = [
    {
      id: 'keyboard',
      icon: <Keyboard className="w-5 h-5 text-amber-500" />,
      label: t.inputModeKeyboard,
    },
    { id: 'midi', icon: <Usb className="w-5 h-5 text-blue-500" />, label: t.inputModeMidi },
    {
      id: 'microphone',
      icon: <Mic className="w-5 h-5 text-rose-500" />,
      label: t.inputModeMicrophone,
    },
    {
      id: 'virtual_keyboard',
      icon: <Music2 className="w-5 h-5 text-purple-500" />,
      label: t.inputModeVirtualKeyboard,
    },
  ] as const;

  return (
    <Dropdown
      label={t.selectInputMode}
      options={methods}
      value={settings.inputMode}
      onChange={(val) => updateSettings({ inputMode: val })}
      className="mb-8"
    />
  );
};

export default InputMethodSelector;
