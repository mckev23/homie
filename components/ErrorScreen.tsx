import type { ErrorBoundaryProps } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { appConfig } from '@/src/config';
import { colors, radii, spacing, typography } from '@/src/theme';

/*
Shown instead of a blank screen when something in the app throws.

Deliberately built from plain React Native primitives — no Screen, no
SafeAreaView, no theme-aware wrappers beyond raw tokens. Whatever failed may
be the very provider those depend on, so this screen must not need anything
that could already be broken.

The underlying error text appears only when EXPO_PUBLIC_DEBUG_ERRORS=1, which
preview builds set and production never does.
*/
export function ErrorScreen({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          hōm ran into a problem opening this screen. Nothing about your home has been lost.
        </Text>

        <Pressable
          style={styles.button}
          onPress={retry}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={styles.buttonLabel}>Try again</Text>
        </Pressable>

        {appConfig.showErrorDetail && (
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Technical detail (preview builds only)</Text>
            <ScrollView style={styles.detailScroll}>
              <Text style={styles.detailText} selectable>
                {error?.message || 'No error message was provided.'}
                {error?.stack ? `\n\n${error.stack}` : ''}
              </Text>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  body: { gap: spacing.md },
  title: { ...typography.heading, color: colors.secondary },
  message: { ...typography.body, color: colors.textSoft },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonLabel: { ...typography.label, color: colors.white },
  detail: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.secondarySoft,
    gap: spacing.xs,
  },
  detailLabel: { ...typography.caption, color: colors.textSoft },
  // Bounded height so a long stack trace scrolls inside the card instead of
  // pushing the "Try again" button off screen.
  detailScroll: { maxHeight: 220 },
  detailText: { ...typography.caption, color: colors.secondary },
});
