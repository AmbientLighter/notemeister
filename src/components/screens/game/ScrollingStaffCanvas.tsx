import React, { useEffect, useRef } from 'react';
import { Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { ClefType, ScrollingNote } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface ScrollingStaffCanvasProps {
  clef: ClefType;
  notes: ScrollingNote[];
  className?: string;
}

const ScrollingStaffCanvas: React.FC<ScrollingStaffCanvasProps> = ({ clef, notes, className }) => {
  const { darkMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 200;

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    const scale = 2;
    context.scale(scale, scale);

    const noteColor = darkMode ? '#f8fafc' : '#0f172a';
    const staveLineColor = darkMode ? '#94a3b8' : '#334155';

    context.setFillStyle(noteColor);
    context.setStrokeStyle(staveLineColor);

    const scaledWidth = width / scale;
    const scaledHeight = height / scale;
    const staveY = (scaledHeight - 100) / 2;

    // Draw a long stave
    const stave = new Stave(10, staveY, scaledWidth - 20);
    stave.addClef(clef);
    stave.setContext(context).draw();

    // Render notes at their respective X positions
    notes.forEach((sn) => {
      // sn.x is 0..100 percentage from right
      // Map 100% to scaledWidth - 50, and 0% to 50 (clef area)
      const xPos = 50 + (sn.x / 100) * (scaledWidth - 100);

      const vexNote = new StaveNote({
        clef: clef,
        keys: sn.keys,
        duration: sn.duration,
      });
      vexNote.setStyle({ fillStyle: noteColor, strokeStyle: noteColor });

      const voice = new Voice({ numBeats: 1, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables([vexNote]);

      // We use a small width for formatting individual notes
      new Formatter().joinVoices([voice]).format([voice], 0);

      // Draw note relative to stave but with our calculated X
      // Note: context.save/restore or manual translation might be needed if draw() doesn't support X
      // In VexFlow 5, we can use a temporary stave or translate context
      context.save();
      // Adjust x position of the note
      // A trick is to create a tiny temporary stave at the right position
      const tempStave = new Stave(xPos, staveY, 100);
      voice.draw(context, tempStave);
      context.restore();
    });
  }, [clef, notes, darkMode]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 transition-colors duration-200 overflow-hidden ${className}`}
    />
  );
};

export default ScrollingStaffCanvas;
