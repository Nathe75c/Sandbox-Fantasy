/**
 * Définitions du CONTENU STATIQUE du jeu.
 *
 * Ces types décrivent ce qui ne change jamais pendant une partie : items,
 * métiers, recettes, races, créatures, lieux, PNJ (fiche de base), traits,
 * statistiques, factions, événements. Ils sont identiques pour tous les joueurs
 * et pourront plus tard être servis tels quels par un serveur.
 *
 * Règle d'or : aucune donnée dynamique ici (pas de quantité en stock, pas de
 * position courante, pas d'opinion). Le dynamique vit dans `state.ts`.
 */

// ---------------------------------------------------------------------------
// Identifiants (chaînes lisibles, uniques dans leur catégorie)
// ---------------------------------------------------------------------------
export type StatId =
  | 'force'
  | 'agilite'
  | 'vitalite'
  | 'intelligence'
  | 'perception'
  | 'charisme'
  | 'volonte'
  | 'discretion'
  | 'chance';

export type ItemId = string;
export type JobId = string;
export type RecipeId = string;
export type RaceId = string;
export type CreatureId = string;
export type LocationId = string;
export type NpcId = string;
export type TraitId = string;
export type OriginId = string;
export type FactionId = string;
export type WorldEventId = string;
export type ShopId = string;

export type Stats = Record<StatId, number>;
export type StatModifiers = Partial<Record<StatId, number>>;

// ---------------------------------------------------------------------------
// Statistiques
// ---------------------------------------------------------------------------
export interface StatDef {
  id: StatId;
  name: string;
  short: string;
  description: string;
  /** Ce que la statistique influence concrètement (affiché au joueur). */
  influences: string[];
}

// ---------------------------------------------------------------------------
// Traits et origines
// ---------------------------------------------------------------------------
export interface TraitDef {
  id: TraitId;
  name: string;
  description: string;
  statModifiers: StatModifiers;
  /** Bonus d'XP ou de réussite dans certains métiers (ex: 0.2 = +20 %). */
  jobBonuses?: Partial<Record<JobId, number>>;
  /** Tags lus par les systèmes (dialogues, prix, PNJ...). */
  tags: string[];
  /** Traits incompatibles. */
  excludes?: TraitId[];
}

