/**
 * Création de personnage : calcul des statistiques et du lieu de départ.
 */
import { CONTENT } from '@/data';
import { BASE_STAT_VALUE, CREATION_BONUS_POINTS, STAT_IDS, STAT_MAX, STAT_MIN } from '@/data/stats';
import type { StatModifiers, Stats } from '@/types';
import { clamp } from './math';
import type { Rng } from './rng';

export interface CharacterChoice {
  raceId: string;
  originId: string;
  traitIds: string[];
  bonusStats: StatModifiers;
}

export const TRAIT_COUNT = 2;

/** Statistiques de base : 5 + race + origine + traits + points libres. */
export function computeBaseStats(choice: CharacterChoice): Stats {
  const stats = {} as Stats;
  const sources: StatModifiers[] = [
    CONTENT.races[choice.raceId]?.statModifiers ?? {},
    CONTENT.origins[choice.originId]?.statModifiers ?? {},
    ...choice.traitIds.map((t) => CONTENT.traits[t]?.statModifiers ?? {}),
    choice.bonusStats,
  ];
  for (const id of STAT_IDS) {
    const total = sources.reduce((sum, mods) => sum + (mods[id] ?? 0), BASE_STAT_VALUE);
    stats[id] = clamp(total, STAT_MIN, STAT_MAX);
  }
  return stats;
}

/** Vérifie les choix de création. Renvoie un message d'erreur ou null. */
export function validateCharacter(name: string, choice: CharacterChoice): string | null {
  if (!name.trim() || name.trim().length > 24) return 'Choisissez un nom (24 caractères maximum).';
  const race = CONTENT.races[choice.raceId];
  if (!race?.playable) return 'Ce peuple n’est pas jouable.';
  if (!CONTENT.origins[choice.originId]) return 'Choisissez une origine.';
  if (new Set(choice.traitIds).size !== TRAIT_COUNT || choice.traitIds.some((t) => !CONTENT.traits[t]))
    return `Choisissez ${TRAIT_COUNT} traits différents.`;
  for (const t of choice.traitIds)
    if (CONTENT.traits[t].excludes?.some((x) => choice.traitIds.includes(x))) return `Le trait « ${CONTENT.traits[t].name} » est incompatible avec l’autre trait choisi.`;
  const spent = Object.values(choice.bonusStats).reduce((a, b) => a + (b ?? 0), 0);
  if (spent !== CREATION_BONUS_POINTS || Object.values(choice.bonusStats).some((v) => (v ?? 0) < 0))
    return `Répartissez exactement ${CREATION_BONUS_POINTS} points de statistiques.`;
  return null;
}

/**
 * Lieu de départ : tirage pondéré parmi ceux de l'origine.
 * Les lieux « chanceux » voient leur poids augmenter avec la statistique Chance.
 */
export function rollStartLocation(rng: Rng, originId: string, luck: number): string {
  const origin = CONTENT.origins[originId];
  const pick = rng.weighted(origin.startLocations, (l) => l.weight * (l.lucky ? 1 + (luck - 5) * 0.15 : 1));
  return pick?.locationId ?? 'bourg_du_gue';
}

/** Génère un personnage aléatoire (bouton « Au hasard »). */
export function randomCharacter(rng: Rng): CharacterChoice {
  const races = CONTENT.lists.races.filter((r) => r.playable);
  const traits = [...CONTENT.lists.traits];
  const first = rng.pick(traits);
  const second = rng.pick(traits.filter((t) => t.id !== first.id && !first.excludes?.includes(t.id) && !t.excludes?.includes(first.id)));
  const bonusStats: StatModifiers = {};
  for (let i = 0; i < CREATION_BONUS_POINTS; i++) {
    const s = rng.pick(STAT_IDS);
    bonusStats[s] = (bonusStats[s] ?? 0) + 1;
  }
  return { raceId: rng.pick(races).id, originId: rng.pick(CONTENT.lists.origins).id, traitIds: [first.id, second.id], bonusStats };
}
