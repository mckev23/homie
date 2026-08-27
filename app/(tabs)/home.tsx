import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { CalendarDays, ChevronRight, House, Sparkles, Wrench } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { fetchHomeSystems, labelForSystem, type SystemType } from '@/src/homeSystems';
import { fetchPrimaryHome, type Home as HomeRecord } from '@/src/homes';
import { colors, spacing, typography } from '@/src/theme';

export default function HomeScreen() {
  const [home, setHome] = useState<HomeRecord | null>(null);
  const [systems, setSystems] = useState<SystemType[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);

      fetchPrimaryHome().then(async ({ data: homeData }) => {
        if (!active) return;
        setHome(homeData);

        if (homeData) {
          const { data: systemsData } = await fetchHomeSystems(homeData.id);
          if (active) setSystems(systemsData ?? []);
        }

        if (active) setLoading(false);
      });

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>WELCOME TO HOMIE</Text>
          <Text style={styles.title}>Your home base</Text>
        </View>
        <View style={styles.avatar}><House color={colors.primaryDark} size={22} /></View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : home ? (
        <View style={styles.cardStack}>
          <Card>
            <View style={styles.cardIcon}><House color={colors.primary} size={24} /></View>
            <Text style={styles.cardTitle}>{home.nickname}</Text>
            {(home.address || home.postal_code) && (
              <Text style={styles.body}>{[home.address, home.postal_code].filter(Boolean).join(', ')}</Text>
            )}
            {home.year_built && <Text style={styles.body}>Built {home.year_built}</Text>}
          </Card>

          <Card>
            <View style={styles.cardIcon}><Wrench color={colors.primary} size={24} /></View>
            <Text style={styles.cardTitle}>Systems</Text>
            <Text style={styles.body}>
              {systems.length > 0 ? systems.map(labelForSystem).join(', ') : 'No systems added yet.'}
            </Text>
            <View style={styles.cardAction}>
              <Button
                label={systems.length > 0 ? 'Edit systems' : 'Add systems'}
                variant="secondary"
                onPress={() => router.push({ pathname: '/add-systems', params: { homeId: home.id } })}
              />
            </View>
          </Card>
        </View>
      ) : (
        <Card>
          <View style={styles.cardIcon}><House color={colors.primary} size={24} /></View>
          <Text style={styles.cardTitle}>Your home is waiting</Text>
          <Text style={styles.body}>Add your home to make this space your personalized dashboard.</Text>
          <View style={styles.cardAction}>
            <Button label="Add your home" onPress={() => router.push('/add-home')} icon={<House color={colors.white} size={18} />} />
          </View>
        </Card>
      )}

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
  cardStack: { gap: spacing.md },
  loadingWrap: { paddingVertical: spacing.xl, alignItems: 'center' },
  cardIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  cardTitle: { ...typography.subheading, color: colors.secondary },
  body: { ...typography.body, color: colors.textSoft, marginTop: spacing.sm },
  cardAction: { marginTop: spacing.lg },
  sectionTitle: { ...typography.subheading, color: colors.secondary, marginTop: spacing.xl, marginBottom: spacing.sm },
  rowCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  rowCopy: { flex: 1 },
  rowTitle: { ...typography.label, color: colors.secondary },
  rowBody: { ...typography.caption, color: colors.textSoft, marginTop: 3 },
});
