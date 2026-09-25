# Réputation

Règles : `src/game/systems/reputation`. État : `PlayerState.localReputation`, `factionReputation`, `factionId`, `notoriety`. Données : `likes` / `dislikes` / `relations` des factions (`src/data/factions.ts`), `reputationOnKill` des créatures, `startingReputation` des origines.

La réputation est **ce que les groupes pensent de vous** ; l'opinion (voir [NPCS.md](NPCS.md)) est **ce qu'un individu pense de vous**. Les deux se nourrissent l'une l'autre.

## 1. Trois mesures

| Mesure | Portée | Bornes | Sert à |
|---|---|---|---|
| **Réputation locale** | par lieu (`localReputation[locationId]`) | −100..100 | Prix (± rép/100 × 10 %), accueil, amendes. |
| **Réputation de faction** | par faction (`factionReputation[factionId]`) | −100..100 | Opinion initiale des PNJ membres (+ rép/2), adhésion, accès. |
| **Notoriété criminelle** | globale (`notoriety`) | 0..100 | Au-delà de **30**, les gardes infligent des **amendes**. |

## 2. Paliers

| Palier | Valeur |
|---|---|
| **Haï** | ≤ −50 |
| **Mal vu** | −49 .. −15 |
| **Neutre** | −14 .. 14 |
| **Apprécié** | ≥ 15 |
| **Honoré** | ≥ 50 |

## 3. Ce qui fait bouger la réputation

### Actions → types d'action → factions

Chaque action significative produit un « tag d'action » (les mêmes identifiants que les souvenirs de PNJ). Chaque faction a des `likes` (réputation +) et `dislikes` (réputation −) :

| Faction | Aime | N'aime pas |
|---|---|---|
| Couronne de Valcourt | protection, aide_ville, creature_tuee | vol, vol_boutique, menace, attaque_faction |
| Guilde marchande | commerce, protection, generosite | vol_boutique, arnaque |
| La Main Grise | vol, vol_boutique, generosite | trahison, protection |
| Clan Karak-Dur | commerce, creature_tuee, aide | arnaque, trahison, vol |
| Cercle de Sylvebrune | creature_protegee, aide | creature_tuee, attaque_faction |
| Clan Gor'Nak | protection, creature_tuee, aide | trahison, menace, arnaque |
| Les Crocs Rouges | vol, menace | protection, creature_tuee |
| Temple de l'Aube | aide, generosite, sauvetage | vol, insulte |
| Cour Nocturne | commerce, generosite | insulte, attaque_faction |
| Confrérie des Marais | commerce, generosite | insulte, menace |

Conséquence : **aucune action ne plaît à tout le monde.** Un vol réussi plaît à la Main Grise et aux Crocs Rouges ; pris sur le fait, il fâche la Couronne, le Temple et Karak-Dur. Tuer des créatures plaît à la Couronne, à Karak-Dur et à Gor'Nak, mais le Cercle sylvain et les Crocs Rouges le détestent.

### Sources directes

| Source | Effet |
|---|---|
| Origine (`startingReputation`) | Ex. Héritier noble : Couronne +15, Guilde +5, Main Grise −10 ; Banni : Couronne −15, Gor'Nak +10. |
| Tuer une créature (`reputationOnKill`) | Ex. Bandit : Couronne +2, Guilde +2, Crocs Rouges −3 ; Orc pillard : Couronne +2, Gor'Nak +3, Crocs Rouges −4 ; Troll : Karak-Dur +5 ; Cerf : Cercle −1 ; Feu follet : Cercle −2, Confrérie −2 ; Wyrm : Couronne +30, Karak-Dur +20, Gor'Nak +20. |
| Travailler (`work.reputation`) | Garde, Guérisseur, Tavernier : +1 réputation locale par session. |
| Aider un PNJ (`aider`) | Réputation locale + (et souvenir `aide`). |
| Options spéciales | Ex. Hector (soldat) : Couronne +3 ; Sifflet (voleur) : Main Grise +4 ; Varek (banni) : Gor'Nak +5 ; Ilyndra (mystique) : Cercle +4 ; Aldric (marchand) : Guilde +3. |
| Vol réussi | Main Grise +. |
| Vol raté | Réputation locale et des factions concernées −, notoriété +15. |
| Menacer | Notoriété +. |

## 4. Notoriété et justice

- Monte avec les crimes **découverts** (vol raté +15, menaces).
- Au-delà de 30 : les gardes infligent des amendes.
- Se réduit avec les **Faux papiers** (−20, objet illégal fabriqué par l'Écrivain niveau 4 ou acheté chez Sifflet).
- **Futur** : prison, avis de recherche, primes sur la tête du joueur, pardon royal.

## 5. Rejoindre une faction

- Action `join_faction` : réputation auprès de la faction **≥ 25**. Une seule faction à la fois (`PlayerState.factionId`).
- Effets MVP : appartenance affichée, tags et réactions des membres.
- **Futur** : rangs, missions de faction, salaire, accès à des boutiques et recettes réservées, conflits entre factions menés par les joueurs.

## 6. Influence des factions (échelle du monde)

- Chaque faction a une **influence** (`FactionState.influence`, initialisée à `baseInfluence` : Couronne 60, Guilde 55, Karak-Dur 45, Cercle 40, Temple 40, Main Grise 35, Gor'Nak 35, Crocs Rouges 30, Cour Nocturne 25, Confrérie 25).
- Elle évolue chaque jour selon la **prospérité de ses lieux** et les événements (`faction_influence` : raid des Crocs Rouges +5, grande patrouille Couronne +3 / Crocs −4, foire Guilde +3, misère des Bas-Quais Main Grise +4).
- Le joueur l'influence indirectement : protéger la Route du Sel fait prospérer la Guilde ; laisser les Bas-Quais s'appauvrir renforce la Main Grise.

## 7. Exemples de trajectoires

- **Justicier** : patrouiller (Garde), tuer bandits et orcs pillards → Couronne Honoré, Guilde Apprécié, Crocs Rouges Haï, Main Grise méfiante (elle déteste `protection`).
- **Voleur de la Main Grise** : Sifflet (signe de la Main +4), vols réussis → Main Grise ≥ 25 → adhésion ; mais chaque échec rapproche des amendes et du palier Haï au Bourg.
- **Ami des orcs** : Banni, orc, options de Varek, chasse aux Crocs Rouges → Gor'Nak Honoré ; Hector reste méfiant tant que la réputation Couronne ne remonte pas.
