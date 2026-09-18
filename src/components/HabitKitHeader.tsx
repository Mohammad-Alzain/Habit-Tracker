import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitCategory } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { t, isRTL, AppLanguage } from '../utils/i18n';
import { hapticService } from '../services/hapticService';
import { soundService } from '../services/soundService';

interface HabitKitHeaderProps {
  theme: ThemeColors;
  language?: AppLanguage;
  selectedCategory: 'all' | HabitCategory;
  onSelectCategory: (cat: 'all' | HabitCategory) => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  onAddNew: () => void;
  onOpenRoadmap?: () => void;
  onOpenWidgets?: () => void;
  onOpenTemplates?: () => void;
  onOpenMilestones?: () => void;
  onOpenStacks?: () => void;
  onOpenStudies?: () => void;
  onOpenReorder?: () => void;
  onToggleFilter?: () => void;
  isFilterHidden?: boolean;
  onToggleSearch?: () => void;
  isSearchOpen?: boolean;
  onOpenWeeklyReview?: () => void;
}

export const HabitKitHeader: React.FC<HabitKitHeaderProps> = ({
  theme,
  language = 'ar',
  selectedCategory,
  onSelectCategory,
  onOpenSettings,
  onOpenAnalytics,
  onAddNew,
  onOpenRoadmap,
  onOpenWidgets,
  onOpenTemplates,
  onOpenMilestones,
  onOpenStacks,
  onOpenStudies,
  onOpenReorder,
  onToggleFilter,
  isFilterHidden = false,
  onToggleSearch,
  isSearchOpen = false,
  onOpenWeeklyReview,
}) => {
  const rtl = isRTL(language);

  const categories: { id: 'all' | HabitCategory; label: string; icon: string }[] = [
    { id: 'all', label: t('all', language), icon: 'apps-outline' },
    { id: 'learning', label: t('catLearning', language), icon: 'school-outline' },
    { id: 'health', label: t('catHealth', language), icon: 'heart-outline' },
    { id: 'fitness', label: t('catFitness', language), icon: 'barbell-outline' },
    { id: 'mind', label: t('catMind', language), icon: 'leaf-outline' },
    { id: 'work', label: t('catWork', language), icon: 'briefcase-outline' },
  ];

  return (
    <View style={styles.headerWrapper}>
      {/* Top action row */}
      <View style={[styles.topRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        {/* Quick Add Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            hapticService.light();
            soundService.playTap();
            onAddNew();
          }}
          style={[styles.purpleAddBtn, { backgroundColor: '#7C83FD' }]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Scrollable Actions Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.actionsScrollView}
          contentContainerStyle={[
            styles.actionsScroll,
            { flexDirection: rtl ? 'row-reverse' : 'row' },
          ]}
        >
          {/* Roadmap & Commitments Button */}
          {onOpenRoadmap && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.light();
                soundService.playTap();
                onOpenRoadmap();
              }}
              style={[
                styles.featurePillBtn,
                {
                  backgroundColor: 'rgba(255, 101, 101, 0.15)',
                  borderColor: 'rgba(255, 101, 101, 0.4)',
                  borderTopColor: 'rgba(255, 255, 255, 0.25)',
                },
              ]}
            >
              <Ionicons name="map-outline" size={15} color="#FF6565" />
              <Text style={[styles.featurePillText, { color: theme.text, fontWeight: '800' }]}>
                {language === 'ar' ? 'خريطة الالتزامات' : 'Roadmap'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Weekly Review Button */}
          {onOpenWeeklyReview && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.light();
                soundService.playTap();
                onOpenWeeklyReview();
              }}
              style={[
                styles.featurePillBtn,
                {
                  backgroundColor: 'rgba(46, 213, 115, 0.14)',
                  borderColor: 'rgba(46, 213, 115, 0.4)',
                },
              ]}
            >
              <Ionicons name="ribbon-outline" size={15} color="#2ED573" />
              <Text style={[styles.featurePillText, { color: theme.text, fontWeight: '800' }]}>
                {t('weeklyReviewTitle', language)}
              </Text>
            </TouchableOpacity>
          )}



          {/* Stats chart button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
              soundService.playTap();
              onOpenAnalytics();
            }}
            style={[styles.featurePillBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Ionicons name="bar-chart-outline" size={15} color="#7C83FD" />
            <Text style={[styles.featurePillText, { color: theme.text }]}>{t('statsAction', language)}</Text>
          </TouchableOpacity>

          {/* Habit Stacks Button */}
          {onOpenStacks && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.light();
                onOpenStacks();
              }}
              style={[styles.featurePillBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="link" size={15} color="#6C5CE7" />
              <Text style={[styles.featurePillText, { color: theme.text }]}>{t('stacksAction', language)}</Text>
            </TouchableOpacity>
          )}

          {/* Widgets Button */}
          {onOpenWidgets && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.light();
                onOpenWidgets();
              }}
              style={[styles.featurePillBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="cube-outline" size={15} color="#00CEC9" />
              <Text style={[styles.featurePillText, { color: theme.text }]}>{t('widgetsAction', language)}</Text>
            </TouchableOpacity>
          )}

          {/* Habit Templates Button */}
          {onOpenTemplates && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.light();
                onOpenTemplates();
              }}
              style={[styles.featurePillBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="sparkles" size={15} color="#F1C40F" />
              <Text style={[styles.featurePillText, { color: theme.text }]}>{t('templatesAction', language)}</Text>
            </TouchableOpacity>
          )}

          {/* Milestones / Badges Button */}
          {onOpenMilestones && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.light();
                onOpenMilestones();
              }}
              style={[styles.featurePillBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="trophy" size={15} color="#E67E22" />
              <Text style={[styles.featurePillText, { color: theme.text }]}>{t('badgesAction', language)}</Text>
            </TouchableOpacity>
          )}

          {/* Studies Button */}
          {onOpenStudies && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.light();
                onOpenStudies();
              }}
              style={[styles.featurePillBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="school-outline" size={15} color="#10B981" />
              <Text style={[styles.featurePillText, { color: theme.text }]}>{t('studiesAction', language)}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Actions Controls Group: Filter Toggle & Settings */}
        <View style={[styles.rightGroup, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          {onToggleSearch && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                hapticService.selection();
                soundService.playTap();
                onToggleSearch();
              }}
              style={[
                styles.circleBtn,
                {
                  backgroundColor: isSearchOpen ? `${theme.primary}25` : theme.surface,
                  borderColor: isSearchOpen ? `${theme.primary}80` : theme.border,
                },
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Ionicons
                name={isSearchOpen ? 'search' : 'search-outline'}
                size={18}
                color={isSearchOpen ? theme.primary : theme.text}
              />
            </TouchableOpacity>
          )}

          {onToggleFilter && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                hapticService.medium();
                soundService.playTap();
                onToggleFilter();
              }}
              style={[
                styles.circleBtn,
                {
                  backgroundColor: !isFilterHidden ? `${theme.primary}25` : theme.surface,
                  borderColor: !isFilterHidden ? `${theme.primary}80` : theme.border,
                },
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Ionicons
                name={!isFilterHidden ? 'funnel' : 'funnel-outline'}
                size={18}
                color={!isFilterHidden ? theme.primary : theme.text}
              />
              {selectedCategory !== 'all' && (
                <View style={[styles.filterActiveDot, { backgroundColor: theme.primary }]} />
              )}
            </TouchableOpacity>
          )}

          {/* Settings button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              hapticService.light();
              soundService.playTap();
              onOpenSettings();
            }}
            style={[
              styles.circleBtn,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons name="settings-outline" size={19} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Pills Strip */}
      {!isFilterHidden && (
        <View style={[styles.categoriesRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.categoryScroll,
              { flexDirection: rtl ? 'row-reverse' : 'row' },
            ]}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    hapticService.selection();
                    soundService.playTap();
                    onSelectCategory(cat.id);
                  }}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected ? theme.surface : (theme.text === '#FFFFFF' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)'),
                      borderColor: isSelected ? theme.primary : theme.border,
                      borderWidth: 1,
                      flexDirection: rtl ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={15}
                    color={isSelected ? theme.primary : theme.textDim}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: isSelected ? theme.text : theme.textDim,
                        fontWeight: isSelected ? '800' : '500',
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionsScrollView: {
    flex: 1,
    marginHorizontal: 8,
  },
  actionsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  leftActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  purpleAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C83FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderTopWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  filterActiveDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  featurePillBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 21,
    borderWidth: 1,
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoriesRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  categoryScroll: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
  },
});
