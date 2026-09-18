import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Platform, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../constants/theme';
import { DialogHeader } from '../../../components/ModalHeader';
import { t, AppLanguage } from '../../../utils/i18n';
import { hapticService } from '../../../services/hapticService';
import { settingsStyles as styles } from '../styles/settingsStyles';
import { BlurOverlay } from '../../../components/common/BlurOverlay';

interface IntroGuideModalProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeColors;
  language: AppLanguage;
  rtl: boolean;
}

export const IntroGuideModal: React.FC<IntroGuideModalProps> = ({
  visible,
  onClose,
  theme,
  language,
  rtl,
}) => {
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      icon: 'sparkles',
      iconBg: 'rgba(124, 131, 253, 0.2)',
      iconColor: '#7C83FD',
      title: '1. ابنِ عاداتك أو أقلع عنها',
      desc: 'حدد عاداتك الإيجابية (بناء عادة) أو تتبع أيام نجاحك في التوقف عن عادة غير مرغوبة (إقلاع عن عادة) بسهولة ومرونة.',
    },
    {
      icon: 'grid',
      iconBg: 'rgba(46, 204, 113, 0.2)',
      iconColor: '#2ECC71',
      title: '2. لوّن تقويمك وتتبع إنجازك',
      desc: 'سجل إنجازاتك اليومية بضغطة واحدة، وشاهد شبكة المربعات الملونة (Heatmap) تزداد إشراقاً يوماً بعد يوم.',
    },
    {
      icon: 'snow',
      iconBg: 'rgba(0, 206, 201, 0.2)',
      iconColor: '#00CEC9',
      title: '3. احمِ مسارك مع تجميد الستريك',
      desc: 'في الأيام التي تمر فيها بظروف خاصة أو إجازة، جمّد الستريك بضغطة واحدة لتحمي سلسلة نجاحك من الانكسار.',
    },
    {
      icon: 'trail-sign',
      iconBg: 'rgba(255, 101, 101, 0.2)',
      iconColor: '#FF6565',
      title: '4. خريطة الالتزامات والمهام',
      desc: 'قسّم عاداتك لمهام يومية مجدولة وتتبع رحلة إنجازك التراكمي في مسار ورقي تتابعي جذاب.',
    },
  ];

  const currentSlide = slides[slideIndex];

  const handleNext = () => {
    hapticService.selection();
    if (slideIndex < slides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setSlideIndex(0);
      onClose();
    }
  };

  const handlePrev = () => {
    hapticService.selection();
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <BlurOverlay theme={theme} style={styles.dataModalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
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
            title={t('showIntro', language)}
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          <View style={styles.introSlideContent}>
            <View style={[styles.introIconCircle, { backgroundColor: currentSlide.iconBg }]}>
              <Ionicons name={currentSlide.icon as any} size={44} color={currentSlide.iconColor} />
            </View>
            <Text style={[styles.introSlideTitle, { color: theme.text }]}>{currentSlide.title}</Text>
            <Text style={[styles.introSlideDesc, { color: theme.textMuted }]}>{currentSlide.desc}</Text>
          </View>

          {/* Dots row */}
          <View style={styles.introDotsRow}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.introDot,
                  {
                    backgroundColor: i === slideIndex ? '#7C83FD' : theme.border,
                    width: i === slideIndex ? 16 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Navigation buttons */}
          <View style={styles.introBtnRow}>
            {slideIndex > 0 && (
              <TouchableOpacity
                onPress={handlePrev}
                style={[styles.confirmBtn, { flex: 1, backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
              >
                <Text style={[styles.confirmBtnText, { color: theme.text }]}>السابق</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.confirmBtn, { flex: 2, backgroundColor: '#7C83FD' }]}
            >
              <Text style={styles.confirmBtnText}>
                {slideIndex === slides.length - 1 ? 'ابدأ رحلتك الآن' : 'التالي'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurOverlay>
    </Modal>
  );
};
