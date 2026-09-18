import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { soundService } from '../../../services/soundService';
import { hapticService } from '../../../services/hapticService';

interface UseCountdownTimerProps {
  initialMinutes: number;
  onFinished?: () => void;
  onStart?: (secondsLeft: number) => void;
  onPause?: (secondsLeft: number) => void;
  onReset?: () => void;
}

export function useCountdownTimer({
  initialMinutes,
  onFinished,
  onStart,
  onPause,
  onReset,
}: UseCountdownTimerProps) {
  const totalSeconds = Math.max(1, initialMinutes) * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<any>(null);
  const targetEndTimeRef = useRef<number | null>(null);

  // Initialize seconds on totalSeconds change
  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    targetEndTimeRef.current = null;
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [totalSeconds]);

  // Handle countdown interval using real-world timestamps
  useEffect(() => {
    if (isRunning) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + secondsLeft * 1000;
      }

      intervalRef.current = setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const now = Date.now();
        const remaining = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));

        if (remaining <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          targetEndTimeRef.current = null;
          setIsRunning(false);
          setSecondsLeft(0);
          soundService.playComplete();
          hapticService.success();
          onFinished?.();
        } else {
          setSecondsLeft(remaining);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      targetEndTimeRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onFinished]);

  // Reconcile countdown when returning from background or unlocking phone
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isRunning && targetEndTimeRef.current) {
        const now = Date.now();
        const remaining = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));

        if (remaining <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          targetEndTimeRef.current = null;
          setIsRunning(false);
          setSecondsLeft(0);
          soundService.playComplete();
          hapticService.success();
          onFinished?.();
        } else {
          setSecondsLeft(remaining);
        }
      }
    });

    return () => sub.remove();
  }, [isRunning, onFinished]);

  const toggleRun = useCallback(() => {
    hapticService.light();
    if (!isRunning) {
      // Starting / Resuming
      const targetTime = Date.now() + secondsLeft * 1000;
      targetEndTimeRef.current = targetTime;
      setIsRunning(true);
      onStart?.(secondsLeft);
    } else {
      // Pausing
      targetEndTimeRef.current = null;
      setIsRunning(false);
      onPause?.(secondsLeft);
    }
  }, [isRunning, secondsLeft, onStart, onPause]);

  const reset = useCallback(() => {
    hapticService.light();
    if (intervalRef.current) clearInterval(intervalRef.current);
    targetEndTimeRef.current = null;
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
    onReset?.();
  }, [totalSeconds, onReset]);

  const addMinutes = useCallback((mins: number) => {
    hapticService.light();
    const additionalSeconds = mins * 60;
    if (isRunning && targetEndTimeRef.current) {
      targetEndTimeRef.current += additionalSeconds * 1000;
    }
    setSecondsLeft((prev) => {
      const updated = prev + additionalSeconds;
      if (isRunning) {
        onStart?.(updated);
      }
      return updated;
    });
  }, [isRunning, onStart]);

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    secondsLeft,
    isRunning,
    formattedTime,
    progressPercent,
    toggleRun,
    reset,
    addMinutes,
  };
}
