# Sprint #13 - Backlog

**Sprint Goal** : "Refactoring complet du code pour maintenabilité et lisibilité maximales"

**Dates** : 06/12/2025 - [À déterminer]
**Story Points** : 8 SP
**Équipe** : DEV, ARCH, QA

---

## 📊 Vue d'ensemble

| User Story | Story Points | Status |
|------------|--------------|--------|
| US-043 : Refactoring complet du code | 8 SP | To Do |

**Total Sprint** : 8 SP

---

## 🎯 US-043 : Refactoring complet du code

**Principe fondamental** : **"Une fonction = une action"** (Single Responsibility Principle)

**État actuel du code** :
- Total : 5500 lignes JavaScript
- api.js : 1633 lignes
- app.js : 1651 lignes
- ui.js : 1097 lignes
- colors.js : 342 lignes
- positioning.js : 252 lignes
- state.js : 373 lignes
- config.js : 115 lignes
- logger.js : 37 lignes

**Objectif cible** :
- Total : ~3850 lignes (-30%)
- Fichiers modulaires organisés en sous-dossiers
- 100% fonctions documentées
- Max 20 lignes par fonction

---

## 📋 Tâches Détaillées

### Phase 1 : Analyse et Setup (3h)

#### [T043-1] Audit complet du code et identification des zones critiques (2h)

**Description** : Analyser l'ensemble du code pour identifier les duplications, fonctions trop longues, et opportunités de refactoring.

**Livrables** :
- [ ] Liste complète des fonctions >30 lignes
- [ ] Liste des duplications de code
- [ ] Liste des fonctions sans JSDoc
- [ ] Liste du code mort (variables/fonctions non utilisées)
- [ ] Carte de dépendances entre fichiers

**Fichiers à auditer** :
- `code/js/api.js` (1633 lignes - priorité haute)
- `code/js/app.js` (1651 lignes - priorité haute)
- `code/js/ui.js` (1097 lignes - priorité haute)
- `code/js/colors.js` (342 lignes - priorité moyenne)
- `code/js/positioning.js` (252 lignes - priorité basse)
- `code/js/state.js` (373 lignes - priorité moyenne)

**Outils** :
- Lecture manuelle du code
- Recherche de patterns répétés
- Analyse de la complexité

---

#### [T043-2] Configuration ESLint + Prettier (1h)

**Description** : Installer et configurer les outils de linting et formatage selon les standards Airbnb.

**Configuration ESLint** : Créer `.eslintrc.json`
```json
{
  "extends": "airbnb-base",
  "env": {
    "browser": true,
    "es2021": true
  },
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-console": "off",
    "max-len": ["error", { "code": 120, "ignoreComments": true }],
    "complexity": ["error", 10],
    "max-lines-per-function": ["warn", { "max": 20, "skipBlankLines": true, "skipComments": true }],
    "no-use-before-define": ["error", { "functions": false }],
    "import/extensions": ["error", "always"]
  }
}
```

**Configuration Prettier** : Créer `.prettierrc.json`
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 120,
  "tabWidth": 4,
  "semi": true,
  "arrowParens": "always"
}
```

**Scripts NPM** : Créer `package.json` (optionnel - si Node.js disponible)
```json
{
  "name": "configurateur-daher",
  "version": "1.0.0",
  "scripts": {
    "lint": "eslint code/js/**/*.js",
    "lint:fix": "eslint code/js/**/*.js --fix",
    "format": "prettier --write 'code/js/**/*.js'"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-plugin-import": "^2.25.0",
    "prettier": "^3.0.0"
  }
}
```

**Note** : Si npm non disponible, appliquer les règles manuellement

**Critères de validation** :
- [ ] `.eslintrc.json` créé avec config Airbnb
- [ ] `.prettierrc.json` créé
- [ ] `package.json` créé (optionnel)
- [ ] Linter testé sur un fichier exemple

---

### Phase 2 : Refactoring api.js (4h)

**Fichier le plus critique** : 1633 lignes → objectif 1100 lignes (-33%)

#### [T043-3] Extraction module xml-parser.js (1h)

**Description** : Extraire toutes les fonctions liées au parsing XML dans un module dédié.

**Nouveau fichier** : `code/js/api/xml-parser.js`

**Fonctions à extraire** :
```javascript
// Fonctions XML (existantes dans api.js)
- getDatabaseXML()
- findCameraGroupId()
- getCameraListFromGroup()
- getCameraSensorInfo()
- getConfigFromLabel()
- findColorDataInXML()
- extractParameterOptions()
- getExteriorOptionsFromXML()
- getInteriorOptionsFromXML()
- getInteriorPrestigeConfig()
```

**Structure du fichier** :
```javascript
/**
 * @fileoverview Module de parsing et extraction de données depuis le XML de la base de données
 * @module api/xml-parser
 * @version 1.0
 */

// ======================================
// Cache XML
// ======================================
let cachedXML = null;

