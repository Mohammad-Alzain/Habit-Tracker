import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DayOfWeek, HabitSubTask } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { hapticService } from '../../../services/hapticService';

interface SubTasksEditorProps {
  subTasks: HabitSubTask[];
  newSubTaskTitle: string;
  onChangeNewSubTaskTitle: (text: string) => void;
  newSubTaskMinutes: string;
  onChangeNewSubTaskMinutes: (min: string) => void;
  newSubTaskDays: DayOfWeek[];
  onToggleSubTaskDay: (day: DayOfWeek) => void;
  onAddSubTask: () => void;
  onRemoveSubTask: (id: string) => void;
  editingSubTaskId?: string | null;
  onStartEditSubTask?: (st: HabitSubTask) => void;
  onCancelEditSubTask?: () => void;
  theme: ThemeColors;
}

const ALL_DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 6, label: 'سبت' },
  { id: 0, label: 'أحد' },
  { id: 1, label: 'إثنين' },
  { id: 2, label: 'ثلاثاء' },
  { id: 3, label: 'أربعاء' },
  { id: 4, label: 'خميس' },
  { id: 5, label: 'جمعة' },
];

export const SubTasksEditor: React.FC<SubTasksEditorProps> = ({
  subTasks,
  newSubTaskTitle,
  onChangeNewSubTaskTitle,
  newSubTaskMinutes,
  onChangeNewSubTaskMinutes,
  newSubTaskDays,
  onToggleSubTaskDay,
  onAddSubTask,
  onRemoveSubTask,
  editingSubTaskId,
  onStartEditSubTask,
  onCancelEditSubTask,
  theme,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
        الالتزامات والمهام اليومية (خريطة المسار)
      </Text>
      <Text style={[styles.sectionSub, { color: theme.textDim }]}>
        قسّم العادة إلى مهام محددة وخصص أيام وتوقيت كل مهمة
      </Text>

      {/* Existing Sub-tasks List */}
      {subTasks.length > 0 && (
        <View style={styles.listContainer}>
          {subTasks.map((st) => {
            let daysLabel = 'يومياً';
            if (Array.isArray(st.scheduleDays) && st.scheduleDays.length < 7) {
              daysLabel = st.scheduleDays.map((d) => ALL_DAYS.find((item) => item.id === d)?.label).join('، ');
            }

            const isCurrentlyEditing = editingSubTaskId === st.id;

            return (
              <View
                key={st.id}
                style={[
                  styles.subTaskItemRow,
                  {
                    backgroundColor: isCurrentlyEditing ? 'rgba(124, 131, 253, 0.12)' : theme.surface,
                    borderColor: isCurrentlyEditing ? '#7C83FD' : theme.border,
                  },
                ]}
              >
                <View style={styles.actionBtnsCol}>
                  {onStartEditSubTask && (
                    <TouchableOpacity
                      onPress={() => {
                        hapticService.selection();
                        onStartEditSubTask(st);
                      }}
                      style={[
                        styles.actionIconBtn,
                        isCurrentlyEditing && { backgroundColor: 'rgba(124, 131, 253, 0.25)' },
                      ]}
                    >
                      <Ionicons
                        name={isCurrentlyEditing ? 'pencil' : 'pencil-outline'}
                        size={15}
                        color={isCurrentlyEditing ? '#7C83FD' : theme.textMuted}
                      />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      hapticService.medium();
                      onRemoveSubTask(st.id);
                    }}
                    style={styles.actionIconBtn}
                  >
                    <Ionicons name="trash-outline" size={15} color="#FF6565" />
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.stTitle, { color: theme.text }]}>{st.title}</Text>
                  <View style={styles.stMetaRow}>
                    <Ionicons name="calendar-outline" size={12} color={theme.textDim} />
                    <Text style={[styles.stMeta, { color: theme.textMuted }]}>{daysLabel}</Text>
                    {st.estimatedMinutes && (
                      <>
                        <Ionicons name="time-outline" size={12} color={theme.textDim} style={{ marginLeft: 6 }} />
                        <Text style={[styles.stMeta, { color: theme.textMuted }]}>{st.estimatedMinutes} دقيقة</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Inline Adder Card */}
      <View
        style={[
          styles.adderCard,
          {
            backgroundColor: theme.glassSurface || theme.surface,
            borderColor: editingSubTaskId ? '#7C83FD' : (theme.glassBorder || theme.border),
          },
        ]}
      >
        {editingSubTaskId && (
          <View style={styles.editingHeaderRow}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
              <Ionicons name="pencil" size={13} color="#7C83FD" />
              <Text style={styles.editingBannerText}>تعديل المهمة المحددة</Text>
            </View>
            {onCancelEditSubTask && (
              <TouchableOpacity onPress={onCancelEditSubTask} style={styles.cancelEditBtn}>
                <Ionicons name="close-circle-outline" size={14} color={theme.textMuted} />
                <Text style={[styles.cancelEditText, { color: theme.textMuted }]}>إلغاء التعديل</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TextInput
          value={newSubTaskTitle}
          onChangeText={onChangeNewSubTaskTitle}
          placeholder="عنوان المهمة (مثال: مراجعة الكلمات 10 دقائق)"
          placeholderTextColor={theme.textDim}
          textAlign="right"
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: editingSubTaskId ? '#7C83FD' : theme.border,
              backgroundColor: theme.surface,
            },
          ]}
        />

        <Text style={[styles.daysLabel, { color: theme.textMuted }]}>أيام التكرار:</Text>
        <View style={styles.daysChipsRow}>
          {ALL_DAYS.map((d) => {
            const isSelected = newSubTaskDays.includes(d.id);
            const activeColor = editingSubTaskId ? '#7C83FD' : '#FF6565';
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => onToggleSubTaskDay(d.id)}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: isSelected ? activeColor : 'transparent',
                    borderColor: isSelected ? activeColor : theme.border,
                  },
                ]}
              >
                <Text style={[styles.dayChipText, { color: isSelected ? '#FFFFFF' : theme.textMuted }]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.minutesInputRow}>
            <Ionicons name="time-outline" size={15} color={theme.textMuted} />
            <Text style={[styles.minutesLabel, { color: theme.textMuted }]}>المدة (د):</Text>
            <TextInput
              value={newSubTaskMinutes}
              onChangeText={onChangeNewSubTaskMinutes}
              keyboardType="numeric"
              style={[styles.minInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              hapticService.success();
              onAddSubTask();
            }}
            disabled={!newSubTaskTitle.trim()}
            style={[
              styles.addBtn,
              {
                backgroundColor: newSubTaskTitle.trim()
                  ? (editingSubTaskId ? '#7C83FD' : '#FF6565')
                  : 'rgba(255, 101, 101, 0.4)',
              },
            ]}
          >
            <Ionicons name={editingSubTaskId ? 'checkmark' : 'add'} size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>{editingSubTaskId ? 'تحديث المهمة' : 'إضافة'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
    textAlign: 'right',
  },
  listContainer: {
    gap: 8,
    marginBottom: 10,
  },
  subTaskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  actionBtnsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  stTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  stMetaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  stMeta: {
    fontSize: 11,
    textAlign: 'right',
  },
  editingHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 131, 253, 0.2)',
  },
  editingBannerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C83FD',
  },
  cancelEditBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  cancelEditText: {
    fontSize: 11,
    fontWeight: '600',
  },
  adderCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  input: {
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  daysLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'right',
  },
  daysChipsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  minutesInputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  minutesLabel: {
    fontSize: 12,
  },
  minInput: {
    width: 50,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
