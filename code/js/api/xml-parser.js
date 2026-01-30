/**
 * @fileoverview Module de parsing et extraction de données depuis le XML de la base de données
 * @module api/xml-parser
 * @version 1.0
 */

import { API_BASE_URL } from '../config.js';
import { getDatabaseId, registerXMLCacheInvalidator } from './api-client.js';

// ======================================
// Cache XML
// ======================================
let cachedXML = null;

/**
 * Invalide le cache XML pour forcer le rechargement
 * Utilisé lors du changement de base de données (US-019)
 */
export function invalidateXMLCache() {
    cachedXML = null;
}

// Enregistrer le callback d'invalidation au chargement du module
registerXMLCacheInvalidator(invalidateXMLCache);

/**
 * Récupère et met en cache le XML de la base de données
 * @returns {Promise<XMLDocument>} Le document XML parsé
 * @throws {Error} Si le téléchargement ou le parsing échoue
 */
export async function getDatabaseXML() {
    if (cachedXML) {
        return cachedXML;
    }
    const databaseId = getDatabaseId();
    const url = `${API_BASE_URL}/Database?databaseId=${databaseId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xmlText = await response.text();
        cachedXML = new DOMParser().parseFromString(xmlText, 'text/xml');

        // Vérifier qu'il n'y a pas d'erreur de parsing
        const parserError = cachedXML.querySelector('parsererror');
        if (parserError) {
            throw new Error('Erreur de parsing XML: ' + parserError.textContent);
        }

        return cachedXML;
    } catch (error) {
        console.error('[ERROR] XML téléchargement:', error.message);
        throw error;
    }
}

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
export async function findCameraGroupId(decorName, viewType = "exterior") {
    const xmlDoc = await getDatabaseXML();
    const groups = xmlDoc.querySelectorAll('Group');

    if (viewType === "interior") {
        for (let group of groups) {
            const groupName = group.getAttribute('name');
            if (groupName === "Interieur") {
                return group.getAttribute('id');
            }
        }
        throw new Error('Groupe caméra "Interieur" introuvable dans le XML');
    }

    if (viewType === "configuration") {
        for (let group of groups) {
            const groupName = group.getAttribute('name');
            if (groupName === "Configuration") {
                return group.getAttribute('id');
            }
        }
        throw new Error(`Groupe caméra "Configuration" introuvable`);
    }

    let decorBaseName = decorName;
    // Extraire le nom de base du décor selon le format
    // V0.2 : {decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz → extraire decorName
    // V0.3-V0.9.1 : {decorName}_{Ground|Flight} → extraire decorName
    // V0.9.2+ : {decorName}_{Ground|Flight}_{index} → extraire decorName
    if (/^[A-Za-z]+_[\d\-_]+$/.test(decorName)) {
        // V0.2 : Format avec coordonnées numériques
        decorBaseName = decorName.split('_')[0];
    } else if (/^[A-Za-z]+_(Ground|Flight)_\d+$/.test(decorName)) {
        // V0.9.2+ : Format avec Ground/Flight et index
        decorBaseName = decorName.split('_')[0];
    } else if (/^[A-Za-z]+_(Ground|Flight)$/.test(decorName)) {
        // V0.3-V0.9.1 : Format avec Ground/Flight SANS index
        decorBaseName = decorName.split('_')[0];
    }

    const target = `Exterieur_Decor${decorBaseName}`;
    for (let group of groups) {
        const groupName = group.getAttribute('name');
        if (groupName === target) {
            return group.getAttribute('id');
        }
    }

    const partialTarget = `Decor${decorBaseName}`;
    for (let group of groups) {
        const groupName = group.getAttribute('name') || '';
        if (groupName.includes(partialTarget)) {
            return group.getAttribute('id');
        }
    }

    for (let group of groups) {
        const groupName = group.getAttribute('name');
        if (groupName === 'Exterieur') {
            return group.getAttribute('id');
        }
    }

    throw new Error(`Groupe caméra introuvable pour décor: ${decorName}`);
}

/**
 * Récupère la liste des caméras d'un groupe de caméras avec leurs ratios
 * @param {string} groupId - ID du groupe de caméras
 * @returns {Promise<Array<Object>>} Liste des caméras {id, name, index, ratioType, width, height}
 * @throws {Error} Si le groupe n'est pas trouvé
 */
export async function getCameraListFromGroup(groupId) {
    const xmlDoc = await getDatabaseXML();

    // Trouver le groupe
    const group = xmlDoc.querySelector(`Group[id="${groupId}"]`);
    if (!group) {
        throw new Error(`Group ${groupId} not found in XML`);
    }


    // Récupérer toutes les caméras du groupe
    const cameras = [];

    // Pour le groupe Configuration, les caméras sont directement dans le groupe (balises <Camera>)
    const cameraElements = group.querySelectorAll('Camera');


    for (let index = 0; index < cameraElements.length; index++) {
        const camera = cameraElements[index];
        const cameraId = camera.getAttribute('id');
        const cameraName = camera.getAttribute('name') || `Camera ${index + 1}`;

        if (cameraId) {
            // Récupérer le ratio de la caméra
            try {
                const sensorInfo = await getCameraSensorInfo(cameraId);

                // Définir les tailles de rendu selon le ratio
                const sizes = sensorInfo.ratioType === '16:9'
                    ? { width: 400, height: 225 }
                    : { width: 100, height: 100 };

                cameras.push({
                    id: cameraId,
                    name: cameraName,
                    index: index,
                    ratioType: sensorInfo.ratioType,
                    width: sizes.width,
                    height: sizes.height
                });
            } catch (error) {
                console.warn(`⚠️ Erreur récupération sensor pour ${cameraId}:`, error);
                cameras.push({
                    id: cameraId,
                    name: cameraName,
                    index: index,
                    ratioType: '1:1',
                    width: 100,
                    height: 100
                });
            }
        }
    }

    return cameras;
}

/**
 * Récupère les informations du sensor d'une caméra
 * @param {string} cameraId - ID de la caméra
 * @returns {Promise<Object>} Informations du sensor { sensorId, sensorName, width, height, ratio, ratioType }
 * @throws {Error} Si la caméra ou le sensor n'est pas trouvé
 */
export async function getCameraSensorInfo(cameraId) {
    const xmlDoc = await getDatabaseXML();

    // Trouver la caméra
    const camera = xmlDoc.querySelector(`Camera[id="${cameraId}"]`);
    if (!camera) {
        throw new Error(`Camera ${cameraId} not found in XML`);
    }

    // Récupérer le sensorId
    const sensorId = camera.getAttribute('sensorId');
    if (!sensorId) {
        throw new Error(`Camera ${cameraId} has no sensorId attribute`);
    }

    // Trouver le sensor
    const sensor = xmlDoc.querySelector(`Sensor[id="${sensorId}"]`);
    if (!sensor) {
        throw new Error(`Sensor ${sensorId} not found in XML`);
    }

    // Extraire les dimensions
    const width = parseFloat(sensor.getAttribute('width'));
    const height = parseFloat(sensor.getAttribute('height'));

    if (isNaN(width) || isNaN(height)) {
        throw new Error(`Sensor ${sensorId} has invalid width or height`);
    }

    // Calculer le ratio
    const ratio = width / height;

    // Déterminer le type de ratio (16:9 ≈ 1.778, 1:1 = 1.0)
    const ratioType = Math.abs(ratio - 1.0) < 0.01 ? '1:1' : '16:9';

    return {
        sensorId,
        sensorName: sensor.getAttribute('name') || 'Unknown',
        width,
        height,
        ratio,
        ratioType
    };
}

/**
 * US-044 : Récupère les caméras du groupe "Overview" depuis le XML
 * @returns {Promise<Array<Object>>} Array de 4 objets caméra {id, name, sensorWidth, sensorHeight}
 * @throws {Error} Si le groupe "Overview" n'existe pas ou si moins de 4 caméras
 */
export async function getCameraGroupOverview() {

    const xmlDoc = await getDatabaseXML();
    const groups = xmlDoc.querySelectorAll('Group');


    // Rechercher le groupe avec name="Overview"
    let overviewGroup = null;
    for (let group of groups) {
        const groupName = group.getAttribute('name');
        if (groupName === 'Overview') {
            overviewGroup = group;
            break;
        }
    }

    if (!overviewGroup) {
        throw new Error('❌ Groupe caméra "Overview" introuvable dans le XML');
    }

    const groupId = overviewGroup.getAttribute('id');

    // Récupérer toutes les caméras du groupe
    const cameraElements = overviewGroup.querySelectorAll('Camera');

    if (cameraElements.length === 0) {
        throw new Error('❌ Aucune caméra trouvée dans le groupe "Overview"');
    }

    // Parser les caméras et récupérer leurs sensors
    const cameras = [];
    for (let i = 0; i < cameraElements.length; i++) {
        const camera = cameraElements[i];
        const cameraId = camera.getAttribute('id');
        const cameraName = camera.getAttribute('name') || `Camera ${i + 1}`;

        if (!cameraId) {
            console.warn(`   ⚠️ Caméra sans ID à l'index ${i}, ignorée`);
            continue;
        }

        // Récupérer les dimensions du sensor
        try {
            const sensorInfo = await getCameraSensorInfo(cameraId);
            cameras.push({
                id: cameraId,
                name: cameraName,
                sensorWidth: sensorInfo.width,
                sensorHeight: sensorInfo.height
            });
        } catch (error) {
            console.error(`   ❌ Erreur récupération sensor pour caméra ${cameraId}:`, error);
            throw new Error(`Impossible de récupérer le sensor de la caméra ${cameraName}`);
        }
    }

    return cameras;
}

