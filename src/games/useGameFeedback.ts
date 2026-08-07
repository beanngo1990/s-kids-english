import { useCallback, useEffect, useRef, useState } from 'react';

export type GameFeedbackState = 'idle' | 'correct' | 'wrong';

export type GameMatchCallback = (
  wordId: string,
  isFirstTry: boolean,
) => Promise<{ xpGained: number } | void> | void;

export async function runGameMatchCallback(
  onMatch: GameMatchCallback | undefined,
  wordId: string,
  isFirstTry: boolean,
) {
  if (!onMatch) {
    return;
  }

  try {
    await onMatch(wordId, isFirstTry);
  } catch {
    // Vocabulary progress is best-effort and must never block game flow.
  }
}

export function useGameFeedback() {
  const [feedback, setFeedback] = useState<GameFeedbackState>('idle');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFeedbackTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const resetFeedback = useCallback(() => {
    clearFeedbackTimer();
    setFeedback('idle');
  }, [clearFeedbackTimer]);

  const showFeedback = useCallback(
    (nextFeedback: Exclude<GameFeedbackState, 'idle'>, duration = 900) => {
      clearFeedbackTimer();
      setFeedback(nextFeedback);
      resetTimerRef.current = setTimeout(() => {
        resetTimerRef.current = null;
        setFeedback('idle');
      }, duration);
    },
    [clearFeedbackTimer],
  );

  useEffect(() => clearFeedbackTimer, [clearFeedbackTimer]);

  return {
    feedback,
    resetFeedback,
    showFeedback,
  };
}
