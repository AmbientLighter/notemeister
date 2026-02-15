import { Instrument, Note } from '../types';

class AudioEngine {
    private ctx: AudioContext | null = null;

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    private getFrequency(note: Note): number {
        const baseFrequencies: Record<string, number> = {
            'C': 261.63,
            'D': 293.66,
            'E': 329.63,
            'F': 349.23,
            'G': 392.00,
            'A': 440.00,
            'B': 493.88,
        };
        const base = baseFrequencies[note.name];
        return base * Math.pow(2, note.octave - 4);
    }

    public playNote(note: Note, instrument: Instrument) {
        if (instrument === 'silence') return;

        this.init();
        if (!this.ctx) return;

        const freq = this.getFrequency(note);
        const now = this.ctx.currentTime;

        switch (instrument) {
            case 'piano':
                this.playPiano(freq, now);
                break;
            case 'guitar':
                this.playGuitar(freq, now);
                break;
            case 'flute':
                this.playFlute(freq, now);
                break;
        }
    }

    private playPiano(freq: number, now: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.5);
    }

    private playGuitar(freq: number, now: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Use a square wave with low gain for a more "plucked" harmonic sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

        // Filter to mellow out the square wave
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 1.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 2.0);
    }

    private playFlute(freq: number, now: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Add some vibrato
        const vibrato = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();
        vibrato.frequency.value = 5;
        vibratoGain.gain.value = freq * 0.005;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibrato.start(now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.0);
        vibrato.stop(now + 1.0);
    }
}

export const audioEngine = new AudioEngine();
