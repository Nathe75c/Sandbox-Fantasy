/**
 * Simulation du monde : ce qui se passe chaque jour, même sans le joueur.
 *
 * Ordre du tick quotidien :
 *  1. ressources récoltables qui repoussent
 *  2. économie (réassort, or des boutiques, prix qui reviennent à la normale)
 *  3. PNJ qui voyagent, changent d'humeur, s'enrichissent ou s'appauvrissent
 *  4. créatures qui apparaissent ou migrent
 *  5. lieux qui prospèrent ou déclinent
 *  6. factions qui gagnent ou perdent de l'influence
 *  7. événements du monde (fin / nouveaux)
 *  8. commérages entre PNJ
 *  9. conséquences durables pour les joueurs (revenus, vengeance, reconnaissance)
 */
import { CONTENT } from '@/data';
import type { Ctx } from '../actions/context';
import { clamp } from './math';
import { dailyEconomy } from './economy';
import { dailySpawns, spawnCreature } from './spawning';
import { addRumor, changeLocation, dailyWorldEvents } from './worldEvents';
import { gossip, getOpinion, addMemory } from './npcMemory';
import { addItem } from './inventory';
import { creaturesAt, opinionTier } from '../state/selectors';

export function dailyTick(ctx: Ctx) {
  ctx.emit({ type: 'day_started', actorId: 'world', data: { day: ctx.state.world.time.day } });
  regrowResources(ctx);
  dailyEconomy(ctx);
  npcLife(ctx);
  dailySpawns(ctx);
  evolveLocations(ctx);
  evolveFactions(ctx);
  dailyWorldEvents(ctx);
  gossip(ctx);
  playerConsequences(ctx);
}

function regrowResources(ctx: Ctx) {
  for (const def of CONTENT.lists.locations) {
    const loc = ctx.state.world.locations[def.id];
    if (!loc) continue;
    for (const g of def.gatherables) {
      const current = loc.resources[g.itemId] ?? 0;
      // Les régénérations fractionnaires (ressources rares) restent en réserve d'un jour à l'autre.
      loc.resources[g.itemId] = Math.min(g.stock, Math.round((current + g.regenPerDay) * 100) / 100);
    }
  }
}

function npcLife(ctx: Ctx) {
  const { state, rng } = ctx;
  for (const def of CONTENT.lists.npcs) {
    const npc = state.world.npcs[def.id];
    if (!npc?.alive) continue;
    npc.mood = rng.int(-2, 2);

    // Déplacements selon les habitudes
    if (def.travelChance > 0 && rng.chance(def.travelChance)) {
      const dest = rng.weighted(def.habits.filter((h) => h.locationId !== npc.locationId), (h) => h.weight);
      if (dest) {
        const from = npc.locationId;
        npc.locationId = dest.locationId;
        ctx.emit({ type: 'npc_moved', actorId: 'world', data: { npcId: def.id, from, to: dest.locationId } });
      }
    } else if (npc.locationId !== def.homeLocationId && rng.chance(0.5)) {
      const from = npc.locationId;
      npc.locationId = def.homeLocationId;
      ctx.emit({ type: 'npc_moved', actorId: 'world', data: { npcId: def.id, from, to: def.homeLocationId } });
    }

    // Richesse selon la prospérité du lieu
    const prosperity = state.world.locations[def.homeLocationId]?.prosperity ?? 50;
    npc.gold = Math.max(0, Math.round(npc.gold + (prosperity - 45) / 5 + rng.int(-2, 2)));

    // Un PNJ ruiné sans boutique peut changer de métier
    if (!def.shopId && npc.gold < 10 && rng.chance(0.05)) {
      const options = CONTENT.locations[def.homeLocationId]?.workJobs.filter((j) => j !== npc.jobId) ?? [];
      if (options.length) {
        npc.jobId = rng.pick(options);
        addRumor(ctx, `${def.name} a changé de métier : ${CONTENT.jobs[npc.jobId]?.name ?? npc.jobId}.`, def.homeLocationId);
      }
    }
  }
}

