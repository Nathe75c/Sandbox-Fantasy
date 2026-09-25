# PNJ

Source : `src/data/npcs.ts` (19 PNJ, fiche **statique**), état dans `WorldState.npcs` (`src/types/state.ts`), règles dans `src/game/systems/npcMemory` et `src/game/actions/social`.

## 1. Modèle

### Fiche statique (`NpcDef`)

Identité (nom, titre, peuple, âge, métier, faction, statut social), personnalité (`personality`, `character`), motivations (`desires`, `fears`, `goals`), possessions initiales, relations avec d'autres PNJ, lieu d'attache et **habitudes** (lieux fréquentés pondérés + `travelChance` quotidienne), boutique, métiers enseignés (`teaches`), **désirs** (`wants` : objets à lui apporter contre récompense), **réactions aux tags** du joueur (`tagOpinions`), répliques par palier d'opinion (`lines`), rumeurs, **options spéciales** débloquées par tag, **perception** (difficulté à le voler / à le menacer), et parfois des stats de combat.

### État dynamique (`NpcState`)

| Champ | Rôle |
|---|---|
| `locationId` | Position actuelle (change avec les habitudes). |
| `gold` | Or courant (économie des PNJ, cible du vol). |
| `alive` | Vivant ou non. |
| `opinions[playerId]` | Opinion de chaque joueur, −100..100. |
| `memories[]` | Souvenirs (12 max). |
| `mood` | Humeur du jour −2..2 (colore dialogues et prix). |
| `jobId` | Métier courant (peut changer). |
| `fulfilledWants` | Désirs déjà satisfaits. |
| `lastTalk[playerId]` | Dernier jour de discussion (limite : 1 discussion/jour). |

## 2. Opinion

**Opinion initiale** envers un joueur = Σ `tagOpinions` correspondant aux tags du joueur + relation raciale (peuple du PNJ → peuple du joueur) / 4 + réputation du joueur auprès de la faction du PNJ / 2.

Exemple : un **orc banni** rencontre **Varek** : `banni` +15, `race:orc` +20, relation orc→orc (0) / 4, réputation Gor'Nak de départ +10 / 2 = **+40** (amical d'emblée). Le même personnage face à **Hector** : `banni` −15, `race:orc` −10, humain→orc −20 / 4 = −5, Couronne −15 / 2 = −7,5 → **≈ −37** (méfiant).

| Palier | Opinion | Effets |
|---|---|---|
| **Hostile** | < −50 | Refuse de commercer et d'enseigner ; répliques hostiles ; peut se venger (hommes de main). |
| **Méfiant** | −50 .. −16 | Prix moins bons, répliques froides. |
| **Neutre** | −15 .. 14 | Comportement par défaut. |
| **Amical** | 15 .. 49 | Meilleurs prix, enseignement −25 %, accès aux désirs/quêtes. |
| **Allié** | ≥ 50 | Meilleurs prix, confiance, cadeaux (reconnaissance). |

L'opinion influence : répliques (`lines`), **prix** (± opinion/100 × 15 % de remise), **enseignement**, **désirs** (`wants`), vengeance et récompenses.

## 3. Mémoire

Chaque interaction significative crée un **souvenir** (`NpcMemory`) : type, jour, **impact** sur l'opinion, texte, `lasting` (marquant), `hearsay` (ouï-dire).

| Type (`MemoryKind`) | Déclencheur typique | Sens |
|---|---|---|
| `rencontre` | Première rencontre | neutre |
| `commerce` | Achat / vente | + |
| `aide` | Apporter un objet désiré | + |
| `generosite` | Don, cadeau | + |
| `flatterie` | Flatter réussi | + |
| `protection` | Protéger le PNJ / son lieu | + |
| `sauvetage` | Sauver le PNJ | + (marquant) |
| `aide_ville` | Aider le lieu (danger réduit, travail de garde) | + |
| `creature_tuee` | Tuer une créature | selon le PNJ / la faction |
| `creature_protegee` | Épargner / protéger une créature | selon le PNJ / la faction |
| `insulte` | Insulter | − |
| `menace` | Menacer | − |
| `arnaque` | Tromper en affaires | − |
| `vol` | Vol de bourse surpris | − (marquant) |
| `vol_boutique` | Vol en boutique surpris | − (marquant) |
| `trahison` | Trahir | − (marquant) |
| `attaque_faction` | Attaquer un membre de sa faction | − |

