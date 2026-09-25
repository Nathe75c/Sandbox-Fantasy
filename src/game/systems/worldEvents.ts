/**
 * Événements du monde : déclenchement, effets, fin.
 */
import { CONTENT } from '@/data';
import type { WorldEffect, WorldEventDef } from '@/types';
import type { Ctx } from '../actions/context';
import { clamp } from './math';
import { spawnCreature } from './spawning';

export function addRumor(ctx: Ctx, text: string, locationId?: string) {
  const rumors = ctx.state.world.rumors;
  rumors.unshift({ id: ctx.newId('rum'), day: ctx.state.world.time.day, text, locationId });
  if (rumors.length > 15) rumors.length = 15;
  ctx.emit({ type: 'rumor_spread', actorId: 'world', data: { text, locationId } });
}

export function changeLocation(ctx: Ctx, locationId: string, field: 'prosperity' | 'danger' | 'security', delta: number) {
  const loc = ctx.state.world.locations[locationId];
  if (!loc || !delta) return;
  loc[field] = clamp(Math.round(loc[field] + delta), 0, 100);
}

export function applyWorldEffects(ctx: Ctx, effects: WorldEffect[]) {
  const { state } = ctx;
  for (const eff of effects) {
    switch (eff.type) {
      case 'danger':
      case 'prosperity':
      case 'security':
        changeLocation(ctx, eff.locationId, eff.type, eff.delta);
        break;
      case 'spawn':
        for (let i = 0; i < eff.count; i++) spawnCreature(ctx, eff.locationId, eff.creatureId);
        break;
      case 'resource': {
        const loc = state.world.locations[eff.locationId];
        if (loc) loc.resources[eff.itemId] = Math.max(0, (loc.resources[eff.itemId] ?? 0) + eff.delta);
        break;
      }
      case 'faction_influence': {
        const f = state.world.factions[eff.factionId];
        if (f) {
          f.influence = clamp(f.influence + eff.delta, 0, 100);
          ctx.emit({ type: 'faction_influence_changed', actorId: 'world', data: { factionId: f.id, delta: eff.delta, value: f.influence } });
        }
        break;
      }
      case 'rumor':
        addRumor(ctx, eff.text);
        break;
      case 'price':
        // Les multiplicateurs de prix sont lus dynamiquement tant que l'événement est actif.
        break;
    }
  }
}

function eligible(ctx: Ctx, def: WorldEventDef): boolean {
  const { state } = ctx;
  const c = def.conditions;
  if (state.world.activeEvents.some((e) => e.eventId === def.id)) return false;
  if (!c) return true;
  if (c.minDay !== undefined && state.world.time.day < c.minDay) return false;
  const loc = (id: string) => state.world.locations[id];
  if (c.locationDangerAbove && (loc(c.locationDangerAbove.locationId)?.danger ?? 0) <= c.locationDangerAbove.value) return false;
  if (c.locationProsperityBelow && (loc(c.locationProsperityBelow.locationId)?.prosperity ?? 100) >= c.locationProsperityBelow.value) return false;
  if (c.locationProsperityAbove && (loc(c.locationProsperityAbove.locationId)?.prosperity ?? 0) <= c.locationProsperityAbove.value) return false;
  return true;
}

export function triggerWorldEvent(ctx: Ctx, eventId: string) {
  const def = CONTENT.worldEvents[eventId];
  if (!def) return;
  const uid = ctx.newId('wev');
  ctx.state.world.activeEvents.push({ uid, eventId, startDay: ctx.state.world.time.day, endDay: ctx.state.world.time.day + def.durationDays });
  applyWorldEffects(ctx, def.effects);
  ctx.emit({ type: 'world_event_triggered', actorId: 'world', data: { uid, eventId } });
  addRumor(ctx, def.rumor);
}

/** Tick quotidien : fin des événements expirés, puis tirage éventuel d'un nouvel événement. */
export function dailyWorldEvents(ctx: Ctx) {
  const { state, rng } = ctx;
  const day = state.world.time.day;
  for (const active of [...state.world.activeEvents]) {
    if (active.endDay > day) continue;
    const def = CONTENT.worldEvents[active.eventId];
    applyWorldEffects(ctx, def?.endEffects ?? []);
    state.world.activeEvents = state.world.activeEvents.filter((e) => e.uid !== active.uid);
    ctx.emit({ type: 'world_event_ended', actorId: 'world', data: { uid: active.uid, eventId: active.eventId } });
  }
  if (state.world.activeEvents.length < 3 && rng.chance(0.45)) {
    const pick = rng.weighted(CONTENT.lists.worldEvents.filter((e) => eligible(ctx, e)), (e) => e.weight);
    if (pick) triggerWorldEvent(ctx, pick.id);
  }
}
