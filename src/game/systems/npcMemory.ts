/**
 * Mémoire et opinion des PNJ.
 *
 * - L'opinion (-100..100) est stockée par joueur dans NpcState.opinions.
 * - Chaque souvenir modifie l'opinion au moment où il est ajouté.
 * - Les souvenirs « marquants » (lasting) ne s'effacent pas et se propagent par
 *   commérage aux autres PNJ du même lieu (ouï-dire, moitié de l'impact).
 */
import { CONTENT } from '@/data';
import type { GameState, MemoryKind, NpcState, PlayerState } from '@/types';
import type { Ctx } from '../actions/context';
import { clamp } from './math';
import { playerTags } from '../state/selectors';

export const MAX_MEMORIES = 12;

/** Opinion initiale : tags du joueur, affinités raciales, réputation auprès de la faction du PNJ. */
export function initialOpinion(state: GameState, npcId: string, player: PlayerState): number {
  const def = CONTENT.npcs[npcId];
  if (!def) return 0;
  let value = 0;
  for (const tag of playerTags(player)) value += def.tagOpinions[tag] ?? 0;
  value += (CONTENT.races[def.raceId]?.relations[player.raceId] ?? 0) / 4;
  if (def.factionId) value += (player.factionReputation[def.factionId] ?? 0) / 2;
  void state;
  return clamp(Math.round(value), -100, 100);
}

export function getOpinion(state: GameState, npcId: string, player: PlayerState): number {
  const npc = state.world.npcs[npcId];
  if (!npc) return 0;
  if (npc.opinions[player.id] === undefined) npc.opinions[player.id] = initialOpinion(state, npcId, player);
  return npc.opinions[player.id];
}

export function changeOpinion(ctx: Ctx, npcId: string, player: PlayerState, delta: number) {
  const npc = ctx.state.world.npcs[npcId];
  if (!npc || !delta) return;
  const value = clamp(getOpinion(ctx.state, npcId, player) + delta, -100, 100);
  npc.opinions[player.id] = value;
  ctx.emit({ type: 'npc_opinion_changed', actorId: player.id, data: { npcId, playerId: player.id, value } });
}

export function addMemory(
  ctx: Ctx,
  npcId: string,
  player: PlayerState,
  kind: MemoryKind,
  impact: number,
  text: string,
  options: { lasting?: boolean; hearsay?: boolean } = {},
) {
  const npc = ctx.state.world.npcs[npcId];
  if (!npc) return;
  const lasting = options.lasting ?? Math.abs(impact) >= 15;
  npc.memories.push({ id: ctx.newId('mem'), kind, playerId: player.id, day: ctx.state.world.time.day, impact, text, lasting, hearsay: options.hearsay });
  trimMemories(npc);
  changeOpinion(ctx, npcId, player, impact);
  ctx.emit({ type: 'npc_memory_added', actorId: player.id, data: { npcId, kind, impact, hearsay: options.hearsay } });
}

function trimMemories(npc: NpcState) {
  while (npc.memories.length > MAX_MEMORIES) {
    const idx = npc.memories.findIndex((m) => !m.lasting);
    npc.memories.splice(idx === -1 ? 0 : idx, 1);
  }
}

/** Témoins : tous les PNJ présents dans le lieu se souviennent (ouï-dire atténué). */
export function witnesses(ctx: Ctx, locationId: string, except: string[] = []) {
  return Object.values(ctx.state.world.npcs).filter((n) => n.alive && n.locationId === locationId && !except.includes(n.id));
}

/**
 * Commérages quotidiens : chaque PNJ transmet ses souvenirs marquants récents
 * (non ouï-dire) aux autres PNJ du même lieu.
 */
export function gossip(ctx: Ctx) {
  const { state } = ctx;
  const byLocation: Record<string, NpcState[]> = {};
  for (const npc of Object.values(state.world.npcs)) if (npc.alive) (byLocation[npc.locationId] ??= []).push(npc);
  for (const group of Object.values(byLocation)) {
    if (group.length < 2) continue;
    for (const teller of group) {
      for (const mem of teller.memories) {
        if (!mem.lasting || mem.hearsay || state.world.time.day - mem.day > 7) continue;
        const player = state.players[mem.playerId];
        if (!player) continue;
        for (const listener of group) {
          if (listener.id === teller.id) continue;
          const already = listener.memories.some((m) => m.playerId === mem.playerId && m.kind === mem.kind && m.day === mem.day);
          if (already) continue;
          const tellerName = CONTENT.npcs[teller.id]?.name ?? teller.id;
          addMemory(ctx, listener.id, player, mem.kind, Math.round(mem.impact / 2), `${tellerName} m’a raconté : ${mem.text}`, { hearsay: true, lasting: true });
        }
      }
    }
  }
}
