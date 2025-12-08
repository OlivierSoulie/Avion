# Analyse des Différences entre Bases de Données

**Date** : 07/12/2025
**Objectif** : Identifier les différences entre versions de bases XML pour Sprint #11
**Base de référence** : Dernière base (la plus complète)

---

## 📊 Vue d'ensemble

**Nombre de bases analysées** : 5 bases
- DAHER_TBM_V0.1 (78fb6c1a) - **TRÈS ANCIENNE** ❌
- Daher_TBM_V0.2 (9219c9f1) - **ANCIENNE** ⚠️
- Daher_TBM_V0.3 (986bc38e) - **RÉCENTE**
- Daher_TBM_V0.4 (8ad3eaf3) - **RÉCENTE**
- **Base de référence** (dernière) - **RÉFÉRENCE** ✅

**Statistiques globales** :
- ConfigurationBookmarks uniques : 46
- Groupes de caméras uniques : 23
- Parameters uniques : 46
- Prestiges uniques : 8

---

## 🔴 DAHER_TBM_V0.1 - Différences CRITIQUES

### Statut : ❌ **TRÈS INCOMPATIBLE** - Base de POC/Test

### Problèmes majeurs identifiés :

#### 1. **Prestiges TOUS manquants** (8/8)
```
- Oslo
- SanPedro
- London
- Labrador
- GooseBay
- BlackFriars
- Fjord
- Atacama
```
**Impact** : Configuration intérieur impossible

#### 2. **Schémas de peinture manquants** (5/6)
```
- Exterior_Alize
- Exterior_Meltem
- Exterior_Mistral
- Exterior_Sirocco
- Exterior_Tehuano
- Exterior_Zephyr (mais a "Zephir" sans 'y')
```
**Impact** : Seul "Zephir" disponible (orthographe différente)

#### 3. **Tous les bookmarks d'immatriculation manquants** (10)
```
Meltem_RegL/RegR
Mistral_RegL/RegR
Sirocco_RegL/RegR
Tehuano_RegL/RegR
Zephir_RegL/RegR
```
**Impact** : Immatriculation ne fonctionne pas

#### 4. **Groupes de caméras manquants** (6)
```
- Exterieur_DecorTarmac
- Exterieur_DecorOnirique
- Exterieur_DecorFjord
- Exterieur_DecorHangar
- Exterieur_DecorStudio
- StoragesAndOptions
```
**Impact** : Vue extérieure cassée, pas de vue stockages

#### 5. **Parameters manquants** (24/46 - 52% manquants !)
```
CRITIQUES :
- Decor
- Position
- Exterior_RegistrationNumber_Font
- Exterior_RegistrationNumber_Style

CONFIGURATION INTÉRIEUR :
- Interior_Carpet
- Interior_CentralSeatMaterial
- Interior_LowerSidePanel
- Interior_MetalFinish
- Interior_PerforatedSeatOptions
- Interior_SeatCovers
- Interior_Seatbelts
- Interior_Stitching
- Interior_TabletFinish
- Interior_Ultra-SuedeRibbon
- Interior_UpperSidePanel

PORTES & OPTIONS :
- Door_passenger
- Door_pilot
- SunGlass
- Tablet

STOCKAGES :
- StorageAndOptions_LeftSide
- StorageAndOptions_PilotAndCopilotAirbags
- StorageAndOptions_PrivacyCompartment
- StorageAndOptions_RightSide

ÉCLAIRAGE :
- Lighting_Ceiling
- Lighting_mood
```

#### 6. **Éléments supplémentaires (POC/Debug)**
```
ConfigurationBookmarks :
- 910/960 studio inter light/no light
- 960 sunrise/sunset
- Sirocco, Alize, Mistral, Meltem, Zephir, Tehunao (orthographe variée)

Groupes caméras :
- POC Help
- POC Configuration
- POC BACKPLATE TARMAC/ONIRIQUE/FJORD/HANGAR
- Exterieur (sans décor)
- Storages & option (au lieu de StoragesAndOptions)

Parameters :
- POC Decor
- POC Door passenger/pilot
- POC Leather
- POC Lighting ceiling/mood 960
- POC Stickers
- POC Storage left/right
- POC Sun glass
```

### ⚠️ Conclusion V0.1
**Cette base est une version POC/TEST non fonctionnelle avec le site actuel.**
**Recommandation** : NE PAS SUPPORTER - Trop de différences, trop ancienne.

