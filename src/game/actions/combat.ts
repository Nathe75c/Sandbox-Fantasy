import { CONTENT } from '@/data';
import type { GameAction, PlayerState } from '@/types';
import { fail, type Ctx } from './context';
import { requireFree } from './helpers';
import { effectiveStats } from '../state/selectors';
import { playerAttack, startCombat, tryFlee } from '../systems/combat';
import { checkChance, roll } from '../systems/checks';
import { advanceTime } from '../systems/time';
import { addMemory, witnesses } from '../systems/npcMemory';
import { changeFactionReputation } from '../systems/reputation';

type P<T extends GameAction['type']> = Extract<GameAction, { type: T }>['payload'];

function creatureHere(ctx: Ctx, player: PlayerState, uid: string) {
  const creature = ctx.state.world.creatures[uid];
  if (!creature || creature.locationId !== player.locationId) fail('Cette créature n’est plus là.');
  return creature;
}

/** Après une défaite, le joueur a perdu du temps (soins au Temple). */
function afterRound(ctx: Ctx) {
  if (ctx.events.some((e) => e.type === 'player_defeated')) advanceTime(ctx, 8);
}

export function engage(ctx: Ctx, player: PlayerState, { creatureUid }: P<'engage'>) {
  requireFree(player);
  const creature = creatureHere(ctx, player, creatureUid);
  const def = CONTENT.creatures[creature.creatureId];
  // Attaquer une créature pacifique ou neutre peut choquer les témoins.
  if (def.behavior === 'neutre' || def.behavior === 'pacifique') {
    for (const w of witnesses(ctx, player.locationId)) addMemory(ctx, w.id, player, 'creature_tuee', -5, `A attaqué ${def.name} sans raison.`, { lasting: false });
    if (def.reputationOnKill) for (const [f, d] of Object.entries(def.reputationOnKill)) if ((d ?? 0) < 0) changeFactionReputation(ctx, player, f, -1, `Agression de ${def.name}`);
  }
  startCombat(ctx, player, creature, false);
}

export function combatAttack(ctx: Ctx, player: PlayerState, { power }: P<'combat_attack'>) {
  if (!player.combat) fail('Aucun combat en cours.');
  playerAttack(ctx, player, !!power);
  afterRound(ctx);
}

export function combatFlee(ctx: Ctx, player: PlayerState) {
  if (!player.combat) fail('Aucun combat en cours.');
  tryFlee(ctx, player);
  afterRound(ctx);
}

/** Éviter une créature (discrétion) : réussite = rien ne se passe, échec = elle vous attaque. */
export function sneakPast(ctx: Ctx, player: PlayerState, { creatureUid }: P<'sneak_past'>) {
  requireFree(player);
  const creature = creatureHere(ctx, player, creatureUid);
  const def = CONTENT.creatures[creature.creatureId];
  const stats = effectiveStats(player, ctx.state.world.time);
  const r = roll(ctx.rng, checkChance(stats.discretion, def.danger * 8), stats.chance);
  if (r.success) {
    player.counters[`sneak:${creature.uid}`] = ctx.state.world.time.day;
    ctx.say(`Vous vous faufilez sans que ${def.name} ne vous remarque. (${r.chance} %)`, 'success', player.id);
    return;
  }
  ctx.say(`${def.name} vous a repéré ! (${r.chance} %)`, 'danger', player.id);
  startCombat(ctx, player, creature, true);
  afterRound(ctx);
}
