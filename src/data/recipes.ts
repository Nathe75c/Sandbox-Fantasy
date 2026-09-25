import type { RecipeDef } from '@/types';

/**
 * Recettes : SOURCE UNIQUE des dépendances de craft.
 * Chaînes principales :
 *   minerai -> lingot -> lame -> épée
 *   peau -> cuir -> armure
 *   herbe -> extrait -> potion
 *   blé -> farine -> pain
 *   bois -> planche -> meuble
 *   cristal brut -> cristal taillé -> focus
 *   croc de loup -> amulette ; venin -> poison ; essence maudite -> potion noire ;
 *   écaille de dragon -> armure légendaire.
 *
 * Le helper `r` garde le fichier compact : r(id, nom, métier, niveau, entrées, sorties, options).
 */
type Opts = Partial<Pick<RecipeDef, 'tools' | 'station' | 'hours' | 'energy' | 'difficulty' | 'stat' | 'xp'>>;
type Stack = [string, number][];

function r(id: string, name: string, jobId: string, level: number, inputs: Stack, outputs: Stack, o: Opts = {}): RecipeDef {
  return {
    id,
    name,
    jobId,
    level,
    inputs: inputs.map(([itemId, qty]) => ({ itemId, qty })),
    outputs: outputs.map(([itemId, qty]) => ({ itemId, qty })),
    tools: o.tools ?? [],
    station: o.station,
    hours: o.hours ?? 1,
    energy: o.energy ?? 2,
    difficulty: o.difficulty ?? 20 + level * 8,
    stat: o.stat ?? 'intelligence',
    xp: o.xp ?? 10 + level * 6,
  };
}

const FORGE: Opts = { station: 'forge', tools: ['marteau'], stat: 'force' };

