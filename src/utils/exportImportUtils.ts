import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { AppExportData, Habit, HabitLogs } from '../types/habit';
import { getTodayString } from './dateUtils';

/**
 * Exports data to JSON and triggers system share or web download.
 */
export async function exportDataToJSON(habits: Habit[], logs: HabitLogs): Promise<{ success: boolean; message: string }> {
  try {
    const data: AppExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      habits,
      logs,
    };

    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `habitflow-backup-${getTodayString()}.json`;

    if (Platform.OS === 'web') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true, message: 'تم تنزيل ملف JSON بنجاح' };
    }

    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'تصدير النسخة الاحتياطية (JSON)',
        UTI: 'public.json',
      });
      return { success: true, message: 'تم تجهيز ومشاركة ملف JSON بنجاح' };
    } else {
      return { success: true, message: `تم حفظ الملف في: ${fileUri}` };
    }
  } catch (error: any) {
    return { success: false, message: `فشل التصدير: ${error?.message || error}` };
  }
}

/**
 * Exports habit logs to CSV format with UTF-8 BOM for Excel / Google Sheets compatibility.
 */
export async function exportLogsToCSV(habits: Habit[], logs: HabitLogs): Promise<{ success: boolean; message: string }> {
  try {
    const BOM = '\uFEFF';
    const habitMap = new Map<string, Habit>();
    habits.forEach((h) => habitMap.set(h.id, h));

    // Headers
    const rows: string[] = [
      'معرف العادة,اسم العادة,تاريخ الإنجاز,العدد المنجز,الهدف اليومي,التكرار,اللون'
    ];

    // Build rows
    for (const [habitId, dateEntries] of Object.entries(logs)) {
      const habit = habitMap.get(habitId);
      const habitName = habit ? habit.name.replace(/,/g, ' ') : habitId;
      const target = habit ? (habit.targetValue || habit.targetPerDay || 1) : 1;
      const freq = habit?.frequency || 'daily';
      const color = habit?.color || '';

      const dates = Object.keys(dateEntries).sort();
      for (const dateStr of dates) {
        const count = dateEntries[dateStr];
        rows.push(`"${habitId}","${habitName}","${dateStr}",${count},${target},"${freq}","${color}"`);
      }
    }

    const csvContent = BOM + rows.join('\n');
    const fileName = `habitflow-export-${getTodayString()}.csv`;

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true, message: 'تم تنزيل ملف CSV بنجاح' };
    }

    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'تصدير سجل العادات (CSV)',
        UTI: 'public.comma-separated-values-text',
      });
      return { success: true, message: 'تم تجهيز ومشاركة ملف CSV بنجاح' };
    } else {
      return { success: true, message: `تم حفظ الملف في: ${fileUri}` };
    }
  } catch (error: any) {
    return { success: false, message: `فشل التصدير: ${error?.message || error}` };
  }
}

/**
 * Imports and validates JSON backup file
 */
export async function importDataFromJSON(): Promise<{
  success: boolean;
  message: string;
  data?: AppExportData;
}> {
  try {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/json', '*/*'],
      copyToCacheDirectory: true,
    });

    if (res.canceled || !res.assets || res.assets.length === 0) {
      return { success: false, message: 'تم إلغاء الاستيراد' };
    }

    const asset = res.assets[0];
    let fileContent = '';

    if (Platform.OS === 'web') {
      if (asset.file) {
        fileContent = await asset.file.text();
      } else {
        const response = await fetch(asset.uri);
        fileContent = await response.text();
      }
    } else {
      fileContent = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }

    const parsed = JSON.parse(fileContent);

    // Validate structure
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'الملف لا يحتوي على بيانات صالحة' };
    }

    if (!Array.isArray(parsed.habits) || typeof parsed.logs !== 'object') {
      return { success: false, message: 'بنية الملف غير متوافقة مع نسق التطبيق (habits / logs مفقودة)' };
    }

    // Verify habit items
    for (const h of parsed.habits) {
      if (!h.id || !h.name) {
        return { success: false, message: 'يوجد عنصر عادة بتنسيق غير صالح داخل الملف' };
      }
    }

    return {
      success: true,
      message: `تم التحقق بنجاح: وجدنا ${parsed.habits.length} عادة وسجلات إنجاز.`,
      data: parsed as AppExportData,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `حدث خطأ أثناء قراءة الملف: ${err?.message || err}`,
    };
  }
}
