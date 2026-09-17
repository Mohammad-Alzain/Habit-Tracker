import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitType, HabitCategory, TimeOfDay, HabitGoal, HabitGoalType, HabitMode, TrackingType, DayOfWeek } from '../types/habit';
import { HABITKIT_PALETTE, HABIT_ICONS, ThemeColors } from '../constants/theme';
import { FULL_SCREEN_SAFE_TOP, DIALOG_SAFE_TOP, DIALOG_SAFE_BOTTOM } from '../constants/layout';
import { DialogHeader } from './ModalHeader';

interface HabitModalProps {
  visible: boolean;
  habitToEdit?: Habit | null;
  theme: ThemeColors;
  onClose: () => void;
  onSave: (habitData: {
    name: string;
    description: string;
    icon: string;
    color: string;
    mode: HabitMode;
    type: HabitType;
    trackingType: TrackingType;
    targetValue: number;
    unit?: string;
    category: HabitCategory;
    timeOfDay: TimeOfDay;
    goalFrequency?: string;
    goal?: HabitGoal;
    reminderEnabled?: boolean;
    reminderTime?: string;
  }) => void;
  onDelete?: (habitId: string) => void;
}

const CATEGORIES: { id: HabitCategory; label: string; icon: string }[] = [
  { id: 'learning', label: 'الدراسة 🎓', icon: 'school-outline' },
  { id: 'health', label: 'الصحة 💧', icon: 'heart-outline' },
  { id: 'fitness', label: 'الرياضة 🏋️', icon: 'barbell-outline' },
  { id: 'mind', label: 'الهدوء 🧘', icon: 'leaf-outline' },
  { id: 'work', label: 'العمل 💼', icon: 'briefcase-outline' },
  { id: 'lifestyle', label: 'الحياة ✨', icon: 'sparkles-outline' },
];

