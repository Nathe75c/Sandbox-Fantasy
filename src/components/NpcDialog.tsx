import { CONTENT } from '@/data';
import { countItem, effectiveStats, OPINION_LABEL, opinionTier, playerTags } from '@/game/state/selectors';
import { getOpinion } from '@/game/systems/npcMemory';
import { useGame } from './GameContext';
import { Feedback } from './JournalPanel';
import { ItemLabel, Modal } from './ui';

export function NpcDialog({ npcId, onClose, onShop }: { npcId: string; onClose: () => void; onShop: (id: string) => void }) {
  const { state, player, dispatch } = useGame();
  if (!state || !player) return null;
  const def = CONTENT.npcs[npcId];
  const npc = state.world.npcs[npcId];
  if (!npc || npc.locationId !== player.locationId) return null;
  const opinion = getOpinion(state, npcId, player);
  const tier = opinionTier(opinion);
  const tags = playerTags(player);
  const stats = effectiveStats(player, state.world.time);
  const talk = (option: 'discuter' | 'rumeurs' | 'flatter' | 'menacer' | 'insulter') => dispatch({ type: 'talk', payload: { npcId, option } });
  const memories = npc.memories.filter((m) => m.playerId === player.id && m.kind !== 'rencontre').slice(-5).reverse();

  return (
    <Modal
      wide
      onClose={onClose}
      title={
        <span className="npc-title">
          <span className="avatar" aria-hidden>
            {def.name[0]}
          </span>
          <span>
            {def.name}
            <small>
              {def.title} · {CONTENT.races[def.raceId]?.name}, {def.age} ans · {CONTENT.jobs[npc.jobId]?.name}
            </small>
          </span>
        </span>
      }
    >
      <div className="npc-dialog">
        <div className="npc-info">
          <p className="character">{def.character}</p>
          <p>
            <strong>Personnalité :</strong> {def.personality.join(', ')}
          </p>
          <p>
            <strong>Désire :</strong> {def.desires.join(', ')} · <strong>Craint :</strong> {def.fears.join(', ')}
          </p>
          {def.factionId && (
            <p>
              <strong>Faction :</strong> {CONTENT.factions[def.factionId]?.name}
            </p>
          )}
          <p className={`opinion tier-${tier}`}>
            Opinion de vous : <strong>{OPINION_LABEL[tier]}</strong> ({opinion})
          </p>
          {memories.length > 0 && (
            <div className="memories">
              <h3>Ce qu’il/elle retient de vous</h3>
              <ul>
                {memories.map((m) => (
                  <li key={m.id} className={m.impact >= 0 ? 'pos' : 'neg'}>
                    J{m.day} — {m.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="npc-actions">
          <Feedback />
          <h3>Parler</h3>
          <div className="actions-grid">
            <button className="btn action" onClick={() => talk('discuter')}>
              💬 Discuter
            </button>
            <button className="btn action" onClick={() => talk('rumeurs')}>
              👂 Demander des rumeurs
            </button>
            <button className="btn action" onClick={() => talk('flatter')}>
              🌹 Flatter (charisme {stats.charisme})
            </button>
            {def.specialOptions?.map((o, i) =>
              tags.includes(o.tag) && !player.counters[`special:${npcId}:${i}`] ? (
                <button key={i} className="btn action special" onClick={() => dispatch({ type: 'talk', payload: { npcId, option: 'special', specialIndex: i } })}>
                  ✨ {o.label}
                </button>
              ) : null,
            )}
            {def.shopId && (
              <button className="btn action" onClick={() => onShop(def.shopId!)}>
                🛒 Commercer
              </button>
            )}
          </div>

          {def.wants.length > 0 && (
            <>
              <h3>Aider</h3>
              <ul className="list">
                {def.wants.map((w, i) => {
                  const done = npc.fulfilledWants.includes(i);
                  const have = countItem(player, w.itemId);
                  return (
                    <li key={i} className="list-row">
                      <span>
                        Apporter <ItemLabel itemId={w.itemId} qty={w.qty} /> <small className="muted">({have} en sac) · récompense {w.reward} po</small>
                      </span>
                      <button className="btn" disabled={done || have < w.qty} onClick={() => dispatch({ type: 'talk', payload: { npcId, option: 'aider', wantIndex: i } })}>
                        {done ? 'Fait' : 'Donner'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {def.teaches && def.teaches.length > 0 && (
            <>
              <h3>Apprendre un métier</h3>
              <div className="actions-grid">
                {def.teaches.map((j) => {
                  const job = CONTENT.jobs[j];
                  const known = !!player.jobs[j];
                  return (
                    <button key={j} className="btn action" disabled={known} onClick={() => dispatch({ type: 'learn_job', payload: { jobId: j, npcId } })}>
                      📜 {job.name} {known ? '(connu)' : job.learnCost ? `(${job.learnCost} po)` : '(gratuit)'}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <h3>Manières fortes</h3>
          <div className="actions-grid">
            <button className="btn action warn" onClick={() => dispatch({ type: 'steal', payload: { npcId } })}>
              🫳 Faire les poches
            </button>
            <button className="btn action warn" onClick={() => talk('menacer')}>
              😠 Menacer
            </button>
            <button className="btn action warn" onClick={() => talk('insulter')}>
              🗯️ Insulter
            </button>
          </div>
          <p className="hint">Chaque interaction importante laisse un souvenir. Les autres habitants finissent par l’apprendre.</p>
        </div>
      </div>
    </Modal>
  );
}
