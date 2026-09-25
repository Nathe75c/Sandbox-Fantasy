import type { PlayerState } from '@/types';

/** Ajoute des objets (les piles d'objets volés restent séparées des objets légitimes). */
export function addItem(player: PlayerState, itemId: string, qty: number, stolen = false) {
  if (qty <= 0) return;
  const entry = player.inventory.find((e) => e.itemId === itemId && !!e.stolen === stolen);
  if (entry) entry.qty += qty;
  else player.inventory.push(stolen ? { itemId, qty, stolen: true } : { itemId, qty });
}

/**
 * Retire des objets. `stolen` : true = uniquement volés, false = uniquement légitimes,
 * undefined = légitimes d'abord puis volés. Renvoie le nombre d'objets volés retirés.
 */
export function removeItem(player: PlayerState, itemId: string, qty: number, stolen?: boolean): number {
  let remaining = qty;
  let stolenRemoved = 0;
  const order = stolen === undefined ? [false, true] : [stolen];
  for (const s of order) {
    for (const entry of player.inventory) {
      if (remaining <= 0) break;
      if (entry.itemId !== itemId || !!entry.stolen !== s) continue;
      const take = Math.min(entry.qty, remaining);
      entry.qty -= take;
      remaining -= take;
      if (s) stolenRemoved += take;
    }
  }
  player.inventory = player.inventory.filter((e) => e.qty > 0);
  if (remaining > 0) throw new Error(`Pas assez de ${itemId}`);
  // Déséquiper un objet qui n'est plus possédé
  for (const slot of ['arme', 'armure', 'bijou'] as const) {
    const id = player.equipment[slot];
    if (id && !player.inventory.some((e) => e.itemId === id)) delete player.equipment[slot];
  }
  return stolenRemoved;
}
