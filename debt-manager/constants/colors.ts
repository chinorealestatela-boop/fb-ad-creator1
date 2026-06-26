export const Colors = {
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceAlt: '#1A1A26',
  card: '#16161F',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)',

  primary: '#6C63FF',
  primaryLight: 'rgba(108,99,255,0.15)',
  primaryGlow: 'rgba(108,99,255,0.3)',

  accent: '#FF6B6B',
  accentLight: 'rgba(255,107,107,0.15)',

  success: '#2ECC71',
  successLight: 'rgba(46,204,113,0.15)',

  warning: '#F39C12',
  warningLight: 'rgba(243,156,18,0.15)',

  danger: '#E74C3C',
  dangerLight: 'rgba(231,76,60,0.15)',

  info: '#3498DB',
  infoLight: 'rgba(52,152,219,0.15)',

  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.35)',

  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.1)',

  // Bill category colors
  categoryColors: [
    '#6C63FF', // purple
    '#FF6B6B', // red
    '#2ECC71', // green
    '#F39C12', // orange
    '#3498DB', // blue
    '#9B59B6', // violet
    '#1ABC9C', // teal
    '#E91E63', // pink
    '#FF9800', // amber
    '#00BCD4', // cyan
    '#8BC34A', // light green
    '#FF5722', // deep orange
  ],
};

export const StatusColors = {
  current: Colors.success,
  'due-soon': Colors.warning,
  'due-this-week': Colors.warning,
  overdue: Colors.danger,
  paid: Colors.textMuted,
};