// ======================================
// Extraction de configurations
// ======================================

/**
 * Récupère la configuration complète depuis le XML
 * Porte la logique Python lignes 201-208 de generate_full_render.py
 * @param {XMLDocument} xmlRoot - Le document XML parsé
 * @param {string} targetLabel - Le label du bookmark à chercher (ex: "Exterior_Sirocco")
 * @returns {string|null} La valeur du bookmark ou null si non trouvé
 */
export function getConfigFromLabel(xmlRoot, targetLabel) {

    const nodes = xmlRoot.querySelectorAll('ConfigurationBookmark');

    for (const node of nodes) {
        const label = node.getAttribute('label');
        if (label === targetLabel) {
            const value = node.getAttribute('value');
            if (value) {
                return value;
            }
        }
    }

    console.warn(`   ⚠️ Label '${targetLabel}' introuvable dans le XML`);
    return null;
}

/**
 * Trouve la chaîne complète d'une couleur dans le XML
 * Format: SocataWhite-29017-#dcdcd7-#D9D7C8-A+-29017-socata-white-solid-light
 * @param {XMLDocument} xmlRoot - Le document XML parsé
 * @param {string} parameterLabel - Le label du paramètre (ex: "Exterior_Colors_ZoneA")
 * @param {string} colorName - Le nom de la couleur (ex: "SocataWhite")
 * @returns {string|null} La chaîne complète de couleur ou null si non trouvée
 */
export function findColorDataInXML(xmlRoot, parameterLabel, colorName) {
    // Trouver le paramètre en parcourant tous les Parameter (évite problème échappement CSS)
    let param = null;
    const allParams = xmlRoot.querySelectorAll('Parameter');
    for (const p of allParams) {
        if (p.getAttribute('label') === parameterLabel) {
            param = p;
            break;
        }
    }

    if (!param) {
        console.warn(`   ⚠️ Paramètre ${parameterLabel} non trouvé`);
        return null;
    }

    // Chercher dans les valeurs (attribut label, pas textContent !)
    const values = param.querySelectorAll('Value');

    for (const value of values) {
        const colorStr = value.getAttribute('label');

        if (!colorStr) continue;

        // Vérifier si ça commence par le nom de couleur
        if (colorStr.startsWith(colorName + '-') || colorStr === colorName) {
            return colorStr;
        }
    }

    console.warn(`   ⚠️ Couleur ${colorName} non trouvée dans ${parameterLabel}`);
    return null;
}

/**
 * Fonction générique pour extraire les options d'un Parameter du XML
 * Utilisable pour tous les dropdowns (intérieur ET extérieur)
 * @param {XMLDocument} xmlDoc - Le document XML de la database
 * @param {string} parameterLabel - Le label du Parameter (ex: "Interior_Carpet", "Exterior_Version")
 * @param {boolean} formatLabel - Si true, formate le label (ex: "BeigeGray_2242" → "Beige Gray"). Si false, utilise le label brut
 * @returns {Array} Tableau d'options [{label, value}]
 */
export function extractParameterOptions(xmlDoc, parameterLabel, formatLabel = true) {
    const parameter = xmlDoc.querySelector(`Parameter[label="${parameterLabel}"]`);
    if (!parameter) {
        console.warn(`Parameter ${parameterLabel} non trouvé dans le XML`);
        return [];
    }

    const values = parameter.querySelectorAll('Value');
    const options = [];

    values.forEach(value => {
        const rawLabel = value.getAttribute('label');
        const symbol = value.getAttribute('symbol');

        if (rawLabel && symbol) {
            // Extraire la valeur après le point : "Interior_Carpet.XXX" → "XXX"
            const configValue = symbol.split('.')[1] || rawLabel;

            let displayLabel;
            if (formatLabel) {
                // US-038 : Formatter le label : "BlackOnyx_5557_Suede_Premium" → "Black Onyx"
                // Prendre le premier segment (avant underscore)
                const namePart = rawLabel.split('_')[0];
                // Enlever tout chiffre résiduel (ex: "WhiteSand2192" → "WhiteSand")
                const cleanName = namePart.replace(/\d+/g, '');
                // Convertir CamelCase en espaces : "BlackOnyx" → "Black Onyx"
                displayLabel = cleanName.replace(/([A-Z])/g, ' $1').trim();

                // Debug log pour tracer le formatage (US-038)
                if (rawLabel.includes('Onyx') || rawLabel.includes('Sand') || rawLabel.includes('Suede')) {
                }
            } else {
                // Utiliser le label brut
                displayLabel = rawLabel;
            }

            options.push({ label: displayLabel, value: configValue });
        }
    });

    return options;
}

