import React, { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import type { ClefType } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface OSMDCanvasProps {
  xml: string;
  clef: ClefType;
  cursorIndex: number; // Index of the note to highlight
  className?: string;
}

const OSMDCanvas: React.FC<OSMDCanvasProps> = ({ xml, clef, cursorIndex, className }) => {
  const { darkMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const osmd = new OpenSheetMusicDisplay(containerRef.current, {
      autoResize: true,
      drawTitle: false,
      drawSubtitle: false,
      drawComposer: false,
      drawLyricist: false,
      drawMetronomeMarks: false,
      drawPartNames: false,
      drawFingerings: false,
      drawMeasureNumbers: false,
      backend: 'svg',
    });

    osmdRef.current = osmd;

    const loadAndRender = async () => {
      try {
        await osmd.load(xml);
        // Map dark mode to OSMD colors
        // Note: OSMD color styling can be complex, this is a basic approach
        if (darkMode) {
          osmd.setOptions({
            defaultColorMusic: '#f8fafc',
            defaultColorLabel: '#f8fafc',
            defaultColorTitle: '#f8fafc',
          });
        } else {
          osmd.setOptions({
            defaultColorMusic: '#0f172a',
            defaultColorLabel: '#0f172a',
            defaultColorTitle: '#0f172a',
          });
        }

        osmd.render();
        osmd.cursor.show();
      } catch (err) {
        console.error('Error loading OSMD:', err);
      }
    };

    loadAndRender();
  }, [xml, darkMode]);

  // Handle cursor positioning
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !osmd.cursor) return;

    // OSMD cursor navigation is step-based (next()).
    // We might need to reset and seek if the index changes arbitrarily.
    // For hit-based movement, we can just call next().

    // Reset cursor to start
    osmd.cursor.reset();

    // Seek to the target index
    for (let i = 0; i < cursorIndex; i++) {
      osmd.cursor.next();
    }
  }, [cursorIndex]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 transition-colors duration-200 overflow-hidden ${className}`}
    />
  );
};

export default OSMDCanvas;
