import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  PanResponder,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types/habit';
import { ThemeColors } from '../constants/theme';
import { BlurOverlay } from './common/BlurOverlay';
import { hapticService } from '../services/hapticService';
import { soundService } from '../services/soundService';

interface ReorderHabitsModalProps {
  visible: boolean;
  habits: Habit[];
  theme: ThemeColors;
  onClose: () => void;
  onSaveOrder: (newHabits: Habit[]) => void;
}

const ITEM_HEIGHT = 68;

export const ReorderHabitsModal: React.FC<ReorderHabitsModalProps> = ({
  visible,
  habits,
  theme,
  onClose,
  onSaveOrder,
}) => {
  const [list, setList] = useState<Habit[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragTranslateY = useRef(new Animated.Value(0)).current;

  // Keep a ref to the list so PanResponder always has current list
  const listRef = useRef<Habit[]>([]);
  listRef.current = list;

  const draggingIndexRef = useRef<number | null>(null);
  draggingIndexRef.current = draggingIndex;

  useEffect(() => {
    if (visible) {
      const activeOnly = habits.filter((h) => !h.archived);
      setList(activeOnly);
      setDraggingIndex(null);
      dragTranslateY.setValue(0);
    }
  }, [visible, habits]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= list.length || fromIndex === toIndex) return;

    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // Safe fallback
    }

    hapticService.selection();
    soundService.playTap();

    setList((prevList) => {
      const updated = [...prevList];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
  };

  const createPanResponderForIndex = (index: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        hapticService.selection();
        setDraggingIndex(index);
        dragTranslateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        dragTranslateY.setValue(gestureState.dy);

        const currentIndex = draggingIndexRef.current;
        if (currentIndex === null) return;

        // Check if dragged beyond threshold to swap
        const threshold = ITEM_HEIGHT * 0.75;
        if (gestureState.dy > threshold && currentIndex < listRef.current.length - 1) {
          moveItem(currentIndex, currentIndex + 1);
          setDraggingIndex(currentIndex + 1);
          dragTranslateY.setValue(gestureState.dy - ITEM_HEIGHT);
        } else if (gestureState.dy < -threshold && currentIndex > 0) {
          moveItem(currentIndex, currentIndex - 1);
          setDraggingIndex(currentIndex - 1);
          dragTranslateY.setValue(gestureState.dy + ITEM_HEIGHT);
        }
      },
      onPanResponderRelease: () => {
        hapticService.light();
        Animated.spring(dragTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }).start(() => {
          setDraggingIndex(null);
        });
      },
      onPanResponderTerminate: () => {
        setDraggingIndex(null);
        dragTranslateY.setValue(0);
      },
    });
  };

  const handleSortAlphabetical = () => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // Safe fallback
    }
    hapticService.selection();
    soundService.playTap();
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    setList(sorted);
  };

  const handleSave = () => {
    soundService.playComplete();
    hapticService.success();
    onSaveOrder(list);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurOverlay theme={theme} style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.text === '#FFFFFF' ? '#000000' : '#0F172A',
              shadowOpacity: theme.text === '#FFFFFF' ? 0.35 : 0.12,
              shadowRadius: 24,
              elevation: 12,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.inputBg || theme.surface }]}>
              <Ionicons name="close" size={18} color={theme.textDim} />
            </TouchableOpacity>

            <View style={styles.titleWrap}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>ترتيب العادات</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                اسحب العادة أو استخدم الأسهم لإعادة ترتيبها
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSortAlphabetical}
              style={[styles.sortPill, { backgroundColor: theme.inputBg || theme.surface, borderColor: theme.border }]}
            >
              <Ionicons name="text-outline" size={14} color={theme.textMuted} />
              <Text style={[styles.sortPillText, { color: theme.textMuted }]}>أبجدي</Text>
            </TouchableOpacity>
          </View>

          {/* List of Habits */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={draggingIndex === null}
          >
            {list.map((habit, index) => {
              const isDragging = draggingIndex === index;
              const panResponder = createPanResponderForIndex(index);

              return (
                <Animated.View
                  key={habit.id}
                  style={[
                    styles.habitRow,
                    {
                      backgroundColor: isDragging
                        ? `${habit.color}25`
                        : theme.glassSurface || theme.card,
                      borderColor: isDragging
                        ? habit.color
                        : (theme.glassBorder || theme.border),
                      transform: isDragging
                        ? [{ translateY: dragTranslateY }, { scale: 1.03 }]
                        : [{ scale: 1 }],
                      zIndex: isDragging ? 999 : 1,
                      shadowColor: isDragging ? habit.color : '#000',
                      shadowOpacity: isDragging ? 0.35 : 0.06,
                      shadowRadius: isDragging ? 12 : 4,
                      elevation: isDragging ? 10 : 1,
                    },
                  ]}
                >
                  {/* Drag Handle on Left */}
                  <View {...panResponder.panHandlers} style={styles.dragHandleWrap}>
                    <Ionicons
                      name="reorder-three-outline"
                      size={24}
                      color={isDragging ? habit.color : theme.textDim}
                    />
                  </View>

                  {/* Up / Down Quick Buttons */}
                  <View style={styles.quickSwapCol}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={index === 0}
                      onPress={() => moveItem(index, index - 1)}
                      style={[styles.miniArrowBtn, { opacity: index === 0 ? 0.25 : 1 }]}
                    >
                      <Ionicons name="chevron-up" size={14} color={theme.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={index === list.length - 1}
                      onPress={() => moveItem(index, index + 1)}
                      style={[styles.miniArrowBtn, { opacity: index === list.length - 1 ? 0.25 : 1 }]}
                    >
                      <Ionicons name="chevron-down" size={14} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Habit Name & Details */}
                  <View style={styles.habitInfoCol}>
                    <Text style={[styles.habitName, { color: theme.text }]} numberOfLines={1}>
                      {habit.name}
                    </Text>
                    <Text style={[styles.habitMeta, { color: theme.textDim }]}>
                      {habit.mode === 'quit' ? 'إقلاع عن عادة' : 'بناء عادة'} • {habit.goalFrequency || 'يومياً'}
                    </Text>
                  </View>

                  {/* Habit Icon Circle on Right */}
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: `${habit.color}22`, borderColor: `${habit.color}44` },
                    ]}
                  >
                    <Ionicons name={habit.icon as any} size={20} color={habit.color} />
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            style={[styles.confirmBtn, { backgroundColor: '#7C83FD' }]}
          >
            <Ionicons name="checkmark-done" size={19} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>حفظ الترتيب الجديد</Text>
          </TouchableOpacity>
        </View>
      </BlurOverlay>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 10,
    gap: 10,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.2,
    height: ITEM_HEIGHT,
  },
  dragHandleWrap: {
    padding: 6,
    marginRight: 6,
  },
  quickSwapCol: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  miniArrowBtn: {
    padding: 3,
  },
  habitInfoCol: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  habitName: {
    fontSize: 14,
    fontWeight: '800',
  },
  habitMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    marginTop: 10,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
