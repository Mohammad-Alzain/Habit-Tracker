import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../constants/theme';
import { hapticService } from '../services/hapticService';

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  theme: ThemeColors;
  isRTL?: boolean;
  onClose: () => void;
  actionButton?: React.ReactNode;
  showDragHandle?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  theme,
  onClose,
  actionButton,
  showDragHandle = false,
}) => {
  const handleClose = () => {
    hapticService.light();
    onClose();
  };

  return (
    <View style={styles.wrapper}>
      {showDragHandle && <View style={styles.dragHandle} />}
      <View style={styles.container}>
        {/* Dead-Center Title: Mathematically centered, decoupled from button widths */}
        <View style={styles.absoluteCenterTitle} pointerEvents="none">
          <Text
            style={[styles.titleText, { color: theme.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitleText, { color: theme.textMuted }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Physical Left: Close Button */}
        <View style={styles.leftSlot}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            style={[
              styles.closeCircle,
              {
                backgroundColor: theme.glassSurface || theme.surface,
                borderColor: theme.glassBorder || theme.border,
                borderWidth: 1,
              },
            ]}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Ionicons name="close" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Physical Right: Optional Action Button */}
        {actionButton && (
          <View style={styles.rightSlot}>
            {actionButton}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#383B46',
    marginBottom: 10,
  },
  container: {
    width: '100%',
    height: 48,
    position: 'relative',
    justifyContent: 'center',
  },
  absoluteCenterTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 54,
  },
  leftSlot: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
  rightSlot: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 10,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    maxWidth: '100%',
  },
  subtitleText: {
    fontSize: 11.5,
    marginTop: 1,
    textAlign: 'center',
    maxWidth: '100%',
  },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogHeaderContainer: {
    width: '100%',
    height: 44,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dialogAbsoluteCenterTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 46,
  },
  dialogLeftSlot: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
  closeCircleSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitleText: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    maxWidth: '100%',
  },
  dialogSubtitleText: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
    maxWidth: '100%',
  },
});

export interface DialogHeaderProps {
  title: string;
  subtitle?: string;
  theme: ThemeColors;
  isRTL?: boolean;
  onClose: () => void;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  title,
  subtitle,
  theme,
  onClose,
}) => {
  const handleClose = () => {
    hapticService.light();
    onClose();
  };

  return (
    <View style={styles.dialogHeaderContainer}>
      {/* Dead-Center Title: Mathematically centered, decoupled from button widths */}
      <View style={styles.dialogAbsoluteCenterTitle} pointerEvents="none">
        <Text
          style={[styles.dialogTitleText, { color: theme.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.dialogSubtitleText, { color: theme.textMuted }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Physical Left: Close button */}
      <View style={styles.dialogLeftSlot}>
        <TouchableOpacity
          onPress={handleClose}
          style={[
            styles.closeCircleSmall,
            {
              backgroundColor: theme.glassSurface || theme.surface,
              borderColor: theme.glassBorder || theme.border,
              borderWidth: 1,
            },
          ]}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Ionicons name="close" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

