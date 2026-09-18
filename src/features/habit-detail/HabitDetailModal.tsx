import React, { useState, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../../types/habit';
import { ThemeColors } from '../../constants/theme';
import { FULL_SCREEN_SAFE_TOP } from '../../constants/layout';
import { useHabitDetail } from './hooks/useHabitDetail';
import { StatsOverview } from './components/StatsOverview';
import { MonthCalendarView } from './components/MonthCalendarView';
import { DailyNoteEditor } from './components/DailyNoteEditor';
import { HabitSubTasksList } from './components/HabitSubTasksList';
import { HabitOptionsMenuModal } from './components/HabitOptionsMenuModal';
import { ConfirmActionModal } from '../../components/common/ConfirmActionModal';
import { AmbientBackground } from '../../components/common/AmbientBackground';
import { ModalHeader } from '../../components/ModalHeader';
import { t, isRTL, AppLanguage } from '../../utils/i18n';

export interface HabitDetailModalProps {
  visible: boolean;
  habit: Habit | null;
  logs: HabitLogs;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
  onToggleDate: (habitId: string, dateStr: string) => void;
  onStartTimer?: (habit: Habit) => void;
  onToggleStreakFreeze?: (habitId: string, dateStr: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit?: (habitId: string) => void;
  onArchiveHabit?: (habitId: string) => void;
  onSaveNote?: (habitId: string, dateStr: string, noteText: string) => void;
  onShareHabit?: (habit: Habit) => void;
  onOpenRoadmap?: () => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  visible,
  habit,
  logs,
  theme,
  language = 'ar',
  onClose,
  onToggleDate,
  onStartTimer,
  onToggleStreakFreeze,
  onEditHabit,
  onDeleteHabit,
  onArchiveHabit,
  onSaveNote,
  onShareHabit,
  onOpenRoadmap,
}) => {
  const rtl = isRTL(language);

  const {
    todayStr,
    stats,
    selectedDateStr,
    setSelectedDateStr,
    noteInputVisible,
    setNoteInputVisible,
    noteText,
    setNoteText,
    monthOffset,
    setMonthOffset,
    currentMonthLabel,
    firstDayOfWeek,
    monthDays,
    localNotes,
    isSelectedDateFrozen,
    handleOpenNote,
    handleSaveNoteSubmit,
  } = useHabitDetail(habit, logs, onSaveNote);

  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const handleOptionsMenu = () => {
    setOptionsMenuVisible(true);
  };

  if (!habit) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <AmbientBackground theme={theme} isDark={theme.text === '#FFFFFF'} />

        {/* Top Header with Dead-Centered Title, Left Close, Right Actions */}
        <ModalHeader
          title=""
          theme={theme}
          onClose={onClose}
          showDragHandle={true}
          actionButton={
            <View style={styles.headerRightIcons}>
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
          }
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Habit Hero Section */}
          <View style={[styles.heroSection, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.titleCol, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.mainTitle, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>{habit.name}</Text>
              {habit.description ? (
                <Text style={[styles.subTitle, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>{habit.description}</Text>
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

          {/* KPI Stats Overview */}
          {stats && (
            <StatsOverview
              stats={stats}
              theme={theme}
              habitColor={habit.color}
              isQuit={habit.mode === 'quit'}
              language={language}
            />
          )}

          {/* Interactive Month Calendar View */}
          <MonthCalendarView
            habitId={habit.id}
            habitColor={habit.color}
            theme={theme}
            language={language}
            currentMonthLabel={currentMonthLabel}
            monthOffset={monthOffset}
            onPrevMonth={() => setMonthOffset((prev) => prev + 1)}
            onNextMonth={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
            monthDays={monthDays}
            firstDayOfWeek={firstDayOfWeek}
            selectedDateStr={selectedDateStr}
            todayStr={todayStr}
            isSelectedDateFrozen={isSelectedDateFrozen}
            onSelectDate={setSelectedDateStr}
            onToggleDate={onToggleDate}
            onToggleStreakFreeze={onToggleStreakFreeze}
            onOpenNote={handleOpenNote}
            currentDateNote={localNotes[selectedDateStr] || habit.notes?.[selectedDateStr] || ''}
            onStartTimer={() => onStartTimer?.(habit)}
            isTimerHabit={habit.type === 'timer'}
          />

          {/* Subtasks breakdown */}
          <HabitSubTasksList
            subTasks={habit.subTasks}
            habitColor={habit.color}
            theme={theme}
            onEditTasks={() => {
              onClose();
              onEditHabit(habit);
            }}
            onOpenRoadmap={() => {
              onClose();
              onOpenRoadmap?.();
            }}
          />
        </ScrollView>

      {/* Daily Note Editor Dialog */}
        <DailyNoteEditor
          visible={noteInputVisible}
          selectedDateStr={selectedDateStr}
          noteText={noteText}
          onChangeText={setNoteText}
          onSave={handleSaveNoteSubmit}
          onClose={() => setNoteInputVisible(false)}
          theme={theme}
          language={language}
        />

        {/* Custom Habit Options Menu Modal */}
        <HabitOptionsMenuModal
          visible={optionsMenuVisible}
          habit={habit}
          theme={theme}
          language={language}
          onClose={() => setOptionsMenuVisible(false)}
          onEdit={() => {
            onClose();
            onEditHabit(habit);
          }}
          onShare={onShareHabit ? () => onShareHabit(habit) : undefined}
          onArchive={
            onArchiveHabit
              ? () => {
                  onArchiveHabit(habit.id);
                  onClose();
                }
              : undefined
          }
          onDelete={() => setConfirmDeleteVisible(true)}
        />

        {/* Custom Confirm Delete Modal */}
        <ConfirmActionModal
          visible={confirmDeleteVisible}
          theme={theme}
          language={language}
          title={t('confirmActionTitle', language)}
          message={
            language === 'ar'
              ? `هل أنت متأكد من رغبتك في حذف عادة "${habit?.name}" نهائياً؟`
              : `Are you sure you want to delete "${habit?.name}" permanently?`
          }
          confirmText={t('deleteHabitOption', language)}
          cancelText={t('cancelAction', language)}
          isDestructive={true}
          iconName="trash-outline"
          onConfirm={() => {
            setConfirmDeleteVisible(false);
            if (onDeleteHabit && habit) {
              onDeleteHabit(habit.id);
              onClose();
            }
          }}
          onCancel={() => setConfirmDeleteVisible(false)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: FULL_SCREEN_SAFE_TOP,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  titleCol: {
    flex: 1,
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'right',
  },
  subTitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'right',
  },
  largePulseCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
