# Reprise du projet en local

Document de passation : tout ce qu'il faut pour continuer Sandbox Fantasy sur son propre PC (VS Code, seul ou avec un assistant IA comme Claude Code). À lire en premier, avant les autres docs.

État au 25 septembre 2026 : version 0.1 (MVP solo) fusionnée sur `main`. 16 tests verts, build vert.

## 1. Mettre en place le poste

1. **Node.js 20.19+ ou 22.12+** (version LTS de nodejs.org). Vite 8 refuse les versions plus anciennes.
2. **Git** (git-scm.com). Recommandé plutôt que le zip : un dossier cloné garde l'historique et permet de pousser vers GitHub.
   ```bash
   git clone https://github.com/Nathe75c/Sandbox-Fantasy.git
   cd Sandbox-Fantasy
   npm install
   ```
   Si tu as déjà le dossier issu du zip, tu peux le garder pour jouer, mais pour développer et pousser, clone le dépôt (le zip n'a pas de dossier `.git`). Le dossier peut être déplacé n'importe où ; si tu le déplaces, `node_modules` suit sans problème (sinon relance `npm install`).
3. **VS Code** : ouvre le dossier (`Fichier > Ouvrir le dossier`). TypeScript est intégré. Extensions utiles : *Vitest* (lancer les tests depuis l'éditeur) et *Error Lens* (erreurs affichées dans la ligne). Il n'y a pas de linter configuré.
4. Terminal intégré de VS Code : ``Ctrl+` ``.

## 2. Commandes du quotidien

| Commande | Quand |
|---|---|
| `npm run dev` | Lancer le jeu sur http://localhost:5173. Rechargement automatique à chaque sauvegarde de fichier. **Ctrl+C** dans le terminal pour l'arrêter. |
| `npm run dev -- --host` | Idem, accessible depuis la tablette sur le même Wi-Fi (adresse `http://192.168.x.x:5173` affichée). |
| `npm test` | Après toute modification de `src/data` ou `src/game`. Valide le contenu et le moteur. |
| `npm run test:watch` | Tests relancés à chaque sauvegarde. |
| `npm run build` | Vérification TypeScript complète + build de production dans `dist/`. Doit rester vert avant chaque commit. |
| `npm run typecheck` | TypeScript seul, plus rapide. |

Sauvegardes du jeu : dans le `localStorage` du navigateur, par adresse. Une partie jouée sur `localhost:5173` n'apparaît pas sur `192.168.x.x:5173`. Pour repartir de zéro : outils développeur du navigateur > Application > Local Storage > supprimer les clés.

## 3. Le projet en une page

**Vision** : un bac à sable fantasy où l'on vit librement (métiers cumulables, commerce, vol, combat, relations) dans un monde qui évolue seul chaque jour. Simple à prendre en main, profond dans ses systèmes, PC et tablette. Détails : [VISION.md](VISION.md), [GAME_DESIGN.md](GAME_DESIGN.md).

**Stack** : TypeScript ~5.9, React 19, Vite 8, Vitest 5. Aucune autre dépendance. Alias d'import `@` → `src`.

**Architecture** (règles complètes dans [`CLAUDE.md`](../CLAUDE.md)) :

```
Contenu statique      État dynamique            Logique                        Interface
src/data/*.ts   --->  GameState (JSON pur) <--- applyAction(state, action) <--- src/components (dispatch)
(jamais modifié)      meta / world / players     -> { state, events, error }
                      / eventLog
```

- **`applyAction`** (`src/game/actions/applyAction.ts`) est le seul point d'entrée qui modifie l'état. Il est pur : il clone l'état, applique le handler, renvoie le nouvel état et les événements émis. En cas d'erreur joueur (`fail('...')`), l'état d'origine est rendu intact.
- **Déterminisme** : pas de `Math.random()` ni `Date.now()` dans la logique. Le RNG seedé garde son état dans `meta.rngState` ; le temps est celui du jeu (`world.time`).
- **Événements** (`src/types/events.ts`, ~41 types) : chaque changement important émet un événement. C'est la future base de la synchronisation multijoueur.
- **Tick quotidien** (`systems/time.ts` → `systems/world.ts`) : repousse des ressources, économie, vie des PNJ, apparitions de créatures, factions, événements du monde, commérages, conséquences pour le joueur.
- **Multi-joueurs prêt** : `players: Record<id, PlayerState>` ; seul l'UI connaît `LOCAL_PLAYER_ID`. Plan de migration serveur : [MULTIPLAYER_READY_ARCHITECTURE.md](MULTIPLAYER_READY_ARCHITECTURE.md).
- **Store UI** : `src/game/store.ts` (dispatch/subscribe), branché sur React via `useSyncExternalStore` dans `components/GameContext.tsx`. Sauvegarde auto 400 ms après chaque action.
- **Sauvegardes** : `src/game/save/` — interface `StorageAdapter` (localStorage aujourd'hui, serveur demain), `SaveManager` avec emplacements `auto`, `slot1` à `slot3`, `SCHEMA_VERSION = 1` et migrations.

## 4. Où est quoi

| Dossier / fichier | Rôle |
|---|---|
| `src/types/` | Types partagés : `content.ts` (définitions statiques), `state.ts` (état), `actions.ts` (22 actions), `events.ts`. |
| `src/data/` | Tout le contenu : stats (9), traits (9) + origines (11), races (11), jobs (20), items (158), recipes (71), creatures (18), locations (14), npcs (19), factions (10), events (14). `index.ts` = registre `CONTENT` + `itemUsage()`. `validate.ts` + `content.test.ts` = contrôle des références. |
| `src/game/actions/` | Un fichier par domaine : `movement`, `production` (récolte, artisanat, travail, apprentissage), `commerce`, `social` (parler, voler, factions), `combat`, `items`, `character`. Table `HANDLERS` dans `applyAction.ts`. |
| `src/game/systems/` | Règles réutilisables : `rng`, `checks` (jets), `economy`, `reputation`, `npcMemory`, `jobs`, `combat`, `spawning`, `worldEvents`, `world` (tick), `time`, `narration`. |
| `src/game/state/` | `createInitialState` (création du monde et du personnage), `selectors` (valeurs dérivées pour l'UI). |
| `src/game/game.test.ts` | Tests du moteur (dont une simulation de 60 jours). |
| `src/components/` | Écrans React : menu, création, écran de jeu, panneaux (lieu, carte, sac, artisanat, personnage, métiers, journal), modales (PNJ, boutique, combat). |
| `src/styles/global.css` | Styles responsive : onglets à gauche sur PC, en bas sous 900 px ; journal latéral masqué sous 1280 px. |
| `docs/` | Conception (voir l'ordre de lecture plus bas). |

## 5. Recettes de travail

**Ajouter du contenu** (item, recette, PNJ, lieu, créature, événement) : copier une entrée existante dans `src/data/…`, changer l'id (snake_case français, unique), compléter, puis `npm test`. La validation signale toute référence cassée ou ingrédient introuvable. Pas à pas : [CONTENT_STRUCTURE.md](CONTENT_STRUCTURE.md). Règle : tout ajout doit avoir un vrai usage dans les systèmes, pas de remplissage.

**Ajouter une interaction** : nouveau type dans `src/types/actions.ts` → handler dans `src/game/actions/<domaine>.ts` qui émet ses événements (`ctx.emit`) et utilise `ctx.rng` / `ctx.newId()` → entrée dans `HANDLERS` → bouton dans le composant concerné qui fait `dispatch(action)` → test dans `game.test.ts`.

**Modifier la forme de `GameState`** : incrémenter `SCHEMA_VERSION` (`src/game/state/createInitialState.ts`) et ajouter une migration dans `src/game/save/saveManager.ts`, sinon les anciennes sauvegardes cassent.

**Avant chaque commit** : `npm test` et `npm run build` verts. Tester l'UI à deux largeurs (≈1440 px et ≈820 px, via le mode responsive des outils développeur).

**Git** : une branche par sujet (`git switch -c quetes`), commits en français, puis PR vers `main` sur GitHub (ou push direct sur `main` si tu travailles seul).

## 6. Travailler avec un assistant IA en local

- **Claude Code** (extension VS Code ou `claude` dans le terminal) lit automatiquement [`CLAUDE.md`](../CLAUDE.md) à la racine : règles d'architecture, commandes, conventions. Il n'y a rien d'autre à configurer.
- Pour démarrer une session, une consigne qui marche bien : « Lis `docs/HANDOVER.md` et `docs/ROADMAP.md`, puis propose un plan pour <objectif> ».
- Pour un autre assistant, donne-lui ce fichier et `CLAUDE.md` en premier.
- Conventions à rappeler si besoin : réponses et docs en français ; identifiants de code en anglais ; ids de contenu en snake_case français.

## 7. Décisions déjà prises (et pourquoi)

| Décision | Raison |
|---|---|
| 9 statistiques : force, agilite, vitalite, intelligence, perception, volonte, charisme, discretion, chance. *Persuasion* fusionnée dans charisme ; *sagesse* répartie entre perception et volonte. | Éviter les doublons : chaque stat a un rôle distinct dans les jets. |
| Origines (11) séparées des traits (9, on en choisit 2). | L'origine fixe le départ (lieu tiré selon la chance, or, objets, métiers, réputation) ; les traits modulent le style de jeu. |
| 20 métiers cumulables ; *mage* + *enchanteur* → *arcaniste* ; *caravanier* intégré à *marchand*. | Chaque métier doit ouvrir une production ou une action unique. |
| Relations d'items dérivées par `itemUsage()` (recettes, butins, sources, boutiques). | Une seule source de vérité : pas de listes à maintenir à la main dans `items.ts`. |
| Moteur pur + RNG seedé + événements. | Rejouable, testable, et prêt à tourner sur un serveur autoritaire. |
| Aucune race « mauvaise par nature ». | Le comportement dépend de la faction, du PNJ et du contexte, pas du peuple. |
| Pas de backend, pas de multijoueur dans le MVP. | Demande explicite ; l'architecture l'anticipe seulement. |

## 8. Limites connues du MVP

- Équilibrage (prix, gains des métiers, difficulté des combats) vérifié par simulation seulement, pas par de vraies parties.
- Quelques objets sans usage mécanique (relique de l'Aube, clé de crypte, carte au trésor, lettre scellée, statuette, certaines ressources rares) : prévus pour les quêtes (version 0.3).
- Certaines relations entre factions ne sont définies que dans un sens.
- `work.locationKinds` sur les métiers n'est pas lu par le moteur (c'est `location.workJobs` qui décide où l'on travaille).
- Pas de quêtes, pas d'illustrations ni de son ; interface surtout textuelle, au style « idle » : c'est ce que la version 0.2 remplace par un monde parcouru en 2.5D puis 3D.
- Pas de CI GitHub : les tests se lancent en local.

## 9. Prochaines étapes

Direction décidée par Collins le 25/09/2026 : le jeu ne doit plus être de style « idle ». Il passera en **2.5D puis 3D**, avec un personnage qu'on déplace dans des lieux explorables.

1. **Version 0.2, monde visuel** : Three.js via @react-three/fiber, caméra isométrique ; un premier lieu jouable (déplacement, PNJ, récolte, artisanat, sortie, créatures), puis les 14 lieux. Détails et raisons dans [ROADMAP.md](ROADMAP.md).
2. **Version 0.3, contenu et quêtes** : quêtes à étapes data-driven (`src/data/quests.ts`) qui donnent un usage aux objets en attente.
3. En parallèle : équilibrage après de vraies parties, finitions des données listées au §8, mise en ligne sur GitHub Pages pour jouer depuis un lien.

Vue complète : 0.2 monde visuel → 0.3 quêtes → 0.4 gestion → 0.5 backend → 0.6 multijoueur → 0.7 monde étendu ([ROADMAP.md](ROADMAP.md)).

## 10. Ordre de lecture des docs

1. [`README.md`](../README.md) — présentation et démarrage.
2. Ce fichier.
3. [`CLAUDE.md`](../CLAUDE.md) — règles d'architecture à ne pas casser.
4. [VISION.md](VISION.md) puis [GAME_DESIGN.md](GAME_DESIGN.md) — ce qu'on construit.
5. [MVP.md](MVP.md) puis [ROADMAP.md](ROADMAP.md) — ce qui existe et ce qui vient.
6. [SYSTEMS.md](SYSTEMS.md) et [MULTIPLAYER_READY_ARCHITECTURE.md](MULTIPLAYER_READY_ARCHITECTURE.md) — comment le moteur fonctionne.
7. [CONTENT_STRUCTURE.md](CONTENT_STRUCTURE.md) — avant d'ajouter du contenu.
8. Référence, au besoin : [STATS_AND_ATTRIBUTES.md](STATS_AND_ATTRIBUTES.md), [JOBS.md](JOBS.md), [ITEMS.md](ITEMS.md), [CRAFTING.md](CRAFTING.md), [NPCS.md](NPCS.md), [RACES_AND_CREATURES.md](RACES_AND_CREATURES.md), [WORLD.md](WORLD.md), [ECONOMY.md](ECONOMY.md), [REPUTATION.md](REPUTATION.md), [PROGRESSION.md](PROGRESSION.md), [UI_UX_PC_TABLET.md](UI_UX_PC_TABLET.md).

En cas de doute entre un doc et le code, le code fait foi (`npm test` valide les références).
