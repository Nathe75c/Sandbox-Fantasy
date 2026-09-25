# Game Design

Ce document décrit **comment on joue** : les boucles de jeu, les piliers traduits en mécaniques, et les styles de vie possibles avec le contenu actuel. Les formules exactes sont dans [SYSTEMS.md](SYSTEMS.md) et les documents thématiques.

## 1. Principes directeurs

1. **Une action = un bouton = un résultat lisible.** Chaque action coûte du **temps** (heures) et souvent de l'**énergie**, et produit des événements racontés en français dans le journal.
2. **Probabilités visibles.** Tout jet affiche sa chance de réussite (ex. « Voler : 37 % »). Le joueur prend des risques en connaissance de cause.
3. **Tout est relié.** Récolter épuise un stock, vendre fait baisser un prix, voler crée un souvenir, tuer un loup rend la ferme plus sûre et plaît à la Couronne.
4. **Aucun choix mort.** Chaque métier, stat et trait sert dans au moins deux systèmes.
5. **Échec intéressant.** Rater une recette coûte la moitié des ingrédients ; être pris en train de voler crée une histoire (souvenir, notoriété) ; perdre un combat vous réveille au Temple de l'Aube, plus pauvre.

## 2. Boucles de jeu

### Boucle « minute » (une action)

```
Choisir une action ──► voir coût (h, énergie) et chance ──► jet ──► résultat + événements ──► journal
       ▲                                                                                   │
       └─────────────────────────── nouvelle information (prix, opinion, stock) ◄───────────┘
```

Exemples : récolter 1 h, acheter, vendre, discuter avec un PNJ, frapper au combat, fabriquer une potion.

### Boucle « heure » (une session d'activité)

Un cycle de production ou d'expédition :

- **Artisan** : récolter/acheter les matières → rejoindre la station (forge, laboratoire…) → fabriquer → vendre là où c'est demandé.
- **Marchand** : repérer un prix bas (lieu producteur, événement) → acheter → voyager (risque d'embuscade) → revendre là où la catégorie est demandée.
- **Aventurier** : voyager vers une zone dangereuse → combattre/éviter → ramasser le butin → revendre ou alimenter une recette.

L'**énergie** (max = 10 + VIT + VOL) est la ressource qui rythme la session : on la recharge en mangeant (pain, ragoût, rations…) ou en se reposant 8 h.

### Boucle « jour »

Au changement de jour, le **tick du monde** s'exécute : ressources régénérées, boutiques réapprovisionnées, prix qui reviennent vers la normale, PNJ qui se déplacent, créatures qui apparaissent, événements du monde (≈ 45 % de chance par jour), commérages entre PNJ, revenus des boutiques du joueur. Le joueur découvre le matin un monde légèrement différent : nouvelle rumeur, prix modifié, loup à la ferme.

La journée type : se réveiller → consulter les rumeurs/le journal → choisir un objectif du jour (une commande de PNJ, un prix intéressant) → l'accomplir → se reposer (8 h, coût du lieu, risque de vol nocturne si le lieu n'est pas sûr).

### Boucle « long terme »

| Horizon | Objectifs |
|---|---|
| Quelques jours | Monter un métier au niveau 3 (nouvelles recettes), satisfaire les « désirs » d'un PNJ, acheter un meilleur outil/arme. |
| Une à deux semaines de jeu | Devenir **Apprécié** dans un lieu, **rejoindre une faction** (réputation ≥ 25), acheter une **boutique** (licence de commerce requise) pour un revenu quotidien, atteindre le niveau 5 d'un métier. |
| Long terme | Maîtriser plusieurs métiers (niveau 8+ : lames runiques, armure en écailles de dragon), devenir **Allié** de PNJ clés, faire basculer l'influence des factions, vaincre Vharox le Wyrm des Cols. |

## 3. Les piliers en mécaniques

| Pilier | Mécaniques du MVP |
|---|---|
| Liberté | 20 métiers cumulables, 22 types d'actions, 7 peuples jouables × 11 origines × 35 paires de traits (36 moins l’exclusion Robuste/Fragile). |
| Monde réactif | Mémoire des PNJ (17 types de souvenirs), commérages, opinion −100..100, réputation locale + faction, notoriété, prix par lieu et par item, stocks de ressources, prospérité/danger/sécurité des lieux, 14 événements du monde. |
| Simplicité | Actions contextuelles au lieu courant, probabilités affichées, journal narratif, sauvegarde auto. |
| Profondeur | 71 recettes sur 4 niveaux de transformation, 158 items, 15 boutiques avec or limité, arbitrage de prix, factions aux relations croisées. |
| Addiction | Récompenses fréquentes (XP de métier à chaque action), paliers de titres, butins aléatoires influencés par la chance, événements imprévus. |

## 4. Styles de vie possibles

Aucun style n'est une classe : ce sont des combinaisons de métiers, d'actions et de relations. Le tableau indique le point de départ naturel dans le contenu actuel.

