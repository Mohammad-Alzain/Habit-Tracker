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
      {/* Top action row matching HabitKit Image 1 */}
      <View style={[styles.topRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        {/* Left Actions Group */}
        <View style={[styles.leftGroup, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          {/* Quick Add Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              hapticService.light();
              soundService.playTap();
              onAddNew();
            }}
            style={[styles.purpleAddBtn, { backgroundColor: '#7C83FD' }]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Stats chart button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              hapticService.light();
              soundService.playTap();
              onOpenAnalytics();
            }}
            style={[styles.circleBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Ionicons name="bar-chart-outline" size={18} color={theme.text} />
          </TouchableOpacity>

          {/* Filter Toggle Button */}
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
                size={17}
                color={!isFilterHidden ? theme.primary : theme.text}
              />
              {selectedCategory !== 'all' && (
                <View style={[styles.filterActiveDot, { backgroundColor: theme.primary }]} />
              )}
            </TouchableOpacity>
          )}

          {/* Search Toggle Button */}
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
                size={17}
                color={isSearchOpen ? theme.primary : theme.text}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Right: Settings button */}
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
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="settings-outline" size={19} color={theme.text} />
        </TouchableOpacity>
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
  leftGroup: {
    flexDirection: 'row',
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
  filterActiveDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
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
