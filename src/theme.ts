export const colors = {
  primary: '#0B9F98',
  primaryDark: '#087C78',
  primarySoft: '#E4F5F3',
  secondary: '#17324D',
  secondarySoft: '#E9EFF4',
  accent: '#F0B65B',
  success: '#138A72',
  warning: '#A66A13',
  error: '#B44646',
  background: '#F8FAF9',
  surface: '#FFFFFF',
  border: '#DDE7E5',
  muted: '#64737D',
  text: '#14283D',
  textSoft: '#49606D',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
};

export const typography = {
  title: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  heading: { fontSize: 24, lineHeight: 29, fontWeight: '700' as const },
  subheading: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 17, fontWeight: '400' as const },
};

export const shadows = {
  card: {
    shadowColor: '#17324D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
};
