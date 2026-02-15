/// <reference types="webmidi" />
import { useEffect, useCallback } from 'react';
import type { NoteName } from '@/types';

const MIDI_NOTE_NAMES: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const useMidiInput = (onNote: (note: NoteName) => void, enabled: boolean) => {
  const handleMidiMessage = useCallback(
    (event: WebMidi.MIDIMessageEvent) => {
      const [command, note, velocity] = event.data;

      // command 144 is Note On, command 128 is Note Off
      if (command === 144 && velocity > 0) {
        const nameIndex = note % 12;
        const name = MIDI_NOTE_NAMES[nameIndex];

        // Only trigger for natural notes that exist in our NoteName type
        if (['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(name)) {
          onNote(name as NoteName);
        }
      }
    },
    [onNote]
  );

  useEffect(() => {
    if (!enabled) return;

    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API is not supported in this browser.');
      return;
    }

    let midiAccess: WebMidi.MIDIAccess | null = null;

    navigator
      .requestMIDIAccess()
      .then((access) => {
        midiAccess = access;
        for (const input of access.inputs.values()) {
          input.onmidimessage = handleMidiMessage;
        }

        access.onstatechange = (e) => {
          const port = e.port;
          if (port.type === 'input' && port.state === 'connected') {
            (port as WebMidi.MIDIInput).onmidimessage = handleMidiMessage;
          }
        };
      })
      .catch((err) => {
        console.error('Failed to get MIDI access', err);
      });

    return () => {
      if (midiAccess) {
        for (const input of midiAccess.inputs.values()) {
          input.onmidimessage = null;
        }
        midiAccess.onstatechange = null;
      }
    };
  }, [handleMidiMessage, enabled]);
};