---

## ⚠️ Daher_TBM_V0.2 - Différences IMPORTANTES

### Statut : ⚠️ **PARTIELLEMENT COMPATIBLE** - Base de transition

### Problèmes identifiés :

#### 1. **ConfigurationBookmarks manquants** (11)
```
- Exterior_Zephyr (orthographe avec 'y')
- Meltem_RegL/RegR (10 bookmarks immatriculation)
- Mistral_RegL/RegR
- Sirocco_RegL/RegR
- Tehuano_RegL/RegR
- Zephir_RegL/RegR
```
**Impact** : Immatriculation ne fonctionne pas (anchors manquants)

#### 2. **Groupes de caméras manquants** (6)
```
- Exterieur_DecorTarmac
- Exterieur_DecorOnirique
- Exterieur_DecorFjord
- Exterieur_DecorHangar
- Exterieur_DecorStudio
- StoragesAndOptions
```
**Impact** : Vue extérieure cassée (format ancien)

#### 3. **Groupes supplémentaires (ancienne version)**
```
- POC Help
- POC Configuration
- DecorTarmac (sans "Exterieur_Decor")
- DecorOnirique
- DecorFjord
- DecorHangar
- Exterieur (générique)
- Storages & option (au lieu de StoragesAndOptions)
- Vignettes propals
```

#### 4. **Parameters manquants** (5)
```
- Interior_Stitching
- Lighting_Ceiling
- Position
- SunGlass
- Tablet
```
**Impact** : Configuration intérieur incomplète

#### 5. **Parameters supplémentaires (ancien nommage)**
```
- Lighting_ceiling (au lieu de Lighting_Ceiling)
- Sun glass (au lieu de SunGlass)
```

### ✅ Points positifs V0.2
- **Tous les prestiges présents** (8/8) ✅
- **Schémas de peinture présents** (sauf orthographe Zephyr) ✅
- **ConfigurationBookmarks de base OK** ✅

### ⚠️ Conclusion V0.2
**Cette base est utilisable mais nécessite fallbacks pour :**
- Immatriculation (anchors manquants)
- Groupes caméras (ancien format)
- Quelques parameters (Stitching, Tablet, SunGlass)

---

## ✅ Daher_TBM_V0.3 - QUASI COMPLÈTE

### Statut : ✅ **TRÈS COMPATIBLE** - Presque identique à référence

### Différences mineures :

#### 1. **ConfigurationBookmarks manquants** (9 - uniquement immatriculation)
```
- Meltem_RegL/RegR (anciens anchors)
- Mistral_RegR (ancien)
- Sirocco_RegL/RegR (anciens)
- Tehuano_RegL/RegR (anciens)
- Zephir_RegL/RegR (anciens)
```

#### 2. **ConfigurationBookmarks supplémentaires** (5 - nouveaux anchors)
```
- Mistral_RegR_-0.675_-0.425_-0.175_0.75_0.325_0.575_0 (nouveau)
- Sirocco_RegL_-0.655_-0.405_-0.155_0.095_0.345_0.595_0 (nouveau)
- Sirocco_RegR_-0.675_-0.425_-0.175_0.075_0.325_0.575_0 (nouveau)
- Tehuano_RegL_0.66_0.41_0.16_-0.09_-0.34_-0.59_0 (nouveau - INVERSÉ)
- Tehuano_RegR_0.66_0.41_0.16_-0.09_-0.34_-0.59_0 (nouveau - INVERSÉ)
```

#### 3. **Groupes supplémentaires** (5)
```
- POC Help
- POC Configuration
- Exterieur
- Vignettes propals
- old
```

### ✅ Points positifs V0.3
- **TOUS les Parameters présents** ✅
- **TOUS les Prestiges présents** ✅
- **Groupes caméras principaux présents** ✅

### ✅ Conclusion V0.3
**Version de transition avec corrections d'anchors d'immatriculation.**
**Recommandation** : SUPPORTER avec fallback anchors anciens → nouveaux

---

## ✅ Daher_TBM_V0.4 - QUASI COMPLÈTE (identique V0.3)

### Statut : ✅ **TRÈS COMPATIBLE** - Identique à V0.3

**Mêmes différences que V0.3** (anchors immatriculation uniquement)

---

## 🎯 Recommandations pour Sprint #11

### Bases à supporter (par priorité)

