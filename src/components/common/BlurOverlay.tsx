import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ThemeColors } from '../../constants/theme';

interface BlurOverlayProps {
  tint?: 'dark' | 'light' | 'extraLight';
  theme?: ThemeColors;
  intensity?: number;
  blurTarget?: React.RefObject<any>;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Clean, solid, high-contrast modal backdrop scrim.
 * Free from broken blur overlays, transparent artifacts, or performance lags.
 */
export const BlurOverlay: React.FC<BlurOverlayProps> = ({
  theme,
  children,
  style,
}) => {
  const isDark = theme ? theme.text === '#FFFFFF' : true;
  const overlayBg = theme?.modalOverlay || (isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(15, 23, 42, 0.40)');

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: overlayBg },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