- **12 souvenirs maximum** par PNJ ; les plus anciens non marquants sont oubliés, les **marquants** restent.
- **Commérages** (tick quotidien) : les PNJ présents dans le même lieu se transmettent leurs souvenirs **marquants** sous forme d'**ouï-dire** avec la **moitié de l'impact**. Voler Barda au Bourg finit par se savoir chez Pivoine et Hector.
- Les types de souvenirs servent aussi de « tags d'action » pour les factions (`likes` / `dislikes`, voir [REPUTATION.md](REPUTATION.md)).

## 4. Dialogues (`talk`)

| Option | Condition | Effet |
|---|---|---|
| **Discuter** | 1 fois par jour et par PNJ | + opinion, réplique selon palier. |
| **Rumeurs** | — | Une rumeur du PNJ (`rumors`) ou du monde. |
| **Flatter** | Jet de Charisme | Réussite : souvenir `flatterie`, opinion + ; échec : léger malus. |
| **Menacer** | Jet de Force ou Volonté contre la **perception** du PNJ | Réussite : or extorqué ; toujours : souvenir `menace`, notoriété +. |
| **Insulter** | — | Souvenir `insulte`, opinion −. |
| **Aider** | Avoir un objet de `wants` | Récompense en or, souvenir `aide`, réputation +. |
| **Spéciale** | Tag du joueur (`specialOptions`) | Réplique unique, opinion +, parfois réputation de faction et or. |

Options spéciales existantes (tag → PNJ) : `soldat` → Barda, Hector ; `noble` → Hector, Bailli Orson ; `artiste` → Odile ; `marchand` → Aldric ; `voleur` → Sifflet ; `mystique` → Ilyndra ; `banni` → Varek ; `erudit` → Comtesse Isaure.

## 5. Vie des PNJ (tick quotidien)

