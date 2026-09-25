import { CONTENT } from '@/data';
import type { PlayerState } from '@/types';
import { fail, type Ctx } from './context';
import { countItem, effectiveStats, maxEnergy, maxHp } from '../state/selectors';
import { clamp } from '../systems/math';

export function requireFree(player: PlayerState) {
  if (!player.alive) fail('Votre personnage n’est plus en état d’agir.');
  if (player.combat) fail('Vous êtes en plein combat !');
}

export function spendEnergy(player: PlayerState, amount: number) {
  if (player.energy < amount) fail(`Vous êtes trop fatigué (énergie ${player.energy}/${amount} requise). Reposez-vous ou mangez.`);
  player.energy -= amount;
}

export function requireItems(player: PlayerState, items: { itemId: string; qty: number }[]) {
  for (const { itemId, qty } of items) {
    if (countItem(player, itemId) < qty) fail(`Il vous manque ${qty} × ${CONTENT.items[itemId]?.name ?? itemId}.`);
  }
}

export function requireNpcHere(ctx: Ctx, player: PlayerState, npcId: string) {
  const npc = ctx.state.world.npcs[npcId];
  if (!npc || !npc.alive) fail('Cette personne n’est pas là.');
  if (npc.locationId !== player.locationId) fail(`${CONTENT.npcs[npcId]?.name ?? npcId} n’est pas ici.`);
  return npc;
}

/** Recale PV et énergie dans leurs bornes (après équipement, buffs...). */
export function clampVitals(ctx: Ctx, player: PlayerState) {
  const stats = effectiveStats(player, ctx.state.world.time);
  player.hp = clamp(player.hp, 0, maxHp(stats));
  player.energy = clamp(player.energy, 0, maxEnergy(stats));
}

export function itemName(itemId: string) {
  return CONTENT.items[itemId]?.name ?? itemId;
}
