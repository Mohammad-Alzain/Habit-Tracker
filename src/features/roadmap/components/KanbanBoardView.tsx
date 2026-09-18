import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs, SubTaskLogs } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { AppLanguage } from '../../../utils/i18n';
import { hapticService } from '../../../services/hapticService';
import { soundService } from '../../../services/soundService';
import { formatFriendlyDate, parseISODate, formatDateToISO } from '../../../utils/dateUtils';
import { SubTaskItem } from './SubTaskItem';
import { ActiveTimerSession } from '../../timer/TaskTimerModal';
import { isHabitActiveInRoadmapOnDay, getScheduledSubTasksForDay } from '../../../utils/habitScheduleUtils';
import { roadmapStyles as styles } from '../styles/roadmapStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface KanbanBoardViewProps {
  activeHabits: Habit[];
  logs: HabitLogs;
  subTaskLogs: SubTaskLogs;
  theme: ThemeColors;
  language: AppLanguage;
  rtl: boolean;
  todayStr: string;
  onToggleSubTask: (habitId: string, subTaskId: string, dateStr: string) => void;
  onToggleHabitDay: (habitId: string, dateStr: string) => void;
  onStartTimer: (session: ActiveTimerSession) => void;
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  activeHabits,
  logs,
  subTaskLogs,
  theme,
  language,
  rtl,
  todayStr,
  onToggleSubTask,
  onToggleHabitDay,
  onStartTimer,
}) => {
  const kanbanScrollRef = useRef<ScrollView>(null);
  const hasScrolledRef = useRef(false);

  const scrollToTodayColumn = (x: number, width: number) => {
    if (!hasScrolledRef.current) {
      hasScrolledRef.current = true;
      const targetX = x - Math.max(0, (SCREEN_WIDTH - width) / 2);
      kanbanScrollRef.current?.scrollTo({
        x: Math.max(0, targetX),
        animated: true,
      });
    }
  };

  // Compute Yesterday and Tomorrow dates
  const todayDate = parseISODate(todayStr);
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDateToISO(yesterdayDate);

  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = formatDateToISO(tomorrowDate);

  const kanbanCols = [
    {
      id: 'yesterday',
      title: 'أمس',
      dateStr: yesterdayStr,
      badgeColor: '#FFA502',
      icon: 'play-back',
    },
    {
      id: 'today',
      title: 'اليوم (التركيز)',
      dateStr: todayStr,
      badgeColor: '#FF6565',
      icon: 'radio-button-on',
    },
    {
      id: 'upcoming',
      title: 'القادمة',
      dateStr: tomorrowStr,
      badgeColor: '#70A1FF',
      icon: 'arrow-forward-circle',
    },
  ];

  // Fallback auto-center on Today upon mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Column width 270 + padding 16 + gap 14 = 300. Center Today column.
      const estimatedX = 16 + 270 + 14;
      scrollToTodayColumn(estimatedX, 270);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView
      ref={kanbanScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.kanbanContent, { flexDirection: rtl ? 'row-reverse' : 'row' }]}
      style={styles.kanbanScroll}
    >
      {kanbanCols.map((col) => {
        const isTodayCol = col.id === 'today';
        const isFuture = col.dateStr > todayStr;
        const dayOfWeek = parseISODate(col.dateStr).getDay() as any;

        // Filter habits active on this specific day of the week
        const colHabits = activeHabits.filter((h) => isHabitActiveInRoadmapOnDay(h, dayOfWeek));

        return (
          <View
            key={col.id}
            onLayout={(e) => {
              if (isTodayCol) {
                scrollToTodayColumn(e.nativeEvent.layout.x, e.nativeEvent.layout.width);
              }
            }}
            style={[
              styles.kanbanColumnCard,
              {
                backgroundColor: isTodayCol
                  ? (theme.glassSurface || '#1E1E25')
                  : (theme.card || '#15151A'),
                borderColor: isTodayCol ? '#FF6565' : theme.border,
                borderWidth: isTodayCol ? 2 : 1,
                opacity: isFuture ? 0.85 : 1,
              },
            ]}
          >
            <View style={[styles.kanbanColHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <View style={[styles.kanbanColBadge, { backgroundColor: `${col.badgeColor}20` }]}>
                <Ionicons name={col.icon as any} size={16} color={col.badgeColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.kanbanColTitle, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                  {col.title}
                </Text>
                <Text style={[styles.kanbanColDate, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
                  {formatFriendlyDate(col.dateStr, language)}
                </Text>
              </View>
            </View>

            {/* Tasks inside this Kanban column */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.kanbanTasksScroll}>
              {colHabits.length > 0 ? (
                colHabits.map((habit) => {
                  const scheduledTasks = getScheduledSubTasksForDay(habit, dayOfWeek);

                  const habitTarget = habit.targetValue || habit.targetPerDay || 1;
                  const isHabitDone = (logs[habit.id]?.[col.dateStr] || 0) >= habitTarget;
                  const completedSubTaskIds = subTaskLogs[habit.id]?.[col.dateStr] || [];

                  return (
                    <View
                      key={habit.id}
                      style={[
                        styles.kanbanHabitBlock,
                        {
                          backgroundColor: isHabitDone ? `${habit.color}15` : (theme.surface || '#202028'),
                          borderColor: isHabitDone ? `${habit.color}40` : theme.border,
                        },
                      ]}
                    >
                      <View style={[styles.kanbanHabitRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                        <Ionicons name={(habit.icon as any) || 'pulse-outline'} size={14} color={habit.color} />
                        <Text style={[styles.kanbanHabitTitle, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                          {habit.name}
                        </Text>
                      </View>

                      {scheduledTasks.length > 0 ? (
                        <View style={styles.kanbanSubTasksList}>
                          {scheduledTasks.map((st) => {
                            const isTaskDone = completedSubTaskIds.includes(st.id);
                            return (
                              <SubTaskItem
                                key={st.id}
                                subTask={st}
                                habitId={habit.id}
                                habitColor={habit.color}
                                dateStr={col.dateStr}
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
                      ) : (
                        /* Quick check for habits without subtasks */
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
                            onToggleHabitDay(habit.id, col.dateStr);
                          }}
                          style={[
                            styles.kanbanQuickCheckBtn,
                            {
                              flexDirection: rtl ? 'row-reverse' : 'row',
                              backgroundColor: isHabitDone ? `${habit.color}25` : 'transparent',
                              borderColor: isHabitDone ? habit.color : theme.border,
                              opacity: isFuture ? 0.55 : 1,
                            },
                          ]}
                        >
                          <Ionicons
                            name={isHabitDone ? 'checkmark-circle' : isFuture ? 'lock-closed' : 'ellipse-outline'}
                            size={14}
                            color={isHabitDone ? habit.color : theme.textMuted}
                          />
                          <Text style={[styles.kanbanQuickCheckText, { color: isHabitDone ? habit.color : theme.textMuted }]}>
                            {isHabitDone ? 'أُنجزت اليوم' : 'تسجيل إنجاز'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyKanbanState}>
                  <Ionicons name="leaf-outline" size={24} color={theme.textMuted} />
                  <Text style={[styles.emptyKanbanText, { color: theme.textMuted }]}>
                    {language === 'ar' ? 'لا توجد عادات مجدولة لهذا اليوم' : 'No habits scheduled for this day'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
};
