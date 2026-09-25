/**
 * Interactions sociales : dialogues, aide, menaces, vol, factions.
 * Chaque interaction importante laisse un SOUVENIR chez le PNJ (et parfois chez les témoins).
 */
import { CONTENT } from '@/data';
import type { GameAction, PlayerState } from '@/types';
import { fail, type Ctx } from './context';
import { itemName, requireFree, requireNpcHere } from './helpers';
import { countItem, effectiveStats, jobLevel, opinionTier, playerTags } from '../state/selectors';
import { addMemory, changeOpinion, getOpinion, witnesses } from '../systems/npcMemory';
import { checkChance, roll } from '../systems/checks';
import { clamp } from '../systems/math';
import { advanceTime } from '../systems/time';
import { addItem, removeItem } from '../systems/inventory';
import {
  applyFactionOpinions,
  changeFactionReputation,
  changeLocalReputation,
  changeNotoriety,
  locationFaction,
} from '../systems/reputation';
import { gainJobXp, learnJob, gainPlayerXp } from '../systems/jobs';

type P<T extends GameAction['type']> = Extract<GameAction, { type: T }>['payload'];

/** Réplique du PNJ selon son opinion et son humeur. */
export function npcLine(ctx: Ctx, npcId: string, player: PlayerState): string {
  const def = CONTENT.npcs[npcId];
  const tier = opinionTier(getOpinion(ctx.state, npcId, player));
  const order = ['hostile', 'mefiant', 'neutre', 'amical', 'allie'] as const;
  // Si aucune réplique pour ce palier, on prend la plus proche.
  const idx = order.indexOf(tier);
  const candidates = [idx, idx - 1, idx + 1, idx - 2, idx + 2].map((i) => order[i]).filter(Boolean);
  for (const t of candidates) {
    const lines = def.lines[t];
    if (lines?.length) return ctx.rng.pick(lines);
  }
  return '...';
}

