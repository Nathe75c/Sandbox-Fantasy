import type { ItemCategory, ItemDef, JobId, Rarity } from '@/types';

/**
 * Catalogue des items. Conçu pour contenir des centaines d'entrées :
 * - une entrée = un objet, identifiant unique en snake_case ;
 * - « recettes liées », « composants » et « objets fabricables » sont DÉRIVÉS
 *   des recettes (voir data/index.ts : itemUsage) : ne pas les dupliquer ici ;
 * - pour ajouter un item : copier une ligne, changer l'id, lancer `npm test`
 *   (la validation vérifie les références).
 *
 * Le helper `item` applique des valeurs par défaut pour garder le fichier lisible.
 */
type ItemInput = Omit<ItemDef, 'relatedJobs' | 'utility' | 'rarity' | 'weight'> & {
  rarity?: Rarity;
  weight?: number;
  utility?: string;
  jobs?: JobId[];
};

const DEFAULT_UTILITY: Record<ItemCategory, string> = {
  arme: 'Arme',
  armure: 'Protection',
  outil: 'Outil de métier',
  vetement: 'Vêtement',
  bijou: 'Bijou',
  livre: 'Savoir',
  potion: 'Consommable',
  ingredient: 'Ingrédient de cuisine',
  minerai: 'Matière première',
  plante: 'Plante',
  aliment: 'Nourriture',
  boisson: 'Boisson',
  materiau: 'Matériau de construction et d’artisanat',
  objet_magique: 'Objet magique',
  ressource_animale: 'Ressource animale',
  ressource_creature: 'Ressource de créature',
  marchandise: 'Marchandise commerciale',
  composant: 'Composant d’artisanat',
  document: 'Document',
  cle: 'Clé',
  carte: 'Carte',
  quete: 'Objet de quête',
};

function item(input: ItemInput): ItemDef {
  const { jobs, ...rest } = input;
  return {
    rarity: 'commun',
    weight: 1,
    utility: DEFAULT_UTILITY[input.category],
    ...rest,
    relatedJobs: jobs ?? [],
  };
}

