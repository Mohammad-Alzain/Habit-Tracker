import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { formatFriendlyDate } from '../utils/dateUtils';
import { DialogHeader } from './ModalHeader';
import { isRTL, AppLanguage } from '../utils/i18n';

export interface ChartDetailData {
  type: 'weekday' | 'day_circle' | 'year_pixel';
  title: string;
  subtitle: string;
  dateStr?: string;
  dayIndex?: number;
  totalCompletions?: number;
  completionRate?: number;
  completedHabitIds?: string[];
  missedHabitIds?: string[];
}

interface ChartDetailModalProps {
  visible: boolean;
  data: ChartDetailData | null;
  habits: Habit[];
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
  onSelectHabit?: (habit: Habit) => void;
}

export const ChartDetailModal: React.FC<ChartDetailModalProps> = ({
  visible,
  data,
  habits,
  theme,
  language = 'ar',
  onClose,
  onSelectHabit,
}) => {
  if (!data) return null;
  const rtl = isRTL(language);

  const habitMap = new Map(habits.map((h) => [h.id, h]));

  const completedHabits = (data.completedHabitIds || [])
    .map((id) => habitMap.get(id))
    .filter(Boolean) as Habit[];

  const missedHabits = (data.missedHabitIds || [])
    .map((id) => habitMap.get(id))
    .filter(Boolean) as Habit[];

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}>
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <DialogHeader
            title={data.title}
            subtitle={data.subtitle}
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          {/* Quick Metrics */}
          <View style={styles.metricRow}>
            {data.completionRate !== undefined && (
              <View style={[styles.metricBadge, { backgroundColor: `${theme.primary}20` }]}>
                <Text style={[styles.metricValue, { color: theme.primary }]}>
                  {data.completionRate}%
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textDim }]}>نسبة الإنجاز</Text>
              </View>
            )}

            {data.totalCompletions !== undefined && (
              <View style={[styles.metricBadge, { backgroundColor: `${theme.success}20` }]}>
                <Text style={[styles.metricValue, { color: theme.success }]}>
                  {data.totalCompletions}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textDim }]}>إجمالي المرات</Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Completed Habits List */}
            {completedHabits.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.success }]}>
                  ✅ العادات المنجزة ({completedHabits.length})
                </Text>
                {completedHabits.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    onPress={() => {
                      onClose();
                      onSelectHabit && onSelectHabit(h);
                    }}
                    style={[styles.habitItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  >
                    <View style={[styles.iconMini, { backgroundColor: `${h.color}25` }]}>
                      <Ionicons name={(h.icon as any) || 'sparkles'} size={16} color={h.color} />
                    </View>
                    <Text style={[styles.habitName, { color: theme.text }]}>{h.name}</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.textDim} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Missed Habits List */}
            {missedHabits.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.danger }]}>
                  ⏳ عادات لم تكتمل ({missedHabits.length})
                </Text>
                {missedHabits.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    onPress={() => {
                      onClose();
                      onSelectHabit && onSelectHabit(h);
                    }}
                    style={[styles.habitItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  >
                    <View style={[styles.iconMini, { backgroundColor: `${h.color}25` }]}>
                      <Ionicons name={(h.icon as any) || 'sparkles'} size={16} color={h.color} />
                    </View>
                    <Text style={[styles.habitName, { color: theme.textMuted }]}>{h.name}</Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.textDim} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {completedHabits.length === 0 && missedHabits.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={[styles.emptyText, { color: theme.textDim }]}>
                  انقر على أي مخطط للاطلاع على تفاصيل النشاط المرتبط به
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
  closeBtn: {
    padding: 4,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricBadge: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollArea: {
    maxHeight: 300,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  iconMini: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  habitName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