export function talk(ctx: Ctx, player: PlayerState, payload: P<'talk'>) {
  requireFree(player);
  const npc = requireNpcHere(ctx, player, payload.npcId);
  const def = CONTENT.npcs[payload.npcId];
  const stats = effectiveStats(player, ctx.state.world.time);
  const day = ctx.state.world.time.day;
  const tier = () => opinionTier(getOpinion(ctx.state, def.id, player));
  const emitTalk = (success?: boolean) =>
    ctx.emit({ type: 'npc_talked', actorId: player.id, data: { npcId: def.id, option: payload.option, success } });

  if (!npc.memories.some((m) => m.playerId === player.id)) {
    addMemory(ctx, def.id, player, 'rencontre', 0, 'Première rencontre.', { lasting: true });
  }

  switch (payload.option) {
    case 'discuter': {
      const line = npcLine(ctx, def.id, player);
      if (npc.lastTalk[player.id] !== day && tier() !== 'hostile') {
        npc.lastTalk[player.id] = day;
        const bonus = stats.charisme >= 8 ? 2 : 1;
        changeOpinion(ctx, def.id, player, bonus + (npc.mood > 0 ? 1 : 0));
      }
      advanceTime(ctx, 1);
      emitTalk();
      ctx.say(`${def.name} : « ${line} »`, 'info', player.id);
      return;
    }
    case 'rumeurs': {
      if (tier() === 'hostile' || tier() === 'mefiant') fail(`${def.name} n’a rien à vous dire.`);
      const pool = [...(def.rumors ?? []), ...ctx.state.world.rumors.slice(0, 5).map((r) => r.text)];
      const rumor = pool.length ? ctx.rng.pick(pool) : 'Rien de neuf, ces temps-ci.';
      advanceTime(ctx, 1);
      emitTalk();
      ctx.say(`${def.name} vous confie : « ${rumor} »`, 'info', player.id);
      return;
    }
    case 'flatter': {
      const key = `flatter:${def.id}:${day}`;
      if (player.counters[key]) fail(`${def.name} se méfie des compliments répétés. Revenez demain.`);
      player.counters[key] = 1;
      const r = roll(ctx.rng, checkChance(stats.charisme, 35 + (def.socialStatus === 'noble' ? 10 : 0)), stats.chance);
      advanceTime(ctx, 1);
      emitTalk(r.success);
      if (r.success) {
        addMemory(ctx, def.id, player, 'flatterie', r.critical ? 10 : 6, 'M’a dit des choses agréables.', { lasting: false });
        ctx.say(`${def.name} sourit, flatté.`, 'success', player.id);
      } else {
        changeOpinion(ctx, def.id, player, -3);
        ctx.say(`${def.name} lève les yeux au ciel. Trop grossier.`, 'warning', player.id);
      }
      return;
    }
    case 'menacer': {
      const power = Math.max(stats.force, stats.volonte) + (player.traitIds.includes('tete_brulee') ? 2 : 0);
      const r = roll(ctx.rng, checkChance(power, def.perception * 3 + (def.combat ? 20 : 0)), stats.chance);
      advanceTime(ctx, 1);
      emitTalk(r.success);
      if (r.success) {
        const gold = Math.min(npc.gold, Math.max(5, Math.round(npc.gold * 0.15)));
        npc.gold -= gold;
        player.gold += gold;
        addMemory(ctx, def.id, player, 'menace', -30, `M’a menacé et extorqué ${gold} po.`, { lasting: true });
        ctx.say(`${def.name}, terrifié, vous donne ${gold} po. Il ne l’oubliera pas.`, 'warning', player.id);
      } else {
        addMemory(ctx, def.id, player, 'menace', -18, 'A tenté de m’intimider. Pathétique.', { lasting: true });
        ctx.say(`${def.name} ne se laisse pas impressionner.`, 'danger', player.id);
      }
      changeNotoriety(ctx, player, 5);
      changeLocalReputation(ctx, player, player.locationId, -5, `Menace envers ${def.name}`);
      for (const w of witnesses(ctx, player.locationId, [def.id])) addMemory(ctx, w.id, player, 'menace', -6, `L’ai vu menacer ${def.name}.`, { lasting: false });
      return;
    }
    case 'insulter': {
      advanceTime(ctx, 1);
      emitTalk();
      addMemory(ctx, def.id, player, 'insulte', -12, 'M’a insulté.', { lasting: true });
      if (def.factionId) applyFactionOpinions(ctx, player, 'insulte', 2, `Insulte envers ${def.name}`, [def.factionId]);
      ctx.say(`${def.name} vous fusille du regard.`, 'warning', player.id);
      return;
    }
    case 'aider': {
      const idx = payload.wantIndex ?? -1;
      const want = def.wants[idx];
      if (!want) fail('Que voulez-vous apporter ?');
      if (npc.fulfilledWants.includes(idx)) fail(`${def.name} n’a plus besoin de cela.`);
      if (tier() === 'hostile') fail(`${def.name} refuse votre aide.`);
      if (countItem(player, want.itemId) < want.qty) fail(`Il vous faut ${want.qty} × ${itemName(want.itemId)}.`);
      const stolen = removeItem(player, want.itemId, want.qty);
      npc.fulfilledWants.push(idx);
      player.gold += want.reward;
      advanceTime(ctx, 1);
      emitTalk(true);
      ctx.emit({ type: 'item_given', actorId: player.id, data: { itemId: want.itemId, qty: want.qty, npcId: def.id } });
      addMemory(ctx, def.id, player, 'aide', 15, `M’a apporté ${want.qty} × ${itemName(want.itemId)} quand j’en avais besoin.`, { lasting: true });
      changeLocalReputation(ctx, player, player.locationId, 4, `Aide à ${def.name}`);
      if (def.factionId) changeFactionReputation(ctx, player, def.factionId, 3, `Aide à ${def.name}`);
      gainPlayerXp(ctx, player, 20);
      ctx.say(`${def.name} vous remercie chaleureusement et vous donne ${want.reward} po.`, 'success', player.id);
      if (stolen > 0 && ctx.rng.chance(0.3)) {
        addMemory(ctx, def.id, player, 'arnaque', -25, 'Ce qu’il m’a apporté était volé !', { lasting: true });
        ctx.say(`${def.name} reconnaît des objets volés... Sa gratitude se change en colère.`, 'danger', player.id);
      }
      return;
    }
    case 'special': {
      const option = def.specialOptions?.[payload.specialIndex ?? -1];
      if (!option) fail('Option inconnue.');
      if (!playerTags(player).includes(option.tag)) fail('Cette option ne vous est pas accessible.');
      const key = `special:${def.id}:${payload.specialIndex}`;
      if (player.counters[key]) fail('Vous avez déjà eu cette conversation.');
      player.counters[key] = 1;
      advanceTime(ctx, 1);
      emitTalk(true);
      addMemory(ctx, def.id, player, 'rencontre', option.opinion, option.label, { lasting: true });
      for (const [f, d] of Object.entries(option.reputation ?? {})) changeFactionReputation(ctx, player, f, d ?? 0, option.label);
      if (option.gold) player.gold += option.gold;
      ctx.say(`${def.name} : « ${option.reply} »${option.gold ? ` (+${option.gold} po)` : ''}`, 'success', player.id);
      return;
    }
  }
}

