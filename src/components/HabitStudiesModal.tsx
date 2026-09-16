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
import { ThemeColors } from '../constants/theme';
import { SCIENTIFIC_STUDIES, DAILY_BEHAVIORAL_QUOTES } from '../constants/habitStudies';
import { ScientificStudy } from '../types/habit';
import { ModalHeader } from './ModalHeader';
import { t, isRTL, AppLanguage } from '../utils/i18n';

interface HabitStudiesModalProps {
  visible: boolean;
  theme: ThemeColors;
  language?: AppLanguage;
  onClose: () => void;
}

export const HabitStudiesModal: React.FC<HabitStudiesModalProps> = ({
  visible,
  theme,
  language = 'ar',
  onClose,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [expandedStudyId, setExpandedStudyId] = useState<string | null>(null);
  const rtl = isRTL(language);

  const currentQuote = DAILY_BEHAVIORAL_QUOTES[quoteIndex % DAILY_BEHAVIORAL_QUOTES.length];

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % DAILY_BEHAVIORAL_QUOTES.length);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Top Header */}
          <ModalHeader
            title={t('studiesTitle', language)}
            icon="school-outline"
            iconColor="#7C83FD"
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Daily Wisdom Card */}
            <View style={[styles.wisdomCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.wisdomTopRow}>
                <TouchableOpacity onPress={handleNextQuote} style={styles.refreshQuoteBtn}>
                  <Ionicons name="sync-outline" size={16} color={theme.textDim} />
                  <Text style={[styles.refreshText, { color: theme.textDim }]}>حكمة أخرى</Text>
                </TouchableOpacity>

                <View style={styles.wisdomTagRow}>
                  <Text style={[styles.wisdomTag, { color: '#F1C40F' }]}>حكمة اليوم السلوكية 💡</Text>
                </View>
              </View>

              <Text style={[styles.quoteText, { color: theme.text }]}>"{currentQuote.quote}"</Text>

              <View style={styles.quoteAuthorRow}>
                <Text style={[styles.quoteAuthor, { color: theme.textDim }]}>
                  — {currentQuote.author} ({currentQuote.source})
                </Text>
              </View>

              <View style={[styles.tipBox, { backgroundColor: 'rgba(241, 196, 15, 0.1)', borderColor: 'rgba(241, 196, 15, 0.3)' }]}>
                <Ionicons name="flash-outline" size={14} color="#F1C40F" />
                <Text style={[styles.tipText, { color: theme.text }]}>
                  <Text style={{ fontWeight: '800' }}>تطبيق اليوم: </Text>
                  {currentQuote.practicalTip}
                </Text>
              </View>
            </View>

            {/* Studies Section Title */}
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              أهم 5 دراسات علمية في بناء العادات:
            </Text>

            {/* Studies Cards */}
            {SCIENTIFIC_STUDIES.map((study: ScientificStudy) => {
              const isExpanded = expandedStudyId === study.id;

              return (
                <View
                  key={study.id}
                  style={[
                    styles.studyCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: isExpanded ? study.color : theme.border,
                    },
                  ]}
                >
                  {/* Study Header */}
                  <View style={styles.studyHeader}>
                    <View style={[styles.studyIconBox, { backgroundColor: `${study.color}20` }]}>
                      <Ionicons name={(study.icon as any) || 'book'} size={22} color={study.color} />
                    </View>

                    <View style={styles.studyTitleCol}>
                      <Text style={[styles.studyTitle, { color: theme.text }]}>{study.title}</Text>
                      <Text style={[styles.studyMeta, { color: theme.textDim }]}>
                        {study.author} • {study.institution} ({study.year})
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.studySubtitle, { color: study.color }]}>
                    {study.subtitle}
                  </Text>

                  {/* Key Takeaway Box */}
                  <View style={[styles.takeawayBox, { backgroundColor: `${study.color}10`, borderColor: `${study.color}30` }]}>
                    <View style={styles.takeawayHeader}>
                      <Ionicons name="analytics-outline" size={14} color={study.color} />
                      <Text style={[styles.takeawayTitle, { color: study.color }]}>النتيجة العلمية المثبتة:</Text>
                    </View>
                    <Text style={[styles.takeawayText, { color: theme.text }]}>
                      {study.keyTakeaway}
                    </Text>
                  </View>

                  {/* Practical Rule Box */}
                  <View style={[styles.ruleBox, { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)' }]}>
                    <View style={styles.takeawayHeader}>
                      <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
                      <Text style={[styles.takeawayTitle, { color: '#10B981' }]}>كيف تطبقها في عاداتك؟</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      {study.practicalRule}
                    </Text>
                  </View>

                  {/* Detailed Analysis Collapsible */}
                  {isExpanded && (
                    <View style={[styles.detailsBox, { borderColor: theme.border }]}>
                      <Text style={[styles.detailsTitle, { color: theme.text }]}>تفاصيل ومنهجية البحث 🔬:</Text>
                      <Text style={[styles.detailsText, { color: theme.textMuted }]}>
                        {study.detailedAnalysis}
                      </Text>

                      <View style={styles.tagsRow}>
                        {study.tags.map((t, idx) => (
                          <View key={idx} style={[styles.tagPill, { backgroundColor: theme.card }]}>
                            <Text style={[styles.tagText, { color: theme.textDim }]}>#{t}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Expand / Collapse Button */}
                  <TouchableOpacity
                    onPress={() => setExpandedStudyId(isExpanded ? null : study.id)}
                    style={styles.expandToggleBtn}
                  >
                    <Text style={[styles.expandToggleText, { color: study.color }]}>
                      {isExpanded ? 'طي التفاصيل' : 'قراءة تفاصيل ومنهجية البحث 📖'}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={study.color}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}

            <View style={{ height: 24 }} />
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
    marginBottom: 14,
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
  scrollContent: {
    gap: 14,
  },
  wisdomCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
  },
  wisdomTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  wisdomTagRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  wisdomTag: {
    fontSize: 12,
    fontWeight: '800',
  },
  refreshQuoteBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quoteText: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 22,
    textAlign: 'right',
    marginBottom: 6,
  },
  quoteAuthorRow: {
    flexDirection: 'row-reverse',
    marginBottom: 10,
  },
  quoteAuthor: {
    fontSize: 11.5,
    textAlign: 'right',
  },
  tipBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'right',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 4,
  },
  studyCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
  },
  studyHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  studyIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyTitleCol: {
    flex: 1,
  },
  studyTitle: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  studyMeta: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 2,
  },
  studySubtitle: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 10,
  },
  takeawayBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  takeawayHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  takeawayTitle: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  takeawayText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
  },
  ruleBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
  },
  detailsBox: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 11.5,
    lineHeight: 18,
    textAlign: 'right',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  expandToggleBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 6,
  },
  expandToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
