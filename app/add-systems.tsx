import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { StatusMessage } from '@/components/StatusMessage';
import { useAuth } from '@/src/auth';
import { SYSTEM_CATALOG, saveHomeSystems, type SystemType } from '@/src/homeSystems';
import { colors, radii, spacing, typography } from '@/src/theme';

export default function AddSystemsScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ homeId?: string }>();
  const homeId = params.homeId;
  const [selected, setSelected] = useState<Set<SystemType>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle(type: SystemType) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  async function handleContinue() {
    if (!user || !homeId) {
      router.replace('/(tabs)/home');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: saveError } = await saveHomeSystems(user.id, homeId, Array.from(selected));
    setLoading(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    router.replace('/(tabs)/home');
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <Button label="Back" variant="ghost" onPress={() => router.back()} icon={<ArrowLeft color={colors.primaryDark} size={18} />} />
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Do you have these systems?</Text>
        <Text style={styles.body}>Select what applies. You can add more anytime.</Text>
      </View>
      {error && <StatusMessage title="Could not save" message={error} tone="error" />}
      <View style={styles.grid}>
        {SYSTEM_CATALOG.map(({ type, label }) => {
          const isSelected = selected.has(type);
          return (
            <Pressable
              key={type}
              onPress={() => toggle(type)}
              style={[styles.chip, isSelected && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>{label}</Text>
              {isSelected && <Check color={colors.white} size={16} />}
            </Pressable>
          );
        })}
      </View>
      <Button label="Continue" onPress={handleContinue} loading={loading} />
      <Button label="I'll add this later" variant="ghost" onPress={() => router.replace('/(tabs)/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'flex-start', marginBottom: spacing.xl },
  header: { gap: spacing.sm, marginBottom: spacing.xl },
  title: { ...typography.heading, color: colors.secondary },
  body: { ...typography.body, color: colors.textSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipLabel: { ...typography.label, color: colors.secondary },
  chipLabelSelected: { color: colors.white },
});
