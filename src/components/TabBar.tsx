import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActiveTab } from '../types/habit';
import { ThemeColors } from '../constants/theme';

interface TabBarProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  theme: ThemeColors;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onTabChange, theme }) => {
  const tabs: { id: ActiveTab; label: string; icon: string; activeIcon: string }[] = [
    {
      id: 'habits',
      label: 'العادات',
      icon: 'grid-outline',
      activeIcon: 'grid',
    },
    {
      id: 'analytics',
      label: 'الإحصائيات',
      icon: 'pie-chart-outline',
      activeIcon: 'pie-chart',
    },
    {
      id: 'settings',
      label: 'البيانات',
      icon: 'settings-outline',
      activeIcon: 'settings',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
            style={styles.tabButton}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive && { backgroundColor: `${theme.primary}20` },
              ]}
            >
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={isActive ? theme.primary : theme.tabInactive}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.primary : theme.tabInactive,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    height: Platform.OS === 'ios' ? 84 : 68,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
  },
});
