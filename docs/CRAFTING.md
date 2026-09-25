# Artisanat

Source : `src/data/recipes.ts` (**71 recettes**, 12 métiers), stations dans `src/data/locations.ts`, règles dans `src/game/actions/crafting`.

## 1. Règles

Pour lancer une recette il faut :

1. connaître le **métier** de la recette au **niveau requis** ;
2. avoir les **entrées** dans l'inventaire (les objets volés sont utilisables) ;
3. avoir **tous les outils** de la recette dans l'inventaire (non consommés) ;
4. se trouver dans un lieu qui possède la **station** requise, le cas échéant ;
5. avoir l'**énergie** requise ; la recette dure `hours` heures.

**Jet** : `p = clamp(40 + stat de la recette × 4 + niveau du métier × 5 + bonus de traits − difficulté, 5, 95)`.
Difficulté par défaut : `20 + niveau × 8` (28 au niveau 1, 44 au niveau 3, 60 au niveau 5, 84 au niveau 8). XP par défaut : `10 + niveau × 6`.

- **Réussite** : entrées consommées, sorties ajoutées, XP de métier (modulée par INT, peuple, traits, origine).
- **Échec** : **la moitié des entrées est perdue**, rien n'est produit.

Exemple : Épée de fer (niveau 2, FOR, difficulté 36) par un forgeron niveau 2 avec FOR 7 : 40 + 28 + 10 − 36 = **42 %** ; au niveau 5 avec FOR 9 : 40 + 36 + 25 − 36 = **65 %**.

## 2. Stations et lieux

| Station | Lieux | Recettes qui l’exigent |
|---|---|---|
| `forge` | Bourg-du-Gué, Port-Salant, Château de Valcourt, Campement de Gor’Nak, Mines de Karak-Dur | 18 |
| `atelier` | Bourg-du-Gué, Port-Salant, Mines de Karak-Dur | 5 |
| `tannerie` | Port-Salant, Les Bas-Quais, Campement de Gor’Nak | 2 |
| `cuisine` | Bourg-du-Gué, Taverne du Sanglier Borgne, Ferme des Tillac, Port-Salant | 6 |
| `laboratoire` | Port-Salant, Temple de l’Aube, Marais des Pendus, Ruines d’Esteral | 5 |
| `autel` | Temple de l’Aube, Forêt de Sylvebrune, Ruines d’Esteral | 7 |
| `scriptorium` | Port-Salant, Temple de l’Aube, Château de Valcourt | 0 |
| `metier_a_tisser` | Port-Salant | 2 |

- La station `scriptorium` existe dans trois lieux mais **aucune recette ne l'exige** actuellement (les recettes d'Écrivain demandent seulement la plume et l'encre).
- **Port-Salant** possède toutes les stations sauf l'autel : c'est la capitale de l'artisanat. Le `metier_a_tisser` n'existe **que** là (étoffe, soie tissée).
- Recettes **sans station** (faisables partout, outils compris) : manches, bâton, armures de cuir et de fourrure, parchemin, corde, vêtements, capes, soies cousues, farine, poisson grillé, viande séchée, rations, extrait d'herbes, antidote, poison, bandages, baume, cristal taillé, amulette de crocs, et toutes les recettes d'Écrivain.

## 3. Chaînes de fabrication complètes

Notation : `2× A + 1× B → C [métier niv., station, outil]`.

### Métal et armes

```
2× Minerai de fer + 1× Charbon ─► Lingot de fer            [Forgeron 1, forge]
2× Minerai de cuivre + 1× Charbon ─► Lingot de cuivre      [Forgeron 1, forge]
2× Minerai d'argent + 1× Charbon ─► Lingot d'argent        [Forgeron 3, forge]
2× Lingot de fer + 2× Charbon ─► Lingot d'acier            [Forgeron 3, forge, marteau]
1× Lingot de fer ─► 8× Clous | Couteau                     [Forgeron 1, forge, marteau]
2× Lingot de fer ─► Lame de fer                            [Forgeron 1, forge, marteau]
   Lame de fer + Manche en bois ─► Épée de fer             [Forgeron 2]
   Lame de fer + 2× Manche en bois ─► Lance de chasse      [Charpentier 2, atelier]
Lingot de fer + Manche ─► Pioche | Hache de bûcheron       [Forgeron 1, forge, marteau]
2× Lingot d'acier ─► Lame d'acier                          [Forgeron 3]
   Lame d'acier + Manche + Cuir ─► Épée d'acier            [Forgeron 4]
   Lame d'acier + Lingot d'argent + Cuir ─► Épée d'argent  [Forgeron 5]
   Épée d'acier + Cristal élémentaire + Essence magique ─► Lame runique   [Arcaniste 6, autel]
2× Lingot d'acier + Manche ─► Hache de guerre              [Forgeron 4]
3× Lingot d'acier + Cuir ─► Cotte de mailles               [Forgeron 5]
Lingot de cuivre ─► Anneau de cuivre                       [Forgeron 2]
Lingot d'argent ─► Bague d'argent ─(+ Cristal élémentaire)─► Anneau enchanté   [Forgeron 4 → Arcaniste 5]
5× Écaille de dragon + 2× Cuir épais + 2× Lingot d'acier ─► Armure en écailles de dragon   [Forgeron 8]
```

