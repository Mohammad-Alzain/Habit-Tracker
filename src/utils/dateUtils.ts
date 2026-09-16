/**
 * High-Performance Date Utilities with Pre-computation and Memoization
 */

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// In-memory cache for days arrays
let cachedLastNDaysKey = '';
let cachedLastNDaysMap = new Map<number, string[]>();

export function getLastNDays(n: number): string[] {
  const todayKey = getTodayString();
  if (cachedLastNDaysKey !== todayKey) {
    cachedLastNDaysKey = todayKey;
    cachedLastNDaysMap.clear();
  }

  const cached = cachedLastNDaysMap.get(n);
  if (cached) return cached;

  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push(formatDateToISO(d));
  }

  cachedLastNDaysMap.set(n, days);
  return days;
}

// Cached Heatmap Columns: generated once per day per weeksCount
let cachedHeatmapGridKey = '';
let cachedHeatmapGrid: string[][] | null = null;

export function getCachedHeatmapColumns(weeksCount: number = 15): string[][] {
  const todayKey = getTodayString();
  const cacheKey = `${todayKey}_${weeksCount}`;

  if (cachedHeatmapGridKey === cacheKey && cachedHeatmapGrid) {
    return cachedHeatmapGrid;
  }

  const today = parseISODate(todayKey);
  const columns: string[][] = [];

  for (let w = 0; w < weeksCount; w++) {
    const col: string[] = [];
    for (let r = 0; r < 7; r++) {
      const daysAgo = (weeksCount - 1 - w) * 7 + (6 - r);
      const d = new Date(today);
      d.setDate(today.getDate() - daysAgo);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      col.push(`${year}-${month}-${day}`);
    }
    columns.push(col);
  }

  cachedHeatmapGridKey = cacheKey;
  cachedHeatmapGrid = columns;
  return columns;
}

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_DAYS_SHORT = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export function formatFriendlyDate(dateStr: string, locale: 'ar' | 'en' = 'ar'): string {
  const d = parseISODate(dateStr);
  const todayStr = getTodayString();

  if (dateStr === todayStr) {
    return locale === 'ar' ? 'اليوم' : 'Today';
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === formatDateToISO(yesterday)) {
    return locale === 'ar' ? 'أمس' : 'Yesterday';
  }

  if (locale === 'ar') {
    const dayName = ARABIC_DAYS[d.getDay()];
    const monthName = ARABIC_MONTHS[d.getMonth()];
    return `${dayName}، ${d.getDate()} ${monthName}`;
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getArabicDayShort(dayIndex: number): string {
  return ARABIC_DAYS_SHORT[dayIndex] || '';
}

export function getArabicDayName(dayIndex: number): string {
  return ARABIC_DAYS[dayIndex] || '';
}

export function getArabicMonth(monthIndex: number): string {
  return ARABIC_MONTHS[monthIndex] || '';
}
