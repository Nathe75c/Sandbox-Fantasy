import { useState } from 'react';
import { CONTENT } from '@/data';
import { CREATION_BONUS_POINTS, STAT_IDS } from '@/data/stats';
import type { StatId, StatModifiers } from '@/types';
import { computeBaseStats, randomCharacter, TRAIT_COUNT, validateCharacter } from '@/game/systems/character';
import { createRng } from '@/game/systems/rng';
import { maxEnergy, maxHp, carryCapacity } from '@/game/state/selectors';
import { useGame } from './GameContext';
import { StatModList } from './ui';

const NAMES = ['Aelis', 'Bran', 'Cyrielle', 'Doran', 'Elowen', 'Fenric', 'Gwen', 'Hugo', 'Isolde', 'Jory', 'Kael', 'Lysa', 'Maël', 'Nyra', 'Oswin', 'Perrine'];

export function CharacterCreation() {
  const { dispatch, lastError, store } = useGame();
  const races = CONTENT.lists.races.filter((r) => r.playable);
  const [name, setName] = useState('');
  const [raceId, setRaceId] = useState(races[0].id);
  const [originId, setOriginId] = useState(CONTENT.lists.origins[0].id);
  const [traitIds, setTraitIds] = useState<string[]>([]);
  const [bonus, setBonus] = useState<StatModifiers>({});

  const spent = Object.values(bonus).reduce((a, b) => a + (b ?? 0), 0);
  const remaining = CREATION_BONUS_POINTS - spent;
  const choice = { raceId, originId, traitIds, bonusStats: bonus };
  const stats = computeBaseStats(choice);
  const validation = validateCharacter(name, choice);
  const origin = CONTENT.origins[originId];

  const toggleTrait = (id: string) => {
    setTraitIds((cur) => (cur.includes(id) ? cur.filter((t) => t !== id) : cur.length < TRAIT_COUNT ? [...cur, id] : [cur[1], id]));
  };
  const adjust = (stat: StatId, d: number) => {
    const v = (bonus[stat] ?? 0) + d;
    if (v < 0 || (d > 0 && remaining <= 0)) return;
    setBonus({ ...bonus, [stat]: v });
  };
  const randomize = () => {
    const rng = createRng(Date.now() % 2 ** 31);
    const c = randomCharacter(rng);
    setRaceId(c.raceId);
    setOriginId(c.originId);
    setTraitIds(c.traitIds);
    setBonus(c.bonusStats);
    if (!name) setName(rng.pick(NAMES));
  };
  const start = () => dispatch({ type: 'create_character', payload: { name, raceId, originId, traitIds, bonusStats: bonus } });
  const excluded = (id: string) => traitIds.some((t) => t !== id && (CONTENT.traits[t].excludes?.includes(id) || CONTENT.traits[id].excludes?.includes(t)));

  return (
    <div className="creation">
      <header className="creation-header">
        <button className="btn ghost" onClick={() => store.quitToMenu()}>
          ← Menu
        </button>
        <h1>Création du personnage</h1>
        <button className="btn" onClick={randomize}>
          🎲 Au hasard
        </button>
      </header>

      <div className="creation-grid">
        <section className="panel">
          <h2>1. Nom</h2>
          <input className="input" value={name} maxLength={24} placeholder="Votre nom" onChange={(e) => setName(e.target.value)} />

          <h2>2. Peuple</h2>
          <div className="choice-grid">
            {races.map((r) => (
              <button key={r.id} className={`choice ${raceId === r.id ? 'selected' : ''}`} onClick={() => setRaceId(r.id)}>
                <strong>{r.name}</strong>
                <small>{r.description}</small>
                <StatModList mods={r.statModifiers} />
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>3. Origine</h2>
          <div className="choice-grid">
            {CONTENT.lists.origins.map((o) => (
              <button key={o.id} className={`choice ${originId === o.id ? 'selected' : ''}`} onClick={() => setOriginId(o.id)}>
                <strong>{o.name}</strong>
                <small>{o.description}</small>
                <StatModList mods={o.statModifiers} />
              </button>
            ))}
          </div>
          <div className="origin-detail">
            <p>
              <strong>Départ :</strong> {origin.startingGold} po ·{' '}
              {origin.startingItems.map((i) => `${i.qty}× ${CONTENT.items[i.itemId]?.name}`).join(', ')}
            </p>
            <p>
              <strong>Métiers :</strong> {origin.startingJobs.map((j) => CONTENT.jobs[j]?.name).join(', ') || 'aucun'} ·{' '}
              <strong>Lieux possibles :</strong> {origin.startLocations.map((l) => CONTENT.locations[l.locationId]?.name + (l.lucky ? ' ★' : '')).join(', ')}
            </p>
            <p className="hint">★ = lieu favorisé par la Chance.</p>
          </div>
        </section>

        <section className="panel">
          <h2>
            4. Traits ({traitIds.length}/{TRAIT_COUNT})
          </h2>
          <div className="choice-grid">
            {CONTENT.lists.traits.map((t) => (
              <button
                key={t.id}
                className={`choice ${traitIds.includes(t.id) ? 'selected' : ''}`}
                disabled={excluded(t.id)}
                onClick={() => toggleTrait(t.id)}
              >
                <strong>{t.name}</strong>
                <small>{t.description}</small>
                <StatModList mods={t.statModifiers} />
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>5. Statistiques ({remaining} point{remaining > 1 ? 's' : ''} à répartir)</h2>
          <div className="stat-alloc">
            {STAT_IDS.map((s) => (
              <div key={s} className="stat-row" title={CONTENT.stats[s].influences.join(' · ')}>
                <span className="stat-name">{CONTENT.stats[s].name}</span>
                <button className="btn icon" aria-label={`Retirer ${CONTENT.stats[s].name}`} onClick={() => adjust(s, -1)} disabled={!bonus[s]}>
                  −
                </button>
                <span className="stat-value">{stats[s]}</span>
                <button className="btn icon" aria-label={`Ajouter ${CONTENT.stats[s].name}`} onClick={() => adjust(s, 1)} disabled={remaining <= 0}>
                  +
                </button>
                <small className="stat-help">{CONTENT.stats[s].influences.slice(0, 2).join(', ')}</small>
              </div>
            ))}
          </div>
          <p className="derived">
            PV {maxHp(stats)} · Énergie {maxEnergy(stats)} · Charge {carryCapacity(stats)}
          </p>
          {lastError && <p className="error">{lastError}</p>}
          <button className="btn primary big" disabled={!!validation} onClick={start}>
            Commencer l’aventure
          </button>
          {validation && <p className="hint">{validation}</p>}
        </section>
      </div>
    </div>
  );
}