Coût brut d'une **Épée de fer** : 4 minerais de fer + 2 charbons (→ 2 lingots → 1 lame) + 1 bois brut (→ 2 planches → 1 planche → 2 manches) ≈ 22 po de matières (valeur de base) pour un objet à 45 po, en 4 recettes et 3 métiers (Mineur, Bûcheron, Charpentier, Forgeron — ou achats).

Coût brut d'une **Épée d'acier** : 8 minerais de fer + 8 charbons + 1 manche + 1 cuir (2 peaux + 1 sel) ≈ 62 po pour 95 po.

### Bois

```
Bois brut ─► 2× Planche                                    [Charpentier 1, atelier]
Planche ─► 2× Manche en bois                               [Charpentier 1]
Bois brut ─► Bâton de marche                               [Charpentier 1]
2× Planche + Corde ─► Arc court                            [Charpentier 2, atelier]
4× Planche + 4× Clous ─► Coffre en bois                    [Charpentier 2, atelier, marteau]
5× Planche + 6× Clous ─► Table de chêne                    [Charpentier 3, atelier, marteau]
Cristal taillé + Bois de lune ─► Focus de cristal          [Arcaniste 3, autel]
```

### Cuir et fourrures

```
2× Peau animale + Sel ─► Cuir tanné                        [Tanneur 1, tannerie]
   3× Cuir ─► Armure de cuir                               [Tanneur 2, aiguille]
   2× Fourrure de loup + 2× Cuir ─► Armure de fourrure     [Tanneur 3, aiguille]
Peau d'ours + Sel + Graisse d'ours ─► Cuir épais           [Tanneur 3, tannerie]
Peau animale ─► 3× Parchemin                               [Tanneur 1]
```

### Tissus

```
3× Lin ─► Étoffe                                           [Tailleur 1, métier à tisser]
2× Lin ─► Corde                                            [Tailleur 1]
2× Étoffe ─► Vêtements simples                             [Tailleur 1, aiguille]
2× Étoffe + Cuir ─► Cape de voyage                         [Tailleur 2, aiguille]
3× Soie d'araignée ─► Soie tissée                          [Tailleur 3, métier à tisser]
   2× Étoffe + Soie tissée ─► Vêtements fins               [Tailleur 4, aiguille]
   3× Soie tissée + Cuir ─► Armure de soie d'araignée      [Tailleur 5, aiguille]
3× Étoffe + Essence magique ─► Robe d'arcaniste            [Tailleur 4, aiguille]
Étoffe ─► 3× Bandage                                       [Guérisseur 1]
```

Une **Armure de soie** (180 po) demande 9 soies d’araignée (au moins 3 araignées géantes, 1 à 3 soies par victoire) + 1 cuir : c'est le produit phare de la chaîne Chasseur/Mercenaire → Tailleur.

### Herbes et potions

```
3× Herbe de soin ─► Extrait d'herbes                       [Herboriste 1, mortier]
   Extrait + Fiole ─► Potion de soin                       [Alchimiste 1, laboratoire]
2× Racine amère + Fiole ─► Antidote                        [Alchimiste 1, mortier]
3× Baies + Miel + Fiole ─► Potion d'énergie                [Alchimiste 2, laboratoire]
Venin d'araignée + Champignon noir + Fiole ─► Poison ⚠     [Alchimiste 2, mortier]
Racine amère + Graisse d'ours + Fiole ─► Potion de force   [Alchimiste 3, laboratoire]
Sang régénérant + Fleur de lune + Fiole ─► Élixir de régénération   [Alchimiste 5, laboratoire]
Essence maudite + Mandragore + Fiole ─► Potion noire ⚠     [Alchimiste 5, laboratoire]
2× Herbe de soin + Graisse d'ours ─► 2× Baume              [Guérisseur 2, mortier]
```