// ======================================
// Extraction options Extérieur
// ======================================

/**
 * Extrait les options disponibles pour les dropdowns extérieur depuis le XML
 * Retourne un objet avec les listes pour chaque dropdown
 * @param {XMLDocument} xmlDoc - Le document XML de la database
 * @returns {Object} Objet contenant les listes d'options pour chaque dropdown
 */
export function getExteriorOptionsFromXML(xmlDoc) {

    // Fonctions spéciales pour formater les labels

    // V0.2-V0.5 : "Alize_B-0_B-D_B-D_B-D_B-D" → "Alize"
    // V0.6+     : "Alize_2_B-0_B-D_B-D_B-D_B-D" → "Alize" (ignorer l'index)
    const formatPaintSchemeLabel = (rawLabel) => {
        return rawLabel.split('_')[0];
    };

    // Extrait l'index si présent dans le pattern V0.6+
    // "Alize_2_B-0_..." → 2
    // "Alize_B-0_..." → null (anciennes versions)
    const extractPaintSchemeIndex = (rawLabel) => {
        const parts = rawLabel.split('_');
        // V0.6+ : Si le 2ème segment est un chiffre pur, c'est l'index
        if (parts.length >= 2 && /^\d+$/.test(parts[1])) {
            return parseInt(parts[1], 10);
        }
        return null; // Pas d'index (V0.2-V0.5)
    };

    // Extrait UNIQUEMENT le {decorName} du pattern, data-driven
    // Patterns selon les versions :
    // - V0.1 : "FJORD" → "Fjord"
    // - V0.2 : Pattern "{decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz"
    //          "Fjord_201_0_0_0_0_-90_-15" → decorName = "Fjord"
    //          "StudioFlight_360_0_0_0_0_0_0" → decorName = "StudioFlight" (Flight/Ground FAIT PARTIE du decorName)
    // - V0.3+ : Pattern "{decorName}_{Flight|Ground}"
    //           "Studio_Ground" → decorName = "Studio" (Flight/Ground est SÉPARÉ)
    //           "Fjord_Flight" → decorName = "Fjord"
    const extractDecorName = (rawLabel) => {
        // ⚠️ Plus de support pour "POC Decor." - bases Production uniquement
        let name = rawLabel;

        // Pattern V0.9.2+ : {decorName}_{Flight|Ground}_{index}
        // Identifier par : se termine par _Flight_X ou _Ground_X où X est un chiffre
        const v092Match = name.match(/^([A-Za-z]+)_(Flight|Ground)_\d+$/);
        if (v092Match) {
            // "Fjord_Flight_2" → "Fjord" (nom seul, sans Flight/Ground ni index)
            return v092Match[1];
        }

        // Pattern V0.3-V0.9.1 : {decorName}_{Flight|Ground}
        // Identifier par : se termine par _Flight ou _Ground (pas de chiffres après)
        const v03Match = name.match(/^([A-Za-z]+)_(Flight|Ground)$/);
        if (v03Match) {
            // "Studio_Ground" → "Studio" (Flight/Ground séparé du decorName)
            return v03Match[1];
        }

        // Pattern V0.2 : {decorName}_{cameraId}_Tx_Ty_Tz_Rx_Ry_Rz
        // Identifier par : underscore suivi de chiffres
        const v02Match = name.match(/^([A-Za-z]+(?:Flight|Ground)?)_\d+/);
        if (v02Match) {
            // "StudioFlight_360_..." → "StudioFlight" (Flight/Ground fait partie du decorName)
            // "Fjord_201_..." → "Fjord"
            return v02Match[1];
        }

        // V0.1 ou autre : retourner tel quel
        return name;
    };

    // Fonction pour extraire l'index du décor : "Fjord_Flight_2" → 2, "Studio_Ground" → null
    const extractDecorIndex = (rawLabel) => {
        // Pattern V0.9.2+ : {decorName}_{Flight|Ground}_{index}
        const match = rawLabel.match(/^[A-Za-z]+_(Flight|Ground)_(\d+)$/);
        if (match) {
            return parseInt(match[2], 10);
        }
        return null; // Pas d'index
    };

    const options = {
        version: [],
        paintScheme: [],
        prestige: [],
        spinner: [],
        decor: [],
        styleSlanted: [],
        styleStraight: [],
        // US-053/US-054 : Toggles extraits du XML (pas hardcodés)
        sunGlass: [],
        tablet: [],
        doorPilot: [],
        doorPassenger: [],
        moodLights: [],
        lightingCeiling: []
    };

    // Version (TBM 960, 980)
    options.version = extractParameterOptions(xmlDoc, 'Version', false);

    // Paint Scheme - extraire et formater
    const paintRaw = extractParameterOptions(xmlDoc, 'Exterior_PaintScheme', false);

    // Mapper avec extraction de l'index (V0.6+)
    const paintWithIndex = paintRaw.map(opt => ({
        label: formatPaintSchemeLabel(opt.label), // Label court pour affichage dropdown : "Alize"
        value: opt.value,                         // Valeur COMPLÈTE du XML pour l'API : "Alize_2_B-0_B-D_..."
        index: extractPaintSchemeIndex(opt.label), // null si pas d'index (V0.2-V0.5)
        rawLabel: opt.label // Garder le label brut pour debug
    }));

    // Trier : par index si présent (V0.6+), sinon alphabétiquement (V0.2-V0.5)
    const hasIndex = paintWithIndex.some(opt => opt.index !== null);
    if (hasIndex) {
        // V0.6+ : Tri par index croissant
        paintWithIndex.sort((a, b) => {
            const indexA = a.index ?? Infinity; // Si pas d'index, mettre à la fin
            const indexB = b.index ?? Infinity;
            return indexA - indexB;
        });
    } else {
        paintWithIndex.sort((a, b) => a.label.localeCompare(b.label));
    }

    // Garder seulement label/value pour l'API finale
    options.paintScheme = paintWithIndex.map(opt => ({
        label: opt.label,
        value: opt.value
    }));

    // Prestige - SPECIAL : Les prestiges sont des ConfigurationBookmark, pas des Parameters
    const prestigeBookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark[label^="Interior_PrestigeSelection_"]');
    options.prestige = Array.from(prestigeBookmarks).map(bookmark => {
        const label = bookmark.getAttribute('label').replace('Interior_PrestigeSelection_', '');
        return { label, value: label };
    });

    // Spinner - FORMAT : {NomSpinner}_{index} (index commence à 1 pour tri)
    // Exemple : "PolishedAluminium_1", "MatteBlack_2"
    const spinnerRaw = extractParameterOptions(xmlDoc, 'Exterior_Spinner', false);

    // Fonction pour extraire le nom (sans index) : "PolishedAluminium_1" → "PolishedAluminium"
    const formatSpinnerLabel = (rawLabel) => {
        const parts = rawLabel.split('_');
        // Si dernier segment est un chiffre pur, c'est l'index → le retirer
        if (parts.length >= 2 && /^\d+$/.test(parts[parts.length - 1])) {
            return parts.slice(0, -1).join('_'); // Tout sauf le dernier segment
        }
        // Pas d'index → retourner tel quel
        return rawLabel;
    };

    // Fonction pour extraire l'index : "PolishedAluminium_1" → 1, "PolishedAluminium" → null
    const extractSpinnerIndex = (rawLabel) => {
        const parts = rawLabel.split('_');
        // Si dernier segment est un chiffre pur, c'est l'index
        if (parts.length >= 2 && /^\d+$/.test(parts[parts.length - 1])) {
            return parseInt(parts[parts.length - 1], 10);
        }
        return null; // Pas d'index
    };

    // Mapper avec extraction de l'index
    const spinnerWithIndex = spinnerRaw.map(opt => ({
        label: formatSpinnerLabel(opt.label), // Label court pour affichage : "PolishedAluminium"
        value: opt.value,                     // Valeur COMPLÈTE pour l'API : "PolishedAluminium-1"
        index: extractSpinnerIndex(opt.label), // Index si présent, sinon null
        rawLabel: opt.label                   // Label brut pour debug
    }));

    // Trier : par index si présent, sinon ordre d'apparition (garder l'ordre du XML)
    const hasSpinnerIndex = spinnerWithIndex.some(opt => opt.index !== null);
    if (hasSpinnerIndex) {
        // Tri par index croissant (1, 2, 3, ...)
        spinnerWithIndex.sort((a, b) => {
            const indexA = a.index ?? Infinity; // Si pas d'index, mettre à la fin
            const indexB = b.index ?? Infinity;
            return indexA - indexB;
        });
    }
    // Sinon : garder l'ordre d'apparition du XML (pas de tri alphabétique)

    // Garder seulement label/value pour l'API finale
    options.spinner = spinnerWithIndex.map(opt => ({
        label: opt.label,
        value: opt.value
    }));

    // US-051 : Logo TBM - FORMAT : {ColorName}_{HexCode}
    // Exemple : "LogoBlack_#262626", "LogoRed_#A40000", "LogoWhite_#EFEFEF"
    const logoTBMRaw = extractParameterOptions(xmlDoc, 'Exterior_Logo_TBM', false);
    options.logoTBM = logoTBMRaw.map(opt => ({
        label: opt.label.split('_')[0],  // "LogoBlack_#262626" → "LogoBlack"
        value: opt.value                  // Valeur complète pour API : "Exterior_Logo_TBM.LogoBlack_#262626"
    }));

    // US-051 : Logo 9xx - FORMAT : {ColorName}_{HexCode}
    // Exemple : "LogoBlack_#262626", "LogoRed_#A40000", "LogoWhite_#EFEFEF"
    const logo9xxRaw = extractParameterOptions(xmlDoc, 'Exterior_Logo_9xx', false);
    options.logo9xx = logo9xxRaw.map(opt => ({
        label: opt.label.split('_')[0],  // "LogoRed_#A40000" → "LogoRed"
        value: opt.value                  // Valeur complète pour API : "Exterior_Logo_9xx.LogoRed_#A40000"
    }));

    // Decor - FORMAT V0.9.2+ : {DecorName}_{Flight|Ground}_{index}
    // Exemples : "Fjord_Flight_2", "Tarmac_Ground_5", "Studio_Ground_6"
    // ⚠️ IMPORTANT : Supporte UNIQUEMENT les bases Production (V0.2+) avec paramètre "Decor"
    // Les bases POC (V0.1) avec "POC Decor" ne sont PAS supportées
    const decorRaw = extractParameterOptions(xmlDoc, 'Decor', false);

    if (decorRaw.length === 0) {
        console.warn('⚠️ Paramètre Decor non trouvé - Base POC (V0.1) non supportée');
        options.decor = []; // Retourner vide pour les bases POC
    } else {
        // Mapper avec extraction de l'index (V0.9.2+)
        const decorWithIndex = decorRaw.map(opt => ({
            label: extractDecorName(opt.label),    // Label court pour affichage dropdown : "Fjord"
            value: opt.value,                       // Valeur COMPLÈTE du XML pour l'API : "Fjord_Flight_2"
            index: extractDecorIndex(opt.label),    // null si pas d'index (V0.2-V0.9.1)
            rawLabel: opt.label                     // Label brut pour debug
        }));

        // Trier : par index si présent (V0.9.2+), sinon ordre d'apparition (garder l'ordre du XML)
        const hasDecorIndex = decorWithIndex.some(opt => opt.index !== null);
        if (hasDecorIndex) {
            // V0.9.2+ : Tri par index croissant (1, 2, 3, ...)
            decorWithIndex.sort((a, b) => {
                const indexA = a.index ?? Infinity; // Si pas d'index, mettre à la fin
                const indexB = b.index ?? Infinity;
                return indexA - indexB;
            });
        }
        // Sinon : garder l'ordre d'apparition du XML (pas de tri alphabétique)

        // Garder seulement label/value pour l'API finale
        options.decor = decorWithIndex.map(opt => ({
            label: opt.label,
            value: opt.value
        }));
    }

    // Extraire les styles d'immatriculation
    const stylesParam = xmlDoc.querySelector('Parameter[label="Exterior_RegistrationNumber_Style"]');
    if (stylesParam) {
        const styleValues = stylesParam.querySelectorAll('Value');
        styleValues.forEach(value => {
            const label = value.getAttribute('label');
            if (label) {
                // Séparer slanted (A-E) et straight (F-J)
                if (label >= 'A' && label <= 'E') {
                    options.styleSlanted.push(label);
                } else if (label >= 'F' && label <= 'J') {
                    options.styleStraight.push(label);
                }
            }
        });
    } else {
        // Fallback si le Parameter n'existe pas dans le XML
        console.warn('Parameter Exterior_RegistrationNumber_Style non trouvé, utilisation des valeurs hardcodées');
        options.styleSlanted = ['A', 'B', 'C', 'D', 'E'];
        options.styleStraight = ['F', 'G', 'H', 'I', 'J'];
    }

    // US-053/US-054 : Extraction des toggles depuis le XML
    // SunGlass - ex: SunGlassON, SunGlassOFF
    options.sunGlass = extractParameterOptions(xmlDoc, 'SunGlass', false);

    // Tablet - ex: Open, Closed
    options.tablet = extractParameterOptions(xmlDoc, 'Tablet', false);

    // Door_pilot - ex: Open, Closed
    options.doorPilot = extractParameterOptions(xmlDoc, 'Door_pilot', false);

    // Door_passenger - ex: Open, Closed
    options.doorPassenger = extractParameterOptions(xmlDoc, 'Door_passenger', false);

    // Lighting_mood - ex: ON, OFF
    options.moodLights = extractParameterOptions(xmlDoc, 'Lighting_mood', false);

    // Lighting_Ceiling - ex: ON, OFF (variante Lighting_ceiling aussi possible)
    let lightingCeilingOptions = extractParameterOptions(xmlDoc, 'Lighting_Ceiling', false);
    if (lightingCeilingOptions.length === 0) {
        lightingCeilingOptions = extractParameterOptions(xmlDoc, 'Lighting_ceiling', false);
    }
    options.lightingCeiling = lightingCeilingOptions;

    return options;
}

