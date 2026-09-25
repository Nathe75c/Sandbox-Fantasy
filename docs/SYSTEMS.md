# Systèmes de jeu

Vue d'ensemble de chaque système du moteur (`src/game/`), de ses règles et de ses interactions. Les documents thématiques ([ECONOMY.md](ECONOMY.md), [REPUTATION.md](REPUTATION.md), [NPCS.md](NPCS.md), [PROGRESSION.md](PROGRESSION.md)…) détaillent chaque domaine.

## 1. Architecture en couches

```
┌──────────────────────────── src/components (React) ────────────────────────────┐
│  Création · Lieu · Carte · Inventaire · Artisanat · Personnage · Métiers ·      │
│  Journal · Dialogue PNJ · Boutique · Combat                                     │
└───────────────┬───────────────────────────────────────────▲────────────────────┘
                │ dispatch(action)                          │ subscribe / useSyncExternalStore
┌───────────────▼───────────────── src/game/store.ts ───────┴────────────────────┐
│  état courant + journal ; en multijoueur : envoie l'action au serveur           │
└───────────────┬────────────────────────────────────────────────────────────────┘
                │ applyAction(state, action) → { state, events, error? }   (PUR)
┌───────────────▼──────────────── src/game/actions/ ─────────────────────────────┐
│  character · movement · economy · crafting · social · combat · items · jobs     │
└───────────────┬────────────────────────────────────────────────────────────────┘
                │ appellent
┌───────────────▼──────────────── src/game/systems/ ─────────────────────────────┐
│ rng · checks · time · inventory · economy · reputation · npcMemory · jobs ·     │
│ combat · world (tick) · worldEvents · spawning · narration                      │
└───────┬───────────────────────────────┬────────────────────────────────────────┘
        │ lisent                        │ lisent / écrivent (copie)
┌───────▼──────── src/data/ ────┐ ┌─────▼───────── GameState (src/types/state.ts) ──┐
│ CONTENT (statique, indexé)    │ │ meta · world · players · eventLog (JSON pur)    │
│ itemUsage() · validate.ts     │ └──────────────────────┬──────────────────────────┘
└───────────────────────────────┘                        │ src/game/save/ (StorageAdapter)
                                                          ▼
                                                   localStorage (MVP) / serveur (futur)
```

- **Contenu** (`src/data`) : immuable, identique pour tous les joueurs.
- **État** (`GameState`) : tout ce qui change, sérialisable en JSON.
- **Actions** : intentions du joueur. **Événements** : faits produits. L'UI n'écrit jamais l'état directement.

## 2. Cycle d'une action

1. L'UI appelle `store.dispatch(action)`.
2. `applyAction` clone l'état, route vers le handler du domaine.
3. Le handler **valide** (lieu, énergie, outils, or…) ; en cas d'échec il renvoie `error` et l'état inchangé.
4. Il applique les règles en appelant les systèmes (jets via `rng` → `checks`, avancement du temps via `time`…).
5. Si le temps franchit minuit, `time` déclenche le **tick du monde** (`world`) pour chaque jour écoulé.
6. Chaque changement produit un **événement** (`GameEvent`, horodaté, avec id) ; `narration` en tire un texte français.
7. Le store remplace l'état, ajoute les événements au journal (tronqué) et notifie React ; l'autosave est déclenchée.

## 3. Les systèmes

### 3.1 `rng` — hasard déterministe
- Générateur **mulberry32** ; son état (`meta.rngState`) est dans la sauvegarde. Même graine + mêmes actions = même partie.
- Fonctions : entier dans un intervalle, flottant, tirage pondéré, `d100`.
- Aucun `Math.random()` dans le moteur.

### 3.2 `checks` — jets
- **Jet standard** : `p = clamp(40 + stat × 4 + bonus − difficulté, 5, 95)` ; réussite si `d100 ≤ p`.
- **Critique** : `d100 ≤ CHANCE / 2` (CHANCE 6 → 3 %).
- La probabilité `p` est calculée par la même fonction pour l'affichage (l'UI montre la chance réelle).

### 3.3 `time`
- `world.time = { day, hour }`. Chaque action ajoute des heures (déplacement : heures de la connexion ; récolte 1 h ; travail 4 h ; repos 8 h ; recette : `hours` de la recette ; défaite +8 h).
- Passage à un nouveau jour → `day_started` + tick du monde. Les buffs expirent à `untilDay/untilHour`.

