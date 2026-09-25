# Structure du contenu (data-driven)

Tout le contenu du jeu vit dans `src/data/*.ts`, typé par `src/types/content.ts`. Le moteur ne contient **aucun** nom d'item, de lieu ou de PNJ en dur (à l'exception du lieu de réveil `SAFE_WAKE_LOCATION` et des items à effet spécial comme `carte_val` pour les embuscades).

## 1. Fichiers

| Fichier | Contenu | Type |
|---|---|---|
| `stats.ts` | 9 statistiques, constantes de création (`BASE_STAT_VALUE = 5`, `CREATION_BONUS_POINTS = 5`, `STAT_MIN = 1`, `STAT_MAX = 20`) | `StatDef` |
| `traits.ts` | 9 traits + 11 origines | `TraitDef`, `OriginDef` |
| `races.ts` | 11 peuples | `RaceDef` |
| `factions.ts` | 10 factions | `FactionDef` |
| `jobs.ts` | 20 métiers | `JobDef` |
| `items.ts` | 158 items (helper `item()` avec valeurs par défaut) | `ItemDef` |
| `recipes.ts` | 71 recettes (helper `r()`) | `RecipeDef` |
| `creatures.ts` | 18 créatures | `CreatureDef` |
| `locations.ts` | 14 lieux, leurs boutiques (`ShopDef`), `SAFE_WAKE_LOCATION` | `LocationDef` |
| `npcs.ts` | 19 PNJ | `NpcDef` |
| `events.ts` | 14 événements du monde | `WorldEventDef` |
| `index.ts` | Registre `CONTENT`, `itemUsage()`, `getItem()` | `ContentRegistry` |
| `validate.ts` | `validateContent()` : vérification des références | — |
| `content.test.ts` | Tests Vitest du contenu | — |

## 2. Conventions

- **Identifiants** : `snake_case` lisible, sans accent, uniques dans leur catégorie (`epee_fer`, `bourg_du_gue`, `soeur_maelis`). Ils sont stockés dans les sauvegardes : **ne jamais renommer un id publié** sans migration (voir `saveManager`).
- **Noms et textes** : en français, avec accents et apostrophes typographiques (`’`).
- **Statique uniquement** : pas de quantité en stock courante, pas de position courante, pas d'opinion. Les valeurs `base`, `stock`, `startingGold`, `possessions` ne font qu'**initialiser** l'état dynamique (`createInitialState`).
- **Source unique de vérité** : les liens « cet item sert à fabriquer… », « composants nécessaires », « où le trouver » **ne sont pas écrits dans les items** : ils sont dérivés par `itemUsage()`.
- **Lecture via le registre** : les systèmes lisent `CONTENT.items[id]`, `CONTENT.shops[id]`… jamais les tableaux bruts.

## 3. Le registre `CONTENT` et `itemUsage()`

`index.ts` construit `CONTENT` : un index par id pour chaque type (`CONTENT.items`, `CONTENT.jobs`…), les listes ordonnées (`CONTENT.lists.*`) et un index des **boutiques** à plat (`CONTENT.shops[shopId]` avec son `locationId`).

`itemUsage(itemId)` dérive, et met en cache :

| Champ | Calculé depuis |
|---|---|
| `producedBy` | recettes dont les `outputs` contiennent l'item (→ composants nécessaires) |
| `usedIn` | recettes dont les `inputs` contiennent l'item (→ objets qu'il permet de fabriquer) |
| `toolFor` | recettes où l'item est un outil |
| `droppedBy` | créatures dont les `drops` contiennent l'item |
| `gatheredAt` | lieux dont les `gatherables` contiennent l'item |
| `soldAt` | boutiques dont `sells` contient l'item |

L'UI (fiche d'objet, artisanat, encyclopédie) s'appuie uniquement sur cette fonction. Ajouter une recette met donc à jour automatiquement toutes les fiches concernées.

## 4. `validate.ts` : filet de sécurité

`validateContent()` renvoie la liste des erreurs ; le test `content.test.ts` exige qu'elle soit vide. Il vérifie :

