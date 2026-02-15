import { YIN } from 'pitchfinder';

const detectPitch = YIN({ threshold: 0.1, sampleRate: 44100 });

const bufferSize = 5;
const frequencies: number[] = [];

self.onmessage = (e: MessageEvent<Float32Array>) => {
  const audioData = e.data; // Float32Array from Worklet
  const frequency = detectPitch(audioData);

  if (frequency) {
    frequencies.push(frequency);
    if (frequencies.length > bufferSize) {
      frequencies.shift();
    }

    if (frequencies.length === bufferSize) {
      // Median Filter: Sort and pick the middle value
      const sorted = [...frequencies].sort((a, b) => a - b);
      const median = sorted[Math.floor(bufferSize / 2)];
      self.postMessage({ type: 'PITCH_FOUND', frequency: median });
    }
  }
};