// ======================================
// Extraction options Intérieur
// ======================================

/**
 * Extrait les options disponibles pour les dropdowns intérieur depuis le XML
 * Retourne un objet avec les listes pour chaque dropdown
 * @param {XMLDocument} xmlDoc - Le document XML de la database
 * @returns {Object} Objet contenant les listes d'options pour chaque dropdown
 */
export function getInteriorOptionsFromXML(xmlDoc) {

    const options = {
        prestige: [],
        carpet: extractParameterOptions(xmlDoc, 'Interior_Carpet'),
        seatCovers: extractParameterOptions(xmlDoc, 'Interior_SeatCovers'),
        tabletFinish: extractParameterOptions(xmlDoc, 'Interior_TabletFinish'),
        seatbelts: extractParameterOptions(xmlDoc, 'Interior_Seatbelts'),
        metalFinish: extractParameterOptions(xmlDoc, 'Interior_MetalFinish'),
        upperSidePanel: extractParameterOptions(xmlDoc, 'Interior_UpperSidePanel'),
        lowerSidePanel: extractParameterOptions(xmlDoc, 'Interior_LowerSidePanel'),
        ultraSuedeRibbon: extractParameterOptions(xmlDoc, 'Interior_Ultra-SuedeRibbon'),
        centralSeatMaterial: extractParameterOptions(xmlDoc, 'Interior_CentralSeatMaterial'),
        stitching: extractParameterOptions(xmlDoc, 'Interior_Stitching') // US-036
    };

    // Prestige - SPECIAL : Les prestiges sont des ConfigurationBookmark, pas des Parameters
    const prestigeBookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark[label^="Interior_PrestigeSelection_"]');
    options.prestige = Array.from(prestigeBookmarks).map(bookmark => {
        const label = bookmark.getAttribute('label').replace('Interior_PrestigeSelection_', '');
        return { label, value: label };
    });

    return options;
}

