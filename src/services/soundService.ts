import { Platform } from 'react-native';
import { habitStore } from '../store/habitStore';

class SoundService {
  private audioCtx: any = null;

  private isEnabled(): boolean {
    try {
      const state = habitStore.getSnapshot();
      return state?.settings?.soundEffects ?? true;
    } catch {
      return true;
    }
  }

  async initNative(): Promise<void> {
    // Safe initialization with zero external native dependencies
    return;
  }

  private getAudioContext(): any {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          if (!this.audioCtx) {
            this.audioCtx = new AudioCtxClass();
          }
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }
          return this.audioCtx;
        }
      } catch (e) {
        // Safe fallback
      }
    }
    return null;
  }

  /**
   * Plays a pleasant celebration chime.
   * Runs via Web Audio API on web and safely degrades on native without crashes.
   */
  async playComplete() {
    if (!this.isEnabled()) return;

    try {
      const ctx = this.getAudioContext();
      if (ctx) {
        const notes = [
          { freq: 523.25, time: 0, duration: 0.28 }, // C5
          { freq: 659.25, time: 0.08, duration: 0.32 }, // E5
          { freq: 783.99, time: 0.16, duration: 0.45 }, // G5
        ];

        const now = ctx.currentTime;
        notes.forEach(({ freq, time, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);

          // Soft bell attack & exponential release
          gain.gain.setValueAtTime(0.001, now + time);
          gain.gain.exponentialRampToValueAtTime(0.22, now + time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + duration);
        });
      }
    } catch (e) {
      // Safe fallback
    }
  }

  /**
   * Plays a subtle pop / click sound for button taps.
   */
  async playTap() {
    if (!this.isEnabled()) return;

    try {
      const ctx = this.getAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      // Safe fallback
    }
  }
}

export const soundService = new SoundService();
