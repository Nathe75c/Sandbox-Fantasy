# Économie

Règles : `src/game/systems/economy`, `src/game/actions/economy`. Données : boutiques et marchés dans `src/data/locations.ts`, valeurs dans `src/data/items.ts`, événements dans `src/data/events.ts`.

## 1. Principes

- **Économie locale** : chaque lieu a ses propres **indices de prix** par item (`LocationState.priceIndex`), ses boutiques avec **stock et or limités**, ses **productions** et **demandes**.
- **Offre et demande** : vendre beaucoup d'un item à un endroit en fait baisser le prix ; en acheter le fait monter ; le marché se rééquilibre chaque jour.
- **Événements** : raids, disettes, foires, trolls… multiplient temporairement les prix.
- **Le joueur est un acteur** : il peut saturer un marché, créer une pénurie (surexploitation), voler un stock, posséder une boutique.

## 2. Prix d'achat

```
prix d'achat = valeur de base
             × indice local de l'item            (0,5 .. 2, défaut 1)
             × facteur de marché                  (×0,8 si le lieu PRODUIT la catégorie, ×1,25 s'il la DEMANDE)
             × multiplicateurs des événements actifs
             × (1 − remise)
```

**Remise** = somme de :

| Composante | Formule |
|---|---|
| Charisme | ±2 % par point autour de 5, bornée −10 % .. +20 % |
| Marchand | 3 % par niveau du métier Marchand |
| Opinion du boutiquier | opinion / 100 × 15 % (de −15 % à +15 %) |
| Réputation locale | réputation / 100 × 10 % (de −10 % à +10 %) |

