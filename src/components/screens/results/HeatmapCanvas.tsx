import React, { useEffect, useRef } from 'react';
import { Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { NoteStat } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface HeatmapCanvasProps {
  noteStats: NoteStat[];
  clef: 'treble' | 'bass';
}

const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({ noteStats, clef }) => {
  const { darkMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const getColor = React.useCallback(
    (accuracy: number, avgTime: number) => {
      // Higher score is better
      // 500ms or less = 1.0, 3000ms or more = 0.0
      const timeScore = Math.max(0, Math.min(1, (3000 - avgTime) / 2500));
      const accuracyScore = accuracy / 100;

      // Weight accuracy more than speed
      const score = accuracyScore * 0.7 + timeScore * 0.3;

      // HSL: 0 is red, 120 is green
      const hue = score * 120;
      return `hsl(${hue}, 80%, ${darkMode ? '60%' : '45%'})`;
    },
    [darkMode]
  );

  useEffect(() => {
    if (!containerRef.current || noteStats.length === 0) return;

    // Sort notes by pitch
    const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const sortedStats = [...noteStats].sort((a, b) => {
      const matchA = a.name.match(/([A-G][b#]?)(-?\d)/);
      const matchB = b.name.match(/([A-G][b#]?)(-?\d)/);
      if (!matchA || !matchB) return 0;

      const octaveA = parseInt(matchA[2]);
      const octaveB = parseInt(matchB[2]);
      if (octaveA !== octaveB) return octaveA - octaveB;

      const nameA = matchA[1][0]; // Take base note (ignore accidental for simple sorting)
      const nameB = matchB[1][0];
      return noteOrder.indexOf(nameA) - noteOrder.indexOf(nameB);
    });

    const container = containerRef.current;
    container.innerHTML = '';

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    const width = container.clientWidth || 400;
    const height = 150;
    renderer.resize(width, height);

    const context = renderer.getContext();

    // Scale for better visibility
    const scale = 1.2;
    context.scale(scale, scale);

    const scaledWidth = width / scale;
    const staveWidth = scaledWidth - 40;
    const stave = new Stave(20, 20, staveWidth);
    stave.addClef(clef);

    const staveColor = darkMode ? '#94a3b8' : '#e2e8f0';
    context.setStrokeStyle(staveColor);
    context.setFillStyle(staveColor);
    stave.setContext(context).draw();

    // Convert noteStats to VexFlow notes
    const staveNotes = sortedStats
      .map((stat) => {
        const parts = stat.name.match(/([A-G][b#]?)(-?\d)/);
        if (!parts) return null;

        const name = parts[1];
        const octave = parts[2];
        const color = getColor(stat.accuracy, stat.avgTime);

        const vn = new StaveNote({
          clef: clef,
          keys: [`${name}/${octave}`],
          duration: 'q',
        });

        vn.setStyle({ fillStyle: color, strokeStyle: color });
        return vn;
      })
      .filter((n) => n !== null) as StaveNote[];

    if (staveNotes.length > 0) {
      const voice = new Voice({ numBeats: staveNotes.length, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables(staveNotes);

      new Formatter().joinVoices([voice]).format([voice], staveWidth - 60);
      voice.draw(context, stave);
    }
  }, [noteStats, clef, darkMode, getColor]);

  return <div ref={containerRef} className="w-full" style={{ height: '150px' }} />;
};

export default HeatmapCanvas;