function evolveLocations(ctx: Ctx) {
  const { state, rng } = ctx;
  for (const def of CONTENT.lists.locations) {
    const loc = state.world.locations[def.id];
    if (!loc) continue;
    const before = { prosperity: loc.prosperity, danger: loc.danger, security: loc.security };
    const creatures = creaturesAt(state, def.id).length;
    const targetDanger = clamp(def.base.danger + creatures * 3, 0, 100);
    changeLocation(ctx, def.id, 'danger', Math.round((targetDanger - loc.danger) * 0.25));
    changeLocation(ctx, def.id, 'prosperity', Math.round((loc.security - loc.danger) / 20 + rng.int(-1, 1)));
    changeLocation(ctx, def.id, 'security', Math.round((def.base.security - loc.security) * 0.1));
    const moved =
      Math.abs(loc.prosperity - before.prosperity) >= 2 || Math.abs(loc.danger - before.danger) >= 3 || Math.abs(loc.security - before.security) >= 3;
    if (moved) {
      ctx.emit({ type: 'city_state_changed', actorId: 'world', data: { locationId: def.id, prosperity: loc.prosperity, danger: loc.danger, security: loc.security } });
      if (loc.prosperity <= 20 && before.prosperity > 20) addRumor(ctx, `${def.name} s’enfonce dans la misère.`, def.id);
      if (loc.prosperity >= 75 && before.prosperity < 75) addRumor(ctx, `${def.name} connaît une période faste.`, def.id);
    }
  }
}

function evolveFactions(ctx: Ctx) {
  const { state } = ctx;
  for (const def of CONTENT.lists.factions) {
    const f = state.world.factions[def.id];
    if (!f) continue;
    const homes = def.homeLocations.map((l) => state.world.locations[l]?.prosperity ?? 50);
    const avg = homes.length ? homes.reduce((a, b) => a + b, 0) / homes.length : 50;
    const delta = Math.round((avg - 50) / 25 + (def.baseInfluence - f.influence) * 0.05);
    if (delta) {
      f.influence = clamp(f.influence + delta, 0, 100);
      ctx.emit({ type: 'faction_influence_changed', actorId: 'world', data: { factionId: def.id, delta, value: f.influence } });
    }
  }
}

function playerConsequences(ctx: Ctx) {
  const { state, rng } = ctx;
  for (const player of Object.values(state.players)) {
    if (!player.alive) continue;

    // Revenus des boutiques possédées
    for (const shopId of player.ownedShopIds) {
      const shop = state.world.shops[shopId];
      const def = CONTENT.shops[shopId];
      if (!shop || !def) continue;
      const prosperity = state.world.locations[shop.locationId]?.prosperity ?? 50;
      const income = Math.round((def.purchasePrice ?? 300) * 0.03 * (prosperity / 50));
      player.gold += income;
      ctx.say(`${def.name} vous rapporte ${income} po aujourd’hui.`, 'success', player.id);
    }

    for (const def of CONTENT.lists.npcs) {
      const npc = state.world.npcs[def.id];
      if (!npc?.alive || npc.opinions[player.id] === undefined) continue;
      const tier = opinionTier(getOpinion(state, def.id, player));

      // Vengeance : un PNJ qui vous hait peut envoyer des hommes de main.
      if (tier === 'hostile' && npc.memories.some((m) => m.playerId === player.id && m.lasting && m.impact < 0) && rng.chance(0.08)) {
        spawnCreature(ctx, player.locationId, 'bandit');
        ctx.say(`Des hommes de main envoyés par ${def.name} vous ont retrouvé !`, 'danger', player.id);
        addMemory(ctx, def.id, player, 'menace', 10, 'J’ai envoyé des hommes régler nos comptes. Nous sommes quittes... presque.', { lasting: false });
      }

      // Reconnaissance : un allié peut offrir un cadeau.
      if (tier === 'allie' && npc.locationId === player.locationId && rng.chance(0.1)) {
        const giftItem = rng.pick(['potion_soin', 'ration', 'hydromel', 'baume']);
        addItem(player, giftItem, 1);
        ctx.say(`${def.name} vous offre ${CONTENT.items[giftItem]?.name ?? giftItem} en signe d’amitié.`, 'success', player.id);
      }
    }
  }
}
