import { YIN } from 'pitchfinder';

const detectPitch = YIN({ threshold: 0.1, sampleRate: 44100 });

self.onmessage = (e: MessageEvent<Float32Array>) => {
  const audioData = e.data; // Float32Array from Worklet
  const frequency = detectPitch(audioData);

  if (frequency) {
    self.postMessage({ type: 'PITCH_FOUND', frequency });
  }
};
