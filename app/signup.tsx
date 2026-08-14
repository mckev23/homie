import { router } from 'expo-router';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { StatusMessage } from '@/components/StatusMessage';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/src/auth';
import { colors, spacing, typography } from '@/src/theme';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!email.trim()) return 'Please enter your email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }

  async function handleSignUp() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    const { error: authError, needsConfirmation } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    if (needsConfirmation) {
      router.replace({ pathname: '/verify-email', params: { email: email.trim() } });
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
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.body}>Start taking care of your home with Homie.</Text>
      </View>
      {error && <StatusMessage title="Could not create account" message={error} tone="error" />}
      <View style={styles.form}>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Jane Doe" autoCapitalize="words" autoComplete="name" />
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" />
        <TextField label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry autoComplete="new-password" />
        <TextField label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter your password" secureTextEntry autoComplete="new-password" />
      </View>
      <Button label="Create account" onPress={handleSignUp} loading={loading} icon={<UserPlus color={colors.white} size={18} />} />
      <View style={styles.links}>
        <Button label="Already have an account? Sign in" variant="ghost" onPress={() => router.push('/login')} />
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
