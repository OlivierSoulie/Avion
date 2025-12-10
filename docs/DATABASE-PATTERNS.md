# Patterns des Bases de Données - Documentation Complète

**Version du document** : 1.0
**Dernière mise à jour** : 10/12/2025
**Auteur** : Équipe DEV Configurateur Daher

---

## Table des matières

1. [Introduction](#introduction)
2. [Vue d'ensemble des versions](#vue-densemble-des-versions)
3. [Patterns des Parameters](#patterns-des-parameters)
4. [Patterns des Configuration Bookmarks](#patterns-des-configuration-bookmarks)
5. [Patterns des Camera Groups](#patterns-des-camera-groups)
6. [Règles de détection automatique](#règles-de-détection-automatique)

---

## Introduction

Ce document répertorie **tous les patterns** des bases de données Lumiscaphe utilisées par le configurateur Daher.

### Versions de bases supportées

| Version | Type | Support Configurateur | Description |
|---------|------|----------------------|-------------|
| **V0.1** | Production | ✅ Supporté | Base initiale |
| **V0.2** | Production | ✅ Supporté | version avec coordonnées numériques |
| **V0.3** | Production | ✅ Supporté | Introduction Flight/Ground pour décors |
| **V0.4** | Production | ✅ Supporté | Évolution mineure de V0.3 |
| **V0.5** | Production | ✅ Supporté | Évolution mineure de V0.4 |
| **V0.6+** | Production | ✅ Supporté | Introduction index de tri pour paint schemes (V0.6, V0.6.1, V0.6.2 = corrections de données uniquement, templates identiques) |

### Principe de détection

Le configurateur analyse dynamiquement le XML de chaque base via `database-analyzer.js` pour détecter automatiquement :
- La version des bases 
- Les patterns de parameters disponibles
- Les groupes de caméras présents
- Les configuration bookmarks

---

## Vue d'ensemble des versions

### Différences principales entre versions

| Feature | V0.1 | V0.2 | V0.3-V0.5 | V0.6+ |
|---------|------|------|-----------|-------|
| **Type de base** | Production | Production | Production | Production |
| **Paramètres POC** | ❌ Non | ❌ Non | ❌ Non | ❌ Non |
| **Paramètre "Decor"** | ❌ "POC Decor" | ✅ Coordonnées | ✅ Flight/Ground | ✅ Flight/Ground |
| **Paint Scheme** | Simple | 5 paires | 5 paires | 5 paires + index |
| **Colors_Zone** | 4 segments | 10-14 segments | 10-14 segments | 10-14 segments |
| **Door/Tablet/SunGlass** | ❌ Non | ✅ Oui | ✅ Oui | ✅ Oui |
| **Tri Paint Schemes** | Alphabétique | Alphabétique | Alphabétique | Par index |
| **Immatriculation** | Bookmarks RegL/RegR | Bookmarks RegL/RegR | Bookmarks RegL/RegR (6 pos) | Bookmarks RegL/RegR (1 pos) |

---

## Patterns des Parameters

### 1. Parameter: `Decor`

#### V0.1 - NON SUPPORTÉ
```
Parameter: "POC Decor"
Pattern: POC Decor.{decorName}
Exemple: POC Decor.Studio
```
⚠️ **Le configurateur ne supporte PAS les parametres POC**

#### V0.2 
```
Parameter: "Decor"
Pattern: Decor.{decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz
Segments: 9 (decorName + cameraName + 6 coordonnées de positionnement)
```

**Exemples** :
```
Decor.Studio_Camera1_0_0_0_0_90_0
Decor.Tarmac_Camera2_100_50_-20_0_180_45
```

**Description** :
- `decorName` : Nom du décor (Studio, Tarmac, Fjord, Hangar, Onirique)
- `cameraName` : Nom de la caméra à utiliser (mode image simple, pas de groupe)
- `Tx, Ty, Tz` : Translation de l'avion (coordonnées X, Y, Z)
- `Rx, Ry, Rz` : Rotation de l'avion (angles en degrés X, Y, Z )

**Usage** : Mode **image simple** (pas de groupe de caméras) + Positionnement de l'avion avec Translation et Rotation dans le bloc configuration de la requête
    "translation": {
      "x": 100,
      "y": 50,
      "z": -20
    },
    "rotation": {
      "x": 0,
      "y": 180,
      "z": 45
    }

#### V0.3 à V0.6.2 
```
Parameter: "Decor"
Pattern: Decor.{decorName}_{Flight|Ground}
Segments: 2
```

**Exemples** :
```
Decor.Studio_Ground
Decor.Tarmac_Flight
Decor.Fjord_Ground
Decor.Hangar_Flight
Decor.Onirique_Ground
```

**Description** :
- `decorName` : Nom du décor (Studio, Tarmac, Fjord, Hangar, Onirique)
- `Flight|Ground` : Position de l'avion dans l'image pour filtrage possible des décors
  - `Ground` : Décors avec avion au sol
  - `Flight` : Décors avec avion en vol

**Usage** : Mode **groupe de caméras** (groupe nommé `Exterieur_Decor{DecorName}`) + le paramètre décors est obligatoirement lié au paramètre `Position.{DecorName}` !

**⚠️ IMPORTANT** : Position utilise uniquement le {DecorName} extrait du pattern
- Pattern : `Decor.{DecorName}_{Flight|Ground}`
- Decor : `Decor.Fjord_Flight` → {DecorName} = "Fjord"
- Position : `Position.Fjord` (utilise le {DecorName} extrait)

**Exemple**
 ```
 Decor.Fjord_Flight : Définit l'environnement 3D (skybox, fond, éclairage)
 Position.Fjord : Définit la position/pose de l'avion dans cet environnement (utilise {DecorName} = "Fjord")
```
---

### 1bis. Parameter: `Position`

**Disponibilité** : V0.3 à V0.6+ (UNIQUEMENT avec Decor V0.3+)

```
Pattern: Position.{decorName}
Segments: 1
```

**Exemples** :
```
Position.Studio
Position.Tarmac
Position.Fjord
Position.Hangar
Position.Onirique
```

**Description** :
- `decorName` : Nom du décor (extrait du paramètre `Decor`)
- Définit la **position/pose de l'avion** dans l'environnement 3D
- **IMPORTANT** : Toujours utilisé avec `Decor.{decorName}_{Flight|Ground}`

**⚠️ Règle de liaison** :
- Le `{decorName}` de Position **DOIT correspondre** au `{decorName}` de Decor
- Exemple : `Decor.Fjord_Flight` → `Position.Fjord` (même decorName = "Fjord")

**Usage dans la requête API** :
```
Configuration string :
Decor.Fjord_Flight/Position.Fjord/...
  ↑                  ↑
  Environnement 3D   Position/pose avion
```

**V0.1 & V0.2** : Paramètre absent (coordonnées Translation/Rotation directement dans Decor)

---

### 2. Parameter: `Exterior_PaintScheme`

#### V0.1 - NON SUPPORTÉ
```
Pattern: Exterior_PaintScheme.{schemeName}
Segments: 1
Exemple: Exterior_PaintScheme.Zephir
```

**Limitation** : Pas de configuration de zones (A, B, C, D)

#### V0.2 à V0.5 (Production)
```
Pattern: Exterior_PaintScheme.{schemeName}_{pair0}_{pair1}_{pair2}_{pair3}_{pair4}
Segments: 6
Tri: Alphabétique
```

**Exemples** :
```
Exterior_PaintScheme.Zephir_A-0_A-D_A-D_A-D_A-D
Exterior_PaintScheme.Tehuano_B-0_B-D_B-D_B-D_B-D
Exterior_PaintScheme.Sirocco_C-0_C-D_C-D_C-D_C-D
```
**Description** :
- `schemeName` : Nom du schéma de peinture
Chaque paire `X-Y` définit 2 zones de couleur à utiliser pour colorer les lettres d'immatriculation
- `X-0` : X couleurLumiscaphe de la zone définie à appliquer pour la lettre uniquement {Layer0} (pas de 2ème zone)
- `X-Y` : X couleurLumiscaphe de la zone définie à appliquer pour la lettre {Layer0} + Y couleurLumiscaphe de la zone définie à appliquer pour les contours et ombrage {Layer1}



#### V0.6+ (Production)
```
Pattern: Exterior_PaintScheme.{schemeName}_{index}_{pair0}_{pair1}_{pair2}_{pair3}_{pair4}
Segments: 7 
Tri: Par index (croissant)
```

**Exemples** :
```
Exterior_PaintScheme.Zephir_1_A-0_A-D_A-D_A-D_A-D
Exterior_PaintScheme.Tehuano_2_B-0_B-D_B-D_B-D_B-D
Exterior_PaintScheme.Sirocco_3_C-0_C-D_C-D_C-D_C-D
```

**Description** :
- `schemeName` : Nom du schéma de peinture
- `index` : Position de tri dans le dropdown (démarre à 1)
Chaque paire `X-Y` définit 2 zones de couleur à utiliser pour colorer les lettres d'immatriculation
- `X-0` : X couleurLumiscaphe de la zone définie à appliquer pour la lettre uniquement {Layer0} (pas de 2ème zone)
- `X-Y` : X couleurLumiscaphe de la zone définie à appliquer pour la lettre {Layer0} + Y couleurLumiscaphe de la zone définie à appliquer pour les contours et ombrage {Layer1}


**⚠️ WORKAROUND V0.6** : Les bookmarks contiennent encore l'ancien format sans index, le configurateur doit insérer dynamiquement l'index dans le bookmarks de configuration (voir `payload-builder.js` ligne 40-71)

---

### 3. Parameter: `Colors_ZoneX` (X = A, B, C, D, A+)

#### V0.1
```
Pattern: Colors_Zone{X}.{colorName}-{code}-{hex}-{tagVoilure}
Segments: 4
```

**Exemple** :
```
Colors_ZoneA.AlbeilleBlack-22505-#414142-A+
```

**Structure** :
1. `colorName` : Nom de la couleur
2. `code` : Code Daher
3. `hex` : Code HTML (#RRGGBB)
4. `tagVoilure` : Métadonnées de voilure (A+, noA+) couleur applicable à la zone A+. Permet de filtrer les couleur disponible dans le dropdown Znoe 1+

#### V0.2 à V0.6+  - Zones A/B/C/D
```
Pattern: Colors_Zone{X}.{colorName}-{code}-{hexLAB}-{hexLumiscaphe}-{tagVoilure}-{metadata...}
Segments: 10
```

**Exemple** :
```
Colors_ZoneA.AlbeilleBlack-22505-#414142-#424243-noA+-22505-albeille-black-dark-metallic
```

**Structure** :
1. `colorName` : Nom de la couleur
2. `code` : Code Daher (ex: 22505)
3. `hexLAB` : Code HTML navigateur (#414142) utilisé pour calculer un contraste
4. **`hexLumiscaphe`** : Code HTML Lumiscaphe (#424243) → **UTILISÉ PAR L'API** pour colorer les lettres ou contour et ombre de l'immatriculation.
5. `tagVoilure` : Métadonnées de voilure (A+, noA+) couleur applicable à la zone A+. Permet de filtrer les couleur disponible dans le dropdown Znoe 1+
6-N. `metadata` : Mots-clés pour recherche (22505, albeille, black, dark, metallic) pas de limite de mot

---

### 4. Parameters: Contrôles intérieur/extérieur

#### `Door_pilot` et `Door_passenger`

**Disponibilité** : V0.2 à V0.6+ 

```
Pattern: Door_{pilot|passenger}.{Open|Closed}
```

**Exemples** :
```
Door_pilot.Open
Door_pilot.Closed
Door_passenger.Open
Door_passenger.Closed
```

**V0.1** : `POC Door pilot`, `POC Door passenger` (NON SUPPORTÉS)

---

#### `SunGlass`

**Disponibilité** : V0.3 à V0.6+

```
Pattern: SunGlass.{SunGlassON|SunGlassOFF}
```

**Exemples** :
```
SunGlass.SunGlassON   → Volets fermés (hublots cachés)
SunGlass.SunGlassOFF  → Volets ouverts (hublots visibles)
```

**V0.1 & V0.2** : `POC Sun glass` (NON SUPPORTÉ)

---

#### `Tablet`

**Disponibilité** : V0.3 à V0.6+

```
Pattern: Tablet.{Open|Closed}
```

**Exemples** :
```
Tablet.Open    → Tablette dépliée
Tablet.Closed  → Tablette repliée
```

**V0.1 et V0.2** : Paramètre absent

---

#### `Lighting_Ceiling` / `Lighting_ceiling`

**Disponibilité** : V0.3 à V0.6+

```
Pattern: Lighting_{Ceiling}.{ON|OFF}
```

**Exemples** :
```
Lighting_Ceiling.ON   → Lumières plafond allumées
Lighting_Ceiling.OFF  → Lumières plafond éteintes
```

**V0.1 & V0.2** : `POC Lighting ceiling` (NON SUPPORTÉ)

---

#### `Lighting_Mood`

**Disponibilité** : V0.3 à V0.6+

```
Pattern: {Lighting_Mood}.{ON|OFF}
```

**Variantes de nommage** :
- V0.3-V0.6+ : `Lighting_Mood`

**Exemples** :
```
Lighting_Mood.ON   → Mood Lights allumées
Lighting_Mood.OFF  → Mood Lights éteintes
```

**V0.1 & V0.2** : `POC Lighting mood 960` (NON SUPPORTÉ)

---

### 5. Parameters: Intérieur

#### `Interior_*` - Analyse détaillée des 11 paramètres

**Disponibilité** : V0.2 à V0.6+

**⚠️ IMPORTANT** : Il n'existe PAS de pattern unifié pour tous les paramètres Interior. Chaque catégorie a son propre format.

---

##### **Catégorie 1 : Matériaux Cuir/Suède avec Code Daher (4 segments)**

**Pattern** : `Interior_{param}.{Name}_{Code}_{Type}_{Premium}`

**Paramètres concernés** :
- `Interior_SeatCovers`
- `Interior_UpperSidePanel`
- `Interior_LowerSidePanel`
- `Interior_Ultra-SuedeRibbon`

**Exemples** :
```
Interior_SeatCovers.BeigeGray_2176_Leather_Premium
Interior_UpperSidePanel.WhiteSand_2192_Leather_Premium
Interior_LowerSidePanel.BeigeGray_2176_Leather_Premium
Interior_Ultra-SuedeRibbon.Elephant_3367_Suede_Premium
```

**Structure** :
1. `{Name}` : Nom de la couleur (ex: BeigeGray, WhiteSand, Elephant)
2. `{Code}` : Code Daher 4 chiffres (ex: 2176, 2192, 3367)
3. `{Type}` : Type de matériau (`Leather` ou `Suede`)
4. `{Premium}` : indique le niveau de finition pour filtrage eventuellement

---

##### **Catégorie 2 : Finitions sans Code (3 segments)**

**Pattern** : `Interior_{param}.{Name}_{Type}_{Premium}`

**Paramètres concernés** :
- `Interior_Carpet`
- `Interior_MetalFinish`

**Exemples** :
```
Interior_Carpet.LightBrown_carpet_Premium
Interior_Carpet.CharcoalBlack_carpet_Premium
Interior_MetalFinish.BrushedStainless_metal_Premium
Interior_MetalFinish.PolishedStainless_metal_Premium
```

**Structure** :
1. `{Name}` : Nom de la couleur/finition (ex: LightBrown, BrushedStainless)
2. `{Type}` : Type de finition (`carpet`, `metal`)
3. `{Premium}` : indique le niveau de finition pour filtrage eventuellement

---

##### **Catégorie 3 : TabletFinish - Type composé (4 segments)**

**Pattern** : `Interior_TabletFinish.{Name}_{Type}_{SubType}_{Premium}`

**Exemples** :
```
Interior_TabletFinish.SapelliMat_table_wood_Premium
Interior_TabletFinish.Carbon_table_carbonFiber_Premium
Interior_TabletFinish.WalnutGloss_table_wood_Premium
```

**Structure** :
1. `{Name}` : Nom du bois/matériau (ex: SapelliMat, Carbon, WalnutGloss)
2. `{Type}}` : Identifiant fixe
3. `{SubType}` : Sous-type (`wood`, `carbonFiber`)
4. `{Premium}` : indique le niveau de finition pour filtrage eventuellement

---

##### **Catégorie 4 : Couleurs simples (2 segments)**

**Pattern** : `Interior_{param}.{ColorName}_{Premium}`

**Paramètres concernés** :
- `Interior_Stitching` (V0.3+)

**Exemples** :
```
Interior_Stitching.BeigeGrey_Premium
Interior_Stitching.White_Premium
Interior_Stitching.Black_Premium
Interior_Stitching.Charcoal_Premium
```

**Structure** :
1. `{ColorName}` : Nom de la couleur (ex: BeigeGrey, White, Black)
2. `{Premium}` : indique le niveau de finition pour filtrage eventuellement

---

##### **Catégorie 5 : Options binaires (2 segments)**

**Pattern** : `Interior_{param}.{OptionName}_{Premium}`

**Paramètres concernés** :
- `Interior_PerforatedSeatOptions`

**Exemples** :
```
Interior_PerforatedSeatOptions.NoSeatPerforation_Premium
Interior_PerforatedSeatOptions.SeatPerforation_Premium
```

**Structure** :
1. `{OptionName}` : Nom de l'option (NoSeatPerforation, SeatPerforation)
2. `{Premium}` : indique le niveau de finition pour filtrage eventuellement


---

##### **Catégorie 6 : Type matériau seul (2 segments)**

**Pattern** : `Interior_CentralSeatMaterial.{Type}_{Premium}`

**Exemples** :
```
Interior_CentralSeatMaterial.Leather_Premium
Interior_CentralSeatMaterial.Suede_Premium
```

**Structure** :
1. `{Type}` : Type de matériau uniquement (`Leather` ou `Suede`)
2. `{Premium}` : indique le niveau de finition pour filtrage eventuellement

---

##### **Catégorie 7 : Seatbelts - EXCEPTION sans Premium (2 segments)**

**Pattern** : `Interior_Seatbelts.{ColorName}_{Type}`

**Exemples** :
```
Interior_Seatbelts.OatMeal_belt
Interior_Seatbelts.Black_belt
Interior_Seatbelts.Charcoal_belt
```

**Structure** :
1. `{ColorName}` : Nom de la couleur (ex: OatMeal, Black, Charcoal)
2. `{Type}` : Identifiant de type

---


---

**V0.1** : Paramètres préfixés "POC" (ex: `POC Leather`) (NON SUPPORTÉS)

---

### 6. Parameters: Autres

#### `Version`

**Disponibilité** : V0.1 à V0.6+ (toutes versions)

```
Pattern: Version.{960|980}
```

**Exemples** :
```
Version.960  → TBM 960
Version.980  → TBM 980
```

---

#### `Spinner`

**Disponibilité** : V0.1 à V0.6+ (toutes versions)

```
Pattern: Spinner.{color}
```

**Exemples** :
```
Spinner.MattBlack
Spinner.Silver
Spinner.Chrome
```

---

## Patterns des Configuration Bookmarks

### Format général

Les **Configuration Bookmarks** sont des éléments XML qui contiennent des configurations prédéfinies :

```xml
<ConfigurationBookmark label="Exterior_Zephir" value="...">
    <ConfigurationString>
        Version.960/Exterior_PaintScheme.Zephir_A-0_A-D_A-D_A-D_A-D/Decor.Studio_Ground/...
    </ConfigurationString>
</ConfigurationBookmark>
```

### Types de bookmarks

#### 1. Bookmarks Exterior (Paint Schemes)

**Nommage** : `Exterior_{schemeName}`

**Exemples** :
```xml
<ConfigurationBookmark label="Exterior_Zephir">
<ConfigurationBookmark label="Exterior_Tehuano">
<ConfigurationBookmark label="Exterior_Sirocco">
<ConfigurationBookmark label="Exterior_Alize">
<ConfigurationBookmark label="Exterior_Mistral">
<ConfigurationBookmark label="Exterior_Meltem">
```

**Contenu** : liste des parametres (Exterior_Colors_ZoneX) pour toutes les Zones (A, B, C, D , A+)  par défaut de l'avion
- Exterior_Colors_ZoneA+                                                               par exemple Exterior_Colors_ZoneA+.PureWhite-09010-#e0dcd1-#E0DAC7-A+-09010-pure-white-solid-light
- Exterior_Colors_ZoneA                                                                par exemple Exterior_Colors_ZoneA.PureWhite-09010-#e0dcd1-#E0DAC7-A+-09010-pure-white-solid-light
- Exterior_Colors_ZoneB                                                                par exemple Exterior_Colors_ZoneB.MossGreen-06005-#375349-#004530-noA+-06005-moss-green-dark-forest-solid
- Exterior_Colors_ZoneC                                                                par exemple Exterior_Colors_ZoneC.BlackMetal0684-70684-#474746-#484747-noA+-70684-black-metal-dark-metallic-0684
- Exterior_Colors_ZoneD                                                                par exemple Exterior_Colors_ZoneD.MontaiguGreen-22634-#6e7968-#6F7867-noA+-22634-montaigu-green-khaki-metallic
- Exterior_PaintScheme avec paires de couleurs par defaut pour le schéma de peinture   par exemple Exterior_PaintScheme.Alize_2_B-0_B-D_B-D_B-D_B-D

---

#### 2. Bookmarks Interior (Prestige)

**Nommage** : `Interior_PrestigeSelection_{prestigeName}`

**Exemples** :
```xml
<ConfigurationBookmark label="Interior_PrestigeSelection_Oslo">
<ConfigurationBookmark label="Interior_PrestigeSelection_SanPedro">
<ConfigurationBookmark label="Interior_PrestigeSelection_London">
<ConfigurationBookmark label="Interior_PrestigeSelection_Labrador">
<ConfigurationBookmark label="Interior_PrestigeSelection_GooseBay">
<ConfigurationBookmark label="Interior_PrestigeSelection_BlackFriars">
<ConfigurationBookmark label="Interior_PrestigeSelection_Fjord">
<ConfigurationBookmark label="Interior_PrestigeSelection_Atacama">
```

**Contenu** : Configuration complète de 11 paramètres intérieur
- Interior_Carpet                                                          par exemple  Interior_Carpet.LightBrown_carpet_Premium
- Interior_CentralSeatMaterial                                             par exemple  Interior_CentralSeatMaterial.Leather_Premium 
- Interior_LowerSidePanel                                                  par exemple  Interior_LowerSidePanel.BeigeGray_2176_Leather_Premium
- Interior_MetalFinish                                                     par exemple  Interior_MetalFinish.BrushedStainless_metal_Premium
- Interior_PerforatedSeatOptions                                           par exemple  Interior_PerforatedSeatOptions.NoSeatPerforation_Premium
- Interior_SeatCovers                                                      par exemple  Interior_SeatCovers.BeigeGray_2176_Leather_Premium
- Interior_Seatbelts                                                       par exemple  Interior_Seatbelts.OatMeal_belt
- Interior_Stitching                                                                    Manquant à ajouter dans les prochaines versions des base de données.
- Interior_TabletFinish                                                    par exemple  Interior_TabletFinish.SapelliMat_table_wood_Premium
- Interior_Ultra-SuedeRibbon                                               par exemple  Interior_Ultra-SuedeRibbon.Elephant_3367_Suede_Premium
- Interior_UpperSidePanel                                                  par exemple  Interior_UpperSidePanel.WhiteSand_2192_Leather_Premium                                            


---

#### 3. Bookmarks Immatriculation

**⚠️ IMPORTANT** : Les bookmarks d'immatriculation ont un format différent selon les versions.

##### V0.2 à V0.5
```
Pattern: {scheme}_REG{L|R}_{X1}_{X2}_{X3}_{X4}_{X5}_{X6}_{Y}
Segments: 9 (scheme + L/R + 6 positions X + 1 position Y)
```

**Exemples** :
```
Zephir_REGL_-0.34_-0.28_-0.22_-0.16_-0.10_-0.04_0.0
Zephir_REGR_0.04_0.10_0.16_0.22_0.28_0.34_0.0
```

**Description** :
- 6 positions X pour les 6 lettres (ex: "N960TB")
- 1 position Y commune
- Direction positive  pour Left et Right ecriture de gauche à droite

##### V0.6
```
Pattern: {scheme}_REG{L|R}_{startX}_{Y}
Segments: 4 (scheme + L/R + 1 position X de départ + 1 position Y)
```

**Exemples** :
```
Zephir_REGL_-0.34_0.0
Zephir_REGR_0.04_0.0
```

**Description** :
- 1 seule position X de départ (startX)
- Le **signe est déjà dans startX** (négatif pour Left, positif pour Right)
- Direction positive  pour Left et Right ecriture de gauche à droite
- Les autres positions sont calculées automatiquement

---

### Configuration String

**Format** : Segments séparés par `/`

```
Version.960/Exterior_PaintScheme.Zephir_A-0/Decor.Studio_Ground/Spinner.MattBlack/...
```

**Ordre recommandé** :
1. `Version.{960|980}`
2. `Exterior_PaintScheme.{scheme}_{pairs}`
3. `Decor.{decor}_{position}`
4. `Spinner.{color}`
5. `Door_pilot.{Open|Closed}`
6. `Door_passenger.{Open|Closed}`
7. `Tablet.{Open|Closed}`
8. `SunGlass.{ON|OFF}`
9. `Lighting_Ceiling.{ON|OFF}`
10. `Lighting_mood.{ON|OFF}`
11. `Interior_*` (tous les paramètres intérieur)

---

## Patterns des Camera Groups

### Format XML

```xml
<Group id="{uuid}" name="{groupName}">
    <Camera id="{uuid}" name="{cameraName}" />
    <Camera id="{uuid}" name="{cameraName}" />
    ...
</Group>
```

### Types de groupes

#### 1. Exterieur

##### V0.1 & V0.2 
**Mode** : Image simple (pas de groupe)

Le paramètre `Decor` contient le nom de la caméra à utilsier pour faire l'image:
```
Decor.Studio_Camera1_0_0_0_0_90_0
       ↑       ↑
    Décor   Caméra
```

**Usage** : 1 image par caméra nommée

##### V0.3 à V0.6+
**Mode** : Groupe de caméras

```
Pattern: Exterieur_Decor{DecorName}
```

**Exemples** :
```
Exterieur_DecorStudio
Exterieur_DecorTarmac
Exterieur_DecorFjord
Exterieur_DecorHangar
Exterieur_DecorOnirique
```

**Contenu typique** : 5-6 caméras par groupe
- Vue avant
- Vue arrière
- Vue côté gauche
- Vue côté droit
- Vue 3/4 avant
- Vue 3/4 arrière

**Caméras immatriculation** :
```
RegistrationNumber_{paintScheme}
```
Exemples :
```
RegistrationNumber_Zephir
RegistrationNumber_Tehuano
RegistrationNumber_Sirocco
```

**⚠️ ATTENTION** : Utiliser `paintScheme` car la zone d'immatriculation et donc la camera dépendent du paintScheme

**Localisation** : Ces caméras sont dans le groupe **Configuration**

**Usage** : La vue Configuration filtre et affiche uniquement la caméra `RegistrationNumber_{paintSchemeActuel}`, dupliquée 10 fois avec les styles A-J pour permettre la prévisualisation de tous les styles d'immatriculation

---

#### 2. Interieur

**Disponibilité** : V0.1 à V0.6+

```
Pattern: Interieur (fixe)
```

**Contenu typique** : 4 caméras
- Vue habitacle avant
- Vue habitacle arrière
- Vue sièges pilote
- Vue sièges passagers


---

#### 3. Configuration

**Disponibilité** : V0.1 à V0.6+

```
Pattern: Configuration (fixe)
```

**Contenu typique** : 26 caméras (détails)
- Détails intérieur (carpet, leather, metal, stitching)
- Détails extérieur (spinner, paint zones)
- Vues spécifiques pour chaque paramètre configurable

**Ratio images** : Principalement 1:1 (800x800) pour détails

---

#### 4. Overview

**Disponibilité** : V0.1 à V0.6+

```
Pattern: Overview (fixe)
```

**Contenu typique** : 1-2 caméras (vue d'ensemble)

**V0.1-V0.2** : Groupe vide pas de caméra

---

## Règles de détection automatique

### Détection type de base (POC vs Production)

**Règle** : Si le paramètre `POC Decor` existe → Base  (V0.1), sinon →  (V0.2+)

```javascript
// database-analyzer.js ligne 31-36
const isPOC = paramNames.has('POC Decor');
const databaseType = isPOC ? 'POC' : 'Production';
```

---

### Détection version Production (V0.2 vs V0.3+)

**Règle** : Analyser le format du paramètre `Decor`

**V0.2** : Contient 9 segments avec coordonnées numériques
```
Decor.Studio_Camera1_0_0_0_0_90_0
      └─────┴──────┴────────────┘
     decorName  camera  coords(6)
```

**V0.3+** : Contient 2 segments avec Flight/Ground
```
Decor.Studio_Ground
      └─────┴──────┘
    decorName position
```

```javascript
// database-analyzer.js ligne 287-289
const hasFlightGround = samples.some(opt =>
    opt.value.endsWith('_Flight') || opt.value.endsWith('_Ground')
);
```

---

### Détection V0.6 (avec index)

**Règle** : Analyser le format du paramètre `Exterior_PaintScheme`

**V0.2-V0.5** : 6 segments
```
Exterior_PaintScheme.Zephir_A-0_A-D_A-D_A-D_A-D
                     └──────────────────────────┘
                        scheme + 5 paires
```

**V0.6** : 7 segments (index en 2ème position)
```
Exterior_PaintScheme.Zephir_1_A-0_A-D_A-D_A-D_A-D
                     └─────┴┴──────────────────────┘
                      scheme idx   5 paires
```

```javascript
// database-analyzer.js ligne 326-330
const hasIndex = samples.some(opt => {
    const parts = opt.label.split('_');
    // Si le 2ème segment est un chiffre pur, c'est un index V0.6
    return parts.length >= 2 && /^\d+$/.test(parts[1]);
});
```

---

### Détection format immatriculation (V0.2-V0.5 vs V0.6)

**Règle** : Analyser le nombre de segments dans le bookmark

**V0.2-V0.5** : 9 segments (6 positions X + 1 Y)
```
Zephir_REGL_-0.34_-0.28_-0.22_-0.16_-0.10_-0.04_0.0
           └──────────────────────────────────┘
                    9 parties total
```

**V0.6** : 4 segments (1 startX + 1 Y)
```
Zephir_REGL_-0.34_0.0
           └────────┘
           4 parties
```

```javascript
// positioning.js ligne 59-94
if (parts.length === 9) {
    // V0.2-V0.5 : Format long (6 positions)
    // ...
} else if (parts.length === 4) {
    // V0.6+ : Format court (1 seule position)
    // Direction TOUJOURS positive car le signe est déjà dans startX
    // ...
}
```

---

## Résumé des règles critiques

### 1. Paramètres POC (V0.1)
⚠️ **RÈGLE ABSOLUE** : Tous les paramètres préfixés "POC" ne sont  pas  implémentés dans le configurateur.

**Liste des paramètres POC à IGNORER** :
- POC Decor
- POC Door pilot
- POC Door passenger
- POC Sun glass
- POC Lighting ceiling
- POC Lighting mood 960
- POC Leather
- POC Stickers
- POC Storage left
- POC Storage right

### 2. Sources de vérité

**Pour les DONNÉES** : XML de l'API (`getDatabaseXML()`)
- Valeurs de configuration
- Paramètres de positionnement
- Groupes de caméras

**Pour la LOGIQUE** : Code JavaScript (`code/js/`)
- Structure des payloads API
- Nommage des textures et matériaux
- Algorithmes de calcul

### 3. Glossaire métier

**Décor** : Environnement de fond 3D (Studio, Tarmac, Fjord, Hangar, Onirique)

**Paint Scheme** : Schéma de peinture de l'avion (Zephir, Tehuano, Sirocco, Alize, Mistral, Meltem)


### 4. Système de couleurs immatriculation

**Mapping styles → paires** :
```
A ou F → paire[0]
B ou G → paire[1]
C ou H → paire[2]
D ou I → paire[3]
E ou J → paire[4]
```

**Layers (couches de couleur)** :

Le payload API utilise `materialMultiLayers` avec `diffuseColor` (couleur hex Lumiscaphe) pour coloriser les lettres.

Chaque paire `X-Y` définit 2 zones de couleur :
- **Layer 0** : diffuseColor = couleur zone X (1ère valeur) → LETTRE
- **Layer 1** : diffuseColor = couleur zone Y (2ème valeur) → CONTOUR/OMBRE

**Cas particulier paire `X-0`** (pas de 2ème zone) :
- **Layer 0** : diffuseColor = couleur zone X
- **Layer 1** : diffuseColor = couleur zone X (fallback)

**Nommage des textures** :
- Slanted (A-E) : `Style_A_Left_N`, `Style_A_Right_N` (AVEC Left/Right)
- Straight (F-J) : `Style_F_N` (SANS Left/Right)

---
**Document complet ! 📘**
