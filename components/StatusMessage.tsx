import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/src/theme';

type StatusMessageProps = { title: string; message: string; tone?: 'info' | 'error' };

export function StatusMessage({ title, message, tone = 'info' }: StatusMessageProps) {
  const isError = tone === 'error';
  return (
    <View style={[styles.container, isError && styles.errorContainer]}>
      <Text style={[styles.title, isError && styles.errorText]}>{title}</Text>
      <Text style={[styles.message, isError && styles.errorText]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  errorContainer: { backgroundColor: '#FCECEC' },
  title: { ...typography.label, color: colors.primaryDark },
  message: { ...typography.caption, color: colors.textSoft },
  errorText: { color: colors.error },
});