/**
 * Récupère et met en cache le XML de la base de données
 * @returns {Promise<XMLDocument>} Le document XML parsé
 * @throws {Error} Si le téléchargement ou le parsing échoue
 */
export async function getDatabaseXML() { /* ... */ }

// ======================================
// Recherche de groupes et caméras
// ======================================

/**
 * Trouve l'ID d'un groupe de caméras selon le décor et le type de vue
 * @param {string} decorName - Nom du décor (ex: "Tarmac", "Studio")
 * @param {string} viewType - Type de vue ("exterior", "interior", "configuration")
 * @returns {Promise<string>} L'ID du groupe caméra
 * @throws {Error} Si aucun groupe n'est trouvé
 */
export async function findCameraGroupId(decorName, viewType) { /* ... */ }

// ... autres fonctions
```

**Critères de validation** :
- [ ] Fichier `code/js/api/xml-parser.js` créé
- [ ] Toutes les fonctions XML extraites
- [ ] JSDoc complète pour chaque fonction
- [ ] Exports clairement définis
- [ ] Tests : getDatabaseXML() fonctionne

---

#### [T043-4] Extraction module payload-builder.js (1h30)

**Description** : Extraire la logique de construction de payload dans un module dédié avec fonctions atomiques.

**Nouveau fichier** : `code/js/api/payload-builder.js`

**Fonctions atomiques à créer** :
```javascript
/**
 * @fileoverview Construction des payloads pour l'API Lumiscaphe
 * @module api/payload-builder
 * @version 1.0
 */

import { getDatabaseXML, getConfigFromLabel, findColorDataInXML } from './xml-parser.js';
import { DECORS_CONFIG } from '../config.js';

// ======================================
// Fonctions atomiques (Single Responsibility)
// ======================================

/**
 * Extrait la configuration paint scheme depuis le XML
 * @param {XMLDocument} xmlDoc - Document XML
 * @param {Object} config - Configuration utilisateur
 * @returns {string} Configuration paint scheme formatée
 */
function extractPaintConfig(xmlDoc, config) {
    const paintBookmarkValue = getConfigFromLabel(xmlDoc, `Exterior_${config.paintScheme}`);

    if (!paintBookmarkValue) {
        return `Exterior_PaintScheme.${config.paintScheme}`;
    }

    const bookmarkParts = paintBookmarkValue.split('/');
    const schemePart = bookmarkParts.find(p => p.startsWith('Exterior_PaintScheme.'));

    const zonesAreDefined = config.zoneA && config.zoneB && config.zoneC && config.zoneD && config.zoneAPlus;

    if (zonesAreDefined) {
        return buildPaintConfigWithZones(xmlDoc, config, schemePart);
    }

    return paintBookmarkValue;
}

/**
 * Construit la config paint scheme avec zones personnalisées
 * @param {XMLDocument} xmlDoc - Document XML
 * @param {Object} config - Configuration utilisateur
 * @param {string} schemePart - Partie Exterior_PaintScheme.XXX
 * @returns {string} Configuration complète avec zones
 */
function buildPaintConfigWithZones(xmlDoc, config, schemePart) {
    const zoneParts = [];

    const colorDataAPlus = findColorDataInXML(xmlDoc, 'Exterior_Colors_ZoneA+', config.zoneAPlus);
    if (colorDataAPlus) zoneParts.push(`Exterior_Colors_ZoneA+.${colorDataAPlus}`);

    const colorDataA = findColorDataInXML(xmlDoc, 'Exterior_Colors_ZoneA', config.zoneA);
    if (colorDataA) zoneParts.push(`Exterior_Colors_ZoneA.${colorDataA}`);

    const colorDataB = findColorDataInXML(xmlDoc, 'Exterior_Colors_ZoneB', config.zoneB);
    if (colorDataB) zoneParts.push(`Exterior_Colors_ZoneB.${colorDataB}`);

    const colorDataC = findColorDataInXML(xmlDoc, 'Exterior_Colors_ZoneC', config.zoneC);
    if (colorDataC) zoneParts.push(`Exterior_Colors_ZoneC.${colorDataC}`);

    const colorDataD = findColorDataInXML(xmlDoc, 'Exterior_Colors_ZoneD', config.zoneD);
    if (colorDataD) zoneParts.push(`Exterior_Colors_ZoneD.${colorDataD}`);

    return [...zoneParts, schemePart].filter(Boolean).join('/');
}

/**
 * Construit la string de configuration intérieur
 * @param {Object} config - Configuration utilisateur
 * @returns {string} Configuration intérieur formatée
 */
function buildInteriorConfigString(config) {
    return [
        `Interior_Carpet.${config.carpet}`,
        `Interior_CentralSeatMaterial.${config.centralSeatMaterial}`,
        `Interior_LowerSidePanel.${config.lowerSidePanel}`,
        `Interior_MetalFinish.${config.metalFinish}`,
        `Interior_PerforatedSeatOptions.${config.perforatedSeatOptions}`,
        `Interior_SeatCovers.${config.seatCovers}`,
        `Interior_Seatbelts.${config.seatbelts}`,
        `Interior_Stitching.${config.stitching}`,
        `Interior_TabletFinish.${config.tabletFinish}`,
        `Interior_Ultra-SuedeRibbon.${config.ultraSuedeRibbon}`,
        `Interior_UpperSidePanel.${config.upperSidePanel}`
    ].join('/');
}

