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
      subTasks: [
        { id: 'st-1', title: 'دراسة وحدة القواعد (Grammar)', scheduleDays: [6, 1, 3], estimatedMinutes: 20 },
        { id: 'st-2', title: 'حفظ 10 مفردات جديدة (Vocabulary)', scheduleDays: 'all', estimatedMinutes: 15 },
        { id: 'st-3', title: 'ممارسة الاستماع لبودكاست (Listening)', scheduleDays: [0, 2, 4], estimatedMinutes: 15 },
        { id: 'st-4', title: 'قراءة مقال بالإنجليزية (Reading)', scheduleDays: [6, 0, 2, 4], estimatedMinutes: 15 },
        { id: 'st-5', title: 'جلسة محادثة صوتية (Speaking)', scheduleDays: [5], estimatedMinutes: 25 },
      ],
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
      subTasks: [
        { id: 'st-w1', title: 'كوبان ماء عند الاستيقاظ (500 مل)', scheduleDays: 'all' },
        { id: 'st-w2', title: 'قارورة الماء في فترة العمل (1000 مل)', scheduleDays: [0, 1, 2, 3, 4] },
        { id: 'st-w3', title: 'ترطيب المساء بعد التمارين (1000 مل)', scheduleDays: 'all' },
      ],
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
      subTasks: [
        { id: 'st-m1', title: 'تمرين تنفس 4-7-8 (5 دقائق)', scheduleDays: 'all' },
        { id: 'st-m2', title: 'جلسة تأمل وامتنان صباحي (10 دقائق)', scheduleDays: [6, 0, 1, 2, 3, 4] },
      ],
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
