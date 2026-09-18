import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  LayoutAnimation,
  Animated,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitCategory, HabitLogs, ViewMode, DayOfWeek } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { HabitKitTile } from '../components/HabitKitTile';
import { ChecklistHabitCard } from '../components/ChecklistHabitCard';
import { CompactWeeklyCard } from '../components/CompactWeeklyCard';
import { HabitKitHeader } from '../components/HabitKitHeader';
import { SlipReflectionModal } from '../components/SlipReflectionModal';
import { calculateHabitStats } from '../utils/streakUtils';
import { getTodayString, parseISODate } from '../utils/dateUtils';
import { isHabitScheduledForDay } from '../utils/habitScheduleUtils';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { t, isRTL, AppLanguage } from '../utils/i18n';
import * as Clipboard from 'expo-clipboard';
import { getDailyQuote, getRandomQuote, MotivationalQuote } from '../constants/motivationalQuotes';

const isNewArch = Boolean((globalThis as any).nativeFabricUIManager || (globalThis as any).RN$Bridgeless);
if (Platform.OS === 'android' && !isNewArch && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HabitsScreenProps {
  habits: Habit[];
  logs: HabitLogs;
  theme: ThemeColors;
  viewMode: ViewMode;
  language?: AppLanguage;
  onToggleToday: (habitId: string) => void;
  onTogglePastDate: (habitId: string, dateStr: string) => void;
  onAdjustNumeric?: (habitId: string, delta: number) => void;
  onStartTimer?: (habit: Habit) => void;
  onPressHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onAddNew: () => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  onOpenRoadmap?: () => void;
  onOpenWidgets?: () => void;
  onOpenTemplates?: () => void;
  onOpenMilestones?: () => void;
  onOpenStacks?: () => void;
  onOpenReorder?: () => void;
  onReorderHabits?: (reorderedHabits: Habit[]) => void;
  onLogCraving?: (habitId: string) => void;
  onLogSlip?: (habitId: string, dateStr: string, reason: string) => void;
}

export const HabitsScreen: React.FC<HabitsScreenProps> = ({
  habits,
  logs,
  theme,
  viewMode,
  language = 'ar',
  onToggleToday,
  onTogglePastDate,
  onAdjustNumeric,
  onStartTimer,
  onPressHabit,
  onDeleteHabit,
  onAddNew,
  onOpenSettings,
  onOpenAnalytics,
  onOpenRoadmap,
  onOpenWidgets,
  onOpenTemplates,
  onOpenMilestones,
  onOpenStacks,
  onOpenReorder,
  onReorderHabits,
  onLogCraving,
  onLogSlip,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | HabitCategory>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'pending' | 'completed' | 'streak'>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [showTwoDayBanner, setShowTwoDayBanner] = useState(true);
  const [slipModalHabit, setSlipModalHabit] = useState<Habit | null>(null);
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote>(() => getDailyQuote());
  const [showQuoteBanner, setShowQuoteBanner] = useState(true);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const rtl = isRTL(language);

  const handleShuffleQuote = () => {
    hapticService.light();
    setCurrentQuote(getRandomQuote());
  };

  const handleCopyQuote = async () => {
    hapticService.success();
    await Clipboard.setStringAsync(`"${currentQuote.text}" - ${currentQuote.author || 'حكمة'}`);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  // Smooth filter collapse animation
  const filterAnim = useRef(new Animated.Value(showFilters ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(filterAnim, {
      toValue: showFilters ? 1 : 0,
      friction: 8,
      tension: 50,
      useNativeDriver: false,
    }).start();
  }, [showFilters]);

  // Direct DnD in-place reordering state
  const [draggingHabitId, setDraggingHabitId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);
  const justFinishedDrag = useRef(false);
  const longPressTimer = useRef<any>(null);
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const dragScale = useRef(new Animated.Value(1)).current;
  const dragTranslate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const [localHabits, setLocalHabits] = useState<Habit[]>([]);

  // Sync local habits when habits prop updates and user is not currently dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalHabits(habits.filter((h) => !h.archived));
    }
  }, [habits]);

  const handleTouchStart = (habitId: string, pageX: number, pageY: number) => {
    touchStartPos.current = { x: pageX, y: pageY };
    dragTranslate.setValue({ x: 0, y: 0 });

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    longPressTimer.current = setTimeout(() => {
      isDraggingRef.current = true;
      setDraggingHabitId(habitId);
      hapticService.medium();
      soundService.playTap();

      Animated.spring(dragScale, {
        toValue: 1.06,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }, 320);
  };

  const handleTouchMove = (habitId: string, pageX: number, pageY: number) => {
    const deltaX = pageX - touchStartPos.current.x;
    const deltaY = pageY - touchStartPos.current.y;
    const dist = Math.hypot(deltaX, deltaY);

    if (!isDraggingRef.current) {
      // If moved more than 10px before long-press activates, cancel timer (user is scrolling)
      if (dist > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      return;
    }

    // User is dragging! Move card with finger
    dragTranslate.setValue({ x: deltaX * 0.4, y: deltaY });

    const currentIndex = localHabits.findIndex((h) => h.id === habitId);
    if (currentIndex === -1) return;

    let targetIndex = currentIndex;

    if (viewMode === 'heatmap') {
      // 2-Column Grid
      const THRESHOLD_Y = 90;
      const THRESHOLD_X = 65;

      if (deltaY > THRESHOLD_Y && currentIndex + 2 < localHabits.length) {
        targetIndex = currentIndex + 2;
        touchStartPos.current.y += THRESHOLD_Y;
      } else if (deltaY < -THRESHOLD_Y && currentIndex - 2 >= 0) {
        targetIndex = currentIndex - 2;
        touchStartPos.current.y -= THRESHOLD_Y;
      } else if (rtl ? deltaX < -THRESHOLD_X : deltaX > THRESHOLD_X) {
        if (currentIndex % 2 === 0 && currentIndex + 1 < localHabits.length) {
          targetIndex = currentIndex + 1;
          touchStartPos.current.x += (rtl ? -THRESHOLD_X : THRESHOLD_X);
        }
      } else if (rtl ? deltaX > THRESHOLD_X : deltaX < -THRESHOLD_X) {
        if (currentIndex % 2 === 1 && currentIndex - 1 >= 0) {
          targetIndex = currentIndex - 1;
          touchStartPos.current.x += (rtl ? THRESHOLD_X : -THRESHOLD_X);
        }
      }
    } else {
      // 1-Column List
      const THRESHOLD_Y = 55;
      if (deltaY > THRESHOLD_Y && currentIndex + 1 < localHabits.length) {
        targetIndex = currentIndex + 1;
        touchStartPos.current.y += THRESHOLD_Y;
      } else if (deltaY < -THRESHOLD_Y && currentIndex - 1 >= 0) {
        targetIndex = currentIndex - 1;
        touchStartPos.current.y -= THRESHOLD_Y;
      }
    }

    if (targetIndex !== currentIndex) {
      try {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      } catch {}
      hapticService.selection();
      setLocalHabits((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(currentIndex, 1);
        updated.splice(targetIndex, 0, moved);
        return updated;
      });
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      justFinishedDrag.current = true;
      setTimeout(() => {
        justFinishedDrag.current = false;
      }, 400);

      Animated.parallel([
        Animated.spring(dragScale, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
        Animated.spring(dragTranslate, { toValue: { x: 0, y: 0 }, friction: 6, tension: 50, useNativeDriver: true }),
      ]).start(() => {
        setDraggingHabitId(null);
      });

      hapticService.success();
      soundService.playComplete();

      if (onReorderHabits) {
        onReorderHabits(localHabits);
      }
    }
  };

  const handleToggleFilterVisibility = () => {
    hapticService.selection();
    soundService.playTap();
    setShowFilters((prev) => !prev);
  };

  const todayStr = getTodayString();
  const activeHabits = localHabits.length > 0 ? localHabits : habits.filter((h) => !h.archived);

  const handleToggleTodayWithEffects = React.useCallback((habitId: string) => {
    soundService.playComplete();
    hapticService.success();
    onToggleToday(habitId);
  }, [onToggleToday]);

  const handleTogglePastDateWithEffects = React.useCallback((habitId: string, dateStr: string) => {
    soundService.playComplete();
    hapticService.light();
    onTogglePastDate(habitId, dateStr);
  }, [onTogglePastDate]);

  const handleAdjustNumericWithEffects = React.useCallback((habitId: string, delta: number) => {
    if (delta > 0) {
      soundService.playTap();
      hapticService.light();
    } else {
      hapticService.light();
    }
    onAdjustNumeric && onAdjustNumeric(habitId, delta);
  }, [onAdjustNumeric]);

  // Daily focus summary stats
  const totalActiveCount = activeHabits.length;
  let todayCompletedCount = 0;
  let todayFocusMinutes = 0;

  for (const h of activeHabits) {
    const val = logs[h.id]?.[todayStr] || 0;
    const thresh = h.targetValue || h.targetPerDay || 1;
    if (val >= thresh) {
      todayCompletedCount++;
    }
    if (h.type === 'timer') {
      todayFocusMinutes += val;
    }
  }

  const todayPercent = totalActiveCount > 0
    ? Math.round((todayCompletedCount / totalActiveCount) * 100)
    : 0;

  // Check Two-Day Rule: habits missed yesterday and not done today
  const atRiskHabits = activeHabits.filter((h) => {
    const stats = calculateHabitStats(h, logs);
    return stats.missedYesterday;
  });

  // Filter habits by category & quick filter
  let displayHabits = activeHabits.filter((h) => {
    return selectedCategory === 'all' || h.category === selectedCategory;
  });

  const todayDayOfWeek = parseISODate(todayStr).getDay() as DayOfWeek;

  if (quickFilter === 'pending') {
    displayHabits = displayHabits.filter((h) => {
      // Unscheduled habits for today are not pending today
      if (!isHabitScheduledForDay(h, todayDayOfWeek)) return false;
      const threshold = h.targetValue || h.targetPerDay || 1;
      return (logs[h.id]?.[todayStr] || 0) < threshold;
    });
  } else if (quickFilter === 'completed') {
    displayHabits = displayHabits.filter((h) => {
      const threshold = h.targetValue || h.targetPerDay || 1;
      return (logs[h.id]?.[todayStr] || 0) >= threshold;
    });
  } else if (quickFilter === 'streak') {
    displayHabits = [...displayHabits].sort((a, b) => {
      const sA = calculateHabitStats(a, logs).currentStreak;
      const sB = calculateHabitStats(b, logs).currentStreak;
      return sB - sA;
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Top Header */}
      <HabitKitHeader
        theme={theme}
        language={language}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenSettings={onOpenSettings}
        onOpenAnalytics={onOpenAnalytics}
        onAddNew={onAddNew}
        onOpenRoadmap={onOpenRoadmap}
        onOpenWidgets={onOpenWidgets}
        onOpenTemplates={onOpenTemplates}
        onOpenMilestones={onOpenMilestones}
        onOpenStacks={onOpenStacks}
        onOpenReorder={onOpenReorder}
        onToggleFilter={handleToggleFilterVisibility}
        isFilterHidden={!showFilters}
      />

      {/* Quick Filters Bar (Collapsible with smooth animation) */}
      <Animated.View
        style={{
          maxHeight: filterAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 56],
          }),
          opacity: filterAnim,
          transform: [
            {
              translateY: filterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-12, 0],
              }),
            },
            {
              scale: filterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
          overflow: 'hidden',
        }}
      >
        <View style={[styles.quickFilterBar, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          {[
            { id: 'all', label: t('all', language) },
            { id: 'pending', label: t('pending', language) },
            { id: 'completed', label: t('completed', language) },
            { id: 'streak', label: t('streak', language) },
          ].map((f) => {
            const isSel = quickFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                activeOpacity={0.75}
                onPress={() => {
                  hapticService.selection();
                  soundService.playTap();
                  setQuickFilter(f.id as any);
                }}
                style={[
                  styles.quickFilterChip,
                  {
                    backgroundColor: isSel ? '#7C83FD' : theme.surface,
                    borderColor: isSel ? '#7C83FD' : theme.border,
                  },
                ]}
              >
                <Text style={[styles.quickFilterText, { color: isSel ? '#FFFFFF' : theme.textDim, fontWeight: isSel ? '800' : '600' }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={!draggingHabitId}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Floating In-Place Drag Reorder Indicator */}
        {draggingHabitId && (
          <Animated.View
            style={[
              styles.floatingDragBanner,
              {
                backgroundColor: theme.card,
                borderColor: '#7C83FD',
                flexDirection: rtl ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Ionicons name="swap-vertical" size={16} color="#7C83FD" />
            <Text style={[styles.floatingDragText, { color: theme.text }]}>
              {t('dragToReorder', language)}
            </Text>
            <View style={styles.dragPillIndicator}>
              <Text style={styles.dragPillIndicatorText}>
                {t('releaseToDrop', language)}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Daily Motivation Card */}
        {showQuoteBanner && (
          <View
            style={[
              styles.quoteCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
                shadowColor: theme.text === '#FFFFFF' ? '#000000' : '#0F172A',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: theme.text === '#FFFFFF' ? 0.30 : 0.08,
                shadowRadius: 20,
                elevation: 6,
              },
            ]}
          >
            {/* Header */}
            <View style={[styles.quoteCardHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.quoteTitleRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <Ionicons name="sparkles" size={15} color="#F1C40F" />
                <Text style={[styles.quoteSectionTitle, { color: theme.text }]}>
                  {language === 'ar' ? 'إلهام اليوم' : 'Daily Inspiration'}
                </Text>
              </View>

              <View style={[styles.quoteActionsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleShuffleQuote}
                  style={[styles.quoteActionBtn, { backgroundColor: theme.inputBg || theme.surface }]}
                  accessibilityLabel="اقتباس آخر"
                >
                  <Ionicons name="dice-outline" size={14} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleCopyQuote}
                  style={[styles.quoteActionBtn, { backgroundColor: theme.inputBg || theme.surface }]}
                  accessibilityLabel="نسخ الاقتباس"
                >
                  <Ionicons
                    name={copiedQuote ? 'checkmark' : 'copy-outline'}
                    size={14}
                    color={copiedQuote ? '#2ECC71' : theme.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowQuoteBanner(false)}
                  style={[styles.quoteActionBtn, { backgroundColor: theme.inputBg || theme.surface }]}
                >
                  <Ionicons name="close" size={14} color={theme.textDim} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quote Body */}
            <Text
              style={[
                styles.quoteBodyText,
                { color: theme.text, textAlign: rtl ? 'right' : 'left' },
              ]}
            >
              "{currentQuote.text}"
            </Text>

            {/* Author */}
            {!!currentQuote.author && (
              <Text
                style={[
                  styles.quoteAuthorText,
                  { color: theme.textDim, textAlign: rtl ? 'left' : 'right' },
                ]}
              >
                — {currentQuote.author}
              </Text>
            )}
          </View>
        )}

        {/* Smart Daily Focus Summary Card */}
        {totalActiveCount > 0 && (
          <View
            style={[
              styles.dailySummaryCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.dailySummaryRow}>
              <View style={styles.dailySummaryStats}>
                <View style={styles.dailyBadgeRow}>
                  <View style={[styles.dailyPercentBadge, { backgroundColor: todayCompletedCount === totalActiveCount ? 'rgba(46, 204, 113, 0.2)' : 'rgba(124, 131, 253, 0.18)' }]}>
                    <Text style={[styles.dailyPercentText, { color: todayCompletedCount === totalActiveCount ? '#2ECC71' : '#7C83FD' }]}>
                      {todayPercent}%
                    </Text>
                  </View>
                  <Text style={[styles.dailySummaryTitle, { color: theme.text }]}>
                    {todayCompletedCount} من {totalActiveCount} عادات منجزة اليوم
                  </Text>
                </View>

                {todayFocusMinutes > 0 && (
                  <View style={[styles.focusMinutesPill, { backgroundColor: 'rgba(0, 206, 201, 0.15)', borderColor: 'rgba(0, 206, 201, 0.3)' }]}>
                    <Ionicons name="timer-outline" size={12} color="#00CEC9" />
                    <Text style={styles.focusMinutesText}>
                      {todayFocusMinutes} دقيقة تركيز
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Micro progress line */}
            <View style={[styles.summaryTrack, { backgroundColor: theme.surface }]}>
              <View
                style={[
                  styles.summaryFill,
                  {
                    width: `${todayPercent}%`,
                    backgroundColor: todayCompletedCount === totalActiveCount ? '#2ECC71' : '#7C83FD',
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Two-Day Rule Alert Banner (Atomic Habits) */}
        {showTwoDayBanner && atRiskHabits.length > 0 && (
          <View style={[styles.atRiskBanner, { backgroundColor: 'rgba(231, 76, 60, 0.12)', borderColor: 'rgba(231, 76, 60, 0.35)' }]}>
            <View style={styles.atRiskHeaderRow}>
              <TouchableOpacity onPress={() => setShowTwoDayBanner(false)}>
                <Ionicons name="close" size={18} color={theme.textDim} />
              </TouchableOpacity>
              <View style={styles.atRiskTitleWrap}>
                <Text style={styles.atRiskTitle}>قاعدة عدم الانقطاع مرتين</Text>
                <Ionicons name="flame" size={16} color="#E74C3C" />
              </View>
            </View>
            <Text style={[styles.atRiskDesc, { color: theme.text }]}>
              انتبه: لم تسجل عادة{' '}
              <Text style={{ fontWeight: '800', color: '#E74C3C' }}>
                "{atRiskHabits.map((h) => h.name).slice(0, 2).join('، ')}"
              </Text>{' '}
              بالأمس! قاعدة العادات الذرية تنص: "لا تنقطع مرتين أبداً". أكملها اليوم لحماية مسارك.
            </Text>
          </View>
        )}

        {displayHabits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
              <Ionicons name="sparkles-outline" size={40} color="#7C83FD" />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>لا توجد عادات مطابقة</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>
              {quickFilter !== 'all'
                ? 'جرب اختيار فلتر "الكل" لعرض كافة العادات'
                : 'اضغط زر + الأرجواني في الأعلى لإنشاء عادة جديدة'}
            </Text>
          </View>
        ) : (
          <View style={viewMode === 'heatmap' ? styles.gridRowWrap : styles.listColWrap}>
            {displayHabits.map((habit) => {
              const isBeingDragged = draggingHabitId === habit.id;

              return (
                <Animated.View
                  key={habit.id}
                  style={[
                    viewMode === 'heatmap' ? styles.tileWrapper : styles.cardWrapper,
                    isBeingDragged && {
                      transform: [
                        { scale: dragScale },
                        { translateX: dragTranslate.x },
                        { translateY: dragTranslate.y },
                      ],
                      zIndex: 9999,
                      elevation: 25,
                      shadowColor: habit.color || '#7C83FD',
                      shadowOffset: { width: 0, height: 12 },
                      shadowOpacity: 0.55,
                      shadowRadius: 18,
                    },
                  ]}
                  onTouchStart={(e) => handleTouchStart(habit.id, e.nativeEvent.pageX, e.nativeEvent.pageY)}
                  onTouchMove={(e) => handleTouchMove(habit.id, e.nativeEvent.pageX, e.nativeEvent.pageY)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                  {viewMode === 'checklist' ? (
                    <ChecklistHabitCard
                      habit={habit}
                      logs={logs}
                      theme={theme}
                      style={{ width: '100%', marginBottom: 0 }}
                      onToggleToday={handleToggleTodayWithEffects}
                      onAdjustNumeric={handleAdjustNumericWithEffects}
                      onStartTimer={onStartTimer}
                      onPressCard={(h) => {
                        if (isDraggingRef.current || justFinishedDrag.current) return;
                        hapticService.light();
                        onPressHabit(h);
                      }}
                      onDeleteHabit={onDeleteHabit}
                      onLogCraving={onLogCraving}
                      onOpenSlipModal={setSlipModalHabit}
                    />
                  ) : viewMode === 'compact' ? (
                    <CompactWeeklyCard
                      habit={habit}
                      logs={logs}
                      theme={theme}
                      style={{ width: '100%', marginBottom: 0 }}
                      onToggleDate={handleTogglePastDateWithEffects}
                      onPressCard={(h) => {
                        if (isDraggingRef.current || justFinishedDrag.current) return;
                        hapticService.light();
                        onPressHabit(h);
                      }}
                      onDeleteHabit={onDeleteHabit}
                    />
                  ) : (
                    <HabitKitTile
                      habit={habit}
                      logs={logs}
                      theme={theme}
                      style={{ width: '100%', marginBottom: 0 }}
                      onToggleToday={handleToggleTodayWithEffects}
                      onStartTimer={onStartTimer}
                      onAdjustNumeric={handleAdjustNumericWithEffects}
                      onPressCard={(h) => {
                        if (isDraggingRef.current || justFinishedDrag.current) return;
                        hapticService.light();
                        onPressHabit(h);
                      }}
                      onDeleteHabit={onDeleteHabit}
                      onLogCraving={onLogCraving}
                      onOpenSlipModal={setSlipModalHabit}
                    />
                  )}
                </Animated.View>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Compassionate Slip Reflection Modal for Quit Habits */}
      <SlipReflectionModal
        visible={!!slipModalHabit}
        habit={slipModalHabit}
        theme={theme}
        language={language}
        onClose={() => setSlipModalHabit(null)}
        onConfirmSlip={(habitId, dateStr, reason) => {
          onLogSlip?.(habitId, dateStr, reason);
          setSlipModalHabit(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  quickFilterBar: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  quickFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickFilterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  atRiskBanner: {
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 12,
    marginBottom: 12,
  },
  atRiskHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  atRiskTitleWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  atRiskTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#E74C3C',
  },
  atRiskDesc: {
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'right',
  },
  gridRowWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listColWrap: {
    flexDirection: 'column',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
  quoteCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 14,
    marginBottom: 12,
  },
  quoteCardHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quoteTitleRow: {
    alignItems: 'center',
    gap: 6,
  },
  quoteSectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  quoteActionsRow: {
    alignItems: 'center',
    gap: 6,
  },
  quoteActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteBodyText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  quoteAuthorText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  dailySummaryCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 12,
    marginBottom: 12,
  },
  dailySummaryRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dailySummaryStats: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyBadgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  dailyPercentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dailyPercentText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dailySummaryTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  focusMinutesPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  focusMinutesText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00CEC9',
  },
  summaryTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  summaryFill: {
    height: '100%',
    borderRadius: 2,
  },
  tileWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  floatingDragBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
    shadowColor: '#7C83FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingDragText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  dragPillIndicator: {
    backgroundColor: '#7C83FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dragPillIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
});