/**
 * Construit la configuration décor
 * @param {string} decor - Nom du décor
 * @returns {Object} {suffix, positionValue}
 */
function buildDecorConfig(decor) {
    const decorData = DECORS_CONFIG[decor] || { suffix: `${decor}_Ground`, type: 'Ground' };
    return {
        suffix: decorData.suffix,
        positionValue: decor
    };
}

/**
 * Extrait la partie Exterior_PaintScheme.XXX d'une config string
 * @param {string} configString - Configuration complète
 * @returns {string} Partie paint scheme
 */
function extractPaintSchemePart(configString) {
    return configString.split('/').find(part => part.startsWith('Exterior_PaintScheme'))
        || '';
}

/**
 * Construit la configuration string complète
 * @param {XMLDocument} xmlDoc - Document XML
 * @param {Object} config - Configuration utilisateur
 * @returns {Promise<string>} Configuration string complète
 */
export async function buildConfigString(xmlDoc, config) {
    const paintConfig = extractPaintConfig(xmlDoc, config);
    const interiorConfig = buildInteriorConfigString(config);
    const { suffix: decorSuffix, positionValue } = buildDecorConfig(config.decor);

    const configParts = [
        `Version.${config.version}`,
        paintConfig,
        interiorConfig,
        `Decor.${decorSuffix}`,
        `Position.${positionValue}`,
        `Exterior_Spinner.${config.spinner}`,
        `SunGlass.${config.sunglass}`,
        `Tablet.${config.tablet}`,
        `Door_pilot.${config.doorPilot}`,
        `Door_passenger.${config.doorPassenger}`,
        config.registrationStyle ? `Exterior_RegistrationNumber_Style.${config.registrationStyle}` : null
    ];

    return configParts.filter(Boolean).join('/');
}

/**
 * Construit un payload pour l'API Lumiscaphe
 * @param {Object} config - Configuration utilisateur
 * @returns {Promise<Object>} Payload prêt pour l'API
 */
export async function buildPayload(config) {
    // Réutilise buildConfigString + génère materials/surfaces/etc.
    // ...
}

/**
 * Construit un payload pour une caméra unique
 * @param {Object} config - Configuration avec cameraId
 * @returns {Promise<Object>} Payload prêt pour l'API
 */
export async function buildPayloadForSingleCamera(config) {
    // Réutilise buildConfigString + génère materials/surfaces pour caméra unique
    // ...
}
```

**Critères de validation** :
- [ ] Fichier `code/js/api/payload-builder.js` créé
- [ ] Fonctions atomiques extraites (extractPaintConfig, buildInteriorConfigString, etc.)
- [ ] Élimination de la duplication entre buildPayload et buildPayloadForSingleCamera
- [ ] JSDoc complète pour chaque fonction
- [ ] Chaque fonction < 20 lignes
- [ ] Tests : buildPayload() génère le bon payload

---

#### [T043-5] Extraction module api-client.js (1h)

**Description** : Extraire la logique d'appel API dans un module dédié.

**Nouveau fichier** : `code/js/api/api-client.js`

**Fonctions à extraire** :
```javascript
/**
 * @fileoverview Client HTTP pour l'API Lumiscaphe
 * @module api/api-client
 * @version 1.0
 */

import { API_BASE_URL } from '../config.js';

// Constantes
const DEFAULT_TIMEOUT = 30000; // 30 secondes
const MAX_RETRIES = 3;

/**
 * Appelle l'API Lumiscaphe avec retry automatique
 * @param {Object} payload - Payload de la requête
 * @param {number} retryCount - Nombre de tentatives (défaut: 3)
 * @returns {Promise<Array<Object>>} Images générées [{url, cameraId}]
 * @throws {Error} Si échec après toutes les tentatives
 */
export async function callLumiscapheAPI(payload, retryCount = MAX_RETRIES) { /* ... */ }

/**
 * Télécharge et valide les images
 * @param {Array<Object>} images - Images à valider
 * @returns {Promise<Array<Object>>} Images validées
 */
export async function downloadImages(images) { /* ... */ }

// Database ID (dynamique US-019)
let currentDatabaseId = null;

/**
 * Définit l'ID de base de données actuel
 * @param {string} databaseId - ID de la base
 */
export function setDatabaseId(databaseId) {
    currentDatabaseId = databaseId;
}

/**
 * Récupère l'ID de base de données actuel
 * @returns {string} ID de la base
 */
export function getDatabaseId() {
    return currentDatabaseId;
}

// Sauvegarde du dernier payload (US-021)
let lastPayload = null;

/**
 * Sauvegarde le payload pour téléchargement JSON
 * @param {Object} payload - Payload à sauvegarder
 */
