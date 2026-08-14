import { Redirect, router } from 'expo-router';
import { ArrowRight, LogIn, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/src/auth';
import { appConfig } from '@/src/config';
import { colors, spacing, typography } from '@/src/theme';

export default function WelcomeScreen() {
  const { session, loading } = useAuth();

  if (loading) {
    return <Screen scroll={false}><View style={styles.loading} /></Screen>;
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <BrandMark />
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>A calmer way to care for home</Text>
          <Text style={styles.title}>Let's take care of your home.</Text>
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
          Create your account to start organizing and protecting your home.
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button label="Get started" icon={<ArrowRight color={colors.white} size={18} />} onPress={() => router.push('/signup')} />
        <Button label="Sign in" variant="secondary" icon={<LogIn color={colors.primaryDark} size={18} />} onPress={() => router.push('/login')} />
      </View>

      <Text style={styles.status}>
        {appConfig.hasSupabaseConfig ? 'Supabase is ready.' : 'Supabase configuration is missing.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background },
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
