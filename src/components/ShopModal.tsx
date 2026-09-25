import { useState } from 'react';
import { CONTENT } from '@/data';
import { buyPrice, sellPrice, shopBuys } from '@/game/systems/economy';
import { stealChance } from '@/game/actions/social';
import { createCtx } from '@/game/actions/context';
import { createRng } from '@/game/systems/rng';
import { useGame } from './GameContext';
import { Feedback } from './JournalPanel';
import { ItemLabel, Modal } from './ui';

export function ShopModal({ shopId, onClose }: { shopId: string; onClose: () => void }) {
  const { state, player, dispatch } = useGame();
  const [mode, setMode] = useState<'acheter' | 'vendre'>('acheter');
  if (!state || !player) return null;
  const def = CONTENT.shops[shopId];
  const shop = state.world.shops[shopId];
  const owner = def.ownerNpcId ? CONTENT.npcs[def.ownerNpcId] : undefined;
  const mine = shop.ownerPlayerId === player.id;
  // Estimation affichée seulement (le calcul officiel est fait par l'action).
  const theft = stealChance(createCtx(state, createRng(0)), player, owner?.perception ?? 8);

  const sellable = player.inventory.filter((e) => shopBuys(shopId, e.itemId, !!e.stolen).ok);

  return (
    <Modal wide title={def.name} onClose={onClose}>
      <Feedback />
      <p className="hint">
        {owner ? `Tenue par ${owner.name}. ` : ''}Caisse : {shop.gold} po · Votre bourse : {player.gold} po
        {def.fence && ' · Receleur : rachète les objets volés'}
        {mine && ' · Cette boutique vous appartient (achats à prix coûtant).'}
      </p>
      <div className="segmented">
        <button className={mode === 'acheter' ? 'active' : ''} onClick={() => setMode('acheter')}>
          Acheter
        </button>
        <button className={mode === 'vendre' ? 'active' : ''} onClick={() => setMode('vendre')}>
          Vendre
        </button>
      </div>

      {mode === 'acheter' && (
        <ul className="list shop-list">
          {def.sells.map((itemId) => {
            const stock = shop.stock[itemId] ?? 0;
            const price = buyPrice(state, player, shopId, itemId);
            const item = CONTENT.items[itemId];
            return (
              <li key={itemId} className="list-row">
                <div>
                  <ItemLabel itemId={itemId} />
                  <small className="muted">
                    {' '}
                    {item.utility} · stock {stock}
                  </small>
                </div>
                <button className="btn" disabled={stock <= 0 || player.gold < price} onClick={() => dispatch({ type: 'buy', payload: { shopId, itemId, qty: 1 } })}>
                  {price} po
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {mode === 'vendre' && (
        <ul className="list shop-list">
          {sellable.length === 0 && <li className="muted">Ce marchand n’achète rien de ce que vous portez.</li>}
          {sellable.map((e) => {
            const price = sellPrice(state, player, shopId, e.itemId, !!e.stolen);
            return (
              <li key={`${e.itemId}-${e.stolen ? 's' : 'l'}`} className="list-row">
                <ItemLabel itemId={e.itemId} qty={e.qty} stolen={e.stolen} />
                <div className="row-actions">
                  <button className="btn" onClick={() => dispatch({ type: 'sell', payload: { shopId, itemId: e.itemId, qty: 1, stolen: !!e.stolen } })}>
                    Vendre 1 · {price} po
                  </button>
                  {e.qty > 1 && (
                    <button className="btn ghost" onClick={() => dispatch({ type: 'sell', payload: { shopId, itemId: e.itemId, qty: e.qty, stolen: !!e.stolen } })}>
                      Tout
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="shop-footer">
        {!mine && (
          <button className="btn warn" onClick={() => dispatch({ type: 'steal', payload: { shopId } })}>
            🫳 Voler un objet (≈ {theft} %)
          </button>
        )}
        {def.purchasePrice && !shop.ownerPlayerId && (
          <button className="btn" onClick={() => dispatch({ type: 'buy_shop', payload: { shopId } })}>
            🏠 Racheter la boutique ({def.purchasePrice} po, licence requise)
          </button>
        )}
      </div>
    </Modal>
  );
}