Les **fioles** ne se fabriquent pas : elles s'achètent (Étal de Mère Pivoine, Fioles de Mirelle, Comptoir de Nixi). Marge d'une potion de soin : 3 herbes (9 po) + 1 fiole (2 po) → 22 po.

### Nourriture et boissons

```
3× Blé ─► 2× Farine                                        [Cuisinier 1]
   2× Farine ─► 3× Pain                                    [Cuisinier 1, cuisine]
   Farine + 3× Baies + Œufs ─► Tarte aux baies             [Cuisinier 2, cuisine]
Poisson ─► Poisson grillé                                  [Cuisinier 1]
2× Viande + Sel ─► 3× Viande séchée                        [Cuisinier 1]
   Pain + Viande séchée ─► 2× Ration de voyage             [Cuisinier 2]
Viande + 2× Légumes ─► 2× Ragoût                           [Cuisinier 2, cuisine]
2× Ragoût + Tarte + Vin + Épices ─► Festin                 [Cuisinier 5, cuisine]
2× Houblon + Blé ─► 4× Bière                               [Tavernier 1, cuisine]
2× Miel ─► 2× Hydromel                                     [Tavernier 2, cuisine]
```

Le **Festin** (55 po, énergie +15, PV +20, CHA +2 pendant 12 h) réunit 4 métiers : Fermier, Chasseur, Herboriste (baies), Cuisinier, plus le Marchand (vin, épices).

### Magie

```
Cristal brut ─► Cristal taillé                             [Arcaniste 1]
2× Fleur de lune + Cristal brut ─► Essence magique         [Arcaniste 2, autel]
2× Ectoplasme ─► Essence magique                           [Arcaniste 2, autel]
Cristal taillé + Eau bénite ─► 2× Pierre de lumière        [Arcaniste 2, autel]
Amulette de crocs + Essence magique ─► Talisman de protection   [Arcaniste 3, autel]
3× Croc de loup + Corde ─► Amulette de crocs               [Chasseur 2]
```

### Écrits

```
2× Parchemin ─► Contrat de commerce                        [Écrivain 1, plume et encre]
2× Parchemin ─► Carte du Val                               [Écrivain 2, plume et encre]
1× Parchemin ─► Lettre de recommandation                   [Écrivain 3, plume et encre]
2× Parchemin ─► Faux papiers ⚠                             [Écrivain 4, plume et encre]
```

Le Contrat de commerce (30 po) coûte 6 po de parchemin : Aldric en veut 2 contre 90 po.

## 4. Toutes les recettes

