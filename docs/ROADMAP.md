# Feuille de route

Chaque version reste **jouable** et **rétrocompatible** avec les sauvegardes précédentes (migrations `schemaVersion`). Tout ce qui suit la 0.1 est **Futur**.

## 0.1 — MVP solo (livré)

Voir [MVP.md](MVP.md).

- Contenu du Val de Brume : 14 lieux, 19 PNJ, 20 métiers, 158 items, 71 recettes, 18 créatures, 10 factions, 14 événements.
- Moteur pur et déterministe (`applyAction`), 22 actions, tick quotidien du monde.
- Économie locale, réputation, mémoire des PNJ, combat au tour par tour.
- UI responsive PC/tablette, sauvegarde locale (3 emplacements + autosave).
- Tests : validation du contenu, moteur.

## 0.2 — Monde visuel : 2.5D puis 3D (prochaine étape)

Objectif : quitter le style « idle » (menus et boutons de texte) pour un monde que l'on parcourt avec son personnage.

- Rendu : **Three.js via @react-three/fiber + @react-three/drei**, caméra orthographique isométrique (2.5D) au départ, passage en perspective 3D plus tard sans changer de moteur. Modèles low-poly glTF libres (CC0), formes simples en attendant.
- Le moteur `src/game` reste la source de vérité ; le rendu est une couche d'affichage (`src/scene/`) qui lit l'état et envoie des actions.
- Temps réel côté client (déplacement fluide, animations, caméra) ; seules les décisions de jeu deviennent des actions. Position du joueur dans le lieu ajoutée à `PlayerState` (migration de sauvegarde).
- Lieux explorables décrits en données (taille, sol, décors, points d'intérêt : PNJ, récolte, stations, sorties).
- PNJ et créatures visibles et mobiles ; combat déclenché au contact.
- Contrôles : clic/toucher pour se déplacer et interagir, clavier sur PC, joystick virtuel sur tablette. Les panneaux actuels (sac, artisanat, dialogues, boutiques…) s'affichent par-dessus la scène.
- Premier jalon : un seul lieu (village de départ) jouable en 2.5D, puis extension aux 14 lieux.

Pourquoi ce choix : il garde la stack TypeScript/React et tout le moteur existant, tourne dans le navigateur sur PC et tablette (WebGL), et couvre 2.5D comme 3D. Un moteur séparé (Godot, Unity) imposerait de réécrire le moteur de jeu et les données.

## 0.3 — Contenu et quêtes

- **Quêtes à étapes** data-driven (`src/data/quests.ts`) : objectifs (apporter, tuer, visiter, fabriquer, parler), récompenses, conditions d'opinion/réputation.
- Donner un usage aux objets en attente : `relique_aube` (quête de Sœur Maëlis et de Sifflet), `cle_crypte` + `carte_tresor` (crypte d'Esteral, Osric), `lettre_scellee` (intrigue du Bailli), `lettre_recommandation`, `statuette_esteral`.
- Recettes pour les ressources sans usage : mithril, gemmes, os anciens, corne de démon, griffe et cœur de dragon, plumes, bois de cerf, lait (fromage).
- Parlementer / nourrir / observer les créatures (`interactions` déjà déclarées).
- Emplacement d'équipement `vetement` (robe d'arcaniste, vêtements fins utiles socialement).
- Items `learn_recipe` (recettes secrètes enseignées par les PNJ alliés).
- Nouveaux événements, rumeurs contextuelles, dialogues plus riches par PNJ.
- Encyclopédie in-game générée depuis `CONTENT` et `itemUsage()`.

## 0.4 — Gestion : boutiques, bandes, construction

- **Boutiques du joueur** : fixer les prix, choisir le stock, embaucher un PNJ, entrepôt.
- **Caravanes** : transport automatisé entre lieux avec escorte (Mercenaire) et risque d'embuscade.
- **Bandes** : recruter des PNJ (mercenaires Gor'Nak, voleurs de la Main Grise) pour des missions ; bande de brigands côté ombre.
- **Construction** : Charpentier niveau 8 « Bâtiments » ; maisons, ateliers, amélioration des lieux (prospérité, stations).
- Missions et rangs de faction ; salaire ; accès réservés.
- Justice étendue : prison, primes, avis de recherche.

## 0.5 — Backend et comptes

- Serveur autoritaire TypeScript réutilisant `src/game` (voir [MULTIPLAYER_READY_ARCHITECTURE.md](MULTIPLAYER_READY_ARCHITECTURE.md)).
- Comptes, authentification, personnages multiples, sauvegarde en ligne (adaptateur serveur de `StorageAdapter`).
- Base de données (état + journal d'événements), instantanés, migrations.
- Horloge de monde serveur ; tick planifié.
- Toujours **un joueur par monde** : on valide la chaîne client → serveur → événements.

## 0.6 — Multijoueur

- Plusieurs joueurs dans le même monde : diffusion d'événements par lieu, présence des autres joueurs.
- Commerce et échanges entre joueurs, chat local, groupes.
- Concurrence sur les ressources partagées (stocks, créatures, boutiques).
- Anti-triche, limites de débit, audit.

## 0.7+ — Monde étendu

- Nouvelles régions (`regionId`) : au-delà du Col des Crocs, outre-mer depuis Port-Salant.
- Saisons et météo (récoltes, routes), cycle jour/nuit (PNJ nocturnes, Cour Nocturne).
- Guerres de factions pilotées par la simulation et les joueurs.
- Donjons instanciés (crypte d'Esteral), boss coopératifs (Vharox).
- Mods : chargement de contenu JSON externe dans le registre `CONTENT`.

## Transverse (toutes versions)

- Accessibilité, performances tablette, tutoriel contextuel.
- Illustrations, sons, musique.
- Équilibrage piloté par la télémétrie (courbes d'or, XP, taux de réussite).
- Tests de rejouabilité (graine + actions ⇒ même état).
