# HabitFlow - تطبيق متتبع العادات (React Native / Expo)

تطبيق احترافي متكامل لتعقب وبناء العادات اليومية والأسبوعية، مصمم ومبني وفق أفضل ممارسات **React Native** و **Expo**، مستوحى من تطبيقات عالمية رائدة مثل **HabitKit** و **Habit Tracker**.

![Habit Calendar Icon](./assets/icon.png)

---

## ✨ المميزات الرئيسية

1. **تصميم عصري مستوحى من HabitKit (HabitKit-Style Aesthetic)**:
   - بطاقات عادات تفاعلية مع **شبكة مربعات ملونة (Heatmap / Contribution Grid)** لكل عادة.
   - ألوان زاهية ونابضة بالحياة (Emerald, Cyan, Violet, Neon Pink, Amber, etc.).
   - زر سريع لتسجيل إنجاز اليوم بلمسة واحدة.
   - دعم كامل للوضع الداكن المريح (OLED Dark Mode) والوضع الفاتح الأنيق (Light Mode).

2. **محرك إحصائيات وتحليلات متقدم (Rich Analytics & Statistics)**:
   - حساب الستريك الفعلي (Current Streak) وأطول ستريك تاريخي (Longest Streak).
   - نسبة الإنجاز اليومية والشهرية (%30 Days Completion Rate).
   - رسم بياني لأيام الأسبوع (Weekday Distribution) لتحديد أكثر الأيام إنتاجية.
   - مؤشر إنجاز آخر 7 أيام ومؤشرات الأداء.
   - قائمة الشرف وترتيب العادات حسب الاستمرارية (Consistency Leaderboard).
   - تقويم شهري تفاعلي لكل عادة يتيح استعراض الأيام السابقة وتعديلها بسهولة.

3. **تصدير واستيراد متكامل للبيانات (Export & Import Data)**:
   - **تصدير إلى CSV**: ملف منظم بدقة يحتوي على جميع الإنجازات وتواريخها متوافق مع Excel و Google Sheets (مع دعم UTF-8 BOM للأحرف العربية).
   - **تصدير نسخة احتياطية (JSON)**: حفظ كامل العادات والإعدادات والسجلات في ملف واحد.
   - **استيراد من JSON**: قراءة أي نسخة احتياطية مع خيار الدمج الذكي (Merge) أو الاستبدال الكامل (Replace) مع التحقق الأمني من سلامة البيانات.

4. **الخصوصية والعمل دون إنترنت (Offline-First)**:
   - تخزين محلي 100% على الجهاز باستخدام `AsyncStorage`.
   - لا يتطلب أي تسجيل دخول أو اتصال بالإنترنت، سريع وخفيف جداً.

---

## 📁 الهيكل البرمجي (Architecture)

```
habit-tracker/
├── assets/                  # أيقونة التطبيق (Calendar مربعات ملونة) وشاشات الإقلاع
├── src/
│   ├── types/               # تعريفات TypeScript للأنماط والنماذج
│   │   └── habit.ts
│   ├── constants/           # الألوان، الثيمات الداكنة والفاتحة، والعادات النموذجية
│   │   ├── theme.ts
│   │   └── presets.ts
│   ├── utils/               # أدوات التواريخ، وحسابات الستريك، والتصدير والاستيراد
│   │   ├── dateUtils.ts
│   │   ├── streakUtils.ts
│   │   └── exportImportUtils.ts
│   ├── store/               # إدارة الحالة التفاعلية مع التخزين التلقائي
│   │   └── habitStore.ts
│   ├── components/          # المكونات القابلة لإعادة الاستخدام
│   │   ├── HeatmapGrid.tsx
│   │   ├── HabitCard.tsx
│   │   ├── HabitModal.tsx
│   │   ├── HabitDetailModal.tsx
│   │   ├── AnalyticsCharts.tsx
│   │   ├── Header.tsx
│   │   └── TabBar.tsx
│   └── screens/             # شاشات التطبيق الرئيسية
│       ├── HabitsScreen.tsx
│       ├── AnalyticsScreen.tsx
│       └── SettingsScreen.tsx
├── App.tsx                  # جذر التطبيق والتنقل بين التبويبات والمودالات
└── app.json                 # إعدادات Expo، الأيقونة، والهوية البصرية
```

---

## 🚀 تشغيل التطبيق

للتشغيل على متصفح الويب أو الموبايل عبر تطبيق Expo Go:

```bash
# الانتقال لمجلد المشروع
cd "c:/Users/USER/Documents/Work/My Projects/habit-tracker"

# تشغيل على الويب للمعاينة الفورية
npm run web

# أو تشغيل على نظام Android / iOS
npm run android
npm run ios
```
