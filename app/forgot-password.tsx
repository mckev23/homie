import { router } from 'expo-router';
import { ArrowLeft, KeyRound } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { StatusMessage } from '@/components/StatusMessage';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/src/auth';
import { colors, spacing, typography } from '@/src/theme';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: resetError } = await resetPassword(email.trim());
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <Button label="Back" variant="ghost" onPress={() => router.back()} icon={<ArrowLeft color={colors.primaryDark} size={18} />} />
      </View>
      <View style={styles.header}>
        <BrandMark />
        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.body}>Enter your email and we'll send you a link to reset your password.</Text>
      </View>
      {success ? (
        <View style={styles.success}>
          <StatusMessage title="Check your email" message="If an account exists for that email, a reset link is on its way." />
          <Button label="Back to sign in" onPress={() => router.replace('/login')} />
        </View>
      ) : (
        <>
          {error && <StatusMessage title="Could not send reset email" message={error} tone="error" />}
          <View style={styles.form}>
            <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" />
          </View>
          <Button label="Send reset link" onPress={handleReset} loading={loading} icon={<KeyRound color={colors.white} size={18} />} />
          <View style={styles.links}>
            <Button label="Back to sign in" variant="ghost" onPress={() => router.replace('/login')} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'flex-start', marginBottom: spacing.xl },
  header: { alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xxl },
  title: { ...typography.heading, color: colors.secondary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSoft, textAlign: 'center' },
  form: { gap: spacing.md, marginBottom: spacing.lg },
  success: { gap: spacing.lg },
  links: { gap: spacing.sm, marginTop: spacing.lg, alignItems: 'center' },
});
