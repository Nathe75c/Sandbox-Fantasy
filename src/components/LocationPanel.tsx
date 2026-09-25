import { CONTENT } from '@/data';
import { countItem, creaturesAt, npcsAt, OPINION_LABEL, opinionTier, reputationLabel } from '@/game/state/selectors';
import { getOpinion } from '@/game/systems/npcMemory';
import { useGame } from './GameContext';
import { ItemLabel } from './ui';

const KIND_LABEL: Record<string, string> = {
  village: 'Village', ville: 'Ville', foret: 'Forêt', montagne: 'Montagne', route: 'Route commerciale', port: 'Port', taverne: 'Taverne',
  ruine: 'Ruine ancienne', quartier_pauvre: 'Quartier pauvre', chateau: 'Château', campement: 'Campement', mine: 'Mine', ferme: 'Ferme',
  temple: 'Temple', marais: 'Marais', region_dangereuse: 'Région dangereuse', lieu_isole: 'Lieu isolé',
};

const BEHAVIOR_LABEL: Record<string, string> = {
  pacifique: 'pacifique', mefiant: 'méfiant', marchand: 'marchand', territorial: 'territorial', agressif: 'agressif', fuyant: 'fuyant',
  predateur: 'prédateur', intelligent: 'intelligent', manipulateur: 'manipulateur', neutre: 'neutre',
};

