import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Defs,
  Pattern,
  Rect,
  Circle,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { ThemeColors } from '../../constants/theme';

interface AmbientBackgroundProps {
  theme: ThemeColors;
  isDark?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Ultra-subtle ambient background canvas.
 * Features:
 * 1. Micro-dot constellation & subtle geometric crosshair pattern (opacity 0.035 - 0.045).
 * 2. Ambient radial aurora glows (soft indigo top-right & soft emerald bottom-left).
 * Never distracts or interferes with content, but gives authentic refraction depth to glass elements!
 */
export const AmbientBackground: React.FC<AmbientBackgroundProps> = memo(({
  theme,
  isDark = true,
}) => {
  const patternOpacity = isDark ? 0.045 : 0.032;
  const dotColor = isDark ? '#FFFFFF' : '#4F46E5';
  const crosshairColor = isDark ? '#7C83FD' : '#6366F1';

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          {/* Subtle Ambient Radial Halos (Aurora) */}
          <RadialGradient
            id="auroraTopRight"
            cx="85%"
            cy="12%"
            r="45%"
            fx="85%"
            fy="12%"
          >
            <Stop
              offset="0%"
              stopColor={isDark ? '#7C83FD' : '#6366F1'}
              stopOpacity={isDark ? 0.065 : 0.045}
            />
            <Stop
              offset="50%"
              stopColor={isDark ? '#6C5CE7' : '#818CF8'}
              stopOpacity={isDark ? 0.03 : 0.015}
            />
            <Stop
              offset="100%"
              stopColor={theme.background}
              stopOpacity={0}
            />
          </RadialGradient>

          <RadialGradient
            id="auroraBottomLeft"
            cx="15%"
            cy="75%"
            r="50%"
            fx="15%"
            fy="75%"
          >
            <Stop
              offset="0%"
              stopColor={isDark ? '#2ECC71' : '#10B981'}
              stopOpacity={isDark ? 0.045 : 0.03}
            />
            <Stop
              offset="60%"
              stopColor={isDark ? '#00CEC9' : '#06B6D4'}
              stopOpacity={isDark ? 0.02 : 0.01}
            />
            <Stop
              offset="100%"
              stopColor={theme.background}
              stopOpacity={0}
            />
          </RadialGradient>

          {/* Micro-Geometric Constellation Grid Pattern */}
          <Pattern
            id="ambientGridPattern"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            {/* Center Micro-Dot */}
            <Circle
              cx="16"
              cy="16"
              r="0.9"
              fill={dotColor}
              fillOpacity={patternOpacity}
            />

            {/* Corner Micro-Crosshair marker (hairline 0.5px) */}
            <Path
              d="M0 3 L0 -3 M-3 0 L3 0 M32 3 L32 -3 M29 0 L35 0 M0 35 L0 29 M-3 32 L3 32 M32 35 L32 29 M29 32 L35 32"
              stroke={crosshairColor}
              strokeWidth="0.6"
              strokeOpacity={patternOpacity * 0.9}
            />
          </Pattern>
        </Defs>

        {/* Base Theme Fill */}
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={theme.background}
        />

        {/* Top-Right Ambient Aurora Glow */}
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#auroraTopRight)"
        />

        {/* Bottom-Left Ambient Aurora Glow */}
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#auroraBottomLeft)"
        />

        {/* Seamless Micro-Dot & Constellation Lattice */}
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#ambientGridPattern)"
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
  },
});
