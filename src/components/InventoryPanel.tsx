import { useState } from 'react';
import { CONTENT, itemUsage } from '@/data';
import { carryCapacity, effectiveStats, inventoryWeight } from '@/game/state/selectors';
import { useGame } from './GameContext';
import { ItemLabel, RARITY_LABEL } from './ui';

const CATEGORY_LABEL: Record<string, string> = {
  arme: 'Armes', armure: 'Armures', outil: 'Outils', vetement: 'Vêtements', bijou: 'Bijoux', livre: 'Livres', potion: 'Potions',
  ingredient: 'Ingrédients', minerai: 'Minerais', plante: 'Plantes', aliment: 'Aliments', boisson: 'Boissons', materiau: 'Matériaux',
  objet_magique: 'Objets magiques', ressource_animale: 'Ressources animales', ressource_creature: 'Ressources de créatures',
  marchandise: 'Marchandises', composant: 'Composants', document: 'Documents', cle: 'Clés', carte: 'Cartes', quete: 'Objets de quête',
};

export function InventoryPanel() {
  const { state, player, dispatch } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  if (!state || !player) return null;
  const stats = effectiveStats(player, state.world.time);
  const weight = inventoryWeight(player.inventory);
  const cap = carryCapacity(stats);
  const byCat: Record<string, typeof player.inventory> = {};
  for (const e of player.inventory) (byCat[CONTENT.items[e.itemId]?.category ?? 'autre'] ??= []).push(e);
  const sel = selected ? CONTENT.items[selected] : undefined;
  const usage = selected ? itemUsage(selected) : undefined;
  const equipped = new Set(Object.values(player.equipment));

  return (
    <div className="two-cols">
      <section className="panel">
        <h2>Sac</h2>
        <p className={`hint ${weight > cap ? 'error' : ''}`}>
          Charge : {weight} / {cap} {weight > cap && '— surchargé : voyages plus lents'}
        </p>
        {player.inventory.length === 0 && <p className="muted">Votre sac est vide.</p>}
        {Object.entries(byCat).map(([cat, entries]) => (
          <div key={cat}>
            <h3>{CATEGORY_LABEL[cat] ?? cat}</h3>
            <ul className="list">
              {entries.map((e) => (
                <li key={e.itemId + (e.stolen ? 's' : '')} className={`list-row selectable ${selected === e.itemId ? 'selected' : ''}`} onClick={() => setSelected(e.itemId)}>
                  <span>
                    <ItemLabel itemId={e.itemId} qty={e.qty} stolen={e.stolen} />
                    {equipped.has(e.itemId) && <span className="tag equipped">équipé</span>}
                  </span>
                  <small className="muted">{CONTENT.items[e.itemId]?.value} po</small>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="panel item-detail">
        {!sel && <p className="muted">Touchez un objet pour voir ses détails, ses usages et ce qu’il permet de fabriquer.</p>}
        {sel && usage && (
          <>
            <h2>
              <ItemLabel itemId={sel.id} />
            </h2>
            <p>{sel.description}</p>
            <p className="hint">
              {CATEGORY_LABEL[sel.category]} · {RARITY_LABEL[sel.rarity]} · valeur {sel.value} po · poids {sel.weight}
            </p>
            <p>
              <strong>Utilité :</strong> {sel.utility}
            </p>
            {sel.effects && sel.effects.length > 0 && (
              <p>
                <strong>Effets :</strong>{' '}
                {sel.effects
                  .map((e) =>
                    e.type === 'heal' ? `+${e.amount} PV` : e.type === 'energy' ? `+${e.amount} énergie` : e.type === 'buff' ? `${CONTENT.stats[e.stat].name} +${e.amount}${e.hours ? ` (${e.hours} h)` : ' (équipé)'}` : e.type === 'damage_bonus' ? `dégâts +${e.amount}` : e.type === 'armor' ? `armure +${e.amount}` : e.type === 'cure' ? 'soigne' : e.type === 'unlock' ? 'enseigne un savoir' : e.type,
                  )
                  .join(', ')}
              </p>
            )}
            {sel.requirements?.stats && (
              <p>
                <strong>Requis :</strong> {Object.entries(sel.requirements.stats).map(([k, v]) => `${CONTENT.stats[k].name} ${v}`).join(', ')}
              </p>
            )}
            {sel.relatedJobs.length > 0 && (
              <p>
                <strong>Métiers liés :</strong> {sel.relatedJobs.map((j) => CONTENT.jobs[j]?.name).join(', ')}
              </p>
            )}
            {usage.producedBy.length > 0 && (
              <p>
                <strong>Fabriqué par :</strong> {usage.producedBy.map((r) => `${r.name} (${r.inputs.map((i) => `${i.qty} ${CONTENT.items[i.itemId]?.name}`).join(' + ')})`).join(' ; ')}
              </p>
            )}
            {usage.usedIn.length > 0 && (
              <p>
                <strong>Sert à fabriquer :</strong> {usage.usedIn.map((r) => r.outputs.map((o) => CONTENT.items[o.itemId]?.name).join(', ')).join(' ; ')}
              </p>
            )}
            {usage.toolFor.length > 0 && (
              <p>
                <strong>Outil pour :</strong> {usage.toolFor.map((r) => r.name).join(', ')}
              </p>
            )}
            {usage.droppedBy.length > 0 && (
              <p>
                <strong>Butin de :</strong> {usage.droppedBy.map((c) => c.name).join(', ')}
              </p>
            )}
            {usage.gatheredAt.length > 0 && (
              <p>
                <strong>Se récolte à :</strong> {usage.gatheredAt.map((l) => l.name).join(', ')}
              </p>
            )}
            <div className="actions-grid">
              {sel.consumable && sel.effects?.length ? (
                <button className="btn primary" onClick={() => dispatch({ type: 'use_item', payload: { itemId: sel.id } })}>
                  Utiliser
                </button>
              ) : null}
              {sel.slot && sel.slot !== 'outil' && (
                <button className="btn" onClick={() => dispatch({ type: 'equip', payload: { itemId: sel.id } })}>
                  {equipped.has(sel.id) ? 'Retirer' : 'Équiper'}
                </button>
              )}
              <button
                className="btn ghost"
                onClick={() => {
                  dispatch({ type: 'drop_item', payload: { itemId: sel.id, qty: 1 } });
                }}
              >
                Déposer 1
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
