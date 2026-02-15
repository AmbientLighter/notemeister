import React, { useRef, useEffect, useState } from 'react';
import { ClefType, NoteName, Note } from '../types';
import { NOTE_NAMES } from '../constants';
import { getNoteVisualPosition } from '../utils/musicLogic';

interface InteractiveStaffProps {
  clef: ClefType;
  selectedNotes: NoteName[];
  onToggleNote: (note: NoteName) => void;
  darkMode: boolean;
}

const InteractiveStaff: React.FC<InteractiveStaffProps> = ({
  clef,
  selectedNotes,
  onToggleNote,
  darkMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNote, setHoveredNote] = useState<NoteName | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // --- Colors ---
    const lineColor = darkMode ? '#94a3b8' : '#1e293b';
    const activeColor = darkMode ? '#818cf8' : '#4f46e5'; // Indigo-400/600
    const inactiveColor = darkMode ? '#334155' : '#cbd5e1'; // Slate-700/300
    
    // Clear
    ctx.clearRect(0, 0, width, height);

    // Configuration
    const staffHeight = height * 0.3; // slightly smaller staff to fit labels
    const staffTopY = (height - staffHeight) / 2 - 10;
    const lineSpacing = staffHeight / 4;
    const staffStartX = 20;
    const staffEndX = width - 20;

    // Draw Staff Lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = lineColor;
    ctx.lineCap = 'round';

    for (let i = 0; i < 5; i++) {
      const y = staffTopY + (i * lineSpacing);
      ctx.beginPath();
      ctx.moveTo(staffStartX, y);
      ctx.lineTo(staffEndX, y);
      ctx.stroke();
    }

    // Draw Clef (simplified or smaller)
    ctx.fillStyle = lineColor;
    const fontSize = staffHeight * 1.5;
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const clefX = staffStartX + 30;
    
    if (clef === 'treble') {
       ctx.fillText('𝄞', clefX, staffTopY + (3 * lineSpacing)); 
    } else {
       ctx.fillText('𝄢', clefX, staffTopY + (1 * lineSpacing)); 
    }

    // Notes Configuration
    const octave = clef === 'treble' ? 4 : 3;
    const notesAreaStartX = clefX + 40;
    const notesAreaWidth = staffEndX - notesAreaStartX;
    const noteSpacing = notesAreaWidth / NOTE_NAMES.length;

    NOTE_NAMES.forEach((name, index) => {
      const isSelected = selectedNotes.includes(name);
      const isHovered = hoveredNote === name;
      
      const x = notesAreaStartX + (index * noteSpacing) + (noteSpacing / 2);
      
      // Calculate Y by mocking a Note object
      // We pass 0 for absoluteIndex because getNoteVisualPosition recalculates it from name/octave anyway
      const note: Note = { name, octave, absoluteIndex: 0 }; 
      
      const stepsFromTop = getNoteVisualPosition(clef, note);
      const y = staffTopY + (stepsFromTop * (lineSpacing / 2));

      // Draw Ledger Lines if needed
      const ledgerWidth = 24;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      
      if (stepsFromTop < 0) { // Above
        for (let s = -2; s >= stepsFromTop; s -= 2) {
          const ly = staffTopY + (s * (lineSpacing / 2));
          ctx.beginPath();
          ctx.moveTo(x - ledgerWidth/2, ly);
          ctx.lineTo(x + ledgerWidth/2, ly);
          ctx.stroke();
        }
      } else if (stepsFromTop > 8) { // Below
        for (let s = 10; s <= stepsFromTop; s += 2) {
          const ly = staffTopY + (s * (lineSpacing / 2));
          ctx.beginPath();
          ctx.moveTo(x - ledgerWidth/2, ly);
          ctx.lineTo(x + ledgerWidth/2, ly);
          ctx.stroke();
        }
      }

      // Draw Note Head
      ctx.fillStyle = isSelected ? activeColor : inactiveColor;
      if (isHovered && !isSelected) ctx.fillStyle = darkMode ? '#64748b' : '#94a3b8'; // hover effect
      
      ctx.beginPath();
      const radiusX = lineSpacing * 0.65;
      const radiusY = lineSpacing * 0.5;
      ctx.ellipse(x, y, radiusX, radiusY, -0.2, 0, 2 * Math.PI);
      ctx.fill();

      // Label
      ctx.fillStyle = isSelected ? (darkMode ? '#fff' : '#000') : (darkMode ? '#475569' : '#94a3b8');
      ctx.font = `bold 14px sans-serif`;
      ctx.fillText(name, x, staffTopY + staffHeight + 30);
      
      // Selection Indicator (Checkmark or dot)
      if (isSelected) {
         ctx.beginPath();
         ctx.arc(x, staffTopY + staffHeight + 30 + 15, 3, 0, 2 * Math.PI);
         ctx.fill();
      }
    });

  }, [clef, selectedNotes, hoveredNote, darkMode]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    const staffStartX = 20;
    const clefX = staffStartX + 30;
    const notesAreaStartX = clefX + 40;
    const staffEndX = width - 20;
    const notesAreaWidth = staffEndX - notesAreaStartX;
    const noteSpacing = notesAreaWidth / NOTE_NAMES.length;

    if (x < notesAreaStartX) {
        setHoveredNote(null);
        return;
    }

    const index = Math.floor((x - notesAreaStartX) / noteSpacing);
    if (index >= 0 && index < NOTE_NAMES.length) {
        setHoveredNote(NOTE_NAMES[index]);
    } else {
        setHoveredNote(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredNote(null);
  };

  const handleClick = (e: React.MouseEvent) => {
      if (hoveredNote) {
          onToggleNote(hoveredNote);
      }
  };

  return (
    <div className="w-full relative">
        <canvas
            ref={canvasRef}
            className="w-full h-40 cursor-pointer bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        />
        <div className="text-center text-xs text-slate-400 mt-2">
            Click notes to select/deselect
        </div>
    </div>
  );
};

export default InteractiveStaff;
