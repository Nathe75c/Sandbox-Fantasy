# Périmètre du MVP (version 0.1)

Le MVP est un **jeu solo complet et jouable**, sur navigateur PC et tablette, avec sauvegarde locale. Il pose toutes les fondations (contenu data-driven, moteur pur et déterministe, état sérialisable) pour évoluer vers le multijoueur sans réécriture.

## 1. Contenu livré (`src/data/`)

| Type | Nombre | Fichier |
|---|---|---|
| Statistiques | 9 | `stats.ts` |
| Traits | 9 | `traits.ts` |
| Origines | 11 | `traits.ts` |
| Peuples (dont 7 jouables) | 11 | `races.ts` |
| Factions | 10 | `factions.ts` |
| Métiers | 20 | `jobs.ts` |
| Items | 158 (22 catégories, 6 raretés) | `items.ts` |
| Recettes | 71 | `recipes.ts` |
| Créatures (dont 1 légendaire) | 18 | `creatures.ts` |
| Lieux (région Val de Brume) | 14 | `locations.ts` |
| Boutiques | 15 (dont 2 receleurs, 4 achetables) | dans `locations.ts` |
| PNJ nommés | 19 | `npcs.ts` |
| Événements du monde | 14 | `events.ts` |

Le tout est vérifié par `validate.ts` (références croisées) et `content.test.ts` (aucune référence cassée, chaque ingrédient de recette a une source, volume minimal de contenu).

## 2. Fonctionnalités jouables

### Personnage
- Création : nom, 7 peuples jouables, 11 origines, 2 traits (avec exclusions), 5 points libres **ou** bouton aléatoire.
- Lieu de départ tiré parmi ceux de l'origine, pondéré par la chance.
- 9 stats (base 5, bornes 1..20, jusqu'à 25 avec bonus), dérivées (PV, énergie, charge).
- Niveau de personnage (XP globale) → points de stat à dépenser, soins complets.
- Équipement : arme, armure, bijou (bonus passifs).

### Actions (22 types, `src/types/actions.ts`)

| Domaine | Actions |
|---|---|
| Personnage | `create_character`, `spend_stat_point`, `rest` |
| Déplacement | `move` (embuscades possibles) |
| Économie | `buy`, `sell`, `buy_shop` |
| Artisanat / récolte | `gather`, `craft` |
| Métiers | `learn_job`, `work` |
| Social | `talk` (discuter, rumeurs, flatter, menacer, insulter, aider, options spéciales), `join_faction` |
| Crime | `steal` (PNJ ou boutique) |
| Combat | `engage`, `combat_attack` (normale ou puissante), `combat_flee`, `sneak_past` |
| Objets | `use_item`, `equip`, `drop_item`, `pick_up` |

### Systèmes
- Temps en heures, tick quotidien du monde.
- Récolte avec stocks locaux régénérés chaque jour (surexploitation = pénurie).
- Artisanat avec métier, niveau, outils, station, jet, échec coûteux.
- 20 métiers cumulables, niveaux 1..10, apprentissage libre / maître / livre, action « Travailler ».
- Économie : prix par lieu et par item, offre/demande, remises (charisme, marchand, opinion, réputation), stocks et or des boutiques, receleurs, objets volés, achat de boutiques et revenu quotidien.
- Réputation locale et par faction, paliers, notoriété criminelle, adhésion à une faction.
- PNJ : opinion, 17 types de souvenirs, commérages, déplacements selon habitudes et humeur, économie propre, vengeance / reconnaissance.
- Combat au tour par tour contre les créatures (toucher, dégâts, faiblesses/résistances, attaque puissante, fuite, évitement, embuscades).
- Monde vivant : apparition de créatures, évolution prospérité/danger/sécurité, influence des factions, 14 événements pondérés et conditionnels.
- Narration : chaque événement produit un texte français dans le journal.

### Technique
- TypeScript + React + Vite, sans dépendance de gestion d'état (store maison + `useSyncExternalStore`).
- Moteur pur : `applyAction(state, action) → { state, events, error? }`.
- RNG seedé (mulberry32) stocké dans l'état → parties reproductibles.
- Sauvegarde : 3 emplacements + autosave dans `localStorage`, `schemaVersion` et migrations.
- Interface responsive : barre d'onglets en bas (tablette/mobile), latérale (PC), cibles tactiles ≥ 44 px.
- Tests Vitest (contenu ; moteur au fil de l'écriture).

## 3. Hors MVP (prévu, voir [ROADMAP.md](ROADMAP.md))

| Domaine | Hors MVP |
|---|---|
| Quêtes | Quêtes scénarisées à étapes, quêtes de faction, chaîne de la relique de l'Aube, crypte d'Esteral (`cle_crypte`, `carte_tresor`, `lettre_scellee` existent mais n'ont pas encore d'usage mécanique). |
| Social | Arbres de dialogue écrits, romances, compagnons, recrutement, parlementer avec les créatures intelligentes (`parlementer`, `nourrir`, `observer` sont déclarés dans les données mais non joués). |
| Gestion | Employés dans les boutiques du joueur, fixation des prix, entrepôts, caravanes automatisées, bandes (bandits/mercenaires). |
| Construction | Bâtiments, maisons, amélioration des lieux (le charpentier niveau 8 l'annonce comme « futur »). |
| Combat | Combats contre des PNJ humanoïdes nommés (les fiches `combat` d'Hector, Jorun, Varek, Thrain existent), combats de groupe, compétences actives, sorts. |
| Monde | Autres régions (`regionId` prévu), saisons, météo, cycle jour/nuit influant sur les PNJ. |
| Économie | Crédit, dettes, taxes, impôts du bailli, métier de banquier. |
| Multijoueur | Serveur autoritaire, comptes, synchronisation, commerce entre joueurs (voir [MULTIPLAYER_READY_ARCHITECTURE.md](MULTIPLAYER_READY_ARCHITECTURE.md)). |
| Contenu | Livres/recettes à apprendre (`learn_recipe` existe dans les types mais aucun item ne l'utilise), métiers supplémentaires (banquier, bâtisseur, dresseur…). |
| Confort | Son, musique, illustrations, tutoriel guidé, succès, statistiques de fin de partie, localisation autre que le français. |

## 4. Définition de « terminé » pour le MVP

- Une partie peut être créée, jouée sur 30+ jours de jeu, sauvegardée, rechargée et continuée sans erreur.
- Chaque action du tableau ci-dessus est accessible depuis l'interface sur PC **et** au doigt sur tablette.
- `npm test` passe (validation du contenu + tests du moteur).
- Rejouer la même suite d'actions depuis la même graine donne exactement le même état (déterminisme).
