import { router } from 'expo-router';
import { ArrowRight, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { appConfig } from '@/src/config';
import { logAppEvent } from '@/src/logger';
import { colors, spacing, typography } from '@/src/theme';

export default function WelcomeScreen() {
  function openFoundation() {
    logAppEvent('welcome_continue');
    router.replace('/(tabs)');
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <BrandMark />
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>A calmer way to care for home</Text>
          <Text style={styles.title}>Let’s take care of your home.</Text>
          <Text style={styles.body}>
            Homie will help you stay ahead of maintenance, avoid costly surprises, and protect what matters most.
          </Text>
        </View>
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <ShieldCheck color={colors.primary} size={22} />
          <Text style={styles.cardTitle}>Your home, kept in focus</Text>
        </View>
        <Text style={styles.cardBody}>
          This foundation is ready for the next step: account creation and your first home.
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button label="Explore Homie" onPress={openFoundation} icon={<ArrowRight color={colors.white} size={18} />} />
        <Button label="Authentication placeholder" variant="ghost" onPress={() => router.push('/auth')} />
      </View>

      <Text style={styles.status}>
        {appConfig.hasSupabaseConfig ? 'Supabase is ready for future features.' : 'Supabase configuration is missing.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  copy: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.md },
  eyebrow: { ...typography.label, color: colors.primaryDark, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...typography.title, color: colors.secondary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSoft, textAlign: 'center', maxWidth: 320 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.subheading, color: colors.secondary },
  cardBody: { ...typography.body, color: colors.textSoft, marginTop: spacing.sm },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
  status: { ...typography.caption, color: colors.muted, textAlign: 'center', marginTop: spacing.lg },
});