| Style | Métiers | Origines idéales | Où / avec qui | Boucle principale | Tensions |
|---|---|---|---|---|---|
| **Marchand / caravanier** | Marchand (+ Écrivain pour les contrats) | Marchand né, Noble | Aldric (Port-Salant), Jorun (Route du Sel) | Acheter bas (lieu producteur ×0,8, événement), revendre haut (lieu demandeur ×1,25). Contrats de commerce pour Aldric (2 → 90 po). | Embuscades sur la Route du Sel, or limité des boutiques, indices de prix qui saturent. |
| **Bandit / voleur** | Voleur (+ Alchimiste pour le poison, Écrivain pour les faux papiers) | Gamin des rues | Sifflet (Bas-Quais), Nixi (receleuse du marais) | Voler PNJ et boutiques, revendre aux receleurs (70 %), grimper dans la Main Grise. | Notoriété (> 30 : amendes), souvenirs marquants, vengeance d'un PNJ haineux, Couronne hostile. |
| **Justicier / chasseur de primes** | Mercenaire, Garde | Ancien soldat, Tête brûlée | Hector, Varek | Tuer bandits et orcs pillards (Couronne +2, Guilde +2, Gor'Nak +3), protéger les routes (danger −2 par victoire). | Crocs Rouges hostiles, équipement coûteux. |
| **Artisan forgeron** | Mineur → Forgeron | Apprenti artisan, trait Mains habiles | Barda, Thrain, Grukka | Minerai → lingot → lame → épée ; vendre aux lieux qui demandent des armes (Bourg-du-Gué, Route du Sel, marais). | Charbon et minerai à récolter ou acheter, forge obligatoire. |
| **Artisan du cuir et du tissu** | Chasseur → Tanneur → Tailleur | Banni (chasseur), Mains habiles | Grukka, Ilyndra | Peaux → cuir → armures ; soie d'araignée → armure de soie (180 po). | Chasser les araignées géantes, Cercle sylvain sensible à la chasse. |
| **Explorateur** | Chasseur, Herboriste, Écrivain (cartes) | Vagabond (carte du Val), Mystique | Osric, Nixi, Comtesse | Visiter les lieux dangereux (col, ruines, marais), récolter les raretés (mandragore, cristaux), vendre les trouvailles (statuette d'Esteral à la Comtesse : 160 po). | Danger élevé, trajets longs, embuscades. |
| **Garde** | Garde | Ancien soldat | Hector (Bourg), Château | Travailler en garde (3 po/h, +1 réputation) réduit le danger local ; protéger les villageois. | Revenus modestes, Main Grise et Comtesse (`job:garde` −10) méfiantes. |
| **Noble / intrigant** | Écrivain, Marchand | Héritier noble (150 po, chevalière) | Bailli Orson, Aldric, Comtesse Isaure | Options de dialogue `noble`, lettres de recommandation, achat de boutiques, influence. | Mal vu des pauvres (Pivoine, Jehan, Sifflet). |
| **Mage (arcaniste)** | Arcaniste (+ Mineur pour les cristaux) | Mystique errant, Érudit, trait Touché par l'arcane | Comtesse Isaure (maître), grimoire élémentaire (livre) | Cristal brut → cristal taillé → focus, talismans, anneaux, lame runique (420 po). Autel obligatoire (Temple, forêt, ruines). | Ingrédients rares (cristal élémentaire, ectoplasme), méfiance du Temple. |
| **Alchimiste** | Herboriste → Alchimiste | Érudit, trait Fragile mais vif d'esprit | Mirelle, Nixi | Herbes → extraits → potions ; élixir de régénération (sang de troll) ; potion noire (illégale). | Fioles à acheter, laboratoire, poisons illégaux. |
| **Guérisseur** | Herboriste, Guérisseur | Mystique, Érudit | Sœur Maëlis | Bandages, baumes, travail au Temple (4 po/h, +1 réputation) ; très rentable lors de la *Fièvre des marais* (remèdes ×1,8). | Revenus moyens, dépend des herbes. |
| **Aubergiste / artiste** | Tavernier, Cuisinier | Artiste itinérant | Odile, Pivoine | Brasser bière et hydromel, cuisiner, animer la taverne, collecter les rumeurs ; acheter le Comptoir du Sanglier Borgne (900 po). | Dépend des fermiers ; revenu régulier mais plafonné. |
| **Fermier / cuisinier** | Fermier, Cuisinier, Pêcheur | Enfant de fermier | Jehan Tillac, Pivoine | Blé → farine → pain ; festins de luxe (55 po) ; protéger la ferme des loups. | Événements *Disette*/*Belle récolte*, pillards. |
| **Ami des marges** | Mercenaire, Chasseur | Banni, orc/gobelin/homme-bête | Varek, Grukka, Nixi | Honneur du clan Gor'Nak, commerce avec la Confrérie. | Préjugés en ville (Hector : `race:orc` −10). |

## 5. Première heure type

1. **Création** (≈ 1 min) : nom, peuple, origine, 2 traits, 5 points (ou « aléatoire »). Le lieu de départ est tiré au sort parmi ceux de l'origine (la chance favorise les meilleurs).
2. **Découverte** : l'écran du lieu montre PNJ présents, boutiques, ressources, créatures, connexions. Le journal raconte l'arrivée.
3. **Premier objectif proposé par le contenu** : un PNJ dit ce qu'il veut (ex. Jehan Tillac veut 2 fourrures de loup contre 25 po), une rumeur signale une opportunité.
4. **Première boucle** : récolter/travailler → vendre → acheter un outil → apprendre un métier auprès d'un maître.
5. **Premier imprévu** : embuscade en voyage, événement du monde, PNJ qui a entendu parler de vous.

## 6. Ce qui rend le jeu « rejouable »

- **Origine + peuple + traits** changent le lieu de départ, l'or, les objets, les métiers, la réputation et l'accueil de chaque PNJ (tags).
- **RNG seedé** : chaque monde a sa graine ; événements, créatures et prix divergent d'une partie à l'autre.
- **Monde persistant et cumulatif** : les choix s'additionnent (souvenirs, réputation, prospérité).
