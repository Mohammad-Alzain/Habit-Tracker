export interface Quote {
  id: number;
  textAr: string;
  authorAr: string;
  textEn: string;
  authorEn: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    id: 1,
    textAr: 'النجاح هو نتاج عادات يومية صغيرة، وليس تحولات تحدث مرة واحدة في العمر.',
    authorAr: 'جيمس كلير - العادات الذرية',
    textEn: 'Success is the product of daily habits—not once-in-a-lifetime transformations.',
    authorEn: 'James Clear - Atomic Habits',
  },
  {
    id: 2,
    textAr: 'أنت لا ترتقي إلى مستوى أهدافك، بل تهبط إلى مستوى أنظمتك وعاداتك.',
    authorAr: 'جيمس كلير',
    textEn: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    authorEn: 'James Clear',
  },
  {
    id: 3,
    textAr: 'الانضباط هو الجسر الواصل بين الأهداف والإنجازات.',
    authorAr: 'جيم رون',
    textEn: 'Discipline is the bridge between goals and accomplishment.',
    authorEn: 'Jim Rohn',
  },
  {
    id: 4,
    textAr: 'نحن ما نفعله مراراً وتكراراً؛ التميز إذن ليس فعلاً، بل عادة.',
    authorAr: 'أرسطو',
    textEn: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    authorEn: 'Aristotle',
  },
  {
    id: 5,
    textAr: 'التحسن بنسبة 1% فقط كل يوم يصنع فارقاً هائلاً على المدى الطويل.',
    authorAr: 'مبدأ كايزن',
    textEn: 'A 1% improvement every day compounds into a massive difference over time.',
    authorEn: 'Kaizen Principle',
  },
];

export function getDailyQuote(): Quote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}
