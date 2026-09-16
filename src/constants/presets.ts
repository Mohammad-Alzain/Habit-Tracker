import { Habit, HabitLogs } from '../types/habit';

export function getInitialSampleData(): { habits: Habit[]; logs: HabitLogs } {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const habits: Habit[] = [
    {
      id: 'h-1',
      name: 'STUDING ENGLISH',
      description: 'Road to B2',
      icon: 'pulse-outline',
      color: '#FF6565', // Salmon / Coral from screenshot
      frequency: 'daily',
      mode: 'build',
      type: 'boolean',
      targetValue: 1,
      category: 'learning',
      timeOfDay: 'morning',
      goalFrequency: '4 / شهر',
      goal: { type: 'streak', targetValue: 30, title: 'ستريك 30 يوم' },
      pinned: true,
      notes: {
        [formatDateDate(-1)]: 'أنجزت وحدة القواعد ومحادثة 20 دقيقة مع شريك لغة ممتاز!',
      },
      createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    },
    {
      id: 'h-2',
      name: 'شرب 2500 مل ماء',
      description: 'ترطيب ونشاط الجسم طوال اليوم',
      icon: 'water-outline',
      color: '#00CEC9',
      frequency: 'daily',
      mode: 'build',
      type: 'numeric',
      targetValue: 2500,
      unit: 'مل',
      category: 'health',
      timeOfDay: 'anytime',
      goalFrequency: 'يومي',
      pinned: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'h-3',
      name: 'تأمل وتنفس عميق',
      description: 'جلسة صفاء ذهني لتقليل التوتر',
      icon: 'sparkles-outline',
      color: '#6C5CE7',
      frequency: 'daily',
      mode: 'build',
      type: 'timer',
      targetValue: 15,
      unit: 'دقيقة',
      category: 'mind',
      timeOfDay: 'morning',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'h-4',
      name: 'الإقلاع عن السكريات',
      description: 'الامتناع عن الحلويات والمشروبات الغازية',
      icon: 'heart-outline',
      color: '#E84393',
      frequency: 'daily',
      mode: 'quit', // Quit habit!
      type: 'boolean',
      targetValue: 1,
      category: 'health',
      timeOfDay: 'anytime',
      goal: { type: 'streak', targetValue: 66, title: 'التعافي لـ 66 يوم' },
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
  ];

  function formatDateDate(offsetDays: number) {
    const d = new Date();
    d.setDate(today.getDate() + offsetDays);
    return formatDate(d);
  }

  const logs: HabitLogs = {
    'h-1': {},
    'h-2': {},
    'h-3': {},
    'h-4': {},
  };

  // Populate realistic heatmap logs
  for (let i = 0; i < 40; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);

    // English: matches screenshot (streak ~ 4)
    if (i <= 3 || (i > 5 && i % 3 === 0) || i === 12 || i === 13 || i === 14) {
      logs['h-1'][dateStr] = 1;
    }
    // Water
    if (i % 6 !== 3) {
      logs['h-2'][dateStr] = 2500;
    }
    // Meditation
    if (i % 2 === 0) {
      logs['h-3'][dateStr] = 15;
    }
    // Quit Sugar
    if (i < 10 || i % 4 !== 1) {
      logs['h-4'][dateStr] = 1;
    }
  }

  return { habits, logs };
}
