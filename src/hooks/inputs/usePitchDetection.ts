import { useEffect, useRef, useState, useCallback } from 'react';
import PitchWorker from '@/workers/pitchWorker?worker';
import { getNoteFromFrequency } from '@/utils/musicLogic';
import { BASE_URL } from '@/constants';

export const usePitchDetection = () => {
  const [note, setNote] = useState<string>('-');
  const [frequency, setFrequency] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetNote = useCallback(() => {
    setNote('-');
    setFrequency(null);
  }, []);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pitchNodeRef = useRef<AudioWorkletNode | null>(null);

  const stopDetection = useCallback(() => {
    if (pitchNodeRef.current) {
      pitchNodeRef.current.disconnect();
      pitchNodeRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsActive(false);
    setNote('-');
    setFrequency(null);
  }, []);

  const updateNoteUI = useCallback((freq: number) => {
    // Filter out obviously incorrect or extreme frequencies
    if (freq < 20 || freq > 5000) return;

    const detected = getNoteFromFrequency(freq);

    if (detected) {
      setNote(`${detected.name}${detected.octave}`);
      setFrequency(freq);
    }
  }, []);

  const startDetection = useCallback(async () => {
    try {
      setError(null);
      // 1. Start Web Worker
      workerRef.current = new PitchWorker();

      // 2. Start Audio Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      // 3. Load AudioWorklet
      // Note: we assume pitch-processor.js is in public/
      await audioCtx.audioWorklet.addModule(`${BASE_URL}pitch-processor.js`);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const pitchNode = new AudioWorkletNode(audioCtx, 'pitch-processor');
      pitchNodeRef.current = pitchNode;

      // 4. BRIDGE: Connect Worklet directly to Worker
      pitchNode.port.onmessage = (event) => {
        if (event.data === 'SILENCE') {
          resetNote();
          return;
        }
        if (workerRef.current) {
          workerRef.current.postMessage(event.data);
        }
      };

      // 5. Connect React to Worker results
      workerRef.current.onmessage = (event) => {
        if (event.data.type === 'PITCH_FOUND') {
          updateNoteUI(event.data.frequency);
        }
      };

      source.connect(pitchNode);
      pitchNode.connect(audioCtx.destination); // Required to keep the node alive
      setIsActive(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start pitch detection');
      stopDetection();
    }
  }, [updateNoteUI, stopDetection]);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    note,
    frequency,
    isActive,
    error,
    startDetection,
    stopDetection,
    resetNote,
  };
};
