# Items

Source : `src/data/items.ts` — **158 items** en 22 catégories. Les liens de fabrication, de butin, de récolte et de vente sont **dérivés** par `itemUsage()` (`src/data/index.ts`) : ils ne sont pas stockés dans les items.

## 1. Champs d'un item (`ItemDef`)

| Champ | Rôle |
|---|---|
| `id`, `name`, `description` | Identité (id `snake_case` stable). |
| `category` | Une des 22 catégories ; détermine l'`utility` par défaut, les boutiques qui le rachètent (`buysCategories`), les facteurs de marché (`produces`/`demands` des lieux) et les effets d'événements par catégorie. |
| `value` | Valeur de base en pièces d'or (po), avant marché, remises et événements. |
| `weight` | Poids (charge max = 40 + FOR × 4). Défaut 1. |
| `rarity` | `mediocre`, `commun` (défaut), `peu_commun`, `rare`, `epique`, `legendaire` : influence le réassort des boutiques. |
| `utility` | Texte court affiché (« Arme », « Ingrédient de cuisine »…). |
| `effects` | `heal`, `energy`, `buff` (stat, montant, heures ; `hours: 0` = passif tant qu'équipé), `damage_bonus`, `armor`, `poison`, `cure`, `learn_recipe`, `unlock` (ex. `job:forgeron`). |
| `slot` | `arme`, `armure`, `bijou` (équipables) ou `outil` (actif depuis l'inventaire). |
| `requirements` | Stats minimales (ex. hache de guerre : FOR 7) ou niveaux de métier. |
| `relatedJobs` | Métiers concernés (helper : `jobs`). |
| `availability` | Indication d'origine (lieux, factions, métiers) : ex. eau bénite → Temple de l'Aube. |
| `consumable` | Disparaît à l'usage. |
| `illegal` | Refusé par les boutiques honnêtes, racheté par les receleurs. |
| `tags` | Tags de dégâts des armes (`tranchant`, `contondant`, `percant`, `feu`, `sacre`, `argent`, `poison`, `magie`) et tags divers (`luxe`, `noble`, `suspect`, `ancien`). |

État dynamique associé (dans `PlayerState.inventory`) : `qty` et `stolen` (objet volé).

## 2. Raretés

| Rareté | Nombre | Exemples |
|---|---|---|
| Médiocre | 3 | Bouillie rance, Épée rouillée, Haillons |
| Commun | 93 | Pain, Minerai de fer, Épée de fer |
| Peu commun | 31 | Lingot d'acier, Cotte de mailles, Essence magique |
| Rare | 26 | Mithril brut, Épée d'argent, Élixir de régénération |
| Épique | 2 | Griffe de dragon, Lame runique |
| Légendaire | 3 | Écaille de dragon, Cœur draconique, Armure en écailles de dragon |

## 3. Catégories

| Catégorie | Nb | Rôle dans le jeu |
|---|---|---|
| `minerai` | 7 | Récolté par le Mineur, fondu à la forge. |
| `materiau` | 10 | Produits intermédiaires (lingots, planches, clous, corde) et pierre/bois. |
| `composant` | 11 | Pièces d'artisanat (cuir, étoffe, lames, extraits, cristal taillé, fioles, essence magique). |
| `plante` | 8 | Herboriste et fermier ; base des potions. |
| `ingredient` | 7 | Cuisine et brassage. |
| `aliment` | 9 | Restaurent énergie/PV ; certains donnent des buffs. |
| `boisson` | 4 | Énergie et buffs sociaux (charisme, volonté, perception). |
| `ressource_animale` | 10 | Chasse et pêche. |
| `ressource_creature` | 14 | Butins de monstres, morts-vivants, dragon ; ingrédients d'élite. |
| `arme` | 12 | Bonus de dégâts + tag de dégâts. |
| `armure` | 5 | Armure (réduit les dégâts subis). |
| `outil` | 14 | Conditions de récolte/recette ; certains servent d'arme d'appoint (hachette). |
| `vetement` | 5 | Luxe, statut, bonus passifs (robe d'arcaniste). |
| `bijou` | 5 | Bonus passifs de stats. |
| `objet_magique` | 4 | Talismans, anneaux, focus, pierre de lumière. |
| `potion` | 9 | Soins, énergie, buffs, poisons. |
| `livre` | 6 | Apprendre un métier ou buff long. |
| `marchandise` | 7 | Commerce pur (épices, parfum, contrebande, meubles, artefacts). |
| `document` | 6 | Contrats, lettres, licences, faux papiers. |
| `cle` | 1 | Clé de la crypte (usage futur). |
| `carte` | 2 | Carte du Val (−8 % embuscade), carte au trésor (usage futur). |
| `quete` | 2 | Lettre scellée, relique de l'Aube. |

## 4. Objets à effet mécanique notable

| Item | Effet |
|---|---|
| Carte du Val (`carte_val`) | −8 points au risque d'embuscade en voyage. |
| Faux papiers (`faux_papiers`) | `unlock: notoriety:-20` : réduit la notoriété de 20. |
| Licence de commerce (`licence_commerce`) | Requise pour acheter une boutique. |
| Traité des herbes, Manuel du forgeron, Livre de cuisine halfeline, Grimoire élémentaire | Apprennent Herboriste, Forgeron, Cuisinier, Arcaniste. |
| Chevalière, Bijou ancien, Amulette de crocs, Robe d'arcaniste, Armure de soie, Anneau enchanté | Bonus passifs (`buff` à `hours: 0`). |
| Élixir de régénération | +100 PV et guérison. |
| Potion noire (illégale) | VOL +4 et FOR +2 pendant 12 h. |
| Crochets de serrurier | Outil du Voleur, tag `suspect`. |

⚠ = item illégal (`illegal: true`).

## 5. Liste complète par catégorie

### minerai (7)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `minerai_fer` | Minerai de fer | 4 | 3 | Commun | — | mineur, forgeron |
| `minerai_cuivre` | Minerai de cuivre | 3 | 3 | Commun | — | mineur, forgeron |
| `charbon` | Charbon | 2 | 2 | Commun | — | mineur, forgeron |
| `minerai_argent` | Minerai d’argent | 12 | 3 | Peu commun | — | mineur, forgeron |
| `mithril_brut` | Mithril brut | 70 | 2 | Rare | — | mineur, forgeron |
| `gemme_brute` | Gemme brute | 40 | 0.5 | Rare | — | mineur, arcaniste |
| `cristal_brut` | Cristal brut | 15 | 1 | Peu commun | — | mineur, arcaniste |

### materiau (10)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `pierre` | Pierre | 1 | 5 | Commun | — | mineur, charpentier |
| `lingot_fer` | Lingot de fer | 12 | 2 | Commun | — | forgeron |
| `lingot_cuivre` | Lingot de cuivre | 9 | 2 | Commun | — | forgeron |
| `lingot_acier` | Lingot d’acier | 28 | 2 | Peu commun | — | forgeron |
| `lingot_argent` | Lingot d’argent | 32 | 2 | Peu commun | — | forgeron |
| `bois_brut` | Bois brut | 2 | 4 | Commun | — | bucheron, charpentier |
| `bois_precieux` | Bois de lune | 18 | 3 | Rare | — | bucheron, charpentier, arcaniste |
| `planche` | Planche | 4 | 2 | Commun | — | charpentier |
| `clous` | Clous | 1 | 0.2 | Commun | — | forgeron, charpentier |
| `corde` | Corde | 4 | 1 | Commun | — | tailleur, charpentier |

### composant (11)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `fiole` | Fiole | 2 | 0.2 | Commun | — | alchimiste |
| `essence_magique` | Essence magique | 40 | 0.2 | Peu commun | — | arcaniste, alchimiste, tailleur |
| `cuir` | Cuir tanné | 12 | 1.5 | Commun | — | tanneur, tailleur, forgeron |
| `cuir_epais` | Cuir épais | 35 | 3 | Peu commun | — | tanneur |
| `etoffe` | Étoffe | 6 | 1 | Commun | — | tailleur, marchand |
| `soie_tissee` | Soie tissée | 48 | 0.5 | Rare | — | tailleur |
| `extrait_herbe` | Extrait d’herbes | 10 | 0.2 | Commun | — | herboriste, alchimiste |
| `lame_fer` | Lame de fer | 22 | 2 | Commun | — | forgeron |
| `lame_acier` | Lame d’acier | 50 | 2 | Peu commun | — | forgeron |
| `manche_bois` | Manche en bois | 3 | 0.5 | Commun | — | charpentier, forgeron |
| `cristal_taille` | Cristal taillé | 45 | 0.5 | Peu commun | — | arcaniste |

### plante (8)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `herbe_soin` | Herbe de soin | 3 | 0.2 | Commun | — | herboriste, alchimiste, guerisseur |
| `fleur_lune` | Fleur de lune | 12 | 0.1 | Peu commun | — | herboriste, alchimiste, arcaniste |
| `champignon_noir` | Champignon noir | 6 | 0.2 | Commun | — | herboriste, alchimiste |
| `racine_amere` | Racine amère | 4 | 0.3 | Commun | — | herboriste, alchimiste |
| `mandragore` | Mandragore | 28 | 0.5 | Rare | — | herboriste, alchimiste |
| `baies` | Baies sauvages | 2 | 0.2 | Commun | Énergie +1 | herboriste, cuisinier |
| `lin` | Lin | 2 | 0.5 | Commun | — | fermier, tailleur |
| `houblon` | Houblon | 2 | 0.3 | Commun | — | fermier, tavernier |

### ingredient (7)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `ble` | Blé | 1 | 1 | Commun | — | fermier, cuisinier |
| `farine` | Farine | 3 | 1 | Commun | — | cuisinier |
| `legumes` | Légumes | 2 | 1 | Commun | — | fermier, cuisinier |
| `oeuf` | Œufs | 2 | 0.5 | Commun | — | fermier, cuisinier |
| `lait` | Lait | 2 | 1 | Commun | — | fermier, cuisinier |
| `miel` | Miel | 5 | 0.5 | Commun | — | fermier, tavernier, alchimiste |
| `eau_benite` | Eau bénite | 10 | 0.5 | Commun | — | guerisseur, alchimiste |

### aliment (9)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `pain` | Pain | 3 | 0.5 | Commun | Énergie +3, PV +2 | cuisinier |
| `viande_sechee` | Viande séchée | 6 | 0.5 | Commun | Énergie +4 | cuisinier, chasseur |
| `ragout` | Ragoût | 10 | 1 | Commun | Énergie +6, PV +6 | cuisinier, tavernier |
| `poisson_grille` | Poisson grillé | 7 | 0.5 | Commun | Énergie +4, PV +3 | cuisinier |
| `fromage` | Fromage | 6 | 0.5 | Commun | Énergie +3 | fermier |
| `tarte_baies` | Tarte aux baies | 9 | 0.5 | Commun | Énergie +5, CHN +1 (8 h) | cuisinier |
| `ration` | Ration de voyage | 6 | 0.5 | Commun | Énergie +5 | cuisinier, marchand |
| `festin` | Festin | 55 | 3 | Rare | Énergie +15, PV +20, CHA +2 (12 h) ; tags luxe | cuisinier, tavernier |
| `bouillie_rance` | Bouillie rance | 1 | 0.5 | Médiocre | Énergie +1 | — |

### ressource_animale (10)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `viande` | Viande crue | 4 | 1 | Commun | — | chasseur, cuisinier |
| `poisson` | Poisson frais | 3 | 1 | Commun | — | pecheur, cuisinier |
| `peau_animale` | Peau animale | 5 | 2 | Commun | — | chasseur, tanneur |
| `fourrure_loup` | Fourrure de loup | 9 | 2 | Commun | — | chasseur, tanneur, tailleur |
| `croc_loup` | Croc de loup | 5 | 0.1 | Commun | — | chasseur, arcaniste |
| `peau_ours` | Peau d’ours | 20 | 5 | Peu commun | — | chasseur, tanneur |
| `graisse_ours` | Graisse d’ours | 6 | 1 | Commun | — | tanneur, guerisseur, alchimiste |
| `plume` | Plumes | 1 | 0.1 | Commun | — | chasseur, ecrivain |
| `bois_cerf` | Bois de cerf | 10 | 2 | Commun | — | chasseur, charpentier |
| `perle_noire` | Perle noire | 120 | 0.1 | Rare | tags luxe | pecheur, marchand |

### boisson (4)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `biere` | Bière | 3 | 1 | Commun | Énergie +2, CHA +1 (3 h) | tavernier |
| `vin` | Vin | 8 | 1 | Commun | CHA +1 (4 h) | tavernier, marchand |
| `hydromel` | Hydromel | 12 | 1 | Commun | Énergie +3, VOL +1 (4 h) | tavernier |
| `vin_elfique` | Vin elfique | 45 | 1 | Rare | PER +2 (8 h) ; tags luxe | marchand, tavernier |

### ressource_creature (14)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `soie_araignee` | Soie d’araignée | 14 | 0.5 | Peu commun | — | tailleur, chasseur |
| `venin_araignee` | Venin d’araignée | 16 | 0.2 | Peu commun | — | alchimiste, voleur |
| `os_troll` | Os de troll | 30 | 6 | Peu commun | — | forgeron, arcaniste |
| `sang_troll` | Sang régénérant | 50 | 0.5 | Rare | — | alchimiste, guerisseur |
| `dent_ogre` | Dent d’ogre | 15 | 0.5 | Peu commun | — | mercenaire |
| `os_ancien` | Os ancien | 10 | 1 | Commun | — | arcaniste, alchimiste |
| `essence_maudite` | Essence maudite ⚠ | 32 | 0.2 | Peu commun | — | alchimiste, arcaniste |
| `ectoplasme` | Ectoplasme | 20 | 0.2 | Peu commun | — | arcaniste |
| `sang_vampirique` | Sang vampirique ⚠ | 85 | 0.2 | Rare | — | alchimiste, arcaniste |
| `corne_demon` | Corne de démon | 50 | 1 | Rare | — | arcaniste |
| `cristal_elementaire` | Cristal élémentaire | 65 | 1 | Rare | — | arcaniste |
| `ecaille_dragon` | Écaille de dragon | 300 | 2 | Légendaire | — | forgeron, tanneur |
| `griffe_dragon` | Griffe de dragon | 220 | 2 | Épique | — | forgeron |
| `coeur_draconique` | Cœur draconique | 900 | 4 | Légendaire | — | arcaniste, alchimiste |

### arme (12)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `couteau` | Couteau | 6 | 0.5 | Commun | slot arme ; Dégâts +2 ; tags tranchant | voleur, cuisinier |
| `baton_marche` | Bâton de marche | 3 | 1.5 | Commun | slot arme ; Dégâts +2 ; tags contondant | — |
| `epee_rouillee` | Épée rouillée | 8 | 3 | Médiocre | slot arme ; Dégâts +3 ; tags tranchant | — |
| `fronde` | Fronde | 5 | 0.3 | Commun | slot arme ; Dégâts +3 ; tags contondant | — |
| `dague_ornee` | Dague ornée | 45 | 0.5 | Peu commun | slot arme ; Dégâts +4 ; tags percant/luxe | — |
| `epee_fer` | Épée de fer | 45 | 3 | Commun | slot arme ; Dégâts +6 ; tags tranchant | forgeron, garde, mercenaire |
| `lance_chasse` | Lance de chasse | 30 | 3 | Commun | slot arme ; Dégâts +5 ; tags percant | chasseur |
| `arc_court` | Arc court | 35 | 1.5 | Commun | slot arme ; Dégâts +5 ; tags percant | chasseur, charpentier |
| `hache_guerre` | Hache de guerre | 75 | 5 | Peu commun | slot arme ; Dégâts +9 ; requiert FOR +7 ; tags tranchant | forgeron, mercenaire |
| `epee_acier` | Épée d’acier | 95 | 3 | Peu commun | slot arme ; Dégâts +9 ; tags tranchant | forgeron, mercenaire |
| `epee_argent` | Épée d’argent | 170 | 3 | Rare | slot arme ; Dégâts +9 ; tags tranchant/argent | forgeron, mercenaire |
| `lame_runique` | Lame runique | 420 | 3 | Épique | slot arme ; Dégâts +13 ; requiert VOL +7 ; tags tranchant/magie/feu | arcaniste |

### armure (5)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `armure_cuir` | Armure de cuir | 40 | 4 | Commun | slot armure ; Armure +2 | tanneur |
| `armure_fourrure` | Armure de fourrure | 60 | 6 | Commun | slot armure ; Armure +3 | tanneur |
| `cotte_mailles` | Cotte de mailles | 120 | 10 | Peu commun | slot armure ; Armure +5 ; requiert FOR +6 | forgeron |
| `armure_soie` | Armure de soie d’araignée | 180 | 2 | Rare | slot armure ; Armure +4, DIS +1 (passif) | tailleur |
| `armure_ecailles` | Armure en écailles de dragon | 1800 | 8 | Légendaire | slot armure ; Armure +10 | forgeron, tanneur |

### outil (14)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `pioche` | Pioche | 15 | 4 | Commun | slot outil | mineur |
| `hache_bucheron` | Hache de bûcheron | 15 | 4 | Commun | slot outil | bucheron |
| `hachette` | Hachette | 8 | 2 | Commun | slot outil ; Dégâts +3 | bucheron, chasseur |
| `faucille` | Faucille | 6 | 1 | Commun | slot outil | fermier, herboriste |
| `canne_peche` | Canne à pêche | 8 | 1 | Commun | slot outil | pecheur |
| `marteau` | Marteau de forge | 10 | 2 | Commun | slot outil | forgeron, charpentier |
| `couteau_depecage` | Couteau à dépecer | 8 | 0.5 | Commun | slot outil | chasseur, tanneur |
| `aiguille` | Aiguille et fil | 4 | 0.1 | Commun | slot outil | tailleur, tanneur, guerisseur |
| `mortier` | Mortier et pilon | 10 | 1.5 | Commun | slot outil | herboriste, alchimiste |
| `alambic` | Alambic portatif | 45 | 4 | Peu commun | slot outil | alchimiste |
| `plume_encre` | Plume et encre | 6 | 0.2 | Commun | slot outil | ecrivain |
| `crochets` | Crochets de serrurier | 12 | 0.2 | Commun | slot outil ; tags suspect | voleur |
| `balance` | Balance de marchand | 20 | 1 | Commun | slot outil | marchand |
| `luth` | Luth | 25 | 2 | Commun | slot outil | tavernier |

### vetement (5)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `haillons` | Haillons | 1 | 1 | Médiocre | — | — |
| `vetements_simples` | Vêtements simples | 6 | 1 | Commun | — | tailleur |
| `cape_voyage` | Cape de voyage | 18 | 1.5 | Commun | — | tailleur |
| `vetements_fins` | Vêtements fins | 70 | 1.5 | Peu commun | tags luxe | tailleur |
| `robe_mage` | Robe d’arcaniste | 90 | 1.5 | Peu commun | Se porte en armure : armure +1, VOL +1 (passif) | tailleur, arcaniste |

### bijou (5)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `anneau_cuivre` | Anneau de cuivre | 15 | 0.1 | Commun | slot bijou | forgeron |
| `bague_argent` | Bague d’argent | 60 | 0.1 | Peu commun | slot bijou | forgeron |
| `chevaliere` | Chevalière familiale | 80 | 0.1 | Peu commun | slot bijou ; CHA +1 (passif) ; tags noble | — |
| `amulette_croc` | Amulette de crocs | 25 | 0.2 | Commun | slot bijou ; PER +1 (passif) | chasseur |
| `bijou_noble` | Bijou ancien | 160 | 0.2 | Rare | slot bijou ; CHA +2 (passif) ; tags luxe | — |

### objet_magique (4)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `talisman_protection` | Talisman de protection | 80 | 0.2 | Peu commun | slot bijou ; Armure +2 | arcaniste |
| `anneau_enchante` | Anneau enchanté | 260 | 0.1 | Rare | slot bijou ; VOL +2 (passif), Dégâts +2 | arcaniste |
| `focus_cristal` | Focus de cristal | 130 | 1 | Rare | slot arme ; Dégâts +7 ; requiert VOL +6 ; tags magie | arcaniste |
| `pierre_lumiere` | Pierre de lumière | 35 | 0.3 | Commun | tags sacre | arcaniste |

### potion (9)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `potion_soin` | Potion de soin | 22 | 0.3 | Commun | PV +25 | alchimiste, guerisseur |
| `potion_energie` | Potion d’énergie | 18 | 0.3 | Commun | Énergie +10 | alchimiste |
| `antidote` | Antidote | 15 | 0.3 | Commun | Guérit, PV +5 | alchimiste, guerisseur |
| `poison` | Poison ⚠ | 28 | 0.3 | Commun | FOR +3 (2 h) | alchimiste, voleur |
| `potion_force` | Potion de force | 40 | 0.3 | Commun | FOR +3 (6 h) | alchimiste |
| `elixir_regeneration` | Élixir de régénération | 160 | 0.3 | Rare | PV +100, Guérit | alchimiste |
| `potion_noire` | Potion noire ⚠ | 95 | 0.3 | Rare | VOL +4 (12 h), FOR +2 (12 h) | alchimiste |
| `bandage` | Bandage | 4 | 0.1 | Commun | PV +8 | guerisseur |
| `baume` | Baume du guérisseur | 18 | 0.3 | Commun | PV +18, Guérit | guerisseur |

### livre (6)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `traite_herbes` | Traité des herbes | 30 | 1 | Commun | Débloque `job:herboriste` | herboriste, alchimiste |
| `manuel_forge` | Manuel du forgeron | 40 | 1.5 | Commun | Débloque `job:forgeron` | forgeron |
| `livre_cuisine` | Livre de cuisine halfeline | 20 | 1 | Commun | Débloque `job:cuisinier` | cuisinier |
| `grimoire_elementaire` | Grimoire élémentaire | 200 | 2 | Rare | Débloque `job:arcaniste` | arcaniste |
| `grimoire_ombre` | Grimoire de l’ombre ⚠ | 180 | 2 | Rare | VOL +2 (48 h) | arcaniste |
| `almanach` | Almanach du Val | 12 | 0.5 | Commun | PER +1 (24 h) | — |

### marchandise (7)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `sel` | Sel | 3 | 1 | Commun | — | marchand, tanneur, cuisinier |
| `epices` | Épices | 22 | 0.5 | Peu commun | — | marchand, cuisinier |
| `parfum` | Parfum | 45 | 0.3 | Rare | tags luxe | marchand |
| `coffre_bois` | Coffre en bois | 30 | 8 | Commun | — | charpentier |
| `table_chene` | Table de chêne | 38 | 15 | Commun | — | charpentier |
| `contrebande` | Caisse de contrebande ⚠ | 60 | 5 | Commun | — | voleur, marchand |
| `statuette_esteral` | Statuette d’Esteral | 90 | 1 | Rare | tags ancien | — |

### document (6)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `parchemin` | Parchemin | 3 | 0.1 | Commun | — | ecrivain |
| `contrat_commerce` | Contrat de commerce | 30 | 0.1 | Commun | — | ecrivain, marchand |
| `lettre_recommandation` | Lettre de recommandation | 40 | 0.1 | Peu commun | — | ecrivain |
| `faux_papiers` | Faux papiers ⚠ | 70 | 0.1 | Peu commun | Débloque `notoriety:-20` | ecrivain, voleur |
| `licence_commerce` | Licence de commerce | 120 | 0.1 | Peu commun | — | marchand |
| `licence_chasse` | Licence de chasse | 35 | 0.1 | Commun | — | chasseur |

### cle (1)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `cle_crypte` | Clé de la crypte | 5 | 0.1 | Rare | — | — |

### carte (2)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `carte_val` | Carte du Val de Brume | 12 | 0.1 | Commun | — | ecrivain, marchand |
| `carte_tresor` | Carte au trésor | 50 | 0.1 | Rare | — | — |

### quete (2)

| id | Nom | Valeur | Poids | Rareté | Effets / emplacement | Métiers liés |
|---|---|---|---|---|---|---|
| `lettre_scellee` | Lettre scellée | 0 | 0.1 | Peu commun | — | — |
| `relique_aube` | Relique de l’Aube | 150 | 0.5 | Rare | tags sacre | — |

## 6. Points d'attention

- Items obtenus uniquement comme objets de départ d'origine : `dague_ornee`, `luth`, `chevaliere`. La `relique_aube` (désirée par Sœur Maëlis) se rachète chez le receleur des Bas-Quais, comme le laisse entendre la rumeur de Maëlis ; la `fronde` est vendue à l'étal de Mère Pivoine.
- Items **sans usage** mécanique actuel (ni recette, ni effet, ni équipement, ni désir de PNJ) : `mithril_brut`, `gemme_brute`, `pierre`, `lait`, `plume`, `bois_cerf`, `os_ancien`, `corne_demon`, `griffe_dragon`, `coeur_draconique`, les vêtements sans effet, `coffre_bois`, `table_chene`, `contrebande`, `lettre_recommandation`, `licence_commerce` (sert à l'achat de boutique), `cle_crypte`, `carte_tresor`, `lettre_scellee`. Ils ont une valeur marchande ; leurs usages sont des pistes **Futur** (recettes au mithril, gemmes taillées, quêtes d'Esteral).
- `poison` : la description parle d'enduire une lame, l'effet est un buff de FOR +3 pendant 2 h.
- Les **vêtements** n'ont pas de `slot` (le type ne prévoit que `arme`, `armure`, `outil`, `bijou`) : la Robe d'arcaniste (VOL +1 passif) ne peut donc pas être équipée en l'état. **Futur** : emplacement `vetement`.
- Les objets `outil` ont `slot: 'outil'`, mais l'équipement du joueur ne comporte que `arme`, `armure` et `bijou` : les outils agissent depuis l'inventaire.
