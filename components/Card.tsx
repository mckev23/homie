import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, shadows, spacing } from '@/src/theme';

type CardProps = { children: ReactNode };

export function Card({ children }: CardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    ...shadows.card,
  },
});
