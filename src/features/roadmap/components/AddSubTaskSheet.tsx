import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DayOfWeek, HabitSubTask } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { hapticService } from '../../../services/hapticService';
import { roadmapStyles as styles } from '../styles/roadmapStyles';

const ALL_DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 6, label: 'سبت' },
  { id: 0, label: 'أحد' },
  { id: 1, label: 'إثنين' },
  { id: 2, label: 'ثلاثاء' },
  { id: 3, label: 'أربعاء' },
  { id: 4, label: 'خميس' },
  { id: 5, label: 'جمعة' },
];

interface AddSubTaskSheetProps {
  habitId: string;
  theme: ThemeColors;
  rtl?: boolean;
  onSave: (habitId: string, subTask: Omit<HabitSubTask, 'id'>) => void;
  onCancel: () => void;
}

export const AddSubTaskSheet: React.FC<AddSubTaskSheetProps> = ({
  habitId,
  theme,
  rtl = true,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('15');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([0, 1, 2, 3, 4, 5, 6]);

  const toggleDay = (day: DayOfWeek) => {
    hapticService.selection();
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) {
        Alert.alert('تنبيه', 'يجب اختيار يوم واحد على الأقل للمهمة.');
        return;
      }
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان المهمة الفرعية.');
      return;
    }
    const mins = parseInt(minutes, 10);
    hapticService.success();
    onSave(habitId, {
      title: title.trim(),
      estimatedMinutes: isNaN(mins) || mins <= 0 ? undefined : mins,
      scheduleDays: selectedDays.length === 7 ? 'all' : selectedDays,
    });
  };

  return (
    <View
      style={[
        styles.inlineAddForm,
        {
          backgroundColor: theme.glassSurface || theme.surface,
          borderColor: theme.glassBorder || theme.border,
        },
      ]}
    >
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="عنوان الالتزام (مثلاً: دراسة 10 كلمات)"
        placeholderTextColor={theme.textDim}
        style={[
          styles.inlineInput,
          {
            color: theme.text,
            textAlign: rtl ? 'right' : 'left',
            borderColor: theme.border,
            borderWidth: 1,
          },
        ]}
      />

      <Text style={[styles.fieldLabelSmall, { color: theme.textMuted, textAlign: rtl ? 'right' : 'left' }]}>
        أيام التكرار الأسبوعية
      </Text>
      <View style={[styles.daysChipsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        {ALL_DAYS.map((d) => {
          const isSelected = selectedDays.includes(d.id);
          return (
            <TouchableOpacity
              key={d.id}
              activeOpacity={0.7}
              onPress={() => toggleDay(d.id)}
              style={[
                styles.dayMiniChip,
                {
                  backgroundColor: isSelected ? '#FF6565' : 'transparent',
                  borderColor: isSelected ? '#FF6565' : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayMiniChipText,
                  { color: isSelected ? '#FFFFFF' : theme.textMuted },
                ]}
              >
                {d.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.minutesRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        <Ionicons name="time-outline" size={16} color={theme.textMuted} />
        <Text style={{ color: theme.textMuted, fontSize: 12 }}>المدة المتوقعة (دقائق):</Text>
        <TextInput
          value={minutes}
          onChangeText={setMinutes}
          keyboardType="numeric"
          style={[
            styles.minutesInput,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        />
      </View>

      <View style={[styles.formButtonsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveSubTaskBtn, { backgroundColor: '#FF6565' }]}
        >
          <Text style={styles.saveSubTaskBtnText}>حفظ الالتزام</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          style={[styles.cancelSubTaskBtn, { borderColor: theme.border }]}
        >
          <Text style={[styles.cancelSubTaskBtnText, { color: theme.textMuted }]}>إلغاء</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
