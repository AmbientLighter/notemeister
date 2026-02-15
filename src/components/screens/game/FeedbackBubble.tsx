import React from 'react';

interface FeedbackBubbleProps {
  feedback: { type: 'correct' | 'incorrect'; message?: string } | null;
}

const FeedbackBubble: React.FC<FeedbackBubbleProps> = ({ feedback }) => {
  return (
    <div
      className={`h-8 md:h-12 flex items-center justify-center transition-all duration-300 transform ${
        feedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {feedback && (
        <span
          className={`px-6 py-2 rounded-full font-bold shadow-sm ${
            feedback.type === 'correct'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
          }`}
        >
          {feedback.message}
        </span>
      )}
    </div>
  );
};

export default FeedbackBubble;
