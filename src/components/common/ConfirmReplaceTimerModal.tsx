import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../constants/theme';
import { FrostedDialogModal } from './FrostedDialogModal';
import { LiquidGlassView } from './LiquidGlassView';
import { hapticService } from '../../services/hapticService';

interface ConfirmReplaceTimerModalProps {
  visible: boolean;
  theme: ThemeColors;
  runningTitle: string;
  newTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmReplaceTimerModal: React.FC<ConfirmReplaceTimerModalProps> = ({
  visible,
  theme,
  runningTitle,
  newTitle,
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  const isDark = theme.background.startsWith('#0') || theme.background === '#121212';

  return (
    <FrostedDialogModal
      visible={visible}
      theme={theme}
      onClose={onCancel}
      dismissibleOnTouchOutside={true}
    >
      <LiquidGlassView theme={theme} style={styles.card}>
        {/* Header Icon & Title */}
        <View style={styles.iconCircle}>
          <Ionicons name="timer" size={28} color="#FFA502" />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          مؤقت نشط يعمل حالياً ⏳
        </Text>

        {/* Message description */}
        <Text style={[styles.message, { color: theme.textMuted }]}>
          جلسة <Text style={{ color: '#FFA502', fontWeight: '800' }}>"{runningTitle}"</Text> تعمل في الخلفية.{'\n'}
          عند الموافقة، سيتم إيقافها وتحديد الإنجاز الحالي للبدء بمؤقت <Text style={{ color: theme.primary || '#7C83FD', fontWeight: '800' }}>"{newTitle}"</Text>.
        </Text>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticService.light();
              onCancel();
            }}
            style={[
              styles.btn,
              styles.cancelBtn,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' },
            ]}
          >
            <Text style={[styles.btnText, { color: theme.text }]}>إلغاء</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              hapticService.medium();
              onConfirm();
            }}
            style={[styles.btn, styles.confirmBtn]}
          >
            <Ionicons name="play-forward" size={16} color="#FFFFFF" />
            <Text style={[styles.btnText, { color: '#FFFFFF', fontWeight: '800' }]}>
              إيقاف وابدأ الجديد
            </Text>
          </TouchableOpacity>
        </View>
      </LiquidGlassView>
    </FrostedDialogModal>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 165, 2, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 165, 2, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16.5,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmBtn: {
    backgroundColor: '#FF6565',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
