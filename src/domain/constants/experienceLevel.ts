/**
 * Experience level hierarchy configuration
 * Defines the numeric hierarchy for experience/seniority levels
 * Higher numbers indicate more senior levels
 */
export const EXPERIENCE_LEVEL_HIERARCHY: Record<string, number> = {
  'junior': 1,
  'mid': 2,
  'senior': 3,
  'lead': 4,
} as const;

/**
 * Gets the numeric hierarchy value for a given experience level
 * @param level - The experience or seniority level
 * @returns The numeric hierarchy value, or 0 if level is invalid
 */
export function getExperienceLevelValue(level: string): number {
  return EXPERIENCE_LEVEL_HIERARCHY[level.toLowerCase()] || 0;
}

