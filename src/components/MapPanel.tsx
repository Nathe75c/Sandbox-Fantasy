import { CONTENT } from '@/data';
import { creaturesAt } from '@/game/state/selectors';
import { useGame } from './GameContext';

/**
 * Carte du Val de Brume (SVG responsive). Les lieux reliés au lieu actuel sont cliquables.
 * Les sous-lieux (taverne, quartier) sont affichés près de leur lieu parent.
 */
export function MapPanel({ onArrive }: { onArrive: () => void }) {
  const { state, player, dispatch } = useGame();
  if (!state || !player) return null;
  const here = CONTENT.locations[player.locationId];
  const reachable = new Set(here.connections.map((c) => c.to));
  const edges = new Set<string>();

  const go = (to: string) => {
    const res = dispatch({ type: 'move', payload: { to } });
    if (res && !res.error) onArrive();
  };

  return (
    <section className="panel map-panel">
      <h2>Carte du Val de Brume</h2>
      <p className="hint">Touchez un lieu relié (en surbrillance) pour vous y rendre. Les épées indiquent le danger.</p>
      <svg viewBox="0 0 100 100" className="map" role="img" aria-label="Carte du Val de Brume">
        {CONTENT.lists.locations.flatMap((l) =>
          l.connections.map((c) => {
            const key = [l.id, c.to].sort().join('|');
            if (edges.has(key)) return null;
            edges.add(key);
            const to = CONTENT.locations[c.to];
            return (
              <line
                key={key}
                x1={l.map.x}
                y1={l.map.y}
                x2={to.map.x}
                y2={to.map.y}
                className={`road danger-${Math.min(5, c.danger)} ${l.id === here.id || c.to === here.id ? 'active' : ''}`}
              />
            );
          }),
        )}
        {CONTENT.lists.locations.map((l) => {
          const isHere = l.id === here.id;
          const canGo = reachable.has(l.id);
          const danger = state.world.locations[l.id]?.danger ?? 0;
          const monsters = creaturesAt(state, l.id).length;
          return (
            <g
              key={l.id}
              className={`node ${isHere ? 'here' : ''} ${canGo ? 'reachable' : ''} ${l.parentId ? 'sub' : ''}`}
              onClick={() => canGo && go(l.id)}
              role={canGo ? 'button' : undefined}
              tabIndex={canGo ? 0 : undefined}
              onKeyDown={(e) => canGo && (e.key === 'Enter' || e.key === ' ') && go(l.id)}
            >
              <circle cx={l.map.x} cy={l.map.y} r={l.parentId ? 1.8 : 2.8} />
              {/* Les sous-lieux ont leur nom sous le point pour ne pas chevaucher leur lieu parent. */}
              <text x={l.map.x} y={l.parentId ? l.map.y + 4 : l.map.y - 3.8} textAnchor="middle">
                {l.name}
              </text>
              <text x={l.map.x} y={l.parentId ? l.map.y + 6.4 : l.map.y + 5.2} textAnchor="middle" className="sub-text">
                {danger >= 50 ? '⚔⚔' : danger >= 25 ? '⚔' : ''}
                {monsters ? ` 🐾${monsters}` : ''}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="legend">
        <span className="dot here" /> Vous êtes ici <span className="dot reachable" /> Accessible
      </div>
    </section>
  );
}
