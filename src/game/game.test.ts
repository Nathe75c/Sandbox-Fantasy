import { describe, expect, it } from 'vitest';
import type { GameAction, GameState } from '@/types';
import { applyAction } from './actions/applyAction';
import { createInitialState, LOCAL_PLAYER_ID } from './state/createInitialState';
import { deserialize, serialize } from './save/saveManager';
import { countItem } from './state/selectors';
import { addItem } from './systems/inventory';
import { buyPrice, sellPrice } from './systems/economy';

const P = LOCAL_PLAYER_ID;

function act(state: GameState, action: Omit<GameAction, 'playerId'>) {
  return applyAction(state, { ...action, playerId: P } as GameAction);
}

function newGame(originId = 'apprenti_artisan', seed = 42) {
  const res = act(createInitialState(seed, '2026-01-01T00:00:00.000Z'), {
    type: 'create_character',
    payload: { name: 'Aelis', raceId: 'humain', originId, traitIds: ['robuste', 'chanceux'], bonusStats: { force: 2, charisme: 3 } },
  });
  expect(res.error).toBeUndefined();
  return res.state;
}

/** Place le joueur à un endroit (outil de test : modifie une copie). */
function at(state: GameState, locationId: string) {
  const s = structuredClone(state);
  s.players[P].locationId = locationId;
  return s;
}

