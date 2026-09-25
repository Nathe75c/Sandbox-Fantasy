import { clamp } from './math';
import type { Rng } from './rng';

/**
 * Jet de compétence : probabilité de réussite en % (5..95).
 * p = 40 + stat×4 + bonus − difficulté
 */
export function checkChance(stat: number, difficulty: number, bonus = 0): number {
  return clamp(Math.round(40 + stat * 4 + bonus - difficulty), 5, 95);
}

export interface CheckResult {
  success: boolean;
  critical: boolean;
  roll: number;
  chance: number;
}

/** Lance un d100 contre `chance`. Critique si le dé ≤ chanceStat / 2. */
export function roll(rng: Rng, chance: number, luck = 5): CheckResult {
  const r = rng.d100();
  const success = r <= chance;
  return { success, critical: success && r <= Math.max(1, Math.floor(luck / 2)), roll: r, chance };
}
