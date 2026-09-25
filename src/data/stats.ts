import type { StatDef, StatId } from '@/types';

/**
 * 9 statistiques retenues. Chacune a un rôle unique et mesurable dans les systèmes.
 * Fusions : « persuasion » -> charisme ; « sagesse » répartie entre perception
 * (intuition, lire les gens) et volonté (force spirituelle, magie).
 */
export const STATS: StatDef[] = [
  {
    id: 'force',
    name: 'Force',
    short: 'FOR',
    description: 'Puissance physique brute.',
    influences: ['Dégâts en mêlée', 'Capacité de charge', 'Rendement minage et bûcheronnage', 'Intimidation (menacer)'],
  },
  {
    id: 'agilite',
    name: 'Agilité',
    short: 'AGI',
    description: 'Vivacité, précision et réflexes.',
    influences: ['Toucher et esquiver en combat', 'Fuir un combat', 'Vol à la tire', 'Artisanat de précision (tailleur, bijoux)'],
  },
  {
    id: 'vitalite',
    name: 'Vitalité',
    short: 'VIT',
    description: 'Endurance et santé.',
    influences: ['Points de vie', 'Énergie maximale', 'Résistance aux poisons et maladies', 'Récolte longue (fermier, pêcheur)'],
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    short: 'INT',
    description: 'Savoir, logique et mémoire.',
    influences: ['Réussite en artisanat complexe', 'Vitesse d’apprentissage des métiers', 'Alchimie, écriture, arcanes', 'Évaluer la valeur des objets'],
  },
  {
    id: 'perception',
    name: 'Perception',
    short: 'PER',
    description: 'Sens aiguisés et intuition, y compris lire les intentions d’autrui.',
    influences: ['Trouver des ressources rares', 'Détecter les embuscades', 'Chasse', 'Deviner le mensonge et repérer les rumeurs'],
  },
  {
    id: 'charisme',
    name: 'Charisme',
    short: 'CHA',
    description: 'Présence, éloquence et art de convaincre.',
    influences: ['Prix d’achat et de vente', 'Flatter et persuader', 'Gains de réputation', 'Revenus de tavernier et marchand'],
  },
  {
    id: 'volonte',
    name: 'Volonté',
    short: 'VOL',
    description: 'Force mentale et spirituelle.',
    influences: ['Magie et enchantement', 'Résister à la peur (morts-vivants, démons)', 'Guérison', 'Tenir tête lors d’une menace'],
  },
  {
    id: 'discretion',
    name: 'Discrétion',
    short: 'DIS',
    description: 'Art de passer inaperçu.',
    influences: ['Voler sans être vu', 'Éviter les créatures', 'Réduire les embuscades en voyage', 'Accès au marché noir'],
  },
  {
    id: 'chance',
    name: 'Chance',
    short: 'CHN',
    description: 'La faveur du destin.',
    influences: ['Coups critiques', 'Butin rare', 'Lieu de départ favorable', 'Événements heureux'],
  },
];

export const STAT_IDS: StatId[] = STATS.map((s) => s.id);

/** Valeur de base d'une statistique à la création (avant race, origine, traits). */
export const BASE_STAT_VALUE = 5;
/** Points libres à répartir à la création. */
export const CREATION_BONUS_POINTS = 5;
/** Borne d'une statistique. */
export const STAT_MIN = 1;
export const STAT_MAX = 20;
