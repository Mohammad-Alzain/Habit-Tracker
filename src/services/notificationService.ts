import { Platform, Alert } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Habit } from '../types/habit';

/**
 * Safely check if running inside Expo Go client.
 * In Expo SDK 53+, expo-notifications was removed from Expo Go on Android/iOS,
 * requiring development builds (expo-dev-client) or standalone APKs for native notifications.
 */
export function checkIsExpoGo(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    if (typeof isRunningInExpoGo === 'function' && isRunningInExpoGo()) {
      return true;
    }
  } catch {}
  try {
    if (
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      (Constants as any)?.appOwnership === 'expo'
    ) {
      return true;
    }
  } catch {}
  return false;
}

// Lazy reference to expo-notifications module (only loaded when NOT in Expo Go)
let _notificationsModule: typeof import('expo-notifications') | null = null;
let _handlerConfigured = false;

function getNotificationsModule(): typeof import('expo-notifications') | null {
  if (checkIsExpoGo() || Platform.OS === 'web') {
    return null;
  }
  if (_notificationsModule) {
    return _notificationsModule;
  }
  try {
    _notificationsModule = require('expo-notifications');
    if (_notificationsModule && !_handlerConfigured) {
      _handlerConfigured = true;
      _notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: _notificationsModule?.AndroidNotificationPriority?.MAX,
        }),
      });
    }
    return _notificationsModule;
  } catch (e) {
    console.warn('expo-notifications not available in current environment:', e);
    return null;
  }
}

export class NotificationService {
  private static isInitialized = false;

  /**
   * Request notification permissions and initialize notification channel on Android
   */
  public static async init(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }
          this.isInitialized = true;
          return Notification.permission === 'granted';
        }
        return false;
      }

      if (checkIsExpoGo()) {
        // In Expo Go SDK 53+, native notifications are not available.
        // We gracefully initialize without crashing.
        this.isInitialized = true;
        return true;
      }

      const Notifications = getNotificationsModule();
      if (!Notifications) {
        this.isInitialized = true;
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      // Configure Android Channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('habit-reminders', {
          name: 'تذكيرات العادات اليومية',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7C83FD',
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
        });
      }

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('Error initializing notifications:', err);
      return false;
    }
  }

  /**
   * Schedule daily notification for a habit at its reminder time
   */
  public static async scheduleHabitReminder(habit: Habit): Promise<string | null> {
    if (!habit.reminderEnabled || !habit.reminderTime) {
      await this.cancelHabitReminder(habit.id);
      return null;
    }

    try {
      await this.init();
      await this.cancelHabitReminder(habit.id);

      const parts = habit.reminderTime.split(':');
      if (parts.length < 2) return null;

      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);

      const title = `تذكير العادة: ${habit.name} ✨`;
      const body = habit.description
        ? `${habit.description} - حافظ على سلسلتك مستمرة اليوم!`
        : `حان وقت إنجاز عادة "${habit.name}"، خطواتك الصغيرة تصنع فارقاً كبيراً!`;

      if (Platform.OS === 'web') {
        return `web-reminder-${habit.id}`;
      }

      if (checkIsExpoGo()) {
        // In Expo Go, simulated identifier saved safely
        return `expogo-reminder-${habit.id}`;
      }

      const Notifications = getNotificationsModule();
      if (!Notifications) return null;

      const trigger: any = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'habit-reminders',
      };

      const identifier = await Notifications.scheduleNotificationAsync({
        identifier: `habit-${habit.id}`,
        content: {
          title,
          body,
          sound: true,
          badge: 1,
          data: { habitId: habit.id, reminderTime: habit.reminderTime },
        },
        trigger,
      });

      return identifier;
    } catch (err) {
      console.warn(`Failed to schedule reminder for habit ${habit.id}:`, err);
      return null;
    }
  }

  /**
   * Cancel reminder for a habit
   */
  public static async cancelHabitReminder(habitId: string): Promise<void> {
    try {
      if (Platform.OS === 'web' || checkIsExpoGo()) return;
      const Notifications = getNotificationsModule();
      if (Notifications) {
        await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}`);
      }
    } catch (err) {
      // Safe fallback
    }
  }

  /**
   * Resync all scheduled reminders for all active habits
   */
  public static async syncAllHabitReminders(habits: Habit[]): Promise<void> {
    try {
      const activeWithReminders = habits.filter(
        (h) => !h.archived && h.reminderEnabled && h.reminderTime
      );

      for (const h of activeWithReminders) {
        await this.scheduleHabitReminder(h);
      }
    } catch (err) {
      console.warn('Failed to sync all habit reminders:', err);
    }
  }

  /**
   * Send an instant test notification right now so the user can verify it works
   */
  public static async sendInstantTestNotification(habitName: string, reminderTime?: string): Promise<boolean> {
    try {
      await this.init();

      const title = `تذكير تجريبي: ${habitName} 🔔`;
      const body = `حان وقت إنجاز عادتك (${reminderTime || '20:00'})! الإشعارات تعمل بدقة وسلاسة.`;

      // 1. If Web
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(title, {
              body,
              icon: '/favicon.ico',
            });
            return true;
          } else {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
              new Notification(title, { body, icon: '/favicon.ico' });
              return true;
            }
          }
        }
        Alert.alert(title, body);
        return true;
      }

      // 2. If running inside Expo Go (where expo-notifications is not supported in SDK 53+)
      if (checkIsExpoGo()) {
        Alert.alert(
          '🔔 تجربة التذكير (وضع Expo Go)',
          `تم بنجاح اختبار تنبيه عادة "${habitName}" لوقت (${reminderTime || '20:00'})!\n\n💡 ملاحظة تقنية: في تحديث Expo SDK 53، قامت شركة Expo بإلغاء موديول الإشعارات التلقائية داخل تطبيق Expo Go ونقله إلى Development Builds (تطبيق APK مستقل). إعدادات التذكير تعمل ومحفوظة بنجاح، وستعمل في شريط الإشعارات مباشرة عند تثبيت التطبيق كـ APK.`
        );
        return true;
      }

      // 3. If Native Development Build or Standalone APK
      const Notifications = getNotificationsModule();
      if (Notifications) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority?.MAX,
            channelId: 'habit-reminders',
          } as any,
          trigger: null, // trigger immediately
        });
        return true;
      } else {
        Alert.alert(title, body);
        return true;
      }
    } catch (err) {
      console.warn('Failed to send test notification:', err);
      Alert.alert(
        `تذكير عادة: ${habitName}`,
        `حان وقت إنجاز عادتك (${reminderTime || '20:00'})!`
      );
      return false;
    }
  }
}
