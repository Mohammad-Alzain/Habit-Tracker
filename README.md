# Habit Flow 💎📱

> **The Aesthetic, Scientific & Offline-First Habit Tracking Companion for React Native & Expo**

![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo_SDK-52-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Offline First](https://img.shields.io/badge/Storage-100%25_Offline_First-purple?style=for-the-badge)

**Habit Flow** is a high-performance, privacy-focused habit tracking app built with **React Native** and **Expo**. Inspired by the signature aesthetic of **HabitKit** and grounded in the behavioral psychology of *Atomic Habits* and cognitive science, Habit Flow transforms daily consistency into a visual and rewarding journey.

---

## ✨ Standout Features

### 1. 🎨 HabitKit-Style Heatmap Aesthetic & Dark Glassmorphism
- **Contribution Matrix (Heatmap)**: Every habit displays an interactive mini-matrix (30-day dot grid or multi-week contribution heatmap) that fills with vibrant jewel-tone colors as you build momentum.
- **Premium Dark Glassmorphism**: Frosted glass surfaces with translucent obsidian depth, beveled top-border specular highlights (`glassSpecular`), and ambient color glows when habits are completed.
- **Curated HabitKit Palette**: 21 signature vivid colors (Emerald, Salmon Coral, Lavender, Bright Cyan, Amber, Neon Pink, etc.) for visual distinction.
- **Multiple Visual Layouts**: Toggle seamlessly between **2-Column Heatmap Grid**, **List View (Checklist)**, and **Compact Weekly Strip** using an animated floating glass dock.

### 2. 🎯 Three Dynamic Habit Tracking Modes
Unlike basic checkbox apps, Habit Flow supports three distinct completion mechanisms tailored to real-world habits:
1. **One-Tap Checkmark (`boolean`)**:
   - Designed for binary daily actions (e.g. Taking vitamins, Morning prayer, Making the bed).
   - Zero-latency (0ms) tap response with spring haptics and harmonic completion chime.
2. **Interactive Focus Timer (`timer`)**:
   - Built-in countdown timer and Pomodoro focus session (15m, 20m, 25m, 30m, 45m, 60m, or custom duration).
   - Real-time animated circular progress ring, pause/resume controls, and quick `+5 min` / `+10 min` adjustments.
   - Automatically marks the habit day completed when the target focus duration is achieved.
3. **Progressive Counter (`numeric`)**:
   - Designed for quantifiable goals (e.g. 8 glasses of water, 50 pushups, 20 book pages, 10,000 steps).
   - Inline `+/-` stepper with customizable units and progress bars.

### 3. 🧠 Atomic Habits & Behavioral Science
- **Streak Freeze (Grace Days ❄️)**:
  - Protects your hard-earned streak during illness, travel, or emergencies without breaking continuity.
  - Displays a frosted ice badge on the interactive calendar.
- **Two-Day Rule Alert ("Never Miss Twice")**:
  - Automatically identifies at-risk habits missed yesterday to prevent habit relapse before it begins.
- **Habit Stacking Builder**:
  - Chain new habits onto established anchor routines (e.g. *"After I pour my morning coffee [Anchor], I will read 10 pages [New Habit]"*).
- **Behavioral Psychology Library**:
  - In-app scientific studies analyzing neuroplasticity, the 66-day automaticity threshold, dopamine feedback loops, and implementation intentions.

### 4. 📊 Rich Analytics & Visual Stats
- **Multi-View Calendar & Reflection Journal**:
  - Detailed monthly calendar with month-by-month navigation.
  - Tap any day to toggle completion, long-press to attach micro-reflections and notes.
- **Longest & Current Streak Tracking**:
  - Intelligent streak algorithm that accounts for custom frequencies, rest days, and frozen days.
- **Behavioral Patterns**:
  - Weekday distribution analysis to identify your most productive and critical days.
  - Overall completion rate, total lifetime completions, and 60-day Exponential Moving Average (EMA) habit strength score.
- **Gamification & Milestone Badges**:
  - Unlockable trophy cards (First Step, Flame of the Week, 21-Day Neural Wiring, Century Club 100, Golden Shield 200).
  - Shareable glass trophy cards ready for social sharing.

### 5. 🔒 100% Offline-First & Private
- **Zero Cloud Accounts**: No logins, no tracking, and no external servers.
- **Encrypted Local Storage**: High-speed, debounced persistence using `@react-native-async-storage/async-storage`.
- **Complete Data Portability**:
  - **JSON Export / Import**: Full backup and restore with safe Merge or Replace modes.
  - **CSV Export**: Clean, structured spreadsheets compatible with Microsoft Excel and Google Sheets with UTF-8 BOM encoding.

### 6. 🌐 Native RTL & Bilingual Support
- First-class native support for **Arabic (العربية)** and **English**.
- True Right-to-Left (RTL) interface mirroring with proper alignments, margins, and directional icons.

---

## 🏗️ Architecture & Tech Stack

```
habit-tracker/
├── assets/                  # App adaptive launcher icons and splash screens
├── src/
│   ├── types/               # TypeScript interfaces (Habit, HabitGoal, Logs, Stats)
│   │   └── habit.ts
│   ├── constants/           # Obsidian dark & light palettes, layout insets, presets
│   │   ├── theme.ts
│   │   ├── layout.ts
│   │   ├── presets.ts
│   │   └── habitStudies.ts
│   ├── store/               # Reactive external store with atomic persistence
│   │   └── habitStore.ts
│   ├── utils/               # High-performance memoized date and streak algorithms
│   │   ├── dateUtils.ts
│   │   ├── streakUtils.ts
│   │   ├── behavioralAnalytics.ts
│   │   ├── exportImportUtils.ts
│   │   └── i18n.ts
│   ├── services/            # Hardware haptics, WebAudio synthesizers, and notifications
│   │   ├── hapticService.ts
│   │   ├── soundService.ts
│   │   └── notificationService.ts
│   ├── components/          # Modular UI components
│   │   ├── HabitKitTile.tsx
│   │   ├── HabitCard.tsx
│   │   ├── ChecklistHabitCard.tsx
│   │   ├── CompactWeeklyCard.tsx
│   │   ├── HeatmapGrid.tsx
│   │   ├── HabitModal.tsx
│   │   ├── HabitDetailModal.tsx
│   │   ├── TimerModal.tsx
│   │   ├── FloatingDock.tsx
│   │   ├── ModalHeader.tsx
│   │   └── ShareHabitCardModal.tsx
│   └── screens/             # Core application screens
│       ├── HabitsScreen.tsx
│       ├── AnalyticsScreen.tsx
│       └── SettingsScreen.tsx
├── App.tsx                  # App entry point & modal orchestrator
├── app.json                 # Expo SDK 52 configuration & native splash plugins
└── package.json
```

---

## ⚡ Performance Optimizations

1. **Memoized Date Grids**:
   - Tile matrices (30 days), 22-week heatmaps, and monthly calendar days are cached in memory per day, eliminating hundreds of duplicate `new Date()` instantiations during taps.
2. **Component Isolation**:
   - `HabitKitTile` utilizes custom `React.memo` comparator functions so that tapping one habit only re-renders that specific tile, leaving the remaining habits at a silky 120 FPS.
3. **Debounced Disk I/O**:
   - All state updates commit immediately to in-memory state for instant UI response, while background persistence to `AsyncStorage` is debounced to eliminate storage bottlenecks.
4. **Hardware Vibration & Synthesizer**:
   - Non-blocking WebAudio oscillator chords and gentle native haptic bursts provide immediate tactile confirmation without stalling the UI thread.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on Android/iOS (or Android Studio / Xcode for emulators)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd "c:/Users/USER/Documents/Work/My Projects/habit-tracker"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

### Running on Platforms
- **Android**: Press `a` in the terminal or run `npx expo run:android`
- **iOS**: Press `i` in the terminal or run `npx expo run:ios`
- **Web**: Press `w` in the terminal or run `npm run web`

### Building Production APK (Android)
To build a standalone APK without Expo Go:
```bash
# Export static bundle with Hermes bytecode
npx expo export --platform android

# Or build standalone APK via EAS
npx eas build --platform android --profile preview
```

---

## 📄 License
This project is licensed under the **MIT License**.