- l'absence d'**ids en double** dans chaque liste ;
- que toute référence pointe vers un élément existant : stats des modificateurs, métiers des bonus, items de départ, lieux de départ, factions de réputation, items/métiers/outils des recettes, drops, habitats, spawns, propriétaires de boutiques, relations entre PNJ, boutiques des PNJ, métiers enseignés, désirs (`wants`), cibles des effets d'événements, clés `unlock` de type `job:<id>`…
- que chaque **connexion entre lieux existe dans les deux sens** ;
- que chaque recette a au moins une sortie.

Elle ne vérifie **pas** (à faire à la main ou à ajouter) : l’existence d’un lieu possédant la station d’une recette, la cohérence `workJobs` ↔ `work.locationKinds`, la symétrie des relations entre PNJ/factions/peuples, ni la cohérence `jobs.produces` ↔ recettes.

`content.test.ts` vérifie en plus que **chaque ingrédient de recette a au moins une source** (recette, butin, récolte ou boutique) et un volume minimal (≥ 100 items, ≥ 50 recettes, ≥ 15 métiers).

Commandes : `npm test` (tout) ou `npm run validate:data` (contenu seul).

## 5. Recettes pas à pas

### 5.1 Ajouter un item

1. Ouvrir `src/data/items.ts`, choisir la section de la catégorie.
2. Ajouter une ligne avec le helper `item()` (défauts : `rarity: 'commun'`, `weight: 1`, `utility` selon la catégorie) :

```ts
item({
  id: 'bouclier_chene',            // unique, snake_case
  name: 'Bouclier de chêne',
  category: 'armure',
  description: 'Planches cerclées de fer. Lourd mais rassurant.',
  value: 28,                        // valeur de base en po
  weight: 5,
  slot: 'armure',
  effects: [{ type: 'armor', amount: 2 }],
  requirements: { stats: { force: 6 } },
  jobs: ['charpentier', 'garde'],   // devient relatedJobs
}),
```

3. Lui donner **au moins une source** : une recette (5.3), un drop de créature, une ressource récoltable ou une boutique (`sells`). Sinon l'objet est inaccessible.
4. `npm test`.

