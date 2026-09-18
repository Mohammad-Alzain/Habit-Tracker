import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../constants/theme';
import { hapticService } from '../../../services/hapticService';
import { formatFriendlyDate } from '../../../utils/dateUtils';
import { isRTL, AppLanguage } from '../../../utils/i18n';

interface MonthCalendarViewProps {
  habitId: string;
  habitColor: string;
  theme: ThemeColors;
  language?: AppLanguage;
  currentMonthLabel: string;
  monthOffset: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  monthDays: {
    dateStr: string;
    dayNum: number;
    isCompleted: boolean;
    isSlip?: boolean;
    isToday: boolean;
    isPast: boolean;
    isFuture: boolean;
    isFrozen: boolean;
  }[];
  firstDayOfWeek: number;
  selectedDateStr: string;
  todayStr: string;
  isSelectedDateFrozen: boolean;
  onSelectDate: (dateStr: string) => void;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onToggleStreakFreeze?: (habitId: string, dateStr: string) => void;
  onOpenNote: (dateStr: string) => void;
  currentDateNote?: string;
  onStartTimer?: () => void;
  isTimerHabit?: boolean;
}

const WEEK_DAYS_AR = ['سب', 'أح', 'إث', 'ثل', 'أر', 'خم', 'جم'];
const WEEK_DAYS_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  habitId,
  habitColor,
  theme,
  language = 'ar',
  currentMonthLabel,
  monthOffset,
  onPrevMonth,
  onNextMonth,
  monthDays,
  firstDayOfWeek,
  selectedDateStr,
  todayStr,
  isSelectedDateFrozen,
  onSelectDate,
  onToggleDate,
  onToggleStreakFreeze,
  onOpenNote,
  currentDateNote,
  onStartTimer,
  isTimerHabit,
}) => {
  const isSelectedFuture = selectedDateStr > todayStr;
  const isSelectedCompleted = monthDays.find((d) => d.dateStr === selectedDateStr)?.isCompleted;
  const weekDays = language === 'en' ? WEEK_DAYS_EN : WEEK_DAYS_AR;

  const handleDayPress = (d: { dateStr: string; isFuture: boolean }) => {
    onSelectDate(d.dateStr);

    // Prevent completing future days
    if (d.isFuture) {
      hapticService.selection();
      return;
    }

    hapticService.light();
    onToggleDate(habitId, d.dateStr);
  };

  return (
    <View
      style={[
        styles.calendarCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Month Navigator Header: < Month Label > */}
      <View style={styles.monthHeaderRow}>
        <TouchableOpacity onPress={onPrevMonth} style={styles.arrowBtn}>
          <Ionicons name="chevron-back" size={18} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.monthLabel, { color: theme.text }]}>{currentMonthLabel}</Text>

        <TouchableOpacity
          onPress={onNextMonth}
          disabled={monthOffset <= 0}
          style={[styles.arrowBtn, { opacity: monthOffset <= 0 ? 0.3 : 1 }]}
        >
          <Ionicons name="chevron-forward" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Day of Week Headers */}
      <View style={styles.weekLabelsRow}>
        {weekDays.map((wd, i) => (
          <Text key={i} style={[styles.weekLabelText, { color: theme.textDim }]}>
            {wd}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.daysGrid}>
        {Array.from({ length: (firstDayOfWeek + 1) % 7 }).map((_, idx) => (
          <View key={`empty-${idx}`} style={styles.cellWrapper} />
        ))}

        {monthDays.map((d) => {
          const isSelected = d.dateStr === selectedDateStr;

          return (
            <TouchableOpacity
              key={d.dateStr}
              activeOpacity={d.isFuture ? 0.9 : 0.65}
              onPress={() => handleDayPress(d)}
              onLongPress={() => onOpenNote(d.dateStr)}
              style={styles.cellWrapper}
            >
              <View
                style={[
                  styles.dayBox,
                  {
                    backgroundColor: d.isFrozen
                      ? 'rgba(0, 206, 201, 0.22)'
                      : d.isSlip
                      ? 'rgba(231, 76, 60, 0.22)'
                      : d.isCompleted
                      ? `${habitColor}22`
                      : theme.emptyCell,
                    borderColor: d.isFrozen
                      ? '#00CEC9'
                      : d.isSlip
                      ? '#E74C3C'
                      : isSelected
                      ? (d.isCompleted ? habitColor : theme.text)
                      : d.isToday
                      ? habitColor
                      : d.isCompleted
                      ? `${habitColor}55`
                      : theme.border,
                    borderWidth: d.isFrozen || d.isSlip || isSelected ? 2 : d.isToday ? 1.5 : d.isCompleted ? 1.2 : 1,
                    opacity: d.isFuture ? 0.35 : 1,
                  },
                ]}
              >
                {d.isFrozen ? (
                  <Ionicons name="snow" size={13} color="#00CEC9" />
                ) : d.isSlip ? (
                  <Ionicons name="alert-circle" size={14} color="#E74C3C" />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.dayNumText,
                        {
                          color: d.isCompleted
                            ? habitColor
                            : isSelected
                            ? theme.text
                            : d.isToday
                            ? theme.text
                            : theme.textMuted,
                          fontWeight: d.isToday || d.isCompleted ? '800' : '600',
                        },
                      ]}
                    >
                      {d.dayNum}
                    </Text>
                    {d.isToday && (
                      <View
                        style={[
                          styles.todayDot,
                          { backgroundColor: habitColor },
                        ]}
                      />
                    )}
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Day Control Strip */}
      <View style={[styles.dayControlBar, { borderColor: theme.border }]}>
        <View style={styles.dayControlInfo}>
          <Text style={[styles.dayControlDate, { color: theme.text }]}>
            {formatFriendlyDate(selectedDateStr, 'ar')}
          </Text>
          <Text style={[styles.dayControlStatus, { color: theme.textMuted }]}>
            {isSelectedDateFrozen
              ? 'اليوم مجمد (حماية الستريك)'
              : isSelectedFuture
              ? 'يوم قادم (غير متاح للتسجيل)'
              : isSelectedCompleted
              ? 'تم الإنجاز بنجاح'
              : 'لم يكتمل بعد'}
          </Text>
        </View>

        <View style={styles.dayControlActions}>
          {/* Streak Freeze Toggle with 0ms Reactivity */}
          {onToggleStreakFreeze && !isSelectedFuture && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onToggleStreakFreeze(habitId, selectedDateStr)}
              style={[
                styles.actionChip,
                {
                  backgroundColor: isSelectedDateFrozen ? 'rgba(0, 206, 201, 0.2)' : theme.surface,
                  borderColor: isSelectedDateFrozen ? '#00CEC9' : theme.border,
                },
              ]}
            >
              <Ionicons
                name={isSelectedDateFrozen ? 'snow' : 'snow-outline'}
                size={14}
                color={isSelectedDateFrozen ? '#00CEC9' : theme.text}
              />
              <Text
                style={[
                  styles.actionChipText,
                  {
                    color: isSelectedDateFrozen ? '#00CEC9' : theme.text,
                    fontWeight: '700',
                  },
                ]}
              >
                {isSelectedDateFrozen
                  ? (language === 'ar' ? 'إلغاء التجميد' : 'Unfreeze')
                  : (language === 'ar' ? 'تجميد الستريك' : 'Freeze Streak')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Timer shortcut if habit is timer type */}
          {isTimerHabit && onStartTimer && selectedDateStr === todayStr && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onStartTimer}
              style={[styles.actionChip, { backgroundColor: `${habitColor}20`, borderColor: habitColor }]}
            >
              <Ionicons name="timer-outline" size={14} color={habitColor} />
              <Text style={[styles.actionChipText, { color: habitColor }]}>
                {language === 'ar' ? 'بدء المؤقت' : 'Start Timer'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Add/View Note */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onOpenNote(selectedDateStr)}
            style={[
              styles.actionChip,
              {
                backgroundColor: currentDateNote ? 'rgba(124, 131, 253, 0.16)' : theme.surface,
                borderColor: currentDateNote ? '#7C83FD' : theme.border,
              },
            ]}
          >
            <Ionicons
              name={currentDateNote ? 'document-text' : 'document-text-outline'}
              size={14}
              color={currentDateNote ? '#7C83FD' : theme.textMuted}
            />
            <Text
              style={[
                styles.actionChipText,
                {
                  color: currentDateNote ? '#7C83FD' : theme.textMuted,
                  fontWeight: currentDateNote ? '700' : '500',
                },
              ]}
            >
              {currentDateNote
                ? (language === 'ar' ? 'الملاحظة' : 'Note')
                : (language === 'ar' ? 'ملاحظة' : 'Add Note')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Note Snippet Box when note exists */}
        {!!currentDateNote && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onOpenNote(selectedDateStr)}
            style={[
              styles.noteSnippetRow,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons name="chatbox-ellipses-outline" size={14} color="#7C83FD" />
            <Text style={[styles.noteSnippetText, { color: theme.text }]} numberOfLines={2}>
              {currentDateNote}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabelsRow: {
    flexDirection: 'row-reverse',
    marginBottom: 8,
  },
  weekLabelText: {
    fontSize: 11.5,
    fontWeight: '700',
    width: '14.28%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  cellWrapper: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  dayBox: {
    width: 37,
    height: 37,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumText: {
    fontSize: 13,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },
  freezeIcon: {
    fontSize: 12,
  },
  dayControlBar: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dayControlInfo: {
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  dayControlDate: {
    fontSize: 14,
    fontWeight: '800',
  },
  dayControlStatus: {
    fontSize: 11,
    marginTop: 2,
  },
  dayControlActions: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  noteSnippetRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  noteSnippetText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'right',
  },
});
