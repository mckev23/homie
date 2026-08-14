import { router } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { StatusMessage } from '@/components/StatusMessage';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/src/auth';
import { colors, spacing, typography } from '@/src/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: authError } = await signIn(email.trim(), password);
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <Button label="Back" variant="ghost" onPress={() => router.back()} icon={<ArrowLeft color={colors.primaryDark} size={18} />} />
      </View>
      <View style={styles.header}>
        <BrandMark />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.body}>Sign in to your Homie account.</Text>
      </View>
      {error && <StatusMessage title="Could not sign in" message={error} tone="error" />}
      <View style={styles.form}>
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" />
        <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry autoComplete="password" />
      </View>
      <Button label="Sign in" onPress={handleLogin} loading={loading} icon={<Mail color={colors.white} size={18} />} />
      <View style={styles.links}>
        <Button label="Forgot password?" variant="ghost" onPress={() => router.push('/forgot-password')} />
        <Button label="Create an account" variant="ghost" onPress={() => router.push('/signup')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'flex-start', marginBottom: spacing.xl },
  header: { alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xxl },
  title: { ...typography.heading, color: colors.secondary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSoft, textAlign: 'center' },
  form: { gap: spacing.md, marginBottom: spacing.lg },
  links: { gap: spacing.sm, marginTop: spacing.lg, alignItems: 'center' },
});
