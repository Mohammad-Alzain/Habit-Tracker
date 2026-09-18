import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { hapticService } from '../../../services/hapticService';
import { soundService } from '../../../services/soundService';
import { t, isRTL, AppLanguage } from '../../../utils/i18n';

export interface HabitOptionsMenuModalProps {
  visible: boolean;
  habit: Habit | null;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
  onEdit: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  onDelete: () => void;
  onTogglePin?: () => void;
  onDuplicate?: () => void;
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
  onTogglePin,
  onDuplicate,
}) => {
  if (!habit) return null;
  const rtl = isRTL(language);

  const handleAction = (action: () => void) => {
    soundService.playTap();
    hapticService.light();
    onClose();
    setTimeout(action, 220);
  };

  const isDark = theme.text === '#FFFFFF';
  const backdropColor = isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(15, 23, 42, 0.45)';
  const groupedCardBg = theme.card;
  const dividerColor = theme.border;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdropOverlay}>
        {/* Backdrop Dismiss Area */}
        <Pressable
          style={[styles.backdropDismiss, { backgroundColor: backdropColor }]}
          onPress={onClose}
        />

        {/* Bottom Sheet Card */}
        <View
          style={[
            styles.sheetCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Top Drag Indicator */}
          <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />

          {/* Habit Identity Header */}
          <View style={[styles.habitHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: `${habit.color}22`,
                  borderColor: `${habit.color}55`,
                },
              ]}
            >
              <Ionicons name={habit.icon as any} size={26} color={habit.color} />
            </View>

            <View style={[styles.titleWrap, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.habitName, { color: theme.text }]} numberOfLines={1}>
                {habit.name}
              </Text>
              <View style={[styles.metaBadgesRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                {habit.pinned && (
                  <View style={[styles.metaBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={[styles.metaBadgeText, { color: '#F59E0B' }]}>
                      {language === 'ar' ? 'مثبتة' : 'Pinned'}
                    </Text>
                  </View>
                )}
                <View style={[styles.metaBadge, { backgroundColor: `${theme.card}` }]}>
                  <Text style={[styles.metaBadgeText, { color: theme.textMuted }]}>
                    {habit.mode === 'quit'
                      ? (language === 'ar' ? 'إقلاع عن عادة' : 'Quit Habit')
                      : (language === 'ar' ? 'بناء عادة' : 'Build Habit')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Grouped Primary Actions List */}
          <View
            style={[
              styles.actionsGroupCard,
              {
                backgroundColor: groupedCardBg,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Edit Habit */}
            <TouchableOpacity
              activeOpacity={0.65}
              onPress={() => handleAction(onEdit)}
              style={[styles.menuRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}
            >
              <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.textDim} />
              <View style={[styles.rowMain, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                <View style={[styles.actionIconPill, { backgroundColor: 'rgba(124, 131, 253, 0.12)' }]}>
                  <Ionicons name="pencil-outline" size={18} color="#7C83FD" />
                </View>
                <Text style={[styles.actionLabel, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                  {t('editHabitOption', language)}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.rowDivider, { backgroundColor: dividerColor }]} />

            {/* Pin / Unpin Habit */}
            {onTogglePin && (
              <>
                <TouchableOpacity
                  activeOpacity={0.65}
                  onPress={() => handleAction(onTogglePin)}
                  style={[styles.menuRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}
                >
                  <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.textDim} />
                  <View style={[styles.rowMain, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.actionIconPill, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                      <Ionicons
                        name={habit.pinned ? 'star' : 'star-outline'}
                        size={18}
                        color="#F59E0B"
                      />
                    </View>
                    <Text style={[styles.actionLabel, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                      {habit.pinned ? t('unpinHabitOption', language) : t('pinHabitOption', language)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={[styles.rowDivider, { backgroundColor: dividerColor }]} />
              </>
            )}

            {/* Duplicate Habit */}
            {onDuplicate && (
              <>
                <TouchableOpacity
                  activeOpacity={0.65}
                  onPress={() => handleAction(onDuplicate)}
                  style={[styles.menuRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}
                >
                  <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.textDim} />
                  <View style={[styles.rowMain, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.actionIconPill, { backgroundColor: 'rgba(162, 155, 254, 0.14)' }]}>
                      <Ionicons name="copy-outline" size={18} color="#A29BFE" />
                    </View>
                    <Text style={[styles.actionLabel, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                      {t('duplicateHabitOption', language)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={[styles.rowDivider, { backgroundColor: dividerColor }]} />
              </>
            )}

            {/* Share Trophy Card */}
            {onShare && (
              <>
                <TouchableOpacity
                  activeOpacity={0.65}
                  onPress={() => handleAction(onShare)}
                  style={[styles.menuRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}
                >
                  <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.textDim} />
                  <View style={[styles.rowMain, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.actionIconPill, { backgroundColor: 'rgba(0, 206, 201, 0.12)' }]}>
                      <Ionicons name="share-social-outline" size={18} color="#00CEC9" />
                    </View>
                    <Text style={[styles.actionLabel, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                      {t('shareCardOption', language)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={[styles.rowDivider, { backgroundColor: dividerColor }]} />
              </>
            )}

            {/* Archive Habit */}
            {onArchive && (
              <TouchableOpacity
                activeOpacity={0.65}
                onPress={() => handleAction(onArchive)}
                style={[styles.menuRow, { flexDirection: rtl ? 'row' : 'row-reverse' }]}
              >
                <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.textDim} />
                <View style={[styles.rowMain, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.actionIconPill, { backgroundColor: 'rgba(255, 190, 118, 0.14)' }]}>
                    <Ionicons name="archive-outline" size={18} color="#FFA502" />
                  </View>
                  <Text style={[styles.actionLabel, { color: theme.text, textAlign: rtl ? 'right' : 'left' }]}>
                    {t('archiveHabitOption', language)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Separated Danger Zone: Delete Habit */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleAction(onDelete)}
            style={[
              styles.dangerActionCard,
              {
                flexDirection: rtl ? 'row' : 'row-reverse',
              },
            ]}
          >
            <Ionicons name={rtl ? 'chevron-back' : 'chevron-forward'} size={18} color="#FF4757" />
            <View style={[styles.dangerRowMain, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <View style={styles.dangerIconPill}>
                <Ionicons name="trash-outline" size={18} color="#FF4757" />
              </View>
              <View style={[styles.dangerTextCol, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.dangerLabel}>
                  {t('deleteHabitOption', language)}
                </Text>
                <Text style={styles.dangerSubText}>
                  {language === 'ar'
                    ? 'سيتم مسح كافة السجلات والإحصائيات نهائياً'
                    : 'Permanently erases all logs and history'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Large Cancel Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticService.light();
              onClose();
            }}
            style={[
              styles.cancelButton,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.cancelButtonText, { color: theme.text }]}>
              {t('cancelAction', language)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheetCard: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 38 : 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  dragHandle: {
    width: 42,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 16,
  },
  habitHeader: {
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  habitName: {
    fontSize: 17,
    fontWeight: '800',
  },
  metaBadgesRow: {
    alignItems: 'center',
    gap: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  metaBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  actionsGroupCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  menuRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowMain: {
    alignItems: 'center',
    gap: 12,
  },
  actionIconPill: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  dangerActionCard: {
    backgroundColor: 'rgba(255, 71, 87, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.22)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  dangerRowMain: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dangerIconPill: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerTextCol: {
    gap: 2,
    flex: 1,
  },
  dangerLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FF4757',
  },
  dangerSubText: {
    fontSize: 11,
    color: 'rgba(255, 71, 87, 0.75)',
    fontWeight: '500',
  },
  cancelButton: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
});