Effets disponibles : `heal`, `energy`, `buff` (`hours: 0` = bonus passif tant que l'objet est équipé), `damage_bonus`, `armor`, `poison`, `cure`, `learn_recipe`, `unlock` (`job:<id>` pour apprendre un métier). Pour les armes, ajouter un **tag de dégâts** (`tranchant`, `contondant`, `percant`, `feu`, `sacre`, `argent`, `poison`, `magie`) : il est comparé aux faiblesses/résistances des créatures. `illegal: true` rend l'objet refusé par les boutiques honnêtes.

### 5.2 Ajouter un métier

Dans `src/data/jobs.ts` :

```ts
{
  id: 'apiculteur',
  name: 'Apiculteur',
  kind: 'recolte',                     // recolte | artisanat | service | commerce | ombre | combat | savoir
  description: 'Élève les abeilles et récolte le miel.',
  actions: ['Récolter le miel'],
  tools: ['enfumoir'],                 // items existants (un seul suffit pour récolter)
  resourcesUsed: [],
  produces: ['miel'],
  keyStats: ['perception', 'vitalite'],
  risks: ['Piqûres'],
  income: 'Faible, régulier',
  progression: [
    { level: 1, title: 'Apprenti', unlocks: 'Miel' },
    { level: 3, title: 'Apiculteur', unlocks: 'Rendement +1' },
    { level: 5, title: 'Maître des ruches', unlocks: 'Cire' },
    { level: 8, title: 'Seigneur des abeilles', unlocks: 'Gelée royale' },
  ],
  dependsOn: ['charpentier'],          // qui le fournit
  feeds: ['tavernier', 'alchimiste'],  // qui il fournit
  economyImpact: '…', reputationImpact: '…', npcInteractions: '…', worldInteractions: '…',
  learnable: 'libre',                  // libre | maitre | livre
  learnCost: 0,
  work: { locationKinds: ['ferme'], goldPerHour: 2, stat: 'perception' },  // optionnel
},
```

Puis : créer les items manquants (`enfumoir`), ajouter des `gatherables` avec `jobId: 'apiculteur'` dans un lieu, éventuellement un PNJ avec `teaches: ['apiculteur']` (si `learnable: 'maitre'`) ou un livre avec `effects: [{ type: 'unlock', key: 'job:apiculteur' }]` (si `livre`), et ajouter l'id à `workJobs` des lieux concernés. Le tag `job:apiculteur` devient automatiquement disponible pour les `tagOpinions` des PNJ.

### 5.3 Ajouter une recette

Dans `src/data/recipes.ts`, avec le helper `r(id, nom, métier, niveau, entrées, sorties, options)` :

```ts
r('bouclier_chene', 'Assembler un bouclier', 'charpentier', 2,
  [['planche', 3], ['clous', 4], ['lingot_fer', 1]],   // entrées [itemId, qté]
  [['bouclier_chene', 1]],                               // sorties
  { station: 'atelier', tools: ['marteau'], stat: 'agilite', hours: 2 }),
```

Valeurs par défaut : `hours: 1`, `energy: 2`, `difficulty: 20 + niveau × 8`, `stat: 'intelligence'`, `xp: 10 + niveau × 6`, pas d'outil ni de station. Stations possibles : `forge`, `atelier`, `tannerie`, `cuisine`, `laboratoire`, `autel`, `scriptorium`, `metier_a_tisser` — vérifier qu'au moins un lieu la possède ([CRAFTING.md](CRAFTING.md)).

### 5.4 Ajouter un lieu

Dans `src/data/locations.ts` :

```ts
{
  id: 'moulin_brune',
  name: 'Moulin de la Brune',
  kind: 'ferme',
  description: 'Une roue qui grince, de la farine partout.',
  regionId: 'val_de_brume',
  map: { x: 36, y: 46 },                        // position 0..100 sur la carte
  connections: [{ to: 'bourg_du_gue', hours: 1, danger: 0 }],
  factionId: 'couronne',
  base: { prosperity: 45, danger: 5, security: 40, population: 8 },
  gatherables: [{ itemId: 'ble', jobId: 'fermier', stock: 10, regenPerDay: 3, difficulty: 5 }],
  creatureSpawns: [],
  shops: [{ id: 'moulin_boutique', name: 'Sacs du meunier', sells: ['farine', 'ble'],
            buysCategories: ['ingredient'], startingGold: 80, purchasePrice: 350 }],
  stations: ['cuisine'],
  produces: ['ingredient'],
  demands: ['outil'],
  workJobs: ['fermier'],
  rest: { cost: 1, safe: true },
},
```

**Obligatoire** : ajouter la connexion **retour** dans le lieu cible (`bourg_du_gue.connections`), sinon la validation échoue. `danger` d'une connexion = risque d'embuscade (0..5 dans le contenu actuel). Un sous-lieu (taverne, quartier) utilise `parentId` et une connexion à 0 h.

### 5.5 Ajouter un PNJ

Dans `src/data/npcs.ts` :

```ts
{
  id: 'meunier_gaspard',
  name: 'Gaspard Blanchefarine', title: 'Meunier',
  raceId: 'humain', age: 49, jobId: 'cuisinier', factionId: 'couronne',
  personality: ['bougon', 'honnête'],
  character: 'Pèse chaque sac deux fois.',
  desires: ['Du blé en quantité'], fears: ['La crue'], goals: ['Réparer la roue'],
  socialStatus: 'modeste',
  possessions: { gold: 60, items: [] },
  relations: { pivoine: 30 },                     // autres PNJ existants
  homeLocationId: 'moulin_brune',
  habits: [{ locationId: 'moulin_brune', weight: 8 }, { locationId: 'bourg_du_gue', weight: 2 }],
  travelChance: 0.1,
  shopId: 'moulin_boutique',                      // + ownerNpcId dans la boutique
  teaches: ['cuisinier'],
  wants: [{ itemId: 'ble', qty: 10, reward: 15 }],
  tagOpinions: { paysan: 15, noble: -5, 'race:halfelin': 5, 'job:voleur': -10 },
  lines: {
    hostile: ['Hors de mon moulin !'], mefiant: ['Hmm.'], neutre: ['Farine ? Blé ?'],
    amical: ['Tiens, un sac pour toi.'], allie: ['Mon moulin est le tien.'],
  },
  rumors: ['La roue a été sabotée, j’en suis sûr.'],
  specialOptions: [{ tag: 'paysan', label: 'Parler des récoltes', reply: '…', opinion: 6 }],
  perception: 8,                                  // difficulté à le voler
},
```

Tags reconnus : ceux des origines (`noble`, `riche`, `paysan`, `pauvre`, `soldat`, `marchand`, `voleur`, `artisan`, `erudit`, `mystique`, `banni`, `aventurier`, `artiste`), des traits (`robuste`, `charismatique`, `chanceux`, `discret`, `perspicace`, `sage`, `artisan`, `violent`, `mystique`, `erudit`), `race:<id>` et `job:<id>`. Fournir des répliques pour les **5 paliers** d'opinion.

### 5.6 Ajouter une créature

Dans `src/data/creatures.ts` :

```ts
{
  id: 'sanglier',
  name: 'Sanglier', description: 'Charge tout ce qui bouge.',
  type: 'bete_sauvage', behavior: 'territorial', danger: 2,
  stats: { hp: 24, attack: 7, defense: 3, agility: 4 },
  strengths: ['Charge'], weaknesses: ['percant'], resistances: [],
  habitats: ['foret_sylvebrune'],
  relations: {},
  drops: [{ itemId: 'viande', chance: 1, min: 2, max: 3 }, { itemId: 'peau_animale', chance: 0.7, min: 1, max: 1 }],
  interactions: ['combattre', 'fuir', 'eviter'],
  worldImpact: 'Ravage les champs.',
  reputationOnKill: { couronne: 1 },
  xp: 14,
},
```

Puis l'ajouter aux `creatureSpawns` des lieux (`{ creatureId: 'sanglier', weight: 2, max: 2 }`). `behavior: 'agressif' | 'predateur'` rend la créature capable d'**embuscade**. `legendary: true` = n'apparaît que par événement.

### 5.7 Ajouter un événement du monde

Dans `src/data/events.ts` :

```ts
{
  id: 'crue_brune',
  name: 'Crue de la Brune',
  description: 'La rivière déborde et noie les champs.',
  weight: 1,                 // poids de tirage quotidien
  durationDays: 3,
  conditions: { minDay: 7 },
  effects: [
    { type: 'resource', locationId: 'ferme_tillac', itemId: 'ble', delta: -10 },
    { type: 'prosperity', locationId: 'bourg_du_gue', delta: -5 },
    { type: 'price', locationId: '*', categories: ['ingredient'], multiplier: 1.3 },
  ],
  endEffects: [{ type: 'prosperity', locationId: 'bourg_du_gue', delta: 3 }],
  rumor: 'La Brune est sortie de son lit ! Le blé va manquer.',
},
```

Effets : `price` (lieu ou `'*'`, `itemIds` et/ou `categories`, multiplicateur actif pendant la durée), `danger`, `prosperity`, `security`, `spawn`, `resource`, `faction_influence`, `rumor`. Conditions : `minDay`, `locationDangerAbove`, `locationProsperityBelow`, `locationProsperityAbove`.

## 6. Checklist avant commit de contenu

- [ ] `npm test` passe (aucune référence cassée).
- [ ] Tout nouvel item a une source **et** un usage (recette, effet, équipement, désir de PNJ, vente).
- [ ] Les connexions sont déclarées dans les deux sens.
- [ ] Un nouveau métier est apprenable (libre, maître ou livre) et utile quelque part.
- [ ] Les ids déjà publiés n'ont pas été renommés (sinon : migration de sauvegarde).
