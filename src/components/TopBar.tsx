import { useState } from 'react';
import { CONTENT } from '@/data';
import { effectiveStats, formatTime, maxEnergy, maxHp } from '@/game/state/selectors';
import type { SlotId } from '@/game/save/saveManager';
import { useGame } from './GameContext';
import { Bar, Modal } from './ui';

export function TopBar() {
  const { state, player, store } = useGame();
  const [menu, setMenu] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  if (!state || !player) return null;
  const stats = effectiveStats(player, state.world.time);
  const loc = CONTENT.locations[player.locationId];

  const save = async (slot: SlotId) => {
    await store.save(slot);
    setNote('Partie sauvegardée.');
  };
  const load = async (slot: SlotId) => {
    const ok = await store.load(slot);
    setNote(ok ? 'Partie chargée.' : 'Emplacement vide.');
    if (ok) setMenu(false);
  };

  return (
    <header className="topbar">
      <div className="who">
        <strong>{player.name}</strong>
        <small>
          niv. {player.level} · {loc?.name}
        </small>
      </div>
      <div className="vitals">
        <Bar value={player.hp} max={maxHp(stats)} tone="hp" label="PV" />
        <Bar value={player.energy} max={maxEnergy(stats)} tone="energy" label="Énergie" />
      </div>
      <div className="meta">
        <span className="gold" title="Pièces d’or">
          🪙 {player.gold}
        </span>
        <span className="time">{formatTime(state.world.time)}</span>
        <button className="btn icon" onClick={() => setMenu(true)} aria-label="Menu">
          ☰
        </button>
      </div>
      {menu && (
        <Modal title="Menu" onClose={() => setMenu(false)}>
          <div className="menu-actions">
            {(['slot1', 'slot2', 'slot3'] as SlotId[]).map((slot, i) => (
              <div key={slot} className="row">
                <span>Emplacement {i + 1}</span>
                <button className="btn" onClick={() => save(slot)}>
                  Sauvegarder
                </button>
                <button className="btn" onClick={() => load(slot)}>
                  Charger
                </button>
              </div>
            ))}
            <div className="row">
              <span>Sauvegarde auto</span>
              <button className="btn" onClick={() => load('auto')}>
                Charger
              </button>
            </div>
            {note && <p className="hint">{note}</p>}
            <button className="btn danger" onClick={() => store.quitToMenu()}>
              Quitter vers le menu
            </button>
            <p className="hint">La partie est sauvegardée automatiquement après chaque action.</p>
          </div>
        </Modal>
      )}
    </header>
  );
}
