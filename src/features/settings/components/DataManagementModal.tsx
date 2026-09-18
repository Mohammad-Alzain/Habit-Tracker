import React from 'react';
import { View, Text, Modal, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLogs } from '../../../types/habit';
import { ThemeColors } from '../../../constants/theme';
import { DialogHeader } from '../../../components/ModalHeader';
import { t, AppLanguage } from '../../../utils/i18n';
import { settingsStyles as styles } from '../styles/settingsStyles';
import { BlurOverlay } from '../../../components/common/BlurOverlay';

interface DataManagementModalProps {
  visible: boolean;
  onClose: () => void;
  habits: Habit[];
  logs: HabitLogs;
  theme: ThemeColors;
  language: AppLanguage;
  rtl: boolean;
  loading: boolean;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportData: () => void;
  onResetDefaults: () => void;
  onClearAll: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  visible,
  onClose,
  theme,
  language,
  rtl,
  loading,
  onExportCSV,
  onExportJSON,
  onImportData,
  onResetDefaults,
  onClearAll,
}) => {
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
            title={t('dataManagement', language)}
            theme={theme}
            isRTL={rtl}
            onClose={onClose}
          />

          <Text style={[styles.modalExplanationText, { color: theme.textMuted }]}>
            {t('dataManagementSub', language)}
          </Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#7C83FD" />
            </View>
          ) : (
            <View>
              {/* تصدير JSON */}
              <TouchableOpacity
                onPress={onExportJSON}
                style={[styles.dataActionBtn, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: rtl ? 'row-reverse' : 'row' }]}
              >
                <Ionicons name="document-text-outline" size={24} color="#7C83FD" style={{ marginHorizontal: 12 }} />
                <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.dataActionTitle, { color: theme.text }]}>{t('exportJSON', language)}</Text>
                  <Text style={[styles.dataActionSub, { color: theme.textMuted }]}>نسخ احتياطي لكافة العادات والتواريخ</Text>
                </View>
              </TouchableOpacity>

              {/* تصدير CSV */}
              <TouchableOpacity
                onPress={onExportCSV}
                style={[styles.dataActionBtn, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: rtl ? 'row-reverse' : 'row' }]}
              >
                <Ionicons name="grid-outline" size={24} color="#10B981" style={{ marginHorizontal: 12 }} />
                <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.dataActionTitle, { color: theme.text }]}>{t('exportCSV', language)}</Text>
                  <Text style={[styles.dataActionSub, { color: theme.textMuted }]}>سجلات الإنجاز لبرنامج Excel</Text>
                </View>
              </TouchableOpacity>

              {/* استيراد JSON */}
              <TouchableOpacity
                onPress={onImportData}
                style={[styles.dataActionBtn, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: rtl ? 'row-reverse' : 'row' }]}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="#F59E0B" style={{ marginHorizontal: 12 }} />
                <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.dataActionTitle, { color: theme.text }]}>{t('importJSON', language)}</Text>
                  <Text style={[styles.dataActionSub, { color: theme.textMuted }]}>استرجاع بيانات سابقة من ملف JSON</Text>
                </View>
              </TouchableOpacity>

              {/* إعادة تعيين للعينات */}
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('استعادة الافتراضيات', 'هل تريد استعادة العادات الافتراضية؟', [
                    { text: t('cancel', language), style: 'cancel' },
                    { text: 'استعادة', onPress: onResetDefaults },
                  ]);
                }}
                style={[styles.dataActionBtn, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: rtl ? 'row-reverse' : 'row' }]}
              >
                <Ionicons name="refresh-outline" size={24} color="#6366F1" style={{ marginHorizontal: 12 }} />
                <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.dataActionTitle, { color: theme.text }]}>{t('resetDefaults', language)}</Text>
                  <Text style={[styles.dataActionSub, { color: theme.textMuted }]}>{t('resetDefaultsSub', language)}</Text>
                </View>
              </TouchableOpacity>

              {/* مسح شامل */}
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('مسح شامل لكافة البيانات', 'إجراء نهائي لا يمكن التراجع عنه. هل أنت متأكد؟', [
                    { text: t('cancel', language), style: 'cancel' },
                    { text: 'مسح شامل', style: 'destructive', onPress: onClearAll },
                  ]);
                }}
                style={[styles.dataActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444', flexDirection: rtl ? 'row-reverse' : 'row' }]}
              >
                <Ionicons name="trash-outline" size={24} color="#EF4444" style={{ marginHorizontal: 12 }} />
                <View style={{ flex: 1, alignItems: rtl ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.dataActionTitle, { color: '#EF4444' }]}>{t('clearAllData', language)}</Text>
                  <Text style={[styles.dataActionSub, { color: theme.textMuted }]}>{t('clearAllDataSub', language)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={[styles.confirmBtn, { backgroundColor: '#7C83FD', marginTop: 12 }]}
          >
            <Text style={styles.confirmBtnText}>{t('done', language)}</Text>
          </TouchableOpacity>
        </View>
      </BlurOverlay>
    </Modal>
  );
};
