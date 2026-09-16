import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { calculateHabitStats } from '../utils/streakUtils';
import {
  getTodayString,
  parseISODate,
  formatDateToISO,
  getArabicMonth,
  formatFriendlyDate,
} from '../utils/dateUtils';

interface HabitDetailModalProps {
  visible: boolean;
  habit: Habit | null;
  logs: HabitLogs;
  theme: ThemeColors;
  onClose: () => void;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
  onArchiveHabit?: (habitId: string) => void;
  onSaveNote?: (habitId: string, dateStr: string, noteText: string) => void;
  onShareHabit?: (habit: Habit) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  visible,
  habit,
  logs,
  theme,
  onClose,
  onToggleDate,
  onEditHabit,
  onDeleteHabit,
  onArchiveHabit,
  onSaveNote,
  onShareHabit,
}) => {
  if (!habit) return null;

  const stats = calculateHabitStats(habit, logs);
  const habitLogs = logs[habit.id] || {};
  const todayStr = getTodayString();
  const targetThreshold = habit.targetValue || habit.targetPerDay || 1;

  // Selected date for note viewing/editing
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [noteInputVisible, setNoteInputVisible] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Month navigation
  const [monthOffset, setMonthOffset] = useState(0);

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() - monthOffset);
  const currentYear = targetDate.getFullYear();
  const currentMonthIndex = targetDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sun

  const monthDays: { dateStr: string; dayNum: number; isCompleted: boolean; isToday: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(currentYear, currentMonthIndex, d);
    const dStr = formatDateToISO(dObj);
    monthDays.push({
      dateStr: dStr,
      dayNum: d,
      isCompleted: (habitLogs[dStr] || 0) >= targetThreshold,
      isToday: dStr === todayStr,
    });
  }

  const todayDate = parseISODate(todayStr);

  // Mini strip: 5 real months ending with current month
  const stripMonths: string[] = [];
  for (let i = 4; i >= 0; i--) {
    const mDate = new Date(todayDate.getFullYear(), todayDate.getMonth() - i, 1);
    stripMonths.push(getArabicMonth(mDate.getMonth()));
  }

  // 22-column heatmap matrix (22 weeks x 7 days) ending this week
  const todayDayOfWeek = (todayDate.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  const startMatrixDate = new Date(todayDate);
  startMatrixDate.setDate(todayDate.getDate() - todayDayOfWeek - 21 * 7);

  const matrixCols: { dateStr: string; isCompleted: boolean; isToday: boolean; isFuture: boolean }[][] = [];
  for (let c = 0; c < 22; c++) {
    const col: { dateStr: string; isCompleted: boolean; isToday: boolean; isFuture: boolean }[] = [];
    for (let r = 0; r < 7; r++) {
      const cellDate = new Date(startMatrixDate);
      cellDate.setDate(startMatrixDate.getDate() + (c * 7 + r));
      const cellDateStr = formatDateToISO(cellDate);
      const isFuture = cellDateStr > todayStr;
      const isToday = cellDateStr === todayStr;
      const isCompleted = !isFuture && (habitLogs[cellDateStr] || 0) >= targetThreshold;
      col.push({ dateStr: cellDateStr, isCompleted, isToday, isFuture });
    }
    matrixCols.push(col);
  }

  // Dynamic Goal & Month Progress Calculation
  const currentMonthCompletedDays = monthDays.filter((d) => d.isCompleted).length;

  const goalPercent = stats.goalProgressPercent !== undefined
    ? stats.goalProgressPercent
    : Math.min(100, Math.round((currentMonthCompletedDays / Math.max(1, daysInMonth)) * 100));

  const goalDisplayLabel = stats.goalTargetLabel
    ? stats.goalTargetLabel
    : `${currentMonthCompletedDays} / ${daysInMonth} هذا الشهر`;

  const handleOptionsMenu = () => {
    Alert.alert('خيارات العادة', habit.name, [
      {
        text: habit.archived ? 'استعادة العادة (إلغاء الأرشفة)' : 'أرشفة العادة (إخفاء من القائمة الرئيسية)',
        onPress: () => {
          onArchiveHabit && onArchiveHabit(habit.id);
          onClose();
        },
      },
      {
        text: 'حذف العادة نهائياً',
        style: 'destructive',
        onPress: handleDelete,
      },
      { text: 'إلغاء', style: 'cancel' },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('حذف العادة', `هل تريد بالتأكيد حذف عادة "${habit.name}" نهائياً؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          onClose();
          onDeleteHabit && onDeleteHabit(habit.id);
        },
      },
    ]);
  };

  const handleOpenNote = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setNoteText(habit.notes?.[dateStr] || '');
    setNoteInputVisible(true);
  };

  const handleSaveNoteAction = () => {
    if (onSaveNote) {
      onSaveNote(habit.id, selectedDateStr, noteText);
    }
    setNoteInputVisible(false);
  };

  const currentDayNote = habit.notes?.[selectedDateStr];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        {/* Top Header matching Image 4 */}
        <View style={styles.topHeader}>
          {/* Back button */}
          <TouchableOpacity onPress={onClose} style={[styles.circleBtn, { backgroundColor: theme.surface }]}>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>

          {/* Options & Edit */}
          <View style={styles.headerLeftIcons}>
            {onShareHabit && (
              <TouchableOpacity
                onPress={() => onShareHabit(habit)}
                style={[styles.circleBtn, { backgroundColor: theme.surface }]}
              >
                <Ionicons name="share-social-outline" size={18} color={habit.color || theme.primary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleOptionsMenu} style={[styles.circleBtn, { backgroundColor: theme.surface }]}>
              <Ionicons name="settings-outline" size={18} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                onEditHabit(habit);
              }}
              style={[styles.circleBtn, { backgroundColor: theme.surface }]}
            >
              <Ionicons name="pencil" size={17} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Title & Icon Header */}
          <View style={styles.habitHeaderSection}>
            <View style={styles.titleTextCol}>
              <Text style={[styles.mainTitle, { color: theme.text }]}>{habit.name}</Text>
              {habit.description ? (
                <Text style={[styles.subTitle, { color: theme.textMuted }]}>{habit.description}</Text>
              ) : null}
            </View>

            <View
              style={[
                styles.largePulseCircle,
                { backgroundColor: `${habit.color}22`, borderColor: `${habit.color}44` },
              ]}
            >
              <Ionicons
                name={(habit.icon as any) || 'pulse-outline'}
                size={34}
                color={habit.color}
              />
            </View>
          </View>

          {/* Upper Card: Months Strip matching Image 4 */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            {/* Month labels */}
            <View style={styles.stripMonthLabels}>
              {stripMonths.map((m, idx) => (
                <Text key={idx} style={[styles.stripMonthText, { color: theme.textDim }]}>
                  {m}
                </Text>
              ))}
            </View>

            {/* Strip Matrix & side day labels */}
            <View style={styles.stripMatrixRow}>
              <View style={styles.stripSideLabels}>
                <Text style={[styles.stripSideText, { color: theme.textDim }]}>الثلاثا</Text>
                <Text style={[styles.stripSideText, { color: theme.textDim }]}>الخمس</Text>
                <Text style={[styles.stripSideText, { color: theme.textDim }]}>السب</Text>
              </View>

              <View style={styles.stripDotsGrid}>
                {matrixCols.map((col, colIdx) => (
                  <View key={`sc-${colIdx}`} style={styles.stripDotsCol}>
                    {col.map((cell, rowIdx) => {
                      return (
                        <TouchableOpacity
                          key={`sr-${rowIdx}`}
                          disabled={cell.isFuture}
                          activeOpacity={0.6}
                          onPress={() => onToggleDate(habit.id, cell.dateStr)}
                          style={[
                            styles.stripDot,
                            {
                              backgroundColor: cell.isCompleted
                                ? habit.color
                                : cell.isFuture
                                ? 'transparent'
                                : theme.emptyCell,
                              borderColor: cell.isToday ? habit.color : 'transparent',
                              borderWidth: cell.isToday && !cell.isCompleted ? 1 : 0,
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* Dynamic Goal Progress Bar */}
            <View style={styles.goalSection}>
              <View style={styles.goalTextRow}>
                <Text style={[styles.goalPercentText, { color: habit.color }]}>
                  {goalPercent}%
                </Text>
                <Text style={[styles.goalTargetText, { color: theme.textMuted }]}>
                  الهدف المنجز: {goalDisplayLabel}
                </Text>
              </View>
              <View style={[styles.goalTrack, { backgroundColor: theme.surface }]}>
                <View
                  style={[
                    styles.goalFill,
                    {
                      width: `${goalPercent}%`,
                      backgroundColor: habit.color,
                    },
                  ]}
                />
              </View>

              {stats.goalAchieved ? (
                <View style={[styles.celebrationBanner, { backgroundColor: 'rgba(241, 196, 15, 0.15)', borderColor: 'rgba(241, 196, 15, 0.4)' }]}>
                  <Ionicons name="trophy" size={16} color="#F1C40F" />
                  <Text style={styles.celebrationText}>🎉 تم تحقيق هدف العادة بالكامل بنجاح! رائع جداً!</Text>
                </View>
              ) : stats.daysRemaining !== undefined && stats.daysRemaining > 0 ? (
                <View style={[styles.remainingPill, { backgroundColor: theme.surface }]}>
                  <Ionicons name="flag-outline" size={13} color={habit.color} />
                  <Text style={[styles.remainingText, { color: theme.textDim }]}>
                    متبقي {stats.daysRemaining} يوماً للوصول إلى الهدف النهائي
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Badges Pill Row */}
            <View style={styles.badgesPillsRow}>
              <View style={[styles.badgePill, { backgroundColor: `${habit.color}18`, borderColor: `${habit.color}35` }]}>
                <Ionicons name="flame" size={14} color={habit.color} />
                <Text style={[styles.badgePillText, { color: habit.color }]}>
                  {stats.currentStreak} ستريك
                </Text>
              </View>

              <View style={[styles.badgePill, { backgroundColor: `${habit.color}18`, borderColor: `${habit.color}35` }]}>
                <Ionicons name="shield-checkmark" size={14} color={habit.color} />
                <Text style={[styles.badgePillText, { color: habit.color }]}>
                  أفضل {stats.longestStreak}
                </Text>
              </View>

              <View style={[styles.badgePill, { backgroundColor: 'rgba(46, 204, 113, 0.15)', borderColor: 'rgba(46, 204, 113, 0.35)' }]}>
                <Ionicons name="fitness" size={14} color="#2ECC71" />
                <Text style={[styles.badgePillText, { color: '#2ECC71' }]}>
                  قوة {stats.habitStrengthScore}%
                </Text>
              </View>

              <View style={[styles.badgePill, { backgroundColor: `${habit.color}18`, borderColor: `${habit.color}35` }]}>
                <Ionicons name="checkmark-done" size={14} color={habit.color} />
                <Text style={[styles.badgePillText, { color: habit.color }]}>
                  {stats.totalCompletions} يوم
                </Text>
              </View>

              {habit.reminderEnabled && habit.reminderTime && (
                <View style={[styles.badgePill, { backgroundColor: 'rgba(0, 206, 201, 0.15)', borderColor: 'rgba(0, 206, 201, 0.35)' }]}>
                  <Ionicons name="notifications-outline" size={14} color="#00CEC9" />
                  <Text style={[styles.badgePillText, { color: '#00CEC9' }]}>
                    {habit.reminderTime}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Middle Card: Detailed Monthly Calendar */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            {/* Days of week in Arabic starting Saturday */}
            <View style={styles.calendarWeekRow}>
              {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((w, idx) => (
                <Text key={idx} style={[styles.calWeekText, { color: theme.textDim }]}>
                  {w}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.calendarDaysGrid}>
              {Array.from({ length: (firstDayOfWeek + 1) % 7 }).map((_, idx) => (
                <View key={`empty-${idx}`} style={styles.calCellWrapper} />
              ))}

              {monthDays.map((d) => {
                return (
                  <TouchableOpacity
                    key={d.dateStr}
                    activeOpacity={0.65}
                    onPress={() => onToggleDate(habit.id, d.dateStr)}
                    onLongPress={() => handleOpenNote(d.dateStr)}
                    style={styles.calCellWrapper}
                  >
                    <View
                      style={[
                        styles.calDayBox,
                        {
                          backgroundColor: d.isCompleted ? `${habit.color}25` : 'transparent',
                          borderColor: d.isToday
                            ? habit.color
                            : d.isCompleted
                            ? `${habit.color}50`
                            : 'transparent',
                          borderWidth: d.isToday ? 2 : d.isCompleted ? 1 : 0,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.calDayNum,
                          {
                            color: d.isCompleted ? '#FFFFFF' : theme.textMuted,
                            fontWeight: d.isToday || d.isCompleted ? '800' : '500',
                          },
                        ]}
                      >
                        {d.dayNum}
                      </Text>
                      {d.isCompleted && (
                        <View style={[styles.completedDot, { backgroundColor: habit.color }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Month Navigator at bottom matching Image 4 */}
            <View style={styles.calBottomNav}>
              <View style={styles.navArrows}>
                <TouchableOpacity onPress={() => setMonthOffset(monthOffset + 1)} style={styles.arrowBtn}>
                  <Ionicons name="chevron-forward" size={18} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={monthOffset <= 0}
                  onPress={() => setMonthOffset(Math.max(0, monthOffset - 1))}
                  style={[styles.arrowBtn, monthOffset <= 0 && { opacity: 0.3 }]}
                >
                  <Ionicons name="chevron-back" size={18} color={theme.text} />
                </TouchableOpacity>
              </View>

              <View style={[styles.monthBadgeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="calendar-outline" size={14} color={theme.textMuted} />
                <Text style={[styles.monthBadgeText, { color: theme.text }]}>
                  {getArabicMonth(currentMonthIndex)} {currentYear}
                </Text>
              </View>
            </View>

            <Text style={[styles.longPressHint, { color: theme.textDim }]}>
              اضغط مطولاً على يوم لإضافة ملاحظة
            </Text>
          </View>

          {/* Bottom Card: Daily Notes & Reflections matching Image 4 */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleOpenNote(todayStr)}
            style={[styles.notesCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          >
            <TouchableOpacity onPress={() => handleOpenNote(todayStr)} style={[styles.addNoteCircle, { backgroundColor: `${habit.color}25` }]}>
              <Ionicons name="add" size={20} color={habit.color} />
            </TouchableOpacity>

            <View style={styles.notesTextCol}>
              <Text style={[styles.notesMainText, { color: theme.text }]}>
                {currentDayNote ? currentDayNote : 'لا توجد ملاحظات بعد'}
              </Text>
              <Text style={[styles.notesSubText, { color: theme.textMuted }]}>
                {currentDayNote ? `ملاحظة يوم ${formatFriendlyDate(selectedDateStr, 'ar')}` : 'ما الذي سار جيداً؟ وما الذي اعترض طريقك؟'}
              </Text>
            </View>

            <View style={[styles.noteIconBox, { backgroundColor: `${habit.color}20` }]}>
              <Ionicons name="document-text-outline" size={20} color={habit.color} />
            </View>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Note Input Modal */}
        <Modal visible={noteInputVisible} transparent animationType="fade">
          <View style={[styles.noteModalOverlay, { backgroundColor: theme.modalOverlay }]}>
            <View style={[styles.noteModalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.noteModalTitle, { color: theme.text }]}>
                ملاحظة {formatFriendlyDate(selectedDateStr, 'ar')}
              </Text>
              <TextInput
                value={noteText}
                onChangeText={setNoteText}
                placeholder="ما الذي سار جيداً؟ وما الذي اعترض طريقك؟"
                placeholderTextColor={theme.textDim}
                multiline
                style={[styles.noteTextInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
              />
              <View style={styles.noteModalActions}>
                <TouchableOpacity onPress={handleSaveNoteAction} style={[styles.saveNoteBtn, { backgroundColor: habit.color }]}>
                  <Text style={styles.saveNoteBtnText}>حفظ الملاحظة</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setNoteInputVisible(false)} style={styles.cancelNoteBtn}>
                  <Text style={[styles.cancelNoteBtnText, { color: theme.textDim }]}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeftIcons: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  habitHeaderSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  titleTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'right',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 13,
    marginTop: 3,
    textAlign: 'right',
  },
  largePulseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 14,
  },
  stripMonthLabels: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginBottom: 8,
  },
  stripMonthText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stripMatrixRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stripSideLabels: {
    gap: 8,
    marginLeft: 8,
  },
  stripSideText: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'right',
  },
  stripDotsGrid: {
    flexDirection: 'row-reverse',
    gap: 3,
    flex: 1,
  },
  stripDotsCol: {
    flexDirection: 'column',
    gap: 3,
  },
  stripDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  goalSection: {
    marginTop: 14,
  },
  goalTextRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalPercentText: {
    fontSize: 13,
    fontWeight: '900',
  },
  goalTargetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  goalTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 4,
  },
  celebrationBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  celebrationText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F1C40F',
    flex: 1,
    textAlign: 'right',
  },
  remainingPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgesPillsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badgePill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  calendarWeekRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  calWeekText: {
    fontSize: 10.5,
    fontWeight: '700',
    width: 38,
    textAlign: 'center',
  },
  calendarDaysGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
  calCellWrapper: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2.5,
  },
  calDayBox: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calDayNum: {
    fontSize: 13,
  },
  completedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 3,
  },
  calBottomNav: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  navArrows: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  arrowBtn: {
    padding: 6,
  },
  monthBadgeBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  monthBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  longPressHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  notesCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
  },
  addNoteCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  notesTextCol: {
    flex: 1,
    marginLeft: 8,
  },
  notesMainText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  notesSubText: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right',
  },
  noteIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noteModalCard: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 20,
  },
  noteModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  noteTextInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    height: 110,
    textAlignVertical: 'top',
    marginBottom: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  noteModalActions: {
    gap: 8,
  },
  saveNoteBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  cancelNoteBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelNoteBtnText: {
    fontSize: 13,
  },
});
