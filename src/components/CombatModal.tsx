import { CONTENT } from '@/data';
import { effectiveStats, maxHp } from '@/game/state/selectors';
import { fleeChance, hitChance } from '@/game/systems/combat';
import { createCtx } from '@/game/actions/context';
import { createRng } from '@/game/systems/rng';
import { useGame } from './GameContext';
import { Bar, Modal } from './ui';

export function CombatModal() {
  const { state, player, dispatch } = useGame();
  if (!state || !player?.combat) return null;
  const creature = state.world.creatures[player.combat.creatureUid];
  if (!creature) return null;
  const def = CONTENT.creatures[creature.creatureId];
  const stats = effectiveStats(player, state.world.time);
  const hit = hitChance(stats.agilite, def.stats.agility);
  const flee = fleeChance(player, creature, createCtx(state, createRng(0)));
  const potions = player.inventory.filter((e) => CONTENT.items[e.itemId]?.effects?.some((f) => f.type === 'heal') && CONTENT.items[e.itemId]?.consumable);

  return (
    <Modal title={`Combat : ${def.name}`} onClose={() => undefined}>
      <div className="combat">
        <div className="combatants">
          <div>
            <strong>{player.name}</strong>
            <Bar value={player.hp} max={maxHp(stats)} tone="hp" label="PV" />
          </div>
          <div>
            <strong>{def.name}</strong>
            <Bar value={creature.hp} max={def.stats.hp} tone="enemy" label="PV" />
            <small className="muted">
              Faible : {def.weaknesses.join(', ') || '—'} · Résiste : {def.resistances.join(', ') || '—'}
            </small>
          </div>
        </div>
        <ol className="combat-log">
          {player.combat.log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ol>
        <div className="actions-grid">
          <button className="btn primary action" onClick={() => dispatch({ type: 'combat_attack', payload: {} })}>
            ⚔️ Attaquer ({hit} %)
          </button>
          <button className="btn action" disabled={player.energy < 1} onClick={() => dispatch({ type: 'combat_attack', payload: { power: true } })}>
            💥 Attaque puissante ({Math.max(0, hit - 15)} %, 1 énergie)
          </button>
          {potions.slice(0, 3).map((p) => (
            <button key={p.itemId + (p.stolen ? 's' : '')} className="btn action" onClick={() => dispatch({ type: 'use_item', payload: { itemId: p.itemId } })}>
              🧪 {CONTENT.items[p.itemId].name} ({p.qty})
            </button>
          ))}
          <button className="btn action warn" onClick={() => dispatch({ type: 'combat_flee', payload: {} })}>
            🏃 Fuir ({flee} %)
          </button>
        </div>
      </div>
    </Modal>
  );
}
