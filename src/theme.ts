// Rebrand in progress (Homie -> hōm). primary/secondary/accent/background are
// the 4 brand colors as given; the *Soft/textSoft variants are mechanically
// derived tints, not brand-specified — expect a follow-up design pass once
// real screenshots are in hand. success/warning/error/muted/border/surface
// are untouched from the old palette and may read slightly cool against the
// new warm cream background; revisit together with the derived tints.
export const colors = {
  primary: '#5B9C8F',
  primaryDark: '#4B8075',
  primarySoft: '#E1E5DB',
  secondary: '#1E3A5F',
  secondarySoft: '#E5E0DC',
  accent: '#F0A868',
  success: '#138A72',
  warning: '#A66A13',
  error: '#B44646',
  background: '#FBF3EA',
  surface: '#FFFFFF',
  border: '#DDE7E5',
  muted: '#64737D',
  text: '#1E3A5F',
  textSoft: '#728094',
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
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
};
