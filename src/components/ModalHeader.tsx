import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../constants/theme';

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
  icon,
  iconColor,
  iconBgColor,
  theme,
  isRTL = true,
  onClose,
  actionButton,
  showDragHandle = false,
}) => {
  const closeBtnElement = (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onClose}
      style={[styles.closeCircle, { backgroundColor: theme.surface }]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="close" size={20} color={theme.textMuted} />
    </TouchableOpacity>
  );

  const titleBlockElement = (
    <View style={[styles.titleRow, isRTL ? styles.titleRowRTL : styles.titleRowLTR]}>
      {icon && (
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: iconBgColor || `${iconColor || theme.primary}18` },
          ]}
        >
          <Ionicons name={icon as any} size={20} color={iconColor || theme.primary} />
        </View>
      )}
      <View style={[styles.textCol, isRTL ? styles.textColRTL : styles.textColLTR]}>
        <Text
          style={[
            styles.titleText,
            { color: theme.text, textAlign: isRTL ? 'right' : 'left' },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitleText,
              { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {showDragHandle && <View style={styles.dragHandle} />}
      <View style={[styles.container, isRTL ? styles.containerRTL : styles.containerLTR]}>
        {/* In RTL (Arabic): Close button is strictly on the LEFT */}
        {isRTL ? (
          <>
            <View style={styles.sideSlot}>
              {closeBtnElement}
            </View>
            <View style={styles.centerSlot}>
              {titleBlockElement}
            </View>
            <View style={styles.sideSlot}>
              {actionButton || <View style={{ width: 36 }} />}
            </View>
          </>
        ) : (
          /* In LTR (English): Title on Left, Close button strictly on the RIGHT */
          <>
            <View style={styles.sideSlot}>
              {actionButton || <View style={{ width: 36 }} />}
            </View>
            <View style={styles.centerSlot}>
              {titleBlockElement}
            </View>
            <View style={styles.sideSlot}>
              {closeBtnElement}
            </View>
          </>
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
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#383B46',
    marginBottom: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  containerRTL: {
    flexDirection: 'row',
  },
  containerLTR: {
    flexDirection: 'row',
  },
  sideSlot: {
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    marginHorizontal: 8,
  },
  titleRow: {
    alignItems: 'center',
    gap: 8,
  },
  titleRowRTL: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
  },
  titleRowLTR: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  textCol: {
    flexShrink: 1,
  },
  textColRTL: {
    alignItems: 'flex-end',
  },
  textColLTR: {
    alignItems: 'flex-start',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '900',
  },
  subtitleText: {
    fontSize: 11.5,
    marginTop: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogHeaderContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  closeCircleSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitleCol: {
    flex: 1,
    marginHorizontal: 10,
  },
  dialogTitleText: {
    fontSize: 17,
    fontWeight: '800',
  },
  dialogSubtitleText: {
    fontSize: 12,
    marginTop: 2,
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
  isRTL = true,
  onClose,
}) => {
  return (
    <View style={[styles.dialogHeaderContainer, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}>
      <TouchableOpacity
        onPress={onClose}
        style={[styles.closeCircleSmall, { backgroundColor: theme.surface }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={20} color={theme.textMuted} />
      </TouchableOpacity>

      <View style={[styles.dialogTitleCol, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={[styles.dialogTitleText, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.dialogSubtitleText, { color: theme.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

