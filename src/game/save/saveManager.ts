/**
 * Sauvegardes versionnées.
 *
 * Format : { schemaVersion, savedAt, summary, state }. L'état complet est du JSON pur :
 * c'est exactement ce qu'un serveur stockerait en base (monde + joueurs).
 * Les migrations permettent de charger d'anciennes sauvegardes après une mise à jour.
 */
import type { GameState } from '@/types';
import { CONTENT } from '@/data';
import { SCHEMA_VERSION } from '../state/createInitialState';
import type { StorageAdapter } from './storage';

export const SAVE_PREFIX = 'sandbox-fantasy:save:';
export const SLOTS = ['auto', 'slot1', 'slot2', 'slot3'] as const;
export type SlotId = (typeof SLOTS)[number];

export interface SaveFile {
  schemaVersion: number;
  savedAt: string;
  summary: SaveSummary;
  state: GameState;
}

export interface SaveSummary {
  playerName: string;
  day: number;
  locationName: string;
  gold: number;
  level: number;
}

/** Migrations : version N -> N+1. Ajouter une entrée à chaque changement de schéma. */
const MIGRATIONS: Record<number, (state: GameState) => GameState> = {
  // 1: (s) => ({ ...s, world: { ...s.world, nouveauChamp: [] } }),
};

export function migrate(file: SaveFile): GameState {
  let state = file.state;
  let version = file.schemaVersion;
  if (version > SCHEMA_VERSION) throw new Error('Sauvegarde créée par une version plus récente du jeu.');
  while (version < SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) throw new Error(`Aucune migration depuis la version ${version}.`);
    state = step(state);
    version += 1;
  }
  state.meta.schemaVersion = SCHEMA_VERSION;
  return state;
}

export function summarize(state: GameState, playerId: string): SaveSummary {
  const p = state.players[playerId];
  return {
    playerName: p?.name ?? '—',
    day: state.world.time.day,
    locationName: CONTENT.locations[p?.locationId ?? '']?.name ?? '—',
    gold: p?.gold ?? 0,
    level: p?.level ?? 1,
  };
}

export function serialize(state: GameState, playerId: string, now = new Date().toISOString()): string {
  const file: SaveFile = { schemaVersion: SCHEMA_VERSION, savedAt: now, summary: summarize(state, playerId), state };
  return JSON.stringify(file);
}

export function deserialize(raw: string): GameState {
  const file = JSON.parse(raw) as SaveFile;
  if (!file?.state?.meta || typeof file.schemaVersion !== 'number') throw new Error('Fichier de sauvegarde invalide.');
  return migrate(file);
}

export class SaveManager {
  constructor(private storage: StorageAdapter) {}

  async save(slot: SlotId, state: GameState, playerId: string) {
    await this.storage.save(SAVE_PREFIX + slot, serialize(state, playerId));
  }

  async load(slot: SlotId): Promise<GameState | null> {
    const raw = await this.storage.load(SAVE_PREFIX + slot);
    return raw ? deserialize(raw) : null;
  }

  async remove(slot: SlotId) {
    await this.storage.remove(SAVE_PREFIX + slot);
  }

  async listSlots(): Promise<{ slot: SlotId; savedAt: string; summary: SaveSummary }[]> {
    const out: { slot: SlotId; savedAt: string; summary: SaveSummary }[] = [];
    for (const slot of SLOTS) {
      const raw = await this.storage.load(SAVE_PREFIX + slot);
      if (!raw) continue;
      try {
        const file = JSON.parse(raw) as SaveFile;
        out.push({ slot, savedAt: file.savedAt, summary: file.summary });
      } catch {
        /* sauvegarde corrompue : ignorée */
      }
    }
    return out;
  }
}
