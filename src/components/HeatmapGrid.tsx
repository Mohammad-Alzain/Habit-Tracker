import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getTodayString, getCachedHeatmapColumns } from '../utils/dateUtils';
import { ThemeColors } from '../constants/theme';

interface HeatmapGridProps {
  logs: Record<string, number>;
  habitColor: string;
  targetCount?: number;
  theme: ThemeColors;
  weeksCount?: number;
  cellSize?: number;
  cellGap?: number;
  onCellPress?: (dateStr: string) => void;
}

const HeatmapGridComponent: React.FC<HeatmapGridProps> = ({
  logs,
  habitColor,
  targetCount = 1,
  theme,
  weeksCount = 15,
  cellSize = 12,
  cellGap = 3.5,
  onCellPress,
}) => {
  const todayStr = getTodayString();
  const columns = getCachedHeatmapColumns(weeksCount);

  // Helper to get color with opacity based on ratio
  const getCellBg = (ratio: number, isCompleted: boolean) => {
    if (ratio <= 0) return theme.emptyCell;
    if (isCompleted || ratio >= 1) return habitColor;
    if (ratio >= 0.75) return `${habitColor}CC`;
    if (ratio >= 0.5) return `${habitColor}99`;
    return `${habitColor}55`;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={[styles.grid, { gap: cellGap }]}>
        {columns.map((col, colIdx) => (
          <View key={`col-${colIdx}`} style={[styles.column, { gap: cellGap }]}>
            {col.map((dateStr) => {
              const count = logs[dateStr] || 0;
              const ratio = targetCount > 0 ? Math.min(1, count / targetCount) : (count > 0 ? 1 : 0);
              const isCompleted = count >= targetCount;
              const isToday = dateStr === todayStr;
              const bg = getCellBg(ratio, isCompleted);

              return (
                <TouchableOpacity
                  key={dateStr}
                  activeOpacity={0.6}
                  onPress={() => onCellPress && onCellPress(dateStr)}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: bg,
                      borderColor: isToday
                        ? habitColor
                        : isCompleted
                        ? 'transparent'
                        : 'rgba(255,255,255,0.04)',
                      borderWidth: isToday ? 1.8 : 0,
                      shadowColor: isCompleted ? habitColor : 'transparent',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isCompleted ? 0.35 : 0,
                      shadowRadius: 3,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export const HeatmapGrid = memo(HeatmapGridComponent);

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  grid: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  cell: {
    borderRadius: 3.5,
  },
});
