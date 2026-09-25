/**
 * Contexte d'exécution d'une action.
 *
 * Un handler reçoit une COPIE de l'état (`ctx.state`) qu'il peut modifier
 * librement, un RNG déterministe, et une fonction `emit` pour déclarer les
 * événements produits. `applyAction` s'occupe du reste (clonage, RNG, journal).
 */
import type { EventDraft, GameEvent, GameState } from '@/types';
import type { Rng } from '../systems/rng';

export class ActionError extends Error {}

export interface Ctx {
  state: GameState;
  rng: Rng;
  events: GameEvent[];
  emit<E extends EventDraft>(draft: E): GameEvent;
  /** Message lisible pour le joueur (événement `message`). */
  say(text: string, tone?: 'info' | 'success' | 'warning' | 'danger', actorId?: string): void;
  newId(prefix: string): string;
}

/** Interrompt l'action : l'état n'est pas modifié et le message est affiché. */
export function fail(message: string): never {
  throw new ActionError(message);
}

export function createCtx(state: GameState, rng: Rng): Ctx {
  const ctx: Ctx = {
    state,
    rng,
    events: [],
    newId(prefix) {
      const id = `${prefix}_${state.meta.nextId.toString(36)}`;
      state.meta.nextId += 1;
      return id;
    },
    emit(draft) {
      const event = {
        ...draft,
        id: ctx.newId('evt'),
        day: state.world.time.day,
        hour: state.world.time.hour,
      } as GameEvent;
      ctx.events.push(event);
      return event;
    },
    say(text, tone = 'info', actorId = 'world') {
      ctx.emit({ type: 'message', actorId, data: { text, tone } });
    },
  };
  return ctx;
}
