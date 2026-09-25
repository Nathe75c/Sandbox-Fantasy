/**
 * Apparition des créatures dans les lieux.
 */
import { CONTENT } from '@/data';
import type { Ctx } from '../actions/context';
import { creaturesAt } from '../state/selectors';

export function spawnCreature(ctx: Ctx, locationId: string, creatureId: string) {
  const def = CONTENT.creatures[creatureId];
  if (!def) return undefined;
  const uid = ctx.newId('cre');
  ctx.state.world.creatures[uid] = { uid, creatureId, locationId, hp: def.stats.hp, spawnedDay: ctx.state.world.time.day };
  ctx.emit({ type: 'creature_spawned', actorId: 'world', data: { uid, creatureId, locationId } });
  return uid;
}

/** Tick quotidien : chaque lieu peut voir apparaître une créature de sa table. */
export function dailySpawns(ctx: Ctx) {
  const { state, rng } = ctx;
  for (const loc of CONTENT.lists.locations) {
    if (!loc.creatureSpawns.length) continue;
    const danger = state.world.locations[loc.id]?.danger ?? loc.base.danger;
    if (!rng.chance(0.15 + danger / 200)) continue;
    const present = creaturesAt(state, loc.id);
    const candidates = loc.creatureSpawns.filter(
      (s) => !CONTENT.creatures[s.creatureId]?.legendary && present.filter((c) => c.creatureId === s.creatureId).length < s.max,
    );
    const pick = rng.weighted(candidates, (s) => s.weight);
    if (pick) spawnCreature(ctx, loc.id, pick.creatureId);
  }
  // Les créatures anciennes finissent par partir (migration hors carte).
  for (const c of Object.values(state.world.creatures)) {
    if (state.world.time.day - c.spawnedDay > 6 && rng.chance(0.2) && !CONTENT.creatures[c.creatureId]?.legendary) {
      delete state.world.creatures[c.uid];
    }
  }
}
