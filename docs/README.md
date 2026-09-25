# Documentation — Sandbox Fantasy

Documentation de conception du jeu. Les chiffres et identifiants proviennent du contenu réel (`src/data/`) ; les idées non implémentées sont marquées **Futur**.

| Fichier | Contenu |
|---|---|
| [HANDOVER.md](HANDOVER.md) | **À lire en premier** : reprise en local, architecture en une page, décisions, limites connues, prochaines étapes, ordre de lecture. |
| [VISION.md](VISION.md) | Promesse, piliers, univers, public, ce que le jeu n'est pas. |
| [GAME_DESIGN.md](GAME_DESIGN.md) | Boucles de jeu (minute, heure, jour, long terme), styles de vie possibles, première heure. |
| [MVP.md](MVP.md) | Périmètre de la version 0.1 : contenu, actions, systèmes livrés, et ce qui est hors MVP. |
| [SYSTEMS.md](SYSTEMS.md) | Architecture du moteur, chaque système et ses formules, ordre du tick quotidien, matrice d'interactions. |
| [CONTENT_STRUCTURE.md](CONTENT_STRUCTURE.md) | Organisation de `src/data`, `CONTENT`, `itemUsage()`, `validate.ts`, pas à pas pour ajouter du contenu. |
| [STATS_AND_ATTRIBUTES.md](STATS_AND_ATTRIBUTES.md) | 9 statistiques et leurs fusions, dérivées, jets, 9 traits, 11 origines. |
| [JOBS.md](JOBS.md) | 20 métiers : règles, tableau, graphe des dépendances, fiche détaillée par métier. |
| [ITEMS.md](ITEMS.md) | Champs, raretés, catégories, liste complète des 158 items. |
| [CRAFTING.md](CRAFTING.md) | Règles d'artisanat, stations par lieu, chaînes complètes, 71 recettes. |
| [NPCS.md](NPCS.md) | Modèle PNJ, opinion, mémoire, commérages, dialogues, fiches des 19 PNJ. |
| [RACES_AND_CREATURES.md](RACES_AND_CREATURES.md) | 11 peuples, 18 créatures (stats, butins, habitats), philosophie « aucune race n'est mauvaise ». |
| [WORLD.md](WORLD.md) | Le Val de Brume : 14 lieux, connexions, 10 factions, évolution du monde, 14 événements. |
| [ECONOMY.md](ECONOMY.md) | Formules de prix, marchés par lieu, boutiques, négoce, sources et puits d'or. |
| [REPUTATION.md](REPUTATION.md) | Réputation locale et de faction, paliers, notoriété, adhésion, influence des factions. |
| [PROGRESSION.md](PROGRESSION.md) | Niveau de personnage, métiers, stats, paliers d'équipement, objectifs longs. |
| [UI_UX_PC_TABLET.md](UI_UX_PC_TABLET.md) | Principes d'interface, écrans, layout responsive, tactile, accessibilité. |
| [MULTIPLAYER_READY_ARCHITECTURE.md](MULTIPLAYER_READY_ARCHITECTURE.md) | Séparation statique/dynamique, actions → événements, déterminisme, plan de migration serveur. |
| [ROADMAP.md](ROADMAP.md) | Versions 0.1 → 0.6+ : contenu et quêtes, gestion, backend, multijoueur, monde étendu. |

Les tableaux de données (items, recettes, PNJ, lieux, créatures…) reflètent l'état de `src/data/` au moment de la rédaction ; en cas de doute, le code fait foi (`npm test` valide les références).
