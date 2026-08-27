import { supabase } from '@/src/supabase';

export type SystemType = 'heating' | 'cooling' | 'water_heater' | 'electrical_panel' | 'sewer_septic';

export const SYSTEM_CATALOG: { type: SystemType; label: string }[] = [
  { type: 'heating', label: 'Heating' },
  { type: 'cooling', label: 'Cooling' },
  { type: 'water_heater', label: 'Water Heater' },
  { type: 'electrical_panel', label: 'Electrical Panel' },
  { type: 'sewer_septic', label: 'Sewer / Septic' },
];

const LABELS_BY_TYPE = Object.fromEntries(SYSTEM_CATALOG.map(({ type, label }) => [type, label])) as Record<
  SystemType,
  string
>;

export function labelForSystem(type: SystemType): string {
  return LABELS_BY_TYPE[type] ?? type;
}

export type HomeSystemError = { message: string };

export async function fetchHomeSystems(
  homeId: string
): Promise<{ data: SystemType[] | null; error: HomeSystemError | null }> {
  if (!supabase) return { data: null, error: { message: 'Service unavailable.' } };

  const { data, error } = await supabase.from('home_systems').select('system_type').eq('home_id', homeId);

  if (error) {
    return { data: null, error: { message: 'Could not load systems. Please try again.' } };
  }
  return { data: (data ?? []).map((row) => row.system_type as SystemType), error: null };
}

export async function saveHomeSystems(
  userId: string,
  homeId: string,
  selected: SystemType[]
): Promise<{ error: HomeSystemError | null }> {
  if (!supabase) return { error: { message: 'Service unavailable.' } };

  const { error: deleteError } = await supabase.from('home_systems').delete().eq('home_id', homeId);
  if (deleteError) {
    return { error: { message: 'Could not save systems. Please try again.' } };
  }

  if (selected.length === 0) return { error: null };

  const rows = selected.map((system_type) => ({ user_id: userId, home_id: homeId, system_type }));
  const { error: insertError } = await supabase.from('home_systems').insert(rows);
  if (insertError) {
    return { error: { message: 'Could not save systems. Please try again.' } };
  }

  return { error: null };
}
