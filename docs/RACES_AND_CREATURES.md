# Peuples et créatures

Sources : `src/data/races.ts` (11 peuples), `src/data/creatures.ts` (18 créatures), `src/data/factions.ts`.

## 1. Philosophie : aucune race n'est mauvaise par nature

- Les **relations entre peuples** sont des **tendances culturelles par défaut** (−100..100). Elles comptent pour un quart dans l'opinion initiale d'un PNJ ; la faction, les tags, la personnalité et surtout **les actes du joueur** priment.
- Chaque peuple a **des visages opposés** dans le contenu :
  - **Orcs** : le clan Gor'Nak (honneur, hospitalité, Varek veut la paix par traité) **et** les Crocs Rouges (pillards renégats, `orc_pillard`).
  - **Gobelins** : la Confrérie des Marais (Nixi, marchande fiable) **et** les gobelins sauvages des bandes errantes (`gobelin_sauvage`, que la Confrérie déteste : relation −20).
  - **Vampires** : la Comtesse Isaure (érudite, ne boit que du sang offert… dit-elle) **et** les striges, vampires déchus que la Cour Nocturne chasse elle-même (tuer une strige : Cour Nocturne +3).
  - **Morts-vivants** : Osric le revenant, lucide et bienveillant, **et** squelettes/zombies sans esprit.
  - **Humains** : la Couronne et la Guilde, mais aussi les bandits (`bandit`, humains des Crocs Rouges) et le Bailli corrompu.
- Les factions **mélangent les peuples** (la Main Grise compte humains, halfelins, gobelins et elfes).
- Tuer n'est jamais neutre : `reputationOnKill` rend le meurtre d'un cerf désagréable au Cercle sylvain, celui d'un feu follet au Cercle et à la Confrérie.

## 2. Peuples

| Peuple (id) | Type | Jouable | Comportement | Modificateurs | Forces | Faiblesses | Habitats | Factions |
|---|---|---|---|---|---|---|---|---|
| **Humain** (`humain`) | peuple_civilise | oui | neutre | CHA +1, CHN +1 | Polyvalents ; Apprentissage rapide des métiers (+10 % XP) | Aucune affinité particulière | Bourg-du-Gué, Port-Salant, Château de Valcourt, Ferme des Tillac, Les Bas-Quais | couronne, guilde_marchande, main_grise, temple_aube, crocs_rouges |
| **Elfe** (`elfe`) | peuple_civilise | oui | mefiant | AGI +1, PER +2, VIT -1 | Vision nocturne ; Herboristerie et archerie | Corps frêle ; Méfiance des nains | Forêt de Sylvebrune | cercle_sylvain, main_grise |
| **Nain** (`nain`) | peuple_civilise | oui | marchand | VIT +2, FOR +1, AGI -1 | Résistance au poison ; Maîtrise du métal | Lents ; Rancuniers | Mines de Karak-Dur | clan_karak, guilde_marchande |
| **Halfelin** (`halfelin`) | peuple_civilise | oui | pacifique | CHN +2, DIS +1, FOR -1 | Chanceux ; Discrets | Faibles au corps à corps | Bourg-du-Gué, Ferme des Tillac | couronne, main_grise, guilde_marchande |
| **Orc** (`orc`) | peuple_tribal | oui | territorial | FOR +3, VIT +1, INT -1, CHA -1 | Force brute ; Intimidation | Préjugés des humains et des nains | Campement de Gor’Nak, Col des Crocs | clan_gornak, crocs_rouges |
| **Gobelin** (`gobelin`) | peuple_tribal | oui | marchand | AGI +2, DIS +1, INT +1, FOR -2, VIT -1 | Agiles ; Alchimie de fortune ; Marchandage | Fragiles ; Réputation douteuse | Marais des Pendus, Les Bas-Quais | confrerie_marais, main_grise, crocs_rouges |
| **Homme-bête** (`homme_bete`) | hybride | oui | mefiant | PER +2, AGI +1, CHA -1 | Flair ; Pistage ; Instinct de chasse | Mal acceptés en ville (prix plus élevés) | Forêt de Sylvebrune, Campement de Gor’Nak | cercle_sylvain, clan_gornak |
| **Vampire** (`vampire`) | mort_vivant | non | manipulateur | CHA +3, FOR +2, VOL +2, VIT -2 | Régénération ; Charme ; Savoir ancien | Soleil ; Argent ; Sacré | Ruines d’Esteral | cour_nocturne |
| **Revenant** (`revenant`) | mort_vivant | non | intelligent | VOL +3, VIT +2, CHA -2 | Insensibles au poison ; Mémoire des temps anciens | Sacré ; Feu | Ruines d’Esteral | cour_nocturne |
| **Mage ancien** (`ancien`) | creature_magique | non | intelligent | INT +5, VOL +4, VIT -2 | Magie puissante | Arrogance ; Liés à un lieu | Ruines d’Esteral | cour_nocturne |
| **Esprit** (`esprit`) | esprit | non | neutre | VOL +4, PER +3 | Intangibles ; Visions | Liés à un lieu ; Magie | Forêt de Sylvebrune, Marais des Pendus | cercle_sylvain |

