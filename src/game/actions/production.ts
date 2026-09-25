/**
 * Récolte, artisanat, travail et apprentissage des métiers.
 */
import { CONTENT } from '@/data';
import type { GameAction, PlayerState } from '@/types';
import { fail, type Ctx } from './context';
import { itemName, requireFree, requireItems, requireNpcHere, spendEnergy } from './helpers';
import { countItem, effectiveStats, jobBonus, jobLevel, opinionTier } from '../state/selectors';
import { advanceTime } from '../systems/time';
import { checkChance, roll } from '../systems/checks';
import { addItem, removeItem } from '../systems/inventory';
import { gainJobXp, learnJob } from '../systems/jobs';
import { changeLocalReputation } from '../systems/reputation';
import { changeLocation } from '../systems/worldEvents';
import { getOpinion } from '../systems/npcMemory';

type P<T extends GameAction['type']> = Extract<GameAction, { type: T }>['payload'];

export function gather(ctx: Ctx, player: PlayerState, { itemId }: P<'gather'>) {
  requireFree(player);
  const locDef = CONTENT.locations[player.locationId];
  const spot = locDef.gatherables.find((g) => g.itemId === itemId);
  if (!spot) fail('Rien de tel à récolter ici.');
  const job = CONTENT.jobs[spot.jobId];
  if (job.tools.length && !job.tools.some((t) => countItem(player, t) > 0))
    fail(`Il vous faut un outil de ${job.name.toLowerCase()} : ${job.tools.map(itemName).join(' ou ')}.`);
  const loc = ctx.state.world.locations[player.locationId];
  const available = Math.floor(loc.resources[itemId] ?? 0);
  if (available <= 0) fail(`Il ne reste plus de ${itemName(itemId).toLowerCase()} ici. Revenez dans quelques jours.`);

  spendEnergy(player, 2);
  advanceTime(ctx, 1);
  // Un métier de récolte « libre » s'apprend en le pratiquant.
  if (!player.jobs[job.id] && job.learnable === 'libre') {
    learnJob(ctx, player, job.id);
    ctx.say(`Vous débutez comme ${job.name.toLowerCase()}.`, 'success', player.id);
  }
  const stats = effectiveStats(player, ctx.state.world.time);
  const level = jobLevel(player, job.id);
  const keyStat = stats[job.keyStats[0]];
  const r = roll(ctx.rng, checkChance(keyStat, spot.difficulty, level * 5 + jobBonus(player, job.id) * 50), stats.chance);
  if (!r.success) {
    gainJobXp(ctx, player, job.id, 3);
    ctx.say(`Vous cherchez longtemps, sans résultat. (${r.chance} % de réussite)`, 'warning', player.id);
    return;
  }
  let qty = 1 + Math.floor(level / 3) + (keyStat >= 10 ? 1 : 0) + (r.critical ? 1 : 0);
  qty = Math.min(qty, available);
  loc.resources[itemId] = Math.round(((loc.resources[itemId] ?? 0) - qty) * 100) / 100;
  addItem(player, itemId, qty);
  gainJobXp(ctx, player, job.id, 6 + Math.round(spot.difficulty / 5));
  ctx.emit({ type: 'item_gathered', actorId: player.id, data: { locationId: player.locationId, itemId, qty } });
  ctx.say(`Vous récoltez ${qty} × ${itemName(itemId)}${r.critical ? ' (trouvaille exceptionnelle !)' : ''}.`, 'success', player.id);
}

export function craft(ctx: Ctx, player: PlayerState, { recipeId }: P<'craft'>) {
  requireFree(player);
  const recipe = CONTENT.recipes[recipeId];
  if (!recipe) fail('Recette inconnue.');
  const job = CONTENT.jobs[recipe.jobId];
  const level = jobLevel(player, recipe.jobId);
  if (level < 1) fail(`Vous devez apprendre le métier de ${job.name.toLowerCase()}.`);
  if (level < recipe.level) fail(`Niveau ${recipe.level} de ${job.name.toLowerCase()} requis (vous : ${level}).`);
  if (recipe.station && !CONTENT.locations[player.locationId].stations.includes(recipe.station))
    fail(`Il faut une installation « ${recipe.station.replace(/_/g, ' ')} » dans ce lieu.`);
  for (const tool of recipe.tools) if (countItem(player, tool) <= 0) fail(`Outil requis : ${itemName(tool)}.`);
  requireItems(player, recipe.inputs);
  spendEnergy(player, recipe.energy);
  advanceTime(ctx, recipe.hours);

  const stats = effectiveStats(player, ctx.state.world.time);
  const r = roll(ctx.rng, checkChance(stats[recipe.stat], recipe.difficulty, level * 5 + jobBonus(player, recipe.jobId) * 50), stats.chance);
  if (!r.success) {
    // Échec : la moitié des ingrédients est perdue.
    for (const input of recipe.inputs) removeItem(player, input.itemId, Math.ceil(input.qty / 2));
    gainJobXp(ctx, player, recipe.jobId, Math.ceil(recipe.xp / 3));
    ctx.emit({ type: 'item_crafted', actorId: player.id, data: { recipeId, success: false, outputs: [] } });
    ctx.say(`Échec : « ${recipe.name} » est raté et une partie des matériaux est perdue. (${r.chance} %)`, 'warning', player.id);
    return;
  }
  for (const input of recipe.inputs) removeItem(player, input.itemId, input.qty);
  const outputs = recipe.outputs.map((o) => ({ itemId: o.itemId, qty: o.qty + (r.critical && o.qty > 1 ? 1 : 0) }));
  for (const o of outputs) addItem(player, o.itemId, o.qty);
  gainJobXp(ctx, player, recipe.jobId, recipe.xp);
  ctx.emit({ type: 'item_crafted', actorId: player.id, data: { recipeId, success: true, outputs } });
  ctx.say(`Vous fabriquez ${outputs.map((o) => `${o.qty} × ${itemName(o.itemId)}`).join(', ')}${r.critical ? ' — travail remarquable !' : ''}.`, 'success', player.id);
}

