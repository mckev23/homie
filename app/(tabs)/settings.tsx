import { router } from 'expo-router';
import { ChevronRight, CircleHelp, FileText, LogOut, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { StatusMessage } from '@/components/StatusMessage';
import { useAuth } from '@/src/auth';
import { colors, spacing, typography } from '@/src/theme';

export default function SettingsScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.replace('/');
  }

  async function performDelete() {
    setDeleteError(null);
    setDeleting(true);
    const { error } = await deleteAccount();
    setDeleting(false);
    if (error) {
      setDeleteError(error.message);
      return;
    }
    router.replace('/');
  }

  // Two-step confirmation: deletion is irreversible, so it should never be
  // one tap away. Required by App Store Guideline 5.1.1(v).
  function confirmDelete() {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your account, your home, its systems, and your maintenance schedule. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'This cannot be undone',
              'Are you sure you want to permanently delete your hōm account?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete forever', style: 'destructive', onPress: performDelete },
              ]
            );
          },
        },
      ]
    );
  }

  return (
    <Screen>
      <Text style={styles.eyebrow}>APP FOUNDATION</Text>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.body}>The essentials are ready for your next hōm step.</Text>

      {user?.email && (
        <View style={styles.account}>
          <Text style={styles.accountLabel}>Signed in as</Text>
          <Text style={styles.accountEmail}>{user.email}</Text>
        </View>
      )}

      <View style={styles.list}>
        <SettingRow icon={<ShieldCheck color={colors.primary} size={20} />} title="Privacy first" detail="Your account and home data will be protected." />
        <SettingRow icon={<FileText color={colors.primary} size={20} />} title="Foundation documentation" detail="Architecture decisions are kept with the project." />
        <SettingRow icon={<CircleHelp color={colors.primary} size={20} />} title="Help and support" detail="Support tools will be added as hōm grows." />
      </View>

      <Card>
        <Text style={styles.versionLabel}>HŌM FOUNDATION</Text>
        <Text style={styles.version}>Version 1.0</Text>
      </Card>

      <View style={styles.signOutArea}>
        <StatusMessage title="Account" message="You can sign out at any time. You'll need to sign in again to return." />
        <Button label="Sign out" variant="secondary" loading={signingOut} onPress={handleSignOut} icon={<LogOut color={colors.primaryDark} size={18} />} />
      </View>

      <View style={styles.dangerArea}>
        {deleteError && <StatusMessage title="Could not delete account" message={deleteError} tone="error" />}
        <Text style={styles.dangerLabel}>Delete account</Text>
        <Text style={styles.dangerBody}>
          Permanently deletes your account and everything in it — your home, its systems, and your
          maintenance schedule. This cannot be undone.
        </Text>
        <Button
          label="Delete my account"
          variant="secondary"
          loading={deleting}
          onPress={confirmDelete}
          icon={<Trash2 color={colors.error} size={18} />}
        />
      </View>
    </Screen>
  );
}

type SettingRowProps = { icon: ReactNode; title: string; detail: string };
function SettingRow({ icon, title, detail }: SettingRowProps) {
  return <View style={styles.row}><View style={styles.rowIcon}>{icon}</View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowDetail}>{detail}</Text></View><ChevronRight color={colors.muted} size={18} /></View>;
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.label, color: colors.primaryDark, letterSpacing: 1 },
  title: { ...typography.heading, color: colors.secondary, marginTop: spacing.xs },
  body: { ...typography.body, color: colors.textSoft, marginTop: spacing.sm },
  account: { marginTop: spacing.lg, backgroundColor: colors.primarySoft, borderRadius: 12, padding: spacing.md, gap: spacing.xs },
  accountLabel: { ...typography.caption, color: colors.primaryDark },
  accountEmail: { ...typography.label, color: colors.secondary },
  list: { marginVertical: spacing.xl, gap: spacing.sm },
  row: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowTitle: { ...typography.label, color: colors.secondary },
  rowDetail: { ...typography.caption, color: colors.textSoft, marginTop: 2 },
  versionLabel: { ...typography.caption, color: colors.primaryDark },
  version: { ...typography.subheading, color: colors.secondary, marginTop: spacing.xs },
  signOutArea: { marginTop: spacing.xl, gap: spacing.md },
  dangerArea: { marginTop: spacing.xl, gap: spacing.sm },
  dangerLabel: { ...typography.label, color: colors.error },
  dangerBody: { ...typography.caption, color: colors.textSoft },
});
