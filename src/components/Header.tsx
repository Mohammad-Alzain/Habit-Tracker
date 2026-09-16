import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../constants/theme';
import { getTodayString, formatFriendlyDate } from '../utils/dateUtils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  theme: ThemeColors;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
  onAddPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  theme,
  themeMode,
  onToggleTheme,
  onAddPress,
}) => {
  const todayStr = getTodayString();
  const dateFormatted = formatFriendlyDate(todayStr, 'ar');

  return (
    <View style={styles.header}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {subtitle || dateFormatted}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onToggleTheme}
          style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={themeMode === 'dark' ? '#FBBF24' : '#6366F1'}
          />
        </TouchableOpacity>

        {onAddPress && (
          <TouchableOpacity
            onPress={onAddPress}
            style={[styles.actionBtn, styles.addBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    borderWidth: 0,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