/** Chance de réussite d'un vol (%). */
export function stealChance(ctx: Ctx, player: PlayerState, perception: number) {
  const stats = effectiveStats(player, ctx.state.world.time);
  const security = ctx.state.world.locations[player.locationId]?.security ?? 50;
  return clamp(Math.round(35 + stats.discretion * 4 + stats.agilite + jobLevel(player, 'voleur') * 5 - perception * 3 - security / 5), 5, 90);
}

export function steal(ctx: Ctx, player: PlayerState, { shopId, npcId }: P<'steal'>) {
  requireFree(player);
  const stats = effectiveStats(player, ctx.state.world.time);
  let victimId: string | undefined;
  let perception: number;
  if (shopId) {
    const def = CONTENT.shops[shopId];
    if (!def || def.locationId !== player.locationId) fail('Cette boutique n’est pas ici.');
    if (ctx.state.world.shops[shopId].ownerPlayerId === player.id) fail('Voler sa propre boutique ? Étrange idée.');
    victimId = def.ownerNpcId;
    perception = victimId ? CONTENT.npcs[victimId].perception : 8;
  } else if (npcId) {
    requireNpcHere(ctx, player, npcId);
    victimId = npcId;
    perception = CONTENT.npcs[npcId].perception;
  } else fail('Voler qui ?');

  const chance = stealChance(ctx, player, perception);
  const r = roll(ctx.rng, chance, stats.chance);
  advanceTime(ctx, 1);
  if (!player.jobs.voleur && r.success) learnJob(ctx, player, 'voleur');
  const victimName = victimId ? CONTENT.npcs[victimId].name : 'le marchand';

  if (r.success) {
    let what = '';
    if (shopId) {
      const shop = ctx.state.world.shops[shopId];
      const available = Object.entries(shop.stock).filter(([, q]) => (q ?? 0) > 0);
      if (!available.length) fail('Il n’y a rien à voler ici.');
      const [itemId] = ctx.rng.pick(available);
      shop.stock[itemId] = (shop.stock[itemId] ?? 1) - 1;
      addItem(player, itemId, 1, true);
      what = itemName(itemId);
      ctx.emit({ type: 'item_stolen', actorId: player.id, data: { itemId, qty: 1, fromShopId: shopId, fromNpcId: victimId, caught: false } });
    } else {
      const npc = ctx.state.world.npcs[victimId!];
      const gold = Math.min(npc.gold, ctx.rng.int(3, 10) + Math.round(npc.gold * 0.1) + (r.critical ? 10 : 0));
      npc.gold -= gold;
      player.gold += gold;
      what = `${gold} po`;
      ctx.emit({ type: 'item_stolen', actorId: player.id, data: { itemId: 'or', qty: gold, fromNpcId: victimId, caught: false } });
    }
    gainJobXp(ctx, player, 'voleur', 12);
    changeFactionReputation(ctx, player, 'main_grise', 1, 'Vol réussi');
    // La victime découvre le vol plus tard, sans savoir qui : la sécurité du lieu augmente.
    const loc = ctx.state.world.locations[player.locationId];
    loc.security = Math.min(100, loc.security + 2);
    ctx.say(`Vous dérobez ${what} sans être vu. (${chance} %)`, 'success', player.id);
    return;
  }

  // Pris la main dans le sac
  ctx.emit({ type: 'item_stolen', actorId: player.id, data: { itemId: shopId ? 'objet' : 'or', qty: 0, fromShopId: shopId, fromNpcId: victimId, caught: true } });
  if (victimId) addMemory(ctx, victimId, player, shopId ? 'vol_boutique' : 'vol', -35, shopId ? 'A tenté de voler dans ma boutique !' : 'A tenté de me faire les poches !', { lasting: true });
  for (const w of witnesses(ctx, player.locationId, victimId ? [victimId] : [])) addMemory(ctx, w.id, player, 'vol', -12, `L’ai vu voler ${victimName}.`, { lasting: true });
  changeLocalReputation(ctx, player, player.locationId, -10, 'Vol raté');
  const faction = locationFaction(player.locationId);
  if (faction) changeFactionReputation(ctx, player, faction, -5, 'Vol raté');
  applyFactionOpinions(ctx, player, shopId ? 'vol_boutique' : 'vol', 2, 'Vol raté', ['couronne', 'guilde_marchande', 'temple_aube']);
  changeNotoriety(ctx, player, 15);
  ctx.say(`${victimName} vous prend la main dans le sac ! (${chance} %)`, 'danger', player.id);

  // Les gardes interviennent si la notoriété est élevée et le lieu sécurisé.
  const loc = ctx.state.world.locations[player.locationId];
  if (player.notoriety >= 30 && loc.security >= 40) {
    const fine = Math.min(player.gold, 20 + Math.round(player.gold * 0.25));
    player.gold -= fine;
    changeNotoriety(ctx, player, -10);
    ctx.say(`Les gardes vous arrêtent. Amende : ${fine} po.`, 'danger', player.id);
  }
}