/**
 * Parse le XML pour extraire la config intérieur d'un prestige
 * @param {XMLDocument} xmlDoc - Le document XML parsé
 * @param {string} prestigeName - Nom du prestige (ex: "Oslo")
 * @returns {Object} Objet avec 10 propriétés : { carpet, seatCovers, tabletFinish, ... }
 * @throws {Error} Si le bookmark n'est pas trouvé
 */
export function getInteriorPrestigeConfig(xmlDoc, prestigeName) {

    const bookmarkLabel = `Interior_PrestigeSelection_${prestigeName}`;
    const bookmark = xmlDoc.querySelector(`ConfigurationBookmark[label="${bookmarkLabel}"]`);

    if (!bookmark) {
        throw new Error(`Prestige "${prestigeName}" introuvable dans le XML`);
    }

    const value = bookmark.getAttribute('value');
    if (!value) {
        throw new Error(`Prestige "${prestigeName}" sans valeur dans le XML`);
    }


    // Parser la config string : Interior_Carpet.XXX/Interior_CentralSeatMaterial.YYY/...
    const parts = value.split('/');
    const config = {};

    parts.forEach(part => {
        if (part.startsWith('Interior_Carpet.')) {
            config.carpet = part.replace('Interior_Carpet.', '');
        } else if (part.startsWith('Interior_CentralSeatMaterial.')) {
            config.centralSeatMaterial = part.replace('Interior_CentralSeatMaterial.', '');
        } else if (part.startsWith('Interior_LowerSidePanel.')) {
            config.lowerSidePanel = part.replace('Interior_LowerSidePanel.', '');
        } else if (part.startsWith('Interior_MetalFinish.')) {
            config.metalFinish = part.replace('Interior_MetalFinish.', '');
        } else if (part.startsWith('Interior_PerforatedSeatOptions.')) {
            config.perforatedSeatOptions = part.replace('Interior_PerforatedSeatOptions.', '');
        } else if (part.startsWith('Interior_SeatCovers.')) {
            config.seatCovers = part.replace('Interior_SeatCovers.', '');
        } else if (part.startsWith('Interior_Seatbelts.')) {
            config.seatbelts = part.replace('Interior_Seatbelts.', '');
        } else if (part.startsWith('Interior_Stitching.')) { // US-036
            config.stitching = part.replace('Interior_Stitching.', '');
        } else if (part.startsWith('Interior_TabletFinish.')) {
            config.tabletFinish = part.replace('Interior_TabletFinish.', '');
        } else if (part.startsWith('Interior_Ultra-SuedeRibbon.')) {
            config.ultraSuedeRibbon = part.replace('Interior_Ultra-SuedeRibbon.', '');
        } else if (part.startsWith('Interior_UpperSidePanel.')) {
            config.upperSidePanel = part.replace('Interior_UpperSidePanel.', '');
        }
    });

    return config;
}

/**
 * Déduit le prestige utilisé à partir des valeurs intérieur de la config par défaut
 * Compare les valeurs avec chaque bookmark prestige du XML
 *
 * @param {XMLDocument} xmlDoc - Document XML
 * @param {Object} interiorConfig - Config intérieur parsée (carpet, seatCovers, etc.)
 * @returns {string|null} Nom du prestige trouvé ou null
 */
export function findPrestigeFromInteriorConfig(xmlDoc, interiorConfig) {
    // Récupérer tous les bookmarks prestige
    const prestigeBookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark[label^="Interior_PrestigeSelection_"]');

    for (const bookmark of prestigeBookmarks) {
        const label = bookmark.getAttribute('label');
        const prestigeName = label.replace('Interior_PrestigeSelection_', '');

        try {
            const prestigeConfig = getInteriorPrestigeConfig(xmlDoc, prestigeName);

            // Comparer les valeurs clés (carpet et seatCovers suffisent généralement)
            if (prestigeConfig.carpet === interiorConfig.carpet &&
                prestigeConfig.seatCovers === interiorConfig.seatCovers) {
                return prestigeName;
            }
        } catch (e) {
            // Ignorer les erreurs de parsing
        }
    }

    return null;
}

// ======================================
// Utilitaires supplémentaires
// ======================================

/**
 * Récupère la configuration par défaut depuis le XML
 * Cherche la balise <Default value="..." /> dans le XML
 * @returns {Promise<string|null>} La config string par défaut ou null si non trouvée
 */
export async function getDefaultConfig() {

    try {
        const xmlDoc = await getDatabaseXML();

        // Chercher la balise <Default>
        const defaultNode = xmlDoc.querySelector('Default');

        if (defaultNode) {
            const defaultValue = defaultNode.getAttribute('value');
            if (defaultValue) {
                return defaultValue;
            }
        }

        console.warn('⚠️ Balise <Default> non trouvée dans le XML');
        return null;

    } catch (error) {
        console.error('❌ Erreur récupération config par défaut:', error);
        return null;
    }
}

