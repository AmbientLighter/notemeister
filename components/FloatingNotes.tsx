import React, { useMemo } from 'react';
import { Music, Music2, Music3, Music4 } from 'lucide-react';

const FloatingNotes: React.FC = () => {
  const icons = [Music, Music2, Music3, Music4];

  // Generate floating notes with random properties
  const floatingNotes = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      iconIndex: Math.floor(Math.random() * icons.length),
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 12,
      left: Math.random() * 105 - 2.5, // Slight overflow
      rotation: Math.random() * 360,
      scale: 0.4 + Math.random() * 1.0,
      opacity: 0.15 + Math.random() * 0.25,
    })), [icons.length]); // Added icons.length to dependency array for completeness

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-20">
      {floatingNotes.map((note) => (
        <div
          key={note.id}
          className="absolute text-indigo-400 dark:text-indigo-300"
          style={{
            left: `${note.left}%`,
            bottom: '-10%',
            opacity: note.opacity,
            animation: `floatUp ${note.duration}s ease-in ${note.delay}s infinite`,
            transform: `rotate(${note.rotation}deg) scale(${note.scale})`,
          }}
        >
          <Music size={32} strokeWidth={1.5} />
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingNotes;
