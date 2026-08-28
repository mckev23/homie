import type { SystemType } from '@/src/homeSystems';

export type HorizonStatus = 'early' | 'approaching' | 'past';

// Typical replacement-window ranges in years, not predictions about any
// specific unit. Intentionally coarse — MVP scope, not an appraisal tool.
const SYSTEM_LIFESPANS: Record<SystemType, { min: number; max: number }> = {
  heating: { min: 15, max: 20 },
  cooling: { min: 12, max: 15 },
  water_heater: { min: 8, max: 12 },
  electrical_panel: { min: 25, max: 40 },
  sewer_septic: { min: 20, max: 30 },
};

export function classifyHorizon(homeAgeYears: number, systemType: SystemType): HorizonStatus {
  const { min, max } = SYSTEM_LIFESPANS[systemType];
  if (homeAgeYears > max) return 'past';
  if (homeAgeYears >= min * 0.7) return 'approaching';
  return 'early';
}

// Calibrated, qualitative language only — no exact ages, dates, or
// predicted failure windows. Assumes the system is original to the home
// unless told otherwise, which the copy makes explicit.
export function horizonMessage(status: HorizonStatus): string {
  switch (status) {
    case 'past':
      return "Past the typical age range for this type — worth having someone take a look, if it hasn't been replaced already.";
    case 'approaching':
      return 'Approaching the age when replacement becomes more likely. Nothing urgent — just worth knowing.';
    case 'early':
      return 'Still well within its typical lifespan.';
  }
}

// "past"/"approaching" are more worth surfacing than "early" — sort them first.
const STATUS_PRIORITY: Record<HorizonStatus, number> = { past: 0, approaching: 1, early: 2 };

export function sortByHorizonPriority<T extends { status: HorizonStatus }>(items: T[]): T[] {
  return [...items].sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);
}
