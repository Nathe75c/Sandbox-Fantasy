/**
 * Combat au tour par tour, simple et lisible :
 * le joueur attaque (normal ou puissant), boit une potion ou fuit ; la créature riposte.
 * Les faiblesses / résistances des créatures rendent l'équipement et la préparation utiles.
 */
import { CONTENT } from '@/data';
import { SAFE_WAKE_LOCATION as SAFE_WAKE } from '@/data/locations';
import type { CreatureInstance, PlayerState } from '@/types';
import type { Ctx } from '../actions/context';
import { clamp } from './math';
import { roll } from './checks';
import { addItem } from './inventory';
import { armorValue, effectiveStats, maxHp, weaponBonus } from '../state/selectors';
import { changeFactionReputation } from './reputation';
import { gainJobXp, gainPlayerXp, learnJob } from './jobs';
import { changeLocation } from './worldEvents';
import { witnesses, addMemory } from './npcMemory';

export function hitChance(attackerAgi: number, defenderAgi: number, base = 60) {
  return clamp(base + (attackerAgi - defenderAgi) * 4, 15, 95);
}

export function startCombat(ctx: Ctx, player: PlayerState, creature: CreatureInstance, ambush: boolean) {
  const def = CONTENT.creatures[creature.creatureId];
  player.combat = { creatureUid: creature.uid, locationId: creature.locationId, round: 0, log: [] };
  ctx.emit({ type: 'combat_started', actorId: player.id, data: { uid: creature.uid, creatureId: creature.creatureId, ambush } });
  log(ctx, player, ambush ? `Embuscade ! ${def.name} vous attaque.` : `Vous engagez le combat contre ${def.name}.`);
  if (ambush) creatureStrikes(ctx, player, creature);
}

function log(ctx: Ctx, player: PlayerState, text: string) {
  if (!player.combat) return;
  player.combat.log.push(text);
  if (player.combat.log.length > 12) player.combat.log.shift();
  ctx.emit({ type: 'combat_round', actorId: player.id, data: { uid: player.combat.creatureUid, text } });
}

/** Tour du joueur. Renvoie true si le combat est terminé. */
export function playerAttack(ctx: Ctx, player: PlayerState, power: boolean) {
  const creature = currentCreature(ctx, player);
  const def = CONTENT.creatures[creature.creatureId];
  const stats = effectiveStats(player, ctx.state.world.time);
  const weapon = weaponBonus(player);
  player.combat!.round += 1;
  if (power) player.energy = Math.max(0, player.energy - 1);

  const chance = hitChance(stats.agilite, def.stats.agility) - (power ? 15 : 0);
  const r = roll(ctx.rng, chance, stats.chance);
  if (!r.success) {
    log(ctx, player, `Vous manquez ${def.name}.`);
  } else {
    let dmg = 2 + Math.floor(stats.force / 2) + weapon.damage + ctx.rng.int(0, 3);
    let note = '';
    if (weapon.tags.some((t) => def.weaknesses.includes(t as never))) {
      dmg *= 1.5;
      note = ' (point faible !)';
    } else if (weapon.tags.some((t) => def.resistances.includes(t as never))) {
      dmg *= 0.5;
      note = ' (il résiste)';
    }
    if (power) dmg *= 1.5;
    dmg = Math.max(1, Math.round(dmg - def.stats.defense / 2));
    if (r.critical) {
      dmg *= 2;
      note += ' Coup critique !';
    }
    creature.hp -= dmg;
    log(ctx, player, `Vous frappez ${def.name} : ${dmg} dégâts.${note}`);
  }
  if (creature.hp <= 0) {
    victory(ctx, player, creature);
    return true;
  }
  return creatureStrikes(ctx, player, creature);
}

/** Riposte de la créature. Renvoie true si le joueur est vaincu. */
export function creatureStrikes(ctx: Ctx, player: PlayerState, creature: CreatureInstance) {
  const def = CONTENT.creatures[creature.creatureId];
  const stats = effectiveStats(player, ctx.state.world.time);
  const chance = clamp(55 + (def.stats.agility - stats.agilite) * 4, 10, 90);
  if (ctx.rng.d100() > chance) {
    log(ctx, player, `Vous esquivez l’attaque de ${def.name}.`);
    return false;
  }
  const dmg = Math.max(1, def.stats.attack + ctx.rng.int(0, 3) - armorValue(player) - Math.floor(stats.vitalite / 4));
  player.hp -= dmg;
  log(ctx, player, `${def.name} vous inflige ${dmg} dégâts.`);
  if (player.hp <= 0) {
    defeat(ctx, player, creature);
    return true;
  }
  return false;
}

