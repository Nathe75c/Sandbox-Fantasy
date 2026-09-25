# Vision — Sandbox Fantasy

## Le jeu en une phrase

Un **bac à sable médiéval-fantastique vivant** où l'on choisit librement qui devenir — marchand, bandit, forgeronne, chasseur de monstres, mage, noble intrigant — dans une vallée dont les habitants **se souviennent** de ce que l'on fait et dont l'économie **réagit** à nos actes.

## Promesse au joueur

- **« Je fais ce que je veux, et le monde s'en rend compte. »** Voler Barda la forgeronne, c'est un souvenir qu'elle garde, une rumeur qui circule au Bourg, une réputation qui baisse auprès de la Couronne et une Main Grise qui vous sourit.
- **« Je comprends tout en dix secondes, je découvre encore des choses après dix heures. »** Une action = un bouton, un résultat lisible en français. La profondeur vient des interactions entre systèmes, pas de la complexité des commandes.
- **« Encore une journée. »** Chaque journée de jeu apporte un petit objectif (une recette, un prix intéressant, une commande de PNJ) et une surprise possible (un événement du monde, un monstre, une rumeur).

## Piliers

| Pilier | Ce que cela signifie concrètement |
|---|---|
| **Liberté de vie** | 20 métiers cumulables, aucune classe. Toutes les activités (commerce, crime, artisanat, combat, service) rapportent et progressent. |
| **Monde qui réagit** | Mémoire et opinion des PNJ, réputation locale et par faction, notoriété criminelle, prix dynamiques, stocks qui s'épuisent, lieux qui prospèrent ou déclinent. |
| **Simple à jouer** | Une interface à onglets, des boutons clairs, des probabilités affichées, un journal narratif. Aucun survol requis : tout fonctionne au doigt. |
| **Profond dans les systèmes** | Chaînes de fabrication (minerai → lingot → lame → épée), arbitrage entre lieux, factions en conflit, événements qui changent l'économie. |
| **Addictif, pas punitif** | Boucles courtes (1 action = 1 récompense), objectifs moyens (niveau de métier, commande), long terme (boutique, faction, légendes). La défaite coûte (or, temps) mais ne détruit pas la partie. |
| **Aucune race n'est mauvaise par nature** | Orcs d'honneur et orcs pillards, gobelins marchands et gobelins sauvages, vampires érudits et striges bestiales. On juge les actes, pas le sang. |

## Univers : le Val de Brume

Une vallée entre montagnes et mer : un bourg de fermiers, un port marchand et ses bas-quartiers, un château de seigneur, une forêt elfique, un campement orc, des mines naines, un marais gobelin, les ruines d'un empire de mages habitées par une cour vampirique, et un col où dort un dragon. **14 lieux, 10 factions, 19 PNJ nommés, 18 créatures** (voir [WORLD.md](WORLD.md)).

Ton : fantasy chaleureuse et humaine, avec des zones grises morales. Les dialogues sont courts, imagés, en français.

## Plateformes et public

- **PC (navigateur)** et **tablette** en priorité, mobile en bonus. Même interface responsive.
- Public : joueurs de jeux de gestion/RPG « cosy mais profonds » (inspirations : Kenshi, Mount & Blade, Stardew Valley, les MUD textuels, Dwarf Fortress en beaucoup plus accessible).
- Sessions de 10 minutes à plusieurs heures. Sauvegarde automatique.

## Ambition technique

- **Data-driven** : tout le contenu (items, métiers, recettes, PNJ, lieux, créatures, événements) est décrit dans `src/data/`, validé automatiquement. Ajouter un objet = ajouter une ligne.
- **Modulaire** : un système = un fichier, des fonctions pures, un état sérialisable.
- **Prêt pour le multijoueur** : actions → événements, RNG déterministe, identifiants stables, état séparé du contenu. Le MVP est solo avec sauvegarde locale ; le même moteur tournera demain sur un serveur autoritaire (voir [MULTIPLAYER_READY_ARCHITECTURE.md](MULTIPLAYER_READY_ARCHITECTURE.md)).

## Ce que le jeu n'est pas

- Pas un jeu d'action en temps réel : tout est au tour par tour / à l'action, avec un temps de jeu en heures.
- Pas une histoire linéaire : il n'y a pas de quête principale obligatoire. Les « quêtes » sont des désirs de PNJ, des événements et des objectifs que le joueur se fixe.
- Pas un jeu punitif : pas de mort définitive dans le MVP.

## Critères de réussite

1. Un nouveau joueur crée son personnage et accomplit une action utile en **moins de 2 minutes**.
2. Après 1 heure, il a **changé d'avis au moins une fois** sur ce qu'il veut faire de son personnage.
3. Deux parties avec des origines différentes produisent des **histoires différentes**.
4. Le monde a visiblement **changé** après 30 jours de jeu (prix, prospérité, opinions, créatures).
