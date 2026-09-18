import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { habitStore } from '../store/habitStore';

class SoundService {
  private completeSound: Audio.Sound | null = null;
  private tapSound: Audio.Sound | null = null;
  private isInitialized = false;
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
    if (this.isInitialized) return;
    if (Platform.OS === 'web') {
      this.isInitialized = true;
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Pre-load sounds for instantaneous native playback
      const completeAsset = require('../../assets/sounds/complete.wav');
      const tapAsset = require('../../assets/sounds/tap.wav');

      const { sound: s1 } = await Audio.Sound.createAsync(
        completeAsset,
        { volume: 0.9, shouldPlay: false }
      );
      this.completeSound = s1;

      const { sound: s2 } = await Audio.Sound.createAsync(
        tapAsset,
        { volume: 0.55, shouldPlay: false }
      );
      this.tapSound = s2;

      this.isInitialized = true;
    } catch (e) {
      // Safe fallback if native audio cannot load
      console.warn('SoundService initNative fallback:', e);
    }
  }

  /**
   * Plays a pleasant celebration chime on habit completion.
   * Runs natively with zero latency via expo-av on Android/iOS, and falls back to Web Audio on Web.
   */
  async playComplete() {
    if (!this.isEnabled()) return;

    if (Platform.OS !== 'web') {
      try {
        if (!this.completeSound) {
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/complete.wav'),
            { volume: 0.9, shouldPlay: true }
          );
          this.completeSound = sound;
        } else {
          await this.completeSound.setPositionAsync(0);
          await this.completeSound.playAsync();
        }
        return;
      } catch (e) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/complete.wav'),
            { volume: 0.9, shouldPlay: true }
          );
          this.completeSound = sound;
          return;
        } catch {
          // safe degradation
        }
      }
    }

    // Web Audio API fallback
    try {
      const ctx = this.getAudioContext();
      if (ctx) {
        const notes = [
          { freq: 523.25, time: 0, duration: 0.28 },
          { freq: 659.25, time: 0.08, duration: 0.32 },
          { freq: 783.99, time: 0.16, duration: 0.45 },
        ];

        const now = ctx.currentTime;
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
    } catch {
      // safe fallback
    }
  }

  /**
   * Plays a subtle pop / click sound for button taps.
   */
  async playTap() {
    if (!this.isEnabled()) return;

    if (Platform.OS !== 'web') {
      try {
        if (!this.tapSound) {
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/tap.wav'),
            { volume: 0.55, shouldPlay: true }
          );
          this.tapSound = sound;
        } else {
          await this.tapSound.setPositionAsync(0);
          await this.tapSound.playAsync();
        }
        return;
      } catch (e) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/tap.wav'),
            { volume: 0.55, shouldPlay: true }
          );
          this.tapSound = sound;
          return;
        } catch {
          // safe degradation
        }
      }
    }

    // Web Audio fallback
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
    } catch {
      // safe fallback
    }
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
}

export const soundService = new SoundService();
