import React, { memo, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ViewMode } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { hapticService } from '../services/hapticService';
import { soundService } from '../services/soundService';

interface FloatingDockProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  theme: ThemeColors;
}

const MODES: { id: ViewMode; icon: string; size: number }[] = [
  { id: 'heatmap', icon: 'grid', size: 18 },
  { id: 'checklist', icon: 'list', size: 20 },
  { id: 'compact', icon: 'calendar-outline', size: 19 },
];

const BUTTON_WIDTH = 48;
const BUTTON_GAP = 6;
const STEP_DISTANCE = BUTTON_WIDTH + BUTTON_GAP; // 54px

const FloatingDockComponent: React.FC<FloatingDockProps> = ({
  viewMode,
  onChangeViewMode,
  theme,
}) => {
  const activeIndex = MODES.findIndex((m) => m.id === viewMode);
  const slideAnim = useRef(new Animated.Value(activeIndex >= 0 ? activeIndex : 0)).current;
  const bounceScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const targetIdx = MODES.findIndex((m) => m.id === viewMode);
    if (targetIdx >= 0) {
      Animated.parallel([
        // Smooth gliding spring with physics
        Animated.spring(slideAnim, {
          toValue: targetIdx,
          friction: 7,
          tension: 68,
          useNativeDriver: true,
        }),
        // Subtle press-and-settle pulse
        Animated.sequence([
          Animated.timing(bounceScale, {
            toValue: 0.94,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.spring(bounceScale, {
            toValue: 1,
            friction: 4,
            tension: 85,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [viewMode]);

  // Pixel-perfect translation along the dock
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, STEP_DISTANCE, STEP_DISTANCE * 2],
  });

  // "Walking/Gliding" stretch effect: pill organically elongates during transit
  const stretchX = slideAnim.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [1, 1.18, 1, 1.18, 1],
  });

  const stretchY = slideAnim.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [1, 0.90, 1, 0.90, 1],
  });

  const handleSelect = (mode: ViewMode) => {
    if (mode !== viewMode) {
      hapticService.medium();
      soundService.playTap();
      onChangeViewMode(mode);
    }
  };

  const isDark = theme.background === '#0B0E14' || theme.background === '#0E1015' || theme.background.startsWith('#0');

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View
        style={[
          styles.dockBar,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Walking & Gliding Capsule Indicator */}
        <Animated.View
          style={[
            styles.slidingPill,
            {
              backgroundColor: theme.card,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              shadowColor: isDark ? theme.primary : '#000',
              transform: [
                { translateX },
                { scaleX: stretchX },
                { scaleY: stretchY },
                { scale: bounceScale },
              ],
            },
          ]}
        />

        {/* Action Buttons (Fixed LTR layout ensures stable horizontal coordinates) */}
        {MODES.map((m) => {
          const isSelected = viewMode === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.75}
              onPress={() => handleSelect(m.id)}
              style={styles.dockBtn}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Ionicons
                name={m.icon as any}
                size={m.size}
                color={isSelected ? theme.text : theme.textDim}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const FloatingDock = memo(FloatingDockComponent);

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 32 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  dockBar: {
    position: 'relative',
    direction: 'ltr',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 6,
    borderWidth: 1.2,
    gap: BUTTON_GAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 12,
  },
  slidingPill: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: BUTTON_WIDTH,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderTopWidth: 1.2,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4,
  },
  dockBtn: {
    width: BUTTON_WIDTH,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});

