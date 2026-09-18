import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs, SubTaskLogs } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { AppLanguage } from '../../../utils/i18n';
import { hapticService } from '../../../services/hapticService';
import { soundService } from '../../../services/soundService';
import { RoadmapDayItem } from '../hooks/useRoadmap';
import { SubTaskItem } from './SubTaskItem';
import { AddSubTaskSheet } from './AddSubTaskSheet';
import { ActiveTimerSession } from '../../timer/TaskTimerModal';
import { isHabitActiveInRoadmapOnDay, getScheduledSubTasksForDay } from '../../../utils/habitScheduleUtils';
import { roadmapStyles as styles } from '../styles/roadmapStyles';

interface DetailedTimelineViewProps {
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

export const DetailedTimelineView: React.FC<DetailedTimelineViewProps> = ({
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
  const cardLayouts = useRef<{ [index: number]: number }>({});
  const hasScrolledRef = useRef(false);

  const scrollToToday = (y: number) => {
    if (!hasScrolledRef.current) {
      hasScrolledRef.current = true;
      scrollRef.current?.scrollTo({
        y: Math.max(0, y - 40),
        animated: true,
      });
    }
  };

  // Center on Today upon mount or data change
  useEffect(() => {
    const timer = setTimeout(() => {
      const todayIndex = days.findIndex((d) => d.isToday);
      if (todayIndex >= 0 && cardLayouts.current[todayIndex] !== undefined) {
        scrollToToday(cardLayouts.current[todayIndex]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [days]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.timelineScroll}
      contentContainerStyle={styles.timelineContent}
      showsVerticalScrollIndicator={false}
    >
      {days.map((day, dayIndex) => {
        const isFuture = day.isFuture;

        // Filter habits active on this specific day
        const dayHabits = activeHabits.filter((h) => isHabitActiveInRoadmapOnDay(h, day.dayOfWeek));

        // Calculate progress for this day
        let totalItems = 0;
        let completedItems = 0;

        dayHabits.forEach((habit) => {
          const scheduledTasks = getScheduledSubTasksForDay(habit, day.dayOfWeek);

          if (scheduledTasks.length > 0) {
            totalItems += scheduledTasks.length;
            const completedIds = subTaskLogs[habit.id]?.[day.dateStr] || [];
            scheduledTasks.forEach((st) => {
              if (completedIds.includes(st.id)) completedItems++;
            });
          } else {
            totalItems += 1;
            const target = habit.targetValue || habit.targetPerDay || 1;
            if ((logs[habit.id]?.[day.dateStr] || 0) >= target) completedItems++;
          }
        });

        const dayProgressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        const isDayComplete = totalItems > 0 && dayProgressPercent === 100;

        return (
          <View
            key={day.dateStr}
            onLayout={(e) => {
              const y = e.nativeEvent.layout.y;
              cardLayouts.current[dayIndex] = y;
              if (day.isToday) {
                scrollToToday(y);
              }
            }}
            style={[
              styles.dayCard,
              {
                backgroundColor: day.isToday
                  ? (theme.glassSurface || '#1F2029')
                  : (theme.card || '#181820'),
                borderColor: isDayComplete
                  ? '#2ED573'
                  : day.isToday
                  ? '#FF6565'
                  : theme.border,
                borderWidth: day.isToday || isDayComplete ? 2 : 1,
                opacity: isFuture ? 0.8 : 1,
              },
            ]}
          >
            {/* Day Header Bar */}
            <View style={[styles.dayCardHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.dayBadgeGroup, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: isDayComplete
                        ? '#2ED573'
                        : day.isToday
                        ? '#FF6565'
                        : isFuture
                        ? 'rgba(255,255,255,0.05)'
                        : theme.surface,
                      borderColor: isDayComplete
                        ? '#2ED573'
                        : day.isToday
                        ? '#FFA0A0'
                        : theme.border,
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  {isDayComplete ? (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  ) : isFuture ? (
                    <Ionicons name="lock-closed-outline" size={14} color={theme.textMuted} />
                  ) : (
                    <Text style={[styles.dayCircleNum, { color: day.isToday ? '#FFFFFF' : theme.text }]}>
                      {day.dayNum}
                    </Text>
                  )}
                </View>
                <View>
                  <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.dayNameText, { color: theme.text }]}>
                      {day.dayName}
                    </Text>
                    {day.isToday && (
                      <View style={styles.todayPill}>
                        <Text style={styles.todayPillText}>اليوم</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.dayDateText, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                    {day.dayNum} {day.monthName}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.dayCompletionPill,
                  {
                    backgroundColor: dayProgressPercent === 100 ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: dayProgressPercent === 100 ? '#2ED573' : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={dayProgressPercent === 100 ? 'checkmark-done' : 'time-outline'}
                  size={14}
                  color={dayProgressPercent === 100 ? '#2ED573' : theme.textMuted}
                />
                <Text
                  style={[
                    styles.dayCompletionText,
                    { color: totalItems === 0 ? theme.textMuted : dayProgressPercent === 100 ? '#2ED573' : theme.textMuted },
                  ]}
                >
                  {totalItems === 0
                    ? (language === 'ar' ? 'استراحة' : 'Rest')
                    : `${completedItems} / ${totalItems}`}
                </Text>
              </View>
            </View>

            {/* List of Habits & Scheduled Sub-tasks */}
            <View style={styles.habitsListContainer}>
              {dayHabits.length > 0 ? (
                dayHabits.map((habit) => {
                  const scheduledTasks = getScheduledSubTasksForDay(habit, day.dayOfWeek);

                  const habitTarget = habit.targetValue || habit.targetPerDay || 1;
                  const isHabitDone = (logs[habit.id]?.[day.dateStr] || 0) >= habitTarget;
                  const completedSubTaskIds = subTaskLogs[habit.id]?.[day.dateStr] || [];

                return (
                  <View
                    key={habit.id}
                    style={[
                      styles.habitSectionCard,
                      {
                        backgroundColor: theme.surface || '#22232D',
                        borderColor: isHabitDone ? `${habit.color}60` : theme.border,
                      },
                    ]}
                  >
                    <View style={[styles.habitSectionHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                      <View
                        style={[
                          styles.habitIconCircle,
                          {
                            backgroundColor: `${habit.color}20`,
                            borderColor: `${habit.color}50`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={(habit.icon as any) || 'pulse-outline'}
                          size={16}
                          color={habit.color}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.habitSectionTitle, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                          {habit.name}
                        </Text>
                      </View>

                      {/* Direct check for habits with 0 subtasks */}
                      {scheduledTasks.length === 0 && (
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
                            }
                            onToggleHabitDay(habit.id, day.dateStr);
                          }}
                          style={[
                            styles.singleHabitCheckBtn,
                            {
                              backgroundColor: isHabitDone ? habit.color : 'transparent',
                              borderColor: isHabitDone ? habit.color : theme.border,
                              borderWidth: isHabitDone ? 0 : 1.5,
                              opacity: isFuture ? 0.55 : 1,
                            },
                          ]}
                        >
                          <Ionicons
                            name={isHabitDone ? 'checkmark' : isFuture ? 'lock-closed' : 'checkmark-outline'}
                            size={16}
                            color={isHabitDone ? '#FFFFFF' : theme.textDim}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Subtasks */}
                    {scheduledTasks.length > 0 && (
                      <View style={styles.subtasksList}>
                        {scheduledTasks.map((st) => {
                          const isTaskDone = completedSubTaskIds.includes(st.id);
                          return (
                            <SubTaskItem
                              key={st.id}
                              subTask={st}
                              habitId={habit.id}
                              habitColor={habit.color}
                              dateStr={day.dateStr}
                              isCompleted={isTaskDone}
                              isFuture={isFuture}
                              theme={theme}
                              rtl={rtl}
                              onToggle={onToggleSubTask}
                              onStartTimer={onStartTimer}
                              habitName={habit.name}
                              habitIcon={habit.icon}
                            />
                          );
                        })}
                      </View>
                    )}

                    {/* In-line Sub-task Adder */}
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
        );
      })}
    </ScrollView>
  );
};
