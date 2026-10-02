import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { AppLanguage, isRTL } from '../utils/i18n';
import { hapticService } from '../services/hapticService';
import { soundService } from '../services/soundService';

interface HabitStackNextToastProps {
  visible: boolean;
  nextHabit: Habit | null;
  triggerHabitName: string;
  theme: ThemeColors;
  language?: AppLanguage;
  onCompleteNow: (habitId: string) => void;
  onDismiss: () => void;
}

export const HabitStackNextToast: React.FC<HabitStackNextToastProps> = ({
  visible,
  nextHabit,
  triggerHabitName,
  theme,
  language = 'ar',
  onCompleteNow,
  onDismiss,
}) => {
  const rtl = isRTL(language);
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && nextHabit) {
      soundService.playStackTrigger();
      hapticService.light();

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, 9000);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(100);
      opacityAnim.setValue(0);
    }
  }, [visible, nextHabit]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible || !nextHabit) return null;

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.card || '#1E1E26',
            borderColor: nextHabit.color,
            shadowColor: nextHabit.color,
          },
        ]}
      >
        {/* Header row */}
        <View style={[styles.headerRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.tagPill, { backgroundColor: `${nextHabit.color}25` }]}>
            <Ionicons name="flash" size={13} color={nextHabit.color} />
            <Text style={[styles.tagText, { color: nextHabit.color }]}>
              سلسلة العادات الذكية
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Content body */}
        <View style={[styles.bodyRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.habitIconBox, { backgroundColor: `${nextHabit.color}20` }]}>
            <Ionicons name={(nextHabit.icon as any) || 'checkmark-circle'} size={22} color={nextHabit.color} />
          </View>

          <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
            <Text style={[styles.cueText, { color: theme.textMuted }]}>
              أنجزت "{triggerHabitName}"، حان دور:
            </Text>
            <Text style={[styles.nextHabitTitle, { color: theme.text }]}>
              {nextHabit.name}
            </Text>
          </View>

          {/* Quick complete button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticService.success();
              soundService.playComplete();
              onCompleteNow(nextHabit.id);
            }}
            style={[styles.actionBtn, { backgroundColor: nextHabit.color }]}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>إنجاز الآن</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    bottom: 84, // elevated safely above bottom bar
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 2,
  },
  bodyRow: {
    alignItems: 'center',
    gap: 10,
  },
  habitIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cueText: {
    fontSize: 11,
    lineHeight: 14,
  },
  nextHabitTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
