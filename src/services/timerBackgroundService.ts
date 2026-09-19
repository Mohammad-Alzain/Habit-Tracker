import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { habitStore } from '../store/habitStore';
import { NotificationService, getNotificationsModule } from './notificationService';
import { soundService } from './soundService';
import { hapticService } from './hapticService';
import { getTodayString } from '../utils/dateUtils';

export const TIMER_STORAGE_KEY = '@habit_active_timer_session';

export interface ActiveBackgroundTimerSession {
  sessionId: string;
  habitId: string;
  subTaskId?: string;
  isSubTask: boolean;
  title: string;
  subtitle?: string;
  durationMinutes: number;
  targetEndTime: number; // Date.now() + secondsRemaining * 1000
  dateStr: string;
  isRunning: boolean;
  secondsRemaining?: number;
}

export type TimerBackgroundEvent = 'started' | 'paused' | 'finished' | 'cleared';
export type TimerBackgroundListener = (
  session: ActiveBackgroundTimerSession | null,
  event: TimerBackgroundEvent
) => void;

class TimerBackgroundService {
  private currentSession: ActiveBackgroundTimerSession | null = null;
  private listeners = new Set<TimerBackgroundListener>();
  private appStateSubscription: any = null;
  private notificationResponseSubscription: any = null;
  private isInitialized = false;
  private activeTickerInterval: any = null;

  /**
   * Initializes background service, checks expired sessions, and binds AppState & notification listeners
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Restore any persisted active session
    try {
      const savedStr = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (savedStr) {
        this.currentSession = JSON.parse(savedStr);
      }
    } catch (e) {
      console.warn('Failed to restore active timer session from storage:', e);
    }

    // 2. Check if a session expired while app was completely closed or phone locked
    await this.checkAndReconcile();

    // 3. Listen for app state transitions (e.g. returning to foreground / unlocking phone)
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        this.checkAndReconcile();
      }
    });

    // 4. Listen for notification interaction (user tapped timer finish notification)
    this.setupNotificationListeners();
  }

  private setupNotificationListeners(): void {
    try {
      const Notifications = getNotificationsModule();
      if (Notifications && typeof Notifications.addNotificationResponseReceivedListener === 'function') {
        this.notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
          const data = response?.notification?.request?.content?.data;
          if (data?.type === 'timer_completed') {
            this.handleCompletionFromData(data);
          }
        });
      }
    } catch (e) {
      // Safe fallback
    }
  }

  public subscribe(listener: TimerBackgroundListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: TimerBackgroundEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentSession, event);
      } catch (e) {
        console.warn('Error in TimerBackgroundListener:', e);
      }
    });
  }

  public getSession(): ActiveBackgroundTimerSession | null {
    return this.currentSession;
  }

  /**
   * Starts or resumes a background timer session with real-world target timestamp and scheduled OS alert
   */
  public async startSession(params: {
    habitId: string;
    subTaskId?: string;
    isSubTask: boolean;
    title: string;
    subtitle?: string;
    durationMinutes: number;
    secondsRemaining: number;
    dateStr?: string;
  }): Promise<void> {
    const dateStr = params.dateStr || getTodayString();
    const remaining = Math.max(1, Math.round(params.secondsRemaining));
    const targetEndTime = Date.now() + remaining * 1000;

    const session: ActiveBackgroundTimerSession = {
      sessionId: `timer-${params.habitId}-${params.subTaskId || 'main'}-${Date.now()}`,
      habitId: params.habitId,
      subTaskId: params.subTaskId,
      isSubTask: params.isSubTask,
      title: params.title,
      subtitle: params.subtitle,
      durationMinutes: params.durationMinutes,
      targetEndTime,
      dateStr,
      isRunning: true,
      secondsRemaining: remaining,
    };

    this.currentSession = session;
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(session));

    // Schedule OS completion alert (fires on lockscreen even if app is backgrounded)
    const completionTitle = 'انتهت جلسة التركيز! 🎯';
    const completionBody = session.subtitle
      ? `تم إنجاز "${session.title}" (${session.subtitle}) بنجاح! أحسنت صنعاً.`
      : `تم إنجاز "${session.title}" بنجاح! أحسنت صنعاً.`;

    await NotificationService.scheduleTimerCompletion(
      completionTitle,
      completionBody,
      remaining,
      {
        type: 'timer_completed',
        habitId: session.habitId,
        subTaskId: session.subTaskId,
        isSubTask: session.isSubTask,
        dateStr: session.dateStr,
        durationMinutes: session.durationMinutes,
      }
    );

