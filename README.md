# Sandbox Fantasy

Jeu sandbox fantasy immersif, jouable sur **PC et tablette**, dans le navigateur.
Vous créez un personnage (peuple, origine, traits, statistiques), puis vivez librement dans le **Val de Brume** :
explorer, récolter, fabriquer, commercer, voler, discuter, combattre, apprendre des métiers, racheter une boutique,
rejoindre une faction... Le monde évolue seul chaque jour (prix, créatures, événements, PNJ qui voyagent, se souviennent et se vengent).

Le MVP est **solo avec sauvegarde locale**, mais l'architecture est pensée pour un futur **multijoueur en ligne**
(état sérialisable, identifiants uniques, actions centralisées, événements synchronisables, RNG déterministe).

## Démarrer

Prérequis : Node.js 20+ (testé avec Node 22).

```bash
npm install
npm run dev        # http://localhost:5173 (accessible aussi depuis une tablette du réseau local)
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Vérification TypeScript + build de production dans `dist/` |
| `npm run preview` | Sert le build de production |
| `npm test` | Tests (validation du contenu + moteur de jeu) |
| `npm run typecheck` | Vérification TypeScript seule |

## Ce que contient le MVP

- Création de personnage : 7 peuples jouables, 11 origines, 9 traits, 9 statistiques, lieu de départ tiré selon l'origine et la chance.
- 14 lieux reliés (village, ville portuaire, quartier pauvre, taverne, ferme, château, temple, forêt, mine, campement orc, route commerciale, marais, ruines, col dangereux).
- 19 PNJ avec personnalité, désirs, peurs, habitudes, **mémoire** et **opinion** du joueur ; ils voyagent et commèrent.
- 11 peuples/races, 18 créatures avec comportements, faiblesses et butins utiles à l'artisanat.
- 20 métiers cumulables, 158 items, 71 recettes en chaînes (minerai → lingot → lame → épée, peau → cuir → armure...).
- Économie dynamique (offre/demande locale, événements, réputation, charisme), vol et recel, boutiques achetables.
- Réputation par lieu et par faction (10 factions), notoriété criminelle.
- 14 événements du monde, rumeurs, évolution quotidienne des lieux et factions.
- Combat au tour par tour, sauvegarde automatique + 3 emplacements.

## Structure

```
docs/                 Conception : vision, systèmes, contenu, économie, multijoueur, roadmap...
src/
  types/              Types partagés : contenu statique, état dynamique, actions, événements
  data/               Contenu data-driven (stats, traits, jobs, items, recipes, npcs, races,
                      creatures, locations, events, factions) + registre + validation
  game/
    state/            État initial du monde, sélecteurs (valeurs dérivées)
    actions/          applyAction (point d'entrée unique, pur) + handlers par domaine
    systems/          RNG, jets, économie, réputation, mémoire PNJ, combat, monde, événements...
    save/             Sauvegardes versionnées + adaptateurs de stockage
    store.ts          Store sans framework (dispatch/subscribe)
  components/         Interface React (création, lieu, carte, sac, artisanat, métiers, PNJ, boutique, combat)
  styles/             CSS responsive PC/tablette
```

Voir [`docs/README.md`](docs/README.md) pour l'index de la documentation et
[`docs/MULTIPLAYER_READY_ARCHITECTURE.md`](docs/MULTIPLAYER_READY_ARCHITECTURE.md) pour la préparation au multijoueur.

## Ajouter du contenu

Tout le contenu est dans `src/data/*.ts`. Pour ajouter un item, une recette, un PNJ, un lieu ou une créature :
copiez une entrée existante, changez l'identifiant, puis lancez `npm test` — la validation signale toute référence cassée.
Détails pas à pas : [`docs/CONTENT_STRUCTURE.md`](docs/CONTENT_STRUCTURE.md).
