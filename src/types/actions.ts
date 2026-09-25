/**
 * ACTIONS DU JOUEUR : ce que le joueur VEUT faire.
 *
 * Toute modification de l'état passe par une action. Localement, l'action est
 * appliquée directement par `applyAction` (fonction pure). En multijoueur, le
 * client enverra la même action au serveur, qui la validera avec le même code
 * et renverra les événements produits.
 */
import type { ItemId, JobId, LocationId, NpcId, OriginId, RaceId, RecipeId, ShopId, StatId, StatModifiers, TraitId } from './content';
import type { EntityUid, PlayerId } from './state';

export type DialogueOption =
  | 'discuter'
  | 'rumeurs'
  | 'flatter'
  | 'menacer'
  | 'insulter'
  | 'aider'
  | 'special';

export type GameAction =
  | {
      type: 'create_character';
      playerId: PlayerId;
      payload: { name: string; raceId: RaceId; originId: OriginId; traitIds: TraitId[]; bonusStats: StatModifiers };
    }
  | { type: 'move'; playerId: PlayerId; payload: { to: LocationId } }
  | { type: 'rest'; playerId: PlayerId; payload: { hours: number } }
  | { type: 'gather'; playerId: PlayerId; payload: { itemId: ItemId } }
  | { type: 'craft'; playerId: PlayerId; payload: { recipeId: RecipeId } }
  | { type: 'buy'; playerId: PlayerId; payload: { shopId: ShopId; itemId: ItemId; qty: number } }
  | { type: 'sell'; playerId: PlayerId; payload: { shopId: ShopId; itemId: ItemId; qty: number; stolen?: boolean } }
  | { type: 'steal'; playerId: PlayerId; payload: { shopId?: ShopId; npcId?: NpcId } }
  | { type: 'talk'; playerId: PlayerId; payload: { npcId: NpcId; option: DialogueOption; specialIndex?: number; wantIndex?: number } }
  | { type: 'learn_job'; playerId: PlayerId; payload: { jobId: JobId; npcId?: NpcId } }
  | { type: 'work'; playerId: PlayerId; payload: { jobId: JobId; hours: number } }
  | { type: 'use_item'; playerId: PlayerId; payload: { itemId: ItemId } }
  | { type: 'equip'; playerId: PlayerId; payload: { itemId: ItemId } }
  | { type: 'drop_item'; playerId: PlayerId; payload: { itemId: ItemId; qty: number } }
  | { type: 'pick_up'; playerId: PlayerId; payload: { index: number } }
  | { type: 'engage'; playerId: PlayerId; payload: { creatureUid: EntityUid } }
  | { type: 'combat_attack'; playerId: PlayerId; payload: { power?: boolean } }
  | { type: 'combat_flee'; playerId: PlayerId; payload: Record<string, never> }
  | { type: 'sneak_past'; playerId: PlayerId; payload: { creatureUid: EntityUid } }
  | { type: 'buy_shop'; playerId: PlayerId; payload: { shopId: ShopId } }
  | { type: 'join_faction'; playerId: PlayerId; payload: { factionId: string } }
  | { type: 'spend_stat_point'; playerId: PlayerId; payload: { stat: StatId } };

export type GameActionType = GameAction['type'];
