import { useEffect, useState } from 'react';
import { useGame } from './GameContext';
import { TopBar } from './TopBar';
import { LocationPanel } from './LocationPanel';
import { MapPanel } from './MapPanel';
import { InventoryPanel } from './InventoryPanel';
import { CraftPanel } from './CraftPanel';
import { CharacterPanel } from './CharacterPanel';
import { JobsPanel } from './JobsPanel';
import { JournalPanel, Feedback } from './JournalPanel';
import { NpcDialog } from './NpcDialog';
import { ShopModal } from './ShopModal';
import { CombatModal } from './CombatModal';

export type Tab = 'lieu' | 'carte' | 'sac' | 'artisanat' | 'perso' | 'metiers' | 'journal';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'lieu', label: 'Lieu', icon: '🏘️' },
  { id: 'carte', label: 'Carte', icon: '🗺️' },
  { id: 'sac', label: 'Sac', icon: '🎒' },
  { id: 'artisanat', label: 'Artisanat', icon: '⚒️' },
  { id: 'metiers', label: 'Métiers', icon: '📜' },
  { id: 'perso', label: 'Personnage', icon: '🧝' },
  { id: 'journal', label: 'Journal', icon: '📖' },
];

/** Écran principal : barre du haut, onglets (latéraux sur PC, en bas sur tablette), panneaux et fenêtres. */
export function GameScreen() {
  const { state, player } = useGame();
  const [tab, setTab] = useState<Tab>('lieu');
  const [npcId, setNpcId] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const locationId = player?.locationId;
  // Changer de lieu ferme les fenêtres de dialogue et de boutique.
  useEffect(() => {
    setNpcId(null);
    setShopId(null);
  }, [locationId]);
  if (!state || !player) return null;
  const npcHere = npcId && state.world.npcs[npcId]?.locationId === player.locationId;

  const openNpc = (id: string) => setNpcId(id);
  const openShop = (id: string) => {
    setNpcId(null);
    setShopId(id);
  };

  return (
    <div className="game">
      <TopBar />
      <nav className="tabs" aria-label="Navigation">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)} aria-current={tab === t.id}>
            <span className="tab-icon" aria-hidden>
              {t.icon}
            </span>
            <span className="tab-label">{t.label}</span>
            {t.id === 'perso' && player.statPoints > 0 && <span className="badge">{player.statPoints}</span>}
          </button>
        ))}
      </nav>
      <main className="main">
        <Feedback />
        {tab === 'lieu' && <LocationPanel onNpc={openNpc} onShop={openShop} />}
        {tab === 'carte' && <MapPanel onArrive={() => setTab('lieu')} />}
        {tab === 'sac' && <InventoryPanel />}
        {tab === 'artisanat' && <CraftPanel />}
        {tab === 'metiers' && <JobsPanel />}
        {tab === 'perso' && <CharacterPanel />}
        {tab === 'journal' && <JournalPanel />}
      </main>
      <aside className="side-journal">
        <JournalPanel compact />
      </aside>

      {npcHere && <NpcDialog npcId={npcId} onClose={() => setNpcId(null)} onShop={openShop} />}
      {shopId && <ShopModal shopId={shopId} onClose={() => setShopId(null)} />}
      {player.combat && <CombatModal />}
    </div>
  );
}
