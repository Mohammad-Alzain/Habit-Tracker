import { Platform } from 'react-native';
import { habitStore } from '../store/habitStore';
import { hapticService } from './hapticService';
import { SoundTheme } from '../types/habit';

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

  private getTheme(): SoundTheme {
    try {
      const state = habitStore.getSnapshot();
      return state?.settings?.soundTheme || 'classic';
    } catch {
      return 'classic';
    }
  }

  async initNative(): Promise<void> {
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
      } catch {
        // Safe fallback
      }
    }
    return null;
  }

  /**
   * Plays a pleasant celebration feedback on habit completion according to selected theme.
   */
  async playComplete(themeOverride?: SoundTheme) {
    if (!this.isEnabled()) return;

    if (Platform.OS !== 'web') {
      try {
        hapticService.success();
      } catch {}
    }

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const theme = themeOverride || this.getTheme();
      const now = ctx.currentTime;

      if (theme === 'arcade') {
        // 8-bit retro victory arpeggio (Square wave)
        const notes = [
          { freq: 523.25, time: 0, duration: 0.08 },
          { freq: 659.25, time: 0.08, duration: 0.08 },
          { freq: 783.99, time: 0.16, duration: 0.08 },
          { freq: 1046.5, time: 0.24, duration: 0.25 },
        ];
        notes.forEach(({ freq, time, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + time);
          gain.gain.setValueAtTime(0.08, now + time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + duration);
        });
      } else if (theme === 'zen') {
        // Tibetan bowl warm harmonic sine chime
        const baseFreq = 432; // Calming frequency
        [1, 2, 3].forEach((mult, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * mult, now);
          const vol = 0.15 / (i + 1);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.2);
        });
      } else if (theme === 'pop') {
        // Bouncy playful bubbles
        const notes = [
          { freq: 440, time: 0, dur: 0.07 },
          { freq: 880, time: 0.07, dur: 0.1 },
        ];
        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + time);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + time + dur);
          gain.gain.setValueAtTime(0.18, now + time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + dur);
        });
      } else {
        // Classic crystalline 3-note chime
        const notes = [
          { freq: 523.25, time: 0, duration: 0.28 },
          { freq: 659.25, time: 0.08, duration: 0.32 },
          { freq: 783.99, time: 0.16, duration: 0.45 },
        ];
        notes.forEach(({ freq, time, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);
          gain.gain.setValueAtTime(0.001, now + time);
          gain.gain.exponentialRampToValueAtTime(0.22, now + time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + duration);
        });
      }
    } catch {}
  }

  /**
   * Plays subtle feedback for button taps.
   */
  async playTap(themeOverride?: SoundTheme) {
    if (!this.isEnabled()) return;

    if (Platform.OS !== 'web') {
      try {
        hapticService.selection();
      } catch {}
    }

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const theme = themeOverride || this.getTheme();
      const now = ctx.currentTime;

      if (theme === 'arcade') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.02);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (theme === 'zen') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (theme === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.03);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else {
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
    } catch {}
  }

  /**
   * Plays icy crystallization sound effect when Streak Freeze is activated.
   */
  async playFreeze() {
    if (!this.isEnabled()) return;

    if (Platform.OS !== 'web') {
      try {
        hapticService.medium();
      } catch {}
    }

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // High sparkling crystalline chime
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.35);
      });
    } catch {}
  }

  /**
   * Plays an energetic surge sound when Habit Stack cue is triggered.
   */
  async playStackTrigger() {
    if (!this.isEnabled()) return;

    if (Platform.OS !== 'web') {
      try {
        hapticService.light();
      } catch {}
    }

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  /**
   * Plays celebratory achievement / milestone unlocked fanfare.
   */
  async playLevelUp() {
    if (!this.isEnabled()) return;

    if (Platform.OS !== 'web') {
      try {
        hapticService.success();
      } catch {}
    }


    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [
        { freq: 440, time: 0, dur: 0.1 },
        { freq: 554.37, time: 0.08, dur: 0.1 },
        { freq: 659.25, time: 0.16, dur: 0.1 },
        { freq: 880, time: 0.24, dur: 0.4 },
      ];
      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.15, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {}
  }
}

export const soundService = new SoundService();
