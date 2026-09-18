import React, { forwardRef } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ThemeColors } from '../../constants/theme';

export interface LiquidGlassViewProps {
  theme?: ThemeColors;
  glassEffectStyle?: any;
  tintColor?: any;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  specularBorder?: boolean;
  innerSheen?: boolean;
  elevation?: number;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  [key: string]: any;
}

/**
 * Standard solid modal card component.
 * Free from broken blur overlays, transparent artifacts, or performance lags.
 */
export const LiquidGlassView = forwardRef<View, LiquidGlassViewProps>(
  (
    {
      theme,
      style,
      children,
      elevation = 12,
      pointerEvents,
      ...rest
    },
    ref
  ) => {
    const isDark = theme ? theme.text === '#FFFFFF' : true;
    const cardBg = theme?.card || (isDark ? '#151924' : '#FFFFFF');
    const cardBorder = theme?.border || (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0');

    return (
      <View
        ref={ref}
        pointerEvents={pointerEvents}
        style={[
          styles.cardContainer,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            shadowColor: isDark ? '#000000' : '#0F172A',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: isDark ? 0.35 : 0.12,
            shadowRadius: 24,
            elevation,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  }
);

LiquidGlassView.displayName = 'LiquidGlassView';

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
  },
});
