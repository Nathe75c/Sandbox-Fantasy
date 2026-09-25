/**
 * Validation du contenu : vérifie que toutes les références entre fichiers de
 * données existent (items, métiers, lieux, PNJ, factions...). Lancée par les tests
 * (`npm test`) : toute faute de frappe dans un id est détectée immédiatement.
 */
import { CONTENT } from './index';
import { STAT_IDS } from './stats';

export function validateContent(): string[] {
  const errors: string[] = [];
  const C = CONTENT;
  const need = (ok: unknown, msg: string) => {
    if (!ok) errors.push(msg);
  };
  const item = (id: string, where: string) => need(C.items[id], `${where} : item inconnu « ${id} »`);
  const job = (id: string, where: string) => need(C.jobs[id], `${where} : métier inconnu « ${id} »`);
  const loc = (id: string, where: string) => need(C.locations[id], `${where} : lieu inconnu « ${id} »`);
  const faction = (id: string, where: string) => need(C.factions[id], `${where} : faction inconnue « ${id} »`);
  const race = (id: string, where: string) => need(C.races[id], `${where} : race inconnue « ${id} »`);
  const stats = (mods: Record<string, unknown>, where: string) =>
    Object.keys(mods).forEach((s) => need(STAT_IDS.includes(s as never), `${where} : statistique inconnue « ${s} »`));

  // Doublons d'id
  for (const [name, list] of Object.entries(C.lists)) {
    const seen = new Set<string>();
    for (const e of list as { id: string }[]) {
      need(!seen.has(e.id), `${name} : id en double « ${e.id} »`);
      seen.add(e.id);
    }
  }

  for (const t of C.lists.traits) {
    stats(t.statModifiers, `trait ${t.id}`);
    Object.keys(t.jobBonuses ?? {}).forEach((j) => job(j, `trait ${t.id}`));
    (t.excludes ?? []).forEach((x) => need(C.traits[x], `trait ${t.id} : exclusion inconnue ${x}`));
  }
  for (const o of C.lists.origins) {
    stats(o.statModifiers, `origine ${o.id}`);
    o.startingItems.forEach((s) => item(s.itemId, `origine ${o.id}`));
    o.startingJobs.forEach((j) => job(j, `origine ${o.id}`));
    o.startLocations.forEach((l) => loc(l.locationId, `origine ${o.id}`));
    Object.keys(o.startingReputation).forEach((f) => faction(f, `origine ${o.id}`));
  }
  for (const i of C.lists.items) {
    i.relatedJobs.forEach((j) => job(j, `item ${i.id}`));
    i.availability?.locations?.forEach((l) => loc(l, `item ${i.id}`));
    i.availability?.factions?.forEach((f) => faction(f, `item ${i.id}`));
    for (const e of i.effects ?? []) if (e.type === 'learn_recipe') need(C.recipes[e.recipeId], `item ${i.id} : recette inconnue ${e.recipeId}`);
    for (const e of i.effects ?? []) if (e.type === 'unlock' && e.key.startsWith('job:')) job(e.key.slice(4), `item ${i.id}`);
  }
  for (const j of C.lists.jobs) {
    [...j.tools, ...j.resourcesUsed, ...j.produces].forEach((x) => item(x, `métier ${j.id}`));
    [...j.dependsOn, ...j.feeds].forEach((x) => job(x, `métier ${j.id}`));
    stats(Object.fromEntries(j.keyStats.map((s) => [s, 1])), `métier ${j.id}`);
    if (j.guildFactionId) faction(j.guildFactionId, `métier ${j.id}`);
  }
  for (const r of C.lists.recipes) {
    job(r.jobId, `recette ${r.id}`);
    [...r.inputs, ...r.outputs].forEach((s) => item(s.itemId, `recette ${r.id}`));
    r.tools.forEach((t) => item(t, `recette ${r.id} (outil)`));
    need(r.outputs.length > 0, `recette ${r.id} : aucune sortie`);
  }
  for (const f of C.lists.factions) {
    f.raceIds.forEach((r) => race(r, `faction ${f.id}`));
    Object.keys(f.relations).forEach((x) => faction(x, `faction ${f.id}`));
    f.homeLocations.forEach((l) => loc(l, `faction ${f.id}`));
  }
  for (const r of C.lists.races) {
    stats(r.statModifiers, `race ${r.id}`);
    r.habitats.forEach((l) => loc(l, `race ${r.id}`));
    r.factions.forEach((f) => faction(f, `race ${r.id}`));
    Object.keys(r.relations).forEach((x) => race(x, `race ${r.id}`));
    [...r.items.uses, ...r.items.sells, ...r.items.crafts].forEach((x) => item(x, `race ${r.id}`));
  }
  for (const c of C.lists.creatures) {
    c.habitats.forEach((l) => loc(l, `créature ${c.id}`));
    c.drops.forEach((d) => item(d.itemId, `créature ${c.id}`));
    Object.keys(c.relations).forEach((x) => need(C.factions[x] || C.races[x], `créature ${c.id} : relation inconnue ${x}`));
    Object.keys(c.reputationOnKill ?? {}).forEach((f) => faction(f, `créature ${c.id}`));
    if (c.raceId) race(c.raceId, `créature ${c.id}`);
    if (c.factionId) faction(c.factionId, `créature ${c.id}`);
  }
  for (const l of C.lists.locations) {
    if (l.parentId) loc(l.parentId, `lieu ${l.id}`);
    if (l.factionId) faction(l.factionId, `lieu ${l.id}`);
    for (const c of l.connections) {
      loc(c.to, `lieu ${l.id}`);
      const back = C.locations[c.to]?.connections.find((x) => x.to === l.id);
      need(back, `lieu ${l.id} -> ${c.to} : connexion retour manquante`);
    }
    l.gatherables.forEach((g) => {
      item(g.itemId, `lieu ${l.id}`);
      job(g.jobId, `lieu ${l.id}`);
    });
    l.creatureSpawns.forEach((s) => need(C.creatures[s.creatureId], `lieu ${l.id} : créature inconnue ${s.creatureId}`));
    l.workJobs.forEach((j) => job(j, `lieu ${l.id}`));
    for (const s of l.shops) {
      s.sells.forEach((x) => item(x, `boutique ${s.id}`));
      if (s.ownerNpcId) need(C.npcs[s.ownerNpcId], `boutique ${s.id} : PNJ inconnu ${s.ownerNpcId}`);
    }
  }
  for (const n of C.lists.npcs) {
    race(n.raceId, `PNJ ${n.id}`);
    job(n.jobId, `PNJ ${n.id}`);
    if (n.factionId) faction(n.factionId, `PNJ ${n.id}`);
    loc(n.homeLocationId, `PNJ ${n.id}`);
    n.habits.forEach((h) => loc(h.locationId, `PNJ ${n.id}`));
    n.possessions.items.forEach((i) => item(i.itemId, `PNJ ${n.id}`));
    Object.keys(n.relations).forEach((x) => need(C.npcs[x], `PNJ ${n.id} : relation inconnue ${x}`));
    if (n.shopId) need(C.shops[n.shopId], `PNJ ${n.id} : boutique inconnue ${n.shopId}`);
    (n.teaches ?? []).forEach((j) => job(j, `PNJ ${n.id}`));
    n.wants.forEach((w) => item(w.itemId, `PNJ ${n.id}`));
    (n.specialOptions ?? []).forEach((o) => Object.keys(o.reputation ?? {}).forEach((f) => faction(f, `PNJ ${n.id}`)));
  }
  for (const e of C.lists.worldEvents) {
    for (const eff of e.effects.concat(e.endEffects ?? [])) {
      if ('locationId' in eff && eff.locationId !== '*') loc(eff.locationId, `événement ${e.id}`);
      if (eff.type === 'spawn') need(C.creatures[eff.creatureId], `événement ${e.id} : créature inconnue`);
      if (eff.type === 'resource') item(eff.itemId, `événement ${e.id}`);
      if (eff.type === 'price') (eff.itemIds ?? []).forEach((i) => item(i, `événement ${e.id}`));
      if (eff.type === 'faction_influence') faction(eff.factionId, `événement ${e.id}`);
    }
  }
  return errors;
}