export function setLastPayload(payload) {
    lastPayload = payload;
}

/**
 * Récupère le dernier payload
 * @returns {Object|null} Dernier payload
 */
export function getLastPayload() {
    return lastPayload;
}
```

**Critères de validation** :
- [ ] Fichier `code/js/api/api-client.js` créé
- [ ] Fonctions d'appel API extraites
- [ ] Gestion retry implémentée
- [ ] JSDoc complète
- [ ] Tests : callLumiscapheAPI() fonctionne

---

#### [T043-6] Création api/index.js et nettoyage api.js (30min)

**Description** : Créer le point d'entrée du module API et nettoyer api.js.

**Nouveau fichier** : `code/js/api/index.js`
```javascript
/**
 * @fileoverview Point d'entrée du module API
 * @module api
 * @version 1.0
 */

// Re-export des fonctions publiques
export {
    getDatabaseXML,
    findCameraGroupId,
    getCameraListFromGroup,
    getCameraSensorInfo,
    getConfigFromLabel,
    extractParameterOptions,
    getExteriorOptionsFromXML,
    getInteriorOptionsFromXML,
    getInteriorPrestigeConfig
} from './xml-parser.js';

export {
    buildPayload,
    buildPayloadForSingleCamera,
    buildConfigString
} from './payload-builder.js';

export {
    callLumiscapheAPI,
    downloadImages,
    setDatabaseId,
    getDatabaseId,
    setLastPayload,
    getLastPayload
} from './api-client.js';

// Fonctions spécifiques
export { fetchRenderImages } from './rendering.js';
export { fetchConfigurationImages } from './configuration.js';
```

**Nouveau fichier** : `code/js/api/rendering.js`
```javascript
/**
 * @fileoverview Fonctions de génération de rendus
 * @module api/rendering
 * @version 1.0
 */

import { buildPayload, callLumiscapheAPI, downloadImages, findCameraGroupId, getDatabaseXML } from './index.js';

/**
 * Génère les rendus via l'API pour les vues Extérieur/Intérieur
 * @param {Object} config - Configuration utilisateur
 * @returns {Promise<Array<Object>>} Images enrichies avec métadonnées
 */
export async function fetchRenderImages(config) { /* ... */ }
```

**Nouveau fichier** : `code/js/api/configuration.js`
```javascript
/**
 * @fileoverview Fonctions spécifiques à la vue Configuration
 * @module api/configuration
 * @version 1.0
 */

import { buildPayloadForSingleCamera, callLumiscapheAPI, getDatabaseXML, getCameraListFromGroup } from './index.js';

/**
 * Génère les rendus pour la vue Configuration
 * @param {Object} config - Configuration utilisateur
 * @returns {Promise<Array<Object>>} Images Configuration
 */
export async function fetchConfigurationImages(config) { /* ... */ }
```

**Critères de validation** :
- [ ] Fichier `code/js/api/index.js` créé avec exports
- [ ] Fichier `code/js/api/rendering.js` créé
- [ ] Fichier `code/js/api/configuration.js` créé
- [ ] `api.js` original supprimé ou marqué deprecated
- [ ] Imports mis à jour dans app.js, ui.js

---

### Phase 3 : Refactoring ui.js (2h)

**Objectif** : 1097 lignes → 750 lignes (-32%)

#### [T043-7] Extraction module ui/mosaic.js (45min)

**Nouveau fichier** : `code/js/ui/mosaic.js`

**Fonctions à extraire** :
```javascript
/**
 * @fileoverview Rendu des mosaïques d'images
 * @module ui/mosaic
 * @version 1.0
 */

/**
 * Affiche la mosaïque d'images (Extérieur/Intérieur)
 * @param {Array<Object>} images - Images à afficher
 */
export function renderMosaic(images) { /* ... */ }

/**
 * Affiche la mosaïque Configuration avec ratios mixtes
 * @param {Array<Object>} images - Images Configuration
 */
export function renderConfigMosaic(images) { /* ... */ }
```

---

#### [T043-8] Extraction module ui/modal.js (45min)

**Nouveau fichier** : `code/js/ui/modal.js`

**Fonctions à extraire** :
```javascript
/**
 * @fileoverview Modal plein écran pour images
 * @module ui/modal
 * @version 1.0
 */

/**
 * Ouvre le modal plein écran
 * @param {Array<Object>} images - Liste des images
 * @param {number} index - Index de l'image à afficher
 */
export function openFullscreenModal(images, index) { /* ... */ }

/**
 * Ferme le modal plein écran
 */
export function closeFullscreenModal() { /* ... */ }

/**
 * Navigue vers l'image précédente
 */
function navigatePrevious() { /* ... */ }

/**
 * Navigue vers l'image suivante
 */
function navigateNext() { /* ... */ }
```

---

#### [T043-9] Extraction module ui/loader.js (15min)

**Nouveau fichier** : `code/js/ui/loader.js`

**Fonctions à extraire** :
```javascript
/**
 * @fileoverview Gestion du loader et états de chargement
 * @module ui/loader
 * @version 1.0
 */

