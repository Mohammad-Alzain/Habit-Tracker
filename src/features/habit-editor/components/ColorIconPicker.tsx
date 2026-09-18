import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HABITKIT_PALETTE, HABIT_ICONS, ThemeColors } from '../../../constants/theme';
import { hapticService } from '../../../services/hapticService';

interface ColorIconPickerProps {
  selectedColor: string;
  selectedIcon: string;
  onSelectColor: (color: string) => void;
  onSelectIcon: (icon: string) => void;
  theme: ThemeColors;
}

export const ColorIconPicker: React.FC<ColorIconPickerProps> = ({
  selectedColor,
  selectedIcon,
  onSelectColor,
  onSelectIcon,
  theme,
}) => {
  return (
    <View style={styles.container}>
      {/* Large Icon Preview */}
      <View style={styles.iconPreviewSection}>
        <View
          style={[
            styles.largeIconBadge,
            {
              backgroundColor: `${selectedColor}25`,
              borderColor: `${selectedColor}50`,
            },
          ]}
        >
          <Ionicons
            name={(selectedIcon as any) || 'pulse-outline'}
            size={42}
            color={selectedColor}
          />
        </View>

        {/* Quick horizontal icon options */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconPickerScroll}>
          {HABIT_ICONS.map((ic) => {
            const isSelected = selectedIcon === ic;
            return (
              <TouchableOpacity
                key={ic}
                onPress={() => {
                  hapticService.selection();
                  onSelectIcon(ic);
                }}
                style={[
                  styles.iconOptionBtn,
                  isSelected && {
                    backgroundColor: `${selectedColor}30`,
                    borderColor: selectedColor,
                  },
                ]}
              >
                <Ionicons
                  name={ic as any}
                  size={20}
                  color={isSelected ? selectedColor : theme.textDim}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Color Palette Grid */}
      <View style={styles.paletteSection}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>اللون</Text>
        <View style={styles.paletteGrid}>
          {HABITKIT_PALETTE.map((col) => {
            const isSelected = selectedColor === col;
            return (
              <TouchableOpacity
                key={col}
                onPress={() => {
                  hapticService.selection();
                  onSelectColor(col);
                }}
                style={[
                  styles.colorDot,
                  { backgroundColor: col },
                  isSelected && styles.colorDotSelected,
                ]}
              >
                {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  iconPreviewSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  largeIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconPickerScroll: {
    gap: 8,
    paddingHorizontal: 8,
  },
  iconOptionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  paletteSection: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'right',
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
});
