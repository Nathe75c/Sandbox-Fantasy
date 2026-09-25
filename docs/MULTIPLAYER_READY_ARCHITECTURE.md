# Architecture prête pour le multijoueur

Le MVP est **solo avec sauvegarde locale**, mais le moteur est conçu pour qu'un **serveur autoritaire** puisse exécuter exactement le même code. Ce document décrit les choix déjà faits, puis le chemin de migration.

## 1. Séparation des responsabilités

| Couche | Où | Nature | En multijoueur |
|---|---|---|---|
| **Contenu statique** | `src/data/`, types `content.ts` | Immuable, identique pour tous | Servi tel quel (bundle client + serveur), versionné. |
| **Monde dynamique** | `GameState.world` | Partagé : temps, lieux, PNJ, boutiques, factions, créatures, événements, rumeurs | Détenu par le serveur, diffusé par patchs/événements. |
| **Joueurs** | `GameState.players[playerId]` | Un enregistrement par joueur | Chaque client ne reçoit que son joueur complet + infos publiques des autres. |
| **Actions** | `src/types/actions.ts` | Intentions (`{ type, playerId, payload }`) | Envoyées au serveur, validées. |
| **Événements** | `src/types/events.ts` | Faits horodatés (`id`, `day`, `hour`, `actorId`, `data`) | Produits par le serveur, diffusés aux clients concernés. |
| **Présentation** | `src/components/`, `narration` | Lecture seule + texte | Reste côté client. |

Le monde ne contient **aucune donnée propre au client** ; le client local ne connaît que `localPlayerId`. Les données par joueur **à l'intérieur du monde** sont déjà indexées par `PlayerId` : `NpcState.opinions[playerId]`, `NpcState.lastTalk[playerId]`, `NpcMemory.playerId`, `ShopState.ownerPlayerId`, `groundItems[].droppedBy`.

## 2. États sérialisables

- `GameState` est **100 % JSON** : pas de classes, pas de `Map`/`Set`, pas de fonctions, pas de `Date`.
- Tout est **indexé par identifiant** (`Record<Id, …>`), jamais par position, pour permettre des patchs partiels (`world.locations.port_salant.priceIndex.epices = 0.7`).
- Exceptions à surveiller : `activeEvents`, `rumors`, `memories`, `inventory`, `groundItems` sont des tableaux ; les éléments ont un id (`uid`, `id`) ou une clé naturelle (`itemId` + `stolen`), sauf `groundItems` (adressé par index dans l'action `pick_up`) → à migrer vers un id avant le multijoueur.
- `meta.schemaVersion` + migrations dans `saveManager` : le même mécanisme servira aux migrations de base de données.

## 3. Identifiants

| Type | Format | Exemple |
|---|---|---|
| Contenu | `snake_case` lisible, stable | `epee_fer`, `bourg_du_gue`, `raid_crocs_rouges` |
| Entités dynamiques (MVP) | `prefix_<compteur base36>` depuis `meta.nextId` | `cr_1a`, `ev_2f` (préfixes illustratifs) |
| Entités dynamiques (serveur) | UUID | `c0a8…` |
| Joueurs | `PlayerId` | UUID côté serveur |

Le générateur d'ids est isolé : le passage aux UUID ne touche qu'une fonction.

## 4. Actions → événements

```
Client                               Serveur (futur)                         Autres clients
  │ dispatch({type:'buy', …})          │                                          │
  │ ─────────── action ──────────────► │ applyAction(state, action)               │
  │                                    │   ├─ valide (lieu, or, stock, opinion)   │
  │                                    │   ├─ jets via RNG seedé                  │
  │                                    │   └─ → { state', events[] }              │
  │ ◄────────── events ─────────────── │ persiste state' + events                 │
  │ applique / réconcilie              │ ─────── events (filtrés par intérêt) ──► │
```

- `applyAction` est **pure et déterministe** : même état + même action ⇒ même résultat. Localement, le store l'appelle directement ; en ligne, le serveur l'appelle et le client ne fait qu'afficher.
- Les **événements** sont la vérité diffusée : `player_moved`, `item_bought`, `item_sold`, `item_crafted`, `item_stolen`, `npc_moved`, `npc_memory_added`, `npc_opinion_changed`, `creature_spawned`, `creature_defeated`, `city_state_changed`, `shop_stock_updated`, `price_changed`, `reputation_changed`, `faction_influence_changed`, `world_event_triggered`, `world_event_ended`, `rumor_spread`, `day_started`… (liste complète dans `src/types/events.ts`, 41 types).
- `EventDraft` permet aux systèmes de créer un événement sans se soucier de l'id et de l'horodatage, attribués au moment de l'émission.

## 5. Déterminisme

- **RNG seedé** mulberry32 ; son état est dans `meta.rngState` et avance à chaque tirage. Aucun `Math.random()` ni `Date.now()` dans le moteur.
- Conséquences : parties **rejouables** (graine + journal d'actions), **tests** reproductibles, **validation serveur** (le serveur peut rejouer une séquence), détection de désynchronisation (hash d'état).
- En multijoueur, le serveur possède la graine : le client ne peut pas prédire les jets.

## 6. Migration vers le multijoueur

### Étape 1 — Serveur autoritaire mono-monde
- Service Node/TypeScript qui importe `src/types`, `src/data` et `src/game` (actions + systèmes) **sans modification**.
- Endpoint (WebSocket) : reçoit `GameAction`, vérifie que `action.playerId` = joueur authentifié, exécute `applyAction`, persiste, diffuse les événements.
- Le `store` client remplace `applyAction` local par l'envoi au serveur ; il applique les événements reçus (ou un patch d'état).
- `StorageAdapter` serveur : l'état n'est plus en `localStorage`.

