import { useEffect, useState } from 'react';
import { useGame } from './GameContext';
import type { SaveSummary, SlotId } from '@/game/save/saveManager';

const SLOT_LABEL: Record<SlotId, string> = { auto: 'Sauvegarde automatique', slot1: 'Emplacement 1', slot2: 'Emplacement 2', slot3: 'Emplacement 3' };

export function MainMenu() {
  const { store } = useGame();
  const [slots, setSlots] = useState<{ slot: SlotId; savedAt: string; summary: SaveSummary }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void store.saves.listSlots().then(setSlots);
  }, [store]);

  const load = async (slot: SlotId) => {
    try {
      await store.load(slot);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible.');
    }
  };

  return (
    <div className="menu-screen">
      <div className="menu-card">
        <h1 className="title">Sandbox Fantasy</h1>
        <p className="subtitle">Le Val de Brume vous attend. Vivez-y comme vous l’entendez.</p>
        <button className="btn primary big" onClick={() => store.newWorld()}>
          Nouvelle partie
        </button>
        {slots.length > 0 && (
          <div className="slot-list">
            <h3>Continuer</h3>
            {slots.map((s) => (
              <button key={s.slot} className="btn slot" onClick={() => load(s.slot)}>
                <strong>{SLOT_LABEL[s.slot]}</strong>
                <span>
                  {s.summary.playerName} · niv. {s.summary.level} · jour {s.summary.day} · {s.summary.locationName} · {s.summary.gold} po
                </span>
                <small>{new Date(s.savedAt).toLocaleString('fr-FR')}</small>
              </button>
            ))}
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <p className="hint">Jouable à la souris, au clavier et au doigt. Sauvegarde automatique dans votre navigateur.</p>
      </div>
    </div>
  );
}
