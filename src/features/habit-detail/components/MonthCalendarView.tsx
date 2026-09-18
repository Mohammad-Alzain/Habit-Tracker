import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../constants/theme';
import { hapticService } from '../../../services/hapticService';
import { formatFriendlyDate, parseISODate } from '../../../utils/dateUtils';
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

const WEEK_DAYS_AR = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
const WEEK_DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  // Calculate leading previous-month trailing days (Monday start: Mon=0 .. Sun=6)
  const leadingSlots = (firstDayOfWeek + 6) % 7;
  const firstDayObj = monthDays[0] ? parseISODate(monthDays[0].dateStr) : new Date();
  const prevMonthLastDayNum = new Date(firstDayObj.getFullYear(), firstDayObj.getMonth(), 0).getDate();
  const prevMonthDays = Array.from({ length: leadingSlots }).map(
    (_, i) => prevMonthLastDayNum - leadingSlots + 1 + i
  );

  // Calculate trailing next-month leading days to make a complete rectangular grid
  const totalOccupied = leadingSlots + monthDays.length;
  const trailingSlots = totalOccupied % 7 === 0 ? 0 : 7 - (totalOccupied % 7);
  const nextMonthDays = Array.from({ length: trailingSlots }).map((_, i) => i + 1);

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
      {/* Day of Week Headers matching Image 2 */}
      <View style={styles.weekLabelsRow}>
        {weekDays.map((wd, i) => (
          <Text key={i} style={[styles.weekLabelText, { color: theme.textDim }]}>
            {wd}
          </Text>
        ))}
      </View>

      {/* Calendar Days Grid matching Image 2 */}
      <View style={styles.daysGrid}>
        {/* Trailing days of previous month (dim text, no box) */}
        {prevMonthDays.map((dayNum, idx) => (
          <View key={`prev-${idx}`} style={styles.cellWrapper}>
            <View style={styles.uncompletedDayBox}>
              <Text style={[styles.dayNumText, { color: theme.textDim, opacity: 0.35 }]}>
                {dayNum}
              </Text>
            </View>
          </View>
        ))}

        {/* Current Month Days */}
        {monthDays.map((d) => {
          const isSelected = d.dateStr === selectedDateStr;
          const isComp = d.isCompleted;
          const isToday = d.isToday;

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
                  d.isFrozen
                    ? styles.frozenDayBox
                    : d.isSlip
                    ? styles.slipDayBox
                    : isComp
                    ? [styles.completedDayBox, { backgroundColor: `${habitColor}35` }]
                    : isToday
                    ? [styles.todayOutlineBox, { borderColor: habitColor }]
                    : styles.uncompletedDayBox,
                  isSelected && !isComp && !isToday && !d.isFrozen && !d.isSlip && {
                    borderColor: 'rgba(255, 255, 255, 0.35)',
                    borderWidth: 1,
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
                          color: isComp || isToday
                            ? '#FFFFFF'
                            : theme.textDim,
                          fontWeight: isComp || isToday ? '800' : '500',
                          opacity: d.isFuture ? 0.35 : 1,
                        },
                      ]}
                    >
                      {d.dayNum}
                    </Text>
                    {isComp && (
                      <View
                        style={[
                          styles.completedDot,
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

        {/* Leading days of next month (dim text, no box) */}
        {nextMonthDays.map((dayNum, idx) => (
          <View key={`next-${idx}`} style={styles.cellWrapper}>
            <View style={styles.uncompletedDayBox}>
              <Text style={[styles.dayNumText, { color: theme.textDim, opacity: 0.35 }]}>
                {dayNum}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Month Navigation Row at the BOTTOM matching Image 2 */}
      <View style={styles.bottomNavRow}>
        {/* Left: Previous / Next Navigation Arrows */}
        <View style={styles.navArrowsGroup}>
          <TouchableOpacity
            onPress={onPrevMonth}
            style={[styles.arrowCircleBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="chevron-back" size={16} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNextMonth}
            disabled={monthOffset <= 0}
            style={[
              styles.arrowCircleBtn,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                opacity: monthOffset <= 0 ? 0.3 : 1,
              },
            ]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="chevron-forward" size={16} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Right: Month / Year Capsule Pill */}
        <View style={[styles.monthCapsulePill, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="calendar-outline" size={15} color={theme.textMuted} />
          <Text style={[styles.monthCapsuleText, { color: theme.text }]}>
            {currentMonthLabel}
          </Text>
        </View>
      </View>

      {/* Long press note hint matching Image 2 */}
      <Text style={[styles.noteHintText, { color: theme.textDim }]}>
        {language === 'ar' ? 'اضغط مطولاً على يوم لإضافة ملاحظة' : 'Long press a day to add a note'}
      </Text>

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
  weekLabelsRow: {
    flexDirection: 'row-reverse',
    marginBottom: 10,
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
    rowGap: 8,
  },
  cellWrapper: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncompletedDayBox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  completedDayBox: {
    borderRadius: 10,
    borderWidth: 0,
  },
  todayOutlineBox: {
    borderRadius: 10,
    borderWidth: 1.8,
    backgroundColor: 'transparent',
  },
  frozenDayBox: {
    backgroundColor: 'rgba(0, 206, 201, 0.22)',
    borderColor: '#00CEC9',
    borderWidth: 1.5,
    borderRadius: 10,
  },
  slipDayBox: {
    backgroundColor: 'rgba(231, 76, 60, 0.22)',
    borderColor: '#E74C3C',
    borderWidth: 1.5,
    borderRadius: 10,
  },
  dayNumText: {
    fontSize: 13.5,
  },
  completedDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    marginTop: 2,
  },
  bottomNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
  },
  navArrowsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCapsulePill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  monthCapsuleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  noteHintText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 2,
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
