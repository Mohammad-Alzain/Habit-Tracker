import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitCategory } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { t, isRTL, AppLanguage } from '../utils/i18n';
import { hapticService } from '../services/hapticService';

interface HabitKitHeaderProps {
  theme: ThemeColors;
  language?: AppLanguage;
  selectedCategory: 'all' | HabitCategory;
  onSelectCategory: (cat: 'all' | HabitCategory) => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  onAddNew: () => void;
  onOpenWidgets?: () => void;
  onOpenTemplates?: () => void;
  onOpenMilestones?: () => void;
  onOpenStacks?: () => void;
  onOpenStudies?: () => void;
  onToggleFilter?: () => void;
  isFilterHidden?: boolean;
}

export const HabitKitHeader: React.FC<HabitKitHeaderProps> = ({
  theme,
  language = 'ar',
  selectedCategory,
  onSelectCategory,
  onOpenSettings,
  onOpenAnalytics,
  onAddNew,
  onOpenWidgets,
  onOpenTemplates,
  onOpenMilestones,
  onOpenStacks,
  onOpenStudies,
  onToggleFilter,
  isFilterHidden = false,
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
      {/* Top action row with Scrollable feature pills */}
      <View style={[styles.topRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        {/* Quick Add Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            hapticService.light();
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
          {/* Toggle Filter Button */}
          {onToggleFilter && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticService.light();
                onToggleFilter();
              }}
              style={[
                styles.featurePillBtn,
                {
                  backgroundColor: !isFilterHidden ? `${theme.primary}25` : theme.surface,
                  borderColor: !isFilterHidden ? `${theme.primary}60` : theme.border,
                },
              ]}
            >
              <Ionicons
                name={isFilterHidden ? 'funnel-outline' : 'funnel'}
                size={14}
                color={!isFilterHidden ? theme.primary : theme.textDim}
              />
              <Text
                style={[
                  styles.featurePillText,
                  { color: !isFilterHidden ? theme.primary : theme.text },
                ]}
              >
                {isFilterHidden ? (rtl ? 'إظهار الفلاتر' : 'Show Filters') : (rtl ? 'إخفاء الفلاتر' : 'Hide Filters')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Stats chart button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticService.light();
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

        {/* Settings button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            hapticService.light();
            onOpenSettings();
          }}
          style={[styles.circleBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="settings-outline" size={20} color={theme.text} />
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
                    onSelectCategory(cat.id);
                  }}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected ? theme.surface : 'transparent',
                      borderColor: isSelected ? theme.border : 'transparent',
                      flexDirection: rtl ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={15}
                    color={isSelected ? theme.text : theme.textDim}
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
    alignItems: 'center',
    justifyContent: 'center',
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
