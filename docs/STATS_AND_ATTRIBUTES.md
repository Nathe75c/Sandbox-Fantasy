# Statistiques, traits et origines

Source : `src/data/stats.ts`, `src/data/traits.ts`, `src/data/races.ts`. Formules : `src/game/state` (sélecteurs) et `src/game/systems/checks`.

## 1. Les 9 statistiques

| Stat | Abr. | Description | Influence |
|---|---|---|---|
| **Force** (`force`) | FOR | Puissance physique brute. | Dégâts en mêlée ; Capacité de charge ; Rendement minage et bûcheronnage ; Intimidation (menacer) |
| **Agilité** (`agilite`) | AGI | Vivacité, précision et réflexes. | Toucher et esquiver en combat ; Fuir un combat ; Vol à la tire ; Artisanat de précision (tailleur, bijoux) |
| **Vitalité** (`vitalite`) | VIT | Endurance et santé. | Points de vie ; Énergie maximale ; Résistance aux poisons et maladies ; Récolte longue (fermier, pêcheur) |
| **Intelligence** (`intelligence`) | INT | Savoir, logique et mémoire. | Réussite en artisanat complexe ; Vitesse d’apprentissage des métiers ; Alchimie, écriture, arcanes ; Évaluer la valeur des objets |
| **Perception** (`perception`) | PER | Sens aiguisés et intuition, y compris lire les intentions d’autrui. | Trouver des ressources rares ; Détecter les embuscades ; Chasse ; Deviner le mensonge et repérer les rumeurs |
| **Charisme** (`charisme`) | CHA | Présence, éloquence et art de convaincre. | Prix d’achat et de vente ; Flatter et persuader ; Gains de réputation ; Revenus de tavernier et marchand |
| **Volonté** (`volonte`) | VOL | Force mentale et spirituelle. | Magie et enchantement ; Résister à la peur (morts-vivants, démons) ; Guérison ; Tenir tête lors d’une menace |
| **Discrétion** (`discretion`) | DIS | Art de passer inaperçu. | Voler sans être vu ; Éviter les créatures ; Réduire les embuscades en voyage ; Accès au marché noir |
| **Chance** (`chance`) | CHN | La faveur du destin. | Coups critiques ; Butin rare ; Lieu de départ favorable ; Événements heureux |

### Pourquoi ces 9 (et pas plus)

Chaque stat a un **rôle unique et mesurable** dans au moins deux systèmes :