/**
 * Récupère la liste des bases de données disponibles depuis l'API
 * Endpoint: GET https://wr-daher.lumiscaphe.com/Databases
 * @returns {Promise<Array<{name: string, id: string}>>} Liste des bases disponibles
 * @throws {Error} Si l'appel API échoue
 */
export async function fetchDatabases() {
    const url = `${API_BASE_URL}/Databases`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const xmlText = await response.text();
        const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');

        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Erreur de parsing XML: ' + parserError.textContent);
        }

        const databases = [];
        const databaseNodes = xmlDoc.querySelectorAll('database');

        databaseNodes.forEach((node) => {
            const name = node.getAttribute('name');
            const id = node.getAttribute('id');
            if (name && id) {
                databases.push({ name, id });
            }
        });

        return databases;

    } catch (error) {
        console.error('[ERROR] Bases de données:', error.message);
        throw error;
    }
}

/**
 * Parse une couleur depuis le format XML
 * Format: SocataWhite-29017-#dcdcd7-#D9D7C8-A+-29017-socata-white-solid-light
 * @param {string} colorStr - La chaîne de couleur à parser
 * @returns {Object|null} Objet avec { name, htmlColor, tag, keywords } ou null si invalide
 */
export function parseColorString(colorStr) {
    const parts = colorStr.split('-');

    if (parts.length < 5) {
        // Ne pas logger ici, c'est géré par l'appelant
        return null;
    }

    // Le tag peut être "A+", "noA+", ou vide
    const rawTag = parts[4] || '';
    const tag = rawTag === 'A+' ? 'A+' : '';  // Seul "A+" est valide, "noA+" = pas de tag

    // US-033 : Extraire les tags individuels depuis parts[5:]
    // Exemple: ["29017", "socata", "white", "solid", "light"]
    const tags = parts.slice(5).filter(t => t.length > 0);

    return {
        name: parts[0],              // AlbeilleBlack
        code: parts[1],              // 22505
        contrastColor: parts[2],     // #414142
        htmlColor: parts[3],         // #424243
        tag: tag,                    // "A+" ou ""
        keywords: parts.slice(5).join('-'), // Gardé pour compatibilité
        tags: tags                   // US-033 : ["22505", "albeille", "black", "dark", "metallic"]
    };
}

/**
 * Parse les valeurs d'un bookmark de schéma de peinture
 * Extrait les couleurs par défaut pour chaque zone depuis un bookmark
 * @param {Document} xmlDoc - Le document XML
 * @param {string} schemeName - Nom du schéma (ex: "Zephir")
 * @returns {Object|null} Objet avec les couleurs par zone ou null si non trouvé
 * @example
 * {
 *   zoneA: "SocataWhite",
 *   zoneB: "MetallicRed",
 *   zoneC: "SocataWhite",
 *   zoneD: "MetallicRed",
 *   zoneAPlus: "SocataWhite"
 * }
 */
export function parsePaintSchemeBookmark(xmlDoc, schemeName) {

    // Chercher le ConfigurationBookmark avec label="Exterior_{schemeName}"
    const bookmarkLabel = `Exterior_${schemeName}`;
    let targetBookmark = null;

    // Parcourir tous les ConfigurationBookmark pour trouver le bon
    const allBookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark');
    for (const b of allBookmarks) {
        if (b.getAttribute('label') === bookmarkLabel) {
            targetBookmark = b;
            break;
        }
    }

    if (!targetBookmark) {
        console.warn(`⚠️ ConfigurationBookmark "${bookmarkLabel}" non trouvé`);
        return null;
    }

    // L'attribut value contient les zones séparées par /
    // Format: Exterior_Colors_ZoneA+.{couleur}/Exterior_Colors_ZoneA.{couleur}/...
    const valueStr = targetBookmark.getAttribute('value');
    if (!valueStr) {
        console.warn(`⚠️ Bookmark "${bookmarkLabel}" sans attribut value`);
        return null;
    }


    // Parser les parties
    const parts = valueStr.split('/');
    const zones = {};

    for (const part of parts) {
        if (part.startsWith('Exterior_Colors_ZoneA+.')) {
            const colorStr = part.replace('Exterior_Colors_ZoneA+.', '');
            const parsedColor = parseColorString(colorStr);
            zones.zoneAPlus = parsedColor ? parsedColor.name : colorStr.split('-')[0];
        } else if (part.startsWith('Exterior_Colors_ZoneA.')) {
            const colorStr = part.replace('Exterior_Colors_ZoneA.', '');
            const parsedColor = parseColorString(colorStr);
            zones.zoneA = parsedColor ? parsedColor.name : colorStr.split('-')[0];
        } else if (part.startsWith('Exterior_Colors_ZoneB.')) {
            const colorStr = part.replace('Exterior_Colors_ZoneB.', '');
            const parsedColor = parseColorString(colorStr);
            zones.zoneB = parsedColor ? parsedColor.name : colorStr.split('-')[0];
        } else if (part.startsWith('Exterior_Colors_ZoneC.')) {
            const colorStr = part.replace('Exterior_Colors_ZoneC.', '');
            const parsedColor = parseColorString(colorStr);
            zones.zoneC = parsedColor ? parsedColor.name : colorStr.split('-')[0];
        } else if (part.startsWith('Exterior_Colors_ZoneD.')) {
            const colorStr = part.replace('Exterior_Colors_ZoneD.', '');
            const parsedColor = parseColorString(colorStr);
            zones.zoneD = parsedColor ? parsedColor.name : colorStr.split('-')[0];
        }
    }

    return zones;
}

/**
 * Récupère les listes de couleurs pour chaque zone depuis le XML
 * Zones: A, B, C, D, A+
 * @returns {Promise<Object>} Objet avec les listes de couleurs par zone
 * @example
 * {
 *   zoneA: [{name: "SocataWhite", htmlColor: "#D9D7C8", tag: "A+", ...}, ...],
 *   zoneB: [...],
 *   zoneC: [...],
 *   zoneD: [...],
 *   zoneAPlus: [...]
 * }
 */
export async function getExteriorColorZones() {
    try {
        const xmlDoc = await getDatabaseXML();

        const zones = {
            zoneA: [],
            zoneB: [],
            zoneC: [],
            zoneD: [],
            zoneAPlus: []
        };

        // Mapping des labels XML vers les clés de l'objet
        const zoneLabels = {
            'Exterior_Colors_ZoneA': 'zoneA',
            'Exterior_Colors_ZoneB': 'zoneB',
            'Exterior_Colors_ZoneC': 'zoneC',
            'Exterior_Colors_ZoneD': 'zoneD',
            'Exterior_Colors_ZoneA+': 'zoneAPlus'
        };

        for (const [xmlLabel, zoneKey] of Object.entries(zoneLabels)) {
            let param = null;
            const allParams = xmlDoc.querySelectorAll('Parameter');
            for (const p of allParams) {
                if (p.getAttribute('label') === xmlLabel) {
                    param = p;
                    break;
                }
            }

            if (!param) continue;

            const values = param.querySelectorAll('Value');

            for (const value of values) {
                // Les couleurs sont dans l'attribut label, pas dans textContent !
                const colorStr = value.getAttribute('label');

                // Ignorer les valeurs sans attribut label
                if (!colorStr) {
                    continue;
                }

                const parsedColor = parseColorString(colorStr);

                if (parsedColor) {
                    zones[zoneKey].push(parsedColor);
                }
            }
        }

        return zones;

    } catch (error) {
        console.error('[ERROR] Zones de couleurs:', error.message);
        throw error;
    }
}

