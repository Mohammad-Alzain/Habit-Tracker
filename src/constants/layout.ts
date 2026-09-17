import { Platform, StatusBar } from 'react-native';

/**
 * Safe top padding for full-screen modals (Settings, HabitModal, HabitDetailModal, Analytics)
 * Ensures headers are never obscured by the Android translucent status bar or iOS notch / dynamic island.
 */
export const FULL_SCREEN_SAFE_TOP: number = Platform.select({
  ios: 52,
  android: (StatusBar.currentHeight || 24) + 14,
  default: 16,
}) as number;

/**
 * Safe top padding for dialog overlays and card popups.
 * Guarantees that dialog cards always start comfortably below the system status bar.
 */
export const DIALOG_SAFE_TOP: number = Platform.select({
  ios: 54,
  android: (StatusBar.currentHeight || 24) + 20,
  default: 24,
}) as number;

/**
 * Safe bottom padding for dialog overlays and bottom sheets.
 */
export const DIALOG_SAFE_BOTTOM: number = Platform.select({
  ios: 34,
  android: 24,
  default: 20,
}) as number;
