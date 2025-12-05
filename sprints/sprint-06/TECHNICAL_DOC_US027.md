# Documentation Technique - US-027 : Configuration Intérieur Personnalisée

**User Story** : US-027
**Sprint** : Sprint #6
**Date** : 05/12/2025
**Version** : 1.0

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture implémentée](#architecture-implémentée)
3. [Fichiers modifiés](#fichiers-modifiés)
4. [Fonctions clés](#fonctions-clés)
5. [Format des données](#format-des-données)
6. [Flux de données](#flux-de-données)
7. [Points d'attention](#points-dattention)
8. [Tests et validation](#tests-et-validation)

---

## Vue d'ensemble

### Objectif

Implémenter un configurateur intérieur complet avec **10 paramètres personnalisables** :
- 4 paramètres pour les sièges
- 6 paramètres pour les matériaux et finitions

### Caractéristiques principales

- **Initialisation depuis Prestige** : Les 10 dropdowns sont automatiquement remplis depuis le XML
- **Personnalisation individuelle** : Chaque dropdown peut être modifié indépendamment
- **Visibilité conditionnelle** : Visible uniquement en vue intérieure
- **Génération dynamique du payload** : La config string est construite dynamiquement à partir des 10 valeurs

### Innovation

Cette fonctionnalité **n'existe pas dans le script Python** `generate_full_render.py`. C'est une **innovation web exclusive** qui étend les capacités du configurateur.

---

## Architecture implémentée

### Schéma de flux

```
[Utilisateur] → [Dropdown Prestige]
                      ↓
        [parsePrestigeConfig()] ← [XML API]
                      ↓
        [updateConfig() × 10] → [State]
                      ↓
        [Event onChange] → [triggerRender()]
                      ↓
        [getConfigString()] → [Construit config avec 10 parties]
                      ↓
        [buildPayload()] → [API Lumiscaphe]
                      ↓
        [Rendu images] → [Carrousel]
```

### Couches de l'architecture

#### Layer 1 : Configuration (config.js)
- Définition des 10 listes de choix (constantes exportées)
- Valeurs par défaut (DEFAULT_CONFIG)

#### Layer 2 : État (state.js)
- Stockage des 10 propriétés dans `state.config`
- 10 getters pour lire les valeurs

#### Layer 3 : Parsing XML (api.js)
- `parsePrestigeConfig()` : Parse le XML pour extraire les 10 valeurs d'un prestige
- `getConfigString()` : Construit la config string avec les 10 parties

#### Layer 4 : Interface utilisateur (index.html + app.js)
- 10 dropdowns organisés en 2 sections
- Event listeners pour initialisation et modifications
- Fonction `toggleInteriorConfig()` pour affichage conditionnel

#### Layer 5 : Styles (main.css)
- Styles pour les 2 sous-sections
- Regroupement visuel clair

---

## Fichiers modifiés

### 1. `code/js/config.js`

**Rôle** : Définir les listes de choix et valeurs par défaut

**Modifications** :
- Ajout de 10 constantes exportées (lignes 79-185) :
  - `SEAT_COVERS_LIST` : 46 couleurs de cuir
  - `SEATBELTS_LIST` : 4 couleurs de ceintures
  - `CENTRAL_SEAT_MATERIAL_LIST` : 2 matériaux
  - `PERFORATED_SEAT_OPTIONS_LIST` : 2 options perforation
  - `CARPET_LIST` : 3 couleurs de tapis
  - `TABLET_FINISH_LIST` : 4 finitions bois
  - `METAL_FINISH_LIST` : 3 finitions métalliques
  - `UPPER_SIDE_PANEL_LIST` : Réutilise SEAT_COVERS_LIST
  - `LOWER_SIDE_PANEL_LIST` : Réutilise SEAT_COVERS_LIST
  - `ULTRA_SUEDE_RIBBON_LIST` : 12 couleurs Ultra-Suede

- Ajout de 10 propriétés dans `DEFAULT_CONFIG` (lignes 208-218) :
  ```javascript
  carpet: "LightBrown_carpet_Premium",
  seatCovers: "BeigeGray_2176_Leather_Premium",
  tabletFinish: "SapelliMat_table_wood_Premium",
  seatbelts: "OatMeal_belt",
  metalFinish: "BrushedStainless_metal_Premium",
  upperSidePanel: "WhiteSand_2192_Leather_Premium",
  lowerSidePanel: "BeigeGray_2176_Leather_Premium",
  ultraSuedeRibbon: "Elephant_3367_Suede_Premium",
  centralSeatMaterial: "Leather_Premium",
  perforatedSeatOptions: "NoSeatPerforation_Premium"
  ```

**Note importante** : Les valeurs par défaut correspondent au **Prestige Oslo**.

---

### 2. `code/js/state.js`

**Rôle** : Gérer l'état global de l'application

**Modifications** :
- Ajout de 10 propriétés dans `state.config` (lignes 31-41)
- Ajout de 10 getters (lignes 155-233) :
  - `getCarpet()`
  - `getSeatCovers()`
  - `getTabletFinish()`
  - `getSeatbelts()`
  - `getMetalFinish()`
  - `getUpperSidePanel()`
  - `getLowerSidePanel()`
  - `getUltraSuedeRibbon()`
  - `getCentralSeatMaterial()`
  - `getPerforatedSeatOptions()`

**Utilisation** :
```javascript
import { getCarpet, getSeatCovers } from './state.js';

const carpet = getCarpet(); // Ex: "LightBrown_carpet_Premium"
```

---

### 3. `code/js/api.js`

**Rôle** : Intégration API Lumiscaphe + parsing XML

**Modifications principales** :

#### A. Fonction `parsePrestigeConfig()` (lignes 241-295)

Parse le XML pour extraire les 10 valeurs d'un prestige.

```javascript
export function parsePrestigeConfig(xmlDoc, prestigeName) {
    // Cherche ConfigurationBookmark[label="Interior_PrestigeSelection_{prestigeName}"]
    const bookmark = xmlDoc.querySelector(`ConfigurationBookmark[label="${bookmarkLabel}"]`);

    // Extrait l'attribut value (format: Interior_Carpet.XXX/Interior_CentralSeatMaterial.YYY/...)
    const value = bookmark.getAttribute('value');

    // Split par '/' et parse chaque partie
    const parts = value.split('/');
    const config = {};

    parts.forEach(part => {
        if (part.startsWith('Interior_Carpet.')) {
            config.carpet = part.replace('Interior_Carpet.', '');
        }
        // ... idem pour les 9 autres propriétés
    });

    return config; // Objet avec 10 propriétés
}
```

**Input** :
- `xmlDoc` : Document XML parsé
- `prestigeName` : Nom du prestige (ex: "Oslo")

**Output** :
```javascript
{
    carpet: "LightBrown_carpet_Premium",
    centralSeatMaterial: "Leather_Premium",
    lowerSidePanel: "BeigeGray_2176_Leather_Premium",
    metalFinish: "BrushedStainless_metal_Premium",
    perforatedSeatOptions: "NoSeatPerforation_Premium",
    seatCovers: "BeigeGray_2176_Leather_Premium",
    seatbelts: "OatMeal_belt",
    tabletFinish: "SapelliMat_table_wood_Premium",
    ultraSuedeRibbon: "Elephant_3367_Suede_Premium",
    upperSidePanel: "WhiteSand_2192_Leather_Premium"
}
```

**Gestion d'erreur** :
- Throw Error si bookmark introuvable
- Throw Error si valeur absente

---

#### B. Fonction `getConfigString()` (lignes 188-233)

Construit la config string complète en utilisant les 10 valeurs individuelles.

**AVANT US-027** (ligne 197) :
```javascript
const interiorConfig = getConfigFromLabel(xmlRoot, `Interior_PrestigeSelection_${config.prestige}`)
    || `Interior_PrestigeSelection.${config.prestige}`;
```

**APRÈS US-027** (lignes 197-209) :
```javascript
// US-027 : Construire config intérieur personnalisée (10 parties)
const interiorConfig = [
    `Interior_Carpet.${config.carpet}`,
    `Interior_CentralSeatMaterial.${config.centralSeatMaterial}`,
    `Interior_LowerSidePanel.${config.lowerSidePanel}`,
    `Interior_MetalFinish.${config.metalFinish}`,
    `Interior_PerforatedSeatOptions.${config.perforatedSeatOptions}`,
    `Interior_SeatCovers.${config.seatCovers}`,
    `Interior_Seatbelts.${config.seatbelts}`,
    `Interior_TabletFinish.${config.tabletFinish}`,
    `Interior_Ultra-SuedeRibbon.${config.ultraSuedeRibbon}`,
    `Interior_UpperSidePanel.${config.upperSidePanel}`
].join('/');
```

**Note critique** : L'ordre des 10 parties **DOIT** correspondre à l'ordre du XML pour éviter des bugs.

---

#### C. Export `getDatabaseXML()` (ligne 306)

La fonction était déjà présente mais **non exportée**. Elle est maintenant exportée pour permettre l'utilisation dans `app.js` (event listener prestige).

```javascript
export async function getDatabaseXML() {
    // ... télécharge et parse le XML
}
```

---

### 4. `code/index.html`

**Rôle** : Structure HTML de l'interface

**Modifications** : Ajout de la section complète (lignes 269-352)

**Structure ajoutée** :
```html
<div id="interior-config-section" class="config-section" style="display: none;">
    <h3>Configuration Intérieur</h3>

    <!-- SECTION 1 : SIÈGES -->
    <div class="interior-subsection">
        <h4>Sièges</h4>
        <!-- 4 dropdowns : seat-covers, seatbelts, central-seat-material, perforated-seat-options -->
    </div>

    <!-- SECTION 2 : MATÉRIAUX ET FINITIONS -->
    <div class="interior-subsection">
        <h4>Matériaux et finitions</h4>
        <!-- 6 dropdowns : carpet, tablet-finish, metal-finish, upper-side-panel, lower-side-panel, ultra-suede-ribbon -->
    </div>
</div>
```

**IDs des dropdowns** :
- `seat-covers`
- `seatbelts`
- `central-seat-material`
- `perforated-seat-options`
- `carpet`
- `tablet-finish`
- `metal-finish`
- `upper-side-panel`
- `lower-side-panel`
- `ultra-suede-ribbon`

---

### 5. `code/js/app.js`

**Rôle** : Point d'entrée principal + event listeners

**Modifications principales** :

#### A. Import des listes (lignes 16-26)
```javascript
import {
    CARPET_LIST,
    SEAT_COVERS_LIST,
    TABLET_FINISH_LIST,
    SEATBELTS_LIST,
    METAL_FINISH_LIST,
    UPPER_SIDE_PANEL_LIST,
    LOWER_SIDE_PANEL_LIST,
    ULTRA_SUEDE_RIBBON_LIST,
    CENTRAL_SEAT_MATERIAL_LIST,
    PERFORATED_SEAT_OPTIONS_LIST
} from './config.js';
```

#### B. Import fonction parsing (ligne 29)
```javascript
import { parsePrestigeConfig, getDatabaseXML } from './api.js';
```

#### C. Fonction `populateDropdown()` (lignes 67-92)

Peuple un dropdown avec une liste d'options au format `{label, value}`.

```javascript
function populateDropdown(selectId, optionsList, defaultValue) {
    const select = document.getElementById(selectId);
    select.innerHTML = '';

    optionsList.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        if (option.value === defaultValue) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });
}
```

#### D. Peuplement initial des dropdowns (dans `initApp()`)

```javascript
const config = getConfig();

populateDropdown('carpet', CARPET_LIST, config.carpet);
populateDropdown('seat-covers', SEAT_COVERS_LIST, config.seatCovers);
populateDropdown('tablet-finish', TABLET_FINISH_LIST, config.tabletFinish);
populateDropdown('seatbelts', SEATBELTS_LIST, config.seatbelts);
populateDropdown('metal-finish', METAL_FINISH_LIST, config.metalFinish);
populateDropdown('upper-side-panel', UPPER_SIDE_PANEL_LIST, config.upperSidePanel);
populateDropdown('lower-side-panel', LOWER_SIDE_PANEL_LIST, config.lowerSidePanel);
populateDropdown('ultra-suede-ribbon', ULTRA_SUEDE_RIBBON_LIST, config.ultraSuedeRibbon);
populateDropdown('central-seat-material', CENTRAL_SEAT_MATERIAL_LIST, config.centralSeatMaterial);
populateDropdown('perforated-seat-options', PERFORATED_SEAT_OPTIONS_LIST, config.perforatedSeatOptions);
```

#### E. Event listener Prestige (initialisation des 10 dropdowns)

```javascript
document.getElementById('selectPrestige').addEventListener('change', async (e) => {
    const prestigeName = e.target.value;
    console.log(`🎨 Changement de prestige: ${prestigeName}`);

    try {
        // 1. Télécharger le XML
        const xmlDoc = await getDatabaseXML();

        // 2. Parser la config du prestige
        const prestigeConfig = parsePrestigeConfig(xmlDoc, prestigeName);

        // 3. Mettre à jour l'état (10 fois)
        updateConfig('carpet', prestigeConfig.carpet);
        updateConfig('seatCovers', prestigeConfig.seatCovers);
        // ... 8 autres updateConfig()

        // 4. Mettre à jour les dropdowns visuellement (10 fois)
        document.getElementById('carpet').value = prestigeConfig.carpet;
        document.getElementById('seat-covers').value = prestigeConfig.seatCovers;
        // ... 8 autres updates

        // 5. Déclencher nouveau rendu
        triggerRender();

    } catch (error) {
        console.error('❌ Erreur parsing prestige:', error);
        showError('Erreur lors du chargement du prestige');
    }
});
```

**Note** : Fonction **async** car télécharge le XML.

#### F. Event listeners sur les 10 dropdowns individuels

```javascript
document.getElementById('carpet').addEventListener('change', (e) => {
    updateConfig('carpet', e.target.value);
    triggerRender();
});

document.getElementById('seat-covers').addEventListener('change', (e) => {
    updateConfig('seatCovers', e.target.value);
    triggerRender();
});

// ... idem pour les 8 autres dropdowns
```

Chaque changement déclenche :
1. Mise à jour du state
2. Nouveau rendu API

#### G. Fonction `toggleInteriorConfig()`

Affiche/masque la section selon le type de vue.

```javascript
function toggleInteriorConfig(viewType) {
    const section = document.getElementById('interior-config-section');
    if (viewType === 'interior') {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

// Appelée au changement de vue
document.getElementById('btnViewExterior').addEventListener('click', () => {
    updateConfig('viewType', 'exterior');
    toggleInteriorConfig('exterior');
    triggerRender();
});

document.getElementById('btnViewInterior').addEventListener('click', () => {
    updateConfig('viewType', 'interior');
    toggleInteriorConfig('interior');
    triggerRender();
});

// Appelée au chargement initial
toggleInteriorConfig(getConfig().viewType);
```

---

### 6. `code/styles/main.css`

**Rôle** : Styles CSS pour la section intérieur

**Styles ajoutés** :

```css
/* US-027 : Configuration Intérieur */
#interior-config-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #0066cc;
}

.interior-subsection {
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.interior-subsection h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: #555;
    font-weight: 600;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 0.5rem;
}
```

**Caractéristiques** :
- Fond gris clair pour distinction visuelle
- 2 sous-sections avec fond blanc + ombre
- Bordure gauche bleue pour identification rapide

---

## Fonctions clés

### Résumé des fonctions importantes

| Fonction | Fichier | Rôle | Type |
|----------|---------|------|------|
| `parsePrestigeConfig()` | api.js | Parse XML pour extraire 10 valeurs prestige | async |
| `getConfigString()` | api.js | Construit config string avec 10 parties | sync |
| `populateDropdown()` | app.js | Peuple un dropdown avec options {label, value} | sync |
| `toggleInteriorConfig()` | app.js | Affiche/masque section intérieur | sync |
| `getCarpet()`, `getSeatCovers()`, etc. | state.js | Getters pour lire valeurs state | sync |

---

## Format des données

### Format des listes (config.js)

Toutes les listes suivent le format `{label, value}` :

```javascript
export const CARPET_LIST = [
    { label: "Charcoal Black", value: "CharcoalBlack_carpet_Premium" },
    { label: "Light Brown", value: "LightBrown_carpet_Premium" },
    { label: "Taupe Gray", value: "TaupeGray_carpet_Premium" }
];
```

- **label** : Texte affiché à l'utilisateur (lisible)
- **value** : Valeur technique envoyée à l'API (format Lumiscaphe)

### Format config string XML (format Prestige)

Dans le XML, un prestige est stocké comme :

```xml
<ConfigurationBookmark
    label="Interior_PrestigeSelection_Oslo"
    value="Interior_Carpet.LightBrown_carpet_Premium/Interior_CentralSeatMaterial.Leather_Premium/Interior_LowerSidePanel.BeigeGray_2176_Leather_Premium/Interior_MetalFinish.BrushedStainless_metal_Premium/Interior_PerforatedSeatOptions.NoSeatPerforation_Premium/Interior_SeatCovers.BeigeGray_2176_Leather_Premium/Interior_Seatbelts.OatMeal_belt/Interior_TabletFinish.SapelliMat_table_wood_Premium/Interior_Ultra-SuedeRibbon.Elephant_3367_Suede_Premium/Interior_UpperSidePanel.WhiteSand_2192_Leather_Premium"
/>
```

**Format** : `Interior_{Property}.{Value}` séparés par `/`

### Format config string construite (envoyée à l'API)

Exemple de config string complète générée par `getConfigString()` :

```
Version.960/
Exterior_PaintScheme.Sirocco/
Interior_Carpet.LightBrown_carpet_Premium/
Interior_CentralSeatMaterial.Leather_Premium/
Interior_LowerSidePanel.BeigeGray_2176_Leather_Premium/
Interior_MetalFinish.BrushedStainless_metal_Premium/
Interior_PerforatedSeatOptions.NoSeatPerforation_Premium/
Interior_SeatCovers.BeigeGray_2176_Leather_Premium/
Interior_Seatbelts.OatMeal_belt/
Interior_TabletFinish.SapelliMat_table_wood_Premium/
Interior_Ultra-SuedeRibbon.Elephant_3367_Suede_Premium/
Interior_UpperSidePanel.WhiteSand_2192_Leather_Premium/
Decor.Tarmac_Ground/
Position.exterior/
Exterior_Spinner.PolishedAluminium/
SunGlass.SunGlassOFF/
Tablet.Closed/
Door_pilot.Closed/
Door_passenger.Closed
```

**IMPORTANT** : L'ordre des 10 parties intérieur **DOIT** correspondre à l'ordre alphabétique du XML.

---

## Flux de données

### Flux 1 : Initialisation depuis Prestige

```
[User clique dropdown Prestige]
         ↓
[Event listener 'change' déclenché]
         ↓
[getDatabaseXML()] → Télécharge XML (ou utilise cache)
         ↓
[parsePrestigeConfig(xmlDoc, "Oslo")] → Parse les 10 valeurs
         ↓
[updateConfig() × 10] → Met à jour state
         ↓
[document.getElementById().value = ...] × 10 → Met à jour UI
         ↓
[triggerRender()] → Génère nouveau rendu API
```

### Flux 2 : Modification individuelle

```
[User change dropdown "carpet"]
         ↓
[Event listener 'change' déclenché]
         ↓
[updateConfig('carpet', newValue)] → Met à jour state
         ↓
[triggerRender()] → Génère nouveau rendu API
         ↓
[buildPayload()] → Construit payload avec nouvelle valeur
         ↓
[getConfigString()] → Utilise config.carpet du state
         ↓
[API Lumiscaphe] → Rendu généré
```

### Flux 3 : Changement de vue Ext/Int

```
[User clique "Intérieur"]
         ↓
[updateConfig('viewType', 'interior')]
         ↓
[toggleInteriorConfig('interior')] → Affiche section
         ↓
[triggerRender()] → Rendu avec camera group "Interieur"
```

---

## Points d'attention

### 1. Ordre des parties dans config string

**CRITIQUE** : L'ordre des 10 parties `Interior_XXX` dans `getConfigString()` doit correspondre à l'ordre du XML.

**Ordre actuel** (alphabétique) :
1. Carpet
2. CentralSeatMaterial
3. LowerSidePanel
4. MetalFinish
5. PerforatedSeatOptions
6. SeatCovers
7. Seatbelts
8. TabletFinish
9. Ultra-SuedeRibbon
10. UpperSidePanel

**Risque** : Si l'ordre change, l'API pourrait rejeter la requête ou appliquer les mauvaises valeurs.

---

### 2. Cache XML

La fonction `getDatabaseXML()` utilise un cache (`cachedXML`) pour éviter de télécharger le XML à chaque appel.

**Invalidation du cache** :
```javascript
// Dans setDatabaseId()
cachedXML = null; // Force le rechargement
```

**Attention** : Si vous modifiez la base de données, le cache doit être invalidé.

---

### 3. Export getDatabaseXML()

La fonction **doit être exportée** dans `api.js` pour être utilisée dans `app.js` (event listener prestige).

Si l'export est manquant → Erreur : `getDatabaseXML is not defined`

---

### 4. Nommage des IDs HTML

Les IDs des dropdowns utilisent **kebab-case** (ex: `seat-covers`), mais les propriétés du state utilisent **camelCase** (ex: `seatCovers`).

**Mapping** :
| ID HTML | Propriété state |
|---------|----------------|
| `seat-covers` | `seatCovers` |
| `central-seat-material` | `centralSeatMaterial` |
| `perforated-seat-options` | `perforatedSeatOptions` |
| `tablet-finish` | `tabletFinish` |
| `metal-finish` | `metalFinish` |
| `upper-side-panel` | `upperSidePanel` |
| `lower-side-panel` | `lowerSidePanel` |
| `ultra-suede-ribbon` | `ultraSuedeRibbon` |

**Attention** : Bien faire la conversion lors des event listeners.

---

### 5. Réutilisation des listes

Les listes `UPPER_SIDE_PANEL_LIST` et `LOWER_SIDE_PANEL_LIST` **réutilisent** `SEAT_COVERS_LIST` (même 46 couleurs de cuir).

```javascript
export const UPPER_SIDE_PANEL_LIST = SEAT_COVERS_LIST;
export const LOWER_SIDE_PANEL_LIST = SEAT_COVERS_LIST;
```

**Avantage** : Maintenance simplifiée (une seule liste à mettre à jour)

**Attention** : Si vous modifiez `SEAT_COVERS_LIST`, les panneaux latéraux sont affectés.

---

### 6. Gestion d'erreur parsePrestigeConfig()

La fonction `parsePrestigeConfig()` throw une erreur si le prestige n'existe pas dans le XML.

**Bonne pratique** : Toujours wrapper dans un try/catch :

```javascript
try {
    const config = parsePrestigeConfig(xmlDoc, prestigeName);
} catch (error) {
    console.error('Prestige introuvable:', error);
    // Fallback : utiliser valeurs par défaut
}
```

---

### 7. Performance

Chaque changement de dropdown déclenche un appel API (2-5 secondes).

**Optimisation possible** (non implémentée dans US-027) :
- Debounce des changements rapides
- Bouton "Appliquer" au lieu de rendu automatique

**Actuel** : Rendu automatique pour meilleure UX.

---

### 8. Persistance des valeurs

Les 10 valeurs intérieures sont **conservées en mémoire** mais **réinitialisées** si :
- L'utilisateur recharge la page (F5)
- L'utilisateur change de prestige (remplit les 10 valeurs depuis le XML)

**Pas de persistance localStorage** : Les valeurs sont perdues au rechargement.

---

## Tests et validation

### Tests fonctionnels (QA validé : 60/60 PASS)

#### A. Interface utilisateur (10/10 PASS)
- ✅ 10 dropdowns visibles en vue intérieure
- ✅ 10 dropdowns masqués en vue extérieure
- ✅ Labels en français clairs et cohérents
- ✅ 2 sections distinctes : "Sièges" et "Matériaux et finitions"
- ✅ Design visuel propre et cohérent

#### B. Initialisation Prestige (20/20 PASS)
- ✅ Oslo → 10 dropdowns remplis correctement
- ✅ London → 10 dropdowns changent
- ✅ Atacama → 10 dropdowns changent
- ✅ SanPedro, Labrador, GooseBay, BlackFriars, Fjord testés
- ✅ Console sans erreurs

#### C. Personnalisation individuelle (10/10 PASS)
- ✅ Tapis → Rendu change
- ✅ Cuir des sièges → Rendu change
- ✅ Bois de la tablette → Rendu change
- ✅ Modifications multiples appliquées
- ✅ Console sans erreurs

#### D. Persistance état (5/5 PASS)
- ✅ Valeurs conservées au changement de vue
- ✅ Valeurs réinitialisées au changement prestige

#### E. Payload API (10/10 PASS)
- ✅ 10 parties `Interior_XXX.YYY` présentes
- ✅ `Interior_PrestigeSelection` ABSENT
- ✅ Ordre correct (alphabétique)
- ✅ Format valide
- ✅ API accepte le payload

#### F. Cas limites (5/5 PASS)
- ✅ Changements rapides sans race condition
- ✅ Toutes options testées (46 cuirs, etc.)
- ✅ Design responsive (mobile/tablet)

### Tests unitaires recommandés (non implémentés)

```javascript
// Test parsePrestigeConfig()
test('parsePrestigeConfig should extract 10 properties', () => {
    const mockXML = /* ... */;
    const config = parsePrestigeConfig(mockXML, 'Oslo');

    expect(config).toHaveProperty('carpet');
    expect(config).toHaveProperty('seatCovers');
    // ... 8 autres assertions
});

// Test getConfigString()
test('getConfigString should include 10 interior parts', () => {
    const mockConfig = { /* ... */ };
    const configString = getConfigString(mockXMLDoc, mockConfig);

    expect(configString).toContain('Interior_Carpet.');
    expect(configString).toContain('Interior_SeatCovers.');
    // ... 8 autres assertions
});
```

---

## Métriques de succès

| Métrique | Objectif | Résultat |
|----------|----------|----------|
| Fonctionnel | 100% tests QA pass | ✅ 60/60 PASS |
| Performance | Changement prestige < 1s | ✅ ~500ms |
| UX | Rendu dropdown < 2s | ✅ ~2s |
| Code Quality | Aucune erreur console | ✅ 0 erreur |
| DoD | Tous critères validés | ✅ 100% |

---

## Maintenance future

### Comment ajouter un nouveau paramètre intérieur

Si vous devez ajouter un 11ème paramètre (ex: "Rideaux") :

1. **config.js** :
   - Ajouter `CURTAINS_LIST`
   - Ajouter `curtains` dans `DEFAULT_CONFIG`

2. **state.js** :
   - Ajouter `curtains` dans `state.config`
   - Ajouter `getCurtains()`

3. **api.js** :
   - Ajouter parsing `Interior_Curtains` dans `parsePrestigeConfig()`
   - Ajouter `Interior_Curtains.${config.curtains}` dans `getConfigString()`

4. **index.html** :
   - Ajouter dropdown `<select id="curtains">`

5. **app.js** :
   - Import `CURTAINS_LIST`
   - Appeler `populateDropdown('curtains', CURTAINS_LIST, config.curtains)`
   - Ajouter event listener sur `#curtains`

6. **Tests** :
   - Valider que la 11ème partie apparaît dans le payload

---

### Comment modifier une liste existante

Exemple : Ajouter une nouvelle couleur de cuir

1. **config.js** :
   ```javascript
   export const SEAT_COVERS_LIST = [
       // ... existant ...
       { label: "New Color 9999", value: "NewColor_9999_Leather_Premium" }
   ];
   ```

2. **Vérifier** :
   - La nouvelle couleur apparaît dans les dropdowns
   - Elle fonctionne avec l'API

**Attention** : Si la valeur n'existe pas dans le XML, l'API rejettera la requête.

---

### Comment débugger un problème de prestige

1. **Ouvrir console** (F12)
2. **Changer de prestige**
3. **Observer les logs** :
   ```
   🔍 Parsing prestige config: Oslo
      Config string prestige: Interior_Carpet.LightBrown_carpet_Premium/...
      Prestige config parsed: { carpet: "...", seatCovers: "...", ... }
   ```
4. **Vérifier** :
   - Les 10 propriétés sont présentes
   - Les valeurs correspondent au XML

---

## Références

- **Sprint Backlog** : `sprints/sprint-06/sprint-backlog.md`
- **Guide utilisateur** : `docs/USER_GUIDE_US027.md`
- **Code source** :
  - `code/js/config.js` (listes)
  - `code/js/state.js` (état)
  - `code/js/api.js` (parsing + payload)
  - `code/js/app.js` (event listeners)
  - `code/index.html` (UI)
  - `code/styles/main.css` (styles)

---

**Version** : 1.0
**Dernière mise à jour** : 05/12/2025
**Statut** : ✅ Implémenté et validé (60/60 tests PASS)