### Forgeron (18 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Fondre du fer (`fondre_fer`) | 1 | 2× Minerai de fer + 1× Charbon | 1× Lingot de fer | — | forge | 1 / 2 | 28 | FOR | 16 |
| Fondre du cuivre (`fondre_cuivre`) | 1 | 2× Minerai de cuivre + 1× Charbon | 1× Lingot de cuivre | — | forge | 1 / 2 | 28 | FOR | 16 |
| Fondre de l’argent (`fondre_argent`) | 3 | 2× Minerai d’argent + 1× Charbon | 1× Lingot d’argent | — | forge | 1 / 2 | 44 | FOR | 28 |
| Forger de l’acier (`acier`) | 3 | 2× Lingot de fer + 2× Charbon | 1× Lingot d’acier | Marteau de forge | forge | 2 / 2 | 44 | FOR | 28 |
| Forger des clous (`clous`) | 1 | 1× Lingot de fer | 8× Clous | Marteau de forge | forge | 1 / 2 | 28 | FOR | 16 |
| Forger une lame de fer (`lame_fer`) | 1 | 2× Lingot de fer | 1× Lame de fer | Marteau de forge | forge | 1 / 2 | 28 | FOR | 16 |
| Monter une épée de fer (`epee_fer`) | 2 | 1× Lame de fer + 1× Manche en bois | 1× Épée de fer | Marteau de forge | forge | 1 / 2 | 36 | FOR | 22 |
| Forger un couteau (`couteau`) | 1 | 1× Lingot de fer | 1× Couteau | Marteau de forge | forge | 1 / 2 | 28 | FOR | 16 |
| Forger une pioche (`pioche`) | 1 | 1× Lingot de fer + 1× Manche en bois | 1× Pioche | Marteau de forge | forge | 1 / 2 | 28 | FOR | 16 |
| Forger une hache de bûcheron (`hache_bucheron`) | 1 | 1× Lingot de fer + 1× Manche en bois | 1× Hache de bûcheron | Marteau de forge | forge | 1 / 2 | 28 | FOR | 16 |
| Forger une lame d’acier (`lame_acier`) | 3 | 2× Lingot d’acier | 1× Lame d’acier | Marteau de forge | forge | 2 / 2 | 44 | FOR | 28 |
| Monter une épée d’acier (`epee_acier`) | 4 | 1× Lame d’acier + 1× Manche en bois + 1× Cuir tanné | 1× Épée d’acier | Marteau de forge | forge | 1 / 2 | 52 | FOR | 34 |
| Forger une hache de guerre (`hache_guerre`) | 4 | 2× Lingot d’acier + 1× Manche en bois | 1× Hache de guerre | Marteau de forge | forge | 2 / 2 | 52 | FOR | 34 |
| Forger une épée d’argent (`epee_argent`) | 5 | 1× Lame d’acier + 1× Lingot d’argent + 1× Cuir tanné | 1× Épée d’argent | Marteau de forge | forge | 3 / 2 | 60 | FOR | 40 |
| Tresser une cotte de mailles (`cotte_mailles`) | 5 | 3× Lingot d’acier + 1× Cuir tanné | 1× Cotte de mailles | Marteau de forge | forge | 4 / 2 | 60 | FOR | 40 |
| Façonner un anneau de cuivre (`anneau_cuivre`) | 2 | 1× Lingot de cuivre | 1× Anneau de cuivre | Marteau de forge | forge | 1 / 2 | 36 | AGI | 22 |
| Façonner une bague d’argent (`bague_argent`) | 4 | 1× Lingot d’argent | 1× Bague d’argent | Marteau de forge | forge | 1 / 2 | 52 | AGI | 34 |
| Forger l’armure en écailles de dragon (`armure_ecailles`) | 8 | 5× Écaille de dragon + 2× Cuir épais + 2× Lingot d’acier | 1× Armure en écailles de dragon | Marteau de forge | forge | 8 / 8 | 84 | FOR | 58 |

### Charpentier (7 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Scier des planches (`planches`) | 1 | 1× Bois brut | 2× Planche | — | atelier | 1 / 2 | 28 | FOR | 16 |
| Tailler des manches (`manches`) | 1 | 1× Planche | 2× Manche en bois | — | — | 1 / 2 | 28 | AGI | 16 |
| Tailler un bâton de marche (`baton`) | 1 | 1× Bois brut | 1× Bâton de marche | — | — | 1 / 2 | 28 | AGI | 16 |
| Fabriquer un arc court (`arc_court`) | 2 | 2× Planche + 1× Corde | 1× Arc court | — | atelier | 1 / 2 | 36 | AGI | 22 |
| Monter une lance de chasse (`lance_chasse`) | 2 | 2× Manche en bois + 1× Lame de fer | 1× Lance de chasse | — | atelier | 1 / 2 | 36 | AGI | 22 |
| Fabriquer un coffre (`coffre_bois`) | 2 | 4× Planche + 4× Clous | 1× Coffre en bois | Marteau de forge | atelier | 2 / 2 | 36 | AGI | 22 |
| Fabriquer une table (`table_chene`) | 3 | 5× Planche + 6× Clous | 1× Table de chêne | Marteau de forge | atelier | 3 / 2 | 44 | AGI | 28 |

### Tanneur (5 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Tanner du cuir (`tanner_cuir`) | 1 | 2× Peau animale + 1× Sel | 1× Cuir tanné | — | tannerie | 2 / 2 | 28 | VIT | 16 |
| Traiter une peau d’ours (`cuir_epais`) | 3 | 1× Peau d’ours + 1× Sel + 1× Graisse d’ours | 1× Cuir épais | — | tannerie | 3 / 2 | 44 | VIT | 28 |
| Coudre une armure de cuir (`armure_cuir`) | 2 | 3× Cuir tanné | 1× Armure de cuir | Aiguille et fil | — | 2 / 2 | 36 | AGI | 22 |
| Coudre une armure de fourrure (`armure_fourrure`) | 3 | 2× Fourrure de loup + 2× Cuir tanné | 1× Armure de fourrure | Aiguille et fil | — | 3 / 2 | 44 | AGI | 28 |
| Préparer du parchemin (`parchemin`) | 1 | 1× Peau animale | 3× Parchemin | — | — | 1 / 2 | 28 | AGI | 16 |

