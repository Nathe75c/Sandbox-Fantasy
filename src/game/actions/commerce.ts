/**
 * Achat, vente et rachat de boutiques.
 */
import { CONTENT } from '@/data';
import type { GameAction, PlayerState } from '@/types';
import { fail, type Ctx } from './context';
import { itemName, requireFree } from './helpers';
import { countItem, opinionTier } from '../state/selectors';
import { buyPrice, sellPrice, shiftPriceIndex, shopBuys } from '../systems/economy';
import { addItem, removeItem } from '../systems/inventory';
import { addMemory, getOpinion } from '../systems/npcMemory';
import { gainJobXp } from '../systems/jobs';
import { changeFactionReputation, locationFaction } from '../systems/reputation';
import { advanceTime } from '../systems/time';

type P<T extends GameAction['type']> = Extract<GameAction, { type: T }>['payload'];

function openShop(ctx: Ctx, player: PlayerState, shopId: string) {
  const def = CONTENT.shops[shopId];
  const shop = ctx.state.world.shops[shopId];
  if (!def || !shop) fail('Boutique inconnue.');
  if (def.locationId !== player.locationId) fail('Cette boutique n’est pas ici.');
  if (shop.ownerPlayerId !== player.id && def.ownerNpcId && opinionTier(getOpinion(ctx.state, def.ownerNpcId, player)) === 'hostile')
    fail(`${CONTENT.npcs[def.ownerNpcId]?.name} refuse de faire affaire avec vous.`);
  return { def, shop };
}

/** Une transaction régulière avec un boutiquier renforce (un peu) la relation. */
function tradeMemory(ctx: Ctx, player: PlayerState, npcId: string | undefined, amount: number) {
  if (!npcId || amount < 25) return;
  const key = `trade:${npcId}:${ctx.state.world.time.day}`;
  if (player.counters[key]) return;
  player.counters[key] = 1;
  addMemory(ctx, npcId, player, 'commerce', 2, `Nous avons fait affaire (${amount} po).`, { lasting: false });
}

export function buy(ctx: Ctx, player: PlayerState, { shopId, itemId, qty }: P<'buy'>) {
  requireFree(player);
  const { def, shop } = openShop(ctx, player, shopId);
  const n = Math.max(1, Math.floor(qty));
  if ((shop.stock[itemId] ?? 0) < n) fail('Stock insuffisant.');
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += buyPrice(ctx.state, player, shopId, itemId);
    shiftPriceIndex(ctx.state, def.locationId, itemId, 0.02);
  }
  if (player.gold < total) fail(`Il vous faut ${total} po (vous avez ${player.gold} po).`);
  player.gold -= total;
  shop.gold += total;
  shop.stock[itemId] = (shop.stock[itemId] ?? 0) - n;
  addItem(player, itemId, n);
  if (player.jobs.marchand) gainJobXp(ctx, player, 'marchand', Math.ceil(total / 20));
  tradeMemory(ctx, player, def.ownerNpcId, total);
  ctx.emit({ type: 'item_bought', actorId: player.id, data: { shopId, itemId, qty: n, price: total } });
  ctx.say(`Vous achetez ${n} × ${itemName(itemId)} pour ${total} po.`, 'success', player.id);
}

export function sell(ctx: Ctx, player: PlayerState, { shopId, itemId, qty, stolen = false }: P<'sell'>) {
  requireFree(player);
  const { def, shop } = openShop(ctx, player, shopId);
  const n = Math.max(1, Math.floor(qty));
  if (countItem(player, itemId, stolen) < n) fail('Vous n’avez pas cette quantité.');
  const accepted = shopBuys(shopId, itemId, stolen);
  if (!accepted.ok) fail(accepted.reason!);
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += sellPrice(ctx.state, player, shopId, itemId, stolen);
    shiftPriceIndex(ctx.state, def.locationId, itemId, -0.03);
  }
  if (shop.gold < total) fail(`La boutique n’a que ${shop.gold} po en caisse.`);
  removeItem(player, itemId, n, stolen);
  player.gold += total;
  shop.gold -= total;
  if (def.sells.includes(itemId)) shop.stock[itemId] = (shop.stock[itemId] ?? 0) + n;
  if (player.jobs.marchand) gainJobXp(ctx, player, 'marchand', Math.ceil(total / 15));
  if (stolen) changeFactionReputation(ctx, player, 'main_grise', 1, 'Recel');
  tradeMemory(ctx, player, def.ownerNpcId, total);
  ctx.emit({ type: 'item_sold', actorId: player.id, data: { shopId, itemId, qty: n, price: total, stolen } });
  ctx.say(`Vous vendez ${n} × ${itemName(itemId)} pour ${total} po.`, 'success', player.id);
}

export function buyShop(ctx: Ctx, player: PlayerState, { shopId }: P<'buy_shop'>) {
  requireFree(player);
  const { def, shop } = openShop(ctx, player, shopId);
  if (!def.purchasePrice) fail('Cette boutique n’est pas à vendre.');
  if (shop.ownerPlayerId) fail('Cette boutique a déjà un propriétaire.');
  if (countItem(player, 'licence_commerce') <= 0) fail('Il vous faut une licence de commerce (vendue au château de Valcourt ou à la Guilde).');
  if (player.gold < def.purchasePrice) fail(`Prix : ${def.purchasePrice} po.`);
  player.gold -= def.purchasePrice;
  shop.ownerPlayerId = player.id;
  player.ownedShopIds.push(shopId);
  if (def.ownerNpcId) {
    ctx.state.world.npcs[def.ownerNpcId].gold += def.purchasePrice;
    addMemory(ctx, def.ownerNpcId, player, 'commerce', 10, 'M’a racheté ma boutique à bon prix. Je reste pour la tenir.', { lasting: true });
  }
  const faction = locationFaction(def.locationId);
  if (faction) changeFactionReputation(ctx, player, faction, 3, 'Nouveau commerce');
  advanceTime(ctx, 1);
  ctx.emit({ type: 'shop_purchased', actorId: player.id, data: { shopId, price: def.purchasePrice } });
  ctx.say(`Vous êtes désormais propriétaire de « ${def.name} ». Elle vous rapportera chaque jour selon la prospérité du lieu, et vous y achetez à prix coûtant.`, 'success', player.id);
}
