import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { CalendarClock, CircleCheck, Wrench } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { fetchPrimaryHome, type Home as HomeRecord } from '@/src/homes';
import {
  fetchMaintenanceTasks,
  frequencyLabel,
  isTaskDueForAnotherRound,
  markTaskDone,
  type MaintenanceTask,
} from '@/src/maintenance';
import { colors, radii, spacing, typography } from '@/src/theme';

export default function MaintenanceScreen() {
  const [home, setHome] = useState<HomeRecord | null>(null);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: homeData } = await fetchPrimaryHome();
    setHome(homeData);
    if (homeData) {
      const { data: tasksData } = await fetchMaintenanceTasks(homeData.id);
      setTasks(tasksData ?? []);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      load().then(() => {
        if (!active) return;
      });
      return () => {
        active = false;
      };
    }, [load])
  );

  async function handleMarkDone(taskId: string) {
    setCompletingId(taskId);
    const { error } = await markTaskDone(taskId);
    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, last_completed_at: new Date().toISOString() } : t))
      );
    }
    setCompletingId(null);
  }

  const dueTasks = tasks.filter(isTaskDueForAnotherRound);
  const onTrackTasks = tasks.filter((t) => !isTaskDueForAnotherRound(t));

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CARE ROUTINE</Text>
        <Text style={styles.title}>Maintenance</Text>
        <Text style={styles.body}>A simple rhythm for staying ahead of the little things.</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !home ? (
        <Card>
          <CalendarClock color={colors.primary} size={28} />
          <Text style={styles.cardTitle}>Add your home first</Text>
          <Text style={styles.body}>Your maintenance schedule builds itself once your home is set up.</Text>
          <View style={styles.cardAction}>
            <Button label="Add your home" onPress={() => router.push('/add-home')} />
          </View>
        </Card>
      ) : tasks.length === 0 ? (
        <Card>
          <Wrench color={colors.primary} size={28} />
          <Text style={styles.cardTitle}>No tasks yet</Text>
          <Text style={styles.body}>Add the systems your home has and we'll suggest a simple schedule.</Text>
          <View style={styles.cardAction}>
            <Button label="Add systems" onPress={() => router.push({ pathname: '/add-systems', params: { homeId: home.id } })} />
          </View>
        </Card>
      ) : (
        <View style={styles.list}>
          {dueTasks.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Worth a look</Text>
              {dueTasks.map((task) => (
                <TaskRow key={task.id} task={task} onMarkDone={handleMarkDone} loading={completingId === task.id} />
              ))}
            </>
          )}
          {onTrackTasks.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>On track</Text>
              {onTrackTasks.map((task) => (
                <TaskRow key={task.id} task={task} onMarkDone={handleMarkDone} loading={completingId === task.id} />
              ))}
            </>
          )}
        </View>
      )}
    </Screen>
  );
}

type TaskRowProps = { task: MaintenanceTask; onMarkDone: (id: string) => void; loading: boolean };

function TaskRow({ task, onMarkDone, loading }: TaskRowProps) {
  const done = !isTaskDueForAnotherRound(task);
  return (
    <View style={styles.taskRow}>
      <View style={styles.taskCopy}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskCadence}>{frequencyLabel(task.frequency_months)}</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Button
          label={done ? 'Done' : 'Mark done'}
          variant={done ? 'secondary' : 'primary'}
          onPress={() => onMarkDone(task.id)}
          icon={done ? <CircleCheck color={colors.primaryDark} size={16} /> : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginBottom: spacing.xl },
  eyebrow: { ...typography.label, color: colors.primaryDark, letterSpacing: 1 },
  title: { ...typography.heading, color: colors.secondary },
  body: { ...typography.body, color: colors.textSoft },
  loadingWrap: { paddingVertical: spacing.xl, alignItems: 'center' },
  cardTitle: { ...typography.subheading, color: colors.secondary, marginTop: spacing.md },
  cardAction: { marginTop: spacing.lg },
  list: { gap: spacing.md },
  sectionTitle: { ...typography.subheading, color: colors.secondary, marginTop: spacing.md },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  taskCopy: { flex: 1 },
  taskTitle: { ...typography.label, color: colors.secondary },
  taskCadence: { ...typography.caption, color: colors.textSoft, marginTop: 3 },
});
