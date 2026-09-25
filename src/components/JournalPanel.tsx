import { CONTENT } from '@/data';
import { narrate } from '@/game/systems/narration';
import { useGame } from './GameContext';

/** Bandeau de retour immédiat : résultat de la dernière action ou erreur. */
export function Feedback() {
  const { lastEvents, lastError, playerId, store } = useGame();
  const lines = lastEvents
    .map((e) => narrate(e, playerId))
    .filter((l): l is NonNullable<typeof l> => !!l && l.tone !== 'world')
    .slice(-4);
  if (lastError)
    return (
      <div className="feedback error" role="alert" onClick={() => store.clearError()}>
        {lastError}
      </div>
    );
  if (!lines.length) return null;
  return (
    <div className="feedback" role="status">
      {lines.map((l, i) => (
        <p key={i} className={`tone-${l.tone}`}>
          {l.text}
        </p>
      ))}
    </div>
  );
}

export function JournalPanel({ compact = false }: { compact?: boolean }) {
  const { state, playerId } = useGame();
  if (!state) return null;
  const entries = state.eventLog
    .map((e) => ({ e, n: narrate(e, playerId) }))
    .filter((x) => x.n)
    .slice(compact ? -40 : -150)
    .reverse();

  return (
    <section className={`panel journal ${compact ? 'compact' : ''}`}>
      <h2>Journal</h2>
      {!compact && state.world.activeEvents.length > 0 && (
        <div className="active-events">
          <h3>Événements en cours</h3>
          {state.world.activeEvents.map((a) => (
            <p key={a.uid}>
              <strong>{CONTENT.worldEvents[a.eventId]?.name}</strong> — {CONTENT.worldEvents[a.eventId]?.description} (jusqu’au jour {a.endDay})
            </p>
          ))}
        </div>
      )}
      {!compact && state.world.rumors.length > 0 && (
        <div className="rumors">
          <h3>Rumeurs</h3>
          {state.world.rumors.slice(0, 6).map((r) => (
            <p key={r.id}>« {r.text} »</p>
          ))}
        </div>
      )}
      <ol className="log">
        {entries.map(({ e, n }) => (
          <li key={e.id} className={`tone-${n!.tone}`}>
            <small>
              J{e.day} {String(e.hour).padStart(2, '0')}h
            </small>{' '}
            {n!.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
