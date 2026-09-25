/**
 * Générateur pseudo-aléatoire déterministe (mulberry32).
 *
 * Son état est un simple entier stocké dans `GameState.meta.rngState` : la même
 * graine + les mêmes actions => le même monde. Indispensable pour qu'un serveur
 * puisse rejouer/valider les actions d'un client (anti-triche, resynchronisation).
 * Ne JAMAIS utiliser Math.random() dans la logique de jeu.
 */
export interface Rng {
  /** Flottant dans [0, 1[ */
  next(): number;
  /** Entier dans [min, max] (inclus) */
  int(min: number, max: number): number;
  /** Vrai avec la probabilité p (0..1) */
  chance(p: number): boolean;
  /** d100 : 1..100 */
  d100(): number;
  pick<T>(list: readonly T[]): T;
  weighted<T>(list: readonly T[], weight: (t: T) => number): T | undefined;
  /** État courant à ré-enregistrer dans meta.rngState */
  state(): number;
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng: Rng = {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (p) => next() < p,
    d100: () => 1 + Math.floor(next() * 100),
    pick: (list) => list[Math.floor(next() * list.length)],
    weighted: (list, weight) => {
      const total = list.reduce((sum, t) => sum + Math.max(0, weight(t)), 0);
      if (total <= 0) return undefined;
      let roll = next() * total;
      for (const t of list) {
        roll -= Math.max(0, weight(t));
        if (roll < 0) return t;
      }
      return list[list.length - 1];
    },
    state: () => s,
  };
  return rng;
}

/** Graine à partir d'un texte (nom de monde, etc.). */
export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
