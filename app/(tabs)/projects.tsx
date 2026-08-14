import { FolderKanban, Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { colors, spacing, typography } from '@/src/theme';

export default function ProjectsScreen() {
  return <Screen><View style={styles.header}><View><Text style={styles.eyebrow}>PLAN AHEAD</Text><Text style={styles.title}>Projects</Text></View><View style={styles.icon}><Plus color={colors.primary} size={22} /></View></View><Card><FolderKanban color={colors.primary} size={28} /><Text style={styles.cardTitle}>Projects are coming later</Text><Text style={styles.body}>Use this future space to organize upgrades, repairs, and larger home decisions.</Text></Card></Screen>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  eyebrow: { ...typography.label, color: colors.primaryDark, letterSpacing: 1 },
  title: { ...typography.heading, color: colors.secondary, marginTop: spacing.xs },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { ...typography.subheading, color: colors.secondary, marginTop: spacing.md },
  body: { ...typography.body, color: colors.textSoft, marginTop: spacing.sm },
});
