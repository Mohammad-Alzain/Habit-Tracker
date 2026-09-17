import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitCategory, HabitMode, HabitType, TrackingType, HabitGoal } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { ModalHeader } from './ModalHeader';
import { t, isRTL, AppLanguage } from '../utils/i18n';
import { DIALOG_SAFE_TOP, DIALOG_SAFE_BOTTOM } from '../constants/layout';

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  mode: HabitMode;
  icon: string;
  color: string;
  type: HabitType;
  trackingType: TrackingType;
  targetValue: number;
  unit?: string;
  goalFrequency: string;
  goal?: HabitGoal;
  recommendedTime: string;
}

interface HabitTemplatesModalProps {
  visible: boolean;
  theme: ThemeColors;
  onClose: () => void;
  onAddFromTemplate: (template: HabitTemplate) => void;
}

const TEMPLATE_PACKS: {
  packId: string;
  packTitle: string;
  packIcon: string;
  packBadgeColor: string;
  templates: HabitTemplate[];
}[] = [
  {
    packId: 'morning',
    packTitle: 'روتين الصباح المعجزة ☀️',
    packIcon: 'sunny-outline',
    packBadgeColor: '#F39C12',
    templates: [
      {
        id: 'tpl_water',
        name: 'شرب 500 مل ماء فور الاستيقاظ',
        description: 'تنشيط الدورة الدموية والجهاز الهضمي وبدء اليوم بحيوية',
        category: 'health',
        mode: 'build',
        icon: 'water-outline',
        color: '#3498DB',
        type: 'numeric',
        trackingType: 'step_by_step',
        targetValue: 2,
        unit: 'كوب',
        goalFrequency: '30 / شهر',
        recommendedTime: '06:30',
      },
      {
        id: 'tpl_meditation',
        name: 'تأمل وتنفس عميق 10 دقائق',
        description: 'تصفية الذهن وتقليل التوتر قبل بدء ضغوطات اليوم',
        category: 'mind',
        mode: 'build',
        icon: 'leaf-outline',
        color: '#2ECC71',
        type: 'boolean',
        trackingType: 'step_by_step',
        targetValue: 1,
        goalFrequency: '25 / شهر',
        recommendedTime: '07:00',
      },
      {
        id: 'tpl_morning_stretch',
        name: 'تمارين إطالة ومرونة صباحية',
        description: 'تحريك المفاصل والعضلات لزيادة النشاط والتركيز',
        category: 'fitness',
        mode: 'build',
        icon: 'barbell-outline',
        color: '#E67E22',
        type: 'boolean',
        trackingType: 'step_by_step',
        targetValue: 1,
        goalFrequency: '20 / شهر',
        recommendedTime: '07:15',
      },
    ],
  },
  {
    packId: 'focus',
    packTitle: 'الإنتاجية والعمل العميق ⚡',
    packIcon: 'flash-outline',
    packBadgeColor: '#7C83FD',
    templates: [
      {
        id: 'tpl_deep_work',
        name: 'جلسة عمل عميق بدون مقاطعات',
        description: 'جلسة تركيز كاملة لمدة 90 دقيقة على المهمة الأكثر أهمية',
        category: 'work',
        mode: 'build',
        icon: 'briefcase-outline',
        color: '#7C83FD',
        type: 'boolean',
        trackingType: 'step_by_step',
        targetValue: 1,
        goalFrequency: '22 / شهر',
        recommendedTime: '09:00',
      },
      {
        id: 'tpl_read_book',
        name: 'قراءة 20 صفحة يومياً',
        description: 'توسيع المدارك وبناء معرفة مستمرة بمعدل كتابين شهرياً',
        category: 'learning',
        mode: 'build',
        icon: 'book-outline',
        color: '#9B59B6',
        type: 'numeric',
        trackingType: 'step_by_step',
        targetValue: 20,
        unit: 'صفحة',
        goalFrequency: '26 / شهر',
        recommendedTime: '21:00',
      },
      {
        id: 'tpl_daily_planning',
        name: 'التخطيط اليومي وترتيب الأولويات',
        description: 'كتابة قائمة أهم 3 مهام لليوم قبل البدء بأي عمل',
        category: 'work',
        mode: 'build',
        icon: 'checkbox-outline',
        color: '#1ABC9C',
        type: 'boolean',
        trackingType: 'step_by_step',
        targetValue: 1,
        goalFrequency: '25 / شهر',
        recommendedTime: '08:30',
      },
    ],
  },
  {
    packId: 'quit',
    packTitle: 'الإقلاع عن العادات السلبية 🛡️',
    packIcon: 'shield-checkmark-outline',
    packBadgeColor: '#E74C3C',
    templates: [
      {
        id: 'tpl_quit_sugar',
        name: 'يوم بدون سكر مضاف',
        description: 'تجنب المشروبات الغازية والحلويات المصنعة لصحة مثالية',
        category: 'health',
        mode: 'quit',
        icon: 'restaurant-outline',
        color: '#E74C3C',
        type: 'boolean',
        trackingType: 'step_by_step',
        targetValue: 1,
        goalFrequency: '25 / شهر',
        recommendedTime: '20:00',
      },
      {
        id: 'tpl_quit_scrolling',
        name: 'الحد من التصفح العشوائي',
        description: 'عدم تصفح تطبيقات التواصل الاجتماعي لأكثر من 30 دقيقة',
        category: 'mind',
        mode: 'quit',
        icon: 'phone-portrait-outline',
        color: '#E84393',
        type: 'boolean',
        trackingType: 'step_by_step',
        targetValue: 1,
        goalFrequency: '28 / شهر',
        recommendedTime: '22:00',
      },
      {
        id: 'tpl_no_screens_bed',
        name: 'إيقاف الشاشات قبل النوم بساعة',
        description: 'حماية جودة النوم وتجنب الضوء الأزرق لراحة عميقة',
        category: 'health',
        mode: 'quit',
        icon: 'moon-outline',
        color: '#575FCF',
        type: 'boolean',
        trackingType: 'step_by_step',
        targetValue: 1,
        goalFrequency: '25 / شهر',
        recommendedTime: '22:30',
      },
    ],
  },
  {
    packId: 'fitness',
    packTitle: 'اللياقة والصحة البدنية 🏃',
    packIcon: 'bicycle-outline',
    packBadgeColor: '#00CEC9',
    templates: [
      {
        id: 'tpl_walk_steps',
        name: 'المشي 8,000 خطوة',
        description: 'الحفاظ على النشاط البدني وحرق السعرات بانتظام',
        category: 'fitness',
        mode: 'build',
        icon: 'walk-outline',
        color: '#00CEC9',
        type: 'boolean',
        trackingType: 'step_by_step',
        targetValue: 1,
        goalFrequency: '24 / شهر',
        recommendedTime: '17:30',
      },
      {
        id: 'tpl_workout',
        name: 'تمرين رياضي 45 دقيقة',
        description: 'تمارين المقاومة أو الكارديو لرفع اللياقة وبناء القوة',
        category: 'fitness',
        mode: 'build',
        icon: 'fitness-outline',
        color: '#FF6B6B',
        type: 'boolean',
        trackingType: 'step_by_step',
        targetValue: 1,
        goalFrequency: '16 / شهر',
        recommendedTime: '18:00',
      },
    ],
  },
];

