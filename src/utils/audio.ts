import * as Tone from 'tone';
import type { Instrument, Note } from '../types';
import { BASE_URL } from '../constants';

class AudioEngine {
  private samplers: Partial<Record<Instrument, Tone.Sampler>> = {};
  private initialized = false;

  constructor() {
    // Start loading samples immediately to have them ready as soon as possible
    this.samplers.piano = new Tone.Sampler({
      urls: { C4: 'C4.mp3', G4: 'G4.mp3', C5: 'C5.mp3' },
      baseUrl: `${BASE_URL}samples/piano/`,
    }).toDestination();

    this.samplers.guitar = new Tone.Sampler({
      urls: { C4: 'C4.mp3', G4: 'G4.mp3', C5: 'C5.mp3' },
      baseUrl: `${BASE_URL}samples/guitar/`,
    }).toDestination();

    this.samplers.flute = new Tone.Sampler({
      urls: { C4: 'C4.mp3', A4: 'A4.mp3', C5: 'C5.mp3' },
      baseUrl: `${BASE_URL}samples/flute/`,
    }).toDestination();
  }

  public async init() {
    if (this.initialized) return;
    await Tone.start();
    this.initialized = true;
  }

  public async playNote(note: Note, instrument: Instrument) {
    if (instrument === 'silence') return;

    await this.init();

    const sampler = this.samplers[instrument];
    if (sampler) {
      // If not loaded yet, wait for all Tone.js assets to load
      if (!sampler.loaded) {
        await Tone.loaded();
      }
      sampler.triggerAttackRelease(`${note.name}${note.octave}`, '2n');
    }
  }

  public async playMelody(type: 'success' | 'failure', instrument: Instrument) {
    if (instrument === 'silence') return;

    await this.init();

    const sampler = this.samplers[instrument];
    if (!sampler) return;

    if (!sampler.loaded) {
      await Tone.loaded();
    }

    const now = Tone.now();

    if (type === 'success') {
      // Triumphant level-up style fanfare
      sampler.triggerAttackRelease('C4', '16n', now);
      sampler.triggerAttackRelease('E4', '16n', now + 0.1);
      sampler.triggerAttackRelease('G4', '16n', now + 0.2);
      sampler.triggerAttackRelease('C5', '8n', now + 0.35);
      sampler.triggerAttackRelease('E5', '4n', now + 0.55);
    } else {
      // Melancholic "sad trombone" style descending sequence
      sampler.triggerAttackRelease('Eb4', '4n', now);
      sampler.triggerAttackRelease('D4', '4n', now + 0.4);
      sampler.triggerAttackRelease('C4', '2n', now + 0.8);
    }
  }
}

export const audioEngine = new AudioEngine();
