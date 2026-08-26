import { supabase } from '@/src/supabase';

export type Home = {
  id: string;
  user_id: string;
  nickname: string;
  address: string | null;
  postal_code: string | null;
  year_built: number | null;
  created_at: string;
  updated_at: string;
};

export type HomeError = { message: string };

export type NewHome = {
  nickname: string;
  address?: string;
  postalCode?: string;
  yearBuilt?: number;
};

export async function fetchPrimaryHome(): Promise<{ data: Home | null; error: HomeError | null }> {
  if (!supabase) return { data: null, error: { message: 'Service unavailable.' } };
  const { data, error } = await supabase
    .from('homes')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error: { message: 'Could not load your home. Please try again.' } };
  }
  return { data, error: null };
}

export async function createHome(
  userId: string,
  input: NewHome
): Promise<{ data: Home | null; error: HomeError | null }> {
  if (!supabase) return { data: null, error: { message: 'Service unavailable.' } };

  const { data, error } = await supabase
    .from('homes')
    .insert({
      user_id: userId,
      nickname: input.nickname.trim() || 'My Home',
      address: input.address?.trim() || null,
      postal_code: input.postalCode?.trim() || null,
      year_built: input.yearBuilt ?? null,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: { message: 'Could not save your home. Please try again.' } };
  }
  return { data, error: null };
}
