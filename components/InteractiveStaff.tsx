import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NOTE_NAMES, OCTAVE_RANGES } from '../constants';
import type { ClefType, Note } from '../types';
import { getNoteKey, getNoteVisualPosition, parseNoteKey } from '../utils/musicLogic';

import { useTheme } from '../hooks/useTheme';

interface InteractiveStaffProps {
  clef: ClefType;
  activeNotes: string[];
  onToggleNote: (noteKey: string) => void;
}

const InteractiveStaff: React.FC<InteractiveStaffProps> = ({ clef, activeNotes, onToggleNote }) => {
  const { darkMode } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredKey, setHoveredKey] = useState<string | undefined>(undefined);

  // Determine which octaves are currently active
  const activeOctaves = useMemo(() => {
    const octs = new Set<number>();
    for (const key of activeNotes) {
      // Parse "C4" -> 4
      const note = parseNoteKey(key);
      octs.add(note.octave);
    }
    return octs;
  }, [activeNotes]);

  // Determine which octaves to display
  // Rule: If notes from >1 octave are selected, show full range.
  // Rule: If notes from 1 octave are selected, show only that octave.
  // Rule: If 0 notes, show default single octave.
  const displayOctaves = useMemo(() => {
    // If multiple octaves involved, show everything ("Full Blown")
    if (activeOctaves.size > 1) {
      return OCTAVE_RANGES[clef];
    }

    // If single octave selected, show just that one
    if (activeOctaves.size === 1) {
      return [[...activeOctaves][0]];
    }

    // Default fallback if nothing selected
    return clef === 'treble' ? [4] : [3];
  }, [clef, activeOctaves]);

  const isMultiOctaveView = displayOctaves.length > 1;

  // Flatten octaves into displayable notes
  const displayNotes = useMemo(() => {
    const notes: Note[] = [];
    for (const octave of displayOctaves) {
      for (const name of NOTE_NAMES) {
        notes.push({
          absoluteIndex: 0,
          name,
          octave,
        });
      }
    }
    return notes;
  }, [displayOctaves]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Config
    const noteSpacing = 40;
    const paddingX = 40;
    const clefSpace = 60;
    const totalWidth = clefSpace + displayNotes.length * noteSpacing + paddingX;
    const height = 180; // Fixed height

    // Resize Canvas
    canvas.width = totalWidth * dpr;
    canvas.height = height * dpr;

    // Style adjustments for CSS size vs Actual size
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // --- Colors ---
    const lineColor = darkMode ? '#94a3b8' : '#1e293b';
    const activeColor = darkMode ? '#818cf8' : '#4f46e5'; // Indigo
    const inactiveColor = darkMode ? '#334155' : '#cbd5e1'; // Slate
    const hoverColor = darkMode ? '#64748b' : '#94a3b8';

    // Clear
    ctx.clearRect(0, 0, totalWidth, height);

    // Geometry
    const staffHeight = 50;
    const staffTopY = (height - staffHeight) / 2 - 10;
    const lineSpacing = staffHeight / 4;
    const staffStartX = 20;
    const staffEndX = totalWidth - 20;

    // Draw Staff Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = lineColor;
    ctx.lineCap = 'round';

    for (let i = 0; i < 5; i++) {
      const y = staffTopY + i * lineSpacing;
      ctx.beginPath();
      ctx.moveTo(staffStartX, y);
      ctx.lineTo(staffEndX, y);
      ctx.stroke();
    }

    // Draw Clef
    ctx.fillStyle = lineColor;
    const fontSize = staffHeight * 1.8;
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const clefX = staffStartX + 30;

    if (clef === 'treble') {
      ctx.fillText('𝄞', clefX, staffTopY + 3 * lineSpacing);
    } else {
      ctx.fillText('𝄢', clefX, staffTopY + 1 * lineSpacing);
    }

    // Draw Notes
    displayNotes.forEach((note, index) => {
      const x = staffStartX + clefSpace + index * noteSpacing;
      const key = getNoteKey(note);
      const isSelected = activeNotes.includes(key);
      const isHovered = hoveredKey === key;

      const stepsFromTop = getNoteVisualPosition(clef, note);
      const y = staffTopY + stepsFromTop * (lineSpacing / 2);

      // Draw Ledger Lines
      const ledgerWidth = 24;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;

      if (stepsFromTop < 0) {
        // Above
        for (let s = -2; s >= stepsFromTop; s -= 2) {
          const ly = staffTopY + s * (lineSpacing / 2);
          ctx.beginPath();
          ctx.moveTo(x - ledgerWidth / 2, ly);
          ctx.lineTo(x + ledgerWidth / 2, ly);
          ctx.stroke();
        }
      } else if (stepsFromTop > 8) {
        // Below
        for (let s = 10; s <= stepsFromTop; s += 2) {
          const ly = staffTopY + s * (lineSpacing / 2);
          ctx.beginPath();
          ctx.moveTo(x - ledgerWidth / 2, ly);
          ctx.lineTo(x + ledgerWidth / 2, ly);
          ctx.stroke();
        }
      }

      // Note Head
      if (isSelected) {
        ctx.fillStyle = activeColor;
      } else if (isHovered) {
        ctx.fillStyle = hoverColor;
      } else {
        ctx.fillStyle = inactiveColor;
      }

      ctx.beginPath();
      const radiusX = lineSpacing * 0.65;
      const radiusY = lineSpacing * 0.5;
      ctx.ellipse(x, y, radiusX, radiusY, -0.2, 0, 2 * Math.PI);
      ctx.fill();

      // Label (Note Name + Octave)
      if (isSelected) {
        ctx.fillStyle = darkMode ? '#fff' : '#000';
      } else {
        ctx.fillStyle = darkMode ? '#475569' : '#94a3b8';
      }
      ctx.font = `bold 12px sans-serif`;
      ctx.textAlign = 'center';

      const labelY = staffTopY + staffHeight + 35;
      ctx.fillText(key, x, labelY);

      // Checkmark for selected
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, labelY + 14, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [clef, activeNotes, hoveredKey, darkMode, displayNotes]);

  const handleMouseMove = (e: React.MouseEvent): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Reverse engineer x to index
    const staffStartX = 20;
    const clefSpace = 60;
    const noteSpacing = 40;
    const startOfNotes = staffStartX + clefSpace;

    if (x < startOfNotes - noteSpacing / 2) {
      setHoveredKey(undefined);
      return;
    }

    const index = Math.round((x - startOfNotes) / noteSpacing);

    if (index >= 0 && index < displayNotes.length) {
      setHoveredKey(getNoteKey(displayNotes[index]));
    } else {
      setHoveredKey(undefined);
    }
  };

  const handleMouseLeave = (): void => {
    setHoveredKey(undefined);
  };

  const handleClick = (_e: React.MouseEvent): void => {
    if (hoveredKey) {
      onToggleNote(hoveredKey);
    }
  };

  return (
    <div className="w-full">
      {/* Scrollable Container with centering if content is small */}
      <div
        ref={containerRef}
        className={`w-full overflow-x-auto pb-4 custom-scrollbar flex ${isMultiOctaveView ? 'justify-start' : 'justify-center'}`}
      >
        <canvas
          ref={canvasRef}
          className="cursor-pointer flex-shrink-0"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
      </div>
      <div className="text-center text-xs text-slate-400 mt-1">
        {isMultiOctaveView ? 'Scroll to see more octaves • ' : ''} Click notes to toggle
      </div>
    </div>
  );
};

export default InteractiveStaff;