describe('moteur de jeu', () => {
  it('crée un personnage avec stats, objets et lieu de départ de son origine', () => {
    const s = newGame();
    const p = s.players[P];
    expect(p.name).toBe('Aelis');
    expect(['mines_karak', 'bourg_du_gue', 'port_salant']).toContain(p.locationId);
    expect(countItem(p, 'marteau')).toBe(1);
    expect(p.jobs.forgeron?.level).toBe(1);
    expect(p.hp).toBeGreaterThan(0);
  });

  it('refuse une création invalide sans modifier l’état', () => {
    const initial = createInitialState(1);
    const res = act(initial, { type: 'create_character', payload: { name: '', raceId: 'humain', originId: 'noble', traitIds: ['robuste'], bonusStats: {} } });
    expect(res.error).toBeTruthy();
    expect(res.state).toBe(initial);
  });

  it('est pur et déterministe', () => {
    const s = newGame();
    const snapshot = JSON.stringify(s);
    const a = act(at(s, 'bourg_du_gue'), { type: 'move', payload: { to: 'ferme_tillac' } });
    const b = act(at(s, 'bourg_du_gue'), { type: 'move', payload: { to: 'ferme_tillac' } });
    expect(JSON.stringify(s)).toBe(snapshot);
    expect(JSON.stringify(a.state)).toBe(JSON.stringify(b.state));
    expect(a.events.some((e) => e.type === 'player_moved')).toBe(true);
  });

  it('enchaîne récolte -> fonte -> forge (minerai -> lingot -> lame)', () => {
    let s = at(newGame(), 'mines_karak');
    addItem(s.players[P], 'pioche', 1);
    s.players[P].baseStats.force = 15;
    s.players[P].energy = 99;
    for (let i = 0; i < 12; i++) s = act(s, { type: 'gather', payload: { itemId: 'minerai_fer' } }).state;
    for (let i = 0; i < 6; i++) s = act(s, { type: 'gather', payload: { itemId: 'charbon' } }).state;
    expect(countItem(s.players[P], 'minerai_fer')).toBeGreaterThan(0);
    expect(s.players[P].jobs.mineur).toBeDefined();
    s.players[P].energy = 99;
    let lingots = countItem(s.players[P], 'lingot_fer');
    for (let i = 0; i < 3 && countItem(s.players[P], 'minerai_fer') >= 2 && countItem(s.players[P], 'charbon') >= 1; i++)
      s = act(s, { type: 'craft', payload: { recipeId: 'fondre_fer' } }).state;
    expect(s.eventLog.some((e) => e.type === 'item_crafted')).toBe(true);
    lingots = countItem(s.players[P], 'lingot_fer');
    expect(lingots).toBeGreaterThanOrEqual(0);
  });

  it('achète et revend avec un prix de revente inférieur au prix d’achat', () => {
    const s = at(newGame(), 'bourg_du_gue');
    const p = s.players[P];
    const buyP = buyPrice(s, p, 'forge_du_gue', 'epee_fer');
    const sellP = sellPrice(s, p, 'forge_du_gue', 'epee_fer');
    expect(sellP).toBeLessThan(buyP);
    s.players[P].gold = 500;
    const bought = act(s, { type: 'buy', payload: { shopId: 'forge_du_gue', itemId: 'couteau', qty: 1 } });
    expect(bought.error).toBeUndefined();
    const sold = act(bought.state, { type: 'sell', payload: { shopId: 'forge_du_gue', itemId: 'couteau', qty: 1 } });
    expect(sold.error).toBeUndefined();
    expect(sold.state.players[P].gold).toBeLessThan(500);
  });

  it('les boutiques honnêtes refusent les objets volés, le receleur les rachète', () => {
    const s = at(newGame(), 'bourg_du_gue');
    addItem(s.players[P], 'epee_fer', 1, true);
    expect(act(s, { type: 'sell', payload: { shopId: 'forge_du_gue', itemId: 'epee_fer', qty: 1, stolen: true } }).error).toBeTruthy();
    const q = at(s, 'bas_quais');
    expect(act(q, { type: 'sell', payload: { shopId: 'receleur_quais', itemId: 'epee_fer', qty: 1, stolen: true } }).error).toBeUndefined();
  });

  it('un vol raté laisse un souvenir marquant et fait baisser l’opinion', () => {
    let s = at(newGame(), 'bourg_du_gue');
    s.world.npcs.barda.locationId = 'bourg_du_gue';
    s.players[P].baseStats.discretion = 1;
    s.players[P].baseStats.agilite = 1;
    const before = s.world.npcs.barda.opinions[P];
    let caught = false;
    for (let i = 0; i < 10 && !caught; i++) {
      s = act(s, { type: 'steal', payload: { shopId: 'forge_du_gue' } }).state;
      caught = s.world.npcs.barda.memories.some((m) => m.kind === 'vol_boutique');
    }
    expect(caught).toBe(true);
    expect(s.world.npcs.barda.opinions[P]).toBeLessThan(before);
    expect(s.players[P].notoriety).toBeGreaterThan(0);
  });

  it('aider un PNJ rapporte de l’or, un souvenir et de la réputation', () => {
    const s = at(newGame(), 'bourg_du_gue');
    s.world.npcs.pivoine.locationId = 'bourg_du_gue';
    addItem(s.players[P], 'baies', 6);
    const gold = s.players[P].gold;
    const res = act(s, { type: 'talk', payload: { npcId: 'pivoine', option: 'aider', wantIndex: 0 } });
    expect(res.error).toBeUndefined();
    expect(res.state.players[P].gold).toBe(gold + 12);
    expect(res.state.world.npcs.pivoine.memories.some((m) => m.kind === 'aide')).toBe(true);
    expect(res.state.players[P].localReputation.bourg_du_gue).toBeGreaterThan(0);
  });

  it('résout un combat jusqu’à la victoire ou la défaite', () => {
    let s = at(newGame('soldat'), 'foret_sylvebrune');
    s.world.creatures.test_loup = { uid: 'test_loup', creatureId: 'loup', locationId: 'foret_sylvebrune', hp: 22, spawnedDay: 1 };
    s = act(s, { type: 'engage', payload: { creatureUid: 'test_loup' } }).state;
    expect(s.players[P].combat).toBeDefined();
    for (let i = 0; i < 40 && s.players[P].combat; i++) s = act(s, { type: 'combat_attack', payload: {} }).state;
    expect(s.players[P].combat).toBeUndefined();
    const ended = s.eventLog.some((e) => e.type === 'creature_defeated' || e.type === 'player_defeated');
    expect(ended).toBe(true);
  });

  it('le monde évolue seul pendant 60 jours sans erreur', () => {
    let s = at(newGame(), 'temple_aube');
    s.players[P].gold = 10000;
    for (let i = 0; i < 60 * 2; i++) {
      s.players[P].combat = undefined;
      const res = act(s, { type: 'rest', payload: { hours: 12 } });
      expect(res.error).toBeUndefined();
      s = res.state;
    }
    expect(s.world.time.day).toBeGreaterThanOrEqual(60);
    const types = new Set(s.eventLog.map((e) => e.type));
    expect(types.has('day_started')).toBe(true);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });

  it('sauvegarde et recharge un état identique', () => {
    const s = newGame();
    const restored = deserialize(serialize(s, P));
    expect(restored).toEqual(s);
  });

  it('apprend un métier auprès d’un maître, travaille et rachète une boutique', () => {
    let s = at(newGame('marchand_ne'), 'bourg_du_gue');
    s.world.npcs.pivoine.locationId = 'bourg_du_gue';
    s.players[P].gold = 1000;
    let res = act(s, { type: 'learn_job', payload: { jobId: 'cuisinier', npcId: 'pivoine' } });
    expect(res.error).toBeUndefined();
    expect(res.state.players[P].jobs.cuisinier?.level).toBe(1);
    res = act(res.state, { type: 'work', payload: { jobId: 'fermier', hours: 4 } });
    expect(res.error).toBeUndefined();
    expect(res.state.players[P].jobs.fermier).toBeDefined();
    expect(act(res.state, { type: 'buy_shop', payload: { shopId: 'marche_du_gue' } }).error).toMatch(/licence/);
    addItem(res.state.players[P], 'licence_commerce', 1);
    res.state.players[P].energy = 20;
    res = act(res.state, { type: 'buy_shop', payload: { shopId: 'marche_du_gue' } });
    expect(res.error).toBeUndefined();
    expect(res.state.world.shops.marche_du_gue.ownerPlayerId).toBe(P);
  });

  it('les dialogues modifient l’opinion et les options spéciales dépendent de l’origine', () => {
    const s = at(newGame('soldat'), 'bourg_du_gue');
    s.world.npcs.hector.locationId = 'bourg_du_gue';
    const before = s.world.npcs.hector.opinions[P];
    const res = act(s, { type: 'talk', payload: { npcId: 'hector', option: 'special', specialIndex: 0 } });
    expect(res.error).toBeUndefined();
    expect(res.state.world.npcs.hector.opinions[P]).toBeGreaterThan(before);
    expect(act(res.state, { type: 'talk', payload: { npcId: 'hector', option: 'special', specialIndex: 1 } }).error).toBeTruthy();
    const insult = act(res.state, { type: 'talk', payload: { npcId: 'hector', option: 'insulter' } });
    expect(insult.state.world.npcs.hector.opinions[P]).toBeLessThan(res.state.world.npcs.hector.opinions[P]);
  });
});