export function joinFaction(ctx: Ctx, player: PlayerState, { factionId }: P<'join_faction'>) {
  requireFree(player);
  const def = CONTENT.factions[factionId];
  if (!def) fail('Faction inconnue.');
  if (player.factionId === factionId) fail('Vous en faites déjà partie.');
  const rep = player.factionReputation[factionId] ?? 0;
  if (rep < 25) fail(`${def.name} exige une réputation d’au moins 25 (vous : ${rep}).`);
  if (!def.homeLocations.includes(player.locationId) && !def.homeLocations.includes(CONTENT.locations[player.locationId]?.parentId ?? ''))
    fail(`Rendez-vous dans un lieu de ${def.name} pour la rejoindre.`);
  const previous = player.factionId;
  player.factionId = factionId;
  changeFactionReputation(ctx, player, factionId, 10, 'Adhésion');
  if (previous) changeFactionReputation(ctx, player, previous, -20, 'Départ de la faction');
  for (const [other, relation] of Object.entries(def.relations)) if ((relation ?? 0) <= -50) changeFactionReputation(ctx, player, other, -10, `Membre de ${def.name}`);
  ctx.emit({ type: 'faction_joined', actorId: player.id, data: { factionId } });
  ctx.say(`Vous rejoignez ${def.name}.`, 'success', player.id);
}