// ======================================
// US-040: Validation de configuration
// ======================================

/**
 * Valide une configuration pour la base de données actuelle
 * Applique des fallbacks intelligents si des valeurs sont invalides
 * @param {Object} config - Configuration à valider
 * @returns {Promise<{config: Object, corrections: Array<string>}>} Config validée + corrections appliquées
 */
export async function validateConfigForDatabase(config) {

    const xmlDoc = await getDatabaseXML();
    const corrections = [];
    const validatedConfig = { ...config };

    // 1. Valider version (960/980)
    const versionOptions = getExteriorOptionsFromXML(xmlDoc).version || [];
    if (!versionOptions || versionOptions.length === 0) {
        // Parameter absent → Utiliser default
        validatedConfig.version = '960';
        corrections.push('version: Parameter absent → Default "960"');
    } else if (!versionOptions.find(v => v.value === config.version)) {
        validatedConfig.version = versionOptions[0].value;
        corrections.push(`version: "${config.version}" invalide → "${versionOptions[0].value}"`);
    }

    // 2. Valider paintScheme
    const paintSchemeOptions = getExteriorOptionsFromXML(xmlDoc).paintScheme || [];
    if (!paintSchemeOptions || paintSchemeOptions.length === 0) {
        // V0.1 : Seul "Zephir" disponible (fallback)
        validatedConfig.paintScheme = 'Zephir';
        corrections.push('paintScheme: Parameter absent → Default "Zephir"');
    } else if (!paintSchemeOptions.find(s => s.value === config.paintScheme)) {
        validatedConfig.paintScheme = paintSchemeOptions[0].value;
        corrections.push(`paintScheme: "${config.paintScheme}" invalide → "${paintSchemeOptions[0].value}"`);
    }

    // 3. Valider prestige
    const prestigeOptions = getInteriorOptionsFromXML(xmlDoc).prestige || [];

    if (!prestigeOptions || prestigeOptions.length === 0) {
        validatedConfig.prestige = 'Oslo';
        corrections.push('prestige: Aucun disponible → Fallback "Oslo" (WARNING: peut échouer)');
    } else if (!prestigeOptions.find(p => p.value === config.prestige)) {
        validatedConfig.prestige = prestigeOptions[0].value;
        corrections.push(`prestige: "${config.prestige}" invalide → "${prestigeOptions[0].value}"`);
    }

    // 4. Valider spinner
    const spinnerOptions = getExteriorOptionsFromXML(xmlDoc).spinner || [];
    if (!spinnerOptions || spinnerOptions.length === 0) {
        validatedConfig.spinner = 'PolishedAluminium';
        corrections.push('spinner: Parameter absent → Default "PolishedAluminium"');
    } else if (!spinnerOptions.find(s => s.value === config.spinner)) {
        validatedConfig.spinner = spinnerOptions[0].value;
        corrections.push(`spinner: "${config.spinner}" invalide → "${spinnerOptions[0].value}"`);
    }

    // 5. Valider tous les autres parameters
    const parameterMappings = {
        'Decor': 'decor',
        'Door_pilot': 'doorPilot',
        'Door_passenger': 'doorPassenger',
        'SunGlass': 'sunglass',
        'Tablet': 'tablet',
        'Position': 'position'
    };

    // IMPORTANT: Utiliser getExteriorOptionsFromXML() pour le Decor car il applique le formatting
    // (retire _Ground et _Flight pour correspondre aux noms de camera groups)
    const exteriorOptions = getExteriorOptionsFromXML(xmlDoc);

    for (const [xmlLabel, configKey] of Object.entries(parameterMappings)) {
        const param = xmlDoc.querySelector(`Parameter[label="${xmlLabel}"]`);

        if (!param) {
            // Parameter absent → Garder valeur par défaut
            corrections.push(`${xmlLabel}: Parameter absent → Valeur ignorée dans payload`);
        } else {
            // SPECIAL: Pour Decor, utiliser les options formatées
            const options = (xmlLabel === 'Decor')
                ? exteriorOptions.decor
                : extractParameterOptions(xmlDoc, xmlLabel, false);

            const currentValue = config[configKey];

            if (currentValue && !options.find(o => o.value === currentValue)) {
                // Match intelligent : chercher d'abord un match sur label (ex: "Studio" → "Studio_Ground_6")
                const matchByLabel = options.find(o => o.label === currentValue);
                if (matchByLabel) {
                    validatedConfig[configKey] = matchByLabel.value;
                    corrections.push(`${xmlLabel}: "${currentValue}" → "${matchByLabel.value}" (match par label)`);
                } else {
                    validatedConfig[configKey] = options[0].value;
                    corrections.push(`${xmlLabel}: "${currentValue}" invalide → "${options[0].value}"`);
                }
            }
        }
    }

    // 6. Valider parameters intérieur
    const interiorMappings = {
        'Interior_Stitching': 'interiorStitching',
        'Interior_Carpet': 'interiorCarpet',
        'Interior_CentralSeatMaterial': 'interiorCentralSeatMaterial',
        'Interior_LowerSidePanel': 'interiorLowerSidePanel',
        'Interior_MetalFinish': 'interiorMetalFinish',
        'Interior_PerforatedSeatOptions': 'interiorPerforatedSeatOptions',
        'Interior_SeatCovers': 'interiorSeatCovers',
        'Interior_Seatbelts': 'interiorSeatbelts',
        'Interior_TabletFinish': 'interiorTabletFinish',
        'Interior_Ultra-SuedeRibbon': 'interiorUltraSuedeRibbon',
        'Interior_UpperSidePanel': 'interiorUpperSidePanel'
    };

    for (const [xmlLabel, configKey] of Object.entries(interiorMappings)) {
        const param = xmlDoc.querySelector(`Parameter[label="${xmlLabel}"]`);

        if (!param) {
            corrections.push(`${xmlLabel}: Parameter absent → Ignoré`);
        } else {
            const options = extractParameterOptions(xmlDoc, xmlLabel, false);
            const currentValue = config[configKey];

            if (currentValue && !options.find(o => o.value === currentValue)) {
                // Match intelligent : chercher d'abord un match sur label (ex: "Studio" → "Studio_Ground_6")
                const matchByLabel = options.find(o => o.label === currentValue);
                if (matchByLabel) {
                    validatedConfig[configKey] = matchByLabel.value;
                    corrections.push(`${xmlLabel}: "${currentValue}" → "${matchByLabel.value}" (match par label)`);
                } else {
                    validatedConfig[configKey] = options[0].value;
                    corrections.push(`${xmlLabel}: "${currentValue}" invalide → "${options[0].value}"`);
                }
            }
        }
    }

    // Corrections appliquées silencieusement (pas de log)
    // Les corrections sont retournées dans l'objet pour gestion par le caller

    return { config: validatedConfig, corrections };
}

