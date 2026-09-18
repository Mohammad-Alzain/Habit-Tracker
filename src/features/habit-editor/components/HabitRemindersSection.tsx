import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitCategory } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { hapticService } from '../../../services/hapticService';

interface HabitRemindersSectionProps {
  category: HabitCategory;
  onSelectCategory: (cat: HabitCategory) => void;
  goalFrequency: string;
  onOpenGoalModal: () => void;
  reminderEnabled: boolean;
  onToggleReminder: (enabled: boolean) => void;
  reminderTime: string;
  customReminderText?: string;
  onOpenReminderModal?: () => void;
  theme: ThemeColors;
}

const CATEGORIES: { id: HabitCategory; label: string; icon: string }[] = [
  { id: 'learning', label: 'الدراسة', icon: 'school-outline' },
  { id: 'health', label: 'الصحة', icon: 'heart-outline' },
  { id: 'fitness', label: 'الرياضة', icon: 'barbell-outline' },
  { id: 'mind', label: 'الهدوء', icon: 'leaf-outline' },
  { id: 'work', label: 'العمل', icon: 'briefcase-outline' },
  { id: 'lifestyle', label: 'الحياة', icon: 'sparkles-outline' },
];

export const HabitRemindersSection: React.FC<HabitRemindersSectionProps> = ({
  category,
  onSelectCategory,
  goalFrequency,
  onOpenGoalModal,
  reminderEnabled,
  onToggleReminder,
  reminderTime,
  customReminderText,
  onOpenReminderModal,
  theme,
}) => {
  return (
    <View style={styles.container}>
      {/* Categories */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>المجال / الفئة</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map((c) => {
            const isSelected = category === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  hapticService.selection();
                  onSelectCategory(c.id);
                }}
                style={[
                  styles.catPill,
                  {
                    backgroundColor: isSelected ? theme.surface : (theme.glassSurface || theme.card),
                    borderColor: isSelected ? theme.primary : (theme.glassBorder || theme.border),
                  },
                ]}
              >
                <Text style={[styles.catText, { color: isSelected ? theme.text : theme.textMuted }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Goal & Reminder Horizontal Controls */}
      <View style={styles.twoColsRow}>
        {/* Goal Frequency */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenGoalModal}
          style={[
            styles.colCard,
            {
              backgroundColor: theme.glassSurface || theme.surface,
              borderColor: theme.glassBorder || theme.border,
            },
          ]}
        >
          <Text style={[styles.colLabel, { color: theme.textDim }]}>الهدف والتكرار</Text>
          <View style={styles.colValRow}>
            <Text style={[styles.colVal, { color: theme.text }]}>{goalFrequency}</Text>
            <Ionicons name="chevron-back" size={14} color={theme.textDim} />
          </View>
        </TouchableOpacity>

        {/* Reminder */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onOpenReminderModal}
          style={[
            styles.colCard,
            {
              backgroundColor: theme.glassSurface || theme.surface,
              borderColor: theme.glassBorder || theme.border,
            },
          ]}
        >
          <View style={styles.reminderTopRow}>
            <Text style={[styles.colLabel, { color: theme.textDim }]}>تنبيه يومي</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={(val) => {
                hapticService.selection();
                onToggleReminder(val);
              }}
              trackColor={{ false: '#3A3A44', true: '#FF6565' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
              {reminderEnabled && <Ionicons name="notifications-outline" size={13} color="#FF6565" />}
              <Text style={[styles.colVal, { color: reminderEnabled ? '#FF6565' : theme.textMuted }]}>
                {reminderEnabled ? reminderTime : 'غير مفعل'}
              </Text>
            </View>
            <Ionicons name="chevron-back" size={14} color={theme.textDim} />
          </View>
          {reminderEnabled && !!customReminderText && (
            <Text
              style={{
                fontSize: 11,
                color: theme.textDim,
                marginTop: 6,
                textAlign: 'right',
                fontStyle: 'italic',
              }}
              numberOfLines={1}
            >
              "{customReminderText}"
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'right',
  },
  catScroll: {
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
  },
  twoColsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  colLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 4,
  },
  colValRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colVal: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  reminderTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
});
