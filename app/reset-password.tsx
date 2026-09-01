import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { KeyRound, LockKeyhole } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { StatusMessage } from '@/components/StatusMessage';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/src/auth';
import { hasRecoveryTokens, parseAuthParams, recoveryLinkError } from '@/src/authLinks';
import { colors, spacing, typography } from '@/src/theme';

type Stage = 'verifying' | 'ready' | 'invalid' | 'done';

export default function ResetPasswordScreen() {
  const { session, startPasswordRecovery, updatePassword } = useAuth();
  const url = Linking.useURL();

  const [stage, setStage] = useState<Stage>('verifying');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function verify() {
      if (url) {
        const params = parseAuthParams(url);

        const linkError = recoveryLinkError(params);
        if (linkError) {
          if (active) {
            setError(linkError);
            setStage('invalid');
          }
          return;
        }

        if (hasRecoveryTokens(params)) {
          const { error: sessionError } = await startPasswordRecovery(
            params.access_token as string,
            params.refresh_token as string
          );
          if (!active) return;
          if (sessionError) {
            setError(sessionError.message);
            setStage('invalid');
          } else {
            setStage('ready');
          }
          return;
        }
      }

      // No usable tokens in the link. If Supabase already established a
      // recovery session (it emits PASSWORD_RECOVERY on some platforms), the
      // user can still set a new password. Otherwise this screen was reached
      // without a valid link.
      if (!active) return;
      if (session) {
        setStage('ready');
      } else if (url !== null) {
        setError('This reset link is no longer valid. Please request a new one.');
        setStage('invalid');
      }
    }

    verify();
    return () => {
      active = false;
    };
  }, [url, session, startPasswordRecovery]);

  // Guard against sitting on a spinner forever if no link ever arrives.
  useEffect(() => {
    if (stage !== 'verifying') return;
    const timer = setTimeout(() => {
      setStage((current) => {
        if (current !== 'verifying') return current;
        setError('This reset link is no longer valid. Please request a new one.');
        return 'invalid';
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, [stage]);

  function validate(): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }

  async function handleSave() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);
    const { error: updateError } = await updatePassword(password);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setStage('done');
  }

  return (
    <Screen>
      <View style={styles.header}>
        <BrandMark />
        <Text style={styles.title}>
          {stage === 'done' ? 'Password updated' : 'Choose a new password'}
        </Text>
        {stage === 'ready' && (
          <Text style={styles.body}>Pick something you'll remember. At least 8 characters.</Text>
        )}
      </View>

      {stage === 'verifying' && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.body}>Checking your reset link…</Text>
        </View>
      )}

      {stage === 'invalid' && (
        <View style={styles.section}>
          <StatusMessage
            title="Link no longer valid"
            message={error ?? 'This reset link is no longer valid. Please request a new one.'}
            tone="error"
          />
          <Button
            label="Request a new link"
            onPress={() => router.replace('/forgot-password')}
            icon={<KeyRound color={colors.white} size={18} />}
          />
          <Button label="Back to sign in" variant="ghost" onPress={() => router.replace('/login')} />
        </View>
      )}

      {stage === 'ready' && (
        <View style={styles.section}>
          {error && <StatusMessage title="Could not update password" message={error} tone="error" />}
          <View style={styles.form}>
            <TextField
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureTextEntry
              autoComplete="new-password"
            />
            <TextField
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              autoComplete="new-password"
            />
          </View>
          <Button
            label="Update password"
            onPress={handleSave}
            loading={saving}
            icon={<LockKeyhole color={colors.white} size={18} />}
          />
        </View>
      )}

      {stage === 'done' && (
        <View style={styles.section}>
          <StatusMessage
            title="You're all set"
            message="Your password has been updated. You can sign in with it now."
          />
          <Button label="Go to sign in" onPress={() => router.replace('/login')} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.xxl },
  title: { ...typography.heading, color: colors.secondary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSoft, textAlign: 'center' },
  centered: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  section: { gap: spacing.md },
  form: { gap: spacing.md },
});
