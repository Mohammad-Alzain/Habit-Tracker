import { Platform, Vibration } from 'react-native';
import { habitStore } from '../store/habitStore';

class HapticService {
  private isEnabled(): boolean {
    try {
      const state = habitStore.getState();
      return state?.settings?.hapticFeedback ?? true;
    } catch {
      return true;
    }
  }

  /**
   * Subtle light tap for regular buttons, pills, and filter chips.
   */
  light() {
    if (!this.isEnabled()) return;
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(10);
        }
      } else {
        Vibration.vibrate(10);
      }
    } catch (e) {
      // Safe fallback
    }
  }

  /**
   * Medium impact for switching view modes or selecting items.
   */
  medium() {
    if (!this.isEnabled()) return;
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(18);
        }
      } else {
        Vibration.vibrate(20);
      }
    } catch (e) {
      // Safe fallback
    }
  }

  /**
   * Rewarding success feedback pattern for completing a habit or milestone.
   */
  success() {
    if (!this.isEnabled()) return;
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([15, 30, 25]);
        }
      } else {
        Vibration.vibrate([0, 15, 40, 25]);
      }
    } catch (e) {
      // Safe fallback
    }
  }

  /**
   * Selection feedback for scrolling or quick toggles.
   */
  selection() {
    this.light();
  }
}

export const hapticService = new HapticService();
