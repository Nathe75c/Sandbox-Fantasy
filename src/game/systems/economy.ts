/**
 * Économie : prix dynamiques, offre/demande locale, réassort des boutiques.
 *
 * Prix d'achat = valeur × indice local × marché du lieu × événements × (1 − remise)
 * Remise = charisme + niveau de marchand + opinion du boutiquier + réputation locale.
 */
import { CONTENT } from '@/data';
import type { GameState, ItemDef, PlayerState, Rarity } from '@/types';
import type { Ctx } from '../actions/context';
import { clamp } from './math';
import { effectiveStats, jobLevel } from '../state/selectors';
import { getOpinion } from './npcMemory';

export const SELL_RATIO = 0.5;
export const FENCE_RATIO = 0.7;

/** Multiplicateur de prix des événements du monde actifs pour un item dans un lieu. */
export function eventPriceMultiplier(state: GameState, locationId: string, item: ItemDef): number {
  let mult = 1;
  const parent = CONTENT.locations[locationId]?.parentId;
  for (const active of state.world.activeEvents) {
    const def = CONTENT.worldEvents[active.eventId];
    for (const eff of def?.effects ?? []) {
      if (eff.type !== 'price') continue;
      if (eff.locationId !== '*' && eff.locationId !== locationId && eff.locationId !== parent) continue;
      const matches = eff.itemIds?.includes(item.id) || eff.categories?.includes(item.category);
      if (matches) mult *= eff.multiplier;
    }
  }
  return mult;
}

/** Prix « marché » d'un item dans un lieu, sans les bonus du joueur. */
export function marketPrice(state: GameState, locationId: string, itemId: string): number {
  const item = CONTENT.items[itemId];
  const loc = CONTENT.locations[locationId];
  if (!item || !loc) return 0;
  let price = item.value;
  price *= state.world.locations[locationId]?.priceIndex[itemId] ?? 1;
  if (loc.produces.includes(item.category)) price *= 0.8;
  if (loc.demands.includes(item.category)) price *= 1.25;
  price *= eventPriceMultiplier(state, locationId, item);
  return Math.max(0.5, price);
}

/** Remise du joueur (positive = il paie moins cher / vend plus cher). */
export function playerDiscount(state: GameState, player: PlayerState, shopId: string): number {
  const shop = CONTENT.shops[shopId];
  const stats = effectiveStats(player, state.world.time);
  let discount = clamp((stats.charisme - 5) * 0.02, -0.1, 0.2);
  discount += jobLevel(player, 'marchand') * 0.03;
  if (player.equipment.bijou === 'chevaliere' || player.inventory.some((e) => e.itemId === 'balance')) discount += 0.02;
  if (shop?.ownerNpcId) discount += (getOpinion(state, shop.ownerNpcId, player) / 100) * 0.15;
  const locRep = player.localReputation[CONTENT.locations[shop?.locationId ?? '']?.parentId ?? shop?.locationId ?? ''] ?? 0;
  discount += (locRep / 100) * 0.1;
  return clamp(discount, -0.3, 0.4);
}

export function buyPrice(state: GameState, player: PlayerState, shopId: string, itemId: string): number {
  const shop = CONTENT.shops[shopId];
  if (!shop) return 0;
  if (state.world.shops[shopId]?.ownerPlayerId === player.id) return Math.max(1, Math.round(CONTENT.items[itemId].value * 0.5));
  return Math.max(1, Math.round(marketPrice(state, shop.locationId, itemId) * (1 - playerDiscount(state, player, shopId))));
}

export function sellPrice(state: GameState, player: PlayerState, shopId: string, itemId: string, stolen = false): number {
  const shop = CONTENT.shops[shopId];
  if (!shop) return 0;
  const ratio = stolen ? FENCE_RATIO * SELL_RATIO : SELL_RATIO;
  const discount = playerDiscount(state, player, shopId);
  return Math.max(0, Math.round(marketPrice(state, shop.locationId, itemId) * ratio * (1 + discount)));
}

/** La boutique rachète-t-elle cet objet ? */
export function shopBuys(shopId: string, itemId: string, stolen: boolean): { ok: boolean; reason?: string } {
  const shop = CONTENT.shops[shopId];
  const item = CONTENT.items[itemId];
  if (!shop || !item) return { ok: false, reason: 'Objet ou boutique inconnu.' };
  if (item.category === 'quete') return { ok: false, reason: 'Cet objet ne se vend pas.' };
  if (stolen && !shop.fence) return { ok: false, reason: 'Le marchand reconnaît un objet volé et refuse de l’acheter.' };
  if (item.illegal && !shop.fence) return { ok: false, reason: 'Marchandise illégale : seul un receleur l’achètera.' };
  if (!shop.fence && !shop.buysCategories.includes(item.category) && !shop.sells.includes(itemId))
    return { ok: false, reason: 'Ce marchand n’achète pas ce genre d’objet.' };
  return { ok: true };
}

/** Offre et demande : vendre fait baisser le prix local, acheter le fait monter. */
export function shiftPriceIndex(state: GameState, locationId: string, itemId: string, delta: number) {
  const loc = state.world.locations[locationId];
  if (!loc) return;
  loc.priceIndex[itemId] = clamp((loc.priceIndex[itemId] ?? 1) + delta, 0.5, 2);
}

const RESTOCK_TARGET: Record<Rarity, number> = { mediocre: 4, commun: 8, peu_commun: 4, rare: 1, epique: 1, legendaire: 0 };

/** Stock initial / cible d'un item dans une boutique. */
export function stockTarget(itemId: string): number {
  return RESTOCK_TARGET[CONTENT.items[itemId]?.rarity ?? 'commun'];
}

/** Tick quotidien : réassort, or des boutiques, retour des prix vers la normale. */
export function dailyEconomy(ctx: Ctx) {
  const { state, rng } = ctx;
  for (const shop of Object.values(state.world.shops)) {
    const def = CONTENT.shops[shop.id];
    if (!def) continue;
    const prosperity = state.world.locations[shop.locationId]?.prosperity ?? 50;
    let changed = false;
    for (const itemId of def.sells) {
      const target = stockTarget(itemId);
      const current = shop.stock[itemId] ?? 0;
      if (current < target && rng.chance(0.3 + prosperity / 200)) {
        shop.stock[itemId] = Math.min(target, current + rng.int(1, 2));
        changed = true;
      }
    }
    const goldTarget = def.startingGold * (0.5 + prosperity / 100);
    if (shop.gold < goldTarget) shop.gold = Math.round(shop.gold + (goldTarget - shop.gold) * 0.3);
    if (changed) ctx.emit({ type: 'shop_stock_updated', actorId: 'world', data: { shopId: shop.id } });
  }
  for (const loc of Object.values(state.world.locations)) {
    for (const [itemId, index] of Object.entries(loc.priceIndex)) {
      if (index === undefined) continue;
      const next = 1 + (index - 1) * 0.85;
      if (Math.abs(next - 1) < 0.02) delete loc.priceIndex[itemId];
      else loc.priceIndex[itemId] = Math.round(next * 1000) / 1000;
    }
  }
}
