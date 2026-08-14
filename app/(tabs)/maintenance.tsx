import { CalendarClock, Wrench } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { colors, spacing, typography } from '@/src/theme';

export default function MaintenanceScreen() {
  return <Screen><View style={styles.header}><Text style={styles.eyebrow}>CARE ROUTINE</Text><Text style={styles.title}>Maintenance</Text><Text style={styles.body}>A simple rhythm for staying ahead of the little things.</Text></View><Card><CalendarClock color={colors.primary} size={28} /><Text style={styles.cardTitle}>Your schedule will live here</Text><Text style={styles.body}>Maintenance planning is intentionally reserved for the next product phase.</Text></Card><View style={styles.note}><Wrench color={colors.primaryDark} size={20} /><Text style={styles.noteText}>No tasks have been created yet.</Text></View></Screen>;
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginBottom: spacing.xl },
  eyebrow: { ...typography.label, color: colors.primaryDark, letterSpacing: 1 },
  title: { ...typography.heading, color: colors.secondary },
  body: { ...typography.body, color: colors.textSoft },
  cardTitle: { ...typography.subheading, color: colors.secondary, marginTop: spacing.md },
  note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, padding: spacing.md, backgroundColor: colors.primarySoft, borderRadius: 12 },
  noteText: { ...typography.body, color: colors.primaryDark },
});