Les 7 peuples jouables ajoutent le tag `race:<id>` au joueur. Vampire, Revenant, Mage ancien et Esprit sont des peuples de PNJ et de créatures (Comtesse Isaure, Osric).

### Relations par défaut et objets

| Peuple | Relations par défaut | Utilise | Vend | Fabrique |
|---|---|---|---|---|
| Humain | elfe 0, nain +10, halfelin +20, orc -20, gobelin -10, vampire -40 | Épée de fer, Pain, Bière | Blé, Pain, Étoffe | Pain, Épée de fer |
| Elfe | humain 0, nain -20, orc -10, vampire -40, esprit +30 | Arc court, Herbe de soin | Herbe de soin, Fleur de lune, Arc court | Arc court, Potion de soin |
| Nain | humain +10, elfe -20, orc -30, gobelin -20 | Pioche, Marteau de forge | Lingot de fer, Minerai de fer, Hache de guerre | Lingot de fer, Épée d’acier, Cotte de mailles |
| Halfelin | humain +20, nain +10, orc -20 | Fronde, Pain | Tarte aux baies, Bière, Fromage | Ragoût, Tarte aux baies |
| Orc | humain -20, nain -30, gobelin +20, elfe -10 | Hache de guerre, Viande crue | Cuir tanné, Fourrure de loup, Hache de guerre | Armure de cuir, Viande séchée |
| Gobelin | humain -10, nain -20, orc +20, halfelin 0 | Couteau, Fiole | Champignon noir, Venin d’araignée, Poison | Poison, Potion de soin |
| Homme-bête | humain -10, elfe +20, orc +10 | Arc court, Viande crue | Fourrure de loup, Croc de loup | Amulette de crocs |
| Vampire | humain -20, elfe -40, revenant +40, ancien +30 | Bijou ancien, Grimoire de l’ombre | Grimoire de l’ombre, Bijou ancien, Sang vampirique | Potion noire |
| Revenant | vampire +40, humain -10 | Os ancien | Os ancien, Carte au trésor | — |
| Mage ancien | vampire +30, esprit +20 | Focus de cristal | Grimoire élémentaire, Cristal taillé | Focus de cristal, Anneau enchanté |
| Esprit | elfe +30, homme_bete +20 | — | — | Essence magique |

## 3. Créatures

### Comportements

| Comportement | Effet en jeu |
|---|---|
| `agressif`, `predateur` | Peut **attaquer en premier** : embuscades en voyage. |
| `territorial` | Attaque si l'on reste ou récolte sur son territoire. |
| `fuyant`, `pacifique` | Ne combat que si on l'attaque. |
| `intelligent`, `manipulateur` | Parlementer possible (**Futur** : négociation). |
| `neutre` | Indifférent (feu follet). |

Types : `bete_sauvage` (XP de **Chasseur** à la victoire), `monstre` (XP de **Mercenaire**), `mort_vivant`, `creature_magique`, `humanoide`, `demon`, `boss`.

Tags de dégâts (faiblesses ×1,5, résistances ×0,5) : `tranchant`, `contondant`, `percant`, `feu`, `sacre`, `argent`, `poison`, `magie`. Ils sont comparés aux `tags` de l'arme équipée (ex. Épée d'argent : `tranchant` + `argent` → faiblesse des goules, striges et diablotins ; contre le spectre et le Wyrm, `argent` est une faiblesse mais `tranchant` une résistance).

### Statistiques