export interface OriginDef {
  id: OriginId;
  name: string;
  description: string;
  statModifiers: StatModifiers;
  startingGold: number;
  startingItems: { itemId: ItemId; qty: number }[];
  startingJobs: JobId[];
  /** Lieux de départ possibles, pondérés. La chance favorise les meilleurs. */
  startLocations: { locationId: LocationId; weight: number; lucky?: boolean }[];
  /** Réputation initiale par faction. */
  startingReputation: Partial<Record<FactionId, number>>;
  /** Tags débloquant des options de dialogue et des réactions de PNJ. */
  tags: string[];
  jobBonuses?: Partial<Record<JobId, number>>;
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------
export type ItemCategory =
  | 'arme'
  | 'armure'
  | 'outil'
  | 'vetement'
  | 'bijou'
  | 'livre'
  | 'potion'
  | 'ingredient'
  | 'minerai'
  | 'plante'
  | 'aliment'
  | 'boisson'
  | 'materiau'
  | 'objet_magique'
  | 'ressource_animale'
  | 'ressource_creature'
  | 'marchandise'
  | 'composant'
  | 'document'
  | 'cle'
  | 'carte'
  | 'quete';

export type Rarity = 'mediocre' | 'commun' | 'peu_commun' | 'rare' | 'epique' | 'legendaire';

export type ItemEffect =
  | { type: 'heal'; amount: number }
  | { type: 'energy'; amount: number }
  | { type: 'buff'; stat: StatId; amount: number; hours: number }
  | { type: 'damage_bonus'; amount: number }
  | { type: 'armor'; amount: number }
  | { type: 'poison'; amount: number }
  | { type: 'cure' }
  | { type: 'learn_recipe'; recipeId: RecipeId }
  | { type: 'unlock'; key: string };

export interface ItemDef {
  id: ItemId;
  name: string;
  category: ItemCategory;
  description: string;
  /** Valeur de base en pièces d'or (avant marché, réputation, charisme). */
  value: number;
  weight: number;
  rarity: Rarity;
  /** Utilité lisible : « arme de mêlée », « ingrédient de cuisine »... */
  utility: string;
  effects?: ItemEffect[];
  /** Emplacement si l'item est équipable. */
  slot?: 'arme' | 'armure' | 'outil' | 'bijou';
  /** Conditions d'utilisation (statistique ou métier minimum). */
  requirements?: { stats?: StatModifiers; jobs?: Partial<Record<JobId, number>> };
  relatedJobs: JobId[];
  /** Où / chez qui on le trouve. Les lieux, métiers ou factions. */
  availability?: { locations?: LocationId[]; factions?: FactionId[]; jobs?: JobId[] };
  /** Consommable (disparaît à l'usage). */
  consumable?: boolean;
  /** Item illégal / de contrebande. */
  illegal?: boolean;
  tags?: string[];
  // NB : « recettes liées », « composants nécessaires » et « objets qu'il permet
  // de fabriquer » sont DÉRIVÉS automatiquement des recettes (voir data/index.ts)
  // pour garder une seule source de vérité.
}

// ---------------------------------------------------------------------------
// Métiers
// ---------------------------------------------------------------------------
export type JobKind = 'recolte' | 'artisanat' | 'service' | 'commerce' | 'ombre' | 'combat' | 'savoir';

export interface JobDef {
  id: JobId;
  name: string;
  kind: JobKind;
  description: string;
  actions: string[];
  tools: ItemId[];
  resourcesUsed: ItemId[];
  produces: ItemId[];
  /** Statistiques qui améliorent ce métier. */
  keyStats: StatId[];
  risks: string[];
  income: string;
  /** Paliers de progression (niveau -> titre). */
  progression: { level: number; title: string; unlocks: string }[];
  /** Métiers en amont (fournisseurs) et en aval (clients). */
  dependsOn: JobId[];
  feeds: JobId[];
  economyImpact: string;
  reputationImpact: string;
  npcInteractions: string;
  worldInteractions: string;
  /** Peut-on commencer seul (récolte) ou faut-il un maître/un livre ? */
  learnable: 'libre' | 'maitre' | 'livre';
  learnCost: number;
  /** Faction qui encadre le métier, le cas échéant. */
  guildFactionId?: FactionId;
  /** Ce métier propose l'action « Travailler » (revenu à l'heure) dans ces types de lieux. */
  work?: { locationKinds: LocationKind[]; goldPerHour: number; stat: StatId; reputation?: number };
}

// ---------------------------------------------------------------------------
// Recettes
// ---------------------------------------------------------------------------
export interface RecipeDef {
  id: RecipeId;
  name: string;
  jobId: JobId;
  level: number;
  inputs: { itemId: ItemId; qty: number }[];
  outputs: { itemId: ItemId; qty: number }[];
  /** Outils requis dans l'inventaire (non consommés). */
  tools: ItemId[];
  /** Installation requise dans le lieu (forge, atelier...). */
  station?: Station;
  hours: number;
  energy: number;
  /** Difficulté du jet (0-100). Un échec consomme une partie des ressources. */
  difficulty: number;
  stat: StatId;
  xp: number;
}

export type Station = 'forge' | 'atelier' | 'tannerie' | 'cuisine' | 'laboratoire' | 'autel' | 'scriptorium' | 'metier_a_tisser';

// ---------------------------------------------------------------------------
// Factions
// ---------------------------------------------------------------------------
export interface FactionDef {
  id: FactionId;
  name: string;
  description: string;
  raceIds: RaceId[];
  values: string[];
  /** Relations entre factions : -100 (guerre) .. 100 (alliance). */
  relations: Partial<Record<FactionId, number>>;
  homeLocations: LocationId[];
  /** Ce qui plaît / déplaît à la faction (tags d'actions). */
  likes: string[];
  dislikes: string[];
  baseInfluence: number;
}

// ---------------------------------------------------------------------------
// Races / peuples
// ---------------------------------------------------------------------------
export type RaceType =
  | 'peuple_civilise'
  | 'peuple_tribal'
  | 'mort_vivant'
  | 'creature_magique'
  | 'esprit'
  | 'hybride';

export type Behavior =
  | 'pacifique'
  | 'mefiant'
  | 'marchand'
  | 'territorial'
  | 'agressif'
  | 'fuyant'
  | 'predateur'
  | 'intelligent'
  | 'manipulateur'
  | 'neutre';

export interface RaceDef {
  id: RaceId;
  name: string;
  plural: string;
  description: string;
  type: RaceType;
  defaultBehavior: Behavior;
  playable: boolean;
  statModifiers: StatModifiers;
  strengths: string[];
  weaknesses: string[];
  habitats: LocationId[];
  /** Relations par défaut envers d'autres races (-100..100). Le contexte prime. */
  relations: Partial<Record<RaceId, number>>;
  factions: FactionId[];
  items: { uses: ItemId[]; sells: ItemId[]; crafts: ItemId[] };
  interactions: string[];
  worldImpact: string;
}

// ---------------------------------------------------------------------------
// Créatures
// ---------------------------------------------------------------------------
export type CreatureType =
  | 'bete_sauvage'
  | 'monstre'
  | 'mort_vivant'
  | 'creature_magique'
  | 'humanoide'
  | 'demon'
  | 'boss';

export type DamageTag = 'tranchant' | 'contondant' | 'percant' | 'feu' | 'sacre' | 'argent' | 'poison' | 'magie';

export interface CreatureDef {
  id: CreatureId;
  name: string;
  description: string;
  type: CreatureType;
  behavior: Behavior;
  /** Niveau de danger 1..10 (sert au spawn et à la difficulté). */
  danger: number;
  stats: { hp: number; attack: number; defense: number; agility: number };
  strengths: string[];
  weaknesses: DamageTag[];
  resistances: DamageTag[];
  habitats: LocationId[];
  relations: Partial<Record<FactionId | RaceId, number>>;
  drops: { itemId: ItemId; chance: number; min: number; max: number }[];
  gold?: [number, number];
  interactions: ('combattre' | 'fuir' | 'eviter' | 'parlementer' | 'nourrir' | 'observer')[];
  worldImpact: string;
  raceId?: RaceId;
  factionId?: FactionId;
  /** Tuer cette créature a des conséquences morales / réputationnelles. */
  reputationOnKill?: Partial<Record<FactionId, number>>;
  xp: number;
  legendary?: boolean;
}

// ---------------------------------------------------------------------------
// Lieux
// ---------------------------------------------------------------------------
export type LocationKind =
  | 'village'
  | 'ville'
  | 'foret'
  | 'montagne'
  | 'route'
  | 'port'
  | 'taverne'
  | 'ruine'
  | 'quartier_pauvre'
  | 'chateau'
  | 'campement'
  | 'mine'
  | 'ferme'
  | 'temple'
  | 'marais'
  | 'region_dangereuse'
  | 'lieu_isole';

export interface ShopDef {
  id: ShopId;
  name: string;
  ownerNpcId?: NpcId;
  /** Catégories ou items vendus. */
  sells: ItemId[];
  /** Catégories rachetées au joueur. */
  buysCategories: ItemCategory[];
  startingGold: number;
  /** Receleur : accepte les objets volés. */
  fence?: boolean;
  /** Prix de rachat de la boutique par le joueur (0 = non achetable). */
  purchasePrice?: number;
}

export interface LocationDef {
  id: LocationId;
  name: string;
  kind: LocationKind;
  description: string;
  /** Lieu parent (quartier d'une ville, taverne d'un village...). */
  parentId?: LocationId;
  regionId: string;
  /** Position sur la carte (0..100) pour l'affichage. */
  map: { x: number; y: number };
  connections: { to: LocationId; hours: number; danger: number }[];
  factionId?: FactionId;
  /** Valeurs initiales de l'état dynamique. */
  base: { prosperity: number; danger: number; security: number; population: number };
  gatherables: { itemId: ItemId; jobId: JobId; stock: number; regenPerDay: number; difficulty: number }[];
  creatureSpawns: { creatureId: CreatureId; weight: number; max: number }[];
  shops: ShopDef[];
  stations: Station[];
  /** Ce que le lieu produit (prix bas) ou demande (prix hauts). */
  produces: ItemCategory[];
  demands: ItemCategory[];
  /** Métiers pour lesquels l'action « Travailler » est disponible ici. */
  workJobs: JobId[];
  /** Repos : coût d'une nuit (0 = gratuit mais risqué). */
  rest: { cost: number; safe: boolean };
}

// ---------------------------------------------------------------------------
// PNJ (fiche statique)
// ---------------------------------------------------------------------------
export type OpinionTier = 'hostile' | 'mefiant' | 'neutre' | 'amical' | 'allie';

export interface NpcDef {
  id: NpcId;
  name: string;
  title: string;
  raceId: RaceId;
  age: number;
  jobId: JobId;
  factionId?: FactionId;
  personality: string[];
  character: string;
  desires: string[];
  fears: string[];
  goals: string[];
  socialStatus: 'miserable' | 'modeste' | 'aise' | 'riche' | 'noble';
  possessions: { gold: number; items: { itemId: ItemId; qty: number }[] };
  relations: Partial<Record<NpcId, number>>;
  homeLocationId: LocationId;
  /** Habitudes : lieux fréquentés (le PNJ peut s'y déplacer). */
  habits: { locationId: LocationId; weight: number }[];
  /** Probabilité quotidienne de se déplacer selon ses habitudes. */
  travelChance: number;
  shopId?: ShopId;
  teaches?: JobId[];
  /** Objets désirés : les lui apporter = aide. */
  wants: { itemId: ItemId; qty: number; reward: number }[];
  /** Réactions de base selon les tags du joueur (origine, traits, race, métiers). */
  tagOpinions: Record<string, number>;
  /** Répliques par palier d'opinion. */
  lines: Partial<Record<OpinionTier, string[]>>;
  rumors?: string[];
  /** Options spéciales débloquées par un tag du joueur. */
  specialOptions?: { tag: string; label: string; reply: string; opinion: number; reputation?: Partial<Record<FactionId, number>>; gold?: number }[];
  /** Le PNJ protège ses biens : une perception élevée rend le vol difficile. */
  perception: number;
  combat?: { hp: number; attack: number; defense: number; agility: number };
}

// ---------------------------------------------------------------------------
// Événements du monde (contenu)
// ---------------------------------------------------------------------------
export type WorldEffect =
  | { type: 'price'; locationId: LocationId | '*'; itemIds?: ItemId[]; categories?: ItemCategory[]; multiplier: number }
  | { type: 'danger'; locationId: LocationId; delta: number }
  | { type: 'prosperity'; locationId: LocationId; delta: number }
  | { type: 'security'; locationId: LocationId; delta: number }
  | { type: 'spawn'; locationId: LocationId; creatureId: CreatureId; count: number }
  | { type: 'resource'; locationId: LocationId; itemId: ItemId; delta: number }
  | { type: 'faction_influence'; factionId: FactionId; delta: number }
  | { type: 'rumor'; text: string };

export interface WorldEventDef {
  id: WorldEventId;
  name: string;
  description: string;
  /** Poids de tirage quotidien. */
  weight: number;
  durationDays: number;
  conditions?: {
    minDay?: number;
    locationDangerAbove?: { locationId: LocationId; value: number };
    locationProsperityBelow?: { locationId: LocationId; value: number };
    locationProsperityAbove?: { locationId: LocationId; value: number };
  };
  effects: WorldEffect[];
  /** Effets appliqués à la fin (retour à la normale partiel). */
  endEffects?: WorldEffect[];
  rumor: string;
}
