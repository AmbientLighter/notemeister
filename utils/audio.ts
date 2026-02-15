import * as Tone from 'tone';
import { Instrument, Note } from '../types';

class AudioEngine {
    private samplers: Partial<Record<Instrument, Tone.Sampler>> = {};
    private initialized = false;

    private async init() {
        if (this.initialized) return;
        await Tone.start();
        this.initialized = true;

        // Initialize samplers
        this.samplers.piano = new Tone.Sampler({
            urls: {
                C4: "C4.mp3",
                G4: "G4.mp3",
                C5: "C5.mp3",
            },
            baseUrl: "/notemeister/samples/piano/",
        }).toDestination();

        this.samplers.guitar = new Tone.Sampler({
            urls: {
                C4: "C4.mp3",
                G4: "G4.mp3",
                C5: "C5.mp3",
            },
            baseUrl: "/notemeister/samples/guitar/",
        }).toDestination();

        this.samplers.flute = new Tone.Sampler({
            urls: {
                C4: "C4.mp3",
                A4: "A4.mp3",
                C5: "C5.mp3",
            },
            baseUrl: "/notemeister/samples/flute/",
        }).toDestination();
    }

    public async playNote(note: Note, instrument: Instrument) {
        if (instrument === 'silence') return;

        await this.init();

        const sampler = this.samplers[instrument];
        if (sampler && sampler.loaded) {
            sampler.triggerAttackRelease(`${note.name}${note.octave}`, "2n");
        } else {
            console.warn(`Sampler for ${instrument} not loaded yet`);
        }
    }
}

export const audioEngine = new AudioEngine();
