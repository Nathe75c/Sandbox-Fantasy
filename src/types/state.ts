/**
 * ÉTAT DYNAMIQUE : tout ce qui change pendant une partie.
 *
 * Contraintes (préparation multijoueur) :
 * - 100 % sérialisable en JSON : pas de classes, pas de Map/Set, pas de fonctions.
 * - Tout est indexé par identifiant unique (Record<Id, ...>), jamais par position
 *   dans un tableau, pour permettre des mises à jour partielles (patchs réseau).
 * - Les joueurs sont stockés dans `players` (plusieurs joueurs possibles) ;
 *   le client local connaît seulement `localPlayerId`.
 * - Le monde (`world`) est partagé ; il ne contient aucune donnée propre au client.
 */
import type {
  CreatureId,
  FactionId,
  ItemId,
  JobId,
  LocationId,
  NpcId,
  OriginId,
  RaceId,
  ShopId,
  StatId,
  Stats,
  TraitId,
  WorldEventId,
} from './content';
import type { GameEvent } from './events';

export type PlayerId = string;
export type EntityUid = string;

export interface GameTime {
  day: number;
  /** Heure 0..23 */
  hour: number;
}

// ---------------------------------------------------------------------------
// Joueur
// ---------------------------------------------------------------------------
export interface InventoryEntry {
  itemId: ItemId;
  qty: number;
  /** Objets volés : ne se revendent qu'à un receleur sans risque. */
  stolen?: boolean;
}

export interface JobProgress {
  level: number;
  xp: number;
}

export interface ActiveBuff {
  stat: StatId;
  amount: number;
  untilDay: number;
  untilHour: number;
}

export interface CombatState {
  creatureUid: EntityUid;
  locationId: LocationId;
  round: number;
  log: string[];
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  raceId: RaceId;
  originId: OriginId;
  traitIds: TraitId[];
  /** Statistiques de base (création + progression). Les bonus d'équipement/buffs sont calculés. */
  baseStats: Stats;
  hp: number;
  energy: number;
  gold: number;
  locationId: LocationId;
  inventory: InventoryEntry[];
  equipment: { arme?: ItemId; armure?: ItemId; bijou?: ItemId };
  jobs: Partial<Record<JobId, JobProgress>>;
  /** Réputation locale par lieu (-100..100). */
  localReputation: Partial<Record<LocationId, number>>;
  /** Réputation par faction (-100..100). */
  factionReputation: Partial<Record<FactionId, number>>;
  /** Faction rejointe. */
  factionId?: FactionId;
  /** Notoriété criminelle (0..100) : les gardes réagissent au-delà de 30. */
  notoriety: number;
  ownedShopIds: ShopId[];
  buffs: ActiveBuff[];
  combat?: CombatState;
  /** Compteurs de progression (succès, statistiques de jeu). */
  counters: Record<string, number>;
  /** Points de statistiques à répartir (gagnés en progressant). */
  statPoints: number;
  level: number;
  xp: number;
  alive: boolean;
}

// ---------------------------------------------------------------------------
// Monde
// ---------------------------------------------------------------------------
export interface CreatureInstance {
  uid: EntityUid;
  creatureId: CreatureId;
  locationId: LocationId;
  hp: number;
  spawnedDay: number;
}

export type MemoryKind =
  | 'aide'
  | 'vol'
  | 'vol_boutique'
  | 'trahison'
  | 'protection'
  | 'insulte'
  | 'sauvetage'
  | 'arnaque'
  | 'commerce'
  | 'menace'
  | 'generosite'
  | 'attaque_faction'
  | 'aide_ville'
  | 'creature_tuee'
  | 'creature_protegee'
  | 'flatterie'
  | 'rencontre';

export interface NpcMemory {
  id: string;
  kind: MemoryKind;
  playerId: PlayerId;
  day: number;
  /** Impact sur l'opinion au moment du souvenir. */
  impact: number;
  text: string;
  /** Souvenir marquant : ne s'efface pas, peut provoquer vengeance/récompense. */
  lasting?: boolean;
  /** Ouï-dire (appris d'un autre PNJ) plutôt que vécu. */
  hearsay?: boolean;
}

export interface NpcState {
  id: NpcId;
  locationId: LocationId;
  gold: number;
  alive: boolean;
  /** Opinion de chaque joueur (-100..100). */
  opinions: Record<PlayerId, number>;
  memories: NpcMemory[];
  /** Humeur du jour (-2..2) : colore les dialogues et les prix. */
  mood: number;
  /** Métier courant (peut changer avec le temps). */
  jobId: JobId;
  /** Besoins satisfaits (index de `wants`). */
  fulfilledWants: number[];
  /** Dernier jour où chaque joueur a discuté (limite le farm). */
  lastTalk: Record<PlayerId, number>;
}

export interface ShopState {
  id: ShopId;
  locationId: LocationId;
  ownerNpcId?: NpcId;
  /** Propriétaire joueur (achat de boutique). */
  ownerPlayerId?: PlayerId;
  gold: number;
  stock: Partial<Record<ItemId, number>>;
}

export interface LocationState {
  id: LocationId;
  prosperity: number;
  danger: number;
  security: number;
  population: number;
  /** Ressources récoltables restantes. */
  resources: Partial<Record<ItemId, number>>;
  /** Multiplicateurs de prix locaux par item (offre/demande). 1 = normal. */
  priceIndex: Partial<Record<ItemId, number>>;
  /** Objets posés au sol (déposés, abandonnés). */
  groundItems: { itemId: ItemId; qty: number; droppedBy?: PlayerId }[];
}

export interface FactionState {
  id: FactionId;
  influence: number;
  relations: Partial<Record<FactionId, number>>;
}

export interface ActiveWorldEvent {
  uid: EntityUid;
  eventId: WorldEventId;
  startDay: number;
  endDay: number;
}

export interface Rumor {
  id: string;
  day: number;
  text: string;
  locationId?: LocationId;
}

export interface WorldState {
  time: GameTime;
  locations: Record<LocationId, LocationState>;
  npcs: Record<NpcId, NpcState>;
  shops: Record<ShopId, ShopState>;
  factions: Record<FactionId, FactionState>;
  creatures: Record<EntityUid, CreatureInstance>;
  activeEvents: ActiveWorldEvent[];
  rumors: Rumor[];
}

// ---------------------------------------------------------------------------
// État global
// ---------------------------------------------------------------------------
export interface GameMeta {
  /** Version du schéma : sert aux migrations de sauvegarde. */
  schemaVersion: number;
  worldId: string;
  seed: number;
  /** État du générateur pseudo-aléatoire (déterministe => rejouable côté serveur). */
  rngState: number;
  /** Compteur d'identifiants (côté serveur : remplacé par des UUID). */
  nextId: number;
  createdAt: string;
}

export interface GameState {
  meta: GameMeta;
  world: WorldState;
  players: Record<PlayerId, PlayerState>;
  /** Journal des événements récents (tronqué). La source complète serait le serveur. */
  eventLog: GameEvent[];
}