1. **Base de référence (dernière)** ✅ **PRIORITÉ 1**
   - Version actuelle, complète, fonctionnelle
   - Aucune adaptation nécessaire

2. **Daher_TBM_V0.4** ✅ **PRIORITÉ 2**
   - Quasi identique à référence
   - Fallback anchors immatriculation uniquement

3. **Daher_TBM_V0.3** ✅ **PRIORITÉ 2**
   - Quasi identique à référence
   - Fallback anchors immatriculation uniquement

4. **Daher_TBM_V0.2** ⚠️ **PRIORITÉ 3 (optionnel)**
   - Nécessite plusieurs fallbacks
   - Base de transition, peu utilisée probablement

5. **DAHER_TBM_V0.1** ❌ **NE PAS SUPPORTER**
   - Trop ancienne, trop de différences (52% parameters manquants)
   - Version POC/Test non fonctionnelle
   - Coût de support trop élevé

---

## 📋 Stratégies de Fallback par Catégorie

### 1. **Prestiges (US-040 critique)**
```javascript
// V0.1 : AUCUN prestige → Fallback vers "Oslo" (premier de la liste référence)
// V0.2, V0.3, V0.4 : OK (8/8 présents)
```

### 2. **Schémas de peinture (US-040 critique)**
```javascript
// V0.1 : Seul "Zephir" → Bloquer sélection, afficher message
// Toutes autres : OK
```

### 3. **Anchors immatriculation (US-040)**
```javascript
// V0.2, V0.3, V0.4 : Anchors manquants
// Stratégie : Utiliser valeurs par défaut hardcodées (comme avant Sprint #2)
// Ou : Parser les nouveaux formats d'anchors si disponibles
```

### 4. **Groupes caméras (US-040 critique)**
```javascript
// V0.1, V0.2 : Groupes anciens formats
// Stratégie :
//   - Chercher "Exterieur_Decor{name}" (référence)
//   - Si absent, chercher "Decor{name}" (V0.2)
//   - Si absent, chercher "Exterieur" (V0.1)
//   - Si absent, erreur
```

### 5. **Parameters manquants (US-040)**
```javascript
// V0.1 : 52% manquants → NE PAS SUPPORTER
// V0.2 : 5 manquants (Stitching, Tablet, SunGlass, Position, Lighting_Ceiling)
//   → Masquer dropdowns correspondants dans l'UI
//   → Utiliser valeurs par défaut dans payload
// V0.3, V0.4 : OK (tous présents)
```

---

## 🔧 Actions Techniques Sprint #11

### US-039 : Recharger config par défaut (2 SP)
**Implémentation** :
1. Appeler `loadDefaultConfigFromXML()` après changement de base
2. Réinitialiser TOUS les dropdowns (pas seulement version/paintScheme)
3. Invalider cache XML ✅ (déjà fait)

### US-040 : Validation valeurs avant rendu (3 SP)
**Implémentation** :
1. Créer fonction `validateConfigForDatabase(config, xmlDoc)`
2. Pour chaque paramètre config :
   - Vérifier existence dans xmlDoc
   - Si absent : Fallback vers valeur par défaut de la base actuelle
   - Logger les corrections
3. Gérer cas spéciaux :
   - Prestiges : V0.1 → Fallback "Oslo"
   - Groupes caméras : Chercher formats alternatifs
   - Anchors immatriculation : Utiliser defaults

### US-041 : Indicateur compatibilité (2 SP)
**Implémentation** :
1. Badge dans UI :
   - ✅ Vert : 100% compatible (V0.3, V0.4, référence)
   - ⚠️ Orange : Compatible avec fallbacks (V0.2)
   - ❌ Rouge : Incompatible (V0.1)
2. Tooltip avec détails corrections appliquées

---

## ❓ Questions pour Olivier

1. **Support V0.1** : Confirmes-tu qu'on ne supporte PAS la V0.1 ? (POC trop ancienne)
2. **Support V0.2** : Veux-tu supporter la V0.2 malgré les fallbacks nécessaires ?
3. **Priorité** : Focus sur V0.3 + V0.4 + Référence uniquement ?
4. **Anchors immatriculation** : Utiliser defaults hardcodés ou parser nouveaux formats V0.3/V0.4 ?

---

**Prochaine étape** : Attendre validation Olivier puis contacter ARCH pour décomposition technique.