| Stat | Usages mécaniques dans le moteur |
|---|---|
| Force | Dégâts (`2 + FOR/2`), charge max (`40 + FOR × 4`), menacer, travail de garde/mineur/mercenaire, recettes de forge. |
| Agilité | Toucher et riposte en combat, fuite, vol (`+ AGI`), recettes de précision (tailleur, bijoux, arcs). |
| Vitalité | PV max (`30 + VIT × 5`), énergie max, réduction des dégâts subis (`VIT / 4`), travail de fermier, tannage. |
| Intelligence | Recette par défaut des artisanats complexes, **vitesse d'XP des métiers** (+3 %/point au-dessus de 5), travail d'écrivain. |
| Perception | Réduit les embuscades (`− PER`), défense contre la menace (le PNJ l'utilise), récolte (herboriste, pêcheur), chasse. |
| Charisme | Remise en boutique (±2 %/point autour de 5), flatter, travail de tavernier/marchand. |
| Volonté | Énergie max (`10 + VIT + VOL`), menacer, magie et enchantement (recettes d'autel), guérisseur. |
| Discrétion | Vol (`DIS × 4`), éviter une créature, réduit les embuscades (`− DIS × 1,5`), fuite (`+ DIS × 2`). |
| Chance | Critiques (`d100 ≤ CHANCE/2`), butin, **lieu de départ** « lucky ». |

### Fusions décidées

- **Persuasion → Charisme.** Deux stats sociales se marchaient dessus (prix, dialogues). Une seule stat claire : « ma présence et mon éloquence ».
- **Sagesse → répartie** entre **Perception** (intuition, lire les gens et le terrain : détecter le mensonge, les embuscades, repérer les rumeurs) et **Volonté** (force spirituelle : magie, résistance à la peur, guérison). La sagesse n'avait pas d'usage propre qui ne soit couvert par l'une des deux.
- Pas d'« Endurance » séparée : la **Vitalité** porte PV et énergie.

## 2. Valeurs, bornes et dérivées

| Règle | Valeur |
|---|---|
| Valeur de base | 5 (`BASE_STAT_VALUE`) |
| Points libres à la création | 5 (`CREATION_BONUS_POINTS`) |
| Bornes | 1..20 (`STAT_MIN`, `STAT_MAX`) ; jusqu'à 25 avec les bonus d'équipement et buffs |
| Stat effective | base + bonus passifs d'équipement (effets `buff` à `hours: 0`) + buffs temporaires actifs |
| **PV max** | 30 + VIT × 5 |
| **Énergie max** | 10 + VIT + VOL |
| **Charge max** | 40 + FOR × 4 (surcharge : trajets ×1,5) |

Personnage « tout à 5 » : 55 PV, 20 énergie, 60 de charge.

Base à la création = 5 + modificateurs du **peuple** + de l'**origine** + des **2 traits** + **5 points libres**.

## 3. Jets

- `p = clamp(40 + stat × 4 + bonus − difficulté, 5, 95)` ; réussite si `d100 ≤ p`.
- Critique si `d100 ≤ CHANCE / 2`.

| Stat | Difficulté 10 | 28 (recette niv. 1) | 44 (niv. 3) | 60 (niv. 5) |
|---|---|---|---|---|
| 3 | 42 % | 24 % | 8 % | 5 % |
| 5 | 50 % | 32 % | 16 % | 5 % |
| 8 | 62 % | 44 % | 28 % | 12 % |
| 12 | 78 % | 60 % | 44 % | 28 % |

(sans bonus ; en artisanat on ajoute le niveau du métier × 5.)

## 4. Traits (2 au choix)

| Trait (id) | Modificateurs | Bonus métier | Tags | Exclut |
|---|---|---|---|---|
| **Robuste** (`robuste`) | VIT +2, FOR +1, DIS -1 | Mineur +15 %, Bûcheron +15 % | `robuste` | fragile |
| **Charismatique** (`charismatique`) | CHA +3 | Marchand +15 %, Tavernier +15 % | `charismatique` | — |
| **Chanceux** (`chanceux`) | CHN +4 | — | `chanceux` | — |
| **Discret** (`discret`) | DIS +3, AGI +1, CHA -1 | Voleur +20 % | `discret` | — |
| **Perspicace** (`perspicace`) | PER +2, VOL +1 | Chasseur +15 %, Herboriste +15 % | `perspicace` `sage` | — |
| **Mains habiles** (`mains_habiles`) | AGI +1, INT +1 | Forgeron +20 %, Charpentier +20 %, Tanneur +20 %, Tailleur +20 %, Cuisinier +20 % | `artisan` | — |
| **Tête brûlée** (`tete_brulee`) | FOR +2, AGI +1, CHA -1, VOL -1 | Mercenaire +20 % | `violent` | — |
| **Touché par l’arcane** (`mystique`) | VOL +2, INT +1, FOR -1 | Arcaniste +25 %, Alchimiste +10 % | `mystique` | — |
| **Fragile mais vif d’esprit** (`fragile`) | VIT -2, INT +2, PER +1 | Écrivain +20 %, Alchimiste +15 % | `erudit` | robuste |

Chaque trait a une contrepartie ou un coût d'opportunité. Leurs **tags** débloquent des réactions de PNJ : `charismatique` (Odile +10), `discret` (Sifflet +10), `violent` (Odile, Maëlis, Ilyndra −10 ; Nixi −5 ; Varek +5), `mystique` (Ilyndra +15, Comtesse +15, Mirelle/Maëlis/Osric +10), `erudit` (Mirelle +20, Comtesse +15, Maëlis +10), `artisan` (Thrain +20, Barda/Tobbin +15). Les tags `robuste`, `chanceux`, `perspicace` et `sage` ne sont lus par aucun PNJ pour l'instant.

## 5. Origines (1 au choix)

| Origine (id) | Modificateurs | Or | Objets de départ | Métiers | Réputation | Tags |
|---|---|---|---|---|---|---|
| **Héritier noble** (`noble`) | CHA +2, INT +1, VIT -1 | 150 | 1× Vêtements fins + 1× Chevalière familiale + 1× Dague ornée | — | couronne +15, guilde_marchande +5, main_grise -10 | `noble` `riche` |
| **Enfant de fermier** (`fermier`) | VIT +2, FOR +1 | 15 | 1× Faucille + 3× Pain + 1× Vêtements simples | Fermier | couronne +5 | `paysan` `pauvre` |
| **Ancien soldat** (`soldat`) | FOR +2, VIT +1, CHA -1 | 40 | 1× Épée de fer + 1× Armure de cuir + 2× Ration de voyage | Garde | couronne +10, crocs_rouges -15 | `soldat` |
| **Marchand né** (`marchand_ne`) | CHA +2, PER +1 | 80 | 1× Balance de marchand + 5× Sel + 2× Étoffe | Marchand | guilde_marchande +15 | `marchand` |
| **Gamin des rues** (`gamin_des_rues`) | DIS +2, AGI +2, CHA -1 | 5 | 1× Crochets de serrurier + 1× Couteau | Voleur | main_grise +15, couronne -5 | `voleur` `pauvre` |
| **Apprenti artisan** (`apprenti_artisan`) | AGI +1, INT +1, FOR +1 | 30 | 1× Marteau de forge + 2× Lingot de fer + 2× Planche | Forgeron | clan_karak +10 | `artisan` |
| **Érudit** (`erudit`) | INT +3, FOR -1 | 45 | 1× Plume et encre + 3× Parchemin + 1× Traité des herbes | Écrivain | temple_aube +10 | `erudit` |
| **Mystique errant** (`mystique`) | VOL +2, PER +1 | 20 | 1× Bâton de marche + 1× Cristal brut + 3× Herbe de soin | Herboriste | temple_aube +5, cercle_sylvain +5 | `mystique` |
| **Banni** (`banni`) | VOL +2, VIT +1, CHA -2 | 10 | 1× Hachette + 2× Viande séchée | Chasseur | couronne -15, clan_gornak +10 | `banni` |
| **Vagabond aventurier** (`vagabond`) | PER +1, AGI +1, CHN +1 | 25 | 1× Bâton de marche + 2× Ration de voyage + 1× Carte du Val de Brume | — | — | `aventurier` |
| **Artiste itinérant** (`artiste`) | CHA +3, PER +1, FOR -1 | 20 | 1× Luth + 2× Bière | Tavernier | — | `artiste` |

### Lieu de départ

Tiré au sort parmi les lieux de l'origine selon leur poids. Les lieux marqués ★ (« lucky ») voient leur poids multiplié par **(1 + (CHANCE − 5) × 0,15)** : avec CHANCE 10 (trait Chanceux + humain), ×1,75.

| Origine | Lieux de départ (poids ; ★ = « lucky ») | Bonus métier |
|---|---|---|
| Héritier noble | Château de Valcourt (5 ★), Port-Salant (3), Route du Sel (1) | — |
| Enfant de fermier | Ferme des Tillac (5), Bourg-du-Gué (3 ★) | — |
| Ancien soldat | Taverne du Sanglier Borgne (3), Route du Sel (3), Château de Valcourt (2 ★) | — |
| Marchand né | Port-Salant (4 ★), Route du Sel (4), Bourg-du-Gué (2) | Marchand +20 % |
| Gamin des rues | Les Bas-Quais (6), Taverne du Sanglier Borgne (2 ★) | — |
| Apprenti artisan | Mines de Karak-Dur (3), Bourg-du-Gué (3), Port-Salant (2 ★) | — |
| Érudit | Temple de l’Aube (4), Port-Salant (3 ★), Ruines d’Esteral (1) | — |
| Mystique errant | Temple de l’Aube (3), Ruines d’Esteral (2 ★), Marais des Pendus (3) | — |
| Banni | Marais des Pendus (3), Campement de Gor’Nak (3 ★), Col des Crocs (2) | — |
| Vagabond aventurier | Route du Sel (3), Forêt de Sylvebrune (3), Taverne du Sanglier Borgne (2 ★), Col des Crocs (1) | — |
| Artiste itinérant | Taverne du Sanglier Borgne (5), Port-Salant (2 ★), Les Bas-Quais (2) | — |

## 6. Modificateurs des peuples jouables

| Peuple | Modificateurs | Particularité mécanique |
|---|---|---|
| Humain | CHA +1, CHN +1 | +10 % d'XP de métier |
| Elfe | AGI +1, PER +2, VIT −1 | — |
| Nain | VIT +2, FOR +1, AGI −1 | — |
| Halfelin | CHN +2, DIS +1, FOR −1 | — |
| Orc | FOR +3, VIT +1, INT −1, CHA −1 | — |
| Gobelin | AGI +2, DIS +1, INT +1, FOR −2, VIT −1 | — |
| Homme-bête | PER +2, AGI +1, CHA −1 | — |

Le peuple ajoute le tag `race:<id>`, lu par les PNJ (ex. Thrain `race:nain` +25, `race:elfe` −15 ; Nixi `race:gobelin` +25). Le détail des peuples est dans [RACES_AND_CREATURES.md](RACES_AND_CREATURES.md).

## 7. Création : exemples

| Build | Choix | Résultat notable |
|---|---|---|
| Forgeronne naine | Nain, Apprenti artisan, Robuste + Mains habiles, +3 FOR +2 INT | FOR 5+1+1+1+3 = 11, VIT 9, charge 84, forgeron +20 % XP. |
| Voleur halfelin | Halfelin, Gamin des rues, Discret + Chanceux | DIS 11, AGI 8, CHN 11 avant points libres : vol et critiques fréquents, départ probable aux Bas-Quais. |
| Mage elfe | Elfe, Mystique errant, Touché par l'arcane + Perspicace | VOL 10, PER 10 avant points libres ; herboriste de départ ; grimoire ou Comtesse pour l'arcane. |
