# UI / UX — PC et tablette

Code : `src/components/` (React), `src/styles/` (CSS responsive). L'UI **lit** l'état via le store (`useSyncExternalStore`) et **n'écrit jamais** l'état : elle envoie des actions (`dispatch`).

## 1. Principes

1. **Simple en apparence, profond sur demande.** L'écran principal montre le lieu et les actions possibles ; les détails (formules, relations, usages d'un objet) sont à un toucher de distance, jamais imposés.
2. **Aucune interaction ne dépend du survol.** Pas d'info exclusive dans un `:hover` ni un `title` : tout détail s'ouvre par un appui (panneau, fiche, feuille du bas). Le survol n'est qu'un bonus visuel sur PC.
3. **Une action = un bouton**, libellé par un verbe (« Récolter », « Voler », « Se reposer »), avec son **coût** (heures, énergie, or) et sa **chance de réussite** quand il y a un jet.
4. **Actions contextuelles** : seules les actions possibles dans le lieu courant sont proposées ; une action impossible est désactivée avec la **raison** (« Il vous faut une pioche », « Station requise : forge »).
5. **Le journal raconte.** Chaque événement produit une phrase française, colorée selon le ton (`info`, `success`, `warning`, `danger`).
6. **Pas de punition par l'interface** : confirmations uniquement pour les actions irréversibles ou risquées (voler, menacer, insulter, vendre un objet unique, écraser une sauvegarde).
7. **Lisibilité avant décoration.** Contraste AA minimum, texte de base ≥ 16 px, chiffres alignés, icônes toujours accompagnées d'un libellé.

## 2. Structure des écrans

| Écran / onglet | Contenu |
|---|---|
| **Création** | Étapes : nom → peuple → origine → traits (2) → stats (5 points, bouton « Aléatoire »). Aperçu en direct des stats finales, de l'or, des objets, des métiers et des lieux de départ possibles. |
| **Lieu** (accueil) | Nom, description, jour/heure, prospérité/danger/sécurité (jauges), PNJ présents, boutiques, ressources récoltables (stock), créatures, objets au sol, actions (récolter, travailler, se reposer, artisanat si station). |
| **Carte** | Lieux positionnés (`map.x/y`), connexions avec durée et danger, lieu courant, lieux voisins cliquables avec risque d'embuscade estimé. |
| **Inventaire** | Objets groupés par catégorie, poids / charge max, objets volés marqués, équipement (arme, armure, bijou), actions : utiliser, équiper, déposer. Fiche d'objet avec `itemUsage()` : fabriqué par, sert à, se récolte à, se trouve sur, vendu à. |
| **Artisanat** | Recettes des métiers connus, filtrées par « faisable ici / manque X » ; entrées possédées/requises, outils, station, heures, énergie, chance. |
| **Personnage** | Stats (base + bonus), dérivées, niveau/XP, points à dépenser, traits, origine, réputation (locale, factions, notoriété), faction. |
| **Métiers** | Métiers appris (niveau, XP, prochain palier), métiers apprenables ici (maître présent, coût, condition d'opinion). |
| **Journal** | Événements récents narrés, rumeurs, filtres par type. |
| **Dialogue PNJ** | Portrait/nom/titre, palier d'opinion, réplique, options (discuter, rumeurs, flatter, menacer, insulter, aider, options spéciales débloquées par tag), souvenirs connus du joueur. |
| **Boutique** | Deux colonnes Acheter / Vendre, prix calculés, or de la boutique, quantité, indication « receleur ». |
| **Combat** | Créature (PV, forces/faiblesses connues), PV/énergie du joueur, boutons Attaquer / Attaque puissante / Utiliser un objet / Fuir avec leurs chances, journal du combat. |

## 3. Layout responsive

| Largeur | Navigation | Disposition |
|---|---|---|
| < 768 px (mobile) | **Barre d'onglets en bas**, 5 onglets principaux + « Plus » | Une colonne ; dialogues, boutique et fiches en feuille plein écran. |
| 768–1199 px (tablette) | **Barre d'onglets en bas** | Une colonne principale + panneau secondaire repliable (journal) en paysage. |
| ≥ 1200 px (PC) | **Barre latérale** à gauche | Deux ou trois colonnes : navigation, contenu principal, journal permanent à droite. |

- Les zones d'action restent dans la **moitié basse** de l'écran sur tablette (atteignables au pouce).
- Pas de défilement horizontal, sauf dans les tableaux de données (encyclopédie).
- Respect des zones sûres (`env(safe-area-inset-*)`) sur tablette et mobile.

## 4. Tactile

- **Cibles ≥ 44 × 44 px**, espacées d'au moins 8 px.
- Aucun geste obligatoire (glisser, appui long) : chaque geste a un bouton équivalent.
- Retour immédiat à l'appui (état `:active`, désactivation pendant le traitement).
- Quantités via boutons − / + et « Max », pas de champ de saisie obligatoire.

## 5. Clavier et accessibilité (PC)

- Navigation au clavier complète (tabulation, `Entrée`, `Échap` pour fermer).
- Raccourcis optionnels (1–9 pour les onglets).
- Libellés ARIA sur les icônes, rôles sémantiques (`button`, `dialog`, `tablist`), focus visible.
- Pas d'information portée par la couleur seule (icône ou texte en plus : ✓, ⚠, « volé »).
- Respect de `prefers-reduced-motion`.

## 6. Rendre la profondeur accessible

- **Chances affichées** avant chaque jet ; détail de la formule dans un panneau « Pourquoi ? » (stat, niveau, difficulté, bonus).
- **Prix expliqués** : prix de base, marché local, événement, remise.
- **Opinion expliquée** : palier + derniers souvenirs (« Vous a vu voler — jour 4 »).
- **Encyclopédie** générée depuis le contenu (items, métiers, lieux, créatures) : aucune donnée recopiée à la main.
- **Rumeurs** comme guide implicite : elles pointent les opportunités (troll, foire, fièvre).

## 7. Performance et robustesse

- Rendu uniquement des vues actives ; journal tronqué.
- Sauvegarde automatique silencieuse ; indicateur discret.
- Fonctionne hors ligne une fois chargé (pas d'appel réseau dans le MVP).

## 8. Futur

- Illustrations des lieux et portraits, icônes d'items.
- Tutoriel contextuel (premières actions guidées selon l'origine).
- Mode sombre / clair, taille de texte réglable.
- Notifications de tick (« Pendant la nuit : un loup est apparu à la ferme »).