/**
 * Affiche le loader
 */
export function showLoader() { /* ... */ }

/**
 * Masque le loader
 */
export function hideLoader() { /* ... */ }

/**
 * Affiche un message d'erreur
 * @param {string} message - Message à afficher
 */
export function showError(message) { /* ... */ }

/**
 * Masque le placeholder
 */
export function hidePlaceholder() { /* ... */ }
```

---

#### [T043-10] Création ui/index.js (15min)

**Nouveau fichier** : `code/js/ui/index.js`

```javascript
/**
 * @fileoverview Point d'entrée du module UI
 * @module ui
 * @version 1.0
 */

export { renderMosaic, renderConfigMosaic } from './mosaic.js';
export { openFullscreenModal, closeFullscreenModal } from './modal.js';
export { showLoader, hideLoader, showError, hidePlaceholder } from './loader.js';
```

---

### Phase 4 : Refactoring utils/ (1h30)

#### [T043-11] Refactoring colors.js en utils/colors.js (45min)

**Description** : Déplacer et améliorer colors.js.

**Déplacement** : `code/js/colors.js` → `code/js/utils/colors.js`

**Améliorations** :
- Renommer `colorL0` → `primaryColor`, `colorL1` → `secondaryColor`
- Ajouter JSDoc complète
- Simplifier `resolveLetterColors()`
- Documenter l'inversion des layers

**Structure améliorée** :
```javascript
/**
 * @fileoverview Gestion des couleurs d'immatriculation
 * @module utils/colors
 * @version 1.0
 */

/**
 * Parse les couleurs depuis la config string
 * @param {string} configString - Configuration complète
 * @returns {Object} Map des couleurs par zone
 */
export function parseColorsFromConfig(configString) { /* ... */ }

/**
 * Résout les couleurs des lettres selon le style
 * @param {string} styleLetter - Style (A-J)
 * @param {string} paintSchemePart - Partie paint scheme
 * @param {Object} colorMap - Map des couleurs
 * @returns {Object} {primaryColor, secondaryColor, hasLayer1}
 */
export function resolveLetterColors(styleLetter, paintSchemePart, colorMap) { /* ... */ }

/**
 * Génère les matériaux pour l'immatriculation
 * @param {string} immatString - Texte immatriculation
 * @param {string} styleLetter - Style (A-J)
 * @param {string} configString - Configuration complète
 * @param {string} paintSchemePart - Partie paint scheme
 * @returns {Object} {materials, materialMultiLayers}
 */
export function generateMaterialsAndColors(immatString, styleLetter, configString, paintSchemePart) { /* ... */ }
```

---

#### [T043-12] Refactoring positioning.js en utils/positioning.js (30min)

**Déplacement** : `code/js/positioning.js` → `code/js/utils/positioning.js`

**Améliorations** :
- JSDoc complète
- Extraire constantes (CHAR_WIDTHS, SPACING) dans config.js si pas déjà fait
- Simplifier fonctions

---

#### [T043-13] Création utils/validators.js (15min)

**Nouveau fichier** : `code/js/utils/validators.js`

```javascript
/**
 * @fileoverview Fonctions de validation
 * @module utils/validators
 * @version 1.0
 */

/**
 * Valide une configuration avant génération
 * @param {Object} config - Configuration à valider
 * @returns {boolean} true si valide
 * @throws {Error} Si validation échoue
 */
export function validateConfig(config) {
    if (!config.version) {
        throw new Error('Version manquante');
    }
    if (!config.paintScheme) {
        throw new Error('Paint scheme manquant');
    }
    // ... autres validations
    return true;
}

/**
 * Valide qu'une URL d'image est accessible
 * @param {string} url - URL à valider
 * @returns {Promise<boolean>} true si accessible
 */
export async function validateImageUrl(url) { /* ... */ }
```

---

### Phase 5 : Refactoring app.js (2h)

**Objectif** : 1651 lignes → 1100 lignes (-33%)

#### [T043-14] Séparation logique métier et UI (1h)

**Description** : Séparer clairement la logique métier de la gestion UI.

**Regroupement** :
```javascript
/**
 * @fileoverview Point d'entrée de l'application
 * @version 1.0
 */

// ======================================
// SECTION 1 : Imports
// ======================================
import { fetchRenderImages, fetchConfigurationImages, setDatabaseId } from './api/index.js';
import { renderMosaic, renderConfigMosaic, showLoader, hideLoader } from './ui/index.js';
import { getConfig, updateConfig, initializeState } from './state.js';

// ======================================
// SECTION 2 : Initialisation
// ======================================

/**
 * Initialise l'application au chargement
 */
async function initApp() {
    await initializeState();
    await initUI();
    registerEventListeners();
    await loadInitialRender();
}

/**
 * Initialise l'interface utilisateur
 */
async function initUI() { /* ... */ }

// ======================================
// SECTION 3 : Event Handlers
// ======================================

