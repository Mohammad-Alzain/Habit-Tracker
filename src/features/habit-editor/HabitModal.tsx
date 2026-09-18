import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitType, HabitCategory, TimeOfDay, HabitGoal, HabitMode, TrackingType, HabitSubTask, DayOfWeek, HabitFrequency } from '../../types/habit';
import { ThemeColors } from '../../constants/theme';
import { FULL_SCREEN_SAFE_TOP } from '../../constants/layout';
import { ModalHeader } from '../../components/ModalHeader';
import { useHabitForm } from './hooks/useHabitForm';
import { ColorIconPicker } from './components/ColorIconPicker';
import { HabitModeSelector } from './components/HabitModeSelector';
import { HabitRemindersSection } from './components/HabitRemindersSection';
import { SubTasksEditor } from './components/SubTasksEditor';
import { GoalFrequencyModal } from './components/GoalFrequencyModal';
import { ReminderTimeModal } from './components/ReminderTimeModal';
import { ConfirmActionModal } from '../../components/common/ConfirmActionModal';
import { AmbientBackground } from '../../components/common/AmbientBackground';
import { t, isRTL, AppLanguage } from '../../utils/i18n';

export interface HabitModalProps {
  visible: boolean;
  habitToEdit?: Habit | null;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
  onSave: (habitData: {
    name: string;
    description: string;
    icon: string;
    color: string;
    mode: HabitMode;
    type: HabitType;
    trackingType: TrackingType;
    targetValue: number;
    unit?: string;
    category: HabitCategory;
    timeOfDay: TimeOfDay;
    goalFrequency?: string;
    frequency?: HabitFrequency;
    customDays?: DayOfWeek[];
    goal?: HabitGoal;
    reminderEnabled?: boolean;
    reminderTime?: string;
    customReminderText?: string;
    subTasks?: HabitSubTask[];
  }) => void;
  onDelete?: (habitId: string) => void;
}

