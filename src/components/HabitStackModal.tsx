import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs, HabitStack } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { getTodayString } from '../utils/dateUtils';
import { ModalHeader } from './ModalHeader';
import { t, isRTL, AppLanguage } from '../utils/i18n';

interface HabitStackModalProps {
  visible: boolean;
  habits: Habit[];
  logs: HabitLogs;
  stacks: HabitStack[];
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
  onCreateStack: (stack: Omit<HabitStack, 'id' | 'createdAt'>) => void;
  onDeleteStack: (stackId: string) => void;
  onToggleHabit?: (habitId: string) => void;
}

export const HabitStackModal: React.FC<HabitStackModalProps> = ({
  visible,
  habits,
  logs,
  stacks,
  theme,
  language = 'ar',
  onClose,
  onCreateStack,
  onDeleteStack,
  onToggleHabit,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [stackTitle, setStackTitle] = useState('');
  const [selectedAnchorId, setSelectedAnchorId] = useState<string>('');
  const [selectedFollowerIds, setSelectedFollowerIds] = useState<string[]>([]);
  const rtl = isRTL(language);

  const todayStr = getTodayString();
  const activeHabits = habits.filter((h) => !h.archived);

  const handleToggleFollower = (habitId: string) => {
    if (selectedFollowerIds.includes(habitId)) {
      setSelectedFollowerIds(selectedFollowerIds.filter((id) => id !== habitId));
    } else {
      setSelectedFollowerIds([...selectedFollowerIds, habitId]);
    }
  };

  const handleSaveNewStack = () => {
    if (!stackTitle.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة عنوان للسلسلة أولاً');
      return;
    }
    if (!selectedAnchorId) {
      Alert.alert('تنبيه', 'يرجى اختيار عادة مرساة (أساسية) لتبدأ بها');
      return;
    }
    if (selectedFollowerIds.length === 0) {
      Alert.alert('تنبيه', 'يرجى اختيار عادة واحدة على الأقل تتبع المرساة');
      return;
    }

    onCreateStack({
      title: stackTitle.trim(),
      triggerHabitId: selectedAnchorId,
      habitIds: selectedFollowerIds,
    });

    setStackTitle('');
    setSelectedAnchorId('');
    setSelectedFollowerIds([]);
    setIsCreating(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <ModalHeader
            title={t('stacksTitle', language)}
            icon="link-outline"
            iconColor="#E67E22"
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          {/* Educational Formula Banner */}
          <View style={[styles.formulaBanner, { backgroundColor: 'rgba(124, 131, 253, 0.1)', borderColor: 'rgba(124, 131, 253, 0.3)' }]}>
            <Text style={[styles.formulaTitle, { color: '#7C83FD' }]}>قاعدة تراكم العادات (Habit Stacking):</Text>
            <Text style={[styles.formulaText, { color: theme.text }]}>
              "بعد [العادة الراسخة] 👈 سأقوم فوراً بـ [العادة الجديدة] 👈 مكافأة سريعة 🎉"
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {!isCreating ? (
              <>
                {/* Add New Stack Button */}
                <TouchableOpacity
                  onPress={() => setIsCreating(true)}
                  style={[styles.newStackBtn, { backgroundColor: '#7C83FD' }]}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.newStackBtnText}>إنشاء سلسلة روتين جديدة</Text>
                </TouchableOpacity>

                {/* Stacks List */}
                {stacks.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Ionicons name="git-merge-outline" size={44} color={theme.textDim} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>لا توجد سلاسل روتين بعد</Text>
                    <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                      اربط عاداتك الصباحية أو المسائية معاً لتنجزها بتدفق تلقائي دون تسويف.
                    </Text>
                  </View>
                ) : (
                  stacks.map((stack) => {
                    const anchor = activeHabits.find((h) => h.id === stack.triggerHabitId);
                    const followers = stack.habitIds
                      .map((id) => activeHabits.find((h) => h.id === id))
                      .filter(Boolean) as Habit[];

                    const anchorDone = (logs[stack.triggerHabitId]?.[todayStr] || 0) >= (anchor?.targetValue || 1);

                    return (
                      <View
                        key={stack.id}
                        style={[styles.stackCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      >
                        {/* Stack Card Header */}
                        <View style={styles.stackCardHeader}>
                          <TouchableOpacity
                            onPress={() => onDeleteStack(stack.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons name="trash-outline" size={17} color={theme.textDim} />
                          </TouchableOpacity>

                          <View style={styles.stackTitleRow}>
                            <Text style={[styles.stackCardTitle, { color: theme.text }]}>{stack.title}</Text>
                            <Ionicons name="flash" size={16} color="#F1C40F" />
                          </View>
                        </View>

                        {/* Cue line */}
                        <Text style={[styles.cueLineText, { color: theme.textDim }]}>
                          🔗 {stack.cueText || 'بعد إنجاز:'}
                        </Text>

                        {/* Anchor Habit */}
                        {anchor && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => onToggleHabit(anchor.id)}
                            style={[
                              styles.stepPill,
                              {
                                backgroundColor: anchorDone ? `${anchor.color}25` : theme.card,
                                borderColor: anchorDone ? anchor.color : theme.border,
                              },
                            ]}
                          >
                            <Ionicons
                              name={anchorDone ? 'checkmark-circle' : 'radio-button-off'}
                              size={18}
                              color={anchorDone ? anchor.color : theme.textDim}
                            />
                            <Text
                              style={[
                                styles.stepName,
                                {
                                  color: anchorDone ? theme.text : theme.textMuted,
                                  textDecorationLine: anchorDone ? 'line-through' : 'none',
                                },
                              ]}
                            >
                              1. {anchor.name} (العادة الأساسية)
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* Flow Arrow */}
                        <View style={styles.flowArrowBox}>
                          <Ionicons name="arrow-down" size={16} color="#7C83FD" />
                        </View>

                        {/* Follower Habits */}
                        {followers.map((fHabit, fIdx) => {
                          const fDone = (logs[fHabit.id]?.[todayStr] || 0) >= (fHabit.targetValue || 1);

                          return (
                            <TouchableOpacity
                              key={fHabit.id}
                              activeOpacity={0.7}
                              onPress={() => onToggleHabit(fHabit.id)}
                              style={[
                                styles.stepPill,
                                {
                                  backgroundColor: fDone ? `${fHabit.color}25` : theme.card,
                                  borderColor: fDone ? fHabit.color : theme.border,
                                  marginTop: 4,
                                },
                              ]}
                            >
                              <Ionicons
                                name={fDone ? 'checkmark-circle' : 'radio-button-off'}
                                size={18}
                                color={fDone ? fHabit.color : theme.textDim}
                              />
                              <Text
                                style={[
                                  styles.stepName,
                                  {
                                    color: fDone ? theme.text : theme.textMuted,
                                    textDecorationLine: fDone ? 'line-through' : 'none',
                                  },
                                ]}
                              >
                                {fIdx + 2}. {fHabit.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })
                )}
              </>
            ) : (
              /* Create Form */
              <View style={styles.formWrap}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>اسم السلسلة (الروتين):</Text>
                <TextInput
                  value={stackTitle}
                  onChangeText={setStackTitle}
                  placeholder="مثال: روتين شحن الصباح ☀️"
                  placeholderTextColor={theme.textDim}
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                />

                <Text style={[styles.fieldLabel, { color: theme.text, marginTop: 12 }]}>
                  1. العادة الأساسية الراسخة (Anchor):
                </Text>
                <Text style={[styles.fieldSub, { color: theme.textDim }]}>
                  اختر عادة يومية تقوم بها دائماً بدون انقطاع لتكون المحفز:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                  {activeHabits.map((h) => {
                    const isSel = selectedAnchorId === h.id;
                    return (
                      <TouchableOpacity
                        key={h.id}
                        onPress={() => setSelectedAnchorId(h.id)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSel ? '#7C83FD' : theme.surface,
                            borderColor: isSel ? '#7C83FD' : theme.border,
                          },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: isSel ? '#FFFFFF' : theme.text }]}>
                          {h.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={[styles.fieldLabel, { color: theme.text, marginTop: 12 }]}>
                  2. العادات المرتبطة بالسلسلة:
                </Text>
                <Text style={[styles.fieldSub, { color: theme.textDim }]}>
                  اختر العادات التي ستنجزها تباعاً بعد العادة الأساسية:
                </Text>
                <View style={styles.followersWrap}>
                  {activeHabits
                    .filter((h) => h.id !== selectedAnchorId)
                    .map((h) => {
                      const isSel = selectedFollowerIds.includes(h.id);
                      return (
                        <TouchableOpacity
                          key={h.id}
                          onPress={() => handleToggleFollower(h.id)}
                          style={[
                            styles.followerPill,
                            {
                              backgroundColor: isSel ? `${h.color}25` : theme.surface,
                              borderColor: isSel ? h.color : theme.border,
                            },
                          ]}
                        >
                          <Ionicons
                            name={isSel ? 'checkmark-circle' : 'add-circle-outline'}
                            size={18}
                            color={isSel ? h.color : theme.textDim}
                          />
                          <Text style={[styles.followerText, { color: isSel ? theme.text : theme.textDim }]}>
                            {h.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>

                {/* Action buttons */}
                <View style={styles.formActions}>
                  <TouchableOpacity onPress={handleSaveNewStack} style={[styles.saveBtn, { backgroundColor: '#7C83FD' }]}>
                    <Text style={styles.saveBtnText}>حفظ السلسلة</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setIsCreating(false)} style={styles.cancelBtn}>
                    <Text style={[styles.cancelBtnText, { color: theme.textDim }]}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={{ height: 20 }} />
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
    padding: 16,
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 18,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  closeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formulaBanner: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  formulaTitle: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 2,
  },
  formulaText: {
    fontSize: 11.5,
    lineHeight: 18,
    textAlign: 'right',
    fontWeight: '600',
  },
  scrollContent: {
    gap: 12,
  },
  newStackBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 6,
  },
  newStackBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  stackCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 14,
  },
  stackCardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stackTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  stackCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cueLineText: {
    fontSize: 11.5,
    textAlign: 'right',
    marginBottom: 8,
  },
  stepPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepName: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  flowArrowBox: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  formWrap: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    textAlign: 'right',
  },
  fieldSub: {
    fontSize: 11,
    textAlign: 'right',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 8,
  },
  chipsScroll: {
    flexDirection: 'row-reverse',
    gap: 6,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  followersWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  followerPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  followerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  formActions: {
    gap: 8,
    marginTop: 8,
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  cancelBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
  },
});