/**
 * Enregistre tous les event listeners
 */
function registerEventListeners() {
    registerViewToggleListeners();
    registerControlListeners();
    registerDownloadListeners();
}

function registerViewToggleListeners() { /* ... */ }
function registerControlListeners() { /* ... */ }
function registerDownloadListeners() { /* ... */ }

// ======================================
// SECTION 4 : Logique de rendu
// ======================================

/**
 * Charge et affiche un rendu
 */
async function loadRender() { /* ... */ }

// ======================================
// SECTION 5 : Utilitaires
// ======================================

function getViewType() { /* ... */ }
function toggleViewControls(viewType) { /* ... */ }

// ======================================
// SECTION 6 : Démarrage
// ======================================
document.addEventListener('DOMContentLoaded', initApp);
```

**Critères de validation** :
- [ ] app.js organisé en 6 sections claires
- [ ] Event listeners regroupés dans registerEventListeners()
- [ ] Logique métier séparée de la logique UI
- [ ] Chaque fonction < 20 lignes
- [ ] JSDoc complète

---

#### [T043-15] Extraction constantes magiques (1h)

**Description** : Extraire toutes les constantes magiques dans config.js.

**Exemples** :
```javascript
// ❌ AVANT (dans app.js)
const timeout = 30000; // Magic number
if (response.status === 200) { /* ... */ }

// ✅ APRÈS (dans config.js)
export const API_TIMEOUT = 30000; // 30 secondes
export const HTTP_OK = 200;

// Dans app.js
import { API_TIMEOUT, HTTP_OK } from './config.js';
```

**Constantes à extraire** :
- Timeouts
- Codes HTTP
- Sélecteurs DOM fréquents
- Messages d'erreur standards
- Valeurs par défaut

---

### Phase 6 : Documentation (2h)

#### [T043-16] Création docs/GUIDE-DEVELOPPEUR.md (1h)

**Description** : Créer un guide complet pour les développeurs.

**Contenu** :
```markdown
# Guide Développeur - Configurateur Daher

## Architecture Globale

### Flux de données
User Input → State → API → Rendering → UI

### Diagramme de flux
[Diagramme ASCII ou lien vers image]

### Points d'entrée principaux

#### app.js
- `initApp()` : Initialise l'application
- `loadRender()` : Charge un rendu

#### api/index.js
- `fetchRenderImages(config)` : Génère rendus Ext/Int
- `fetchConfigurationImages(config)` : Génère rendus Config

### Structure des modules

#### api/
- `xml-parser.js` : Parsing XML base de données
- `payload-builder.js` : Construction payloads API
- `api-client.js` : Appels HTTP API Lumiscaphe
- `rendering.js` : Génération rendus Ext/Int
- `configuration.js` : Génération rendus Config

#### ui/
- `mosaic.js` : Affichage mosaïques d'images
- `modal.js` : Modal plein écran
- `loader.js` : États de chargement

#### utils/
- `colors.js` : Gestion couleurs immatriculation
- `positioning.js` : Calcul positions lettres
- `validators.js` : Validation données

### Comment ajouter une nouvelle fonctionnalité

#### Exemple : Ajouter un nouveau contrôle

1. **State** : Ajouter la propriété dans DEFAULT_CONFIG (config.js)
2. **UI** : Créer le dropdown/toggle dans index.html
3. **Event** : Ajouter l'event listener dans app.js
4. **Payload** : Ajouter le paramètre dans buildConfigString() (payload-builder.js)
5. **Test** : Tester le rendu

### Conventions de code

#### Nommage
- Variables/fonctions : camelCase
- Constantes : UPPER_SNAKE_CASE
- Classes : PascalCase

#### Fonctions
- Une fonction = une action
- Max 20 lignes par fonction
- JSDoc obligatoire pour exports

#### Logs
- 🎬 Info : Début opération
- ✅ Success : Opération réussie
- ⚠️ Warning : Attention non bloquant
- ❌ Error : Erreur bloquante

### Tests manuels

Voir `sprints/sprint-13/test-checklist.md`
```

---

#### [T043-17] Création docs/GLOSSARY.md (30min)

**Description** : Extraire et compléter le glossaire depuis CLAUDE.md.

**Contenu** :
```markdown
# Glossaire - Termes Métier

## Décor (Decor)
**Définition** : Environnement de fond pour la scène 3D
**Valeurs** : Studio, Tarmac, Fjord, Hangar, Onirique
**Utilisation** : Position de l'avion, groupe caméras extérieur

## Paint Scheme (Schéma de Peinture)
**Définition** : Schéma de peinture de l'avion avec zones de couleur
**Valeurs** : Zephir, Tehuano, Sirocco, Alize, Mistral, Meltem
**Utilisation** : Configuration peinture, noms caméras RegistrationNumber

## Prestige
**Définition** : Configuration intérieur prédéfinie (ensemble de 11 paramètres)
**Valeurs** : Oslo, SanPedro, London, Labrador, GooseBay, BlackFriars

