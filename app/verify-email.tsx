import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MailCheck } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { StatusMessage } from '@/components/StatusMessage';
import { useAuth } from '@/src/auth';
import { colors, spacing, typography } from '@/src/theme';

export default function VerifyEmailScreen() {
  const { resendConfirmation } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!email) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    const { error: resendError } = await resendConfirmation(email);
    setLoading(false);
    if (resendError) {
      setError(resendError.message);
    } else {
      setSuccess('A new verification email has been sent.');
    }
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <Button label="Back" variant="ghost" onPress={() => router.replace('/')} icon={<ArrowLeft color={colors.primaryDark} size={18} />} />
      </View>
      <View style={styles.header}>
        <BrandMark />
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.body}>
          We sent a verification link to{email ? `\n${email}` : ' your email address'}. Please verify your email to activate your account.
        </Text>
      </View>
      <Card>
        <View style={styles.cardIcon}><MailCheck color={colors.primary} size={28} /></View>
        <Text style={styles.cardTitle}>Why verification?</Text>
        <Text style={styles.cardBody}>Email verification protects your account and ensures we can reach you about your home.</Text>
      </Card>
      {error && <View style={styles.message}><StatusMessage title="Could not resend" message={error} tone="error" /></View>}
      {success && <View style={styles.message}><StatusMessage title="Email sent" message={success} /></View>}
      <View style={styles.actions}>
        <Button label="Resend verification email" onPress={handleResend} loading={loading} />
        <Button label="Back to sign in" variant="ghost" onPress={() => router.replace('/login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'flex-start', marginBottom: spacing.xl },
  header: { alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xxl },
  title: { ...typography.heading, color: colors.secondary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSoft, textAlign: 'center' },
  cardIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  cardTitle: { ...typography.subheading, color: colors.secondary },
  cardBody: { ...typography.body, color: colors.textSoft, marginTop: spacing.sm },
  message: { marginTop: spacing.lg },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
});
