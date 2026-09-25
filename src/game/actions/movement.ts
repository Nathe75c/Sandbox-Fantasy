import { CONTENT } from '@/data';
import type { GameAction, PlayerState } from '@/types';
import { fail, type Ctx } from './context';
import { clampVitals, requireFree, spendEnergy } from './helpers';
import { carryCapacity, countItem, creaturesAt, effectiveStats, inventoryWeight, maxEnergy, maxHp } from '../state/selectors';
import { advanceTime } from '../systems/time';
import { clamp } from '../systems/math';
import { spawnCreature } from '../systems/spawning';
import { startCombat } from '../systems/combat';

type P<T extends GameAction['type']> = Extract<GameAction, { type: T }>['payload'];

const HOSTILE = ['agressif', 'predateur'];

/** Probabilité d'embuscade (%) pour un trajet. */
export function ambushChance(ctx: Ctx, player: PlayerState, to: string, connectionDanger: number) {
  const stats = effectiveStats(player, ctx.state.world.time);
  const destDanger = ctx.state.world.locations[to]?.danger ?? 0;
  const map = countItem(player, 'carte_val') > 0 ? 8 : 0;
  return clamp(Math.round(connectionDanger * 6 + destDanger / 5 - stats.discretion * 1.5 - stats.perception - map), 0, 60);
}

export function move(ctx: Ctx, player: PlayerState, { to }: P<'move'>) {
  requireFree(player);
  const from = player.locationId;
  const connection = CONTENT.locations[from]?.connections.find((c) => c.to === to);
  if (!connection) fail('Vous ne pouvez pas aller là directement.');
  const stats = effectiveStats(player, ctx.state.world.time);
  const overloaded = inventoryWeight(player.inventory) > carryCapacity(stats);
  const hours = Math.ceil(connection.hours * (overloaded ? 1.5 : 1));
  spendEnergy(player, Math.ceil(hours / 2));

  const chance = connection.hours > 0 ? ambushChance(ctx, player, to, connection.danger) : 0;
  advanceTime(ctx, hours);
  player.locationId = to;
  ctx.emit({ type: 'player_moved', actorId: player.id, data: { from, to, hours } });
  if (overloaded) ctx.say('Trop chargé : le voyage prend plus de temps.', 'warning', player.id);

  if (chance > 0 && ctx.rng.d100() <= chance) {
    const def = CONTENT.locations[to];
    const pool = def.creatureSpawns.filter((s) => HOSTILE.includes(CONTENT.creatures[s.creatureId]?.behavior ?? ''));
    const pick = ctx.rng.weighted(pool, (s) => s.weight);
    if (pick) {
      const existing = creaturesAt(ctx.state, to).find((c) => c.creatureId === pick.creatureId);
      const uid = existing?.uid ?? spawnCreature(ctx, to, pick.creatureId);
      if (uid) startCombat(ctx, player, ctx.state.world.creatures[uid], true);
    }
  }
}

export function rest(ctx: Ctx, player: PlayerState, { hours }: P<'rest'>) {
  requireFree(player);
  const loc = CONTENT.locations[player.locationId];
  const h = clamp(Math.round(hours), 1, 12);
  const cost = h >= 6 ? loc.rest.cost : 0;
  if (player.gold < cost) fail(`Une nuit ici coûte ${cost} po.`);
  player.gold -= cost;
  advanceTime(ctx, h);
  const stats = effectiveStats(player, ctx.state.world.time);
  const ratio = h / 8;
  player.energy = Math.min(maxEnergy(stats), player.energy + Math.ceil(maxEnergy(stats) * ratio));
  player.hp = Math.min(maxHp(stats), player.hp + Math.ceil(maxHp(stats) * 0.5 * ratio));
  clampVitals(ctx, player);
  ctx.emit({ type: 'player_rested', actorId: player.id, data: { locationId: player.locationId, hours: h } });

  // Dormir dans un lieu non sûr : risque de vol nocturne (évité par la discrétion).
  if (!loc.rest.safe && h >= 6 && ctx.rng.d100() > 60 + stats.discretion * 2) {
    const lost = Math.min(player.gold, ctx.rng.int(3, 15));
    player.gold -= lost;
    if (lost) ctx.say(`À votre réveil, votre bourse est plus légère de ${lost} po...`, 'warning', player.id);
  } else {
    ctx.say(`Vous vous reposez ${h} h${cost ? ` (${cost} po)` : ''}.`, 'info', player.id);
  }
}