## View Type (Type de Vue)
**Valeurs** : exterior, interior, configuration
**Utilisation** : Détermine quel groupe de caméras utiliser

## Camera Group (Groupe de Caméras)
**Définition** : Ensemble de caméras dans le XML pour une vue spécifique
**Exemples** : Exterieur_DecorStudio, Interieur, Configuration

## Sensor (Capteur)
**Définition** : Capteur de caméra avec dimensions (width x height)
**Utilisation** : Détermine le ratio de l'image (16:9 vs 1:1)

## Layer (Couche de couleur)
**Définition** : Couche de couleur pour les lettres d'immatriculation
**Important** : L'API inverse les layers (Layer 0 = 2ème couleur, Layer 1 = 1ère couleur)

## Style (Style de lettres)
**Valeurs** : A-E (slanted/penchées), F-J (straight/droites)
**Utilisation** : Détermine l'apparence des lettres d'immatriculation
```

---

#### [T043-18] Ajout headers JSDoc aux fichiers (30min)

**Description** : Ajouter un header standardisé à tous les fichiers JavaScript.

**Template** :
```javascript
/**
 * @fileoverview [Description du rôle du fichier]
 * @module [nom-du-module]
 * @author DEV
 * @version 1.0
 */
```

**Fichiers à documenter** :
- Tous les fichiers dans api/, ui/, utils/
- app.js, state.js, config.js, logger.js

---

### Phase 7 : Tests et Validation (2h)

#### [T043-19] Suite complète de tests manuels (1h30)

**Description** : Exécuter une suite complète de tests pour détecter les régressions.

**Checklist de tests** : Créer `sprints/sprint-13/test-checklist.md`

```markdown
# Checklist Tests Refactoring Sprint #13

## Tests Fonctionnels

### Vue Extérieur
- [ ] Chargement initial avec décor Tarmac
- [ ] Changement de décor (Studio, Fjord, Hangar, Onirique)
- [ ] Changement de paint scheme (Zephir, Tehuano, etc.)
- [ ] Modification des zones de couleur (A, B, C, D, A+)
- [ ] Changement de spinner
- [ ] Modification immatriculation
- [ ] Changement de style lettres (A-J)
- [ ] Toggle doors (Open/Closed)
- [ ] Toggle SunGlass (ON/OFF)
- [ ] Toggle Tablet (Open/Closed)
- [ ] Mosaïque affiche 5 images correctement
- [ ] Modal plein écran fonctionne
- [ ] Navigation clavier (←/→) dans modal
- [ ] Téléchargement image individuelle
- [ ] Téléchargement JSON payload

### Vue Intérieur
- [ ] Basculement vers Intérieur
- [ ] Changement de Prestige (Oslo, SanPedro, etc.)
- [ ] Modification des 11 paramètres intérieur
- [ ] Stitching synchronisé avec Prestige
- [ ] Matériau Central toggle (Suede/Cuir)
- [ ] Mosaïque affiche 6 images correctement
- [ ] Modal plein écran fonctionne

### Vue Configuration
- [ ] Basculement vers Configuration
- [ ] 10 vignettes RegistrationNumber (styles A-J) affichées
- [ ] Vignettes correspondent au paint scheme actuel
- [ ] ~16 autres vignettes affichées
- [ ] Immatriculation visible et correcte
- [ ] Couleurs immatriculation identiques à vue Extérieur
- [ ] Modal plein écran avec métadonnées
- [ ] Navigation clavier fonctionne

### Performance
- [ ] Temps de chargement ≤ temps avant refactoring
- [ ] Pas de freeze de l'UI
- [ ] Transitions fluides entre vues

### Console
- [ ] Aucune erreur JavaScript
- [ ] Aucun warning critique
- [ ] Logs formatés correctement (🎬 ✅ ⚠️ ❌)

## Tests Techniques

### ESLint
- [ ] `npm run lint` passe sans erreur
- [ ] Complexité cyclomatique < 10 partout

### Prettier
- [ ] `npm run format` appliqué sur tous les fichiers
- [ ] Code formaté de façon cohérente

### Architecture
- [ ] Imports/exports fonctionnent correctement
- [ ] Pas de dépendances circulaires
- [ ] Modules bien séparés

### Documentation
- [ ] Toutes les fonctions exportées ont JSDoc
- [ ] Headers de fichiers présents
- [ ] GUIDE-DEVELOPPEUR.md complet
- [ ] GLOSSARY.md complet

## Métriques

### Lignes de code
- [ ] Total ≤ 3850 lignes (-30%)
- [ ] api.js → api/ < 1100 lignes
- [ ] ui.js → ui/ < 750 lignes
- [ ] app.js < 1100 lignes

### Fonctions
- [ ] Aucune fonction > 20 lignes (sauf exceptions documentées)
- [ ] Toutes les fonctions ont un nom de verbe d'action
- [ ] Principe "une fonction = une action" respecté

## Validation Finale

