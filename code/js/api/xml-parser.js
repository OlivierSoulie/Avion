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
        console.log('   > Utilisation du XML en cache');
        return cachedXML;
    }

    console.log('   > Téléchargement du XML depuis l\'API...');
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

        console.log('   > XML téléchargé et parsé avec succès');
        return cachedXML;
    } catch (error) {
        console.error('❌ Erreur téléchargement XML:', error);
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
    console.log(`📷 Recherche camera group - Décor: ${decorName}, Vue: ${viewType}`);

    // Télécharger le XML
    const xmlDoc = await getDatabaseXML();
    const groups = xmlDoc.querySelectorAll('Group');

    console.log(`   > ${groups.length} groupes trouvés dans le XML`);

    // US-022: Si vue intérieure, chercher "Interieur"
    if (viewType === "interior") {
        console.log(`   > Recherche vue intérieure: name="Interieur"`);

        for (let group of groups) {
            const groupName = group.getAttribute('name');
            if (groupName === "Interieur") {
                const id = group.getAttribute('id');
                console.log(`   ✅ Camera group intérieur trouvé: ${id}`);
                return id;
            }
        }

        throw new Error(`❌ Groupe caméra "Interieur" introuvable dans le XML`);
    }

    // US-042: Si vue configuration, chercher "Configuration"
    if (viewType === "configuration") {
        console.log(`   > Recherche vue configuration: name="Configuration"`);

        for (let group of groups) {
            const groupName = group.getAttribute('name');
            if (groupName === "Configuration") {
                const id = group.getAttribute('id');
                console.log(`   ✅ Camera group Configuration trouvé: ${id}`);
                return id;
            }
        }

        throw new Error(`❌ Groupe caméra "Configuration" introuvable dans le XML`);
    }

    // Vue extérieure: comportement original
    // US-040 V0.2 : Si decorName contient coordonnées (ex: "Fjord_201_0_0_0_0_-90_-15"),
    // extraire juste le nom du décor (ex: "Fjord")
    let decorBaseName = decorName;
    if (/^[A-Za-z]+_[\d\-_]+$/.test(decorName)) {
        // Format V0.2 avec coordonnées : extraire juste le nom (avant premier underscore)
        decorBaseName = decorName.split('_')[0];
        console.log(`   > Détection format V0.2: "${decorName}" → "${decorBaseName}"`);
    }

    // Recherche 1 : Nom exact "Exterieur_Decor{decorBaseName}"
    const target = `Exterieur_Decor${decorBaseName}`;
    console.log(`   > Recherche exacte: "${target}"`);

    for (let group of groups) {
        const groupName = group.getAttribute('name');
        if (groupName === target) {
            const id = group.getAttribute('id');
            console.log(`   ✅ Camera group trouvé (exact): ${id}`);
            return id;
        }
    }

    // Recherche 2 : Nom partiel contenant "Decor{decorBaseName}"
    const partialTarget = `Decor${decorBaseName}`;
    console.log(`   > Recherche partielle: contient "${partialTarget}"`);

    for (let group of groups) {
        const groupName = group.getAttribute('name') || '';
        if (groupName.includes(partialTarget)) {
            const id = group.getAttribute('id');
            console.log(`   ✅ Camera group trouvé (partiel): ${id} (nom: ${groupName})`);
            return id;
        }
    }

    // Recherche 3 : Fallback V0.1/V0.2 - chercher juste "Exterieur"
    console.log(`   > Recherche fallback: "Exterieur" (V0.1/V0.2)`);

    for (let group of groups) {
        const groupName = group.getAttribute('name');
        if (groupName === 'Exterieur') {
            const id = group.getAttribute('id');
            console.log(`   ✅ Camera group trouvé (fallback V0.1/V0.2): ${id}`);
            return id;
        }
    }

    // Pas trouvé
    throw new Error(`❌ Groupe caméra introuvable pour décor: ${decorName}`);
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

    console.log(`   > Groupe trouvé: ${group.getAttribute('name')}`);
    console.log(`   > Contenu du groupe (innerHTML):`, group.innerHTML.substring(0, 500));

    // Récupérer toutes les caméras du groupe
    const cameras = [];

    // Pour le groupe Configuration, les caméras sont directement dans le groupe (balises <Camera>)
    const cameraElements = group.querySelectorAll('Camera');

    console.log(`   > Nombre de Camera trouvées: ${cameraElements.length}`);

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

    console.log(`   > Groupe ${groupId}: ${cameras.length} caméras trouvées`);
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
    console.log('📷 Récupération du groupe caméra "Overview"...');

    const xmlDoc = await getDatabaseXML();
    const groups = xmlDoc.querySelectorAll('Group');

    console.log(`   > ${groups.length} groupes trouvés dans le XML`);

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
    console.log(`   ✅ Groupe "Overview" trouvé (ID: ${groupId})`);

    // Récupérer toutes les caméras du groupe
    const cameraElements = overviewGroup.querySelectorAll('Camera');
    console.log(`   > ${cameraElements.length} caméras trouvées dans le groupe Overview`);

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
            console.log(`   > Caméra ${i + 1}: ${cameraName} (${sensorInfo.width}x${sensorInfo.height})`);
        } catch (error) {
            console.error(`   ❌ Erreur récupération sensor pour caméra ${cameraId}:`, error);
            throw new Error(`Impossible de récupérer le sensor de la caméra ${cameraName}`);
        }
    }

    console.log(`✅ Groupe "Overview" : ${cameras.length} caméra(s) parsée(s)`);
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
    console.log(`   > Recherche Bookmark : '${targetLabel}'`);

    const nodes = xmlRoot.querySelectorAll('ConfigurationBookmark');

    for (const node of nodes) {
        const label = node.getAttribute('label');
        if (label === targetLabel) {
            const value = node.getAttribute('value');
            if (value) {
                console.log(`   ✅ Bookmark trouvé : ${value}`);
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
                    console.log(`[US-038 DEBUG] rawLabel: "${rawLabel}" → namePart: "${namePart}" → cleanName: "${cleanName}" → displayLabel: "${displayLabel}"`);
                }
            } else {
                // Utiliser le label brut
                displayLabel = rawLabel;
            }

            options.push({ label: displayLabel, value: configValue });
        }
    });

    console.log(`${parameterLabel}: ${options.length} options extraites`);
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
    console.log('Extraction des options extérieur depuis XML...');

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

        // Pattern V0.3+ : {decorName}_{Flight|Ground}
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

    const options = {
        version: [],
        paintScheme: [],
        prestige: [],
        spinner: [],
        decor: [],
        styleSlanted: [],
        styleStraight: []
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
        console.log('📊 Paint Schemes triés par INDEX (V0.6+):', paintWithIndex.map(p => `${p.label} (${p.index})`));
    } else {
        // V0.2-V0.5 : Tri alphabétique
        paintWithIndex.sort((a, b) => a.label.localeCompare(b.label));
        console.log('📊 Paint Schemes triés ALPHABÉTIQUEMENT (V0.2-V0.5):', paintWithIndex.map(p => p.label));
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

    // Spinner
    options.spinner = extractParameterOptions(xmlDoc, 'Exterior_Spinner', false);

    // Decor - extraire tel quel depuis le XML (data-driven)
    // ⚠️ IMPORTANT : Supporte UNIQUEMENT les bases Production (V0.2+) avec paramètre "Decor"
    // Les bases POC (V0.1) avec "POC Decor" ne sont PAS supportées
    const decorRaw = extractParameterOptions(xmlDoc, 'Decor', false);

    if (decorRaw.length === 0) {
        console.warn('⚠️ Paramètre Decor non trouvé - Base POC (V0.1) non supportée');
        options.decor = []; // Retourner vide pour les bases POC
    } else {
        const decorSet = new Set(); // Pour éviter les doublons exacts

        decorRaw.forEach(opt => {
            const decorName = extractDecorName(opt.label);
            decorSet.add(decorName);
        });

        // Convertir en tableau d'options {label, value}
        options.decor = Array.from(decorSet).map(name => ({
            label: name,  // Nom du décor tel qu'extrait du XML
            value: name   // Valeur identique pour le moment
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

    console.log('✓ Version:', options.version.length, 'options');
    console.log('✓ PaintScheme:', options.paintScheme.length, 'options');
    console.log('✓ Prestige:', options.prestige.length, 'options');
    console.log('✓ Spinner:', options.spinner.length, 'options');
    console.log('✓ Decor:', options.decor.length, 'options');
    console.log('✓ Styles:', options.styleSlanted.length + options.styleStraight.length, 'options');

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
    console.log('Extraction des options intérieur depuis XML...');

    const options = {
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

    console.log('✓ Carpet:', options.carpet.length, 'options');
    console.log('✓ SeatCovers:', options.seatCovers.length, 'options');
    console.log('✓ Seatbelts:', options.seatbelts.length, 'options');
    console.log('✓ Stitching:', options.stitching.length, 'options'); // US-036
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
    console.log(`🔍 Parsing prestige config: ${prestigeName}`);

    const bookmarkLabel = `Interior_PrestigeSelection_${prestigeName}`;
    const bookmark = xmlDoc.querySelector(`ConfigurationBookmark[label="${bookmarkLabel}"]`);

    if (!bookmark) {
        throw new Error(`Prestige "${prestigeName}" introuvable dans le XML`);
    }

    const value = bookmark.getAttribute('value');
    if (!value) {
        throw new Error(`Prestige "${prestigeName}" sans valeur dans le XML`);
    }

    console.log(`   Config string prestige: ${value}`);

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

    console.log('   Prestige config parsed:', config);
    return config;
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
    console.log('🔍 Récupération de la configuration par défaut depuis le XML...');

    try {
        const xmlDoc = await getDatabaseXML();

        // Chercher la balise <Default>
        const defaultNode = xmlDoc.querySelector('Default');

        if (defaultNode) {
            const defaultValue = defaultNode.getAttribute('value');
            if (defaultValue) {
                console.log('✅ Config par défaut trouvée:', defaultValue);
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
    console.log('📋 Récupération de la liste des bases de données...');

    const url = `${API_BASE_URL}/Databases`;
    console.log('   URL:', url);

    try {
        console.log('   > Envoi requête GET...');
        const response = await fetch(url);

        console.log('   > Réponse reçue, status:', response.status);
        console.log('   > Content-Type:', response.headers.get('content-type'));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('   ❌ Erreur HTTP:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        // L'API retourne du XML, pas du JSON !
        const xmlText = await response.text();

        // DEBUG: Afficher le XML brut
        console.log('   > XML brut (100 premiers caractères):', xmlText.substring(0, 100));
        console.log('   > XML complet:', xmlText);

        const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');

        // Vérifier qu'il n'y a pas d'erreur de parsing
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Erreur de parsing XML: ' + parserError.textContent);
        }

        console.log('   > XML parsé avec succès');
        console.log('   > Root element:', xmlDoc.documentElement.tagName);
        console.log('   > Tous les enfants du root:', xmlDoc.documentElement.children);

        // Extraire les bases depuis le XML
        // Les balises sont en minuscules: <database>
        const databases = [];
        const databaseNodes = xmlDoc.querySelectorAll('database');

        console.log(`   > ${databaseNodes.length} balises <database> trouvées (querySelectorAll)`);

        databaseNodes.forEach((node, i) => {
            const name = node.getAttribute('name');
            const id = node.getAttribute('id');

            if (name && id) {
                databases.push({ name, id });
                console.log(`   Base ${i + 1}: ${name} (${id})`);
            } else {
                console.warn(`   ⚠️ Base ${i} incomplète:`, { name, id });
            }
        });

        console.log(`✅ ${databases.length} base(s) de données disponible(s)`);

        return databases;

    } catch (error) {
        console.error('❌ Erreur récupération bases de données:', error);
        console.error('   Type d\'erreur:', error.name);
        console.error('   Message:', error.message);
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
    console.log(`🎨 Recherche bookmark pour schéma: ${schemeName}`);

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

    console.log(`   > Value bookmark (200 premiers chars): ${valueStr.substring(0, 200)}...`);

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

    console.log(`✅ Bookmark "${bookmarkLabel}" parsé:`, zones);
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
    console.log('🎨 Récupération des zones de couleurs depuis le XML...');

    try {
        const xmlDoc = await getDatabaseXML();
        console.log('   > XML récupéré:', xmlDoc ? 'OK' : 'ECHEC');

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

        // Parser chaque zone
        for (const [xmlLabel, zoneKey] of Object.entries(zoneLabels)) {
            console.log(`   > Recherche paramètre: ${xmlLabel}`);

            // Trouver le paramètre en parcourant tous les Parameter (évite problème échappement CSS)
            let param = null;
            const allParams = xmlDoc.querySelectorAll('Parameter');
            for (const p of allParams) {
                if (p.getAttribute('label') === xmlLabel) {
                    param = p;
                    break;
                }
            }

            if (!param) {
                console.warn(`   ⚠️ Paramètre ${xmlLabel} NON TROUVÉ dans le XML`);
                console.log(`   > Tous les paramètres Exterior_Colors:`, xmlDoc.querySelectorAll('Parameter[label^="Exterior_Colors"]').length);
                continue;
            }

            // Récupérer toutes les valeurs (options)
            const values = param.querySelectorAll('Value');
            console.log(`   > ${xmlLabel}: ${values.length} Value trouvées`);

            if (values.length === 0) {
                console.warn(`   ⚠️ Aucune Value dans ${xmlLabel}`);
            }

            // DEBUG: Afficher les 3 premières valeurs pour comprendre le format
            if (values.length > 0) {
                console.log(`   > Exemple valeur 1: "${values[0].getAttribute('label')}"`);
                if (values.length > 1) console.log(`   > Exemple valeur 2: "${values[1].getAttribute('label')?.substring(0, 50)}..."`);
                if (values.length > 2) console.log(`   > Exemple valeur 3: "${values[2].getAttribute('label')?.substring(0, 50)}..."`);
            }

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

        console.log('✅ Zones de couleurs chargées:');
        console.log(`   - Zone A: ${zones.zoneA.length} couleurs`);
        console.log(`   - Zone B: ${zones.zoneB.length} couleurs`);
        console.log(`   - Zone C: ${zones.zoneC.length} couleurs`);
        console.log(`   - Zone D: ${zones.zoneD.length} couleurs`);
        console.log(`   - Zone A+: ${zones.zoneAPlus.length} couleurs`);

        return zones;

    } catch (error) {
        console.error('❌ Erreur récupération zones de couleurs:', error);
        console.error('   Stack:', error.stack);
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
    console.log('🔍 Validation de la configuration pour la base actuelle...');

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
        // V0.1 : AUCUN prestige → Fallback hardcodé
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
                validatedConfig[configKey] = options[0].value;
                corrections.push(`${xmlLabel}: "${currentValue}" invalide → "${options[0].value}"`);
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
                validatedConfig[configKey] = options[0].value;
                corrections.push(`${xmlLabel}: "${currentValue}" invalide → "${options[0].value}"`);
            }
        }
    }

    // Logger les corrections
    if (corrections.length > 0) {
        console.warn(`⚠️ Configuration corrigée (${corrections.length} corrections):`);
        corrections.forEach(c => console.warn(`   - ${c}`));
    } else {
        console.log('✅ Configuration 100% compatible avec la base actuelle');
    }

    return { config: validatedConfig, corrections };
}
