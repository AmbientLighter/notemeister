import React, { useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import type { ClefType } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/useGameStore';

interface OSMDCanvasProps {
  xml: string;
  clef: ClefType;
  cursorIndex: number;
  className?: string;
}

const OSMDCanvas: React.FC<OSMDCanvasProps> = ({ xml, clef, cursorIndex, className }) => {
  const { darkMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [isRendered, setIsRendered] = React.useState(false);

  // Initialize OSMD once
  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup before re-initializing
    if (osmdRef.current) {
      containerRef.current.innerHTML = '';
      osmdRef.current = null;
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
    });
    osmdRef.current = osmd;

    const loadScore = async () => {
      try {
        await osmd.load(xml);
        osmd.setOptions({
          defaultColorMusic: darkMode ? '#f8fafc' : '#0f172a',
        });
        osmd.render();
        osmd.cursor.show();
        setIsRendered(true);
      } catch (err) {
        console.error('[OSMD] Load error:', err);
      }
    };

    loadScore();

    return () => {
      osmdRef.current = null;
      setIsRendered(false);
    };
  }, [xml, darkMode]);

  // Display index logic: In demo mode, we want to highlight the note CURRENTLY playing.
  // Since hitNote increments the index to the next target, we stay one behind.
  const gameMode = useGameStore((state) => state.settings.gameMode);
  const isDemo = gameMode === 'demo';
  const displayIndex = isDemo ? Math.max(0, cursorIndex - 1) : cursorIndex;

  // Update cursor position
  useEffect(() => {
    const osmd = osmdRef.current;
    if (!osmd || !osmd.cursor || !osmd.cursor.Iterator || !isRendered) {
      return;
    }

    console.log(`[OSMD] Navigating to index: ${displayIndex} (raw: ${cursorIndex})`);

    osmd.cursor.reset();

    // Move to the target timestamp
    for (let i = 0; i < displayIndex; i++) {
      if (osmd.cursor.Iterator.EndReached) break;
      osmd.cursor.next();
    }

    console.log(`[OSMD] Navigation complete.`);
  }, [displayIndex, isRendered]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={containerRef}
        className="osmd-container"
        style={{ width: '100%', height: '100%', position: 'relative' }}
      />
    </div>
  );
};

export default OSMDCanvas;
