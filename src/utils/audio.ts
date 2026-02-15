import * as Tone from 'tone';
import type { Instrument, Note } from '../types';
import { BASE_URL } from '../constants';

class AudioEngine {
  private samplers: Partial<Record<Instrument, Tone.Sampler>> = {};
  private initialized = false;

  private configs: Partial<Record<Instrument, { urls: Record<string, string>; path: string }>> = {
    piano: {
      urls: { C4: 'C4.mp3', G4: 'G4.mp3', C5: 'C5.mp3' },
      path: 'samples/piano/',
    },
    guitar: {
      urls: { C4: 'C4.mp3', G4: 'G4.mp3', C5: 'C5.mp3' },
      path: 'samples/guitar/',
    },
    flute: {
      urls: { C4: 'C4.mp3', A4: 'A4.mp3', C5: 'C5.mp3' },
      path: 'samples/flute/',
    },
  };

  constructor() {}

  private async getSampler(instrument: Instrument): Promise<Tone.Sampler | undefined> {
    if (instrument === 'silence' || instrument === 'microphone') return undefined;

    // Return cached sampler if it already exists
    if (this.samplers[instrument]) {
      const sampler = this.samplers[instrument]!;
      if (!sampler.loaded) await Tone.loaded();
      return sampler;
    }

    // Create new sampler if config exists
    const config = this.configs[instrument];
    if (config) {
      console.log(`[AudioEngine] Lazily loading instrument: ${instrument}`);
      const sampler = new Tone.Sampler({
        urls: config.urls,
        baseUrl: `${BASE_URL}${config.path}`,
      }).toDestination();

      this.samplers[instrument] = sampler;
      await Tone.loaded();
      return sampler;
    }

    return undefined;
  }

  public async init() {
    if (this.initialized) return;
    await Tone.start();
    this.initialized = true;
  }

  public async playNote(note: Note, instrument: Instrument) {
    await this.init();
    const sampler = await this.getSampler(instrument);
    if (sampler) {
      sampler.triggerAttackRelease(`${note.name}${note.octave}`, '2n');
    }
  }

  public async playMelody(type: 'success' | 'failure', instrument: Instrument) {
    await this.init();
    const sampler = await this.getSampler(instrument);
    if (!sampler) return;

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
