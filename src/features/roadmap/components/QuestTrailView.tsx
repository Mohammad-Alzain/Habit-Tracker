import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs, SubTaskLogs } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { AppLanguage } from '../../../utils/i18n';
import { hapticService } from '../../../services/hapticService';
import { soundService } from '../../../services/soundService';
import { RoadmapDayItem } from '../hooks/useRoadmap';
import { DaySealNode } from './DaySealNode';
import { SubTaskItem } from './SubTaskItem';
import { AddSubTaskSheet } from './AddSubTaskSheet';
import { ActiveTimerSession } from '../../timer/TaskTimerModal';
import { isHabitActiveInRoadmapOnDay, getScheduledSubTasksForDay } from '../../../utils/habitScheduleUtils';
import { roadmapStyles as styles } from '../styles/roadmapStyles';

interface QuestTrailViewProps {
  days: RoadmapDayItem[];
  activeHabits: Habit[];
  logs: HabitLogs;
  subTaskLogs: SubTaskLogs;
  theme: ThemeColors;
  language: AppLanguage;
  rtl: boolean;
  todayStr: string;
  addingSubTaskHabitId: string | null;
  onSetAddingSubTaskHabitId: (habitId: string | null) => void;
  onToggleSubTask: (habitId: string, subTaskId: string, dateStr: string) => void;
  onToggleHabitDay: (habitId: string, dateStr: string) => void;
  onAddSubTask?: (habitId: string, subTask: any) => void;
  onStartTimer: (session: ActiveTimerSession) => void;
}

