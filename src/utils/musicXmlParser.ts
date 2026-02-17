import { Song, NoteName, SongNote, Note } from '@/types';

/**
 * Basic MusicXML parser to extract song data for the game logic.
 */
export const parseMusicXML = (xmlString: string, id: string): Song => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  // 1. Extract Metadata
  const name = xmlDoc.querySelector('work-title')?.textContent || 'Unknown Song';
  const bpmText = xmlDoc.querySelector('per-minute')?.textContent || '120';
  const bpm = parseInt(bpmText, 10);

  // 2. Extract Notes
  const noteElements = xmlDoc.querySelectorAll('note');
  const notes: SongNote[] = [];

  const typeMap: Record<string, string> = {
    whole: 'w',
    half: 'h',
    quarter: 'q',
    eighth: '8',
    '16th': '16',
  };

  noteElements.forEach((noteEl) => {
    // Skip rests for game logic (but they could be handled if needed for timing)
    const isRest = noteEl.querySelector('rest') !== null;
    if (isRest) return;

    const step = noteEl.querySelector('pitch step')?.textContent as NoteName;
    const octave = parseInt(noteEl.querySelector('pitch octave')?.textContent || '4', 10);
    const type = noteEl.querySelector('type')?.textContent || 'quarter';
    const durationStr = typeMap[type] || 'q';

    if (step && !isNaN(octave)) {
      const note: Note = {
        name: step,
        octave: octave,
        absoluteIndex: octave * 7 + ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(step),
      };

      notes.push({
        keys: [`${step.toLowerCase()}/${octave}`],
        duration: durationStr,
        note,
      });
    }
  });

  return {
    id,
    name,
    bpm,
    notes,
    xml: xmlString,
    path: `songs/${id}.xml`,
  };
};
