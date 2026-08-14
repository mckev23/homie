import { ChevronRight, CircleHelp, FileText, ShieldCheck } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { colors, spacing, typography } from '@/src/theme';

export default function SettingsScreen() {
  return <Screen><Text style={styles.eyebrow}>APP FOUNDATION</Text><Text style={styles.title}>Settings</Text><Text style={styles.body}>The essentials are ready for your next Homie step.</Text><View style={styles.list}><SettingRow icon={<ShieldCheck color={colors.primary} size={20} />} title="Privacy first" detail="Your account and home data will be protected." /><SettingRow icon={<FileText color={colors.primary} size={20} />} title="Foundation documentation" detail="Architecture decisions are kept with the project." /><SettingRow icon={<CircleHelp color={colors.primary} size={20} />} title="Help and support" detail="Support tools will be added as Homie grows." /></View><Card><Text style={styles.versionLabel}>HOMIE FOUNDATION</Text><Text style={styles.version}>Version 1.0</Text></Card></Screen>;
}

type SettingRowProps = { icon: ReactNode; title: string; detail: string };
function SettingRow({ icon, title, detail }: SettingRowProps) { return <View style={styles.row}><View style={styles.rowIcon}>{icon}</View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowDetail}>{detail}</Text></View><ChevronRight color={colors.muted} size={18} /></View>; }

const styles = StyleSheet.create({
  eyebrow: { ...typography.label, color: colors.primaryDark, letterSpacing: 1 },
  title: { ...typography.heading, color: colors.secondary, marginTop: spacing.xs },
  body: { ...typography.body, color: colors.textSoft, marginTop: spacing.sm },
  list: { marginVertical: spacing.xl, gap: spacing.sm },
  row: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowTitle: { ...typography.label, color: colors.secondary },
  rowDetail: { ...typography.caption, color: colors.textSoft, marginTop: 2 },
  versionLabel: { ...typography.caption, color: colors.primaryDark },
  version: { ...typography.subheading, color: colors.secondary, marginTop: spacing.xs },
});
