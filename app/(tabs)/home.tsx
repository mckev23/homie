import { CalendarDays, ChevronRight, House, Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { colors, spacing, typography } from '@/src/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>WELCOME TO HOMIE</Text>
          <Text style={styles.title}>Your home base</Text>
        </View>
        <View style={styles.avatar}><House color={colors.primaryDark} size={22} /></View>
      </View>
      <Card>
        <View style={styles.cardIcon}><House color={colors.primary} size={24} /></View>
        <Text style={styles.cardTitle}>Your home is waiting</Text>
        <Text style={styles.body}>Add your home in the next phase to make this space your personalized dashboard.</Text>
      </Card>
      <Text style={styles.sectionTitle}>Foundation preview</Text>
      <View style={styles.rowCard}><CalendarDays color={colors.primary} size={22} /><View style={styles.rowCopy}><Text style={styles.rowTitle}>Simple maintenance</Text><Text style={styles.rowBody}>A clear place for what needs attention.</Text></View><ChevronRight color={colors.muted} size={20} /></View>
      <View style={styles.rowCard}><Sparkles color={colors.accent} size={22} /><View style={styles.rowCopy}><Text style={styles.rowTitle}>Helpful guidance</Text><Text style={styles.rowBody}>Practical support for confident homeowners.</Text></View><ChevronRight color={colors.muted} size={20} /></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  eyebrow: { ...typography.label, color: colors.primaryDark, letterSpacing: 1 },
  title: { ...typography.heading, color: colors.secondary, marginTop: spacing.xs },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cardIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  cardTitle: { ...typography.subheading, color: colors.secondary },
  body: { ...typography.body, color: colors.textSoft, marginTop: spacing.sm },
  sectionTitle: { ...typography.subheading, color: colors.secondary, marginTop: spacing.xl, marginBottom: spacing.sm },
  rowCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  rowCopy: { flex: 1 },
  rowTitle: { ...typography.label, color: colors.secondary },
  rowBody: { ...typography.caption, color: colors.textSoft, marginTop: 3 },
});
