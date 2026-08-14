import { router } from 'expo-router';
import { ArrowLeft, LockKeyhole } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '@/components/BrandMark';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { colors, spacing, typography } from '@/src/theme';

export default function AuthPlaceholderScreen() {
  return (
    <Screen>
      <View style={styles.topBar}>
        <Button label="Back" variant="ghost" onPress={() => router.back()} icon={<ArrowLeft color={colors.primaryDark} size={18} />} />
      </View>
      <View style={styles.header}>
        <BrandMark />
        <Text style={styles.title}>Your account is next</Text>
        <Text style={styles.body}>Secure sign-in and account creation will be added after the foundation is validated on iPhone.</Text>
      </View>
      <Card>
        <LockKeyhole color={colors.primary} size={26} />
        <Text style={styles.cardTitle}>Authentication placeholder</Text>
        <Text style={styles.cardBody}>Supabase Auth is reserved for the next phase. No account or email data is collected yet.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { alignItems: 'flex-start', marginBottom: spacing.xl },
  header: { alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xxl },
  title: { ...typography.heading, color: colors.secondary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSoft, textAlign: 'center' },
  cardTitle: { ...typography.subheading, color: colors.secondary, marginTop: spacing.md },
  cardBody: { ...typography.body, color: colors.textSoft, marginTop: spacing.sm },
});
