import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { calculateMilestones, MilestoneBadge } from '../utils/streakUtils';
import { ModalHeader } from './ModalHeader';
import { BlurOverlay } from './common/BlurOverlay';
import { t, isRTL, AppLanguage } from '../utils/i18n';
import { DIALOG_SAFE_TOP, DIALOG_SAFE_BOTTOM } from '../constants/layout';

interface MilestonesModalProps {
  visible: boolean;
  habits: Habit[];
  logs: HabitLogs;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
}

export const MilestonesModal: React.FC<MilestonesModalProps> = ({
  visible,
  habits,
  logs,
  theme,
  language = 'ar',
  onClose,
}) => {
  const milestones = calculateMilestones(habits, logs);
  const unlockedCount = milestones.filter((m) => m.unlocked).length;
  const overallPercent = Math.round((unlockedCount / milestones.length) * 100);
  const rtl = isRTL(language);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurOverlay theme={theme} style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.text === '#FFFFFF' ? '#000000' : '#0F172A',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: theme.text === '#FFFFFF' ? 0.35 : 0.12,
              shadowRadius: 24,
              elevation: 12,
            },
          ]}
        >
          {/* Header */}
          <ModalHeader
            title={t('badgesTitle', language)}
            icon="trophy"
            iconColor="#F1C40F"
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          {/* Overall Progress Banner */}
          <View style={[styles.progressBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.bannerTextRow}>
              <Text style={[styles.bannerPercent, { color: '#F1C40F' }]}>{overallPercent}%</Text>
              <Text style={[styles.bannerTitle, { color: theme.text }]}>
                تم فتح {unlockedCount} من أصل {milestones.length} وسام
              </Text>
            </View>
            <View style={[styles.track, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
              <View style={[styles.fill, { width: `${overallPercent}%`, backgroundColor: '#F1C40F' }]} />
            </View>
          </View>

          {/* Badges List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.badgesList}>
            {milestones.map((badge: MilestoneBadge) => {
              const percent = Math.min(100, Math.round((badge.currentCount / badge.targetCount) * 100));

              return (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeItem,
                    {
                      backgroundColor: badge.unlocked ? `${badge.color}10` : theme.surface,
                      borderColor: badge.unlocked ? `${badge.color}45` : theme.border,
                    },
                  ]}
                >
                  {/* Badge Icon */}
                  <View
                    style={[
                      styles.badgeIconBox,
                      {
                        backgroundColor: badge.unlocked ? `${badge.color}25` : 'rgba(150, 150, 150, 0.1)',
                        borderColor: badge.unlocked ? badge.color : 'transparent',
                        borderWidth: badge.unlocked ? 1.5 : 0,
                      },
                    ]}
                  >
                    <Ionicons
                      name={(badge.icon as any) || 'ribbon'}
                      size={24}
                      color={badge.unlocked ? badge.color : theme.textDim}
                    />
                  </View>

                  {/* Badge Content */}
                  <View style={styles.badgeInfoCol}>
                    <View style={styles.badgeTitleRow}>
                      <Text
                        style={[
                          styles.badgeStatusTag,
                          {
                            color: badge.unlocked ? badge.color : theme.textDim,
                            backgroundColor: badge.unlocked ? `${badge.color}18` : 'transparent',
                          },
                        ]}
                      >
                        {badge.unlocked ? 'مكتمل' : `${badge.currentCount} / ${badge.targetCount}`}
                      </Text>
                      <Text style={[styles.badgeTitle, { color: badge.unlocked ? theme.text : theme.textMuted }]}>
                        {badge.title}
                      </Text>
                    </View>

                    <Text style={[styles.badgeDesc, { color: theme.textMuted }]}>{badge.description}</Text>

                    {/* Mini Progress */}
                    {!badge.unlocked && (
                      <View style={styles.badgeProgressBox}>
                        <View style={[styles.badgeTrack, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                          <View
                            style={[
                              styles.badgeFill,
                              {
                                width: `${percent}%`,
                                backgroundColor: badge.color,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.badgePercentText, { color: theme.textDim }]}>{percent}%</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </BlurOverlay>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: DIALOG_SAFE_TOP,
    paddingBottom: DIALOG_SAFE_BOTTOM,
  },
  card: {
    width: '100%',
    maxHeight: '100%',
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  trophyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  closeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  bannerTextRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  bannerPercent: {
    fontSize: 14,
    fontWeight: '900',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  badgesList: {
    gap: 10,
  },
  badgeItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.2,
    gap: 12,
  },
  badgeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInfoCol: {
    flex: 1,
  },
  badgeTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  badgeStatusTag: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'right',
    marginBottom: 6,
  },
  badgeProgressBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  badgeTrack: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  badgeFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  badgePercentText: {
    fontSize: 10,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
});