- [ ] Tous les critères d'acceptation US-043 validés (sections A-I)
- [ ] Aucune régression fonctionnelle
- [ ] Code validé par revue ARCH
- [ ] Documentation complète
```

---

#### [T043-20] Revue architecture et code (30min)

**Description** : Revue finale par ARCH de l'architecture et du code refactorisé.

**Points de contrôle** :
- [ ] Architecture modulaire respectée
- [ ] Séparation des responsabilités claire
- [ ] Pas de dépendances circulaires
- [ ] Imports/exports cohérents
- [ ] Principe "une fonction = une action" respecté
- [ ] JSDoc complète et correcte
- [ ] Tests manuels tous passés
- [ ] Métriques atteintes (réduction 30%, < 20 lignes/fonction)

---

## 📁 Fichiers Modifiés/Créés

### Nouveaux modules créés
- ✅ `code/js/api/xml-parser.js` (extraction parsing XML)
- ✅ `code/js/api/payload-builder.js` (extraction construction payload)
- ✅ `code/js/api/api-client.js` (extraction appels HTTP)
- ✅ `code/js/api/rendering.js` (rendu Ext/Int)
- ✅ `code/js/api/configuration.js` (rendu Config)
- ✅ `code/js/api/index.js` (exports publics)
- ✅ `code/js/ui/mosaic.js` (mosaïques)
- ✅ `code/js/ui/modal.js` (modal plein écran)
- ✅ `code/js/ui/loader.js` (loader/erreurs)
- ✅ `code/js/ui/index.js` (exports publics)
- ✅ `code/js/utils/colors.js` (déplacement + amélioration)
- ✅ `code/js/utils/positioning.js` (déplacement)
- ✅ `code/js/utils/validators.js` (nouveau)

### Fichiers de configuration
- ✅ `.eslintrc.json` (configuration linting)
- ✅ `.prettierrc.json` (configuration formatage)
- ✅ `package.json` (scripts npm - optionnel)

### Documentation
- ✅ `docs/GUIDE-DEVELOPPEUR.md` (guide complet)
- ✅ `docs/GLOSSARY.md` (glossaire termes métier)

### Fichiers modifiés
- ✏️ `code/js/app.js` (réorganisation, imports mis à jour)
- ✏️ `code/js/state.js` (JSDoc ajoutée)
- ✏️ `code/js/config.js` (constantes extraites)
- ✏️ `code/js/logger.js` (JSDoc ajoutée)
- ✏️ `code/index.html` (imports mis à jour si modules ES6)

### Fichiers supprimés/deprecated
- ❌ `code/js/api.js` (éclaté en 6 modules)
- ❌ `code/js/ui.js` (éclaté en 4 modules)
- ❌ `code/js/colors.js` (déplacé dans utils/)
- ❌ `code/js/positioning.js` (déplacé dans utils/)

---

## 🔗 Dépendances

**Bloque** : Nouvelles User Stories majeures (recommandé de finir avant)
**Bloqué par** : Aucun

---

## ⏱️ Estimation Totale

| Phase | Durée |
|-------|-------|
| Phase 1 : Analyse et Setup | 3h |
| Phase 2 : Refactoring api.js | 4h |
| Phase 3 : Refactoring ui.js | 2h |
| Phase 4 : Refactoring utils/ | 1h30 |
| Phase 5 : Refactoring app.js | 2h |
| Phase 6 : Documentation | 2h |
| Phase 7 : Tests et Validation | 2h |
| **Total** | **16h30** |

**Story Points** : 8 SP (~2h/SP)

---

## 🎯 Critères de Réussite (Definition of Done)

### Code
- [x] Réduction de 30% du code (5500 → ~3850 lignes)
- [x] Architecture modulaire api/, ui/, utils/
- [x] Aucune fonction > 20 lignes (sauf exceptions documentées)
- [x] Principe "une fonction = une action" respecté partout
- [x] Élimination de toute duplication
- [x] Code mort supprimé
- [x] Constantes magiques extraites

### Standards
- [x] ESLint configuré (Airbnb rules)
- [x] Prettier configuré
- [x] 0 erreur ESLint
- [x] Code formaté avec Prettier
- [x] Complexité cyclomatique < 10

### Documentation
- [x] 100% fonctions exportées documentées (JSDoc)
- [x] Headers de fichiers présents
- [x] GUIDE-DEVELOPPEUR.md créé
- [x] GLOSSARY.md créé
- [x] Exemples d'utilisation dans JSDoc

### Tests
- [x] Suite complète de tests manuels passée
- [x] Aucune régression fonctionnelle
- [x] Performance ≥ avant refactoring
- [x] 0 erreur console

### Validation
- [x] Revue ARCH complétée
- [x] Tous critères US-043 validés (A-I)
- [x] Test-report.md créé

---

**Prêt pour développement** : ✅
**Assigné à** : DEV
**Revue ARCH requise** : ✅ (Revue finale obligatoire)
**Prochaine étape** : Mise à jour Kanban Board + Daily Scrum + Développement