function Meter({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const tone = (invert ? 100 - value : value) >= 55 ? 'good' : (invert ? 100 - value : value) >= 30 ? 'mid' : 'bad';
  return (
    <div className="meter">
      <span>{label}</span>
      <div className={`meter-track ${tone}`}>
        <div style={{ width: `${value}%` }} />
      </div>
      <small>{value}</small>
    </div>
  );
}

export function LocationPanel({ onNpc, onShop }: { onNpc: (id: string) => void; onShop: (id: string) => void }) {
  const { state, player, dispatch } = useGame();
  if (!state || !player) return null;
  const def = CONTENT.locations[player.locationId];
  const loc = state.world.locations[player.locationId];
  const npcs = npcsAt(state, player.locationId);
  const creatures = creaturesAt(state, player.locationId);
  const repKey = def.parentId ?? def.id;
  const rep = player.localReputation[repKey] ?? 0;
  const faction = def.factionId ? CONTENT.factions[def.factionId] : undefined;
  const factionRep = faction ? (player.factionReputation[faction.id] ?? 0) : 0;
  const canJoin = faction && player.factionId !== faction.id && factionRep >= 25;

  return (
    <div className="location">
      <section className="panel hero">
        <div className="hero-title">
          <h1>{def.name}</h1>
          <span className="pill">{KIND_LABEL[def.kind]}</span>
          {faction && <span className="pill faction">{faction.name}</span>}
        </div>
        <p className="description">{def.description}</p>
        <div className="meters">
          <Meter label="Prospérité" value={loc.prosperity} />
          <Meter label="Danger" value={loc.danger} invert />
          <Meter label="Sécurité" value={loc.security} />
        </div>
        <p className="hint">
          Votre réputation ici : <strong>{reputationLabel(rep)}</strong> ({rep})
          {faction && (
            <>
              {' '}
              · {faction.name} : <strong>{reputationLabel(factionRep)}</strong> ({factionRep})
            </>
          )}
        </p>
        {canJoin && (
          <button className="btn" onClick={() => dispatch({ type: 'join_faction', payload: { factionId: faction!.id } })}>
            Rejoindre {faction!.name}
          </button>
        )}
      </section>

      {npcs.length > 0 && (
        <section className="panel">
          <h2>Personnes présentes</h2>
          <div className="card-grid">
            {npcs.map((n) => {
              const d = CONTENT.npcs[n.id];
              const tier = opinionTier(getOpinion(state, n.id, player));
              return (
                <button key={n.id} className={`card npc tier-${tier}`} onClick={() => onNpc(n.id)}>
                  <span className="avatar" aria-hidden>
                    {d.name[0]}
                  </span>
                  <span>
                    <strong>{d.name}</strong>
                    <small>
                      {d.title} · {CONTENT.races[d.raceId]?.name}
                    </small>
                    <small className={`opinion tier-${tier}`}>{OPINION_LABEL[tier]}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {creatures.length > 0 && (
        <section className="panel">
          <h2>Créatures</h2>
          <ul className="list">
            {creatures.map((c) => {
              const d = CONTENT.creatures[c.creatureId];
              return (
                <li key={c.uid} className="list-row">
                  <div>
                    <strong>{d.name}</strong> <small className="pill danger">danger {d.danger}</small>
                    <small className="muted">
                      {' '}
                      {BEHAVIOR_LABEL[d.behavior]} · PV {c.hp}/{d.stats.hp}
                      {d.weaknesses.length > 0 && ` · faible : ${d.weaknesses.join(', ')}`}
                    </small>
                  </div>
                  <div className="row-actions">
                    <button className="btn" onClick={() => dispatch({ type: 'engage', payload: { creatureUid: c.uid } })}>
                      Combattre
                    </button>
                    <button className="btn ghost" onClick={() => dispatch({ type: 'sneak_past', payload: { creatureUid: c.uid } })}>
                      Éviter
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="panel">
        <h2>Activités</h2>
        <div className="actions-grid">
          {def.shops.map((s) => (
            <button key={s.id} className="btn action" onClick={() => onShop(s.id)}>
              🛒 {s.name}
              {state.world.shops[s.id]?.ownerPlayerId === player.id && <small> (à vous)</small>}
            </button>
          ))}
          {def.workJobs.map((j) => (
            <button key={j} className="btn action" onClick={() => dispatch({ type: 'work', payload: { jobId: j, hours: 4 } })}>
              💼 Travailler : {CONTENT.jobs[j].name} (4 h)
            </button>
          ))}
          <button className="btn action" onClick={() => dispatch({ type: 'rest', payload: { hours: 8 } })}>
            🛏️ Dormir 8 h {def.rest.cost ? `(${def.rest.cost} po)` : '(gratuit)'} {!def.rest.safe && '⚠️'}
          </button>
          <button className="btn action" onClick={() => dispatch({ type: 'rest', payload: { hours: 2 } })}>
            ☕ Se reposer 2 h
          </button>
        </div>
        {def.stations.length > 0 && <p className="hint">Installations : {def.stations.map((s) => s.replace(/_/g, ' ')).join(', ')}</p>}
      </section>

      {def.gatherables.length > 0 && (
        <section className="panel">
          <h2>Récolter</h2>
          <ul className="list">
            {def.gatherables.map((g) => {
              const job = CONTENT.jobs[g.jobId];
              const stock = Math.floor(loc.resources[g.itemId] ?? 0);
              const hasTool = !job.tools.length || job.tools.some((t) => countItem(player, t) > 0);
              return (
                <li key={g.itemId} className="list-row">
                  <div>
                    <ItemLabel itemId={g.itemId} />
                    <small className="muted">
                      {' '}
                      {job.name} · reste {stock}
                      {!hasTool && ` · outil requis : ${job.tools.map((t) => CONTENT.items[t]?.name).join(' ou ')}`}
                    </small>
                  </div>
                  <button className="btn" disabled={stock <= 0} onClick={() => dispatch({ type: 'gather', payload: { itemId: g.itemId } })}>
                    Récolter
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {loc.groundItems.length > 0 && (
        <section className="panel">
          <h2>Au sol</h2>
          <ul className="list">
            {loc.groundItems.map((g, i) => (
              <li key={i} className="list-row">
                <ItemLabel itemId={g.itemId} qty={g.qty} />
                <button className="btn" onClick={() => dispatch({ type: 'pick_up', payload: { index: i } })}>
                  Ramasser
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel">
        <h2>Voyager</h2>
        <div className="actions-grid">
          {def.connections.map((c) => (
            <button key={c.to} className="btn action" onClick={() => dispatch({ type: 'move', payload: { to: c.to } })}>
              🧭 {CONTENT.locations[c.to].name}
              <small>
                {' '}
                {c.hours ? `${c.hours} h` : 'à côté'}
                {c.danger > 0 && ` · risque ${'⚔'.repeat(Math.min(5, c.danger))}`}
              </small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
