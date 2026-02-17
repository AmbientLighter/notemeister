import { Song } from '@/types';

/**
 * Converts a Song object to a basic MusicXML string for OpenSheetMusicDisplay.
 */
export const convertToMusicXML = (song: Song, clef: 'treble' | 'bass' = 'treble'): string => {
  const clefSign = clef === 'treble' ? 'G' : 'F';
  const clefLine = clef === 'treble' ? '2' : '4';

  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC
    "-//Recordare//DTD MusicXML 4.0 Partwise//EN"
    "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>${song.name}</work-title>
  </work>
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>${clefSign}</sign>
          <line>${clefLine}</line>
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${song.bpm}</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="${song.bpm}"/>
      </direction>
`;

  let currentMeasure = 1;
  let beatsInMeasure = 0;

  song.notes.forEach((sn) => {
    const durationMap: Record<string, { type: string; dots: number; duration: number }> = {
      w: { type: 'whole', dots: 0, duration: 16 },
      h: { type: 'half', dots: 0, duration: 8 },
      q: { type: 'quarter', dots: 0, duration: 4 },
      '8': { type: 'eighth', dots: 0, duration: 2 },
      '16': { type: '16th', dots: 0, duration: 1 },
      // Simplified: VexFlow uses 'hd' etc for dots. We'll stick to basics for now.
    };

    const d = durationMap[sn.duration] || durationMap['q'];

    if (beatsInMeasure + d.duration > 16) {
      xml += `    </measure>\n    <measure number="${++currentMeasure}">\n`;
      beatsInMeasure = 0;
    }

    xml += `      <note>
        <pitch>
          <step>${sn.note.name}</step>
          <octave>${sn.note.octave}</octave>
        </pitch>
        <duration>${d.duration}</duration>
        <type>${d.type}</type>
      </note>\n`;

    beatsInMeasure += d.duration;
  });

  xml += `    </measure>
  </part>
</score-partwise>`;

  return xml;
};
