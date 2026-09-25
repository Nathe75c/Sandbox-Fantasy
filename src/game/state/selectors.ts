/**
 * Sélecteurs : lectures DÉRIVÉES de l'état (jamais stockées, toujours recalculées).
 * Utilisés par les systèmes ET par l'interface.
 */
import { CONTENT } from '@/data';
import { STAT_IDS } from '@/data/stats';
import type { GameState, GameTime, InventoryEntry, OpinionTier, PlayerState, Stats } from '@/types';
import { clamp } from '../systems/math';

export const EFFECTIVE_STAT_MAX = 25;

export function getPlayer(state: GameState, playerId: string): PlayerState {
  const player = state.players[playerId];
  if (!player) throw new Error(`Joueur inconnu : ${playerId}`);
  return player;
}

export function timeValue(t: { day: number; hour: number }) {
  return t.day * 24 + t.hour;
}

/** Bonus passifs de l'équipement (effets `buff` avec hours = 0). */
export function equipmentBonuses(player: PlayerState): Partial<Stats> {
  const out: Partial<Stats> = {};
  for (const itemId of Object.values(player.equipment)) {
    if (!itemId) continue;
    for (const e of CONTENT.items[itemId]?.effects ?? []) {
      if (e.type === 'buff' && e.hours === 0) out[e.stat] = (out[e.stat] ?? 0) + e.amount;
    }
  }
  return out;
}

export function effectiveStats(player: PlayerState, time?: GameTime): Stats {
  const equip = equipmentBonuses(player);
  const now = time ? timeValue(time) : Infinity;
  const stats = {} as Stats;
  for (const id of STAT_IDS) {
    const buffs = player.buffs
      .filter((b) => b.stat === id && (time === undefined || timeValue({ day: b.untilDay, hour: b.untilHour }) > now))
      .reduce((sum, b) => sum + b.amount, 0);
    stats[id] = clamp(player.baseStats[id] + (equip[id] ?? 0) + buffs, 1, EFFECTIVE_STAT_MAX);
  }
  return stats;
}

export const maxHp = (s: Stats) => 30 + s.vitalite * 5;
export const maxEnergy = (s: Stats) => 10 + s.vitalite + s.volonte;
export const carryCapacity = (s: Stats) => 40 + s.force * 4;

export function inventoryWeight(inventory: InventoryEntry[]): number {
  return Math.round(inventory.reduce((sum, e) => sum + (CONTENT.items[e.itemId]?.weight ?? 0) * e.qty, 0) * 10) / 10;
}

export function countItem(player: PlayerState, itemId: string, stolen?: boolean): number {
  return player.inventory
    .filter((e) => e.itemId === itemId && (stolen === undefined || !!e.stolen === stolen))
    .reduce((sum, e) => sum + e.qty, 0);
}

export function weaponBonus(player: PlayerState): { damage: number; tags: string[] } {
  let damage = 0;
  const tags: string[] = [];
  for (const slot of ['arme', 'bijou'] as const) {
    const id = player.equipment[slot];
    if (!id) continue;
    const def = CONTENT.items[id];
    for (const e of def?.effects ?? []) if (e.type === 'damage_bonus') damage += e.amount;
    if (slot === 'arme') tags.push(...(def?.tags ?? []));
  }
  return { damage, tags: tags.length ? tags : ['contondant'] };
}

export function armorValue(player: PlayerState): number {
  let armor = 0;
  for (const id of Object.values(player.equipment)) {
    for (const e of (id && CONTENT.items[id]?.effects) || []) if (e.type === 'armor') armor += e.amount;
  }
  return armor;
}

/** Tags du joueur lus par les PNJ et les dialogues : origine, traits, race, métiers. */
export function playerTags(player: PlayerState): string[] {
  const tags = new Set<string>();
  CONTENT.origins[player.originId]?.tags.forEach((t) => tags.add(t));
  for (const t of player.traitIds) CONTENT.traits[t]?.tags.forEach((x) => tags.add(x));
  tags.add(`race:${player.raceId}`);
  for (const [jobId, p] of Object.entries(player.jobs)) if (p && p.level > 0) tags.add(`job:${jobId}`);
  if (player.gold >= 300) tags.add('riche');
  if (player.notoriety >= 30) tags.add('criminel');
  return [...tags];
}

export function jobLevel(player: PlayerState, jobId: string): number {
  return player.jobs[jobId]?.level ?? 0;
}

/** Bonus de métier cumulé (traits + origine), ex. 0.2 = +20 %. */
export function jobBonus(player: PlayerState, jobId: string): number {
  let bonus = CONTENT.origins[player.originId]?.jobBonuses?.[jobId] ?? 0;
  for (const t of player.traitIds) bonus += CONTENT.traits[t]?.jobBonuses?.[jobId] ?? 0;
  return bonus;
}

export function opinionTier(value: number): OpinionTier {
  if (value < -50) return 'hostile';
  if (value < -15) return 'mefiant';
  if (value < 15) return 'neutre';
  if (value < 50) return 'amical';
  return 'allie';
}

export const OPINION_LABEL: Record<OpinionTier, string> = {
  hostile: 'Hostile',
  mefiant: 'Méfiant',
  neutre: 'Neutre',
  amical: 'Amical',
  allie: 'Allié',
};

export function reputationLabel(value: number): string {
  if (value <= -50) return 'Haï';
  if (value <= -15) return 'Mal vu';
  if (value < 15) return 'Neutre';
  if (value < 50) return 'Apprécié';
  return 'Honoré';
}

export function npcsAt(state: GameState, locationId: string) {
  return Object.values(state.world.npcs).filter((n) => n.alive && n.locationId === locationId);
}

export function creaturesAt(state: GameState, locationId: string) {
  return Object.values(state.world.creatures).filter((c) => c.locationId === locationId);
}

/** Lieux « sous-lieux » (taverne, quartier) et parent sont reliés sans coût. */
export function connectionsOf(locationId: string) {
  return CONTENT.locations[locationId]?.connections ?? [];
}

export function formatTime(t: GameTime) {
  return `Jour ${t.day}, ${String(t.hour).padStart(2, '0')}h`;
}
