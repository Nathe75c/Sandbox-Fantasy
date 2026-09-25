# CLAUDE.md — Sandbox Fantasy

Guide pour les agents qui travaillent sur ce dépôt. Le propriétaire (Collins) écrit en français : répondre, documenter et nommer le contenu en français. Les identifiants de code restent en anglais, les ids de contenu en snake_case français.

Contexte complet du projet (état, décisions, limites, prochaines étapes) : `docs/HANDOVER.md`. Feuille de route : `docs/ROADMAP.md`.

## Commandes

- `npm install` puis `npm run dev` (Vite, port 5173)
- `npm test` : validation du contenu (`src/data/content.test.ts`) + moteur (`src/game/game.test.ts`). À lancer après toute modification de `src/data` ou `src/game`.
- `npm run build` : `tsc -b` + build Vite. Doit rester vert.

## Règles d'architecture (ne pas casser)

1. **Séparation stricte** :
   - contenu statique → `src/data/` (jamais modifié en jeu) ;
   - état dynamique → `GameState` (`src/types/state.ts`), 100 % JSON sérialisable (pas de classes, Map, Set, fonctions, Date) ;
   - logique → `src/game/systems/` et `src/game/actions/` ;
   - interface → `src/components/` (ne modifie jamais l'état directement).
2. **Toute modification de l'état passe par `applyAction`** (`src/game/actions/applyAction.ts`). Une nouvelle interaction = un nouveau type dans `src/types/actions.ts` + un handler + l'entrée dans `HANDLERS`.
3. **Les handlers émettent des événements** (`ctx.emit`) pour chaque changement important (types dans `src/types/events.ts`). Ce sont eux qui seront synchronisés en multijoueur.
4. **Aucun `Math.random()` ni `Date.now()` dans la logique** : utiliser `ctx.rng` (RNG seedé, état dans `meta.rngState`) et le temps du jeu (`world.time`). Le moteur doit rester déterministe.
5. **Erreurs joueur** : `fail('message en français')` — l'état n'est alors pas modifié.
6. **Identifiants** : contenu = id lisible unique ; entité dynamique = `ctx.newId(prefix)`.
7. **Relations d'items dérivées** : « recettes liées », « composants », « objets fabricables », « butin de » sont calculés par `itemUsage()` à partir des recettes/créatures/lieux. Ne pas les dupliquer dans `items.ts`.
8. **Joueurs multiples** : l'état stocke `players: Record<id, PlayerState>`. Ne jamais supposer un joueur unique dans les systèmes (seule l'UI connaît `LOCAL_PLAYER_ID`).
9. Changement du schéma de `GameState` → incrémenter `SCHEMA_VERSION` et ajouter une migration dans `src/game/save/saveManager.ts`.

## Contenu

- Chaque statistique, trait, métier, item ou créature ajouté doit avoir un **vrai usage systémique** (pas de remplissage).
- Aucune race n'est « mauvaise par nature » : le comportement dépend de la faction, du PNJ et du contexte.
- Après ajout de contenu : `npm test` (vérifie toutes les références et qu'aucun ingrédient n'est introuvable).

## UI

- Doit rester jouable au doigt (cibles ≥ 44 px, pas d'interaction au survol uniquement) et au clavier.
- Onglets à gauche sur PC, en bas sous 900 px. Tester les deux largeurs.
