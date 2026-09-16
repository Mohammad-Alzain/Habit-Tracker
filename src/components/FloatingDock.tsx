import React, { memo, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ViewMode } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { hapticService } from '../services/hapticService';

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

const BUTTON_WIDTH = 46;
const BUTTON_GAP = 6;
const STEP_DISTANCE = BUTTON_WIDTH + BUTTON_GAP; // 52px

const FloatingDockComponent: React.FC<FloatingDockProps> = ({
  viewMode,
  onChangeViewMode,
  theme,
}) => {
  const activeIndex = MODES.findIndex((m) => m.id === viewMode);
  const slideAnim = useRef(new Animated.Value(activeIndex >= 0 ? activeIndex : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const targetIdx = MODES.findIndex((m) => m.id === viewMode);
    if (targetIdx >= 0) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: targetIdx,
          friction: 7,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.92,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [viewMode]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, STEP_DISTANCE, STEP_DISTANCE * 2],
  });

  const handleSelect = (mode: ViewMode) => {
    if (mode !== viewMode) {
      hapticService.light();
      onChangeViewMode(mode);
    }
  };

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View
        style={[
          styles.dockBar,
          {
            backgroundColor: theme.glassBg || (theme.background === '#0E1015' ? 'rgba(20, 24, 34, 0.75)' : 'rgba(255, 255, 255, 0.82)'),
            borderColor: theme.glassBorder || 'rgba(255, 255, 255, 0.12)',
            borderTopColor: theme.glassSpecular || 'rgba(255, 255, 255, 0.28)',
          },
          Platform.OS === 'web' && ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any),
        ]}
      >
        {/* Animated Sliding Glass Capsule / Circle */}
        <Animated.View
          style={[
            styles.slidingPill,
            {
              backgroundColor: theme.surface,
              borderColor: theme.glassBorder || 'rgba(255, 255, 255, 0.16)',
              transform: [{ translateX }, { scale: scaleAnim }],
            },
          ]}
        />

        {/* Action Buttons */}
        {MODES.map((m) => {
          const isSelected = viewMode === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.7}
              onPress={() => handleSelect(m.id)}
              style={styles.dockBtn}
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
    bottom: Platform.OS === 'ios' ? 24 : 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockBar: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 6,
    borderWidth: 1.2,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  slidingPill: {
    position: 'absolute',
    left: 6,
    top: 5,
    width: BUTTON_WIDTH,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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