export function fleeChance(player: PlayerState, creature: CreatureInstance, ctx: Ctx) {
  const def = CONTENT.creatures[creature.creatureId];
  const stats = effectiveStats(player, ctx.state.world.time);
  return clamp(40 + (stats.agilite - def.stats.agility) * 5 + stats.discretion * 2, 10, 95);
}

export function tryFlee(ctx: Ctx, player: PlayerState) {
  const creature = currentCreature(ctx, player);
  const success = ctx.rng.d100() <= fleeChance(player, creature, ctx);
  ctx.emit({ type: 'combat_fled', actorId: player.id, data: { uid: creature.uid, success } });
  if (success) {
    ctx.say('Vous prenez la fuite.', 'warning', player.id);
    player.combat = undefined;
    return true;
  }
  log(ctx, player, 'Vous n’arrivez pas à fuir !');
  return creatureStrikes(ctx, player, creature);
}

export function currentCreature(ctx: Ctx, player: PlayerState): CreatureInstance {
  const uid = player.combat?.creatureUid;
  const creature = uid ? ctx.state.world.creatures[uid] : undefined;
  if (!creature) {
    player.combat = undefined;
    throw new Error('Plus de combat en cours');
  }
  return creature;
}

function victory(ctx: Ctx, player: PlayerState, creature: CreatureInstance) {
  const def = CONTENT.creatures[creature.creatureId];
  const stats = effectiveStats(player, ctx.state.world.time);
  const loot: string[] = [];
  for (const drop of def.drops) {
    if (!ctx.rng.chance(Math.min(1, drop.chance + stats.chance * 0.01))) continue;
    const qty = ctx.rng.int(drop.min, drop.max);
    addItem(player, drop.itemId, qty);
    loot.push(`${qty} × ${CONTENT.items[drop.itemId]?.name ?? drop.itemId}`);
  }
  if (def.gold) {
    const gold = ctx.rng.int(def.gold[0], def.gold[1]);
    player.gold += gold;
    loot.push(`${gold} po`);
  }
  delete ctx.state.world.creatures[creature.uid];
  player.combat = undefined;
  ctx.emit({ type: 'creature_defeated', actorId: player.id, data: { uid: creature.uid, creatureId: def.id, locationId: creature.locationId } });
  ctx.say(`${def.name} est vaincu.${loot.length ? ` Butin : ${loot.join(', ')}.` : ''}`, 'success', player.id);

  // Conséquences : réputation, danger local, métiers, mémoire des témoins.
  for (const [factionId, delta] of Object.entries(def.reputationOnKill ?? {})) changeFactionReputation(ctx, player, factionId, delta ?? 0, `${def.name} tué`);
  changeLocation(ctx, creature.locationId, 'danger', -2);
  const jobId = def.type === 'bete_sauvage' ? 'chasseur' : 'mercenaire';
  if (jobId === 'chasseur') learnJob(ctx, player, 'chasseur');
  gainJobXp(ctx, player, jobId, def.xp);
  if (!player.jobs[jobId]) gainPlayerXp(ctx, player, Math.ceil(def.xp / 2));
  if (def.type !== 'bete_sauvage' || def.behavior === 'predateur') {
    for (const npc of witnesses(ctx, creature.locationId)) {
      if (def.behavior === 'neutre' || def.behavior === 'fuyant') addMemory(ctx, npc.id, player, 'creature_tuee', -4, `Il a tué ${def.name}, qui ne faisait de mal à personne.`, { lasting: false });
      else addMemory(ctx, npc.id, player, 'protection', 6, `Il nous a débarrassés de ${def.name}.`, { lasting: false });
    }
  }
}

function defeat(ctx: Ctx, player: PlayerState, creature: CreatureInstance) {
  const def = CONTENT.creatures[creature.creatureId];
  const goldLost = Math.floor(player.gold * 0.2);
  player.gold -= goldLost;
  player.combat = undefined;
  const from = player.locationId;
  player.locationId = SAFE_WAKE;
  player.hp = Math.max(1, Math.round(maxHp(effectiveStats(player)) * 0.3));
  player.energy = 2;
  ctx.emit({ type: 'player_defeated', actorId: player.id, data: { locationId: from, goldLost, wakeAt: SAFE_WAKE } });
  ctx.say(`${def.name} vous terrasse. Vous vous réveillez au Temple de l’Aube, soigné par les sœurs${goldLost ? `, délesté de ${goldLost} po` : ''}.`, 'danger', player.id);
}
