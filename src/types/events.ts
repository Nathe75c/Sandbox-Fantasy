/**
 * ÉVÉNEMENTS DE JEU : ce qui S'EST PASSÉ.
 *
 * Une action (intention du joueur) produit zéro, un ou plusieurs événements
 * (faits). En multijoueur, le serveur validera les actions et diffusera les
 * événements à tous les clients concernés. Chaque événement est sérialisable,
 * horodaté dans le temps du jeu et porte un identifiant unique.
 */
import type { CreatureId, FactionId, ItemId, JobId, LocationId, NpcId, RecipeId, ShopId, WorldEventId } from './content';
import type { EntityUid, MemoryKind, PlayerId } from './state';

interface Base<T extends string, D> {
  id: string;
  type: T;
  day: number;
  hour: number;
  /** Joueur ou système à l'origine de l'événement. */
  actorId: PlayerId | 'world';
  data: D;
}

export type GameEvent =
  | Base<'player_created', { name: string; locationId: LocationId }>
  | Base<'player_moved', { from: LocationId; to: LocationId; hours: number }>
  | Base<'player_rested', { locationId: LocationId; hours: number }>
  | Base<'player_leveled', { level: number }>
  | Base<'player_defeated', { locationId: LocationId; goldLost: number; wakeAt: LocationId }>
  | Base<'item_bought', { shopId: ShopId; itemId: ItemId; qty: number; price: number }>
  | Base<'item_sold', { shopId: ShopId; itemId: ItemId; qty: number; price: number; stolen: boolean }>
  | Base<'item_crafted', { recipeId: RecipeId; success: boolean; outputs: { itemId: ItemId; qty: number }[] }>
  | Base<'item_gathered', { locationId: LocationId; itemId: ItemId; qty: number }>
  | Base<'item_stolen', { itemId: ItemId; qty: number; fromNpcId?: NpcId; fromShopId?: ShopId; caught: boolean }>
  | Base<'item_used', { itemId: ItemId }>
  | Base<'item_given', { itemId: ItemId; qty: number; npcId: NpcId }>
  | Base<'item_dropped', { itemId: ItemId; qty: number; locationId: LocationId }>
  | Base<'item_picked_up', { itemId: ItemId; qty: number; locationId: LocationId }>
  | Base<'item_equipped', { itemId: ItemId }>
  | Base<'job_learned', { jobId: JobId; npcId?: NpcId }>
  | Base<'job_leveled', { jobId: JobId; level: number }>
  | Base<'job_worked', { jobId: JobId; hours: number; gold: number }>
  | Base<'npc_talked', { npcId: NpcId; option: string; success?: boolean }>
  | Base<'npc_moved', { npcId: NpcId; from: LocationId; to: LocationId }>
  | Base<'npc_memory_added', { npcId: NpcId; kind: MemoryKind; impact: number; hearsay?: boolean }>
  | Base<'npc_opinion_changed', { npcId: NpcId; playerId: PlayerId; value: number }>
  | Base<'creature_spawned', { uid: EntityUid; creatureId: CreatureId; locationId: LocationId }>
  | Base<'creature_defeated', { uid: EntityUid; creatureId: CreatureId; locationId: LocationId }>
  | Base<'creature_fled', { uid: EntityUid; creatureId: CreatureId }>
  | Base<'combat_started', { uid: EntityUid; creatureId: CreatureId; ambush: boolean }>
  | Base<'combat_round', { uid: EntityUid; text: string }>
  | Base<'combat_fled', { uid: EntityUid; success: boolean }>
  | Base<'city_state_changed', { locationId: LocationId; prosperity: number; danger: number; security: number }>
  | Base<'shop_stock_updated', { shopId: ShopId }>
  | Base<'shop_purchased', { shopId: ShopId; price: number }>
  | Base<'price_changed', { locationId: LocationId; itemId: ItemId; index: number }>
  | Base<'reputation_changed', { scope: 'location' | 'faction'; targetId: LocationId | FactionId; delta: number; value: number; reason: string }>
  | Base<'notoriety_changed', { delta: number; value: number }>
  | Base<'faction_influence_changed', { factionId: FactionId; delta: number; value: number }>
  | Base<'faction_joined', { factionId: FactionId }>
  | Base<'world_event_triggered', { uid: EntityUid; eventId: WorldEventId }>
  | Base<'world_event_ended', { uid: EntityUid; eventId: WorldEventId }>
  | Base<'rumor_spread', { text: string; locationId?: LocationId }>
  | Base<'day_started', { day: number }>
  | Base<'message', { text: string; tone?: 'info' | 'success' | 'warning' | 'danger' }>;

export type GameEventType = GameEvent['type'];

/** Données d'un événement avant qu'on lui attribue id/horodatage. */
export type EventDraft = {
  [K in GameEvent as K['type']]: { type: K['type']; actorId: K['actorId']; data: K['data'] };
}[GameEventType];
