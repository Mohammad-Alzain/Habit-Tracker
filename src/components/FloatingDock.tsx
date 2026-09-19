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

const BUTTON_WIDTH = 48;
const BUTTON_GAP = 6;
const STEP_DISTANCE = BUTTON_WIDTH + BUTTON_GAP; // 54px

/**
 * Pixel-perfect icon for Mode 1 (3-column mini grid / heatmap) matching screenshot media_1789773068963.png
 */
const MiniGridIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={iconStyles.miniGridWrap}>
    {[0, 1, 2, 3].map((i) => (
      <View key={i} style={iconStyles.miniGridRow}>
        <View style={[iconStyles.miniGridBar, { backgroundColor: color }]} />
        <View style={[iconStyles.miniGridBar, { backgroundColor: color }]} />
      </View>
    ))}
  </View>
);



/**
 * Pixel-perfect icon for Mode 3 (Full calendar card with header & dots) matching screenshot media_1789773068963.png
 */
const FullCalendarCardIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={[iconStyles.cardFrame, { borderColor: color }]}>
    {/* Top header bar in card */}
    <View style={[iconStyles.cardTopBar, { backgroundColor: color }]} />
    {/* Dot matrix rows */}
    <View style={iconStyles.dotRow}>
      <View style={[iconStyles.dot, { backgroundColor: color }]} />
      <View style={[iconStyles.dot, { backgroundColor: color }]} />
      <View style={[iconStyles.dot, { backgroundColor: color }]} />
    </View>
    <View style={iconStyles.dotRow}>
      <View style={[iconStyles.dot, { backgroundColor: color }]} />
      <View style={[iconStyles.dot, { backgroundColor: color }]} />
      <View style={[iconStyles.dot, { backgroundColor: color }]} />
    </View>
  </View>
);

const MODES: { id: ViewMode; renderIcon: (color: string) => React.ReactNode }[] = [
  { id: 'heatmap', renderIcon: (c) => <MiniGridIcon color={c} /> },
  {
    id: 'checklist',
    renderIcon: (c) => (
      <Ionicons name="checkbox-outline" size={20} color={c} style={{ textAlign: 'center' }} />
    ),
  },
  { id: 'compact', renderIcon: (c) => <FullCalendarCardIcon color={c} /> },
];

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
        // Ultra-fluid gliding spring for sliding indicator (instant, zero delay)
        Animated.spring(slideAnim, {
          toValue: targetIdx,
          friction: 8.5,
          tension: 85,
          useNativeDriver: true,
        }),
        // Subtle crisp settle
        Animated.sequence([
          Animated.timing(bounceScale, {
            toValue: 0.95,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.spring(bounceScale, {
            toValue: 1,
            friction: 5,
            tension: 95,
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

  // Natural fluid momentum: slight pill elongation during transit
  const stretchX = slideAnim.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [1, 1.06, 1, 1.06, 1],
  });

  const stretchY = slideAnim.interpolate({
    inputRange: [0, 0.5, 1, 1.5, 2],
    outputRange: [1, 0.96, 1, 0.96, 1],
  });

  const handleSelect = (mode: ViewMode) => {
    if (mode !== viewMode) {
      hapticService.selection();
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
              borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
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
          const iconColor = isSelected ? theme.text : theme.textDim;
          return (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.75}
              onPress={() => handleSelect(m.id)}
              style={styles.dockBtn}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              {m.renderIcon(iconColor)}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const FloatingDock = memo(FloatingDockComponent);

const iconStyles = StyleSheet.create({
  miniGridWrap: {
    width: 17,
    height: 15,
    justifyContent: 'space-between',
  },
  miniGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  miniGridBar: {
    width: 7,
    height: 2,
    borderRadius: 1,
  },

  cardFrame: {
    width: 19,
    height: 16,
    borderWidth: 1.3,
    borderRadius: 3.5,
    padding: 1.5,
    justifyContent: 'space-between',
  },
  cardTopBar: {
    height: 2,
    borderRadius: 1,
    width: '100%',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0.5,
  },
  dot: {
    width: 2.2,
    height: 2.2,
    borderRadius: 1.1,
  },
});

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
    overflow: 'hidden',
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