export const HabitTemplatesModal: React.FC<HabitTemplatesModalProps> = ({
  visible,
  theme,
  language = 'ar',
  onClose,
  onAddFromTemplate,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>('morning');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const rtl = isRTL(language);

  const activePack = TEMPLATE_PACKS.find((p) => p.packId === selectedPackId) || TEMPLATE_PACKS[0];

  const handleAdd = (tpl: HabitTemplate) => {
    onAddFromTemplate(tpl);
    setAddedIds((prev) => ({ ...prev, [tpl.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [tpl.id]: false }));
    }, 2500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.glassSurface || theme.card,
              borderColor: theme.glassBorder || theme.cardBorder,
              borderTopColor: theme.glassSpecular || theme.border,
            },
          ]}
        >
          {/* Header */}
          <ModalHeader
            title={t('templatesTitle', language)}
            subtitle={t('templatesSub', language)}
            icon="sparkles"
            iconColor="#F1C40F"
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          {/* Pack Selector Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.packsScroll}
          >
            {TEMPLATE_PACKS.map((pack) => {
              const isSelected = selectedPackId === pack.packId;
              return (
                <TouchableOpacity
                  key={pack.packId}
                  activeOpacity={0.75}
                  onPress={() => setSelectedPackId(pack.packId)}
                  style={[
                    styles.packPill,
                    {
                      backgroundColor: isSelected ? pack.packBadgeColor : theme.surface,
                      borderColor: isSelected ? pack.packBadgeColor : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={pack.packIcon as any}
                    size={14}
                    color={isSelected ? '#FFFFFF' : theme.textMuted}
                  />
                  <Text
                    style={[
                      styles.packPillText,
                      { color: isSelected ? '#FFFFFF' : theme.textMuted },
                    ]}
                  >
                    {pack.packTitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Templates in Selected Pack */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.templatesList}>
            {activePack.templates.map((tpl) => {
              const isAdded = !!addedIds[tpl.id];
              return (
                <View
                  key={tpl.id}
                  style={[
                    styles.templateCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.tplIconCircle, { backgroundColor: `${tpl.color}25` }]}>
                        <Ionicons name={tpl.icon as any} size={22} color={tpl.color} />
                      </View>
                      <View style={styles.cardTitleCol}>
                        <View style={styles.modeBadgeRow}>
                          <Text style={[styles.tplName, { color: theme.text }]}>{tpl.name}</Text>
                          {tpl.mode === 'quit' && (
                            <View style={styles.quitBadge}>
                              <Text style={styles.quitBadgeText}>إقلاع 🛡️</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.tplDesc, { color: theme.textDim }]}>{tpl.description}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.metaRow}>
                      <View style={[styles.metaChip, { backgroundColor: `${tpl.color}15` }]}>
                        <Ionicons name="time-outline" size={12} color={tpl.color} />
                        <Text style={[styles.metaChipText, { color: tpl.color }]}>
                          {tpl.recommendedTime}
                        </Text>
                      </View>
                      <View style={[styles.metaChip, { backgroundColor: theme.card }]}>
                        <Ionicons name="locate-outline" size={12} color={theme.textDim} />
                        <Text style={[styles.metaChipText, { color: theme.textDim }]}>
                          {tpl.goalFrequency}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleAdd(tpl)}
                      disabled={isAdded}
                      style={[
                        styles.addBtn,
                        {
                          backgroundColor: isAdded ? '#10B981' : tpl.color,
                        },
                      ]}
                    >
                      <Ionicons
                        name={isAdded ? 'checkmark' : 'add'}
                        size={16}
                        color="#FFFFFF"
                      />
                      <Text style={styles.addBtnText}>
                        {isAdded ? 'تمت الإضافة!' : 'إضافة العادة'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
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
  modalCard: {
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
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  closeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSub: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
    textAlign: 'right',
  },
  packsScroll: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingBottom: 12,
  },
  packPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  packPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  templatesList: {
    maxHeight: 400,
  },
  templateCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  cardTopRow: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
  },
  tplIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  modeBadgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  tplName: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  quitBadge: {
    backgroundColor: '#E74C3C25',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  quitBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E74C3C',
  },
  tplDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: 10,
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  metaChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