### Étape 2 — Persistance en base
- Tables/collections : `worlds` (meta, time, rngState), `locations`, `npcs`, `shops`, `factions`, `creatures`, `players`, `events` (journal append-only, indexé par monde et jour).
- Écritures transactionnelles par action ; instantanés périodiques (`GameState` complet) pour reprise rapide.
- Migrations pilotées par `schemaVersion`.

### Étape 3 — Tick du monde côté serveur
- Le **temps** devient global : horloge serveur (ex. 1 jour de jeu = N minutes réelles) au lieu d'être avancé par les actions d'un seul joueur. Les coûts en heures deviennent des **durées d'occupation** du personnage.
- `world` tick exécuté par un ordonnanceur ; ses événements sont diffusés à tous.

### Étape 4 — Diffusion ciblée
- **Intérêt par lieu** : un client reçoit les événements de son lieu, de son joueur et les événements globaux (`world_event_triggered`, `day_started`, `faction_influence_changed`).
- Les données privées (inventaire, or, souvenirs des PNJ à son sujet) ne sont envoyées qu'au joueur concerné.

### Étape 5 — Anti-triche
- Le client n'envoie **que des intentions** ; toute validation est serveur (or, stock, position, cooldowns comme `lastTalk`, énergie).
- Le serveur détient l'état RNG ; les probabilités affichées côté client sont indicatives.
- Limites de débit par joueur, journal d'audit (événements), détection d'anomalies (gains d'or anormaux).

### Étape 6 — Conflits et concurrence
- Actions **sérialisées par monde** (ou par zone) : deux joueurs achetant le dernier objet → le premier traité gagne, le second reçoit une erreur (`error`) propre.
- Ressources partagées (stocks, or des boutiques, créatures) : versionnage optimiste ou verrou par entité.
- Combat : une créature engagée est **réservée** (`CombatState.creatureUid`) ; **Futur** : combats à plusieurs.

### Étape 7 — Zones et instances
- Découpage naturel par **région** (`regionId`) puis par **lieu** : chaque zone peut tourner sur un processus distinct, avec transfert du joueur lors d'un `move` inter-zones.
- Instances privées possibles (crypte d'Esteral, donjons) pour le contenu scénarisé.

## 7. Ce qu'il reste à faire

| Sujet | État MVP | À faire |
|---|---|---|
| Temps | Avancé par les actions du joueur local | Horloge globale serveur, occupation du personnage. |
| Ids dynamiques | Compteur `meta.nextId` | UUID serveur. |
| `groundItems` | Adressés par index | Ids d'objets au sol. |
| Opinions / souvenirs | Déjà par `playerId` | Commérages et vengeance multi-joueurs, limites de taille. |
| Boutiques | `ownerPlayerId` prévu | Gestion concurrente, revenus, transferts. |
| Économie | Indices partagés | Anti-manipulation (plusieurs joueurs saturant un marché), inflation. |
| Événements | Journal local tronqué | Journal serveur complet, pagination, relecture. |
| Comptes | — | Authentification, personnages multiples par compte. |
| Interactions joueur-joueur | — | Échange, commerce, groupe, duel, chat. |
| Sauvegarde | `localStorage` | Adaptateur serveur + import d'une sauvegarde solo (optionnel). |
| Tests | Déterminisme | Tests de rejouabilité serveur (graine + actions ⇒ même hash). |