### Tailleur (8 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Tisser de l’étoffe (`etoffe`) | 1 | 3× Lin | 1× Étoffe | — | metier_a_tisser | 1 / 2 | 28 | AGI | 16 |
| Tresser une corde (`corde`) | 1 | 2× Lin | 1× Corde | — | — | 1 / 2 | 28 | AGI | 16 |
| Coudre des vêtements simples (`vetements_simples`) | 1 | 2× Étoffe | 1× Vêtements simples | Aiguille et fil | — | 1 / 2 | 28 | AGI | 16 |
| Coudre une cape de voyage (`cape_voyage`) | 2 | 2× Étoffe + 1× Cuir tanné | 1× Cape de voyage | Aiguille et fil | — | 1 / 2 | 36 | AGI | 22 |
| Tisser la soie d’araignée (`soie_tissee`) | 3 | 3× Soie d’araignée | 1× Soie tissée | — | metier_a_tisser | 2 / 2 | 44 | AGI | 28 |
| Coudre des vêtements fins (`vetements_fins`) | 4 | 2× Étoffe + 1× Soie tissée | 1× Vêtements fins | Aiguille et fil | — | 3 / 2 | 52 | AGI | 34 |
| Coudre une robe d’arcaniste (`robe_mage`) | 4 | 3× Étoffe + 1× Essence magique | 1× Robe d’arcaniste | Aiguille et fil | — | 3 / 2 | 52 | AGI | 34 |
| Coudre une armure de soie (`armure_soie`) | 5 | 3× Soie tissée + 1× Cuir tanné | 1× Armure de soie d’araignée | Aiguille et fil | — | 4 / 2 | 60 | AGI | 40 |

### Cuisinier (8 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Moudre de la farine (`farine`) | 1 | 3× Blé | 2× Farine | — | — | 1 / 2 | 28 | FOR | 16 |
| Cuire du pain (`pain`) | 1 | 2× Farine | 3× Pain | — | cuisine | 1 / 2 | 28 | INT | 16 |
| Griller du poisson (`poisson_grille`) | 1 | 1× Poisson frais | 1× Poisson grillé | — | — | 1 / 1 | 10 | INT | 16 |
| Sécher de la viande (`viande_sechee`) | 1 | 2× Viande crue + 1× Sel | 3× Viande séchée | — | — | 2 / 2 | 28 | INT | 16 |
| Mijoter un ragoût (`ragout`) | 2 | 1× Viande crue + 2× Légumes | 2× Ragoût | — | cuisine | 1 / 2 | 36 | INT | 22 |
| Préparer des rations (`ration`) | 2 | 1× Pain + 1× Viande séchée | 2× Ration de voyage | — | — | 1 / 2 | 36 | INT | 22 |
| Cuire une tarte aux baies (`tarte_baies`) | 2 | 1× Farine + 3× Baies sauvages + 1× Œufs | 1× Tarte aux baies | — | cuisine | 1 / 2 | 36 | INT | 22 |
| Préparer un festin (`festin`) | 5 | 2× Ragoût + 1× Tarte aux baies + 1× Vin + 1× Épices | 1× Festin | — | cuisine | 4 / 5 | 60 | INT | 40 |

### Tavernier (2 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Brasser de la bière (`biere`) | 1 | 2× Houblon + 1× Blé | 4× Bière | — | cuisine | 2 / 2 | 28 | VIT | 16 |
| Fermenter de l’hydromel (`hydromel`) | 2 | 2× Miel | 2× Hydromel | — | cuisine | 2 / 2 | 36 | INT | 22 |

### Herboriste (1 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Préparer un extrait (`extrait_herbe`) | 1 | 3× Herbe de soin | 1× Extrait d’herbes | Mortier et pilon | — | 1 / 2 | 28 | PER | 16 |

