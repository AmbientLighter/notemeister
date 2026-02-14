import React, { useEffect, useRef } from 'react';
import { ClefType, Note } from '../types';
import { getNoteVisualPosition } from '../utils/musicLogic';

interface StaffCanvasProps {
  clef: ClefType;
  note: Note | null;
  darkMode?: boolean;
  className?: string;
}

const StaffCanvas: React.FC<StaffCanvasProps> = ({ clef, note, darkMode = false, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive sizing
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Normalize coordinate system to use CSS pixels.
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;

    // --- Colors ---
    const lineColor = darkMode ? '#94a3b8' : '#1e293b'; // slate-400 : slate-800
    const noteColor = darkMode ? '#f8fafc' : '#0f172a'; // slate-50 : slate-900

    // --- Drawing Logic ---
    
    // Clear
    ctx.clearRect(0, 0, width, height);

    // Configuration
    const staffHeight = height * 0.4;
    const staffTopY = (height - staffHeight) / 2;
    const lineSpacing = staffHeight / 4;
    const staffStartX = width * 0.1;
    const staffEndX = width * 0.9;
    
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

    // Draw End Bars
    ctx.beginPath();
    ctx.moveTo(staffStartX, staffTopY);
    ctx.lineTo(staffStartX, staffTopY + staffHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(staffEndX, staffTopY);
    ctx.lineTo(staffEndX, staffTopY + staffHeight);
    ctx.stroke();

    // Draw Clef
    ctx.fillStyle = noteColor;
    const fontSize = staffHeight * 1.5;
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Adjust clef position manually to align with lines
    const clefX = staffStartX + 40;
    
    if (clef === 'treble') {
       // Treble clef roughly centers on G4 (2nd line from bottom)
       // Visual adjustment to make the spiral sit on the line
       ctx.fillText('𝄞', clefX, staffTopY + (3 * lineSpacing)); 
    } else {
       // Bass clef dots surround F3 (2nd line from top)
       // Visual adjustment
       ctx.fillText('𝄢', clefX, staffTopY + (1 * lineSpacing)); 
    }

    // Draw Note
    if (note) {
      const stepsFromTop = getNoteVisualPosition(clef, note);
      const noteY = staffTopY + (stepsFromTop * (lineSpacing / 2));
      const noteX = width / 2;
      
      // Draw Ledger Lines
      // Check if note is above top line (stepsFromTop < 0) or below bottom line (stepsFromTop > 8)
      // Steps: 0=TopLine, 2=Space, 4=MidLine... 8=BottomLine
      
      const ledgerWidth = 30;
      
      if (stepsFromTop < 0) {
        // Above staff
        // Ledger lines occur at -2, -4, -6...
        for (let s = -2; s >= stepsFromTop; s -= 2) {
          const ly = staffTopY + (s * (lineSpacing / 2));
          ctx.beginPath();
          ctx.moveTo(noteX - ledgerWidth/2, ly);
          ctx.lineTo(noteX + ledgerWidth/2, ly);
          ctx.stroke();
        }
      } else if (stepsFromTop > 8) {
        // Below staff
        // Ledger lines occur at 10, 12, 14...
        for (let s = 10; s <= stepsFromTop; s += 2) {
          const ly = staffTopY + (s * (lineSpacing / 2));
          ctx.beginPath();
          ctx.moveTo(noteX - ledgerWidth/2, ly);
          ctx.lineTo(noteX + ledgerWidth/2, ly);
          ctx.stroke();
        }
      }

      // Note Head
      ctx.beginPath();
      // Ellipse rotation for style
      const radiusX = lineSpacing * 0.65;
      const radiusY = lineSpacing * 0.5;
      ctx.ellipse(noteX, noteY, radiusX, radiusY, -0.2, 0, 2 * Math.PI);
      ctx.fill();

      // Stem
      // Rules: If note is below middle line (steps > 4), stem goes UP from right side.
      // If note is on or above middle line (steps <= 4), stem goes DOWN from left side.
      ctx.lineWidth = 1.5;
      const stemHeight = lineSpacing * 3.5;
      
      if (stepsFromTop > 4) {
        // Stem Up
        ctx.beginPath();
        const stemX = noteX + radiusX - 1; 
        ctx.moveTo(stemX, noteY);
        ctx.lineTo(stemX, noteY - stemHeight);
        ctx.stroke();
      } else {
        // Stem Down
        ctx.beginPath();
        const stemX = noteX - radiusX + 1;
        ctx.moveTo(stemX, noteY);
        ctx.lineTo(stemX, noteY + stemHeight);
        ctx.stroke();
      }
    }

  }, [clef, note, darkMode]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 transition-colors duration-200 ${className}`}
    />
  );
};

export default StaffCanvas;