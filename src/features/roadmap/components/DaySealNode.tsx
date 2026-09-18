import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../constants/theme';
import { roadmapStyles as styles } from '../styles/roadmapStyles';

interface DaySealNodeProps {
  dayNum: number;
  dayName: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  allDone: boolean;
  theme: ThemeColors;
}

export const DaySealNode: React.FC<DaySealNodeProps> = ({
  dayNum,
  dayName,
  isToday,
  isPast,
  isFuture,
  allDone,
  theme,
}) => {
  const sealBg = isToday
    ? '#FF6565'
    : isFuture
    ? (theme.glassSurface || '#1A1A22')
    : allDone
    ? '#2ED573'
    : isPast
    ? (theme.surface || '#252530')
    : (theme.card || '#1E1E24');

  const borderColor = isToday
    ? '#FFA0A0'
    : isFuture
    ? theme.border
    : allDone
    ? '#2ED573'
    : isPast
    ? 'rgba(255, 101, 101, 0.4)'
    : theme.border;

  return (
    <View style={styles.nodeSealContainer}>
      <View
        style={[
          styles.nodeSealCircle,
          {
            backgroundColor: sealBg,
            borderColor: borderColor,
            borderWidth: isToday ? 2.5 : 1.5,
            opacity: isFuture ? 0.6 : 1,
          },
        ]}
      >
        {isFuture ? (
          <Ionicons name="lock-closed-outline" size={16} color={theme.textMuted} />
        ) : allDone ? (
          <>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text
              style={[
                styles.nodeDayNameShort,
                { color: '#FFFFFF', fontWeight: '800' },
              ]}
            >
              {dayNum}
            </Text>
          </>
        ) : (
          <>
            <Text
              style={[
                styles.nodeDayNumber,
                { color: isToday ? '#FFFFFF' : theme.text },
              ]}
            >
              {dayNum}
            </Text>
            <Text
              style={[
                styles.nodeDayNameShort,
                { color: isToday ? 'rgba(255,255,255,0.9)' : theme.textMuted },
              ]}
            >
              {dayName}
            </Text>
          </>
        )}

        {/* Subtle line only for uncompleted past days */}
        {!allDone && isPast && !isFuture && (
          <View style={styles.scratchThroughSeal} pointerEvents="none">
            <View
              style={[
                styles.scratchLineDiagonal,
                { backgroundColor: 'rgba(255, 101, 101, 0.65)' },
              ]}
            />
          </View>
        )}
      </View>

      {/* Status indicator tag */}
      {isToday ? (
        <View style={[styles.sealStatusTag, { backgroundColor: '#FF6565' }]}>
          <Text style={styles.sealStatusTagText}>اليوم</Text>
        </View>
      ) : isFuture ? (
        <View style={[styles.sealStatusTag, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
          <Text style={[styles.sealStatusTagText, { color: theme.textMuted }]}>قادم</Text>
        </View>
      ) : allDone ? (
        <View style={[styles.sealStatusTag, { backgroundColor: '#2ED573' }]}>
          <Text style={styles.sealStatusTagText}>أُنجز</Text>
        </View>
      ) : null}
    </View>
  );
};
