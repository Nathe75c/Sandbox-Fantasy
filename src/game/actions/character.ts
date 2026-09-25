import { CONTENT } from '@/data';
import type { GameAction, PlayerState } from '@/types';
import { fail, type Ctx } from './context';
import { computeBaseStats, rollStartLocation, validateCharacter } from '../systems/character';
import { effectiveStats, maxEnergy, maxHp } from '../state/selectors';
import { addItem } from '../systems/inventory';
import { getOpinion } from '../systems/npcMemory';
import { STAT_MAX } from '@/data/stats';

type P<T extends GameAction['type']> = Extract<GameAction, { type: T }>['payload'];

export function createCharacter(ctx: Ctx, playerId: string, payload: P<'create_character'>) {
  if (ctx.state.players[playerId]) fail('Ce personnage existe déjà.');
  const error = validateCharacter(payload.name, payload);
  if (error) fail(error);
  const origin = CONTENT.origins[payload.originId];
  const baseStats = computeBaseStats(payload);
  const locationId = rollStartLocation(ctx.rng, origin.id, baseStats.chance);

  const player: PlayerState = {
    id: playerId,
    name: payload.name.trim(),
    raceId: payload.raceId,
    originId: payload.originId,
    traitIds: [...payload.traitIds],
    baseStats,
    hp: 0,
    energy: 0,
    gold: origin.startingGold,
    locationId,
    inventory: [],
    equipment: {},
    jobs: Object.fromEntries(origin.startingJobs.map((j) => [j, { level: 1, xp: 0 }])),
    localReputation: {},
    factionReputation: { ...origin.startingReputation },
    notoriety: 0,
    ownedShopIds: [],
    buffs: [],
    counters: {},
    statPoints: 0,
    level: 1,
    xp: 0,
    alive: true,
  };
  for (const { itemId, qty } of origin.startingItems) addItem(player, itemId, qty);
  // Équipe automatiquement le meilleur de chaque emplacement.
  for (const entry of player.inventory) {
    const def = CONTENT.items[entry.itemId];
    if (def?.slot && def.slot !== 'outil' && !player.equipment[def.slot]) player.equipment[def.slot] = def.id;
  }
  const stats = effectiveStats(player);
  player.hp = maxHp(stats);
  player.energy = maxEnergy(stats);
  ctx.state.players[playerId] = player;

  // Les PNJ se font une première idée du joueur (origine, traits, race).
  for (const npcId of Object.keys(ctx.state.world.npcs)) getOpinion(ctx.state, npcId, player);

  ctx.emit({ type: 'player_created', actorId: playerId, data: { name: player.name, locationId } });
  const loc = CONTENT.locations[locationId];
  ctx.say(`${player.name} ouvre les yeux : ${loc.name}. ${loc.description}`, 'info', playerId);
}

export function spendStatPoint(ctx: Ctx, player: PlayerState, payload: P<'spend_stat_point'>) {
  if (player.statPoints <= 0) fail('Aucun point à répartir.');
  if (player.baseStats[payload.stat] >= STAT_MAX) fail('Cette statistique est déjà au maximum.');
  player.baseStats[payload.stat] += 1;
  player.statPoints -= 1;
  ctx.say(`${CONTENT.stats[payload.stat].name} augmente à ${player.baseStats[payload.stat]}.`, 'success', player.id);
}
