import { useEffect, useCallback, useRef, useState } from 'react';
import { Language, NoteName } from '@/types';

/**
 * Hook to manage Voice Recognition for note guessing.
 */
export const useSpeechInput = (
  onNote: (note: NoteName) => void,
  enabled: boolean,
  language: Language
) => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastNote, setLastNote] = useState<string>('-');
  const recognitionRef = useRef<any>(null);
  const statusRef = useRef<'idle' | 'starting' | 'active'>('idle');
  const shouldRestartRef = useRef(true);

  // Mapping of common speech recognition results to Note Names
  // This helps with phonetic similarities and multi-language recognition
  const noteMap: Record<string, NoteName> = {
    // English
    c: 'C',
    see: 'C',
    sea: 'C',
    d: 'D',
    dee: 'D',
    tea: 'D',
    e: 'E',
    ee: 'E',
    he: 'E',
    f: 'F',
    ef: 'F',
    if: 'F',
    g: 'G',
    gee: 'G',
    ji: 'G',
    a: 'A',
    eh: 'A',
    hay: 'A',
    b: 'B',
    bee: 'B',
    be: 'B',

    // Solfège
    do: 'C',
    re: 'D',
    mi: 'E',
    fa: 'F',
    sol: 'G',
    la: 'A',
    si: 'B',
    ti: 'B',

    // Russian/Ukrainian/Estonian Solfège
    до: 'C',
    ре: 'D',
    ми: 'E',
    фа: 'F',
    соль: 'G',
    ля: 'A',
    си: 'B',
  };

  // Map application language to Browser Speech Recognition codes
  const langMap: Record<Language, string> = {
    en: 'en-US',
    ru: 'ru-RU',
    uk: 'uk-UA',
    et: 'et-EE',
  };

  const processTranscript = useCallback(
    (transcript: string) => {
      if (!transcript) return false;
      const words = transcript
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      for (const word of words) {
        if (noteMap[word]) {
          setLastNote(noteMap[word]);
          onNote(noteMap[word]);
          return true;
        }

        const char = word[0].toUpperCase();
        if (['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(char)) {
          setLastNote(char);
          onNote(char as NoteName);
          return true;
        }
      }
      return false;
    },
    [onNote]
  );

  const resetNote = useCallback(() => setLastNote('-'), []);

  const startRecognition = useCallback(() => {
    if (!enabled) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech Recognition not supported in this browser');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = langMap[language] || 'en-US';

      recognition.onstart = () => {
        setIsActive(true);
        statusRef.current = 'active';
      };

      recognition.onend = () => {
        setIsActive(false);
        statusRef.current = 'idle';
        // Restart only if still enabled and not manually stopped
        if (enabled && shouldRestartRef.current) {
          // Add a small delay for Chrome to stabilize after "aborted" or "service-not-allowed"
          setTimeout(() => {
            if (enabled && statusRef.current === 'idle' && shouldRestartRef.current) {
              try {
                statusRef.current = 'starting';
                recognition.start();
              } catch (e) {
                statusRef.current = 'idle';
              }
            }
          }, 500);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied');
          shouldRestartRef.current = false;
        } else if (event.error === 'aborted') {
          console.warn('Recognition aborted');
          statusRef.current = 'idle';
        } else if (event.error === 'no-speech') {
          // No big deal, just continue
        } else {
          // For other errors, we can show them or just log
          // setError(`Speech Error: ${event.error}`);
        }
      };

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            console.log('[Speech] Final:', transcript);
            processTranscript(transcript);
          } else {
            // Process interim for speed
            processTranscript(transcript);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    if (statusRef.current === 'idle') {
      try {
        shouldRestartRef.current = true;
        statusRef.current = 'starting';
        recognitionRef.current.start();
      } catch (e) {
        statusRef.current = 'idle';
        console.warn('Speech Recognition failure to start:', e);
      }
    }
  }, [enabled, language, processTranscript]);

  const stopRecognition = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current && statusRef.current !== 'idle') {
      recognitionRef.current.stop();
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      startRecognition();
    } else {
      stopRecognition();
    }

    return () => {
      stopRecognition();
    };
  }, [enabled, startRecognition, stopRecognition]);

  return {
    isActive,
    error,
    lastNote,
    startRecognition,
    stopRecognition,
    resetNote,
  };
};
