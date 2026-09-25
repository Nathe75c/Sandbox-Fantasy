/**
 * POINT D'ENTRÉE UNIQUE de toutes les modifications de l'état.
 *
 *   applyAction(état, action) => { état', événements, erreur? }
 *
 * - Pure et déterministe : l'état d'entrée n'est jamais modifié ; le hasard vient
 *   du RNG seedé stocké dans l'état. Même état + même action = même résultat.
 * - En solo, le store local l'appelle directement.
 * - En multijoueur, le SERVEUR l'appellera pour valider chaque action reçue,
 *   puis diffusera les événements produits aux clients concernés.
 */
import type { GameAction, GameEvent, GameState, PlayerState } from '@/types';
import { ActionError, createCtx, type Ctx } from './context';
import { createRng } from '../systems/rng';
import { createCharacter, spendStatPoint } from './character';
import { move, rest } from './movement';
import { craft, gather, learnJobAction, work } from './production';
import { buy, buyShop, sell } from './commerce';
import { joinFaction, steal, talk } from './social';
import { combatAttack, combatFlee, engage, sneakPast } from './combat';
import { dropItem, equip, pickUp, useItem } from './items';

export const EVENT_LOG_LIMIT = 250;

type Handler<T extends GameAction['type']> = (ctx: Ctx, player: PlayerState, payload: Extract<GameAction, { type: T }>['payload']) => void;

const HANDLERS: { [T in Exclude<GameAction['type'], 'create_character'>]: Handler<T> } = {
  move,
  rest,
  gather,
  craft,
  work,
  learn_job: learnJobAction,
  buy,
  sell,
  buy_shop: buyShop,
  steal,
  talk,
  join_faction: joinFaction,
  engage,
  combat_attack: combatAttack,
  combat_flee: combatFlee,
  sneak_past: sneakPast,
  use_item: useItem,
  equip,
  drop_item: dropItem,
  pick_up: pickUp,
  spend_stat_point: spendStatPoint,
};

export interface ActionResult {
  state: GameState;
  events: GameEvent[];
  error?: string;
}

export function applyAction(state: GameState, action: GameAction): ActionResult {
  const draft = structuredClone(state);
  const rng = createRng(draft.meta.rngState);
  const ctx = createCtx(draft, rng);
  try {
    if (action.type === 'create_character') {
      createCharacter(ctx, action.playerId, action.payload);
    } else {
      const player = draft.players[action.playerId];
      if (!player) throw new ActionError('Personnage introuvable.');
      const handler = HANDLERS[action.type] as Handler<typeof action.type>;
      handler(ctx, player, action.payload as never);
    }
  } catch (err) {
    if (err instanceof ActionError) return { state, events: [], error: err.message };
    throw err;
  }
  draft.meta.rngState = rng.state();
  draft.eventLog = [...draft.eventLog, ...ctx.events].slice(-EVENT_LOG_LIMIT);
  return { state: draft, events: ctx.events };
}
