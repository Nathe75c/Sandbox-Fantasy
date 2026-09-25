/**
 * Construit l'état initial du MONDE à partir du contenu statique.
 * Aucun joueur n'existe encore : il est ajouté par l'action `create_character`.
 * En multijoueur, c'est le serveur qui exécutera cette fonction une seule fois par monde.
 */
import { CONTENT } from '@/data';
import type { GameState, LocationState, NpcState, ShopState } from '@/types';
import { createRng } from '../systems/rng';
import { stockTarget } from '../systems/economy';

export const SCHEMA_VERSION = 1;
export const LOCAL_PLAYER_ID = 'player_local';

export function createInitialState(seed: number, now = new Date().toISOString()): GameState {
  const rng = createRng(seed);
  const locations: Record<string, LocationState> = {};
  const shops: Record<string, ShopState> = {};

  for (const def of CONTENT.lists.locations) {
    locations[def.id] = {
      id: def.id,
      prosperity: def.base.prosperity,
      danger: def.base.danger,
      security: def.base.security,
      population: def.base.population,
      resources: Object.fromEntries(def.gatherables.map((g) => [g.itemId, g.stock])),
      priceIndex: {},
      groundItems: [],
    };
    for (const shop of def.shops) {
      shops[shop.id] = {
        id: shop.id,
        locationId: def.id,
        ownerNpcId: shop.ownerNpcId,
        gold: shop.startingGold,
        stock: Object.fromEntries(shop.sells.map((itemId) => [itemId, Math.max(1, stockTarget(itemId) - rng.int(0, 2))])),
      };
    }
  }

  const npcs: Record<string, NpcState> = {};
  for (const def of CONTENT.lists.npcs) {
    npcs[def.id] = {
      id: def.id,
      locationId: def.homeLocationId,
      gold: def.possessions.gold,
      alive: true,
      opinions: {},
      memories: [],
      mood: 0,
      jobId: def.jobId,
      fulfilledWants: [],
      lastTalk: {},
    };
  }

  const factions = Object.fromEntries(
    CONTENT.lists.factions.map((f) => [f.id, { id: f.id, influence: f.baseInfluence, relations: { ...f.relations } }]),
  );

  const state: GameState = {
    meta: { schemaVersion: SCHEMA_VERSION, worldId: `world_${seed.toString(36)}`, seed, rngState: 0, nextId: 1, createdAt: now },
    world: {
      time: { day: 1, hour: 8 },
      locations,
      npcs,
      shops,
      factions,
      creatures: {},
      activeEvents: [],
      rumors: [],
    },
    players: {},
    eventLog: [],
  };

  // Peuple le monde de quelques créatures de départ.
  for (const def of CONTENT.lists.locations) {
    for (const spawn of def.creatureSpawns) {
      const creature = CONTENT.creatures[spawn.creatureId];
      if (!creature || creature.legendary || !rng.chance(0.4)) continue;
      const uid = `cre_init_${def.id}_${spawn.creatureId}`;
      state.world.creatures[uid] = { uid, creatureId: spawn.creatureId, locationId: def.id, hp: creature.stats.hp, spawnedDay: 1 };
    }
  }

  state.meta.rngState = rng.state();
  return state;
}
