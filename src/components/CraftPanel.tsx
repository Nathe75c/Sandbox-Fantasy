import { useState } from 'react';
import { CONTENT } from '@/data';
import type { RecipeDef } from '@/types';
import { countItem, jobLevel } from '@/game/state/selectors';
import { useGame } from './GameContext';

type Filter = 'possible' | 'connus' | 'tous';

export function CraftPanel() {
  const { state, player, dispatch } = useGame();
  const [filter, setFilter] = useState<Filter>('connus');
  if (!state || !player) return null;
  const stations = CONTENT.locations[player.locationId].stations;

  const status = (r: RecipeDef) => {
    const missing: string[] = [];
    const level = jobLevel(player, r.jobId);
    if (level < r.level) missing.push(`${CONTENT.jobs[r.jobId].name} niv. ${r.level}`);
    if (r.station && !stations.includes(r.station)) missing.push(`installation : ${r.station.replace(/_/g, ' ')}`);
    for (const t of r.tools) if (countItem(player, t) <= 0) missing.push(`outil : ${CONTENT.items[t].name}`);
    for (const i of r.inputs) if (countItem(player, i.itemId) < i.qty) missing.push(`${i.qty - countItem(player, i.itemId)} ${CONTENT.items[i.itemId].name}`);
    return missing;
  };

  const recipes = CONTENT.lists.recipes.filter((r) => {
    if (filter === 'tous') return true;
    if (filter === 'connus') return jobLevel(player, r.jobId) > 0;
    return status(r).length === 0;
  });
  const byJob: Record<string, RecipeDef[]> = {};
  for (const r of recipes) (byJob[r.jobId] ??= []).push(r);

  return (
    <section className="panel">
      <h2>Artisanat</h2>
      <p className="hint">Installations ici : {stations.length ? stations.map((s) => s.replace(/_/g, ' ')).join(', ') : 'aucune'}. Un échec coûte la moitié des matériaux.</p>
      <div className="segmented">
        {(['possible', 'connus', 'tous'] as Filter[]).map((f) => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
            {f === 'possible' ? 'Réalisables' : f === 'connus' ? 'Mes métiers' : 'Toutes'}
          </button>
        ))}
      </div>
      {recipes.length === 0 && <p className="muted">Aucune recette. Apprenez un métier d’artisan auprès d’un maître (onglet Lieu → personnes présentes).</p>}
      {Object.entries(byJob).map(([jobId, list]) => (
        <div key={jobId}>
          <h3>
            {CONTENT.jobs[jobId].name} <small className="muted">(niv. {jobLevel(player, jobId)})</small>
          </h3>
          <ul className="list">
            {list.map((r) => {
              const missing = status(r);
              return (
                <li key={r.id} className="list-row recipe">
                  <div>
                    <strong>{r.name}</strong>
                    <small className="muted">
                      {' '}
                      {r.inputs.map((i) => `${i.qty} ${CONTENT.items[i.itemId].name}`).join(' + ')} → {r.outputs.map((o) => `${o.qty} ${CONTENT.items[o.itemId].name}`).join(', ')} · {r.hours} h
                    </small>
                    {missing.length > 0 && <small className="missing">Manque : {missing.join(', ')}</small>}
                  </div>
                  <button className="btn" disabled={missing.length > 0} onClick={() => dispatch({ type: 'craft', payload: { recipeId: r.id } })}>
                    Fabriquer
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
