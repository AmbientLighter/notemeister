import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';
import { ClefType, Note } from '../types';

import { useTheme } from '../hooks/useTheme';

interface StaffCanvasProps {
  clef: ClefType;
  note: Note | null;
  className?: string;
}

const StaffCanvas: React.FC<StaffCanvasProps> = ({ clef, note, className }) => {
  const { darkMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Clear previous rendering
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const renderer = new Renderer(container, Renderer.Backends.SVG);

    // Size the renderer
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 200;
    renderer.resize(width, height);

    const context = renderer.getContext();

    // Setup scaling for "Maximal" display
    // We'll scale everything up to fill the container better
    const scale = 3;
    context.scale(scale, scale);

    // Setup colors based on dark mode
    const noteColor = darkMode ? '#f8fafc' : '#0f172a'; // slate-50 : slate-900
    const staveLineColor = darkMode ? '#94a3b8' : '#334155'; // slate-400 : slate-700

    context.setFillStyle(noteColor);
    context.setStrokeStyle(staveLineColor);

    // Create stave
    // Adjust width and positioning to account for scale
    const scaledWidth = width / scale;
    const scaledHeight = height / scale;

    const staveWidth = scaledWidth * 0.9;
    const staveX = (scaledWidth - staveWidth) / 2;
    const staveY = (scaledHeight - 100) / 2;

    const stave = new Stave(staveX, staveY, staveWidth);
    stave.addClef(clef);
    stave.setContext(context).draw();

    if (note) {
      // Create a stave note
      const vexNote = new StaveNote({
        clef: clef,
        keys: [`${note.name}/${note.octave}`],
        duration: 'q',
      });

      // Apply styling to the note
      vexNote.setStyle({ fillStyle: noteColor, strokeStyle: noteColor });

      // Create a voice and add the notes
      const voice = new Voice({ numBeats: 1, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables([vexNote]);

      // Format and justify the notes to the stave width
      new Formatter().joinVoices([voice]).format([voice], staveWidth);

      // Render voice
      voice.draw(context, stave);
    }
  }, [clef, note, darkMode]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 transition-colors duration-200 overflow-hidden flex items-center justify-center ${className}`}
    />
  );
};

export default StaffCanvas;