Une remise négative est une **majoration** (PNJ méfiant, lieu où l'on est mal vu).

## 3. Prix de revente

- ≈ **50 %** du prix calculé de la même façon, les bonus (charisme, marchand, opinion, réputation) jouant **en faveur** du joueur.
- La boutique ne rachète que les **catégories** de `buysCategories` et dans la limite de **son or**.
- **Objets volés** : refusés par les boutiques honnêtes ; les **receleurs** (`fence`) les rachètent à **70 %** du prix de revente.
- **Objets illégaux** (`illegal`) : circuit des receleurs.
- Un PNJ **hostile** refuse de commercer.

## 4. Dynamique des prix

| Action | Effet sur l'indice local de l'item |
|---|---|
| Vendre 1 unité | −3 % (minimum 0,5) |
| Acheter 1 unité | +2 % (maximum 2) |
| Chaque jour | retour progressif vers 1 |

Vendre en masse au même endroit fait chuter l'indice jusqu'au plancher de 0,5 (≈ 17 ventes si la baisse de 3 % est additive, ≈ 23 si elle est multiplicative) : il vaut mieux répartir ses ventes entre lieux et jours.

## 5. Marchés par lieu

| Lieu | Produit (×0,8) | Demande (×1,25) |
|---|---|---|
| Bourg-du-Gué | ingredient, aliment | minerai, arme |
| Taverne du Sanglier Borgne | boisson | ingredient, aliment |
| Ferme des Tillac | ingredient, plante | outil |
| Port-Salant | marchandise, aliment | ressource_creature, minerai, bijou, objet_magique |
| Les Bas-Quais | marchandise | aliment, potion |
| Temple de l'Aube | potion, livre | plante |
| Château de Valcourt | armure | aliment, boisson, marchandise |
| Route du Sel | marchandise | aliment, potion, arme |
| Forêt de Sylvebrune | plante, materiau | outil, marchandise |
| Campement de Gor'Nak | ressource_animale, armure | boisson, potion, minerai |
| Mines de Karak-Dur | minerai, materiau, arme | aliment, boisson, materiau (⚠ `materiau` est à la fois produit et demandé) |
| Col des Crocs | — | — |
| Marais des Pendus | plante, ressource_creature | aliment, outil, arme |
| Ruines d'Esteral | objet_magique, livre | marchandise, bijou |

Routes commerciales naturelles :

- **Métal** : Mines de Karak-Dur (minerai ×0,8) → Bourg-du-Gué / Port-Salant / Gor'Nak (minerai ×1,25).
- **Nourriture** : Bourg-du-Gué et Ferme (×0,8) → Château, Mines, Bas-Quais, Route du Sel, Marais (×1,25).
- **Potions** : Temple (×0,8) → Bas-Quais, Route du Sel, Gor'Nak (×1,25).
- **Trophées de monstres** : Marais (×0,8) → Port-Salant (×1,25).
- **Luxe** : bijoux et marchandises vers Port-Salant, les Ruines (Comtesse, 1 200 po d'or) et le Château.

### Rentabilité du négoce

Acheter dans un lieu producteur (×0,8) et revendre dans un lieu demandeur (50 % × 1,25 = ×0,625) **perd de l'argent sans remise**. Avec une remise `d` appliquée dans les deux sens, le négoce devient rentable quand `0,625 × (1 + d) > 0,8 × (1 − d)`, soit **d > ≈ 12 %** (ex. Marchand niveau 3 + CHA 8). Les **événements** (foire ×1,3, raid ×1,25, disette ×1,6, fièvre ×1,8) créent les meilleures fenêtres. Pour les autres styles de vie, le profit vient de la **valeur ajoutée** : récolter ou fabriquer puis vendre.

Exemple : Épée de fer (45 po) — prix d'achat au Bourg-du-Gué (demande `arme`) ≈ 56 po ; revente là-bas ≈ 28 po. Fabriquée à partir de ≈ 22 po de matières, elle rapporte surtout à celui qui la forge.

## 6. Boutiques

| Boutique (id) | Lieu | Tenancier | Or initial | Rachète | Receleur | Prix d’achat |
|---|---|---|---|---|---|---|
| Forge de Barda (`forge_du_gue`) | Bourg-du-Gué | Barda Ferrebrune | 250 | minerai, materiau, arme, outil | — | — |
| Étal de Mère Pivoine (`marche_du_gue`) | Bourg-du-Gué | Mère Pivoine Boncœur | 150 | ingredient, aliment, plante, ressource_animale | — | 400 |
| Comptoir du Sanglier Borgne (`comptoir_sanglier`) | Taverne du Sanglier Borgne | Odile la Rousse | 180 | boisson, aliment, ingredient, plante | — | 900 |
| Comptoir de la Guilde (`comptoir_guilde`) | Port-Salant | Aldric Maréval | 800 | marchandise, bijou, vetement, document, carte, ressource_creature, objet_magique, livre, ressource_animale | — | — |
| Les Fioles de Mirelle (`echoppe_potions`) | Port-Salant | Mirelle Aubépine | 400 | plante, potion, ressource_creature, composant | — | — |
| Poissonnerie du quai (`poissonnerie`) | Port-Salant | — | 120 | ressource_animale, aliment | — | 500 |
| L’arrière-boutique de Sifflet (`receleur_quais`) | Les Bas-Quais | Sifflet | 350 | bijou, marchandise, arme, objet_magique, potion, document, vetement, livre | oui | — |
| Apothicairerie du Temple (`apothicaire_temple`) | Temple de l’Aube | Sœur Maëlis | 300 | plante, potion, livre, quete | — | — |
| Intendance du château (`intendance_valcourt`) | Château de Valcourt | Orson de Brèche | 1000 | arme, armure, aliment, marchandise, bijou | — | — |
| Relais des caravanes (`relais_caravanes`) | Route du Sel | Jorun Barbe-de-Sel | 300 | marchandise, aliment, ressource_animale, minerai, materiau | — | 700 |
| Troc du Cercle (`cercle_troc`) | Forêt de Sylvebrune | Ilyndra Feuillelune | 250 | plante, ressource_animale, objet_magique | — | — |
| Enclume de Grukka (`forge_gornak`) | Campement de Gor’Nak | Grukka Main-de-Fer | 300 | ressource_animale, ressource_creature, arme, armure, aliment | — | — |
| Halle des Marteaux (`halle_karak`) | Mines de Karak-Dur | Thrain Brisefer | 700 | minerai, materiau, arme, armure, ressource_creature, boisson, aliment | — | — |
| Comptoir de Nixi (`comptoir_confrerie`) | Marais des Pendus | Nixi Trois-Doigts | 300 | plante, ressource_creature, potion, marchandise, objet_magique | oui | — |
| Salon de la Comtesse (`salon_nocturne`) | Ruines d’Esteral | Isaure de Vaelmont | 1200 | bijou, livre, objet_magique, ressource_creature, marchandise | — | — |

- **Réassort quotidien** : selon la rareté des items (les communs reviennent vite, les rares lentement) et la **prospérité** du lieu.
- **Or** : se reconstitue chaque jour ; une boutique vidée par vos ventes ne peut plus acheter avant le lendemain.
- **Boutiques achetables** (`purchasePrice`) : Étal de Mère Pivoine (400 po), Poissonnerie du quai (500 po), Relais des caravanes (700 po), Comptoir du Sanglier Borgne (900 po). Il faut une **Licence de commerce** (120 po, vendue au Comptoir de la Guilde et à l'Intendance du château). Une boutique possédée (`ownerPlayerId`) rapporte un **revenu quotidien**.

## 7. Sources et puits d'or

| Sources | Puits |
|---|---|
| Vente d'objets récoltés, fabriqués, volés, lootés | Achats (outils, ingrédients, équipement, licences) |
| Travailler (2 à 5 po/h selon le métier) | Repos payant (0 à 10 po la nuit) |
| Butin en or des créatures (bandit 5–20, Wyrm 300–800) | Apprentissage des métiers (10 à 40 po) |
| Désirs des PNJ (`wants` : 10 à 180 po) | Achat de boutique (400 à 900 po) |
| Options spéciales (Odile +12 po, Comtesse +25 po) | Défaite (−20 % de l'or) |
| Menacer (or extorqué) | Amendes des gardes (notoriété > 30) |
| Revenus des boutiques possédées | Vol nocturne dans les lieux non sûrs |

## 8. Économie des PNJ

- Chaque PNJ a un **or** propre (de 20 po pour Osric à 2 000 po pour la Comtesse), qui évolue chaque jour ; un PNJ ruiné peut **changer de métier**.
- L'or des PNJ est la cible des vols de bourse et de la menace.

## 9. Futur

- Commandes de PNJ (fabriquer X pour Y jours), contrats de caravane avec escorte.
- Gestion avancée des boutiques du joueur : fixer les prix, embaucher, choisir le stock.
- Taxes du Bailli, crédit et dettes, banque de la Guilde.
- Marché entre joueurs (multijoueur).