export const QuestTrailView: React.FC<QuestTrailViewProps> = ({
  days,
  activeHabits,
  logs,
  subTaskLogs,
  theme,
  language,
  rtl,
  todayStr,
  addingSubTaskHabitId,
  onSetAddingSubTaskHabitId,
  onToggleSubTask,
  onToggleHabitDay,
  onAddSubTask,
  onStartTimer,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const dayCardLayouts = useRef<{ [key: number]: number }>({});
  const hasAutoScrolled = useRef(false);

  const scrollToToday = (y: number) => {
    if (!hasAutoScrolled.current) {
      hasAutoScrolled.current = true;
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 40), animated: true });
    }
  };

  // Centering on Today on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const todayIndex = days.findIndex((d) => d.isToday);
      if (todayIndex >= 0 && dayCardLayouts.current[todayIndex] !== undefined) {
        scrollToToday(dayCardLayouts.current[todayIndex]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [days]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.timelineScroll}
      contentContainerStyle={styles.questTrailContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Intro Header */}
      <View
        style={[
          styles.questTrailIntro,
          {
            backgroundColor: theme.glassSurface || theme.surface,
            borderColor: theme.border,
            flexDirection: rtl ? 'row-reverse' : 'row',
          },
        ]}
      >
        <Ionicons name="trail-sign-outline" size={18} color="#FF6565" />
        <Text style={[styles.questTrailIntroText, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
          خريطة المسار: كل دائرة تمثل يوماً ومحطة. عند اكتمال مهام اليوم يُختم بدائرة خضراء وعلامة صح وتنتقل شارة الرحلة للمحطة التالية!
        </Text>
      </View>

      {/* Paper Path Trail */}
      <View style={styles.trailPathContainer}>
        {days.map((day, dayIndex) => {
          const isLastDay = dayIndex === days.length - 1;
          const isFuture = day.isFuture;

          // Only habits scheduled/active on this day
          const dayHabits = activeHabits.filter((h) => isHabitActiveInRoadmapOnDay(h, day.dayOfWeek));

          // Check if all scheduled tasks/habits for this day are completed
          let totalDayItems = 0;
          let completedDayItems = 0;

          dayHabits.forEach((habit) => {
            const scheduledTasks = getScheduledSubTasksForDay(habit, day.dayOfWeek);

            if (scheduledTasks.length > 0) {
              totalDayItems += scheduledTasks.length;
              const completedIds = subTaskLogs[habit.id]?.[day.dateStr] || [];
              scheduledTasks.forEach((st) => {
                if (completedIds.includes(st.id)) completedDayItems++;
              });
            } else {
              totalDayItems += 1;
              const target = habit.targetValue || habit.targetPerDay || 1;
              if ((logs[habit.id]?.[day.dateStr] || 0) >= target) completedDayItems++;
            }
          });

          const isDayAllDone = totalDayItems > 0 && completedDayItems >= totalDayItems;

          return (
            <View
              key={day.dateStr}
              style={styles.trailStationWrapper}
              onLayout={(e) => {
                const y = e.nativeEvent.layout.y;
                dayCardLayouts.current[dayIndex] = y;
                if (day.isToday) {
                  scrollToToday(y);
                }
              }}
            >
              {/* Vertical connecting trail path */}
              {!isLastDay && (
                <View
                  style={[
                    styles.trailDashedLine,
                    {
                      borderColor: day.isPast || day.isToday ? '#FF6565' : theme.border,
                      borderStyle: isFuture ? 'dotted' : 'solid',
                      opacity: isFuture ? 0.35 : 0.8,
                    },
                  ]}
                />
              )}

              {/* Station Node & Content Card */}
              <View style={[styles.trailNodeAndCardRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                {/* Hand-drawn Circular Seal Node */}
                <DaySealNode
                  dayNum={day.dayNum}
                  dayName={day.dayName}
                  isToday={day.isToday}
                  isPast={day.isPast}
                  isFuture={isFuture}
                  allDone={isDayAllDone}
                  theme={theme}
                />

                {/* Day Card */}
                <View
                  style={[
                    styles.trailStationCard,
                    {
                      backgroundColor: day.isToday
                        ? (theme.glassSurface || '#1E1E26')
                        : (theme.card || '#17171E'),
                      borderColor: day.isToday ? '#FF6565' : theme.border,
                      borderWidth: day.isToday ? 2 : 1,
                      opacity: isFuture ? 0.75 : 1,
                    },
                  ]}
                >
                  <View style={[styles.trailCardHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                    <View>
                      <Text style={[styles.trailDateTitle, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                        {day.dayName}، {day.dayNum} {day.monthName}
                      </Text>
                      <Text style={[styles.trailTaskCountSub, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                        {totalDayItems === 0
                          ? (language === 'ar' ? 'يوم استراحة' : 'Rest day')
                          : `${completedDayItems} من ${totalDayItems} منجز`}
                      </Text>
                    </View>

                    {day.isToday && (
                      <View style={styles.todayGlowPill}>
                        <Ionicons name="sparkles" size={12} color="#FF6565" />
                        <Text style={styles.todayGlowText}>محطتك الحالية</Text>
                      </View>
                    )}
                  </View>

                  {/* Habits & Subtasks for this Station */}
                  <View style={styles.stationTasksList}>
                    {dayHabits.length > 0 ? (
                      dayHabits.map((habit) => {
                        const scheduledTasks = getScheduledSubTasksForDay(habit, day.dayOfWeek);

                        const habitTarget = habit.targetValue || habit.targetPerDay || 1;
                        const isHabitDone = (logs[habit.id]?.[day.dateStr] || 0) >= habitTarget;
                        const completedSubTaskIds = subTaskLogs[habit.id]?.[day.dateStr] || [];

                        return (
                          <View key={habit.id} style={styles.habitBranchGroup}>
                            <View style={[styles.habitBranchLabelRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                              <View style={[styles.miniDot, { backgroundColor: habit.color }]} />
                              <Text style={[styles.habitBranchLabel, { color: habit.color }]}>
                                {habit.name}
                              </Text>
                            </View>

                            {/* If habit has scheduled sub-tasks */}
                            {scheduledTasks.length > 0 ? (
                              scheduledTasks.map((st) => {
                                const isCompleted = completedSubTaskIds.includes(st.id);
                                return (
                                  <SubTaskItem
                                    key={st.id}
                                    subTask={st}
                                    habitId={habit.id}
                                    habitColor={habit.color}
                                    dateStr={day.dateStr}
                                    isCompleted={isCompleted}
                                    isFuture={isFuture}
                                    theme={theme}
                                    rtl={rtl}
                                    onToggle={onToggleSubTask}
                                    onStartTimer={onStartTimer}
                                    habitName={habit.name}
                                    habitIcon={habit.icon}
                                  />
                                );
                              })
                            ) : (
                              /* Direct one-tap habit check */
                              <TouchableOpacity
                                activeOpacity={isFuture ? 0.9 : 0.7}
                                onPress={() => {
                                  if (isFuture) {
                                    hapticService.warning();
                                    Alert.alert('تاريخ مستقبلي', 'لا يمكن تعليم أو إنجاز عادات الأيام القادمة مسبقاً.');
                                    return;
                                  }
                                  if (!isHabitDone) {
                                    hapticService.success();
                                    soundService.playComplete();
                                  } else {
                                    hapticService.light();
                                  }
                                  onToggleHabitDay(habit.id, day.dateStr);
                                }}
                                style={[
                                  styles.trailTaskRow,
                                  {
                                    flexDirection: rtl ? 'row-reverse' : 'row',
                                    backgroundColor: isHabitDone ? `${habit.color}15` : (theme.glassSurface || theme.surface),
                                    borderColor: isHabitDone ? `${habit.color}40` : (theme.glassBorder || theme.border),
                                    opacity: isFuture ? 0.55 : 1,
                                  },
                                ]}
                              >
                                <View
                                  style={[
                                    styles.trailCheckbox,
                                    {
                                      backgroundColor: isHabitDone ? habit.color : 'transparent',
                                      borderColor: isHabitDone ? habit.color : theme.border,
                                      borderWidth: isHabitDone ? 0 : 1.5,
                                    },
                                  ]}
                                >
                                  {isHabitDone ? (
                                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                  ) : isFuture ? (
                                    <Ionicons name="lock-closed" size={10} color={theme.textMuted} />
                                  ) : null}
                                </View>
                                <Text
                                  style={[
                                    styles.trailTaskName,
                                    {
                                      color: isHabitDone ? theme.textMuted : theme.text,
                                      textDecorationLine: isHabitDone ? 'line-through' : 'none',
                                      textAlign: rtl ? 'right' : 'left',
                                    },
                                  ]}
                                >
                                  {habit.name} (إنجاز اليوم)
                                </Text>
                              </TouchableOpacity>
                            )}

                            {/* In-line Sub-task Adder for this Habit */}
                            {addingSubTaskHabitId === `${habit.id}-${day.dateStr}` ? (
                              <AddSubTaskSheet
                                habitId={habit.id}
                                theme={theme}
                                rtl={rtl}
                                onSave={(hId, st) => {
                                  onAddSubTask?.(hId, st);
                                  onSetAddingSubTaskHabitId(null);
                                }}
                                onCancel={() => onSetAddingSubTaskHabitId(null)}
                              />
                            ) : (
                              onAddSubTask && !isFuture && (
                                <TouchableOpacity
                                  onPress={() => onSetAddingSubTaskHabitId(`${habit.id}-${day.dateStr}`)}
                                  style={[styles.addSubTaskTriggerBtn, { flexDirection: rtl ? 'row-reverse' : 'row' }]}
                                >
                                  <Ionicons name="add-circle-outline" size={14} color={theme.textDim} />
                                  <Text style={[styles.addSubTaskTriggerText, { color: theme.textDim }]}>
                                    إضافة التزام فرعي
                                  </Text>
                                </TouchableOpacity>
                              )
                            )}
                          </View>
                        );
                      })
                    ) : (
                      <View style={[styles.restDayNotice, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                        <Ionicons name="leaf-outline" size={15} color={theme.textMuted} />
                        <Text style={[styles.restDayNoticeText, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                          {language === 'ar' ? 'يوم استراحة - لا توجد عادات مجدولة' : 'Rest day - No habits scheduled'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
