import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitMode, HabitType } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { hapticService } from '../../../services/hapticService';

interface HabitModeSelectorProps {
  mode: HabitMode;
  onSelectMode: (mode: HabitMode) => void;
  habitType: HabitType;
  onSelectType: (type: HabitType) => void;
  timerMinutes: number;
  onChangeTimerMinutes: (min: number) => void;
  targetPerDay: number;
  onChangeTargetPerDay: (target: number) => void;
  customUnit: string;
  onChangeCustomUnit: (unit: string) => void;
  theme: ThemeColors;
}

export const HabitModeSelector: React.FC<HabitModeSelectorProps> = ({
  mode,
  onSelectMode,
  habitType,
  onSelectType,
  timerMinutes,
  onChangeTimerMinutes,
  targetPerDay,
  onChangeTargetPerDay,
  customUnit,
  onChangeCustomUnit,
  theme,
}) => {
  return (
    <View style={styles.container}>
      {/* Mode Switcher: Build vs Quit */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>نوع الهدف</Text>
        <View style={[styles.segmentedRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticService.selection();
              onSelectMode('build');
            }}
            style={[
              styles.segmentBtn,
              mode === 'build' && { backgroundColor: '#2ED573' },
            ]}
          >
            <Ionicons
              name="trending-up"
              size={15}
              color={mode === 'build' ? '#FFFFFF' : theme.textMuted}
            />
            <Text style={[styles.segmentText, { color: mode === 'build' ? '#FFFFFF' : theme.textMuted }]}>
              بناء عادة إيجابية
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticService.selection();
              onSelectMode('quit');
            }}
            style={[
              styles.segmentBtn,
              mode === 'quit' && { backgroundColor: '#FF4757' },
            ]}
          >
            <Ionicons
              name="ban"
              size={15}
              color={mode === 'quit' ? '#FFFFFF' : theme.textMuted}
            />
            <Text style={[styles.segmentText, { color: mode === 'quit' ? '#FFFFFF' : theme.textMuted }]}>
              الإقلاع عن عادة
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tracking Type: Specialized for Quit vs Build */}
      {mode === 'quit' ? (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>نمط التعافي والتسجيل</Text>
          <View style={styles.typeCardsRow}>
            {/* Abstinence */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.selection();
                onSelectType('boolean');
              }}
              style={[
                styles.typeCard,
                {
                  backgroundColor: habitType === 'boolean' ? 'rgba(46, 213, 115, 0.15)' : theme.surface,
                  borderColor: habitType === 'boolean' ? '#2ED573' : theme.border,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={habitType === 'boolean' ? '#2ED573' : theme.textMuted}
              />
              <Text style={[styles.typeTitle, { color: habitType === 'boolean' ? '#2ED573' : theme.text }]}>
                امتناع تام وصمود
              </Text>
              <Text style={[styles.typeSub, { color: theme.textMuted }]}>أيام نقاء خالية من العادة</Text>
            </TouchableOpacity>

            {/* Harm Reduction */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.selection();
                onSelectType('numeric');
              }}
              style={[
                styles.typeCard,
                {
                  backgroundColor: habitType === 'numeric' ? 'rgba(255, 101, 101, 0.15)' : theme.surface,
                  borderColor: habitType === 'numeric' ? '#FF6565' : theme.border,
                },
              ]}
            >
              <Ionicons
                name="speedometer-outline"
                size={22}
                color={habitType === 'numeric' ? '#FF6565' : theme.textMuted}
              />
              <Text style={[styles.typeTitle, { color: habitType === 'numeric' ? '#FF6565' : theme.text }]}>
                تقليل وسقف أقصى
              </Text>
              <Text style={[styles.typeSub, { color: theme.textMuted }]}>سقف يومي لا تتجاوزه</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>نمط التسجيل والإنجاز</Text>
          <View style={styles.typeCardsRow}>
            {/* Boolean */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.selection();
                onSelectType('boolean');
              }}
              style={[
                styles.typeCard,
                {
                  backgroundColor: habitType === 'boolean' ? `${theme.primary}20` : theme.surface,
                  borderColor: habitType === 'boolean' ? theme.primary : theme.border,
                },
              ]}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={habitType === 'boolean' ? theme.primary : theme.textMuted} />
              <Text style={[styles.typeTitle, { color: habitType === 'boolean' ? theme.primary : theme.text }]}>
                نعم / لا
              </Text>
              <Text style={[styles.typeSub, { color: theme.textMuted }]}>ضغطة واحدة</Text>
            </TouchableOpacity>

            {/* Timer */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.selection();
                onSelectType('timer');
              }}
              style={[
                styles.typeCard,
                {
                  backgroundColor: habitType === 'timer' ? 'rgba(255, 101, 101, 0.2)' : theme.surface,
                  borderColor: habitType === 'timer' ? '#FF6565' : theme.border,
                },
              ]}
            >
              <Ionicons name="timer-outline" size={20} color={habitType === 'timer' ? '#FF6565' : theme.textMuted} />
              <Text style={[styles.typeTitle, { color: habitType === 'timer' ? '#FF6565' : theme.text }]}>
                مؤقت تركيز
              </Text>
              <Text style={[styles.typeSub, { color: theme.textMuted }]}>بالدقائق</Text>
            </TouchableOpacity>

            {/* Numeric */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.selection();
                onSelectType('numeric');
              }}
              style={[
                styles.typeCard,
                {
                  backgroundColor: habitType === 'numeric' ? 'rgba(112, 161, 255, 0.2)' : theme.surface,
                  borderColor: habitType === 'numeric' ? '#70A1FF' : theme.border,
                },
              ]}
            >
              <Ionicons name="speedometer-outline" size={20} color={habitType === 'numeric' ? '#70A1FF' : theme.textMuted} />
              <Text style={[styles.typeTitle, { color: habitType === 'numeric' ? '#70A1FF' : theme.text }]}>
                عداد وقيمة
              </Text>
              <Text style={[styles.typeSub, { color: theme.textMuted }]}>كميات مخصصة</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Target input if Timer (Only for build mode) */}
      {mode === 'build' && habitType === 'timer' && (
        <View style={styles.inputsRow}>
          <Text style={[styles.inputLabel, { color: theme.textMuted }]}>مدة الجلسة اليومية (دقائق):</Text>
          <TextInput
            value={String(timerMinutes)}
            onChangeText={(v) => onChangeTimerMinutes(parseInt(v, 10) || 1)}
            keyboardType="numeric"
            style={[styles.smallInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
          />
        </View>
      )}

      {/* Target input if Numeric */}
      {habitType === 'numeric' && (
        <View style={styles.numericInputsGroup}>
          <View style={styles.inputsRow}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
              {mode === 'quit' ? 'السقف المسموح به يومياً (حد أقصى):' : 'الهدف اليومي:'}
            </Text>
            <TextInput
              value={String(targetPerDay)}
              onChangeText={(v) => onChangeTargetPerDay(parseInt(v, 10) || 1)}
              keyboardType="numeric"
              style={[styles.smallInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
            />
          </View>
          <View style={styles.inputsRow}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
              {mode === 'quit' ? 'الوحدة (مثال: سجائر، أكواب، ساعات):' : 'الوحدة (مثال: صفحة، كوب):'}
            </Text>
            <TextInput
              value={customUnit}
              onChangeText={onChangeCustomUnit}
              placeholder={mode === 'quit' ? 'أكواب' : 'صفحة'}
              placeholderTextColor={theme.textDim}
              style={[styles.textUnitInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
            />
          </View>
          {mode === 'quit' && (
            <Text style={[styles.quitHintText, { color: theme.textDim }]}>
              في هذا النمط، يعتبر يومك ناجحاً ما دمت تحت السقف المسموح به أو عند الصفر.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'right',
  },
  segmentedRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  typeCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  typeTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  typeSub: {
    fontSize: 10,
    marginTop: 1,
  },
  inputsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  numericInputsGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  smallInput: {
    width: 70,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  textUnitInput: {
    width: 110,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'right',
    fontSize: 12,
  },
  quitHintText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'right',
    marginTop: 4,
  },
});
