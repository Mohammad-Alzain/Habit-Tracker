import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../constants/theme';
import { FrostedDialogModal } from './common/FrostedDialogModal';
import { hapticService } from '../services/hapticService';
import { soundService } from '../services/soundService';

interface ToolsHubModalProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeColors;
  onOpenRoadmap?: () => void;
  onOpenStacks?: () => void;
  onOpenWidgets?: () => void;
  onOpenTemplates?: () => void;
  onOpenMilestones?: () => void;
  onOpenStudies?: () => void;
  onOpenReorder?: () => void;
  onOpenWeeklyReview?: () => void;
}

export const ToolsHubModal: React.FC<ToolsHubModalProps> = ({
  visible,
  onClose,
  theme,
  onOpenRoadmap,
  onOpenStacks,
  onOpenWidgets,
  onOpenTemplates,
  onOpenMilestones,
  onOpenStudies,
  onOpenReorder,
  onOpenWeeklyReview,
}) => {
  const tools = [
    {
      id: 'roadmap',
      title: 'خريطة الالتزامات والمهام',
      subtitle: 'جدول زمني ومسار تفاعلي للمهام اليومية',
      icon: 'trail-sign-outline',
      color: '#7C83FD',
      action: onOpenRoadmap,
    },
    {
      id: 'stacks',
      title: 'سلاسل العادات (Habit Stacks)',
      subtitle: 'دمج العادات المتتابعة لتعزيز الالتزام',
      icon: 'layers-outline',
      color: '#FF6B6B',
      action: onOpenStacks,
    },
    {
      id: 'widgets',
      title: 'الودجات والتنبيهات الذكية',
      subtitle: 'ودجات الشاشة الرئيسية والإشعارات الاستباقية',
      icon: 'albums-outline',
      color: '#2ECC71',
      action: onOpenWidgets,
    },
    {
      id: 'templates',
      title: 'قوالب العادات الجاهزة',
      subtitle: 'عادات وروتينات مثبتة علمياً للبدء الفوري',
      icon: 'copy-outline',
      color: '#00CEC9',
      action: onOpenTemplates,
    },
    {
      id: 'milestones',
      title: 'شارات الإنجاز والستريك',
      subtitle: 'احتفل بمستويات الاستمرار وجمع الأوسمة',
      icon: 'trophy-outline',
      color: '#F1C40F',
      action: onOpenMilestones,
    },
    {
      id: 'studies',
      title: 'الدراسات السلوكية والنصائح',
      subtitle: 'أبحاث علم النفس السلوكي وكيفية بناء العادة',
      icon: 'library-outline',
      color: '#A29BFE',
      action: onOpenStudies,
    },
    {
      id: 'weeklyReview',
      title: 'المحصلة الأسبوعية',
      subtitle: 'تحليل ونظرة شاملة لأداء الأسبوع المنصرم',
      icon: 'calendar-outline',
      color: '#6C5CE7',
      action: onOpenWeeklyReview,
    },
    {
      id: 'reorder',
      title: 'إعادة ترتيب العادات',
      subtitle: 'تخصيص ترتيب ظهور العادات في الشاشة',
      icon: 'swap-vertical-outline',
      color: '#E17055',
      action: onOpenReorder,
    },
  ];

  const handleSelectTool = (action?: () => void) => {
    hapticService.selection();
    soundService.playTap();
    onClose();
    if (action) {
      setTimeout(() => {
        action();
      }, 150);
    }
  };

  return (
    <FrostedDialogModal
      visible={visible}
      onClose={onClose}
      theme={theme}
      style={styles.modalCard}
    >
      <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              hapticService.light();
              onClose();
            }}
            style={[styles.closeBtn, { backgroundColor: theme.surface }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>مركز الأدوات والميزات</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
              الوصول السريع إلى كافة ميزات الإنتاجية وعلم السلوك
            </Text>
          </View>
        </View>

        {/* Tools List */}
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {tools.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.72}
              onPress={() => handleSelectTool(item.action)}
              style={[styles.toolItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={[styles.chevronWrap, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name="chevron-back" size={16} color={item.color} />
              </View>

              <View style={styles.toolInfo}>
                <Text style={[styles.toolTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.toolSubtitle, { color: theme.textDim }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>

              <View style={[styles.toolIconWrap, { backgroundColor: `${item.color}22` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </FrostedDialogModal>
  );
};

const styles = StyleSheet.create({
  modalCard: {
    maxWidth: 420,
    width: '100%',
  },
  container: {
    width: '100%',
    maxHeight: 560,
    borderRadius: 24,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  list: {
    maxHeight: 460,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  toolIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  toolInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  toolTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 2,
  },
  toolSubtitle: {
    fontSize: 11,
    textAlign: 'right',
  },
  chevronWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
});
