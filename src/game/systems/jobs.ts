/**
 * Progression des métiers et du personnage.
 */
import { CONTENT } from '@/data';
import type { PlayerState } from '@/types';
import type { Ctx } from '../actions/context';
import { effectiveStats, jobBonus, maxEnergy, maxHp } from '../state/selectors';

export const MAX_JOB_LEVEL = 10;
export const xpToNextJobLevel = (level: number) => 30 * level * level;
export const xpToNextPlayerLevel = (level: number) => 100 * level;

export function learnJob(ctx: Ctx, player: PlayerState, jobId: string, npcId?: string) {
  if (player.jobs[jobId]) return false;
  player.jobs[jobId] = { level: 1, xp: 0 };
  ctx.emit({ type: 'job_learned', actorId: player.id, data: { jobId, npcId } });
  return true;
}

/** Multiplicateur d'apprentissage : intelligence, humain, traits, origine. */
export function learningMultiplier(ctx: Ctx, player: PlayerState, jobId: string) {
  const stats = effectiveStats(player, ctx.state.world.time);
  const race = player.raceId === 'humain' ? 0.1 : 0;
  return Math.max(0.5, 1 + (stats.intelligence - 5) * 0.03 + race + jobBonus(player, jobId));
}

export function gainJobXp(ctx: Ctx, player: PlayerState, jobId: string, baseXp: number) {
  if (!CONTENT.jobs[jobId]) return;
  const progress = player.jobs[jobId];
  if (!progress) return;
  progress.xp += Math.round(baseXp * learningMultiplier(ctx, player, jobId));
  while (progress.level < MAX_JOB_LEVEL && progress.xp >= xpToNextJobLevel(progress.level)) {
    progress.xp -= xpToNextJobLevel(progress.level);
    progress.level += 1;
    ctx.emit({ type: 'job_leveled', actorId: player.id, data: { jobId, level: progress.level } });
  }
  gainPlayerXp(ctx, player, Math.ceil(baseXp / 2));
}

export function gainPlayerXp(ctx: Ctx, player: PlayerState, xp: number) {
  player.xp += xp;
  while (player.xp >= xpToNextPlayerLevel(player.level)) {
    player.xp -= xpToNextPlayerLevel(player.level);
    player.level += 1;
    player.statPoints += 1;
    const stats = effectiveStats(player, ctx.state.world.time);
    player.hp = maxHp(stats);
    player.energy = maxEnergy(stats);
    ctx.emit({ type: 'player_leveled', actorId: player.id, data: { level: player.level } });
  }
}
