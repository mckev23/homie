import { supabase } from '@/src/supabase';
import type { SystemType } from '@/src/homeSystems';

export type MaintenanceTask = {
  id: string;
  home_id: string;
  user_id: string;
  system_type: SystemType | null;
  title: string;
  frequency_months: number;
  last_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MaintenanceError = { message: string };

// Static best-practice cadence per system, not a prediction about this
// specific home's equipment. Intentionally small — MVP scope, not a full
// taxonomy. Extend per system as needed.
const MAINTENANCE_TEMPLATES: Record<SystemType, { title: string; frequencyMonths: number }[]> = {
  heating: [{ title: 'Replace furnace filter', frequencyMonths: 3 }],
  cooling: [{ title: 'Service air conditioner', frequencyMonths: 12 }],
  water_heater: [{ title: 'Flush water heater', frequencyMonths: 12 }],
  electrical_panel: [{ title: 'Test smoke & CO detectors', frequencyMonths: 6 }],
  sewer_septic: [{ title: 'Inspect sewer/septic system', frequencyMonths: 12 }],
};

export async function ensureMaintenanceTasksForSystems(
  userId: string,
  homeId: string,
  systemTypes: SystemType[]
): Promise<{ error: MaintenanceError | null }> {
  if (!supabase) return { error: { message: 'Service unavailable.' } };

  const rows = systemTypes.flatMap((systemType) =>
    (MAINTENANCE_TEMPLATES[systemType] ?? []).map((template) => ({
      home_id: homeId,
      user_id: userId,
      system_type: systemType,
      title: template.title,
      frequency_months: template.frequencyMonths,
    }))
  );

  if (rows.length === 0) return { error: null };

  const { error } = await supabase
    .from('maintenance_tasks')
    .upsert(rows, { onConflict: 'home_id,title', ignoreDuplicates: true });

  if (error) {
    return { error: { message: 'Could not set up your maintenance schedule. Please try again.' } };
  }
  return { error: null };
}

export async function fetchMaintenanceTasks(
  homeId: string
): Promise<{ data: MaintenanceTask[] | null; error: MaintenanceError | null }> {
  if (!supabase) return { data: null, error: { message: 'Service unavailable.' } };

  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select('*')
    .eq('home_id', homeId)
    .order('created_at', { ascending: true });

  if (error) {
    return { data: null, error: { message: 'Could not load your maintenance schedule. Please try again.' } };
  }
  return { data: data as MaintenanceTask[], error: null };
}

export async function markTaskDone(taskId: string): Promise<{ error: MaintenanceError | null }> {
  if (!supabase) return { error: { message: 'Service unavailable.' } };

  const { error } = await supabase
    .from('maintenance_tasks')
    .update({ last_completed_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) {
    return { error: { message: 'Could not update this task. Please try again.' } };
  }
  return { error: null };
}

// Qualitative status only — no exact due dates or day counts, per the
// "no false precision" product rule.
export function isTaskDueForAnotherRound(task: MaintenanceTask): boolean {
  if (!task.last_completed_at) return true;
  const monthsSince =
    (Date.now() - new Date(task.last_completed_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsSince >= task.frequency_months;
}

export function frequencyLabel(months: number): string {
  if (months === 1) return 'Every month';
  if (months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? 'Every year' : `Every ${years} years`;
  }
  return `Every ${months} months`;
}
