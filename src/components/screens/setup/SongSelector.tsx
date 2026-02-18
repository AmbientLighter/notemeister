import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import { useScrollingStore } from '@/store/useScrollingStore';
import Dropdown, { DropdownOption } from '@/components/common/Dropdown';
import { Music } from 'lucide-react';

const SongSelector: React.FC = () => {
  const { settings, updateSettings } = useGameStore();
  const availableSongs = useScrollingStore((state) => state.availableSongs);
  const { t } = useTranslations();

  const options: DropdownOption<string>[] = [
    {
      id: 'random',
      label: t.songRandom,
      icon: <Music className="w-4 h-4" />,
    },
    ...availableSongs.map((song) => ({
      id: song.id,
      label: song.name,
      icon: <Music className="w-4 h-4" />,
    })),
  ];

  const currentValue = settings.scrolling.selectedSongId || 'random';

  return (
    <Dropdown
      label={t.selectSong}
      options={options}
      value={currentValue}
      onChange={(val) => {
        const newValue = val === 'random' ? null : val;
        updateSettings({
          scrolling: {
            ...settings.scrolling,
            selectedSongId: newValue,
          },
        });
      }}
      className="flex-1"
    />
  );
};

export default SongSelector;
