# Progression

Le personnage progresse sur **cinq axes indépendants** : niveau de personnage, métiers, équipement, richesse/possessions, relations (opinion, réputation, faction). Aucun n'est obligatoire : on peut « gagner » en devenant riche, respecté, redouté ou maître artisan.

## 1. Niveau de personnage

- XP globale gagnée par les actions notables (victoires contre les créatures : `xp` de la créature, de 8 pour un cerf à 500 pour le Wyrm ; autres actions selon le moteur).
- Passage au niveau suivant : **100 × niveau actuel** d'XP.
- À chaque niveau : **+1 point de stat** (`statPoints`, dépensé via `spend_stat_point`) et **soins complets**.

| Niveau → suivant | 1→2 | 2→3 | 3→4 | 4→5 | 5→6 | 9→10 |
|---|---|---|---|---|---|---|
| XP requise | 100 | 200 | 300 | 400 | 500 | 900 |
| XP cumulée pour atteindre le niveau suivant | 100 | 300 | 600 | 1 000 | 1 500 | 4 500 |

Repères : un loup rapporte 14 XP, un troll 60, une strige 60, le Wyrm 500.

## 2. Métiers

- Niveaux **1..10**, XP pour le niveau suivant = **30 × niveau²** (30, 120, 270, 480, 750, 1 080, 1 470, 1 920, 2 430 ; 8 550 au total).
- Gains d'XP : récolte, recette (`xp` = 10 + niveau × 6 par défaut), travail, combat (Chasseur pour les bêtes, Mercenaire pour les monstres).
- Multiplicateurs : **INT** (+3 %/point au-dessus de 5), **humain** (+10 %), **traits** (ex. Mains habiles +20 % pour 5 métiers d'artisanat, Touché par l'arcane +25 % Arcaniste), **origine** (Marchand né : Marchand +20 %).
- Effets du niveau :
  - accès aux **recettes** de niveau supérieur (niveaux 1 à 8 dans le contenu) ;
  - **réussite** des recettes (+5 points par niveau) ;
  - **quantité récoltée** : 1 + floor(niveau / 3) ;
  - **revenu du travail** : +10 % par niveau ;
  - Marchand : **−3 % par niveau** sur les prix ;
  - Voleur : **+5 points par niveau** au vol.
- Paliers de titres aux niveaux 1, 3, 5, 8 (ex. Forgeron : Apprenti → Forgeron → Maître forgeron → Forgeron légendaire). Voir [JOBS.md](JOBS.md).

### Rythme indicatif

Une recette de niveau 1 rapporte 16 XP : ≈ 2 réussites pour le niveau 2, ≈ 6 de plus pour le niveau 3 (en recettes de niveau 2 à 22 XP). Le niveau 5 (≈ 900 XP cumulés) demande quelques dizaines d'actions ; le niveau 8 (≈ 4 200 XP) est un objectif de long terme.

## 3. Statistiques

- Création : base 5 + peuple + origine + traits + 5 points libres.
- Ensuite : +1 point par niveau de personnage ; bornes 1..20 en base, 25 avec équipement et buffs.
- Buffs temporaires : nourriture et boissons (Bière CHA +1 3 h, Tarte aux baies CHN +1 8 h, Festin CHA +2 12 h, Vin elfique PER +2 8 h), potions (Potion de force FOR +3 6 h, Potion noire VOL +4 / FOR +2 12 h), livres (Almanach PER +1 24 h, Grimoire de l'ombre VOL +2 48 h).
- Bonus passifs d'équipement : Chevalière CHA +1, Bijou ancien CHA +2, Amulette de crocs PER +1, Anneau enchanté VOL +2, Armure de soie DIS +1.

## 4. Équipement (paliers)

| Palier | Arme (bonus de dégâts) | Armure | Bijou |
|---|---|---|---|
| Départ / médiocre | Couteau +2, Bâton de marche +2, Épée rouillée +3, Fronde +3 | — | — |
| Commun | Épée de fer +6, Lance de chasse +5, Arc court +5 | Armure de cuir 2 | Anneau de cuivre |
| Peu commun | Hache de guerre +9 (FOR 7), Épée d'acier +9 | Armure de fourrure 3, Cotte de mailles 5 (FOR 6) | Amulette de crocs, Bague d'argent, Talisman (armure +2) |
| Rare | Épée d'argent +9 (argent), Focus de cristal +7 (VOL 6, magie) | Armure de soie 4 (+DIS 1) | Anneau enchanté (VOL +2, dégâts +2), Bijou ancien |
| Épique / légendaire | Lame runique +13 (VOL 7 ; tranchant, magie, feu) | Armure en écailles de dragon 10 | — |

Le meilleur équipement se **fabrique** (ou se trouve sur les créatures) plutôt qu'il ne s'achète, ce qui relie la progression de combat à celle des métiers.

## 5. Richesse et possessions

- Or : 5 po (Gamin des rues) à 150 po (Héritier noble) au départ.
- Premiers achats structurants : outil de métier (6–20 po), carte du Val (12 po), apprentissage (10–40 po).
- Moyen terme : Licence de commerce (120 po) + boutique (400–900 po) → revenu quotidien.
- **Futur** : maisons, entrepôts, caravanes, employés.

## 6. Relations

- **Opinion** des PNJ : Neutre → Amical (meilleurs prix, enseignement −25 %) → Allié (cadeaux).
- **Réputation** : Neutre → Apprécié → Honoré ; adhésion à une faction à 25.
- Voir [NPCS.md](NPCS.md) et [REPUTATION.md](REPUTATION.md).

## 7. Objectifs longs (exemples)

| Objectif | Ce qu'il faut |
|---|---|
| Forger une épée d'argent (le rêve de Barda) | Forgeron 5, minerai d'argent (Mines, difficulté 40), lame d'acier, cuir. |
| Lame runique | Forgeron (épée d'acier) + Arcaniste 6 + cristal élémentaire (élémentaire de pierre) + essence magique, autel. |
| Armure en écailles de dragon | Vaincre Vharox (événement rare, jour ≥ 10) + Forgeron 8 + Tanneur 3 (cuir épais). |
| Prince marchand | Marchand 8, boutiques, réputation Guilde Honoré. |
| Maître de la Main Grise | Voleur 8, Main Grise Honoré, notoriété maîtrisée. |
| Ami-du-Clan (Thrain) | Opinion Allié de Thrain : hydromel, os de troll, commerce. |
