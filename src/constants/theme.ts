export interface ThemeColors {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textDim: string;
  primary: string;
  primaryHover: string;
  danger: string;
  success: string;
  border: string;
  surface: string;
  emptyCell: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
  inputBg: string;
  modalOverlay: string;
  glassBg: string;
  glassBorder: string;
  glassSpecular: string;
  glassSurface: string;
  glassModal: string;
  glassGlow: string;
}

// Exact HabitKit deep matte dark aesthetic with premium frosted obsidian glass
export const DARK_THEME: ThemeColors = {
  background: '#0B0E14',
  card: '#151924',
  cardBorder: 'rgba(255, 255, 255, 0.07)',
  text: '#FFFFFF',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  primary: '#7C83FD',
  primaryHover: '#6C73ED',
  danger: '#FF6565',
  success: '#2ECC71',
  border: 'rgba(255, 255, 255, 0.08)',
  surface: '#181D2B',
  emptyCell: '#1A1D27',
  tabBarBg: 'rgba(14, 17, 26, 0.90)',
  tabBarBorder: 'rgba(255, 255, 255, 0.07)',
  tabActive: '#7C83FD',
  tabInactive: '#6E768A',
  inputBg: 'rgba(255, 255, 255, 0.07)',
  modalOverlay: 'rgba(0, 0, 0, 0.65)',
  glassBg: '#151924',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassSpecular: 'rgba(255, 255, 255, 0.08)',
  glassSurface: '#151924', // 100% solid card matching HabitKit aesthetic
  glassModal: '#181D2B', // 100% solid, crisp, high-contrast dialog card
  glassGlow: 'transparent',
};

export const LIGHT_THEME: ThemeColors = {
  background: '#F6F8FC',
  card: '#FFFFFF',
  cardBorder: '#E5E9F0',
  text: '#0F172A',
  textMuted: '#475569',
  textDim: '#64748B',
  primary: '#6366F1',
  primaryHover: '#4F46E5',
  danger: '#EF4444',
  success: '#10B981',
  border: '#E2E8F0',
  surface: '#F8FAFD', // Luminous clean pearl off-white surface
  emptyCell: '#E2E8F0',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E5E9F0',
  tabActive: '#6366F1',
  tabInactive: '#94A3B8',
  inputBg: 'rgba(255, 255, 255, 0.85)',
  modalOverlay: 'rgba(15, 23, 42, 0.40)', // Smooth clean backdrop scrim
  glassBg: '#FFFFFF',
  glassBorder: '#E2E8F0',
  glassSpecular: '#E2E8F0',
  glassSurface: '#FFFFFF', // 100% solid white card
  glassModal: '#FFFFFF', // 100% solid white dialog card
  glassGlow: 'transparent',
};

// Exact 21 colors from HabitKit palette screenshots (3 rows x 7 swatches)
export const HABITKIT_PALETTE = [
  // Row 1: Greens, Yellows, Oranges, Coral
  '#2ECC71', // Emerald Green
  '#27AE60', // Deep Green
  '#A6D96A', // Lime / Olive
  '#F1C40F', // Bright Gold
  '#F39C12', // Warm Amber
  '#E67E22', // Orange
  '#FF6565', // Salmon / Coral (HabitKit signature)

  // Row 2: Purples, Blues, Teals
  '#BB86FC', // Lavender
  '#9B59B6', // Violet
  '#6C5CE7', // Periwinkle Blue
  '#3498DB', // Sky Blue
  '#00CEC9', // Bright Cyan
  '#00B894', // Mint Turquoise
  '#1ABC9C', // Teal

  // Row 3: Grays, Pinks, Magentas
  '#95A5A6', // Concrete Gray
  '#BDC3C7', // Silver Gray
  '#7F8C8D', // Slate
  '#74B9FF', // Soft Blue
  '#FF7675', // Peach Pink
  '#FD79A8', // Neon Pink
  '#E84393', // Vivid Magenta
];

export const HABIT_PALETTE = HABITKIT_PALETTE;

export const HABIT_ICONS = [
  'pulse-outline', // ECG / Heartbeat from Image 4!
  'school-outline', // Graduation / Study from Images 4 & 5!
  'water-outline',
  'fitness-outline',
  'book-outline',
  'bed-outline',
  'walk-outline',
  'code-slash-outline',
  'bicycle-outline',
  'heart-outline',
  'leaf-outline',
  'musical-notes-outline',
  'pencil-outline',
  'flame-outline',
  'sparkles-outline',
  'moon-outline',
  'sunny-outline',
  'time-outline',
  'trophy-outline',
  'cafe-outline',
];