export const ITEMS: ItemDef[] = [
  // ------------------------------------------------------------------ Minerais
  item({ id: 'minerai_fer', name: 'Minerai de fer', category: 'minerai', description: 'Roche rougeâtre riche en fer.', value: 4, weight: 3, jobs: ['mineur', 'forgeron'] }),
  item({ id: 'minerai_cuivre', name: 'Minerai de cuivre', category: 'minerai', description: 'Veines vertes et orangées.', value: 3, weight: 3, jobs: ['mineur', 'forgeron'] }),
  item({ id: 'charbon', name: 'Charbon', category: 'minerai', description: 'Combustible indispensable aux forges.', value: 2, weight: 2, jobs: ['mineur', 'forgeron'] }),
  item({ id: 'minerai_argent', name: 'Minerai d’argent', category: 'minerai', description: 'Métal pâle, fatal aux créatures de la nuit.', value: 12, weight: 3, rarity: 'peu_commun', jobs: ['mineur', 'forgeron'] }),
  item({ id: 'mithril_brut', name: 'Mithril brut', category: 'minerai', description: 'Métal légendaire des profondeurs naines.', value: 70, weight: 2, rarity: 'rare', jobs: ['mineur', 'forgeron'] }),
  item({ id: 'gemme_brute', name: 'Gemme brute', category: 'minerai', description: 'Pierre précieuse non taillée.', value: 40, weight: 0.5, rarity: 'rare', jobs: ['mineur', 'arcaniste'] }),
  item({ id: 'pierre', name: 'Pierre', category: 'materiau', description: 'Bloc de pierre brute.', value: 1, weight: 5, jobs: ['mineur', 'charpentier'] }),
  item({ id: 'cristal_brut', name: 'Cristal brut', category: 'minerai', description: 'Cristal vibrant d’une magie latente.', value: 15, weight: 1, rarity: 'peu_commun', jobs: ['mineur', 'arcaniste'] }),

  // ---------------------------------------------------------------- Matériaux
  item({ id: 'lingot_fer', name: 'Lingot de fer', category: 'materiau', description: 'Fer fondu et purifié.', value: 12, weight: 2, jobs: ['forgeron'] }),
  item({ id: 'lingot_cuivre', name: 'Lingot de cuivre', category: 'materiau', description: 'Métal souple pour bijoux et ustensiles.', value: 9, weight: 2, jobs: ['forgeron'] }),
  item({ id: 'lingot_acier', name: 'Lingot d’acier', category: 'materiau', description: 'Fer allié au carbone, dur et fiable.', value: 28, weight: 2, rarity: 'peu_commun', jobs: ['forgeron'] }),
  item({ id: 'lingot_argent', name: 'Lingot d’argent', category: 'materiau', description: 'Argent pur, pour bijoux et armes bénies.', value: 32, weight: 2, rarity: 'peu_commun', jobs: ['forgeron'] }),
  item({ id: 'bois_brut', name: 'Bois brut', category: 'materiau', description: 'Rondin fraîchement coupé.', value: 2, weight: 4, jobs: ['bucheron', 'charpentier'] }),
  item({ id: 'bois_precieux', name: 'Bois de lune', category: 'materiau', description: 'Bois argenté des vieux arbres elfiques.', value: 18, weight: 3, rarity: 'rare', jobs: ['bucheron', 'charpentier', 'arcaniste'] }),
  item({ id: 'planche', name: 'Planche', category: 'materiau', description: 'Bois scié et raboté.', value: 4, weight: 2, jobs: ['charpentier'] }),
  item({ id: 'clous', name: 'Clous', category: 'materiau', description: 'Une poignée de clous forgés.', value: 1, weight: 0.2, jobs: ['forgeron', 'charpentier'] }),
  item({ id: 'corde', name: 'Corde', category: 'materiau', description: 'Corde de lin tressée.', value: 4, weight: 1, jobs: ['tailleur', 'charpentier'] }),
  item({ id: 'fiole', name: 'Fiole', category: 'composant', description: 'Petit flacon de verre.', value: 2, weight: 0.2, jobs: ['alchimiste'] }),

  // ------------------------------------------------------------------ Plantes
  item({ id: 'herbe_soin', name: 'Herbe de soin', category: 'plante', description: 'Feuilles cicatrisantes communes.', value: 3, weight: 0.2, jobs: ['herboriste', 'alchimiste', 'guerisseur'] }),
  item({ id: 'fleur_lune', name: 'Fleur de lune', category: 'plante', description: 'Ne fleurit qu’à l’ombre des grands arbres.', value: 12, weight: 0.1, rarity: 'peu_commun', jobs: ['herboriste', 'alchimiste', 'arcaniste'] }),
  item({ id: 'champignon_noir', name: 'Champignon noir', category: 'plante', description: 'Toxique. Prisé des empoisonneurs.', value: 6, weight: 0.2, jobs: ['herboriste', 'alchimiste'] }),
  item({ id: 'racine_amere', name: 'Racine amère', category: 'plante', description: 'Purge les poisons. Goût abominable.', value: 4, weight: 0.3, jobs: ['herboriste', 'alchimiste'] }),
  item({ id: 'mandragore', name: 'Mandragore', category: 'plante', description: 'Racine hurlante aux vertus occultes.', value: 28, weight: 0.5, rarity: 'rare', jobs: ['herboriste', 'alchimiste'] }),
  item({ id: 'baies', name: 'Baies sauvages', category: 'plante', description: 'Sucrées et énergisantes.', value: 2, weight: 0.2, jobs: ['herboriste', 'cuisinier'], effects: [{ type: 'energy', amount: 1 }], consumable: true }),
  item({ id: 'lin', name: 'Lin', category: 'plante', description: 'Fibre végétale à filer.', value: 2, weight: 0.5, jobs: ['fermier', 'tailleur'] }),
  item({ id: 'houblon', name: 'Houblon', category: 'plante', description: 'Donne son amertume à la bière.', value: 2, weight: 0.3, jobs: ['fermier', 'tavernier'] }),

  // ------------------------------------------------------------- Ingrédients
  item({ id: 'ble', name: 'Blé', category: 'ingredient', description: 'Gerbe de blé doré.', value: 1, weight: 1, jobs: ['fermier', 'cuisinier'] }),
  item({ id: 'farine', name: 'Farine', category: 'ingredient', description: 'Blé moulu.', value: 3, weight: 1, jobs: ['cuisinier'] }),
  item({ id: 'legumes', name: 'Légumes', category: 'ingredient', description: 'Choux, navets et oignons.', value: 2, weight: 1, jobs: ['fermier', 'cuisinier'] }),
  item({ id: 'oeuf', name: 'Œufs', category: 'ingredient', description: 'Une demi-douzaine d’œufs frais.', value: 2, weight: 0.5, jobs: ['fermier', 'cuisinier'] }),
  item({ id: 'lait', name: 'Lait', category: 'ingredient', description: 'Lait de vache du jour.', value: 2, weight: 1, jobs: ['fermier', 'cuisinier'] }),
  item({ id: 'miel', name: 'Miel', category: 'ingredient', description: 'Miel sauvage ou de ruche.', value: 5, weight: 0.5, jobs: ['fermier', 'tavernier', 'alchimiste'] }),
  item({ id: 'eau_benite', name: 'Eau bénite', category: 'ingredient', description: 'Eau consacrée par le Temple de l’Aube.', value: 10, weight: 0.5, jobs: ['guerisseur', 'alchimiste'], availability: { factions: ['temple_aube'] } }),

  // ----------------------------------------------------------------- Aliments
  item({ id: 'pain', name: 'Pain', category: 'aliment', description: 'Miche encore tiède.', value: 3, weight: 0.5, effects: [{ type: 'energy', amount: 3 }, { type: 'heal', amount: 2 }], consumable: true, jobs: ['cuisinier'] }),
  item({ id: 'viande', name: 'Viande crue', category: 'ressource_animale', description: 'À cuire ou à sécher.', value: 4, weight: 1, jobs: ['chasseur', 'cuisinier'] }),
  item({ id: 'viande_sechee', name: 'Viande séchée', category: 'aliment', description: 'Se conserve des semaines.', value: 6, weight: 0.5, effects: [{ type: 'energy', amount: 4 }], consumable: true, jobs: ['cuisinier', 'chasseur'] }),
  item({ id: 'ragout', name: 'Ragoût', category: 'aliment', description: 'Plat roboratif de taverne.', value: 10, weight: 1, effects: [{ type: 'energy', amount: 6 }, { type: 'heal', amount: 6 }], consumable: true, jobs: ['cuisinier', 'tavernier'] }),
  item({ id: 'poisson', name: 'Poisson frais', category: 'ressource_animale', description: 'Pêché le matin même.', value: 3, weight: 1, jobs: ['pecheur', 'cuisinier'] }),
  item({ id: 'poisson_grille', name: 'Poisson grillé', category: 'aliment', description: 'Simple et bon.', value: 7, weight: 0.5, effects: [{ type: 'energy', amount: 4 }, { type: 'heal', amount: 3 }], consumable: true, jobs: ['cuisinier'] }),
  item({ id: 'fromage', name: 'Fromage', category: 'aliment', description: 'Meule halfeline affinée.', value: 6, weight: 0.5, effects: [{ type: 'energy', amount: 3 }], consumable: true, jobs: ['fermier'] }),
  item({ id: 'tarte_baies', name: 'Tarte aux baies', category: 'aliment', description: 'La fierté des halfelins.', value: 9, weight: 0.5, effects: [{ type: 'energy', amount: 5 }, { type: 'buff', stat: 'chance', amount: 1, hours: 8 }], consumable: true, jobs: ['cuisinier'] }),
  item({ id: 'ration', name: 'Ration de voyage', category: 'aliment', description: 'Pain dur et viande séchée.', value: 6, weight: 0.5, effects: [{ type: 'energy', amount: 5 }], consumable: true, jobs: ['cuisinier', 'marchand'] }),
  item({ id: 'festin', name: 'Festin', category: 'aliment', description: 'Un repas digne d’un seigneur. Objet de luxe.', value: 55, weight: 3, rarity: 'rare', effects: [{ type: 'energy', amount: 15 }, { type: 'heal', amount: 20 }, { type: 'buff', stat: 'charisme', amount: 2, hours: 12 }], consumable: true, jobs: ['cuisinier', 'tavernier'], tags: ['luxe'] }),
  item({ id: 'bouillie_rance', name: 'Bouillie rance', category: 'aliment', description: 'Nourriture de mauvaise qualité. Nourrit... à peine.', value: 1, weight: 0.5, rarity: 'mediocre', effects: [{ type: 'energy', amount: 1 }], consumable: true }),

  // ----------------------------------------------------------------- Boissons
  item({ id: 'biere', name: 'Bière', category: 'boisson', description: 'Chope de bière blonde.', value: 3, weight: 1, effects: [{ type: 'energy', amount: 2 }, { type: 'buff', stat: 'charisme', amount: 1, hours: 3 }], consumable: true, jobs: ['tavernier'] }),
  item({ id: 'vin', name: 'Vin', category: 'boisson', description: 'Vin rouge des coteaux de Valcourt.', value: 8, weight: 1, effects: [{ type: 'buff', stat: 'charisme', amount: 1, hours: 4 }], consumable: true, jobs: ['tavernier', 'marchand'] }),
  item({ id: 'hydromel', name: 'Hydromel', category: 'boisson', description: 'Boisson de miel fermenté, prisée des nains.', value: 12, weight: 1, effects: [{ type: 'energy', amount: 3 }, { type: 'buff', stat: 'volonte', amount: 1, hours: 4 }], consumable: true, jobs: ['tavernier'] }),
  item({ id: 'vin_elfique', name: 'Vin elfique', category: 'boisson', description: 'Nectar de Sylvebrune. Objet de luxe.', value: 45, weight: 1, rarity: 'rare', effects: [{ type: 'buff', stat: 'perception', amount: 2, hours: 8 }], consumable: true, jobs: ['marchand', 'tavernier'], tags: ['luxe'] }),

  // ------------------------------------------------------- Ressources animales
  item({ id: 'peau_animale', name: 'Peau animale', category: 'ressource_animale', description: 'Peau brute de gibier.', value: 5, weight: 2, jobs: ['chasseur', 'tanneur'] }),
  item({ id: 'fourrure_loup', name: 'Fourrure de loup', category: 'ressource_animale', description: 'Épaisse et chaude.', value: 9, weight: 2, jobs: ['chasseur', 'tanneur', 'tailleur'] }),
  item({ id: 'croc_loup', name: 'Croc de loup', category: 'ressource_animale', description: 'Trophée ou composant d’arme.', value: 5, weight: 0.1, jobs: ['chasseur', 'arcaniste'] }),
  item({ id: 'peau_ours', name: 'Peau d’ours', category: 'ressource_animale', description: 'Peau épaisse et lourde.', value: 20, weight: 5, rarity: 'peu_commun', jobs: ['chasseur', 'tanneur'] }),
  item({ id: 'graisse_ours', name: 'Graisse d’ours', category: 'ressource_animale', description: 'Imperméabilise le cuir, base de baumes.', value: 6, weight: 1, jobs: ['tanneur', 'guerisseur', 'alchimiste'] }),
  item({ id: 'plume', name: 'Plumes', category: 'ressource_animale', description: 'Pour flèches et plumes d’écriture.', value: 1, weight: 0.1, jobs: ['chasseur', 'ecrivain'] }),
  item({ id: 'bois_cerf', name: 'Bois de cerf', category: 'ressource_animale', description: 'Ramure solide et décorative.', value: 10, weight: 2, jobs: ['chasseur', 'charpentier'] }),
  item({ id: 'perle_noire', name: 'Perle noire', category: 'ressource_animale', description: 'Rarissime trouvaille de pêcheur. Objet de luxe.', value: 120, weight: 0.1, rarity: 'rare', jobs: ['pecheur', 'marchand'], tags: ['luxe'] }),

  // ---------------------------------------------------- Ressources de créatures
  item({ id: 'soie_araignee', name: 'Soie d’araignée', category: 'ressource_creature', description: 'Fil d’araignée géante, plus solide que l’acier à poids égal.', value: 14, weight: 0.5, rarity: 'peu_commun', jobs: ['tailleur', 'chasseur'] }),
  item({ id: 'venin_araignee', name: 'Venin d’araignée', category: 'ressource_creature', description: 'Paralysant puissant.', value: 16, weight: 0.2, rarity: 'peu_commun', jobs: ['alchimiste', 'voleur'] }),
  item({ id: 'os_troll', name: 'Os de troll', category: 'ressource_creature', description: 'Os massif, presque indestructible.', value: 30, weight: 6, rarity: 'peu_commun', jobs: ['forgeron', 'arcaniste'] }),
  item({ id: 'sang_troll', name: 'Sang régénérant', category: 'ressource_creature', description: 'Le sang d’un troll continue de guérir les chairs.', value: 50, weight: 0.5, rarity: 'rare', jobs: ['alchimiste', 'guerisseur'] }),
  item({ id: 'dent_ogre', name: 'Dent d’ogre', category: 'ressource_creature', description: 'Trophée recherché par les mercenaires.', value: 15, weight: 0.5, rarity: 'peu_commun', jobs: ['mercenaire'] }),
  item({ id: 'os_ancien', name: 'Os ancien', category: 'ressource_creature', description: 'Relique osseuse imprégnée de nécromancie.', value: 10, weight: 1, jobs: ['arcaniste', 'alchimiste'] }),
  item({ id: 'essence_maudite', name: 'Essence maudite', category: 'ressource_creature', description: 'Brume noire captive d’une goule ou d’un spectre.', value: 32, weight: 0.2, rarity: 'peu_commun', jobs: ['alchimiste', 'arcaniste'], illegal: true }),
  item({ id: 'ectoplasme', name: 'Ectoplasme', category: 'ressource_creature', description: 'Résidu glacé d’esprit.', value: 20, weight: 0.2, rarity: 'peu_commun', jobs: ['arcaniste'] }),
  item({ id: 'sang_vampirique', name: 'Sang vampirique', category: 'ressource_creature', description: 'Puissant et interdit.', value: 85, weight: 0.2, rarity: 'rare', jobs: ['alchimiste', 'arcaniste'], illegal: true }),
  item({ id: 'corne_demon', name: 'Corne de démon', category: 'ressource_creature', description: 'Encore chaude au toucher.', value: 50, weight: 1, rarity: 'rare', jobs: ['arcaniste'] }),
  item({ id: 'cristal_elementaire', name: 'Cristal élémentaire', category: 'ressource_creature', description: 'Cœur figé d’un élémentaire.', value: 65, weight: 1, rarity: 'rare', jobs: ['arcaniste'] }),
  item({ id: 'essence_magique', name: 'Essence magique', category: 'composant', description: 'Magie pure condensée en liquide lumineux.', value: 40, weight: 0.2, rarity: 'peu_commun', jobs: ['arcaniste', 'alchimiste', 'tailleur'] }),
  item({ id: 'ecaille_dragon', name: 'Écaille de dragon', category: 'ressource_creature', description: 'Impénétrable. Une seule vaut une fortune.', value: 300, weight: 2, rarity: 'legendaire', jobs: ['forgeron', 'tanneur'] }),
  item({ id: 'griffe_dragon', name: 'Griffe de dragon', category: 'ressource_creature', description: 'Tranchante comme un rasoir.', value: 220, weight: 2, rarity: 'epique', jobs: ['forgeron'] }),
  item({ id: 'coeur_draconique', name: 'Cœur draconique', category: 'ressource_creature', description: 'Bat encore faiblement. Source de légendes.', value: 900, weight: 4, rarity: 'legendaire', jobs: ['arcaniste', 'alchimiste'] }),

  // ---------------------------------------------------------------- Composants
  item({ id: 'cuir', name: 'Cuir tanné', category: 'composant', description: 'Cuir souple et résistant.', value: 12, weight: 1.5, jobs: ['tanneur', 'tailleur', 'forgeron'] }),
  item({ id: 'cuir_epais', name: 'Cuir épais', category: 'composant', description: 'Cuir d’ours traité à la graisse.', value: 35, weight: 3, rarity: 'peu_commun', jobs: ['tanneur'] }),
  item({ id: 'etoffe', name: 'Étoffe', category: 'composant', description: 'Rouleau de toile de lin.', value: 6, weight: 1, jobs: ['tailleur', 'marchand'] }),
  item({ id: 'soie_tissee', name: 'Soie tissée', category: 'composant', description: 'Tissu d’araignée, léger et solide.', value: 48, weight: 0.5, rarity: 'rare', jobs: ['tailleur'] }),
  item({ id: 'extrait_herbe', name: 'Extrait d’herbes', category: 'composant', description: 'Concentré de plantes médicinales.', value: 10, weight: 0.2, jobs: ['herboriste', 'alchimiste'] }),
  item({ id: 'lame_fer', name: 'Lame de fer', category: 'composant', description: 'Lame brute à monter sur une garde.', value: 22, weight: 2, jobs: ['forgeron'] }),
  item({ id: 'lame_acier', name: 'Lame d’acier', category: 'composant', description: 'Lame trempée de qualité.', value: 50, weight: 2, rarity: 'peu_commun', jobs: ['forgeron'] }),
  item({ id: 'manche_bois', name: 'Manche en bois', category: 'composant', description: 'Pour outils et armes.', value: 3, weight: 0.5, jobs: ['charpentier', 'forgeron'] }),
  item({ id: 'cristal_taille', name: 'Cristal taillé', category: 'composant', description: 'Cristal facetté qui canalise la magie.', value: 45, weight: 0.5, rarity: 'peu_commun', jobs: ['arcaniste'] }),

  // --------------------------------------------------------------------- Armes
  item({ id: 'couteau', name: 'Couteau', category: 'arme', description: 'Petit, discret, utile.', value: 6, weight: 0.5, slot: 'arme', effects: [{ type: 'damage_bonus', amount: 2 }], jobs: ['voleur', 'cuisinier'], tags: ['tranchant'] }),
  item({ id: 'baton_marche', name: 'Bâton de marche', category: 'arme', description: 'Aide à la marche, repousse les chiens.', value: 3, weight: 1.5, slot: 'arme', effects: [{ type: 'damage_bonus', amount: 2 }], tags: ['contondant'] }),
  item({ id: 'epee_rouillee', name: 'Épée rouillée', category: 'arme', description: 'Objet de mauvaise qualité. Mieux que rien.', value: 8, weight: 3, rarity: 'mediocre', slot: 'arme', effects: [{ type: 'damage_bonus', amount: 3 }], tags: ['tranchant'] }),
  item({ id: 'fronde', name: 'Fronde', category: 'arme', description: 'Arme des bergers et des halfelins.', value: 5, weight: 0.3, slot: 'arme', effects: [{ type: 'damage_bonus', amount: 3 }], tags: ['contondant'] }),
  item({ id: 'dague_ornee', name: 'Dague ornée', category: 'arme', description: 'Lame fine au pommeau serti. Objet de luxe.', value: 45, weight: 0.5, rarity: 'peu_commun', slot: 'arme', effects: [{ type: 'damage_bonus', amount: 4 }], tags: ['percant', 'luxe'] }),
  item({ id: 'epee_fer', name: 'Épée de fer', category: 'arme', description: 'L’arme standard des gardes.', value: 45, weight: 3, slot: 'arme', effects: [{ type: 'damage_bonus', amount: 6 }], jobs: ['forgeron', 'garde', 'mercenaire'], tags: ['tranchant'] }),
  item({ id: 'lance_chasse', name: 'Lance de chasse', category: 'arme', description: 'Longue portée, idéale contre les bêtes.', value: 30, weight: 3, slot: 'arme', effects: [{ type: 'damage_bonus', amount: 5 }], jobs: ['chasseur'], tags: ['percant'] }),
  item({ id: 'arc_court', name: 'Arc court', category: 'arme', description: 'Arc de chasse en if.', value: 35, weight: 1.5, slot: 'arme', effects: [{ type: 'damage_bonus', amount: 5 }], jobs: ['chasseur', 'charpentier'], tags: ['percant'] }),
  item({ id: 'hache_guerre', name: 'Hache de guerre', category: 'arme', description: 'Lourde lame naine.', value: 75, weight: 5, rarity: 'peu_commun', slot: 'arme', effects: [{ type: 'damage_bonus', amount: 9 }], requirements: { stats: { force: 7 } }, jobs: ['forgeron', 'mercenaire'], tags: ['tranchant'] }),
  item({ id: 'epee_acier', name: 'Épée d’acier', category: 'arme', description: 'Lame équilibrée et tranchante.', value: 95, weight: 3, rarity: 'peu_commun', slot: 'arme', effects: [{ type: 'damage_bonus', amount: 9 }], jobs: ['forgeron', 'mercenaire'], tags: ['tranchant'] }),
  item({ id: 'epee_argent', name: 'Épée d’argent', category: 'arme', description: 'Redoutée des vampires et morts-vivants.', value: 170, weight: 3, rarity: 'rare', slot: 'arme', effects: [{ type: 'damage_bonus', amount: 9 }], jobs: ['forgeron', 'mercenaire'], tags: ['tranchant', 'argent'] }),
  item({ id: 'lame_runique', name: 'Lame runique', category: 'arme', description: 'Épée enchantée d’un cristal élémentaire.', value: 420, weight: 3, rarity: 'epique', slot: 'arme', effects: [{ type: 'damage_bonus', amount: 13 }], requirements: { stats: { volonte: 7 } }, jobs: ['arcaniste'], tags: ['tranchant', 'magie', 'feu'] }),

  // ------------------------------------------------------------------ Armures
  item({ id: 'armure_cuir', name: 'Armure de cuir', category: 'armure', description: 'Protection légère et silencieuse.', value: 40, weight: 4, slot: 'armure', effects: [{ type: 'armor', amount: 2 }], jobs: ['tanneur'] }),
  item({ id: 'armure_fourrure', name: 'Armure de fourrure', category: 'armure', description: 'Chaude, robuste, prisée dans les cols.', value: 60, weight: 6, slot: 'armure', effects: [{ type: 'armor', amount: 3 }], jobs: ['tanneur'] }),
  item({ id: 'cotte_mailles', name: 'Cotte de mailles', category: 'armure', description: 'Anneaux d’acier entrelacés.', value: 120, weight: 10, rarity: 'peu_commun', slot: 'armure', effects: [{ type: 'armor', amount: 5 }], requirements: { stats: { force: 6 } }, jobs: ['forgeron'] }),
  item({ id: 'armure_soie', name: 'Armure de soie d’araignée', category: 'armure', description: 'Légère comme une chemise, solide comme des mailles.', value: 180, weight: 2, rarity: 'rare', slot: 'armure', effects: [{ type: 'armor', amount: 4 }, { type: 'buff', stat: 'discretion', amount: 1, hours: 0 }], jobs: ['tailleur'] }),
  item({ id: 'armure_ecailles', name: 'Armure en écailles de dragon', category: 'armure', description: 'Légendaire. Le feu glisse dessus.', value: 1800, weight: 8, rarity: 'legendaire', slot: 'armure', effects: [{ type: 'armor', amount: 10 }], jobs: ['forgeron', 'tanneur'] }),

  // -------------------------------------------------------------------- Outils
  item({ id: 'pioche', name: 'Pioche', category: 'outil', description: 'Indispensable au mineur.', value: 15, weight: 4, slot: 'outil', jobs: ['mineur'] }),
  item({ id: 'hache_bucheron', name: 'Hache de bûcheron', category: 'outil', description: 'Abat un arbre en quelques coups.', value: 15, weight: 4, slot: 'outil', jobs: ['bucheron'] }),
  item({ id: 'hachette', name: 'Hachette', category: 'outil', description: 'Petite hache polyvalente.', value: 8, weight: 2, slot: 'outil', effects: [{ type: 'damage_bonus', amount: 3 }], jobs: ['bucheron', 'chasseur'] }),
  item({ id: 'faucille', name: 'Faucille', category: 'outil', description: 'Pour moissonner et cueillir.', value: 6, weight: 1, slot: 'outil', jobs: ['fermier', 'herboriste'] }),
  item({ id: 'canne_peche', name: 'Canne à pêche', category: 'outil', description: 'Bambou, fil et hameçon.', value: 8, weight: 1, slot: 'outil', jobs: ['pecheur'] }),
  item({ id: 'marteau', name: 'Marteau de forge', category: 'outil', description: 'Outil du forgeron et du charpentier.', value: 10, weight: 2, slot: 'outil', jobs: ['forgeron', 'charpentier'] }),
  item({ id: 'couteau_depecage', name: 'Couteau à dépecer', category: 'outil', description: 'Récupère peaux et viande proprement.', value: 8, weight: 0.5, slot: 'outil', jobs: ['chasseur', 'tanneur'] }),
  item({ id: 'aiguille', name: 'Aiguille et fil', category: 'outil', description: 'Pour coudre cuir et tissu.', value: 4, weight: 0.1, slot: 'outil', jobs: ['tailleur', 'tanneur', 'guerisseur'] }),
  item({ id: 'mortier', name: 'Mortier et pilon', category: 'outil', description: 'Broie herbes et minéraux.', value: 10, weight: 1.5, slot: 'outil', jobs: ['herboriste', 'alchimiste'] }),
  item({ id: 'alambic', name: 'Alambic portatif', category: 'outil', description: 'Distille potions et poisons n’importe où.', value: 45, weight: 4, rarity: 'peu_commun', slot: 'outil', jobs: ['alchimiste'] }),
  item({ id: 'plume_encre', name: 'Plume et encre', category: 'outil', description: 'Nécessaire d’écriture.', value: 6, weight: 0.2, slot: 'outil', jobs: ['ecrivain'] }),
  item({ id: 'crochets', name: 'Crochets de serrurier', category: 'outil', description: 'Suspects si un garde les trouve.', value: 12, weight: 0.2, slot: 'outil', jobs: ['voleur'], tags: ['suspect'] }),
  item({ id: 'balance', name: 'Balance de marchand', category: 'outil', description: 'Évite de se faire gruger (+prix).', value: 20, weight: 1, slot: 'outil', jobs: ['marchand'] }),
  item({ id: 'luth', name: 'Luth', category: 'outil', description: 'Instrument de l’artiste itinérant.', value: 25, weight: 2, slot: 'outil', jobs: ['tavernier'] }),

  // ---------------------------------------------------------------- Vêtements
  item({ id: 'haillons', name: 'Haillons', category: 'vetement', description: 'Objet de mauvaise qualité. Les marchands vous regardent de travers.', value: 1, weight: 1, rarity: 'mediocre' }),
  item({ id: 'vetements_simples', name: 'Vêtements simples', category: 'vetement', description: 'Tenue de travail en lin.', value: 6, weight: 1, jobs: ['tailleur'] }),
  item({ id: 'cape_voyage', name: 'Cape de voyage', category: 'vetement', description: 'Protège de la pluie et des regards.', value: 18, weight: 1.5, jobs: ['tailleur'] }),
  item({ id: 'vetements_fins', name: 'Vêtements fins', category: 'vetement', description: 'Brocart et soie. Ouvre les portes des nobles.', value: 70, weight: 1.5, rarity: 'peu_commun', jobs: ['tailleur'], tags: ['luxe'] }),
  item({ id: 'robe_mage', name: 'Robe d’arcaniste', category: 'vetement', description: 'Tissu brodé de runes.', value: 90, weight: 1.5, rarity: 'peu_commun', slot: 'armure', effects: [{ type: 'armor', amount: 1 }, { type: 'buff', stat: 'volonte', amount: 1, hours: 0 }], jobs: ['tailleur', 'arcaniste'] }),

  // ------------------------------------------------------------------- Bijoux
  item({ id: 'anneau_cuivre', name: 'Anneau de cuivre', category: 'bijou', description: 'Bijou modeste.', value: 15, weight: 0.1, slot: 'bijou', jobs: ['forgeron'] }),
  item({ id: 'bague_argent', name: 'Bague d’argent', category: 'bijou', description: 'Élégante, et utile contre certaines créatures.', value: 60, weight: 0.1, rarity: 'peu_commun', slot: 'bijou', jobs: ['forgeron'] }),
  item({ id: 'chevaliere', name: 'Chevalière familiale', category: 'bijou', description: 'Porte le sceau de votre maison. Preuve de noblesse.', value: 80, weight: 0.1, rarity: 'peu_commun', slot: 'bijou', effects: [{ type: 'buff', stat: 'charisme', amount: 1, hours: 0 }], tags: ['noble'] }),
  item({ id: 'amulette_croc', name: 'Amulette de crocs', category: 'bijou', description: 'Porte-bonheur de chasseur.', value: 25, weight: 0.2, slot: 'bijou', effects: [{ type: 'buff', stat: 'perception', amount: 1, hours: 0 }], jobs: ['chasseur'] }),
  item({ id: 'bijou_noble', name: 'Bijou ancien', category: 'bijou', description: 'Parure d’Esteral. Objet rare et de luxe.', value: 160, weight: 0.2, rarity: 'rare', slot: 'bijou', effects: [{ type: 'buff', stat: 'charisme', amount: 2, hours: 0 }], tags: ['luxe'] }),
  item({ id: 'talisman_protection', name: 'Talisman de protection', category: 'objet_magique', description: 'Détourne les coups.', value: 80, weight: 0.2, rarity: 'peu_commun', slot: 'bijou', effects: [{ type: 'armor', amount: 2 }], jobs: ['arcaniste'] }),
  item({ id: 'anneau_enchante', name: 'Anneau enchanté', category: 'objet_magique', description: 'Anneau vibrant de pouvoir élémentaire.', value: 260, weight: 0.1, rarity: 'rare', slot: 'bijou', effects: [{ type: 'buff', stat: 'volonte', amount: 2, hours: 0 }, { type: 'damage_bonus', amount: 2 }], jobs: ['arcaniste'] }),

  // ----------------------------------------------------------- Objets magiques
  item({ id: 'focus_cristal', name: 'Focus de cristal', category: 'objet_magique', description: 'Bâton court au cristal taillé. Amplifie la volonté.', value: 130, weight: 1, rarity: 'rare', slot: 'arme', effects: [{ type: 'damage_bonus', amount: 7 }], requirements: { stats: { volonte: 6 } }, jobs: ['arcaniste'], tags: ['magie'] }),
  item({ id: 'pierre_lumiere', name: 'Pierre de lumière', category: 'objet_magique', description: 'Éclaire les ruines. Les morts-vivants la craignent.', value: 35, weight: 0.3, jobs: ['arcaniste'], tags: ['sacre'] }),

  // ------------------------------------------------------------------ Potions
  item({ id: 'potion_soin', name: 'Potion de soin', category: 'potion', description: 'Referme les plaies.', value: 22, weight: 0.3, effects: [{ type: 'heal', amount: 25 }], consumable: true, jobs: ['alchimiste', 'guerisseur'] }),
  item({ id: 'potion_energie', name: 'Potion d’énergie', category: 'potion', description: 'Chasse la fatigue.', value: 18, weight: 0.3, effects: [{ type: 'energy', amount: 10 }], consumable: true, jobs: ['alchimiste'] }),
  item({ id: 'antidote', name: 'Antidote', category: 'potion', description: 'Soigne poisons et maladies.', value: 15, weight: 0.3, effects: [{ type: 'cure' }, { type: 'heal', amount: 5 }], consumable: true, jobs: ['alchimiste', 'guerisseur'] }),
  item({ id: 'poison', name: 'Poison', category: 'potion', description: 'Enduit une lame d’un venin paralysant. Illégal.', value: 28, weight: 0.3, effects: [{ type: 'buff', stat: 'force', amount: 3, hours: 2 }], consumable: true, illegal: true, jobs: ['alchimiste', 'voleur'] }),
  item({ id: 'potion_force', name: 'Potion de force', category: 'potion', description: 'Muscles de troll pour quelques heures.', value: 40, weight: 0.3, effects: [{ type: 'buff', stat: 'force', amount: 3, hours: 6 }], consumable: true, jobs: ['alchimiste'] }),
  item({ id: 'elixir_regeneration', name: 'Élixir de régénération', category: 'potion', description: 'Soin complet grâce au sang de troll.', value: 160, weight: 0.3, rarity: 'rare', effects: [{ type: 'heal', amount: 100 }, { type: 'cure' }], consumable: true, jobs: ['alchimiste'] }),
  item({ id: 'potion_noire', name: 'Potion noire', category: 'potion', description: 'Pouvoir interdit au prix de votre âme... et de votre réputation. Illégal.', value: 95, weight: 0.3, rarity: 'rare', effects: [{ type: 'buff', stat: 'volonte', amount: 4, hours: 12 }, { type: 'buff', stat: 'force', amount: 2, hours: 12 }], consumable: true, illegal: true, jobs: ['alchimiste'] }),
  item({ id: 'bandage', name: 'Bandage', category: 'potion', description: 'Soin de fortune.', value: 4, weight: 0.1, effects: [{ type: 'heal', amount: 8 }], consumable: true, jobs: ['guerisseur'] }),
  item({ id: 'baume', name: 'Baume du guérisseur', category: 'potion', description: 'Soigne et purifie.', value: 18, weight: 0.3, effects: [{ type: 'heal', amount: 18 }, { type: 'cure' }], consumable: true, jobs: ['guerisseur'] }),

  // -------------------------------------------------------------------- Livres
  item({ id: 'traite_herbes', name: 'Traité des herbes', category: 'livre', description: 'Enseigne l’herboristerie (lecture : +XP herboriste).', value: 30, weight: 1, effects: [{ type: 'unlock', key: 'job:herboriste' }], consumable: true, jobs: ['herboriste', 'alchimiste'] }),
  item({ id: 'manuel_forge', name: 'Manuel du forgeron', category: 'livre', description: 'Apprend les bases de la forge.', value: 40, weight: 1.5, effects: [{ type: 'unlock', key: 'job:forgeron' }], consumable: true, jobs: ['forgeron'] }),
  item({ id: 'livre_cuisine', name: 'Livre de cuisine halfeline', category: 'livre', description: 'Apprend la cuisine.', value: 20, weight: 1, effects: [{ type: 'unlock', key: 'job:cuisinier' }], consumable: true, jobs: ['cuisinier'] }),
  item({ id: 'grimoire_elementaire', name: 'Grimoire élémentaire', category: 'livre', description: 'Ouvre la voie de l’arcaniste.', value: 200, weight: 2, rarity: 'rare', effects: [{ type: 'unlock', key: 'job:arcaniste' }], consumable: true, jobs: ['arcaniste'] }),
  item({ id: 'grimoire_ombre', name: 'Grimoire de l’ombre', category: 'livre', description: 'Savoir occulte de la Cour Nocturne. Illégal aux yeux du Temple.', value: 180, weight: 2, rarity: 'rare', effects: [{ type: 'buff', stat: 'volonte', amount: 2, hours: 48 }], consumable: true, illegal: true, jobs: ['arcaniste'] }),
  item({ id: 'almanach', name: 'Almanach du Val', category: 'livre', description: 'Saisons, marées et foires. Divertissant.', value: 12, weight: 0.5, effects: [{ type: 'buff', stat: 'perception', amount: 1, hours: 24 }], consumable: true }),

  // --------------------------------------------------------------- Marchandises
  item({ id: 'sel', name: 'Sel', category: 'marchandise', description: 'Conserve la viande, tanne les peaux. Il a donné son nom à la route.', value: 3, weight: 1, jobs: ['marchand', 'tanneur', 'cuisinier'] }),
  item({ id: 'epices', name: 'Épices', category: 'marchandise', description: 'Venues d’outre-mer par Port-Salant.', value: 22, weight: 0.5, rarity: 'peu_commun', jobs: ['marchand', 'cuisinier'] }),
  item({ id: 'parfum', name: 'Parfum', category: 'marchandise', description: 'Flacon précieux. Objet de luxe.', value: 45, weight: 0.3, rarity: 'rare', jobs: ['marchand'], tags: ['luxe'] }),
  item({ id: 'coffre_bois', name: 'Coffre en bois', category: 'marchandise', description: 'Meuble solide à clous forgés.', value: 30, weight: 8, jobs: ['charpentier'] }),
  item({ id: 'table_chene', name: 'Table de chêne', category: 'marchandise', description: 'Meuble robuste pour tavernes et maisons.', value: 38, weight: 15, jobs: ['charpentier'] }),
  item({ id: 'contrebande', name: 'Caisse de contrebande', category: 'marchandise', description: 'Alcool et tabac non taxés. Illégal, très rentable.', value: 60, weight: 5, illegal: true, jobs: ['voleur', 'marchand'] }),
  item({ id: 'statuette_esteral', name: 'Statuette d’Esteral', category: 'marchandise', description: 'Artefact ancien. Les vampires collectionneurs paient cher.', value: 90, weight: 1, rarity: 'rare', tags: ['ancien'] }),

  // ------------------------------------------------- Documents, licences, clés
  item({ id: 'parchemin', name: 'Parchemin', category: 'document', description: 'Feuille vierge.', value: 3, weight: 0.1, jobs: ['ecrivain'] }),
  item({ id: 'contrat_commerce', name: 'Contrat de commerce', category: 'document', description: 'Rédigé en bonne forme. Les marchands en achètent.', value: 30, weight: 0.1, jobs: ['ecrivain', 'marchand'] }),
  item({ id: 'lettre_recommandation', name: 'Lettre de recommandation', category: 'document', description: 'Signée par un notable : améliore l’accueil des PNJ de sa faction.', value: 40, weight: 0.1, rarity: 'peu_commun', jobs: ['ecrivain'] }),
  item({ id: 'faux_papiers', name: 'Faux papiers', category: 'document', description: 'Efface une partie de votre notoriété à l’usage. Illégal.', value: 70, weight: 0.1, rarity: 'peu_commun', illegal: true, effects: [{ type: 'unlock', key: 'notoriety:-20' }], consumable: true, jobs: ['ecrivain', 'voleur'] }),
  item({ id: 'licence_commerce', name: 'Licence de commerce', category: 'document', description: 'Autorise à posséder une boutique dans le Val.', value: 120, weight: 0.1, rarity: 'peu_commun', jobs: ['marchand'], availability: { factions: ['couronne', 'guilde_marchande'] } }),
  item({ id: 'licence_chasse', name: 'Licence de chasse', category: 'document', description: 'Chasser en forêt sans froisser le Cercle sylvain.', value: 35, weight: 0.1, jobs: ['chasseur'], availability: { factions: ['cercle_sylvain'] } }),
  item({ id: 'cle_crypte', name: 'Clé de la crypte', category: 'cle', description: 'Ouvre une crypte scellée d’Esteral.', value: 5, weight: 0.1, rarity: 'rare' }),
  item({ id: 'carte_val', name: 'Carte du Val de Brume', category: 'carte', description: 'Réduit les risques d’embuscade en voyage.', value: 12, weight: 0.1, jobs: ['ecrivain', 'marchand'] }),
  item({ id: 'carte_tresor', name: 'Carte au trésor', category: 'carte', description: 'Une croix au cœur des ruines...', value: 50, weight: 0.1, rarity: 'rare' }),
  item({ id: 'lettre_scellee', name: 'Lettre scellée', category: 'quete', description: 'Adressée au seigneur de Valcourt. Ne pas ouvrir.', value: 0, weight: 0.1, rarity: 'peu_commun' }),
  item({ id: 'relique_aube', name: 'Relique de l’Aube', category: 'quete', description: 'Fragment sacré volé au Temple il y a des années.', value: 150, weight: 0.5, rarity: 'rare', tags: ['sacre'] }),
];
