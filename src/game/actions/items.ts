import { CONTENT } from '@/data';
import type { GameAction, PlayerState } from '@/types';
import { fail, type Ctx } from './context';
import { clampVitals, itemName } from './helpers';
import { countItem, effectiveStats, maxEnergy, maxHp } from '../state/selectors';
import { addItem, removeItem } from '../systems/inventory';
import { learnJob, gainJobXp } from '../systems/jobs';
import { changeNotoriety, changeFactionReputation } from '../systems/reputation';
import { creatureStrikes, currentCreature } from '../systems/combat';
import { advanceTime } from '../systems/time';

type P<T extends GameAction['type']> = Extract<GameAction, { type: T }>['payload'];

export function useItem(ctx: Ctx, player: PlayerState, { itemId }: P<'use_item'>) {
  if (!player.alive) fail('Impossible.');
  const def = CONTENT.items[itemId];
  if (!def || countItem(player, itemId) <= 0) fail('Vous n’avez pas cet objet.');
  if (!def.consumable || !def.effects?.length) fail(`${def.name} ne s’utilise pas ainsi.`);
  const stats = effectiveStats(player, ctx.state.world.time);
  const parts: string[] = [];
  for (const e of def.effects) {
    switch (e.type) {
      case 'heal':
        player.hp = Math.min(maxHp(stats), player.hp + e.amount);
        parts.push(`+${e.amount} PV`);
        break;
      case 'energy':
        player.energy = Math.min(maxEnergy(stats), player.energy + e.amount);
        parts.push(`+${e.amount} énergie`);
        break;
      case 'buff': {
        if (e.hours <= 0) break;
        const t = ctx.state.world.time;
        const end = t.day * 24 + t.hour + e.hours;
        player.buffs = player.buffs.filter((b) => b.stat !== e.stat || b.untilDay * 24 + b.untilHour > t.day * 24 + t.hour);
        player.buffs.push({ stat: e.stat, amount: e.amount, untilDay: Math.floor(end / 24), untilHour: end % 24 });
        parts.push(`${CONTENT.stats[e.stat].name} +${e.amount} (${e.hours} h)`);
        break;
      }
      case 'cure':
        parts.push('soigné des poisons');
        break;
      case 'unlock': {
        if (e.key.startsWith('job:')) {
          const jobId = e.key.slice(4);
          if (!learnJob(ctx, player, jobId, undefined)) gainJobXp(ctx, player, jobId, 40);
          parts.push(`métier : ${CONTENT.jobs[jobId]?.name}`);
        } else if (e.key.startsWith('notoriety:')) {
          changeNotoriety(ctx, player, Number(e.key.split(':')[1]));
          parts.push('notoriété réduite');
        }
        break;
      }
      default:
        break;
    }
  }
  removeItem(player, itemId, 1);
  if (def.illegal && def.category === 'potion' && itemId === 'potion_noire') changeFactionReputation(ctx, player, 'temple_aube', -5, 'Usage de magie noire');
  ctx.emit({ type: 'item_used', actorId: player.id, data: { itemId } });
  ctx.say(`Vous utilisez ${def.name} : ${parts.join(', ') || 'rien ne se passe'}.`, 'success', player.id);
  // En combat, utiliser un objet coûte le tour.
  if (player.combat) {
    creatureStrikes(ctx, player, currentCreature(ctx, player));
    if (ctx.events.some((e) => e.type === 'player_defeated')) advanceTime(ctx, 8);
  }
  clampVitals(ctx, player);
}

export function equip(ctx: Ctx, player: PlayerState, { itemId }: P<'equip'>) {
  const def = CONTENT.items[itemId];
  if (!def?.slot || def.slot === 'outil') fail('Cet objet ne s’équipe pas (les outils servent depuis le sac).');
  if (countItem(player, itemId) <= 0) fail('Vous n’avez pas cet objet.');
  const slot = def.slot;
  const stats = effectiveStats(player, ctx.state.world.time);
  for (const [stat, min] of Object.entries(def.requirements?.stats ?? {}))
    if (stats[stat as keyof typeof stats] < (min ?? 0)) fail(`${CONTENT.stats[stat]?.name} ${min} requise pour ${def.name}.`);
  if (player.equipment[slot] === itemId) delete player.equipment[slot];
  else player.equipment[slot] = itemId;
  clampVitals(ctx, player);
  ctx.emit({ type: 'item_equipped', actorId: player.id, data: { itemId } });
  ctx.say(player.equipment[slot] ? `Vous équipez ${def.name}.` : `Vous retirez ${def.name}.`, 'info', player.id);
}

export function dropItem(ctx: Ctx, player: PlayerState, { itemId, qty }: P<'drop_item'>) {
  if (player.combat) fail('Pas en plein combat !');
  const n = Math.max(1, Math.floor(qty));
  if (countItem(player, itemId) < n) fail('Vous n’avez pas cette quantité.');
  removeItem(player, itemId, n);
  const loc = ctx.state.world.locations[player.locationId];
  loc.groundItems.push({ itemId, qty: n, droppedBy: player.id });
  if (loc.groundItems.length > 30) loc.groundItems.shift();
  ctx.emit({ type: 'item_dropped', actorId: player.id, data: { itemId, qty: n, locationId: player.locationId } });
  ctx.say(`Vous déposez ${n} × ${itemName(itemId)}.`, 'info', player.id);
}

export function pickUp(ctx: Ctx, player: PlayerState, { index }: P<'pick_up'>) {
  if (player.combat) fail('Pas en plein combat !');
  const loc = ctx.state.world.locations[player.locationId];
  const entry = loc.groundItems[index];
  if (!entry) fail('Il n’y a plus rien ici.');
  loc.groundItems.splice(index, 1);
  addItem(player, entry.itemId, entry.qty);
  ctx.emit({ type: 'item_picked_up', actorId: player.id, data: { itemId: entry.itemId, qty: entry.qty, locationId: player.locationId } });
  ctx.say(`Vous ramassez ${entry.qty} × ${itemName(entry.itemId)}.`, 'info', player.id);
}
