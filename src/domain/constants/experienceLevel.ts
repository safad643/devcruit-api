
export const EXPERIENCE_LEVEL_HIERARCHY: Record<string, number> = {
  'junior': 1,
  'mid': 2,
  'senior': 3,
  'lead': 4,
} as const;


export function getExperienceLevelValue(level: string): number {
  return EXPERIENCE_LEVEL_HIERARCHY[level.toLowerCase()] || 0;
}

