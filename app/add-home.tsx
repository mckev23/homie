import { router } from 'expo-router';
import { ArrowLeft, House } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { StatusMessage } from '@/components/StatusMessage';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/src/auth';
import { createHome } from '@/src/homes';
import { colors, spacing, typography } from '@/src/theme';

export default function AddHomeScreen() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (yearBuilt.trim()) {
      const year = Number(yearBuilt.trim());
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1800 || year > currentYear) {
        return `Year built should be between 1800 and ${currentYear}.`;
      }
    }
    return null;
  }

  async function handleSave() {
    if (!user) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    const { error: saveError } = await createHome(user.id, {
      nickname,
      address,
      postalCode,
      yearBuilt: yearBuilt.trim() ? Number(yearBuilt.trim()) : undefined,
    });
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
        <View style={styles.iconWrap}>
          <House color={colors.primary} size={28} />
        </View>
        <Text style={styles.title}>Add your home</Text>
        <Text style={styles.body}>Just the basics for now — you can add more anytime.</Text>
      </View>
      {error && <StatusMessage title="Could not save" message={error} tone="error" />}
      <View style={styles.form}>
        <TextField label="Name your home" value={nickname} onChangeText={setNickname} placeholder="My Home" autoCapitalize="words" />
        <TextField label="Address (optional)" value={address} onChangeText={setAddress} placeholder="123 Main St" autoCapitalize="words" autoComplete="street-address" />
        <TextField label="ZIP / postal code (optional)" value={postalCode} onChangeText={setPostalCode} placeholder="55416" keyboardType="number-pad" />
        <TextField label="Year built (optional)" value={yearBuilt} onChangeText={setYearBuilt} placeholder="2005" keyboardType="number-pad" />
      </View>
      <Button label="Save home" onPress={handleSave} loading={loading} icon={<House color={colors.white} size={18} />} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'flex-start', marginBottom: spacing.xl },
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxl },
  iconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.heading, color: colors.secondary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSoft, textAlign: 'center' },
  form: { gap: spacing.md, marginBottom: spacing.lg },
});