    // Show initial active notice and start ticker
    this.updateActiveNotification();
    this.startLiveTicker();

    this.emit('started');
  }

  private startLiveTicker(): void {
    this.stopLiveTicker();
    this.activeTickerInterval = setInterval(() => {
      if (this.currentSession && this.currentSession.isRunning) {
        const remaining = Math.max(0, Math.round((this.currentSession.targetEndTime - Date.now()) / 1000));
        if (remaining <= 0) {
          this.stopLiveTicker();
        } else {
          this.updateActiveNotification();
        }
      } else {
        this.stopLiveTicker();
      }
    }, 10000); // update live notification every 10s
  }

  private stopLiveTicker(): void {
    if (this.activeTickerInterval) {
      clearInterval(this.activeTickerInterval);
      this.activeTickerInterval = null;
    }
  }

  private async updateActiveNotification(): Promise<void> {
    if (!this.currentSession || !this.currentSession.isRunning) return;
    const remaining = Math.max(0, Math.round((this.currentSession.targetEndTime - Date.now()) / 1000));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    await NotificationService.showTimerStarted(
      `مؤقت التركيز نشط ⏳ (${timeFormatted})`,
      `جلسة لـ "${this.currentSession.title}"`
    );
  }

  /**
   * Pauses the active timer session and cancels the scheduled alert
   */
  public async pauseSession(secondsRemaining: number): Promise<void> {
    if (!this.currentSession) return;

    this.stopLiveTicker();
    this.currentSession.isRunning = false;
    this.currentSession.secondsRemaining = Math.max(0, Math.round(secondsRemaining));
    this.currentSession.targetEndTime = Date.now() + (this.currentSession.secondsRemaining * 1000);

    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(this.currentSession));
    await NotificationService.cancelTimerNotifications();
    this.emit('paused');
  }

  /**
   * Completes the task in habitStore, cancels notifications, and clears the active session
   */
  public async completeSession(sessionToComplete?: ActiveBackgroundTimerSession | null): Promise<void> {
    const s = sessionToComplete || this.currentSession;
    if (!s) return;

    try {
      if (s.isSubTask && s.subTaskId) {
        habitStore.setSubTaskCompleted(s.habitId, s.subTaskId, true, s.dateStr);
      } else {
        habitStore.logTimerSession(s.habitId, s.durationMinutes, s.dateStr);
      }

      soundService.playComplete();
      hapticService.success();
    } catch (e) {
      console.warn('Failed to complete habit/subtask in habitStore:', e);
    }

    await this.clearSession();
    this.emit('finished');
  }

  /**
   * Clears the current timer session without completing
   */
  public async clearSession(): Promise<void> {
    this.stopLiveTicker();
    this.currentSession = null;
    await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
    await NotificationService.cancelTimerNotifications();
    this.emit('cleared');
  }

  /**
   * Checks if an active session expired while app was in background or phone was locked.
   * If expired, automatically completes the task in habitStore.
   */
  public async checkAndReconcile(): Promise<boolean> {
    if (!this.currentSession) {
      try {
        const savedStr = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (savedStr) {
          this.currentSession = JSON.parse(savedStr);
        }
      } catch (e) {}
    }

    if (!this.currentSession) return false;

    // Check if the timer was running and has reached or surpassed its target end time
    if (this.currentSession.isRunning && Date.now() >= this.currentSession.targetEndTime) {
      const expiredSession = { ...this.currentSession };
      await this.completeSession(expiredSession);
      return true;
    }

    return false;
  }

  /**
   * Handles user tapping or system delivering the timer_completed notification
   */
  private async handleCompletionFromData(data: any): Promise<void> {
    if (!data || !data.habitId) return;

    try {
      if (data.isSubTask && data.subTaskId) {
        habitStore.setSubTaskCompleted(data.habitId, data.subTaskId, true, data.dateStr || getTodayString());
      } else {
        habitStore.logTimerSession(
          data.habitId,
          data.durationMinutes || 15,
          data.dateStr || getTodayString()
        );
      }

      soundService.playComplete();
      hapticService.success();
    } catch (e) {
      console.warn('Failed to handle notification completion in habitStore:', e);
    }

    await this.clearSession();
  }
}

export const timerBackgroundService = new TimerBackgroundService();