export const HabitModal: React.FC<HabitModalProps> = ({
  visible,
  habitToEdit,
  theme,
  language = 'ar',
  onClose,
  onSave,
  onDelete,
}) => {
  const {
    name,
    setName,
    description,
    setDescription,
    selectedColor,
    setSelectedColor,
    selectedIcon,
    setSelectedIcon,
    mode,
    setMode,
    habitType,
    setHabitType,
    timerMinutes,
    setTimerMinutes,
    trackingType,
    targetPerDay,
    setTargetPerDay,
    category,
    setCategory,
    goalFrequency,
    setGoalFrequency,
    customDays,
    setCustomDays,
    frequency,
    setFrequency,
    customUnit,
    setCustomUnit,
    error,
    setError,
    goalType,
    setGoalType,
    goalTargetValue,
    setGoalTargetValue,
    goalModalVisible,
    setGoalModalVisible,
    reminderEnabled,
    setReminderEnabled,
    reminderTime,
    setReminderTime,
    customReminderText,
    setCustomReminderText,
    reminderModalVisible,
    setReminderModalVisible,
    subTasks,
    newSubTaskTitle,
    setNewSubTaskTitle,
    newSubTaskMinutes,
    setNewSubTaskMinutes,
    newSubTaskDays,
    addSubTask,
    removeSubTask,
    toggleSubTaskDay,
    editingSubTaskId,
    startEditSubTask,
    cancelEditSubTask,
  } = useHabitForm(habitToEdit);

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال اسم العادة' : 'Please enter a habit name');
      return;
    }

    const computedGoalTitle =
      goalType === 'days'
        ? (language === 'ar' ? `الاستمرار لـ ${goalTargetValue} يوماً` : `Continue for ${goalTargetValue} days`)
        : goalType === 'months'
        ? (language === 'ar' ? `الاستمرار لـ ${goalTargetValue} أشهر` : `Continue for ${goalTargetValue} months`)
        : goalType === 'streak'
        ? (language === 'ar' ? `ستريك ${goalTargetValue} يوم` : `Consecutive streak of ${goalTargetValue} days`)
        : `${goalTargetValue} / ${language === 'ar' ? 'شهر' : 'month'}`;

    const finalTargetValue =
      habitType === 'timer'
        ? Math.max(1, timerMinutes)
        : habitType === 'numeric'
        ? Math.max(1, targetPerDay)
        : 1;

    const finalUnit =
      habitType === 'timer'
        ? (language === 'ar' ? 'دقيقة' : 'min')
        : habitType === 'numeric'
        ? customUnit.trim() || undefined
        : undefined;

    onSave({
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      mode,
      type: habitType,
      trackingType: habitType === 'numeric' ? 'custom_value' : 'step_by_step',
      targetValue: finalTargetValue,
      unit: finalUnit,
      category,
      timeOfDay: 'anytime',
      goalFrequency: computedGoalTitle,
      frequency,
      customDays,
      goal: {
        type: goalType,
        targetValue: Math.max(1, goalTargetValue),
        title: computedGoalTitle,
      },
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      customReminderText: reminderEnabled && customReminderText.trim() ? customReminderText.trim() : undefined,
      subTasks: subTasks.length > 0 ? subTasks : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!habitToEdit || !onDelete) return;
    setConfirmDeleteVisible(true);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          <AmbientBackground theme={theme} isDark={theme.text === '#FFFFFF'} />

        {/* Top Header: Dead-centered title, left close button */}
        <ModalHeader
          title={habitToEdit ? 'تحرير العادة' : 'إنشاء عادة جديدة'}
          theme={theme}
          onClose={onClose}
          showDragHandle={true}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Color & Icon Picker */}
          <ColorIconPicker
            selectedColor={selectedColor}
            selectedIcon={selectedIcon}
            onSelectColor={setSelectedColor}
            onSelectIcon={setSelectedIcon}
            theme={theme}
          />

          {/* Name & Description Inputs */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>اسم العادة</Text>
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (error) setError('');
              }}
              placeholder="مثال: قراءة 20 دقيقة، شرب الماء"
              placeholderTextColor={theme.textDim}
              textAlign="right"
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  backgroundColor: theme.glassSurface || theme.surface,
                  borderColor: error ? '#FF4757' : theme.glassBorder || theme.border,
                },
              ]}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>الوصف أو الدافع (اختياري)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="لماذا تريد الالتزام بهذه العادة؟"
              placeholderTextColor={theme.textDim}
              textAlign="right"
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  backgroundColor: theme.glassSurface || theme.surface,
                  borderColor: theme.glassBorder || theme.border,
                },
              ]}
            />
          </View>

          {/* Mode & Tracking Type */}
          <HabitModeSelector
            mode={mode}
            onSelectMode={setMode}
            habitType={habitType}
            onSelectType={setHabitType}
            timerMinutes={timerMinutes}
            onChangeTimerMinutes={setTimerMinutes}
            targetPerDay={targetPerDay}
            onChangeTargetPerDay={setTargetPerDay}
            customUnit={customUnit}
            onChangeCustomUnit={setCustomUnit}
            theme={theme}
          />

          {/* Categories & Reminders */}
          <HabitRemindersSection
            category={category}
            onSelectCategory={setCategory}
            goalFrequency={goalFrequency}
            onOpenGoalModal={() => setGoalModalVisible(true)}
            reminderEnabled={reminderEnabled}
            onToggleReminder={setReminderEnabled}
            reminderTime={reminderTime}
            customReminderText={customReminderText}
            onOpenReminderModal={() => setReminderModalVisible(true)}
            theme={theme}
          />

          {/* Subtasks Editor for Roadmap */}
          <SubTasksEditor
            subTasks={subTasks}
            newSubTaskTitle={newSubTaskTitle}
            onChangeNewSubTaskTitle={setNewSubTaskTitle}
            newSubTaskMinutes={newSubTaskMinutes}
            onChangeNewSubTaskMinutes={setNewSubTaskMinutes}
            newSubTaskDays={newSubTaskDays}
            onToggleSubTaskDay={toggleSubTaskDay}
            onAddSubTask={addSubTask}
            onRemoveSubTask={removeSubTask}
            editingSubTaskId={editingSubTaskId}
            onStartEditSubTask={startEditSubTask}
            onCancelEditSubTask={cancelEditSubTask}
            theme={theme}
          />

          {/* Action Buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: selectedColor || '#FF6565' }]}
            >
              <Ionicons
                name={habitToEdit ? 'checkmark-circle-outline' : 'add-circle-outline'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.saveBtnText}>
                {habitToEdit ? 'حفظ التعديلات' : 'إنشاء العادة'}
              </Text>
            </TouchableOpacity>

            {habitToEdit && onDelete && (
              <TouchableOpacity onPress={handleDelete} style={[styles.deleteHabitBtn, { borderColor: '#FF4757' }]}>
                <Ionicons name="trash-outline" size={18} color="#FF4757" />
                <Text style={styles.deleteHabitBtnText}>حذف العادة</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

          {/* Goal & Frequency Modal */}
          <GoalFrequencyModal
            visible={goalModalVisible}
            theme={theme}
            language={language}
            initialGoalType={goalType}
            initialTargetValue={goalTargetValue}
            initialGoalFrequency={goalFrequency}
            initialCustomDays={customDays}
            initialFrequency={frequency}
            onClose={() => setGoalModalVisible(false)}
            onSave={(newGoalType, newTargetVal, newFrequencyTitle, newDays, newFreq) => {
              setGoalType(newGoalType);
              setGoalTargetValue(newTargetVal);
              setGoalFrequency(newFrequencyTitle);
              setCustomDays(newDays);
              setFrequency(newFreq);
            }}
          />

          {/* Reminder Time Modal */}
          <ReminderTimeModal
            visible={reminderModalVisible}
            theme={theme}
            language={language}
            reminderEnabled={reminderEnabled}
            reminderTime={reminderTime}
            customReminderText={customReminderText}
            onClose={() => setReminderModalVisible(false)}
            onSave={(newEnabled, newTime, newCustomText) => {
              setReminderEnabled(newEnabled);
              setReminderTime(newTime);
              setCustomReminderText(newCustomText || '');
            }}
          />

          {/* Custom Delete Confirmation Modal */}
          <ConfirmActionModal
            visible={confirmDeleteVisible}
            theme={theme}
            language={language}
            title={t('confirmActionTitle', language)}
            message={
              language === 'ar'
                ? `هل أنت متأكد من حذف عادة "${habitToEdit?.name}" نهائياً؟`
                : `Are you sure you want to delete "${habitToEdit?.name}" permanently?`
            }
            confirmText={t('deleteHabitOption', language)}
            cancelText={t('cancelAction', language)}
            isDestructive={true}
            iconName="trash-outline"
            onConfirm={() => {
              setConfirmDeleteVisible(false);
              if (habitToEdit && onDelete) {
                onDelete(habitToEdit.id);
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
  container: {
    flex: 1,
    paddingTop: FULL_SCREEN_SAFE_TOP,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'right',
  },
  textInput: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    color: '#FF4757',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  footerRow: {
    marginTop: 10,
    gap: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  deleteHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  deleteHabitBtnText: {
    color: '#FF4757',
    fontSize: 14,
    fontWeight: '700',
  },
});
