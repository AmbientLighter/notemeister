import React from 'react';
import { Keyboard, Mic, Usb, Music2, Speech } from 'lucide-react';
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
      id: 'keyboard' as const,
      icon: <Keyboard className="w-5 h-5 text-amber-500" />,
      label: t.inputModeKeyboard,
    },
    {
      id: 'midi' as const,
      icon: <Usb className="w-5 h-5 text-blue-500" />,
      label: t.inputModeMidi,
    },
    {
      id: 'microphone' as const,
      icon: <Mic className="w-5 h-5 text-rose-500" />,
      label: t.inputModeMicrophone,
    },
    {
      id: 'voice' as const,
      icon: <Speech className="w-5 h-5 text-emerald-500" />,
      label: t.inputModeVoice,
    },
    {
      id: 'virtual_keyboard' as const,
      icon: <Music2 className="w-5 h-5 text-purple-500" />,
      label: t.inputModeVirtualKeyboard,
    },
  ];

  return (
    <Dropdown<InputMode>
      label={t.selectInputMode}
      options={methods}
      value={settings.inputMode}
      onChange={(val) => updateSettings({ inputMode: val })}
      className="mb-8"
    />
  );
};

export default InputMethodSelector;
