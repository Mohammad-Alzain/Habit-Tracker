import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { FrostedDialogModal } from '../../../components/common/FrostedDialogModal';
import { LiquidGlassView } from '../../../components/common/LiquidGlassView';
import { hapticService } from '../../../services/hapticService';
import { soundService } from '../../../services/soundService';

import { t, isRTL, AppLanguage } from '../../../utils/i18n';

interface HabitOptionsMenuModalProps {
  visible: boolean;
  habit: Habit | null;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
  onEdit: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  onDelete: () => void;
}

export const HabitOptionsMenuModal: React.FC<HabitOptionsMenuModalProps> = ({
  visible,
  habit,
  theme,
  language = 'ar',
  onClose,
  onEdit,
  onShare,
  onArchive,
  onDelete,
}) => {
  if (!habit) return null;
  const rtl = isRTL(language);

  const handleAction = (action: () => void) => {
    soundService.playTap();
    hapticService.light();
    onClose();
    setTimeout(action, 200);
  };

  return (
    <FrostedDialogModal visible={visible} theme={theme} onClose={onClose}>
      <LiquidGlassView theme={theme} style={styles.card}>
          {/* Header with Habit Info */}
          <View style={[styles.header, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: `${habit.color}22`, borderColor: `${habit.color}44` },
              ]}
            >
              <Ionicons name={habit.icon as any} size={24} color={habit.color} />
            </View>
            <View style={[styles.titleWrap, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.habitName, { color: theme.text }]} numberOfLines={1}>
                {habit.name}
              </Text>
              <Text style={[styles.subText, { color: theme.textMuted }]}>
                {t('habitOptionsTitle', language)}
              </Text>
            </View>
          </View>

          {/* Action Items */}
          <View style={styles.actionsList}>
            {/* Edit */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction(onEdit)}
              style={[styles.actionRow, { backgroundColor: theme.inputBg || theme.surface, borderColor: theme.glassBorder || theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
            >
              <View style={styles.actionLeft}>
                <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
              </View>
              <View style={[styles.actionRight, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.actionLabel, { color: theme.text }]}>
                  {t('editHabitOption', language)}
                </Text>
                <View style={[styles.miniIconCircle, { backgroundColor: 'rgba(124, 131, 253, 0.12)' }]}>
                  <Ionicons name="pencil-outline" size={17} color="#7C83FD" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Share */}
            {onShare && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAction(onShare)}
                style={[styles.actionRow, { backgroundColor: theme.inputBg || theme.surface, borderColor: theme.glassBorder || theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
              >
                <View style={styles.actionLeft}>
                  <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
                </View>
                <View style={[styles.actionRight, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.actionLabel, { color: theme.text }]}>
                    {t('shareCardOption', language)}
                  </Text>
                  <View style={[styles.miniIconCircle, { backgroundColor: `${habit.color}20` }]}>
                    <Ionicons name="share-social-outline" size={17} color={habit.color} />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Archive */}
            {onArchive && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAction(onArchive)}
                style={[styles.actionRow, { backgroundColor: theme.inputBg || theme.surface, borderColor: theme.glassBorder || theme.border, flexDirection: rtl ? 'row' : 'row-reverse' }]}
              >
                <View style={styles.actionLeft}>
                  <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.textDim} />
                </View>
                <View style={[styles.actionRight, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.actionLabel, { color: theme.text }]}>
                    {t('archiveHabitOption', language)}
                  </Text>
                  <View style={[styles.miniIconCircle, { backgroundColor: 'rgba(255, 190, 118, 0.14)' }]}>
                    <Ionicons name="archive-outline" size={17} color="#FFBE76" />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Delete */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAction(onDelete)}
              style={[
                styles.actionRow,
                { backgroundColor: 'rgba(255, 71, 87, 0.08)', borderColor: 'rgba(255, 71, 87, 0.25)', flexDirection: rtl ? 'row' : 'row-reverse' },
              ]}
            >
              <View style={styles.actionLeft}>
                <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={16} color="#FF4757" />
              </View>
              <View style={[styles.actionRight, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.actionLabel, { color: '#FF4757', fontWeight: '800' }]}>
                  {t('deleteHabitOption', language)}
                </Text>
                <View style={[styles.miniIconCircle, { backgroundColor: 'rgba(255, 71, 87, 0.15)' }]}>
                  <Ionicons name="trash-outline" size={17} color="#FF4757" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Cancel */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticService.light();
              onClose();
            }}
            style={[styles.cancelBtn, { backgroundColor: theme.inputBg || theme.surface, borderColor: theme.glassBorder || theme.border }]}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>
              {t('cancelAction', language)}
            </Text>
          </TouchableOpacity>
        </LiquidGlassView>
    </FrostedDialogModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '800',
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsList: {
    gap: 10,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  actionLeft: {
    paddingLeft: 4,
  },
  actionRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  miniIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  cancelBtn: {
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
});