export const RECIPES: RecipeDef[] = [
  // Forgeron --------------------------------------------------------------
  r('fondre_fer', 'Fondre du fer', 'forgeron', 1, [['minerai_fer', 2], ['charbon', 1]], [['lingot_fer', 1]], { station: 'forge', stat: 'force' }),
  r('fondre_cuivre', 'Fondre du cuivre', 'forgeron', 1, [['minerai_cuivre', 2], ['charbon', 1]], [['lingot_cuivre', 1]], { station: 'forge', stat: 'force' }),
  r('fondre_argent', 'Fondre de l’argent', 'forgeron', 3, [['minerai_argent', 2], ['charbon', 1]], [['lingot_argent', 1]], { station: 'forge', stat: 'force' }),
  r('acier', 'Forger de l’acier', 'forgeron', 3, [['lingot_fer', 2], ['charbon', 2]], [['lingot_acier', 1]], { ...FORGE, hours: 2 }),
  r('clous', 'Forger des clous', 'forgeron', 1, [['lingot_fer', 1]], [['clous', 8]], FORGE),
  r('lame_fer', 'Forger une lame de fer', 'forgeron', 1, [['lingot_fer', 2]], [['lame_fer', 1]], FORGE),
  r('epee_fer', 'Monter une épée de fer', 'forgeron', 2, [['lame_fer', 1], ['manche_bois', 1]], [['epee_fer', 1]], FORGE),
  r('couteau', 'Forger un couteau', 'forgeron', 1, [['lingot_fer', 1]], [['couteau', 1]], FORGE),
  r('pioche', 'Forger une pioche', 'forgeron', 1, [['lingot_fer', 1], ['manche_bois', 1]], [['pioche', 1]], FORGE),
  r('hache_bucheron', 'Forger une hache de bûcheron', 'forgeron', 1, [['lingot_fer', 1], ['manche_bois', 1]], [['hache_bucheron', 1]], FORGE),
  r('lame_acier', 'Forger une lame d’acier', 'forgeron', 3, [['lingot_acier', 2]], [['lame_acier', 1]], { ...FORGE, hours: 2 }),
  r('epee_acier', 'Monter une épée d’acier', 'forgeron', 4, [['lame_acier', 1], ['manche_bois', 1], ['cuir', 1]], [['epee_acier', 1]], FORGE),
  r('hache_guerre', 'Forger une hache de guerre', 'forgeron', 4, [['lingot_acier', 2], ['manche_bois', 1]], [['hache_guerre', 1]], { ...FORGE, hours: 2 }),
  r('epee_argent', 'Forger une épée d’argent', 'forgeron', 5, [['lame_acier', 1], ['lingot_argent', 1], ['cuir', 1]], [['epee_argent', 1]], { ...FORGE, hours: 3 }),
  r('cotte_mailles', 'Tresser une cotte de mailles', 'forgeron', 5, [['lingot_acier', 3], ['cuir', 1]], [['cotte_mailles', 1]], { ...FORGE, hours: 4 }),
  r('anneau_cuivre', 'Façonner un anneau de cuivre', 'forgeron', 2, [['lingot_cuivre', 1]], [['anneau_cuivre', 1]], { ...FORGE, stat: 'agilite' }),
  r('bague_argent', 'Façonner une bague d’argent', 'forgeron', 4, [['lingot_argent', 1]], [['bague_argent', 1]], { ...FORGE, stat: 'agilite' }),
  r('armure_ecailles', 'Forger l’armure en écailles de dragon', 'forgeron', 8, [['ecaille_dragon', 5], ['cuir_epais', 2], ['lingot_acier', 2]], [['armure_ecailles', 1]], { ...FORGE, hours: 8, energy: 8 }),

  // Charpentier -----------------------------------------------------------
  r('planches', 'Scier des planches', 'charpentier', 1, [['bois_brut', 1]], [['planche', 2]], { station: 'atelier', stat: 'force' }),
  r('manches', 'Tailler des manches', 'charpentier', 1, [['planche', 1]], [['manche_bois', 2]], { stat: 'agilite' }),
  r('baton', 'Tailler un bâton de marche', 'charpentier', 1, [['bois_brut', 1]], [['baton_marche', 1]], { stat: 'agilite' }),
  r('arc_court', 'Fabriquer un arc court', 'charpentier', 2, [['planche', 2], ['corde', 1]], [['arc_court', 1]], { station: 'atelier', stat: 'agilite' }),
  r('lance_chasse', 'Monter une lance de chasse', 'charpentier', 2, [['manche_bois', 2], ['lame_fer', 1]], [['lance_chasse', 1]], { station: 'atelier', stat: 'agilite' }),
  r('coffre_bois', 'Fabriquer un coffre', 'charpentier', 2, [['planche', 4], ['clous', 4]], [['coffre_bois', 1]], { station: 'atelier', tools: ['marteau'], stat: 'agilite', hours: 2 }),
  r('table_chene', 'Fabriquer une table', 'charpentier', 3, [['planche', 5], ['clous', 6]], [['table_chene', 1]], { station: 'atelier', tools: ['marteau'], stat: 'agilite', hours: 3 }),

  // Tanneur ---------------------------------------------------------------
  r('tanner_cuir', 'Tanner du cuir', 'tanneur', 1, [['peau_animale', 2], ['sel', 1]], [['cuir', 1]], { station: 'tannerie', stat: 'vitalite', hours: 2 }),
  r('cuir_epais', 'Traiter une peau d’ours', 'tanneur', 3, [['peau_ours', 1], ['sel', 1], ['graisse_ours', 1]], [['cuir_epais', 1]], { station: 'tannerie', stat: 'vitalite', hours: 3 }),
  r('armure_cuir', 'Coudre une armure de cuir', 'tanneur', 2, [['cuir', 3]], [['armure_cuir', 1]], { tools: ['aiguille'], stat: 'agilite', hours: 2 }),
  r('armure_fourrure', 'Coudre une armure de fourrure', 'tanneur', 3, [['fourrure_loup', 2], ['cuir', 2]], [['armure_fourrure', 1]], { tools: ['aiguille'], stat: 'agilite', hours: 3 }),
  r('parchemin', 'Préparer du parchemin', 'tanneur', 1, [['peau_animale', 1]], [['parchemin', 3]], { stat: 'agilite' }),

  // Tailleur --------------------------------------------------------------
  r('etoffe', 'Tisser de l’étoffe', 'tailleur', 1, [['lin', 3]], [['etoffe', 1]], { station: 'metier_a_tisser', stat: 'agilite' }),
  r('corde', 'Tresser une corde', 'tailleur', 1, [['lin', 2]], [['corde', 1]], { stat: 'agilite' }),
  r('vetements_simples', 'Coudre des vêtements simples', 'tailleur', 1, [['etoffe', 2]], [['vetements_simples', 1]], { tools: ['aiguille'], stat: 'agilite' }),
  r('cape_voyage', 'Coudre une cape de voyage', 'tailleur', 2, [['etoffe', 2], ['cuir', 1]], [['cape_voyage', 1]], { tools: ['aiguille'], stat: 'agilite' }),
  r('soie_tissee', 'Tisser la soie d’araignée', 'tailleur', 3, [['soie_araignee', 3]], [['soie_tissee', 1]], { station: 'metier_a_tisser', stat: 'agilite', hours: 2 }),
  r('vetements_fins', 'Coudre des vêtements fins', 'tailleur', 4, [['etoffe', 2], ['soie_tissee', 1]], [['vetements_fins', 1]], { tools: ['aiguille'], stat: 'agilite', hours: 3 }),
  r('robe_mage', 'Coudre une robe d’arcaniste', 'tailleur', 4, [['etoffe', 3], ['essence_magique', 1]], [['robe_mage', 1]], { tools: ['aiguille'], stat: 'agilite', hours: 3 }),
  r('armure_soie', 'Coudre une armure de soie', 'tailleur', 5, [['soie_tissee', 3], ['cuir', 1]], [['armure_soie', 1]], { tools: ['aiguille'], stat: 'agilite', hours: 4 }),

  // Cuisinier -------------------------------------------------------------
  r('farine', 'Moudre de la farine', 'cuisinier', 1, [['ble', 3]], [['farine', 2]], { stat: 'force' }),
  r('pain', 'Cuire du pain', 'cuisinier', 1, [['farine', 2]], [['pain', 3]], { station: 'cuisine' }),
  r('poisson_grille', 'Griller du poisson', 'cuisinier', 1, [['poisson', 1]], [['poisson_grille', 1]], { difficulty: 10, energy: 1 }),
  r('viande_sechee', 'Sécher de la viande', 'cuisinier', 1, [['viande', 2], ['sel', 1]], [['viande_sechee', 3]], { hours: 2 }),
  r('ragout', 'Mijoter un ragoût', 'cuisinier', 2, [['viande', 1], ['legumes', 2]], [['ragout', 2]], { station: 'cuisine' }),
  r('ration', 'Préparer des rations', 'cuisinier', 2, [['pain', 1], ['viande_sechee', 1]], [['ration', 2]], {}),
  r('tarte_baies', 'Cuire une tarte aux baies', 'cuisinier', 2, [['farine', 1], ['baies', 3], ['oeuf', 1]], [['tarte_baies', 1]], { station: 'cuisine' }),
  r('festin', 'Préparer un festin', 'cuisinier', 5, [['ragout', 2], ['tarte_baies', 1], ['vin', 1], ['epices', 1]], [['festin', 1]], { station: 'cuisine', hours: 4, energy: 5 }),

  // Tavernier -------------------------------------------------------------
  r('biere', 'Brasser de la bière', 'tavernier', 1, [['houblon', 2], ['ble', 1]], [['biere', 4]], { station: 'cuisine', hours: 2, stat: 'vitalite' }),
  r('hydromel', 'Fermenter de l’hydromel', 'tavernier', 2, [['miel', 2]], [['hydromel', 2]], { station: 'cuisine', hours: 2 }),

  // Herboriste ------------------------------------------------------------
  r('extrait_herbe', 'Préparer un extrait', 'herboriste', 1, [['herbe_soin', 3]], [['extrait_herbe', 1]], { tools: ['mortier'], stat: 'perception' }),

  // Alchimiste ------------------------------------------------------------
  r('potion_soin', 'Distiller une potion de soin', 'alchimiste', 1, [['extrait_herbe', 1], ['fiole', 1]], [['potion_soin', 1]], { station: 'laboratoire' }),
  r('antidote', 'Préparer un antidote', 'alchimiste', 1, [['racine_amere', 2], ['fiole', 1]], [['antidote', 1]], { tools: ['mortier'] }),
  r('potion_energie', 'Préparer une potion d’énergie', 'alchimiste', 2, [['baies', 3], ['miel', 1], ['fiole', 1]], [['potion_energie', 1]], { station: 'laboratoire' }),
  r('poison', 'Concocter un poison', 'alchimiste', 2, [['venin_araignee', 1], ['champignon_noir', 1], ['fiole', 1]], [['poison', 1]], { tools: ['mortier'] }),
  r('potion_force', 'Préparer une potion de force', 'alchimiste', 3, [['racine_amere', 1], ['graisse_ours', 1], ['fiole', 1]], [['potion_force', 1]], { station: 'laboratoire' }),
  r('elixir_regeneration', 'Distiller un élixir de régénération', 'alchimiste', 5, [['sang_troll', 1], ['fleur_lune', 1], ['fiole', 1]], [['elixir_regeneration', 1]], { station: 'laboratoire', hours: 3, stat: 'volonte' }),
  r('potion_noire', 'Distiller la potion noire', 'alchimiste', 5, [['essence_maudite', 1], ['mandragore', 1], ['fiole', 1]], [['potion_noire', 1]], { station: 'laboratoire', hours: 3, stat: 'volonte' }),

  // Guérisseur ------------------------------------------------------------
  r('bandage', 'Préparer des bandages', 'guerisseur', 1, [['etoffe', 1]], [['bandage', 3]], { stat: 'agilite', difficulty: 10 }),
  r('baume', 'Préparer un baume', 'guerisseur', 2, [['herbe_soin', 2], ['graisse_ours', 1]], [['baume', 2]], { tools: ['mortier'], stat: 'volonte' }),

  // Arcaniste -------------------------------------------------------------
  r('cristal_taille', 'Tailler un cristal', 'arcaniste', 1, [['cristal_brut', 1]], [['cristal_taille', 1]], { stat: 'agilite', hours: 2 }),
  r('essence_magique', 'Condenser une essence magique', 'arcaniste', 2, [['fleur_lune', 2], ['cristal_brut', 1]], [['essence_magique', 1]], { station: 'autel', stat: 'volonte', hours: 2 }),
  r('essence_ecto', 'Purifier de l’ectoplasme', 'arcaniste', 2, [['ectoplasme', 2]], [['essence_magique', 1]], { station: 'autel', stat: 'volonte' }),
  r('pierre_lumiere', 'Enchanter une pierre de lumière', 'arcaniste', 2, [['cristal_taille', 1], ['eau_benite', 1]], [['pierre_lumiere', 2]], { station: 'autel', stat: 'volonte' }),
  r('focus_cristal', 'Assembler un focus de cristal', 'arcaniste', 3, [['cristal_taille', 1], ['bois_precieux', 1]], [['focus_cristal', 1]], { station: 'autel', stat: 'volonte', hours: 3 }),
  r('talisman', 'Enchanter un talisman', 'arcaniste', 3, [['amulette_croc', 1], ['essence_magique', 1]], [['talisman_protection', 1]], { station: 'autel', stat: 'volonte', hours: 2 }),
  r('anneau_enchante', 'Enchanter un anneau', 'arcaniste', 5, [['bague_argent', 1], ['cristal_elementaire', 1]], [['anneau_enchante', 1]], { station: 'autel', stat: 'volonte', hours: 4 }),
  r('lame_runique', 'Forger une lame runique', 'arcaniste', 6, [['epee_acier', 1], ['cristal_elementaire', 1], ['essence_magique', 1]], [['lame_runique', 1]], { station: 'autel', stat: 'volonte', hours: 6, energy: 6 }),

  // Chasseur --------------------------------------------------------------
  r('amulette_croc', 'Monter une amulette de crocs', 'chasseur', 2, [['croc_loup', 3], ['corde', 1]], [['amulette_croc', 1]], { stat: 'agilite' }),

  // Écrivain --------------------------------------------------------------
  r('contrat_commerce', 'Rédiger un contrat de commerce', 'ecrivain', 1, [['parchemin', 2]], [['contrat_commerce', 1]], { tools: ['plume_encre'] }),
  r('carte_val', 'Dessiner une carte du Val', 'ecrivain', 2, [['parchemin', 2]], [['carte_val', 1]], { tools: ['plume_encre'], stat: 'perception', hours: 3 }),
  r('lettre_recommandation', 'Rédiger une lettre de recommandation', 'ecrivain', 3, [['parchemin', 1]], [['lettre_recommandation', 1]], { tools: ['plume_encre'], stat: 'charisme', hours: 2 }),
  r('faux_papiers', 'Falsifier des papiers', 'ecrivain', 4, [['parchemin', 2]], [['faux_papiers', 1]], { tools: ['plume_encre'], stat: 'agilite', hours: 3 }),
];
