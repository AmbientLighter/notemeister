import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslations } from '@/hooks/useTranslations';
import { SONGS } from '@/data/songs';
import Dropdown, { DropdownOption } from '@/components/common/Dropdown';
import { Music } from 'lucide-react';

const SongSelector: React.FC = () => {
  const { settings, updateSettings } = useGameStore();
  const { t } = useTranslations();

  const options: DropdownOption<string>[] = [
    {
      id: 'random',
      label: t.songRandom,
      icon: <Music className="w-4 h-4" />,
    },
    ...SONGS.map((song) => ({
      id: song.id,
      label: song.name,
      icon: <Music className="w-4 h-4" />,
    })),
  ];

  const currentValue = settings.selectedSongId || 'random';

  return (
    <Dropdown
      label={t.selectSong}
      options={options}
      value={currentValue}
      onChange={(val) => updateSettings({ selectedSongId: val === 'random' ? null : val })}
      className="flex-1"
    />
  );
};

export default SongSelector;
