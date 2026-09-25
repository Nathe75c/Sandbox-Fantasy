/**
 * Registre du contenu statique.
 *
 * Point d'entrée UNIQUE pour lire le contenu : les systèmes n'importent jamais
 * directement les tableaux, mais passent par ces index (recherche O(1) par id).
 * Plus tard, ce registre pourra être rempli depuis un serveur ou des fichiers JSON
 * (mods, extensions) sans toucher aux systèmes.
 */
import type {
  CreatureDef,
  FactionDef,
  ItemDef,
  JobDef,
  LocationDef,
  NpcDef,
  OriginDef,
  RaceDef,
  RecipeDef,
  ShopDef,
  StatDef,
  TraitDef,
  WorldEventDef,
} from '@/types';
import { STATS } from './stats';
import { ORIGINS, TRAITS } from './traits';
import { JOBS } from './jobs';
import { ITEMS } from './items';
import { RECIPES } from './recipes';
import { NPCS } from './npcs';
import { RACES } from './races';
import { CREATURES } from './creatures';
import { LOCATIONS } from './locations';
import { WORLD_EVENTS } from './events';
import { FACTIONS } from './factions';

function indexById<T extends { id: string }>(list: T[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const entry of list) out[entry.id] = entry;
  return out;
}

export interface ContentRegistry {
  stats: Record<string, StatDef>;
  traits: Record<string, TraitDef>;
  origins: Record<string, OriginDef>;
  jobs: Record<string, JobDef>;
  items: Record<string, ItemDef>;
  recipes: Record<string, RecipeDef>;
  npcs: Record<string, NpcDef>;
  races: Record<string, RaceDef>;
  creatures: Record<string, CreatureDef>;
  locations: Record<string, LocationDef>;
  worldEvents: Record<string, WorldEventDef>;
  factions: Record<string, FactionDef>;
  shops: Record<string, ShopDef & { locationId: string }>;
  lists: {
    stats: StatDef[];
    traits: TraitDef[];
    origins: OriginDef[];
    jobs: JobDef[];
    items: ItemDef[];
    recipes: RecipeDef[];
    npcs: NpcDef[];
    races: RaceDef[];
    creatures: CreatureDef[];
    locations: LocationDef[];
    worldEvents: WorldEventDef[];
    factions: FactionDef[];
  };
}

function buildShops(locations: LocationDef[]) {
  const shops: Record<string, ShopDef & { locationId: string }> = {};
  for (const loc of locations) for (const shop of loc.shops) shops[shop.id] = { ...shop, locationId: loc.id };
  return shops;
}

export const CONTENT: ContentRegistry = {
  stats: indexById(STATS),
  traits: indexById(TRAITS),
  origins: indexById(ORIGINS),
  jobs: indexById(JOBS),
  items: indexById(ITEMS),
  recipes: indexById(RECIPES),
  npcs: indexById(NPCS),
  races: indexById(RACES),
  creatures: indexById(CREATURES),
  locations: indexById(LOCATIONS),
  worldEvents: indexById(WORLD_EVENTS),
  factions: indexById(FACTIONS),
  shops: buildShops(LOCATIONS),
  lists: {
    stats: STATS,
    traits: TRAITS,
    origins: ORIGINS,
    jobs: JOBS,
    items: ITEMS,
    recipes: RECIPES,
    npcs: NPCS,
    races: RACES,
    creatures: CREATURES,
    locations: LOCATIONS,
    worldEvents: WORLD_EVENTS,
    factions: FACTIONS,
  },
};

/**
 * Relations d'un item DÉRIVÉES des recettes (source unique de vérité) :
 * - producedBy : recettes qui le fabriquent (et donc ses composants) ;
 * - usedIn : recettes qui le consomment (objets qu'il permet de fabriquer) ;
 * - toolFor : recettes où il sert d'outil ;
 * - droppedBy : créatures qui le laissent tomber ;
 * - gatheredAt : lieux où on le récolte ;
 * - soldAt : boutiques qui le vendent.
 */
export interface ItemUsage {
  producedBy: RecipeDef[];
  usedIn: RecipeDef[];
  toolFor: RecipeDef[];
  droppedBy: CreatureDef[];
  gatheredAt: LocationDef[];
  soldAt: (ShopDef & { locationId: string })[];
}

const usageCache: Record<string, ItemUsage> = {};

export function itemUsage(itemId: string): ItemUsage {
  const cached = usageCache[itemId];
  if (cached) return cached;
  const usage: ItemUsage = {
    producedBy: RECIPES.filter((r) => r.outputs.some((o) => o.itemId === itemId)),
    usedIn: RECIPES.filter((r) => r.inputs.some((i) => i.itemId === itemId)),
    toolFor: RECIPES.filter((r) => r.tools.includes(itemId)),
    droppedBy: CREATURES.filter((c) => c.drops.some((d) => d.itemId === itemId)),
    gatheredAt: LOCATIONS.filter((l) => l.gatherables.some((g) => g.itemId === itemId)),
    soldAt: Object.values(CONTENT.shops).filter((s) => s.sells.includes(itemId)),
  };
  usageCache[itemId] = usage;
  return usage;
}

export function getItem(id: string): ItemDef {
  const item = CONTENT.items[id];
  if (!item) throw new Error(`Item inconnu : ${id}`);
  return item;
}
