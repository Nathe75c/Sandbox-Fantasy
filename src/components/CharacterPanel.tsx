import { CONTENT } from '@/data';
import { STAT_IDS } from '@/data/stats';
import { armorValue, carryCapacity, effectiveStats, maxEnergy, maxHp, reputationLabel, weaponBonus } from '@/game/state/selectors';
import { xpToNextPlayerLevel } from '@/game/systems/jobs';
import { useGame } from './GameContext';
import { Bar, Stat } from './ui';

export function CharacterPanel() {
  const { state, player, dispatch } = useGame();
  if (!state || !player) return null;
  const stats = effectiveStats(player, state.world.time);
  const origin = CONTENT.origins[player.originId];
  const race = CONTENT.races[player.raceId];
  const weapon = weaponBonus(player);
  const factions = CONTENT.lists.factions.map((f) => ({ f, rep: player.factionReputation[f.id] ?? 0 })).sort((a, b) => b.rep - a.rep);
  const locals = Object.entries(player.localReputation).filter(([, v]) => v);

  return (
    <div className="two-cols">
      <section className="panel">
        <h2>{player.name}</h2>
        <p className="hint">
          {race.name} · {origin.name} · Niveau {player.level}
        </p>
        <Bar value={player.xp} max={xpToNextPlayerLevel(player.level)} tone="xp" label="XP" />
        <p>
          <strong>Traits :</strong> {player.traitIds.map((t) => CONTENT.traits[t].name).join(', ')}
        </p>
        <h3>Statistiques {player.statPoints > 0 && <span className="badge">{player.statPoints} point(s) à répartir</span>}</h3>
        <div className="stats-list">
          {STAT_IDS.map((s) => (
            <div key={s} className="stat-line" title={CONTENT.stats[s].influences.join(' · ')}>
              <span>{CONTENT.stats[s].name}</span>
              <strong>
                {stats[s]}
                {stats[s] !== player.baseStats[s] && <small className="muted"> (base {player.baseStats[s]})</small>}
              </strong>
              <small className="muted">{CONTENT.stats[s].influences.slice(0, 2).join(', ')}</small>
              {player.statPoints > 0 && (
                <button className="btn icon" aria-label={`Augmenter ${CONTENT.stats[s].name}`} onClick={() => dispatch({ type: 'spend_stat_point', payload: { stat: s } })}>
                  +
                </button>
              )}
            </div>
          ))}
        </div>
        <h3>Valeurs dérivées</h3>
        <div className="kv-grid">
          <Stat label="PV max" value={maxHp(stats)} />
          <Stat label="Énergie max" value={maxEnergy(stats)} />
          <Stat label="Charge max" value={carryCapacity(stats)} />
          <Stat label="Dégâts d’arme" value={`+${weapon.damage} (${weapon.tags.join(', ')})`} />
          <Stat label="Armure" value={armorValue(player)} />
          <Stat label="Notoriété" value={player.notoriety} hint="Au-delà de 30, les gardes vous verbalisent." />
        </div>
        <h3>Équipement</h3>
        <div className="kv-grid">
          <Stat label="Arme" value={player.equipment.arme ? CONTENT.items[player.equipment.arme].name : '—'} />
          <Stat label="Armure" value={player.equipment.armure ? CONTENT.items[player.equipment.armure].name : '—'} />
          <Stat label="Bijou" value={player.equipment.bijou ? CONTENT.items[player.equipment.bijou].name : '—'} />
        </div>
      </section>

      <section className="panel">
        <h2>Réputation</h2>
        {player.factionId && (
          <p>
            Membre de : <strong>{CONTENT.factions[player.factionId].name}</strong>
          </p>
        )}
        <ul className="list">
          {factions.map(({ f, rep }) => (
            <li key={f.id} className="list-row" title={f.description}>
              <span>{f.name}</span>
              <span className={rep > 0 ? 'pos' : rep < 0 ? 'neg' : 'muted'}>
                {reputationLabel(rep)} ({rep})
              </span>
            </li>
          ))}
        </ul>
        {locals.length > 0 && (
          <>
            <h3>Réputation locale</h3>
            <ul className="list">
              {locals.map(([loc, v]) => (
                <li key={loc} className="list-row">
                  <span>{CONTENT.locations[loc]?.name}</span>
                  <span className={(v ?? 0) > 0 ? 'pos' : 'neg'}>
                    {reputationLabel(v ?? 0)} ({v})
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {player.ownedShopIds.length > 0 && (
          <>
            <h3>Vos boutiques</h3>
            <ul className="list">
              {player.ownedShopIds.map((s) => (
                <li key={s}>{CONTENT.shops[s]?.name}</li>
              ))}
            </ul>
          </>
        )}
        <p className="hint">Rejoindre une faction : réputation ≥ 25, puis rendez-vous dans l’un de ses lieux.</p>
      </section>
    </div>
  );
}
