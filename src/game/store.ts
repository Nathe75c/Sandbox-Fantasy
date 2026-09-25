/**
 * Store du jeu, indépendant de React.
 *
 * - `dispatch(action)` : applique une action via `applyAction` (logique pure).
 * - `subscribe` / `getSnapshot` : branchés sur React avec useSyncExternalStore.
 *
 * Migration multijoueur : remplacer le corps de `dispatch` par un envoi au serveur,
 * puis appliquer l'état (ou les événements) renvoyés. L'interface ne change pas.
 */
import type { GameAction, GameEvent, GameState } from '@/types';
import { applyAction } from './actions/applyAction';
import { createInitialState, LOCAL_PLAYER_ID } from './state/createInitialState';
import { SaveManager, type SlotId } from './save/saveManager';
import type { StorageAdapter } from './save/storage';

export interface GameSnapshot {
  state: GameState | null;
  /** Événements produits par la dernière action (pour l'affichage). */
  lastEvents: GameEvent[];
  lastError: string | null;
  playerId: string;
}

type ActionWithoutPlayer = GameAction extends infer A ? (A extends GameAction ? Omit<A, 'playerId'> : never) : never;

export function createGameStore(storage: StorageAdapter, options: { autosave?: boolean } = {}) {
  const saves = new SaveManager(storage);
  const listeners = new Set<() => void>();
  let snapshot: GameSnapshot = { state: null, lastEvents: [], lastError: null, playerId: LOCAL_PLAYER_ID };
  let autosaveTimer: ReturnType<typeof setTimeout> | undefined;

  const set = (next: Partial<GameSnapshot>) => {
    snapshot = { ...snapshot, ...next };
    listeners.forEach((l) => l());
  };

  const scheduleAutosave = () => {
    if (!options.autosave || !snapshot.state?.players[snapshot.playerId]) return;
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      if (snapshot.state) void saves.save('auto', snapshot.state, snapshot.playerId);
    }, 400);
  };

  return {
    saves,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,

    /** Nouveau monde (graine aléatoire ou fournie). */
    newWorld(seed = Math.floor(Math.random() * 2 ** 31)) {
      set({ state: createInitialState(seed), lastEvents: [], lastError: null });
    },

    /** Envoie une action du joueur local. */
    dispatch(action: ActionWithoutPlayer) {
      if (!snapshot.state) return;
      const result = applyAction(snapshot.state, { ...action, playerId: snapshot.playerId } as GameAction);
      set({ state: result.state, lastEvents: result.events, lastError: result.error ?? null });
      if (!result.error) scheduleAutosave();
      return result;
    },

    clearError() {
      set({ lastError: null });
    },

    async save(slot: SlotId) {
      if (snapshot.state) await saves.save(slot, snapshot.state, snapshot.playerId);
    },

    async load(slot: SlotId) {
      const state = await saves.load(slot);
      if (state) set({ state, lastEvents: [], lastError: null });
      return !!state;
    },

    quitToMenu() {
      clearTimeout(autosaveTimer);
      set({ state: null, lastEvents: [], lastError: null });
    },
  };
}

export type GameStore = ReturnType<typeof createGameStore>;
