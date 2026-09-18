import { Platform, Vibration } from 'react-native';
import { habitStore } from '../store/habitStore';

// Safe dynamic getter for expo-haptics to prevent crash when native module is missing
let cachedHaptics: any = undefined;
function getHaptics(): any {
  if (cachedHaptics !== undefined) return cachedHaptics;
  try {
    cachedHaptics = require('expo-haptics');
  } catch {
    cachedHaptics = null;
  }
  return cachedHaptics;
}

class HapticService {
  private isEnabled(): boolean {
    try {
      const state = habitStore.getSnapshot();
      return state?.settings?.hapticFeedback ?? true;
    } catch {
      return true;
    }
  }

  /**
   * Subtle light tap for regular buttons, pills, grid cells, and filter chips.
   */
  light() {
    if (!this.isEnabled()) return;
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(10);
        }
      } else {
        const Haptics = getHaptics();
        if (Haptics && Haptics.impactAsync) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
            Vibration.vibrate(12);
          });
        } else {
          Vibration.vibrate(12);
        }
      }
    } catch {
      try {
        Vibration.vibrate(12);
      } catch {
        // Safe fallback
      }
    }
  }

  /**
   * Medium impact for switching view modes, modal dialog actions, or toggling filters.
   */
  medium() {
    if (!this.isEnabled()) return;
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(18);
        }
      } else {
        const Haptics = getHaptics();
        if (Haptics && Haptics.impactAsync) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
            Vibration.vibrate(22);
          });
        } else {
          Vibration.vibrate(22);
        }
      }
    } catch {
      try {
        Vibration.vibrate(22);
      } catch {
        // Safe fallback
      }
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
        const Haptics = getHaptics();
        if (Haptics && Haptics.notificationAsync) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
            Vibration.vibrate([0, 18, 35, 25]);
          });
        } else {
          Vibration.vibrate([0, 18, 35, 25]);
        }
      }
    } catch {
      try {
        Vibration.vibrate([0, 18, 35, 25]);
      } catch {
        // Safe fallback
      }
    }
  }

  /**
   * Selection feedback for scrolling or quick toggles.
   */
  selection() {
    if (!this.isEnabled()) return;
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(8);
        }
      } else {
        const Haptics = getHaptics();
        if (Haptics && Haptics.selectionAsync) {
          Haptics.selectionAsync().catch(() => {
            Vibration.vibrate(10);
          });
        } else {
          Vibration.vibrate(10);
        }
      }
    } catch {
      try {
        Vibration.vibrate(10);
      } catch {
        // Safe fallback
      }
    }
  }

  /**
   * Warning or caution haptic (e.g. deletion, reset).
   */
  warning() {
    if (!this.isEnabled()) return;
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(30);
        }
      } else {
        const Haptics = getHaptics();
        if (Haptics && Haptics.notificationAsync) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {
            Vibration.vibrate(35);
          });
        } else {
          Vibration.vibrate(35);
        }
      }
    } catch {
      try {
        Vibration.vibrate(35);
      } catch {
        // Safe fallback
      }
    }
  }
}

export const hapticService = new HapticService();
