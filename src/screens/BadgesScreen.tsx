import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { calculateGamification } from '../utils/gamificationUtils';

interface BadgesScreenProps {
  habits: Habit[];
  logs: HabitLogs;
  theme: ThemeColors;
}

export const BadgesScreen: React.FC<BadgesScreenProps> = ({ habits, logs, theme }) => {
  const { state: game, badges } = calculateGamification(habits, logs);
  const xpPercent = Math.min(100, Math.round((game.xp / game.nextLevelXP) * 100));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Gamification Level Hero Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <View style={styles.heroTop}>
          <View style={[styles.levelCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#F59E0B' }]}>
            <Ionicons name="ribbon" size={16} color="#F59E0B" />
            <Text style={styles.levelNumber}>{game.level}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.levelTitle, { color: theme.text }]}>{game.title}</Text>
            <Text style={[styles.xpText, { color: theme.textMuted }]}>
              {game.xp} / {game.nextLevelXP} XP للانتقال للمستوى القادم
            </Text>
          </View>
        </View>

        {/* Level XP Bar */}
        <View style={[styles.xpTrack, { backgroundColor: theme.surface }]}>
          <View
            style={[
              styles.xpFill,
              {
                width: `${xpPercent}%`,
                backgroundColor: '#F59E0B',
              },
            ]}
          />
        </View>
      </View>

      {/* Badges Trophy Showcase */}
      <View style={styles.sectionHeader}>
        <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          خزانة الأوسمة والإنجازات ({badges.filter((b) => b.unlocked).length} من {badges.length})
        </Text>
      </View>

      <View style={styles.badgesGrid}>
        {badges.map((badge) => {
          return (
            <View
              key={badge.id}
              style={[
                styles.badgeCard,
                {
                  backgroundColor: theme.card,
                  borderColor: badge.unlocked ? `${badge.color}66` : theme.cardBorder,
                  opacity: badge.unlocked ? 1 : 0.65,
                },
              ]}
            >
              <View
                style={[
                  styles.badgeIconBox,
                  {
                    backgroundColor: badge.unlocked ? `${badge.color}25` : theme.surface,
                    borderColor: badge.unlocked ? badge.color : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name={badge.unlocked ? (badge.icon as any) : 'lock-closed-outline'}
                  size={26}
                  color={badge.unlocked ? badge.color : theme.textDim}
                />
              </View>

              <Text style={[styles.badgeTitle, { color: theme.text }]}>{badge.title}</Text>
              <Text style={[styles.badgeDesc, { color: theme.textMuted }]}>
                {badge.description}
              </Text>

              {/* Progress */}
              <View style={styles.badgeFooter}>
                <View style={[styles.miniTrack, { backgroundColor: theme.surface }]}>
                  <View
                    style={[
                      styles.miniFill,
                      {
                        width: `${Math.min(100, (badge.progress / badge.maxProgress) * 100)}%`,
                        backgroundColor: badge.color,
                      },
                    ]}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {badge.unlocked && <Ionicons name="checkmark-circle" size={13} color={badge.color} />}
                  <Text style={[styles.badgeRewardText, { color: badge.unlocked ? badge.color : theme.textDim }]}>
                    {badge.unlocked ? 'مفتوح' : `+${badge.rewardXP} XP`}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 20,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  levelEmoji: {
    fontSize: 14,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F59E0B',
  },
  heroInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  xpText: {
    fontSize: 12,
  },
  xpTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    alignItems: 'center',
  },
  badgeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 12,
    height: 32,
  },
  badgeFooter: {
    width: '100%',
    alignItems: 'center',
  },
  miniTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  miniFill: {
    height: '100%',
    borderRadius: 2,
  },
  badgeRewardText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
