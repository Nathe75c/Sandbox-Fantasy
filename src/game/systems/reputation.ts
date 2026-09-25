import { CONTENT } from '@/data';
import type { PlayerState } from '@/types';
import type { Ctx } from '../actions/context';
import { clamp } from './math';

export function changeLocalReputation(ctx: Ctx, player: PlayerState, locationId: string, delta: number, reason: string) {
  if (!delta) return;
  // La réputation d'un sous-lieu (taverne, quartier) compte pour son lieu parent.
  const target = CONTENT.locations[locationId]?.parentId ?? locationId;
  const value = clamp((player.localReputation[target] ?? 0) + delta, -100, 100);
  player.localReputation[target] = value;
  ctx.emit({ type: 'reputation_changed', actorId: player.id, data: { scope: 'location', targetId: target, delta, value, reason } });
}

export function changeFactionReputation(ctx: Ctx, player: PlayerState, factionId: string, delta: number, reason: string) {
  if (!delta || !CONTENT.factions[factionId]) return;
  const value = clamp((player.factionReputation[factionId] ?? 0) + delta, -100, 100);
  player.factionReputation[factionId] = value;
  ctx.emit({ type: 'reputation_changed', actorId: player.id, data: { scope: 'faction', targetId: factionId, delta, value, reason } });
}

/** Applique un « tag d'action » (vol, aide...) aux factions qui l'aiment ou le détestent. */
export function applyFactionOpinions(ctx: Ctx, player: PlayerState, actionTag: string, amount: number, reason: string, only?: string[]) {
  for (const f of CONTENT.lists.factions) {
    if (only && !only.includes(f.id)) continue;
    if (f.likes.includes(actionTag)) changeFactionReputation(ctx, player, f.id, amount, reason);
    else if (f.dislikes.includes(actionTag)) changeFactionReputation(ctx, player, f.id, -amount, reason);
  }
}

export function changeNotoriety(ctx: Ctx, player: PlayerState, delta: number) {
  if (!delta) return;
  player.notoriety = clamp(player.notoriety + delta, 0, 100);
  ctx.emit({ type: 'notoriety_changed', actorId: player.id, data: { delta, value: player.notoriety } });
}

/** Faction qui contrôle un lieu (ou son parent). */
export function locationFaction(locationId: string): string | undefined {
  const loc = CONTENT.locations[locationId];
  return loc?.factionId ?? (loc?.parentId ? CONTENT.locations[loc.parentId]?.factionId : undefined);
}
