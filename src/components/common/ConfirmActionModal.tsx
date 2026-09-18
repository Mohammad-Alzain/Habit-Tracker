import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../constants/theme';
import { FrostedDialogModal } from './FrostedDialogModal';
import { LiquidGlassView } from './LiquidGlassView';
import { hapticService } from '../../services/hapticService';
import { soundService } from '../../services/soundService';

import { t, isRTL, AppLanguage } from '../../utils/i18n';

export interface ConfirmActionModalProps {
  visible: boolean;
  theme: ThemeColors;
  language?: AppLanguage;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  iconName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  visible,
  theme,
  language = 'ar',
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = true,
  iconName = 'trash-outline',
  onConfirm,
  onCancel,
}) => {
  const rtl = isRTL(language);
  const resolvedConfirmText = confirmText || t('confirmDeleteAction', language);
  const resolvedCancelText = cancelText || t('cancelAction', language);
  const handleConfirm = () => {
    soundService.playTap();
    if (isDestructive) {
      hapticService.warning();
    } else {
      hapticService.success();
    }
    onConfirm();
  };

  const handleCancel = () => {
    hapticService.light();
    onCancel();
  };

  return (
    <FrostedDialogModal visible={visible} theme={theme} onClose={handleCancel}>
      <LiquidGlassView theme={theme} style={styles.card}>
          {/* Icon Circle */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDestructive ? 'rgba(255, 71, 87, 0.14)' : 'rgba(124, 131, 253, 0.14)',
                borderColor: isDestructive ? 'rgba(255, 71, 87, 0.3)' : 'rgba(124, 131, 253, 0.3)',
              },
            ]}
          >
            <Ionicons
              name={iconName as any}
              size={28}
              color={isDestructive ? '#FF4757' : '#7C83FD'}
            />
          </View>

          {/* Title and Message */}
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>

          {/* Action Buttons Row */}
          <View style={[styles.actionsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleCancel}
              style={[styles.cancelBtn, { backgroundColor: theme.inputBg || theme.surface, borderColor: theme.border }]}
            >
              <Text style={[styles.cancelBtnText, { color: theme.text }]}>{resolvedCancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleConfirm}
              style={[
                styles.confirmBtn,
                { backgroundColor: isDestructive ? '#FF4757' : '#7C83FD' },
              ]}
            >
              <Text style={styles.confirmBtnText}>{resolvedConfirmText}</Text>
            </TouchableOpacity>
          </View>
        </LiquidGlassView>
    </FrostedDialogModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
