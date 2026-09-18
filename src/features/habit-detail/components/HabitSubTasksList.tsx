import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitSubTask } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';

interface HabitSubTasksListProps {
  subTasks?: HabitSubTask[];
  habitColor: string;
  theme: ThemeColors;
  onOpenRoadmap?: () => void;
  onEditTasks?: () => void;
}

const DAY_NAMES = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export const HabitSubTasksList: React.FC<HabitSubTasksListProps> = ({
  subTasks,
  habitColor,
  theme,
  onOpenRoadmap,
  onEditTasks,
}) => {
  if (!subTasks || subTasks.length === 0) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
          <Ionicons name="trail-sign-outline" size={16} color="#FF6565" />
          <Text style={[styles.cardTitle, { color: theme.text }]}>مهام العادة في خريطة الالتزامات</Text>
        </View>

        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
          {onEditTasks && (
            <TouchableOpacity
              onPress={onEditTasks}
              style={[styles.openRoadmapBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="pencil-outline" size={12} color={theme.textMuted} />
              <Text style={[styles.openRoadmapText, { color: theme.textMuted }]}>تعديل</Text>
            </TouchableOpacity>
          )}

          {onOpenRoadmap && (
            <TouchableOpacity
              onPress={onOpenRoadmap}
              style={[styles.openRoadmapBtn, { backgroundColor: `${habitColor}18`, borderColor: `${habitColor}40` }]}
            >
              <Ionicons name="map-outline" size={13} color={habitColor} />
              <Text style={[styles.openRoadmapText, { color: habitColor }]}>الخريطة</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tasksList}>
        {subTasks.map((st) => {
          let scheduleLabel = 'يومياً';
          if (Array.isArray(st.scheduleDays) && st.scheduleDays.length < 7) {
            scheduleLabel = st.scheduleDays.map((d) => DAY_NAMES[d]).join('، ');
          }

          return (
            <View
              key={st.id}
              style={[
                styles.taskRow,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={[styles.dotIndicator, { backgroundColor: habitColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, { color: theme.text }]}>{st.title}</Text>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Ionicons name="calendar-outline" size={11} color={theme.textDim} />
                  <Text style={[styles.taskSchedule, { color: theme.textMuted }]}>{scheduleLabel}</Text>
                  {st.estimatedMinutes && (
                    <>
                      <Ionicons name="time-outline" size={11} color={theme.textDim} style={{ marginLeft: 6 }} />
                      <Text style={[styles.taskSchedule, { color: theme.textMuted }]}>{st.estimatedMinutes} دقيقة</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  openRoadmapBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  openRoadmapText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tasksList: {
    gap: 8,
  },
  taskRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  taskSchedule: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right',
  },
});