### Alchimiste (7 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Distiller une potion de soin (`potion_soin`) | 1 | 1× Extrait d’herbes + 1× Fiole | 1× Potion de soin | — | laboratoire | 1 / 2 | 28 | INT | 16 |
| Préparer un antidote (`antidote`) | 1 | 2× Racine amère + 1× Fiole | 1× Antidote | Mortier et pilon | — | 1 / 2 | 28 | INT | 16 |
| Préparer une potion d’énergie (`potion_energie`) | 2 | 3× Baies sauvages + 1× Miel + 1× Fiole | 1× Potion d’énergie | — | laboratoire | 1 / 2 | 36 | INT | 22 |
| Concocter un poison (`poison`) | 2 | 1× Venin d’araignée + 1× Champignon noir + 1× Fiole | 1× Poison | Mortier et pilon | — | 1 / 2 | 36 | INT | 22 |
| Préparer une potion de force (`potion_force`) | 3 | 1× Racine amère + 1× Graisse d’ours + 1× Fiole | 1× Potion de force | — | laboratoire | 1 / 2 | 44 | INT | 28 |
| Distiller un élixir de régénération (`elixir_regeneration`) | 5 | 1× Sang régénérant + 1× Fleur de lune + 1× Fiole | 1× Élixir de régénération | — | laboratoire | 3 / 2 | 60 | VOL | 40 |
| Distiller la potion noire (`potion_noire`) | 5 | 1× Essence maudite + 1× Mandragore + 1× Fiole | 1× Potion noire | — | laboratoire | 3 / 2 | 60 | VOL | 40 |

### Guérisseur (2 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Préparer des bandages (`bandage`) | 1 | 1× Étoffe | 3× Bandage | — | — | 1 / 2 | 10 | AGI | 16 |
| Préparer un baume (`baume`) | 2 | 2× Herbe de soin + 1× Graisse d’ours | 2× Baume du guérisseur | Mortier et pilon | — | 1 / 2 | 36 | VOL | 22 |

### Arcaniste (8 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Tailler un cristal (`cristal_taille`) | 1 | 1× Cristal brut | 1× Cristal taillé | — | — | 2 / 2 | 28 | AGI | 16 |
| Condenser une essence magique (`essence_magique`) | 2 | 2× Fleur de lune + 1× Cristal brut | 1× Essence magique | — | autel | 2 / 2 | 36 | VOL | 22 |
| Purifier de l’ectoplasme (`essence_ecto`) | 2 | 2× Ectoplasme | 1× Essence magique | — | autel | 1 / 2 | 36 | VOL | 22 |
| Enchanter une pierre de lumière (`pierre_lumiere`) | 2 | 1× Cristal taillé + 1× Eau bénite | 2× Pierre de lumière | — | autel | 1 / 2 | 36 | VOL | 22 |
| Assembler un focus de cristal (`focus_cristal`) | 3 | 1× Cristal taillé + 1× Bois de lune | 1× Focus de cristal | — | autel | 3 / 2 | 44 | VOL | 28 |
| Enchanter un talisman (`talisman`) | 3 | 1× Amulette de crocs + 1× Essence magique | 1× Talisman de protection | — | autel | 2 / 2 | 44 | VOL | 28 |
| Enchanter un anneau (`anneau_enchante`) | 5 | 1× Bague d’argent + 1× Cristal élémentaire | 1× Anneau enchanté | — | autel | 4 / 2 | 60 | VOL | 40 |
| Forger une lame runique (`lame_runique`) | 6 | 1× Épée d’acier + 1× Cristal élémentaire + 1× Essence magique | 1× Lame runique | — | autel | 6 / 6 | 68 | VOL | 46 |

### Chasseur (1 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Monter une amulette de crocs (`amulette_croc`) | 2 | 3× Croc de loup + 1× Corde | 1× Amulette de crocs | — | — | 1 / 2 | 36 | AGI | 22 |

### Écrivain (4 recettes)

| Recette (id) | Niv. | Entrées | Sorties | Outils | Station | h / Én. | Diff. | Stat | XP |
|---|---|---|---|---|---|---|---|---|---|
| Rédiger un contrat de commerce (`contrat_commerce`) | 1 | 2× Parchemin | 1× Contrat de commerce | Plume et encre | — | 1 / 2 | 28 | INT | 16 |
| Dessiner une carte du Val (`carte_val`) | 2 | 2× Parchemin | 1× Carte du Val de Brume | Plume et encre | — | 3 / 2 | 36 | PER | 22 |
| Rédiger une lettre de recommandation (`lettre_recommandation`) | 3 | 1× Parchemin | 1× Lettre de recommandation | Plume et encre | — | 2 / 2 | 44 | CHA | 28 |
| Falsifier des papiers (`faux_papiers`) | 4 | 2× Parchemin | 1× Faux papiers | Plume et encre | — | 3 / 2 | 52 | AGI | 34 |