export const HabitModal: React.FC<HabitModalProps> = ({
  visible,
  habitToEdit,
  theme,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABITKIT_PALETTE[6]); // Coral / Salmon default
  const [selectedIcon, setSelectedIcon] = useState('pulse-outline');
  const [mode, setMode] = useState<HabitMode>('build'); // 'build' vs 'quit'
  const [habitType, setHabitType] = useState<HabitType>('boolean');
  const [timerMinutes, setTimerMinutes] = useState<number>(20);
  const [trackingType, setTrackingType] = useState<TrackingType>('step_by_step');
  const [targetPerDay, setTargetPerDay] = useState(1);
  const [category, setCategory] = useState<HabitCategory>('learning');
  const [goalFrequency, setGoalFrequency] = useState('4 / شهر');
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [customUnit, setCustomUnit] = useState('');
  const [error, setError] = useState('');

  // Custom Goal State
  const [goalType, setGoalType] = useState<HabitGoalType>('days');
  const [goalTargetValue, setGoalTargetValue] = useState<number>(66);
  const [goalModalVisible, setGoalModalVisible] = useState(false);

  // Reminder State
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderModalVisible, setReminderModalVisible] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setSelectedColor(habitToEdit.color);
      setSelectedIcon(habitToEdit.icon);
      setMode(habitToEdit.mode || 'build');
      setHabitType(habitToEdit.type || (habitToEdit.trackingType === 'custom_value' ? 'numeric' : 'boolean'));
      setTimerMinutes(habitToEdit.type === 'timer' ? (habitToEdit.targetValue || 20) : 20);
      setTrackingType(habitToEdit.trackingType || 'step_by_step');
      setTargetPerDay(habitToEdit.targetValue || habitToEdit.targetPerDay || 1);
      setCategory(habitToEdit.category || 'learning');
      setCustomUnit(habitToEdit.unit || '');
      setReminderEnabled(!!habitToEdit.reminderEnabled);
      setReminderTime(habitToEdit.reminderTime || '08:00');

      if (habitToEdit.goal) {
        setGoalType(habitToEdit.goal.type || 'days');
        setGoalTargetValue(habitToEdit.goal.targetValue || 66);
        setGoalFrequency(habitToEdit.goal.title || `${habitToEdit.goal.targetValue} يوماً`);
      } else if (habitToEdit.goalFrequency) {
        const m = habitToEdit.goalFrequency.match(/\d+/);
        const v = m ? parseInt(m[0], 10) : 30;
        setGoalType('days');
        setGoalTargetValue(v);
        setGoalFrequency(habitToEdit.goalFrequency);
      } else {
        setGoalType('days');
        setGoalTargetValue(66);
        setGoalFrequency('66 يوماً');
      }
    } else {
      setName('');
      setDescription('');
      setSelectedColor(HABITKIT_PALETTE[6]); // Coral / Salmon
      setSelectedIcon('pulse-outline');
      setMode('build');
      setHabitType('boolean');
      setTimerMinutes(20);
      setTrackingType('step_by_step');
      setTargetPerDay(1);
      setCategory('learning');
      setCustomUnit('');
      setReminderEnabled(false);
      setReminderTime('08:00');
      setGoalType('days');
      setGoalTargetValue(66);
      setGoalFrequency('66 يوماً');
    }
    setError('');
  }, [habitToEdit, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('يرجى كتابة اسم العادة');
      return;
    }

    const computedGoalTitle =
      goalType === 'days'
        ? `الاستمرار لـ ${goalTargetValue} يوماً`
        : goalType === 'months'
        ? `الاستمرار لـ ${goalTargetValue} أشهر`
        : goalType === 'streak'
        ? `ستريك ${goalTargetValue} يوم`
        : `${goalTargetValue} / شهر`;

    const finalTargetValue =
      habitType === 'timer'
        ? Math.max(1, timerMinutes)
        : habitType === 'numeric'
        ? Math.max(1, targetPerDay)
        : 1;

    const finalUnit =
      habitType === 'timer'
        ? 'دقيقة'
        : habitType === 'numeric'
        ? customUnit.trim() || undefined
        : undefined;

    onSave({
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      mode,
      type: habitType,
      trackingType: habitType === 'numeric' ? 'custom_value' : 'step_by_step',
      targetValue: finalTargetValue,
      unit: finalUnit,
      category,
      timeOfDay: 'anytime',
      goalFrequency: computedGoalTitle,
      goal: {
        type: goalType,
        targetValue: Math.max(1, goalTargetValue),
        title: computedGoalTitle,
      },
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!habitToEdit || !onDelete) return;
    Alert.alert('تأكيد الحذف', `هل أنت متأكد من رغبتك في حذف عادة "${habitToEdit.name}" نهائياً؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          onDelete(habitToEdit.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Top Header matching Images 2 & 3 */}
        <View style={styles.topHeader}>
          <View style={styles.dragHandle} />
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={[styles.closeCircle, { backgroundColor: theme.surface }]}>
              <Ionicons name="close" size={20} color={theme.textMuted} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {habitToEdit ? 'تحرير العادة' : 'إنشاء العادة'}
            </Text>
            <View style={{ width: 36 }} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Big Circular Icon Preview matching Image 3 */}
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
              {HABIT_ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setSelectedIcon(ic)}
                  style={[
                    styles.iconOptionBtn,
                    selectedIcon === ic && {
                      backgroundColor: `${selectedColor}30`,
                      borderColor: selectedColor,
                    },
                  ]}
                >
                  <Ionicons
                    name={ic as any}
                    size={20}
                    color={selectedIcon === ic ? selectedColor : theme.textDim}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Name Input matching Image 3 */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>الاسم</Text>
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (error) setError('');
              }}
              placeholder="مثال: STUDING ENGLISH"
              placeholderTextColor={theme.textDim}
              style={[
                styles.inputBox,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: error ? theme.danger : theme.border,
                },
              ]}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Description Input matching Image 3 */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>الوصف</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="مثال: Road to B2"
              placeholderTextColor={theme.textDim}
              style={[
                styles.inputBox,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
            />
          </View>

          {/* Color Palette (3 rows x 7 swatches = 21 colors) matching Images 2 & 3 */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>اللون</Text>
            <View style={styles.paletteContainer}>
              {[0, 1, 2].map((rowIdx) => (
                <View key={rowIdx} style={styles.paletteRow}>
                  {HABITKIT_PALETTE.slice(rowIdx * 7, (rowIdx + 1) * 7).map((color, idx) => {
                    const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.7}
                        onPress={() => setSelectedColor(color)}
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: color },
                          isSelected && styles.colorSwatchActive,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* Habit Mode: بناء عادة vs إقلاع عن عادة matching Images 2 & 3 */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>نوع العادة</Text>
            <View style={[styles.segmentedControl, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => setMode('quit')}
                style={[
                  styles.segmentBtn,
                  mode === 'quit' && [styles.segmentBtnActive, { backgroundColor: theme.surface }],
                ]}
              >
                <Text style={[styles.segmentText, { color: mode === 'quit' ? theme.text : theme.textMuted }]}>
                  إقلاع عن عادة
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode('build')}
                style={[
                  styles.segmentBtn,
                  mode === 'build' && [styles.segmentBtnActive, { backgroundColor: theme.surface }],
                ]}
              >
                <Text style={[styles.segmentText, { color: mode === 'build' ? theme.text : theme.textMuted }]}>
                  بناء عادة
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.fieldHint, { color: theme.textDim }]}>
              {mode === 'build' ? 'علّم كل يوم تُكملها فيه.' : 'علّم كل يوم نجحت في الامتناع عنها فيه.'}
            </Text>
          </View>

          {/* Advanced Options Header Toggle */}
          <TouchableOpacity
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={styles.advancedToggle}
          >
            <Text style={[styles.advancedToggleText, { color: theme.textMuted }]}>
              خيارات متقدمة {showAdvanced ? '⌃' : '⌄'}
            </Text>
          </TouchableOpacity>

          {showAdvanced && (
            <View style={styles.advancedSection}>
              {/* Two Column Buttons: هدف العادة المخصص & تذكير */}
              <View style={styles.twoColRow}>
                <TouchableOpacity
                  onPress={() => setGoalModalVisible(true)}
                  style={[styles.halfColBtn, { backgroundColor: theme.card, borderColor: '#7C83FD60' }]}
                >
                  <Text style={[styles.halfColLabel, { color: theme.textDim }]}>هدف العادة 🎯</Text>
                  <View style={styles.halfColValRow}>
                    <Text style={[styles.halfColVal, { color: '#7C83FD' }]}>
                      {goalType === 'days'
                        ? `${goalTargetValue} يوم`
                        : goalType === 'months'
                        ? `${goalTargetValue} أشهر`
                        : goalType === 'streak'
                        ? `${goalTargetValue} ستريك`
                        : `${goalTargetValue} / شهر`}
                    </Text>
                    <Ionicons name="chevron-back" size={14} color="#7C83FD" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setReminderModalVisible(true)}
                  style={[
                    styles.halfColBtn,
                    {
                      backgroundColor: theme.card,
                      borderColor: reminderEnabled ? '#7C83FD' : theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.halfColLabel, { color: theme.textDim }]}>تذكير</Text>
                  <View style={styles.halfColValRow}>
                    <Text style={[styles.halfColVal, { color: reminderEnabled ? '#7C83FD' : theme.text }]}>
                      {reminderEnabled ? `🔔 ${reminderTime}` : '0 تذكير نشط'}
                    </Text>
                    <Ionicons name="chevron-back" size={14} color={theme.textDim} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Categories Selector matching Image 2 */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>الفئات</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catPillScroll}>
                  {CATEGORIES.map((c) => {
                    const isSelected = category === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => setCategory(c.id)}
                        style={[
                          styles.catSelectPill,
                          {
                            backgroundColor: isSelected ? theme.surface : theme.card,
                            borderColor: isSelected ? theme.border : 'transparent',
                          },
                        ]}
                      >
                        <Text style={[styles.catSelectText, { color: isSelected ? theme.text : theme.textMuted }]}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Habit Completion Modes: Boolean, Timer, Numeric */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>نمط تسجيل العادة 🎯</Text>
                <View style={[styles.segmentedControl, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <TouchableOpacity
                    onPress={() => setHabitType('numeric')}
                    style={[
                      styles.segmentBtn,
                      habitType === 'numeric' && [styles.segmentBtnActive, { backgroundColor: theme.surface }],
                    ]}
                  >
                    <Text style={[styles.segmentText, { color: habitType === 'numeric' ? theme.text : theme.textMuted }]}>
                      عداد كمي 📊
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setHabitType('timer')}
                    style={[
                      styles.segmentBtn,
                      habitType === 'timer' && [styles.segmentBtnActive, { backgroundColor: theme.surface }],
                    ]}
                  >
                    <Text style={[styles.segmentText, { color: habitType === 'timer' ? theme.text : theme.textMuted }]}>
                      مؤقت تركيز ⏱️
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setHabitType('boolean')}
                    style={[
                      styles.segmentBtn,
                      habitType === 'boolean' && [styles.segmentBtnActive, { backgroundColor: theme.surface }],
                    ]}
                  >
                    <Text style={[styles.segmentText, { color: habitType === 'boolean' ? theme.text : theme.textMuted }]}>
                      ضغطة إنجاز ✅
                    </Text>
                  </TouchableOpacity>
                </View>

                {habitType === 'boolean' && (
                  <Text style={[styles.fieldHint, { color: theme.textDim }]}>
                    نقرة واحدة سريعة على المربع أو البطاقة لتسجيل إنجاز اليوم.
                  </Text>
                )}

                {habitType === 'timer' && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted, fontSize: 12 }]}>
                      المدة المستهدفة للجلسة (بالدقائق):
                    </Text>
                    <View style={styles.timerPresetRow}>
                      {[15, 20, 25, 30, 45, 60].map((mins) => {
                        const isSel = timerMinutes === mins;
                        return (
                          <TouchableOpacity
                            key={mins}
                            onPress={() => setTimerMinutes(mins)}
                            style={[
                              styles.timerPresetChip,
                              {
                                backgroundColor: isSel ? '#7C83FD' : theme.card,
                                borderColor: isSel ? '#7C83FD' : theme.border,
                              },
                            ]}
                          >
                            <Text style={[styles.timerPresetText, { color: isSel ? '#FFFFFF' : theme.text }]}>
                              {mins === 25 ? '25د 🍅' : `${mins}د`}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={[styles.stepperRowCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 8 }]}>
                      <View style={styles.stepperActions}>
                        <TouchableOpacity
                          onPress={() => setTimerMinutes(Math.max(5, timerMinutes - 5))}
                          style={[styles.stepBtn, { backgroundColor: theme.surface }]}
                        >
                          <Ionicons name="remove" size={18} color={theme.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setTimerMinutes(timerMinutes + 5)}
                          style={[styles.stepBtn, { backgroundColor: theme.surface }]}
                        >
                          <Ionicons name="add" size={18} color={theme.text} />
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.stepValText, { color: theme.text }]}>
                        {timerMinutes} دقيقة / جلسة
                      </Text>
                    </View>

                    <Text style={[styles.fieldHint, { color: theme.textDim }]}>
                      عند النقر على العادة، سيفتح مؤقت تفاعلي لتسجيل الجلسة بدقة.
                    </Text>
                  </View>
                )}

                {habitType === 'numeric' && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted, fontSize: 12 }]}>
                      الهدف الرقمي اليومي والوحدة:
                    </Text>
                    <View style={[styles.stepperRowCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <View style={styles.stepperActions}>
                        <TouchableOpacity
                          onPress={() => setTargetPerDay(Math.max(1, targetPerDay - 1))}
                          style={[styles.stepBtn, { backgroundColor: theme.surface }]}
                        >
                          <Ionicons name="remove" size={18} color={theme.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setTargetPerDay(targetPerDay + 1)}
                          style={[styles.stepBtn, { backgroundColor: theme.surface }]}
                        >
                          <Ionicons name="add" size={18} color={theme.text} />
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.stepValText, { color: theme.text }]}>
                        {targetPerDay} {customUnit ? customUnit : 'مرات'} / يوم
                      </Text>
                    </View>

                    <TextInput
                      value={customUnit}
                      onChangeText={setCustomUnit}
                      placeholder="اسم الوحدة (مثال: أكواب، صفحة، تمرين، مل)"
                      placeholderTextColor={theme.textDim}
                      style={[
                        styles.inputBox,
                        {
                          backgroundColor: theme.card,
                          color: theme.text,
                          borderColor: theme.border,
                          marginTop: 8,
                          height: 44,
                          fontSize: 13,
                        },
                      ]}
                    />

                    <Text style={[styles.fieldHint, { color: theme.textDim }]}>
                      سيتم ملء المربع تدريجياً كلما سجلت تقدماً في هذا الرقم.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Delete Habit button if editing */}
          {habitToEdit && onDelete && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteLinkBtn}>
              <Text style={[styles.deleteLinkText, { color: theme.danger }]}>
                حذف هذه العادة نهائياً
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Fixed Save Button matching Images 2 & 3 */}
        <View style={[styles.bottomSaveBar, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSave}
            style={[styles.purpleSaveBtn, { backgroundColor: '#7C83FD' }]}
          >
            <Text style={styles.purpleSaveBtnText}>حفظ</Text>
          </TouchableOpacity>
        </View>
        {/* Habit Reminder Configuration Modal */}
        <Modal visible={reminderModalVisible} transparent animationType="fade" onRequestClose={() => setReminderModalVisible(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <View style={[styles.reminderCard, { backgroundColor: theme.glassSurface || theme.card, borderColor: theme.glassBorder || theme.cardBorder, borderTopColor: theme.glassSpecular || theme.cardBorder }]}>
              <DialogHeader
                title="ضبط تذكير العادة 🔔"
                theme={theme}
                isRTL={true}
                onClose={() => setReminderModalVisible(false)}
              />

              {/* Toggle switch */}
              <View style={styles.reminderToggleRow}>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: theme.surface, true: '#7C83FD' }}
                  thumbColor="#FFFFFF"
                />
                <View style={{ alignItems: 'flex-end', flex: 1, marginRight: 12 }}>
                  <Text style={[styles.reminderLabel, { color: theme.text }]}>تفعيل التذكير لهذه العادة</Text>
                  <Text style={[styles.reminderSub, { color: theme.textDim }]}>إرسال تنبيه يومي في وقت محدد</Text>
                </View>
              </View>

              {reminderEnabled && (
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.fieldSectionLabel, { color: theme.textDim }]}>اختر وقت التذكير</Text>
                  <View style={styles.presetTimeGrid}>
                    {['06:00', '07:30', '08:30', '12:00', '17:00', '20:30', '21:30', '22:30'].map((t) => {
                      const isSel = reminderTime === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setReminderTime(t)}
                          style={[
                            styles.presetTimeBtn,
                            {
                              backgroundColor: isSel ? '#7C83FD' : theme.surface,
                              borderColor: isSel ? '#7C83FD' : theme.border,
                            },
                          ]}
                        >
                          <Text style={[styles.presetTimeText, { color: isSel ? '#FFF' : theme.text }]}>
                            {t}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={() => setReminderModalVisible(false)}
                style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 20 }]}
              >
                <Text style={styles.confirmBtnText}>حفظ التذكير</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Custom Goal Modal */}
        <Modal visible={goalModalVisible} transparent animationType="fade" onRequestClose={() => setGoalModalVisible(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <View style={[styles.reminderCard, { backgroundColor: theme.glassSurface || theme.card, borderColor: theme.glassBorder || theme.cardBorder, borderTopColor: theme.glassSpecular || theme.cardBorder }]}>
              <DialogHeader
                title="تحديد هدف العادة 🎯"
                theme={theme}
                isRTL={true}
                onClose={() => setGoalModalVisible(false)}
              />

              {/* Goal Type Tabs */}
              <View style={[styles.goalTypeTabs, { backgroundColor: theme.surface }]}>
                {[
                  { id: 'days', label: 'أيام محددة 📅' },
                  { id: 'months', label: 'أشهر 🗓️' },
                  { id: 'streak', label: 'ستريك 🔥' },
                  { id: 'frequency', label: 'شهرياً 📊' },
                ].map((tab) => {
                  const isSel = goalType === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => {
                        setGoalType(tab.id as HabitGoalType);
                        if (tab.id === 'days' && goalTargetValue < 10) setGoalTargetValue(66);
                        if (tab.id === 'months' && goalTargetValue > 24) setGoalTargetValue(3);
                        if (tab.id === 'streak' && goalTargetValue > 100) setGoalTargetValue(30);
                        if (tab.id === 'frequency' && goalTargetValue > 31) setGoalTargetValue(20);
                      }}
                      style={[
                        styles.goalTypeTabBtn,
                        isSel && { backgroundColor: '#7C83FD' },
                      ]}
                    >
                      <Text style={[styles.goalTypeTabText, { color: isSel ? '#FFFFFF' : theme.textDim }]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Preset Chips */}
              <Text style={[styles.fieldSectionLabel, { color: theme.textDim, textAlign: 'right' }]}>
                {goalType === 'days'
                  ? 'خيارات الأيام الموصى بها علمياً:'
                  : goalType === 'months'
                  ? 'خيارات الأشهر الشائعة:'
                  : goalType === 'streak'
                  ? 'خيارات السلسلة المتواصلة:'
                  : 'مرات التكرار شهرياً:'}
              </Text>

              <View style={styles.goalPresetsWrap}>
                {(goalType === 'days'
                  ? [
                      { val: 21, label: '21 يوم (بناء)' },
                      { val: 30, label: '30 يوماً' },
                      { val: 66, label: '66 يوم (ترسيخ)' },
                      { val: 100, label: '100 يوم (احتراف)' },
                      { val: 180, label: '180 يوم' },
                      { val: 365, label: '365 يوم' },
                    ]
                  : goalType === 'months'
                  ? [
                      { val: 1, label: 'شهر واحد (1)' },
                      { val: 3, label: '3 أشهر (فصل)' },
                      { val: 6, label: '6 أشهر (نصف سنة)' },
                      { val: 12, label: '12 شهراً (سنة)' },
                    ]
                  : goalType === 'streak'
                  ? [
                      { val: 7, label: '7 أيام ستريك' },
                      { val: 14, label: '14 يوماً' },
                      { val: 30, label: '30 يوماً متواصلة' },
                      { val: 50, label: '50 يوماً' },
                      { val: 100, label: '100 يوم ستريك' },
                    ]
                  : [
                      { val: 4, label: '4 مرات / شهر' },
                      { val: 8, label: '8 مرات / شهر' },
                      { val: 12, label: '12 مرة / شهر' },
                      { val: 20, label: '20 مرة / شهر' },
                      { val: 26, label: '26 مرة / شهر' },
                      { val: 30, label: '30 مرة / شهر' },
                    ]
                ).map((item) => {
                  const isSel = goalTargetValue === item.val;
                  return (
                    <TouchableOpacity
                      key={item.val}
                      onPress={() => setGoalTargetValue(item.val)}
                      style={[
                        styles.goalPresetChip,
                        {
                          backgroundColor: isSel ? '#7C83FD' : theme.surface,
                          borderColor: isSel ? '#7C83FD' : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.goalPresetText, { color: isSel ? '#FFF' : theme.text }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Number Input & Stepper */}
              <Text style={[styles.fieldSectionLabel, { color: theme.textDim, textAlign: 'right', marginTop: 12 }]}>
                أو اكتب الرقم المخصص الذي تريده بدقة:
              </Text>

              <View style={[styles.customGoalInputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <TouchableOpacity
                  onPress={() => setGoalTargetValue(Math.max(1, goalTargetValue - (goalType === 'months' ? 1 : 5)))}
                  style={[styles.stepperSmallBtn, { backgroundColor: theme.card }]}
                >
                  <Ionicons name="remove" size={18} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.customGoalCenterCol}>
                  <TextInput
                    value={String(goalTargetValue)}
                    onChangeText={(txt) => {
                      const num = parseInt(txt.replace(/[^0-9]/g, ''), 10);
                      setGoalTargetValue(isNaN(num) ? 1 : Math.max(1, num));
                    }}
                    keyboardType="numeric"
                    style={[styles.customGoalTextInput, { color: theme.text }]}
                  />
                  <Text style={[styles.customGoalUnitText, { color: theme.textDim }]}>
                    {goalType === 'days' ? 'يوماً' : goalType === 'months' ? 'أشهر' : goalType === 'streak' ? 'يوم ستريك' : 'مرة / شهر'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setGoalTargetValue(goalTargetValue + (goalType === 'months' ? 1 : 5))}
                  style={[styles.stepperSmallBtn, { backgroundColor: theme.card }]}
                >
                  <Ionicons name="add" size={18} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Summary explanation */}
              <View style={[styles.goalSummaryBox, { backgroundColor: 'rgba(124, 131, 253, 0.1)', borderColor: '#7C83FD40' }]}>
                <Ionicons name="information-circle-outline" size={18} color="#7C83FD" />
                <Text style={[styles.goalSummaryText, { color: theme.text }]}>
                  {goalType === 'days'
                    ? `ستتتبع إنجاز العادة يوماً بيوم حتى تكمل ${goalTargetValue} يوماً، مع شريط تقدم مباشر واحتفال بنيل الوسام!`
                    : goalType === 'months'
                    ? `ستستمر العادة لمدة ${goalTargetValue} أشهر متواصلة لدعم تغيير أسلوب حياتك بالكامل.`
                    : goalType === 'streak'
                    ? `هدفك الحفاظ على ستريك متصل يصل إلى ${goalTargetValue} يوماً دون أي انقطاع.`
                    : `هدفك تحقيق ${goalTargetValue} إنجازاً كل شهر بانتظام.`}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setGoalModalVisible(false)}
                style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 16 }]}
              >
                <Text style={styles.confirmBtnText}>تأكيد الهدف</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    alignItems: 'center',
    paddingTop: FULL_SCREEN_SAFE_TOP,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#383B46',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  iconPreviewSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  largeIconBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconPickerScroll: {
    gap: 10,
    paddingVertical: 6,
  },
  iconOptionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputBox: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    textAlign: 'right',
  },
  errorText: {
    color: '#FF6565',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  paletteContainer: {
    gap: 12,
    paddingVertical: 6,
  },
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchActive: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {},
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  fieldHint: {
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 8,
  },
  advancedToggle: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  advancedToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  advancedSection: {
    gap: 6,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  halfColBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  halfColLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'right',
  },
  halfColValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  halfColVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  catPillScroll: {
    gap: 8,
  },
  catSelectPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  catSelectText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepperRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  timerPresetRow: {
    flexDirection: 'row-reverse',
    gap: 6,
    flexWrap: 'wrap',
    marginVertical: 6,
  },
  timerPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  timerPresetText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  stepperActions: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValText: {
    fontSize: 16,
    fontWeight: '800',
  },
  deleteLinkBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  deleteLinkText: {
    fontSize: 14,
    fontWeight: '800',
  },
  bottomSaveBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  purpleSaveBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: DIALOG_SAFE_TOP,
    paddingBottom: DIALOG_SAFE_BOTTOM,
    paddingHorizontal: 20,
  },
  reminderCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 14,
  },
  reminderHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  reminderLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  reminderSub: {
    fontSize: 11,
  },
  fieldSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 10,
  },
  presetTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  presetTimeBtn: {
    width: '23%',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetTimeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  goalTypeTabs: {
    flexDirection: 'row-reverse',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  goalTypeTabBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTypeTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalPresetsWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  goalPresetChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  goalPresetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  customGoalInputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 14,
  },
  stepperSmallBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customGoalCenterCol: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  customGoalTextInput: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 60,
  },
  customGoalUnitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalSummaryBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  goalSummaryText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'right',
  },
});