### 3.4 `inventory`
- Piles `{ itemId, qty, stolen? }` : un objet volé forme une pile séparée.
- **Charge max = 40 + FOR × 4** (poids des items). En surcharge, les trajets durent ×1,5.
- Équiper : `arme`, `armure`, `bijou` (les outils agissent depuis l'inventaire). Les exigences de stats (`requirements`) sont vérifiées.
- Déposer au sol (`groundItems` du lieu) / ramasser.

### 3.5 Statistiques (sélecteurs `state/`)
- **Stat effective = base + bonus passifs d'équipement (effets `buff` avec `hours: 0`) + buffs temporaires actifs.**
- Dérivées : **PV max = 30 + VIT × 5**, **Énergie max = 10 + VIT + VOL**, **Charge max = 40 + FOR × 4**.
- Tags du joueur = tags d'origine + tags de traits + `race:<id>` + `job:<id>` pour chaque métier appris.

### 3.6 Déplacement (`actions/movement`)
- Seulement vers une **connexion** du lieu courant. Durée = `hours` de la connexion (×1,5 en surcharge). **Énergie = ceil(heures / 2)**.
- **Embuscade** : `p = danger_connexion × 6 + danger_destination / 5 − DIS × 1,5 − PER − (8 si carte_val)`, bornée à 0..60 %. En cas d'embuscade : combat contre une créature **agressive ou prédatrice** liée à la destination.

### 3.7 Récolte (`actions/crafting` / `gather`)
- 1 h, 2 énergie, sur une ressource listée dans `gatherables` du lieu.
- Il faut l'un des **outils du métier** si le métier en liste (pioche, faucille, canne à pêche…). Les métiers **libres** s'apprennent en les pratiquant (première récolte = niveau 1).
- Jet contre la `difficulty` de la ressource (stat clé du métier). **Quantité = 1 + floor(niveau / 3)** (+1 si la stat clé ≥ 10), limitée au stock restant.
- Le stock baisse ; il remonte chaque jour de `regenPerDay` (le stock de base sert de référence). Surexploiter crée une pénurie.

### 3.8 Artisanat
- Conditions : métier appris au **niveau requis**, entrées dans l'inventaire, **outils** (non consommés), **station** présente dans le lieu.
- Jet : `stat de la recette + niveau du métier × 5 + bonus de traits` contre `difficulty` (défaut `20 + niveau × 8`).
- Réussite : entrées consommées, sorties ajoutées, XP de métier (`xp` de la recette). **Échec : perte de la moitié des entrées** (arrondi).
- Détails : [CRAFTING.md](CRAFTING.md).

### 3.9 Métiers (`systems/jobs`)
- Cumulables, niveaux 1..10 ; **XP pour passer au niveau suivant = 30 × niveau²**.
- Gain d'XP × (1 + 3 % par point d'INT au-dessus de 5) × (1,10 si humain) × (1 + bonus de traits/origine du métier).
- Apprentissage : `libre` (gratuit, ou par la pratique), `maitre` (un PNJ qui l'enseigne, opinion non hostile, coût `learnCost`, −25 % si le PNJ est amical ou mieux), `livre` (utiliser le livre).
- **Travailler** : métiers avec `work`, dans les types de lieux permis ; 4 h, 3 énergie ; `or = or/h × h × (1 + niveau × 0,1 + (stat − 5) × 0,03) × prospérité / 50`. Le garde réduit le danger local ; `reputation` ajoute de la réputation locale.
- Détails : [JOBS.md](JOBS.md).

### 3.10 Économie (`systems/economy`)
- Prix = valeur × indice local de l'item × facteur de marché × événements × (1 − remise). Revente ≈ 50 %.
- Achat/vente déplacent l'indice local ; chaque jour il revient vers 1. Boutiques : stock, or, réassort quotidien.
- Détails : [ECONOMY.md](ECONOMY.md).

### 3.11 Réputation (`systems/reputation`)
- Locale (par lieu) et par faction, −100..100 ; paliers Haï / Mal vu / Neutre / Apprécié / Honoré. Notoriété criminelle 0..100.
- Les actions sont traduites en « tags d'action » (les types de souvenirs) que chaque faction aime ou déteste (`likes` / `dislikes`).
- Détails : [REPUTATION.md](REPUTATION.md).

### 3.12 Mémoire des PNJ (`systems/npcMemory`)
- Opinion par joueur −100..100 ; souvenirs (12 max, les marquants restent) ; commérages quotidiens en ouï-dire (moitié de l'impact).
- Détails : [NPCS.md](NPCS.md).

### 3.13 Combat (`systems/combat`)
- Tour par tour contre une instance de créature (`CreatureInstance`).
- **Toucher** : `clamp(60 + (AGI − agilité créature) × 4, 15, 95)`.
- **Dégâts** : `2 + FOR/2 + bonus d'arme + 0..3`, ×1,5 si un tag de l'arme est une **faiblesse** de la créature, ×0,5 si **résistance**, − défense/2, minimum 1, ×2 en critique.
- **Attaque puissante** : −15 % au toucher, ×1,5 dégâts, 1 énergie.
- **Riposte** : toucher `clamp(55 + (agi créature − AGI) × 4, 10, 90)`, dégâts `attaque + 0..3 − armure − VIT/4`, minimum 1.
- **Fuite** : `clamp(40 + (AGI − agi) × 5 + DIS × 2, 10, 95)`. **Éviter** (`sneak_past`) : jet de Discrétion contre `danger × 8`.
- **Victoire** : butin (les chances de drop profitent de la CHANCE), or, XP de personnage, `reputationOnKill`, danger local −2, XP de Chasseur (bêtes sauvages) ou de Mercenaire (monstres).
- **Défaite** : réveil au **Temple de l'Aube** (`SAFE_WAKE_LOCATION`) avec 30 % des PV, −20 % d'or, +8 h.

### 3.14 Repos
- 8 h, énergie pleine, +50 % des PV max, coût `rest.cost` du lieu. Si `rest.safe` est faux (Bas-Quais, Route du Sel, forêt, col, marais, ruines) : risque de **vol nocturne**.

### 3.15 Monde (`systems/world`) — tick quotidien
Ordre d'exécution à chaque nouveau jour :

1. **Ressources** : `resources += regenPerDay` (référence : stock de base).
2. **Boutiques** : réassort selon rareté et prospérité ; l'or se reconstitue.
3. **Prix** : les indices locaux reviennent vers 1.
4. **PNJ** : déplacement (probabilité `travelChance`, destination tirée dans `habits`), humeur du jour (−2..2).
5. **Créatures** (`spawning`) : par lieu, `p = 0,15 + danger / 200`, créature tirée selon `creatureSpawns` (poids), limitée par `max`. Les **légendaires** n'apparaissent **que** via un événement.
6. **Lieux** : `prospérité += (sécurité − danger) / 20` ; le danger tend vers `base.danger + 3 × créatures présentes`.
7. **Factions** : l'influence évolue selon la prospérité de leurs lieux (`homeLocations`).
8. **Événements** (`worldEvents`) : fin des événements expirés (`endEffects`), puis ≈ 45 % de chance d'en tirer un nouveau (pondéré par `weight`, filtré par `conditions`).
9. **Commérages** : les PNJ d'un même lieu se transmettent les souvenirs marquants (ouï-dire, impact /2).
10. **Économie des PNJ** : enrichissement/appauvrissement, changement de métier possible.
11. **Boutiques du joueur** : revenu quotidien.
12. **Vengeance / reconnaissance** : un PNJ haineux peut envoyer des hommes de main ; un allié peut offrir un cadeau.

### 3.16 `narration`
- Transforme chaque `GameEvent` en phrase française (« Vous achetez 2 × Pain pour 7 po chez Mère Pivoine. »). Seule couche qui produit du texte : le reste du moteur ne manipule que des données.

### 3.17 Sauvegarde (`src/game/save/`)
- `StorageAdapter` (interface) → `LocalStorageAdapter` (MVP). 3 emplacements + autosave.
- Chaque sauvegarde porte `meta.schemaVersion` ; `saveManager` applique les **migrations** successives au chargement.

## 4. Matrice d'interactions

Qui influence quoi (ligne → colonne) :

| ↓ agit sur → | Prix | Stocks boutiques | Ressources | Opinion PNJ | Réputation | Notoriété | Danger lieu | Prospérité | Factions |
|---|---|---|---|---|---|---|---|---|---|
| Acheter / vendre | ● | ● | | ● (commerce) | | | | | |
| Récolter | | | ● | | | | | | |
| Fabriquer | (offre) | | | | | | | | |
| Voler | | ● | | ● (marquant si pris) | ● | ● | | ● (sécurité ↑) | ● Main Grise |
| Dialogue (aider, flatter, menacer…) | | | | ● | ● | ● (menace) | | | |
| Combattre / tuer | | | | ● (creature_tuee) | ● `reputationOnKill` | | ● −2 | | ● |
| Travailler (garde) | | | | | ● | | ● | | |
| Événements du monde | ● | | ● | | | | ● | ● | ● |
| Tick (créatures) | | | | | | | ● | ● | ● |
| Commérages | | | | ● (ouï-dire) | | | | | |

Exemples de chaînes causales :

- **Troll dans les mines** (événement) → minerai d'argent −4, minerais ×1,3, lingots/épées ×1,2 partout → les forgerons paient plus cher → opportunité pour le mineur du Col des Crocs → tuer le troll : clan Karak +5, Thrain veut un os de troll (80 po).
- **Vol raté chez Barda** → souvenir marquant « vol » → réputation Bourg et Couronne ↓, notoriété +15 → le lendemain, Pivoine l'apprend en ouï-dire → prix plus hauts chez elle → si notoriété > 30, amendes des gardes.
- **Chasse aux loups à la ferme** → danger −2 par loup → prospérité de la ferme ↑ (sécurité − danger) → Couronne +1 par loup → Jehan Tillac satisfait (fourrures).

## 5. Invariants

- Le moteur ne lit que `CONTENT` (jamais les tableaux bruts) et l'état passé en paramètre.
- `applyAction` ne modifie jamais l'état reçu (copie), ne fait aucune E/S, n'utilise ni `Date.now()` ni `Math.random()`.
- Toutes les valeurs bornées le sont dans les systèmes : opinion et réputation −100..100, notoriété 0..100, stats 1..25, indices de prix 0,5..2.
