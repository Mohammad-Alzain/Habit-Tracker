import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../constants/theme';
import { DialogHeader } from '../../../components/ModalHeader';
import { t, AppLanguage } from '../../../utils/i18n';
import { hapticService } from '../../../services/hapticService';
import { settingsStyles as styles } from '../styles/settingsStyles';
import { BlurOverlay } from '../../../components/common/BlurOverlay';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeColors;
  language: AppLanguage;
  rtl: boolean;
  onShowStatus: (type: 'success' | 'error', text: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  theme,
  language,
  rtl,
  onShowStatus,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'suggestion' | 'bug' | 'praise'>('suggestion');
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة رسالتك أو اقتراحك قبل الإرسال.');
      return;
    }
    hapticService.success();
    onShowStatus('success', 'شكراً لك! تم استلام تقييمك ورسالتك بنجاح.');
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <BlurOverlay theme={theme} style={styles.dataModalOverlay}>
        <View
          style={[
            styles.dataModalCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.text === '#FFFFFF' ? '#000000' : '#0F172A',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: theme.text === '#FFFFFF' ? 0.35 : 0.12,
              shadowRadius: 24,
              elevation: 12,
            },
          ]}
        >
          <DialogHeader
            title={t('feedback', language)}
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          {/* Star Rating */}
          <Text style={[styles.fieldSectionLabel, { color: theme.textMuted }]}>ما تقييمك لتجربة التطبيق؟</Text>
          <View style={styles.ratingStarsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  hapticService.selection();
                  setRating(star);
                }}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={28}
                  color={star <= rating ? '#F59E0B' : theme.textDim}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback Type */}
          <Text style={[styles.fieldSectionLabel, { color: theme.textMuted, marginTop: 10 }]}>نوع الرسالة</Text>
          <View style={{ flexDirection: 'row-reverse', gap: 6, marginBottom: 12 }}>
            {[
              { id: 'suggestion', label: 'اقتراح تطوير' },
              { id: 'bug', label: 'إبلاغ عن خطأ' },
              { id: 'praise', label: 'إعجاب وشكر' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  hapticService.selection();
                  setCategory(cat.id as any);
                }}
                style={[
                  styles.feedbackCatChip,
                  {
                    backgroundColor: category === cat.id ? '#7C83FD' : theme.surface,
                    borderColor: category === cat.id ? '#7C83FD' : theme.border,
                  },
                ]}
              >
                <Text style={{ color: category === cat.id ? '#FFFFFF' : theme.textMuted, fontSize: 11, fontWeight: '700' }}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text Area */}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="اكتب ملاحظاتك أو فكرتك بالتفصيل هنا..."
            placeholderTextColor={theme.textDim}
            multiline
            numberOfLines={4}
            style={[styles.feedbackTextInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 14 }]}
          >
            <Text style={styles.confirmBtnText}>إرسال الملاحظات</Text>
          </TouchableOpacity>
        </View>
      </BlurOverlay>
    </Modal>
  );
};