- **Déplacement** : avec la probabilité `travelChance` (modulée par l'humeur), le PNJ se rend dans un lieu tiré parmi ses `habits`. Ex. Hector (35 %/jour) patrouille entre le Bourg, le château et la Route du Sel ; Osric (0 %) ne quitte jamais les ruines.
- **Humeur** : retirée chaque jour (−2..2).
- **Économie** : l'or des PNJ varie (enrichissement/appauvrissement), un PNJ ruiné peut changer de métier.
- **Vengeance** : un PNJ **haineux** (hostile avec souvenirs marquants) peut envoyer des hommes de main contre le joueur.
- **Reconnaissance** : un PNJ **allié** peut offrir des cadeaux.

## 6. Voler un PNJ

`p = clamp(35 + DIS × 4 + AGI + niveau Voleur × 5 − perception du PNJ × 3 − sécurité du lieu / 5, 5, 90)`. Perceptions : de 6 (Pivoine) à 18 (Ilyndra, Comtesse Isaure). Réussite : or/objets marqués volés, Main Grise +. Échec : souvenir marquant `vol`, réputation −, notoriété +15.

## 7. Les 19 PNJ

| PNJ (id) | Titre | Peuple | Âge | Métier | Faction | Lieu | Boutique | Enseigne | Perception |
|---|---|---|---|---|---|---|---|---|---|
| **Barda Ferrebrune** (`barda`) | Forgeronne du Gué | Humain | 44 | Forgeron | couronne | Bourg-du-Gué | Forge de Barda | Forgeron | 9 |
| **Mère Pivoine Boncœur** (`pivoine`) | Marchande et cuisinière | Halfelin | 61 | Cuisinier | couronne | Bourg-du-Gué | Étal de Mère Pivoine | Cuisinier | 6 |
| **Odile la Rousse** (`odile`) | Tavernière du Sanglier Borgne | Humain | 38 | Tavernier | couronne | Taverne du Sanglier Borgne | Comptoir du Sanglier Borgne | Tavernier | 12 |
| **Hector Valdrin** (`hector`) | Capitaine de la garde | Humain | 47 | Garde | couronne | Bourg-du-Gué | — | Garde | 14 |
| **Jehan Tillac** (`jehan_tillac`) | Fermier | Humain | 52 | Fermier | couronne | Ferme des Tillac | — | — | 8 |
| **Tobbin Copeau** (`tobbin`) | Charpentier | Halfelin | 35 | Charpentier | couronne | Bourg-du-Gué | — | Charpentier | 7 |
| **Aldric Maréval** (`aldric`) | Maître de la Guilde marchande | Humain | 55 | Marchand | guilde_marchande | Port-Salant | Comptoir de la Guilde | Marchand | 13 |
| **Mirelle Aubépine** (`mirelle`) | Alchimiste | Elfe | 212 | Alchimiste | guilde_marchande | Port-Salant | Les Fioles de Mirelle | Alchimiste | 11 |
| **Sifflet** (`sifflet`) | Receleur de la Main Grise | Halfelin | 29 | Voleur | main_grise | Les Bas-Quais | L’arrière-boutique de Sifflet | Voleur | 16 |
| **Sœur Maëlis** (`soeur_maelis`) | Guérisseuse du Temple | Humain | 31 | Guérisseur | temple_aube | Temple de l’Aube | Apothicairerie du Temple | Guérisseur, Écrivain | 10 |
| **Orson de Brèche** (`bailli_orson`) | Bailli de Valcourt | Humain | 50 | Écrivain | couronne | Château de Valcourt | Intendance du château | Écrivain | 12 |
| **Jorun Barbe-de-Sel** (`jorun`) | Caravanier | Nain | 140 | Marchand | guilde_marchande | Route du Sel | Relais des caravanes | — | 12 |
| **Ilyndra Feuillelune** (`ilyndra`) | Gardienne du Cercle | Elfe | 340 | Herboriste | cercle_sylvain | Forêt de Sylvebrune | Troc du Cercle | Tailleur, Herboriste | 18 |
| **Grukka Main-de-Fer** (`grukka`) | Forgeronne du clan | Orc | 33 | Tanneur | clan_gornak | Campement de Gor’Nak | Enclume de Grukka | Tanneur, Forgeron | 10 |
| **Varek Gor’Nak** (`varek`) | Chef du clan | Orc | 58 | Mercenaire | clan_gornak | Campement de Gor’Nak | — | Mercenaire | 13 |
| **Thrain Brisefer** (`thrain`) | Maître de la Halle des Marteaux | Nain | 190 | Forgeron | clan_karak | Mines de Karak-Dur | Halle des Marteaux | Forgeron, Mineur | 12 |
| **Nixi Trois-Doigts** (`nixi`) | Marchande de la Confrérie | Gobelin | 26 | Alchimiste | confrerie_marais | Marais des Pendus | Comptoir de Nixi | Alchimiste, Herboriste | 14 |
| **Isaure de Vaelmont** (`comtesse_isaure`) | Comtesse de la Cour Nocturne | Vampire | 412 | Arcaniste | cour_nocturne | Ruines d’Esteral | Salon de la Comtesse | Arcaniste | 18 |
| **Osric le Veilleur** (`osric`) | Revenant d’Esteral | Revenant | 800 | Garde | cour_nocturne | Ruines d’Esteral | — | — | 15 |

### Réseau de relations (extrait)

```
Hector ─(-60)─ Sifflet ─(+30)─ Nixi ─(+30)─ Mirelle ─(+20)─ Ilyndra ─(-40)─ Comtesse Isaure ─(+40)─ Osric
  │(+40)                                                     │(-20)
Barda ─(+30)─ Pivoine ─(+50)─ Odile                        Tobbin
  │(+20)                                                                 
Thrain ─(+50)─ Jorun ─(+40)─ Aldric ─(-50)─ Sifflet        Varek ─(+60)─ Grukka
```

## 8. Fiches

### Barda Ferrebrune — Forgeronne du Gué (`barda`)

Humain, 44 ans, forgeron, Couronne de Valcourt · statut modeste · 120 po. *franche, bourrue, travailleuse.* Parle peu, frappe fort. Respecte ceux qui transpirent.

- **Désirs / peurs / objectif** : Du bon minerai ; Un apprenti sérieux / Que les pillards brûlent sa forge / Forger une lame d’argent digne d’un chevalier
- **Habitudes** : Bourg-du-Gué (8), Taverne du Sanglier Borgne (2) · déplacement 15 %/jour
- **Veut (aider)** : 5× Minerai de fer → 30 po ; 2× Minerai d’argent → 45 po
- **Réactions aux tags** : `artisan` +15, `soldat` +10, `noble` -5, `voleur` -10, `race:nain` +10
- **Relations** : Hector Valdrin +40, Mère Pivoine Boncœur +30, Thrain Brisefer +20
- **Options spéciales** : [`soldat`] « Parler des guerres de frontière » (opinion +8)

### Mère Pivoine Boncœur — Marchande et cuisinière (`pivoine`)

Halfelin, 61 ans, cuisinier, Couronne de Valcourt · statut modeste · 80 po. *généreuse, bavarde, maternelle.* Nourrit tout le village, connaît tous les secrets.

- **Désirs / peurs / objectif** : Des baies pour ses tartes ; Que les jeunes mangent à leur faim / La famine ; Les loups / Ouvrir une vraie auberge
- **Habitudes** : Bourg-du-Gué (7), Ferme des Tillac (2), Taverne du Sanglier Borgne (1) · déplacement 10 %/jour
- **Veut (aider)** : 6× Baies sauvages → 12 po ; 3× Viande crue → 15 po
- **Réactions aux tags** : `paysan` +15, `pauvre` +10, `noble` -5, `race:halfelin` +10
- **Relations** : Odile la Rousse +50, Barda Ferrebrune +30, Jehan Tillac +40

### Odile la Rousse — Tavernière du Sanglier Borgne (`odile`)

Humain, 38 ans, tavernier, Couronne de Valcourt · statut modeste · 150 po. *rieuse, rusée, protectrice.* Sait qui doit quoi à qui. Ne sert jamais un ivrogne violent.

- **Désirs / peurs / objectif** : Des musiciens ; Du bon houblon / Une bagarre qui brûle la taverne / Rendre sa taverne célèbre jusqu’à Port-Salant
- **Habitudes** : Taverne du Sanglier Borgne (10) · déplacement 2 %/jour
- **Veut (aider)** : 6× Houblon → 15 po ; 3× Miel → 20 po
- **Réactions aux tags** : `artiste` +20, `charismatique` +10, `violent` -10
- **Relations** : Mère Pivoine Boncœur +50, Hector Valdrin +20, Sifflet +10
- **Options spéciales** : [`artiste`] « Proposer de jouer ce soir » (opinion +10, +12 po)

### Hector Valdrin — Capitaine de la garde (`hector`)

Humain, 47 ans, garde, Couronne de Valcourt · statut aise · 200 po. *droit, fatigué, loyal.* Trop peu d’hommes pour trop de routes. Juste, mais inflexible avec les voleurs.

- **Désirs / peurs / objectif** : Des recrues ; Des routes sûres / Que les Crocs Rouges attaquent le Bourg / Démanteler les Crocs Rouges
- **Habitudes** : Bourg-du-Gué (5), Château de Valcourt (3), Route du Sel (2) · déplacement 35 %/jour
- **Veut (aider)** : 1× Dent d’ogre → 40 po ; 3× Potion de soin → 70 po
- **Réactions aux tags** : `soldat` +25, `noble` +10, `voleur` -20, `banni` -15, `race:orc` -10
- **Relations** : Barda Ferrebrune +40, Orson de Brèche +30, Sifflet -60
- **Options spéciales** : [`soldat`] « Saluer un ancien frère d’armes » (opinion +10, couronne +3) ; [`noble`] « Invoquer votre rang » (opinion +5, couronne +2)
- **Combat** : PV 60, att. 12, déf. 6, agi. 6

### Jehan Tillac — Fermier (`jehan_tillac`)

Humain, 52 ans, fermier, Couronne de Valcourt · statut modeste · 40 po. *têtu, honnête, inquiet.* Travaille de l’aube au crépuscule. A perdu trois moutons aux loups ce mois-ci.

- **Désirs / peurs / objectif** : Que quelqu’un chasse les loups ; Des bras pour la moisson / Perdre la ferme ; Les impôts du bailli / Marier sa fille à un bon parti
- **Habitudes** : Ferme des Tillac (8), Bourg-du-Gué (2) · déplacement 10 %/jour
- **Veut (aider)** : 2× Fourrure de loup → 25 po ; 1× Faucille → 10 po
- **Réactions aux tags** : `paysan` +20, `noble` -10, `voleur` -10
- **Relations** : Mère Pivoine Boncœur +40, Orson de Brèche -20

### Tobbin Copeau — Charpentier (`tobbin`)

Halfelin, 35 ans, charpentier, Couronne de Valcourt · statut modeste · 60 po. *perfectionniste, timide, gourmand.* Parle à ses planches. Fabrique les plus beaux coffres du Val.

- **Désirs / peurs / objectif** : Du bois de lune ; Une tarte aux baies / Les elfes (qui lui reprochent de couper la forêt) / Construire le nouveau pont du Gué
- **Habitudes** : Bourg-du-Gué (9), Taverne du Sanglier Borgne (1) · déplacement 5 %/jour
- **Veut (aider)** : 1× Bois de lune → 30 po ; 1× Tarte aux baies → 15 po
- **Réactions aux tags** : `artisan` +15, `race:elfe` -5
- **Relations** : Mère Pivoine Boncœur +30, Ilyndra Feuillelune -20

### Aldric Maréval — Maître de la Guilde marchande (`aldric`)

Humain, 55 ans, marchand, Guilde marchande de Port-Salant · statut riche · 900 po. *calculateur, poli, ambitieux.* Tout a un prix, y compris l’amitié. Mais il honore toujours un contrat.

- **Désirs / peurs / objectif** : Des routes sûres ; Des contrats en bonne forme / La ruine ; Que la Couronne augmente les taxes / Contrôler le commerce du sel
- **Habitudes** : Port-Salant (8), Route du Sel (1), Château de Valcourt (1) · déplacement 15 %/jour
- **Veut (aider)** : 2× Contrat de commerce → 90 po ; 1× Perle noire → 180 po
- **Réactions aux tags** : `marchand` +20, `noble` +15, `riche` +10, `pauvre` -10, `voleur` -15
- **Relations** : Orson de Brèche +30, Jorun Barbe-de-Sel +40, Sifflet -50, Isaure de Vaelmont +10
- **Options spéciales** : [`marchand`] « Parler affaires entre professionnels » (opinion +10, guilde_marchande +3)

### Mirelle Aubépine — Alchimiste (`mirelle`)

Elfe, 212 ans, alchimiste, Guilde marchande de Port-Salant · statut aise · 250 po. *curieuse, distraite, bienveillante.* Elfe exilée en ville par amour des sciences. Ses potions sont les meilleures du port.

- **Désirs / peurs / objectif** : Du sang de troll ; Des fleurs de lune / Qu’on utilise ses poisons pour tuer / Trouver un remède à la fièvre des marais
- **Habitudes** : Port-Salant (8), Temple de l’Aube (2) · déplacement 10 %/jour
- **Veut (aider)** : 3× Fleur de lune → 50 po ; 1× Sang régénérant → 90 po
- **Réactions aux tags** : `erudit` +20, `mystique` +10, `race:elfe` +10
- **Relations** : Ilyndra Feuillelune +20, Nixi Trois-Doigts +30, Sœur Maëlis +20

### Sifflet — Receleur de la Main Grise (`sifflet`)

Halfelin, 29 ans, voleur, La Main Grise · statut modeste · 300 po. *moqueur, loyal envers les siens, méfiant.* Ancien gamin des rues. Protège les orphelins des Bas-Quais avec l’argent des riches.

- **Désirs / peurs / objectif** : Des objets de valeur ; Humilier la Guilde / Le capitaine Hector ; La potence / Faire de la Main Grise la vraie puissance de Port-Salant
- **Habitudes** : Les Bas-Quais (8), Taverne du Sanglier Borgne (2) · déplacement 15 %/jour
- **Veut (aider)** : 1× Bijou ancien → 120 po ; 10× Pain → 25 po
- **Réactions aux tags** : `voleur` +25, `pauvre` +10, `noble` -20, `soldat` -10, `discret` +10
- **Relations** : Hector Valdrin -60, Aldric Maréval -50, Odile la Rousse +10, Nixi Trois-Doigts +30
- **Options spéciales** : [`voleur`] « Faire le signe de la Main Grise » (opinion +12, main_grise +4)

### Sœur Maëlis — Guérisseuse du Temple (`soeur_maelis`)

Humain, 31 ans, guérisseur, Temple de l’Aube · statut modeste · 60 po. *douce, déterminée, idéaliste.* Soigne tout le monde, même les voleurs. Inquiète de la haine du Temple envers les morts-vivants conscients.

- **Désirs / peurs / objectif** : Des herbes de soin ; Que les pauvres soient soignés / Une épidémie ; Le fanatisme de ses frères / Fonder un hospice aux Bas-Quais
- **Habitudes** : Temple de l’Aube (7), Les Bas-Quais (2), Bourg-du-Gué (1) · déplacement 20 %/jour
- **Veut (aider)** : 8× Herbe de soin → 20 po ; 1× Relique de l’Aube → 150 po
- **Réactions aux tags** : `mystique` +10, `erudit` +10, `pauvre` +5, `violent` -10
- **Relations** : Mirelle Aubépine +20, Osric le Veilleur +10

### Orson de Brèche — Bailli de Valcourt (`bailli_orson`)

Humain, 50 ans, écrivain, Couronne de Valcourt · statut noble · 1500 po. *vaniteux, avide, procédurier.* Gère les licences et les impôts. Se sert au passage.

- **Désirs / peurs / objectif** : L’or ; Le respect des nobles / Qu’on découvre ses détournements / Devenir seigneur à la place du seigneur
- **Habitudes** : Château de Valcourt (9), Port-Salant (1) · déplacement 5 %/jour
- **Veut (aider)** : 1× Vin elfique → 70 po ; 1× Parfum → 60 po
- **Réactions aux tags** : `noble` +25, `riche` +15, `pauvre` -15, `paysan` -10, `banni` -25
- **Relations** : Aldric Maréval +30, Hector Valdrin +20, Jehan Tillac -20
- **Options spéciales** : [`noble`] « Parler de votre famille » (opinion +15)

### Jorun Barbe-de-Sel — Caravanier (`jorun`)

Nain, 140 ans, marchand, Guilde marchande de Port-Salant · statut aise · 350 po. *jovial, prudent, têtu.* Tient le relais de la Route du Sel. A survécu à trente embuscades et en raconte cinquante.

- **Désirs / peurs / objectif** : Des escortes ; Des nouvelles des mines / Les Crocs Rouges / Rouvrir la route vers Karak-Dur
- **Habitudes** : Route du Sel (7), Port-Salant (2), Bourg-du-Gué (1) · déplacement 25 %/jour
- **Veut (aider)** : 5× Ration de voyage → 40 po ; 1× Carte du Val de Brume → 25 po
- **Réactions aux tags** : `marchand` +15, `soldat` +10, `aventurier` +10, `race:nain` +15, `race:orc` -5
- **Relations** : Aldric Maréval +40, Thrain Brisefer +50, Varek Gor’Nak +20
- **Combat** : PV 55, att. 11, déf. 6, agi. 3

### Ilyndra Feuillelune — Gardienne du Cercle (`ilyndra`)

Elfe, 340 ans, herboriste, Cercle de Sylvebrune · statut aise · 150 po. *hautaine, sage, protectrice.* Juge les humains à leurs actes envers la forêt. Tisse la soie d’araignée comme personne.

- **Désirs / peurs / objectif** : Que la chasse reste mesurée ; Protéger les feux follets / Les bûcherons avides ; La corruption venue des ruines / Rétablir l’équilibre entre la forêt et le Bourg
- **Habitudes** : Forêt de Sylvebrune (10) · déplacement 2 %/jour
- **Veut (aider)** : 4× Soie d’araignée → 50 po ; 1× Licence de chasse → 20 po
- **Réactions aux tags** : `mystique` +15, `race:elfe` +20, `race:homme_bete` +10, `job:bucheron` -10, `violent` -10, `race:nain` -10
- **Relations** : Mirelle Aubépine +20, Tobbin Copeau -20, Varek Gor’Nak +10, Isaure de Vaelmont -40
- **Options spéciales** : [`mystique`] « Partager une vision » (opinion +12, cercle_sylvain +4)

### Grukka Main-de-Fer — Forgeronne du clan (`grukka`)

Orc, 33 ans, tanneur, Clan Gor’Nak · statut modeste · 180 po. *fière, directe, honorable.* Travaille le cuir et le fer. Méprise les lâches, respecte les travailleurs de toutes races.

- **Désirs / peurs / objectif** : Des peaux d’ours ; Du minerai / Que le clan soit confondu avec les Crocs Rouges / Armer le clan pour sa guerre contre les renégats
- **Habitudes** : Campement de Gor’Nak (10) · déplacement 2 %/jour
- **Veut (aider)** : 1× Peau d’ours → 35 po ; 6× Minerai de fer → 35 po
- **Réactions aux tags** : `race:orc` +20, `soldat` +10, `banni` +10, `noble` -10, `race:nain` -10
- **Relations** : Varek Gor’Nak +60, Jorun Barbe-de-Sel +10

### Varek Gor’Nak — Chef du clan (`varek`)

Orc, 58 ans, mercenaire, Clan Gor’Nak · statut aise · 400 po. *sage, redoutable, hospitalier.* A mené son clan hors des guerres. Veut une place pour les orcs dans le Val, pas une conquête.

- **Désirs / peurs / objectif** : La paix avec Valcourt ; La fin des Crocs Rouges / Que la haine des humains condamne son peuple / Obtenir des terres par traité
- **Habitudes** : Campement de Gor’Nak (8), Route du Sel (2) · déplacement 10 %/jour
- **Veut (aider)** : 2× Dent d’ogre → 60 po ; 3× Hydromel → 40 po
- **Réactions aux tags** : `soldat` +10, `banni` +15, `race:orc` +20, `violent` +5, `noble` -5
- **Relations** : Grukka Main-de-Fer +60, Jorun Barbe-de-Sel +20, Hector Valdrin -10, Ilyndra Feuillelune +10
- **Options spéciales** : [`banni`] « Demander l’hospitalité des exilés » (opinion +12, clan_gornak +5)
- **Combat** : PV 90, att. 16, déf. 7, agi. 5

### Thrain Brisefer — Maître de la Halle des Marteaux (`thrain`)

Nain, 190 ans, forgeron, Clan Karak-Dur · statut riche · 700 po. *fier, rancunier, généreux avec ses amis.* Une dette est sacrée. Une insulte l’est encore plus.

- **Désirs / peurs / objectif** : Qu’on tue le troll du filon d’argent ; De l’hydromel / Que les mines s’épuisent / Rouvrir la route commerciale naine
- **Habitudes** : Mines de Karak-Dur (10) · déplacement 2 %/jour
- **Veut (aider)** : 2× Hydromel → 35 po ; 1× Os de troll → 80 po
- **Réactions aux tags** : `artisan` +20, `race:nain` +25, `race:elfe` -15, `race:orc` -15, `marchand` +5
- **Relations** : Jorun Barbe-de-Sel +50, Barda Ferrebrune +20, Grukka Main-de-Fer -20
- **Combat** : PV 70, att. 13, déf. 8, agi. 3

### Nixi Trois-Doigts — Marchande de la Confrérie (`nixi`)

Gobelin, 26 ans, alchimiste, Confrérie des Marais · statut aise · 250 po. *rusée, bavarde, loyale en affaires.* Vend de tout, rachète de tout. Ne ment jamais sur la marchandise, seulement sur ses origines.

- **Désirs / peurs / objectif** : Des champignons noirs ; Du respect de la part des « grands » / Les gobelins sauvages, qui donnent mauvaise réputation aux siens / Ouvrir un comptoir à Port-Salant
- **Habitudes** : Marais des Pendus (8), Les Bas-Quais (2) · déplacement 10 %/jour
- **Veut (aider)** : 4× Viande séchée → 30 po ; 5× Pain → 20 po
- **Réactions aux tags** : `marchand` +10, `voleur` +10, `race:gobelin` +25, `noble` -10, `violent` -5
- **Relations** : Sifflet +30, Mirelle Aubépine +30

### Isaure de Vaelmont — Comtesse de la Cour Nocturne (`comtesse_isaure`)

Vampire, 412 ans, arcaniste, Cour Nocturne · statut noble · 2000 po. *raffinée, patiente, manipulatrice.* Collectionneuse de savoir et d’artefacts. Ne boit que du sang offert. Du moins, c’est ce qu’elle dit.

- **Désirs / peurs / objectif** : Des artefacts d’Esteral ; Des conversations brillantes / Le fanatisme du Temple ; Les striges qui salissent le nom des siens / Faire reconnaître la Cour Nocturne comme une maison noble du Val
- **Habitudes** : Ruines d’Esteral (10) · déplacement 1 %/jour
- **Veut (aider)** : 1× Statuette d’Esteral → 160 po ; 1× Sang vampirique → 120 po
- **Réactions aux tags** : `noble` +20, `erudit` +15, `mystique` +15, `job:garde` -10
- **Relations** : Osric le Veilleur +40, Ilyndra Feuillelune -40, Sœur Maëlis -10, Aldric Maréval +10
- **Options spéciales** : [`erudit`] « Débattre de l’histoire d’Esteral » (opinion +15, +25 po)

### Osric le Veilleur — Revenant d’Esteral (`osric`)

Revenant, 800 ans, garde, Cour Nocturne · statut miserable · 20 po. *mélancolique, lucide, bienveillant.* Ancien capitaine d’Esteral, conscient et sans haine. Veille sur les ruines depuis huit siècles.

- **Désirs / peurs / objectif** : Que les squelettes de ses hommes reposent enfin ; Parler aux vivants / Perdre son esprit et devenir comme eux / Trouver le repos
- **Habitudes** : Ruines d’Esteral (10) · déplacement 0 %/jour
- **Veut (aider)** : 1× Pierre de lumière → 50 po ; 2× Eau bénite → 40 po
- **Réactions aux tags** : `soldat` +15, `mystique` +10, `job:garde` +10
- **Relations** : Isaure de Vaelmont +40, Sœur Maëlis +10

## 9. Points d'attention

- Relations **à sens unique** (A connaît B, B n'a pas d'avis sur A) : Odile→Hector, Tobbin→Pivoine, Grukka→Jorun, Varek→Hector, Thrain→Grukka, Comtesse→Sœur Maëlis. Peut être voulu (asymétrie sociale), à confirmer.
- Répliques **hostiles manquantes** pour Tobbin, Mirelle, Jorun et Osric : prévoir un repli sur le palier « méfiant ».
- La `relique_aube` désirée par Sœur Maëlis se trouve chez Sifflet, le receleur des Bas-Quais : la racheter (ou la voler) puis la rendre au Temple forme une première mini-quête émergente. Une vraie chaîne de quête scénarisée est prévue (**Futur**).