| Créature (id) | Type | Comportement | Danger | PV / Att / Déf / Agi | Faiblesses | Résistances | XP | Or |
|---|---|---|---|---|---|---|---|---|
| **Cerf** (`cerf`) | bete_sauvage | fuyant | 1 | 14 / 3 / 1 / 8 | percant | — | 8 | — |
| **Loup gris** (`loup`) | bete_sauvage | predateur | 2 | 22 / 6 / 2 / 7 | feu | — | 14 | — |
| **Ours brun** (`ours`) | bete_sauvage | territorial | 4 | 48 / 10 / 4 / 3 | percant | contondant | 30 | — |
| **Araignée géante** (`araignee_geante`) | monstre | predateur | 3 | 30 / 8 / 3 / 6 | feu, contondant | poison | 22 | — |
| **Gobelin sauvage** (`gobelin_sauvage`) | humanoide | agressif | 2 | 18 / 5 / 2 / 8 | tranchant | — | 12 | 2–8 |
| **Bandit de grand chemin** (`bandit`) | humanoide | agressif | 3 | 26 / 7 / 3 / 5 | — | — | 18 | 5–20 |
| **Orc pillard** (`orc_pillard`) | humanoide | agressif | 4 | 40 / 10 / 4 / 4 | — | — | 30 | 8–25 |
| **Troll des cavernes** (`troll`) | monstre | territorial | 6 | 80 / 14 / 6 / 2 | feu | contondant | 60 | — |
| **Ogre** (`ogre`) | monstre | territorial | 5 | 65 / 13 / 4 / 2 | percant | — | 45 | 10–40 |
| **Squelette** (`squelette`) | mort_vivant | agressif | 2 | 20 / 6 / 3 / 4 | contondant, sacre | percant, poison | 14 | — |
| **Zombie** (`zombie`) | mort_vivant | agressif | 2 | 26 / 5 / 1 / 1 | feu, sacre, tranchant | poison | 12 | — |
| **Goule** (`goule`) | mort_vivant | predateur | 4 | 36 / 10 / 3 / 7 | feu, sacre, argent | poison | 30 | — |
| **Spectre** (`spectre`) | mort_vivant | territorial | 5 | 34 / 12 / 6 / 6 | sacre, argent, magie | tranchant, percant, contondant, poison | 40 | — |
| **Strige** (`strige`) | mort_vivant | predateur | 6 | 50 / 13 / 5 / 8 | argent, sacre, feu | poison | 60 | — |
| **Diablotin** (`diablotin`) | demon | manipulateur | 4 | 28 / 9 / 4 / 9 | sacre, argent | feu | 35 | 5–30 |
| **Élémentaire de pierre** (`elementaire_pierre`) | creature_magique | territorial | 5 | 60 / 11 / 8 / 2 | contondant, magie | tranchant, percant, poison, feu | 50 | — |
| **Feu follet** (`feu_follet`) | creature_magique | neutre | 1 | 10 / 4 / 6 / 10 | magie | tranchant, percant, contondant | 10 | — |
| **Vharox, Wyrm des Cols** (`wyrm_des_cols`) ★ | boss | intelligent | 10 | 320 / 28 / 12 / 6 | argent, magie | feu, tranchant, percant, poison | 500 | 300–800 |

★ = légendaire : n'apparaît **que** via l'événement *Le Wyrm s'agite*.

### Butins, habitats et conséquences

