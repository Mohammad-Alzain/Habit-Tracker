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
}

// Exact HabitKit deep matte dark aesthetic
export const DARK_THEME: ThemeColors = {
  background: '#0E1015',
  card: '#181A22',
  cardBorder: '#242834',
  text: '#FFFFFF',
  textMuted: '#8E95A5',
  textDim: '#5B6275',
  primary: '#7C83FD',
  primaryHover: '#6C73ED',
  danger: '#FF6565',
  success: '#2ECC71',
  border: '#242834',
  surface: '#20232E',
  emptyCell: '#232632',
  tabBarBg: '#15171F',
  tabBarBorder: '#242834',
  tabActive: '#7C83FD',
  tabInactive: '#6E768A',
  inputBg: '#151720',
  modalOverlay: 'rgba(0, 0, 0, 0.85)',
  glassBg: 'rgba(22, 26, 38, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassSpecular: 'rgba(255, 255, 255, 0.22)',
  glassSurface: 'rgba(35, 40, 58, 0.65)',
};

export const LIGHT_THEME: ThemeColors = {
  background: '#F6F7FB',
  card: '#FFFFFF',
  cardBorder: '#E3E7EE',
  text: '#12141A',
  textMuted: '#6B7280',
  textDim: '#9CA3AF',
  primary: '#6366F1',
  primaryHover: '#4F46E5',
  danger: '#EF4444',
  success: '#10B981',
  border: '#E3E7EE',
  surface: '#EDF1F7',
  emptyCell: '#E5E9F0',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E3E7EE',
  tabActive: '#6366F1',
  tabInactive: '#9CA3AF',
  inputBg: '#FFFFFF',
  modalOverlay: 'rgba(0, 0, 0, 0.45)',
  glassBg: 'rgba(255, 255, 255, 0.78)',
  glassBorder: 'rgba(255, 255, 255, 0.65)',
  glassSpecular: 'rgba(255, 255, 255, 0.95)',
  glassSurface: 'rgba(240, 243, 250, 0.75)',
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