export function work(ctx: Ctx, player: PlayerState, { jobId, hours }: P<'work'>) {
  requireFree(player);
  const job = CONTENT.jobs[jobId];
  const locDef = CONTENT.locations[player.locationId];
  if (!job?.work) fail('Ce métier ne propose pas de travail rémunéré.');
  if (!locDef.workJobs.includes(jobId)) fail(`Personne n’embauche de ${job.name.toLowerCase()} ici.`);
  const level = jobLevel(player, jobId);
  if (level < 1) {
    if (job.learnable !== 'libre') fail(`Vous devez d’abord apprendre le métier de ${job.name.toLowerCase()}.`);
    learnJob(ctx, player, jobId);
  }
  const h = Math.max(1, Math.min(8, Math.round(hours)));
  spendEnergy(player, Math.ceil(h * 0.75));
  advanceTime(ctx, h);
  const stats = effectiveStats(player, ctx.state.world.time);
  const loc = ctx.state.world.locations[player.locationId];
  const parentProsperity = locDef.parentId ? ctx.state.world.locations[locDef.parentId]?.prosperity : undefined;
  const prosperity = parentProsperity ?? loc.prosperity;
  const gold = Math.max(1, Math.round(job.work.goldPerHour * h * (1 + Math.max(1, level) * 0.1 + (stats[job.work.stat] - 5) * 0.03) * (prosperity / 50)));
  player.gold += gold;
  gainJobXp(ctx, player, jobId, 4 * h);
  if (job.work.reputation) changeLocalReputation(ctx, player, player.locationId, job.work.reputation, `Travail de ${job.name.toLowerCase()}`);
  if (jobId === 'garde' || jobId === 'mercenaire') {
    changeLocation(ctx, player.locationId, 'danger', -2);
    changeLocation(ctx, player.locationId, 'security', 1);
  }
  ctx.emit({ type: 'job_worked', actorId: player.id, data: { jobId, hours: h, gold } });
  ctx.say(`Vous travaillez ${h} h comme ${job.name.toLowerCase()} et gagnez ${gold} po.`, 'success', player.id);
}

export function learnJobAction(ctx: Ctx, player: PlayerState, { jobId, npcId }: P<'learn_job'>) {
  requireFree(player);
  const job = CONTENT.jobs[jobId];
  if (!job) fail('Métier inconnu.');
  if (player.jobs[jobId]) fail(`Vous connaissez déjà le métier de ${job.name.toLowerCase()}.`);
  if (job.learnable === 'libre' && !npcId) {
    learnJob(ctx, player, jobId);
    ctx.say(`Vous vous lancez comme ${job.name.toLowerCase()}.`, 'success', player.id);
    return;
  }
  if (!npcId) fail(job.learnable === 'livre' ? 'Ce métier s’apprend dans un livre.' : 'Il vous faut un maître pour apprendre ce métier.');
  requireNpcHere(ctx, player, npcId);
  const npcDef = CONTENT.npcs[npcId];
  if (!npcDef.teaches?.includes(jobId)) fail(`${npcDef.name} n’enseigne pas ce métier.`);
  const tier = opinionTier(getOpinion(ctx.state, npcId, player));
  if (tier === 'hostile' || tier === 'mefiant') fail(`${npcDef.name} refuse de vous prendre comme apprenti. Gagnez d’abord sa confiance.`);
  const cost = Math.round(job.learnCost * (tier === 'amical' || tier === 'allie' ? 0.75 : 1));
  if (player.gold < cost) fail(`L’apprentissage coûte ${cost} po.`);
  spendEnergy(player, 2);
  player.gold -= cost;
  ctx.state.world.npcs[npcId].gold += cost;
  advanceTime(ctx, 2);
  learnJob(ctx, player, jobId, npcId);
  ctx.say(`${npcDef.name} vous enseigne les bases du métier de ${job.name.toLowerCase()}${cost ? ` (${cost} po)` : ''}.`, 'success', player.id);
}