| Créature | Butin (chance, quantité) | Habitats | Interactions | Réputation au meurtre |
|---|---|---|---|---|
| Cerf | Viande crue (100 %, 2–3) ; Peau animale (90 %, 1–2) ; Bois de cerf (50 %, 1) | Forêt de Sylvebrune, Ferme des Tillac | combattre, observer | cercle_sylvain -1 |
| Loup gris | Viande crue (90 %, 1–2) ; Fourrure de loup (80 %, 1) ; Croc de loup (60 %, 1–2) | Forêt de Sylvebrune, Ferme des Tillac, Col des Crocs, Route du Sel | combattre, fuir, eviter, nourrir | couronne +1 |
| Ours brun | Viande crue (100 %, 3–5) ; Peau d’ours (90 %, 1) ; Graisse d’ours (90 %, 1–2) | Forêt de Sylvebrune, Col des Crocs | combattre, fuir, eviter, observer | — |
| Araignée géante | Soie d’araignée (90 %, 1–3) ; Venin d’araignée (70 %, 1) | Forêt de Sylvebrune, Marais des Pendus | combattre, fuir, eviter | cercle_sylvain +1 |
| Gobelin sauvage | Couteau (30 %, 1) ; Champignon noir (50 %, 1–2) ; Bouillie rance (40 %, 1) | Marais des Pendus, Route du Sel | combattre, fuir, eviter, parlementer | — |
| Bandit de grand chemin | Épée rouillée (40 %, 1) ; Ration de voyage (50 %, 1) ; Caisse de contrebande (10 %, 1) | Route du Sel, Les Bas-Quais | combattre, fuir, eviter, parlementer | couronne +2, guilde_marchande +2, crocs_rouges -3 |
| Orc pillard | Hache de guerre (15 %, 1) ; Viande séchée (60 %, 1–2) ; Cuir tanné (40 %, 1) | Col des Crocs, Route du Sel | combattre, fuir, eviter, parlementer | couronne +2, clan_gornak +3, crocs_rouges -4 |
| Troll des cavernes | Os de troll (90 %, 1–2) ; Sang régénérant (60 %, 1) | Mines de Karak-Dur, Col des Crocs | combattre, fuir, eviter | clan_karak +5 |
| Ogre | Dent d’ogre (90 %, 1–2) ; Viande crue (50 %, 2–4) | Col des Crocs | combattre, fuir, eviter, nourrir | — |
| Squelette | Os ancien (90 %, 1–2) ; Épée rouillée (30 %, 1) ; Statuette d’Esteral (5 %, 1) | Ruines d’Esteral | combattre, fuir, eviter | temple_aube +1 |
| Zombie | Os ancien (50 %, 1) | Marais des Pendus, Ruines d’Esteral | combattre, fuir, eviter | temple_aube +1 |
| Goule | Essence maudite (60 %, 1) ; Os ancien (60 %, 1–2) | Marais des Pendus, Ruines d’Esteral | combattre, fuir, eviter | temple_aube +2 |
| Spectre | Ectoplasme (90 %, 1–2) ; Essence maudite (30 %, 1) ; Bijou ancien (10 %, 1) | Ruines d’Esteral | combattre, fuir, eviter, parlementer | temple_aube +2 |
| Strige | Sang vampirique (60 %, 1) ; Bijou ancien (30 %, 1) ; Grimoire de l’ombre (5 %, 1) | Ruines d’Esteral, Marais des Pendus | combattre, fuir, eviter | temple_aube +3, cour_nocturne +3 |
| Diablotin | Corne de démon (70 %, 1) ; Essence magique (30 %, 1) | Ruines d’Esteral, Marais des Pendus | combattre, fuir, eviter, parlementer | temple_aube +2 |
| Élémentaire de pierre | Cristal élémentaire (70 %, 1) ; Cristal brut (80 %, 1–3) ; Gemme brute (20 %, 1) | Mines de Karak-Dur, Col des Crocs | combattre, fuir, eviter, observer | — |
| Feu follet | Ectoplasme (80 %, 1) | Marais des Pendus | combattre, observer | cercle_sylvain -2, confrerie_marais -2 |
| Vharox, Wyrm des Cols | Écaille de dragon (100 %, 3–6) ; Griffe de dragon (100 %, 1–2) ; Cœur draconique (100 %, 1) | Col des Crocs | combattre, fuir, parlementer, observer | couronne +30, clan_karak +20, clan_gornak +20 |

### Rôle économique

| Créature | Chaîne alimentée |
|---|---|
| Cerf, Loup, Ours | Viande (Cuisinier), peaux/fourrures (Tanneur), graisse (Alchimiste, Guérisseur), crocs (amulettes). |
| Araignée géante | **Seule source** de soie (Tailleur : soie tissée, armure de soie) et de venin (poison). |
| Troll | Sang régénérant (élixir), os de troll (désiré par Thrain, 80 po). |
| Ogre | Dents d'ogre (Hector 40 po, Varek 2 → 60 po). |
| Goule, Spectre | Essence maudite (potion noire), ectoplasme (essence magique). |
| Strige | Sang vampirique (Comtesse 120 po), bijoux anciens, grimoire de l'ombre. |
| Élémentaire de pierre | **Seule source** de cristaux élémentaires (anneau enchanté, lame runique). |
| Squelette | Os anciens, rarement une statuette d'Esteral (Comtesse 160 po). |
| Wyrm des Cols | Écailles (armure légendaire), griffes, cœur draconique, 300–800 po. |

### Rencontres

- **Apparition quotidienne** : `p = 0,15 + danger du lieu / 200` par lieu, créature tirée selon les poids de `creatureSpawns`, dans la limite `max`.
- **Engager** (`engage`), **attaquer** (normal ou puissant), **fuir** (`combat_flee`), **éviter** (`sneak_past` : jet de Discrétion contre `danger × 8`).
- Formules complètes : [SYSTEMS.md](SYSTEMS.md) (§ 3.13).

## 4. Points d'attention

- Strige et Diablotin listent le Marais des Pendus dans leurs habitats, mais le marais ne les fait pas apparaître (`creatureSpawns`) ; le Loup apparaît au Campement de Gor'Nak sans l'avoir dans ses habitats.
- Relations raciales asymétriques : humain→vampire −40 mais vampire→humain −20 ; plusieurs relations à sens unique (halfelin→nain, homme-bête→humain…). Voulu ou non, à confirmer.