// ======================================
// US-049 : Support Produits et Prestige
// ======================================

/**
 * US-049 [T049-1] : Récupère l'ID d'un produit par son nom
 * @param {string} productName - Nom du produit (ex: "PresetThumbnail", "TBM 960 980")
 * @returns {Promise<string>} ID du produit
 * @throws {Error} Si le produit n'est pas trouvé dans le XML
 */
export async function getProductIdByName(productName) {

    try {
        const xmlDoc = await getDatabaseXML();
        const products = xmlDoc.querySelectorAll('Product');


        for (let product of products) {
            const label = product.getAttribute('label');  // 🔧 CORRECTION : "label" pas "name"
            if (label === productName) {
                const id = product.getAttribute('id');
                return id;
            }
        }

        // Produit non trouvé
        throw new Error(`Produit "${productName}" introuvable dans le XML`);

    } catch (error) {
        console.error(`❌ Erreur récupération produit "${productName}":`, error);
        throw error;
    }
}

/**
 * US-049 [T049-2] : Récupère tous les noms de prestige disponibles
 * Parse tous les bookmarks Interior_PrestigeSelection_*
 * @returns {Promise<Array<string>>} Liste des noms de prestige (ex: ["Oslo", "London", ...])
 */
export async function getAllPrestigeNames() {

    try {
        const xmlDoc = await getDatabaseXML();
        const bookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark[label^="Interior_PrestigeSelection_"]');


        const prestigeNames = Array.from(bookmarks).map(bookmark => {
            const label = bookmark.getAttribute('label');
            // Extraire le nom après "Interior_PrestigeSelection_"
            return label.replace('Interior_PrestigeSelection_', '');
        });

        return prestigeNames;

    } catch (error) {
        console.error('❌ Erreur récupération noms prestige:', error);
        throw error;
    }
}

/**
 * US-049 [T049-4] : Parse le bookmark prestige et retourne les matériaux dans l'ordre
 * @param {Document} xmlDoc - Document XML parsé
 * @param {string} prestigeName - Nom du prestige (ex: "Oslo")
 * @returns {Array<string>} Tableau ordonné des 10 matériaux complets
 * @throws {Error} Si le bookmark n'est pas trouvé
 */
export function parsePrestigeBookmarkOrdered(xmlDoc, prestigeName) {

    const bookmarkLabel = `Interior_PrestigeSelection_${prestigeName}`;
    const bookmark = xmlDoc.querySelector(`ConfigurationBookmark[label="${bookmarkLabel}"]`);

    if (!bookmark) {
        throw new Error(`Bookmark prestige "${prestigeName}" introuvable dans le XML`);
    }

    const value = bookmark.getAttribute('value');
    if (!value) {
        throw new Error(`Bookmark prestige "${prestigeName}" sans valeur dans le XML`);
    }


    // Parser la config string : Interior_Carpet.XXX/Interior_CentralSeatMaterial.YYY/...
    // IMPORTANT : Garder l'ordre du bookmark XML
    const materials = value.split('/').filter(m => m.trim().length > 0);

    materials.forEach((mat, i) => {
        const paramName = mat.split('.')[0];
    });

    return materials;
}

// ======================================
// PDF View : Récupération caméra dynamique
// ======================================

/**
 * Récupère l'ID de la 2ème caméra du groupe "Exterieur_DecorStudio" pour la vue PDF
 * Récupère la caméra nommée "402" (index 1)
 * @returns {Promise<string>} ID de la 2ème caméra du groupe Exterieur_DecorStudio
 * @throws {Error} Si le groupe n'existe pas ou n'a pas au moins 2 caméras
 */
export async function getPDFCameraId() {
    try {
        const xmlDoc = await getDatabaseXML();
        const groups = xmlDoc.querySelectorAll('Group');

        // Rechercher le groupe "Exterieur_DecorStudio"
        let studioGroup = null;
        for (let group of groups) {
            const groupName = group.getAttribute('name');
            if (groupName === 'Exterieur_DecorStudio') {
                studioGroup = group;
                break;
            }
        }

        if (!studioGroup) {
            throw new Error('Groupe caméra "Exterieur_DecorStudio" introuvable dans le XML');
        }

        const groupId = studioGroup.getAttribute('id');

        // Récupérer toutes les caméras du groupe
        const cameras = await getCameraListFromGroup(groupId);

        if (cameras.length < 2) {
            throw new Error(`Le groupe "Exterieur_DecorStudio" doit contenir au moins 2 caméras (trouvé: ${cameras.length})`);
        }

        // Retourner la 2ème caméra (index 1) qui correspond à la caméra "402"
        const secondCamera = cameras[1];
        return secondCamera.id;

    } catch (error) {
        console.error('❌ Erreur récupération caméra PDF:', error);
        throw error;
    }
}

/**
 * Récupère les 3 dernières caméras du groupe "Overview" pour la mosaïque PDF
 * @returns {Promise<Array<Object>>} Array de 3 objets {id, name} des caméras 4, 5, 6
 * @throws {Error} Si le groupe n'existe pas ou n'a pas au moins 7 caméras
 */
export async function getPDFCameras() {
    try {
        const xmlDoc = await getDatabaseXML();
        const groups = xmlDoc.querySelectorAll('Group');

        // Rechercher le groupe "Overview"
        let overviewGroup = null;
        for (let group of groups) {
            const groupName = group.getAttribute('name');
            if (groupName === 'Overview') {
                overviewGroup = group;
                break;
            }
        }

        if (!overviewGroup) {
            throw new Error('Groupe caméra "Overview" introuvable dans le XML');
        }

        const groupId = overviewGroup.getAttribute('id');

        // Récupérer toutes les caméras du groupe
        const cameras = await getCameraListFromGroup(groupId);

        if (cameras.length < 7) {
            throw new Error(`Le groupe "Overview" doit contenir au moins 7 caméras pour la mosaïque PDF (trouvé: ${cameras.length})`);
        }

        // Retourner les 3 dernières caméras (indices 4, 5, 6)
        // Caméra 4 (index 4) : Principale 16:9
        // Caméra 5 (index 5) : Secondaire 1:1 gauche
        // Caméra 6 (index 6) : Secondaire 1:1 droite
        const pdfCameras = [
            cameras[4],  // 5ème caméra
            cameras[5],  // 6ème caméra
            cameras[6]   // 7ème caméra
        ];

        return pdfCameras;

    } catch (error) {
        console.error('❌ Erreur récupération caméras PDF mosaïque:', error);
        throw error;
    }
}
