// API.js - Intégration API Lumiscaphe
// Configurateur TBM Daher
// Version : 1.0
// Date : 02/12/2025

import { API_BASE_URL, DECORS_CONFIG } from './config.js';
import { extractAnchors, generateSurfaces } from './positioning.js';
import { generateMaterialsAndColors } from './colors.js';
import { setLastPayload } from './state.js';
import { log } from './logger.js';

// ======================================
// US-019 : Gestion dynamique DATABASE_ID
// ======================================

// ID de base actuelle (dynamique, n'est plus importé depuis config.js)
let currentDatabaseId = null;

/**
 * Définit l'ID de la base de données active
 * @param {string} databaseId - L'ID de la base à utiliser
 */
export function setDatabaseId(databaseId) {
    console.log(`📦 Changement de base de données: ${databaseId}`);
    currentDatabaseId = databaseId;
    // Invalider le cache XML pour forcer le rechargement
    cachedXML = null;
}

/**
 * Récupère l'ID de la base de données active
 * @returns {string} L'ID de la base actuelle
 */
export function getDatabaseId() {
    if (!currentDatabaseId) {
        throw new Error('DATABASE_ID non défini. Appelez setDatabaseId() d\'abord.');
    }
    return currentDatabaseId;
}

/**
 * Récupère la configuration par défaut depuis le XML
 * Cherche la balise <Default value="..." /> dans le XML
 *
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
 *
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

// ======================================
// US-005 : Intégration API Lumiscaphe
// ======================================

/**
 * Récupère la configuration complète depuis le XML
 * Porte la logique Python lignes 201-208 de generate_full_render.py
 *
 * @param {XMLDocument} xmlRoot - Le document XML parsé
 * @param {string} targetLabel - Le label du bookmark à chercher (ex: "Exterior_Sirocco")
 * @returns {string|null} La valeur du bookmark ou null si non trouvé
 */
function getConfigFromLabel(xmlRoot, targetLabel) {
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
 *
 * @param {XMLDocument} xmlRoot - Le document XML parsé
 * @param {string} parameterLabel - Le label du paramètre (ex: "Exterior_Colors_ZoneA")
 * @param {string} colorName - Le nom de la couleur (ex: "SocataWhite")
 * @returns {string|null} La chaîne complète de couleur ou null si non trouvée
 */
function findColorDataInXML(xmlRoot, parameterLabel, colorName) {
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
 * Construit la config string complète depuis le XML
 * Utilise getConfigFromLabel() pour récupérer les vraies configs
 *
 * @param {XMLDocument} xmlRoot - Le document XML parsé
 * @param {Object} config - La configuration utilisateur
 * @returns {string} La config string complète
 */
function getConfigString(xmlRoot, config) {
    console.log('🔧 Construction config string depuis XML...');

    const decorData = DECORS_CONFIG[config.decor];

    // Récupérer le bookmark du schéma de peinture depuis le XML
    // Ce bookmark contient à la fois Exterior_PaintScheme.XXX ET les zones Exterior_Colors_ZoneX.XXX
    const paintBookmarkValue = getConfigFromLabel(xmlRoot, `Exterior_${config.paintScheme}`);

    let paintConfig;

    if (paintBookmarkValue) {
        // Parser le bookmark pour extraire les parties
        const bookmarkParts = paintBookmarkValue.split('/');

        // Séparer la partie PaintScheme des parties zones
        const schemePart = bookmarkParts.find(p => p.startsWith('Exterior_PaintScheme.'));

        // Vérifier si les zones sont définies dans la config (elles le sont toujours après init)
        const zonesAreDefined = config.zoneA && config.zoneB && config.zoneC && config.zoneD && config.zoneAPlus;

        if (zonesAreDefined) {
            console.log('   > Construction config avec zones depuis state');

            // Construire les parties zones depuis le state
            const zoneParts = [];

            // IMPORTANT : L'ORDRE EST CRITIQUE !
            // Zone A+ doit venir EN PREMIER, sinon elle écrase Zone A dans le parsing
            // (les deux deviennent "A" après replace du "+")

            // 1. Zone A+ EN PREMIER
            const colorDataAPlus = findColorDataInXML(xmlRoot, 'Exterior_Colors_ZoneA+', config.zoneAPlus);
            if (colorDataAPlus) zoneParts.push(`Exterior_Colors_ZoneA+.${colorDataAPlus}`);

            // 2. Puis Zone A (écrasera A+ dans le color_map)
            const colorDataA = findColorDataInXML(xmlRoot, 'Exterior_Colors_ZoneA', config.zoneA);
            if (colorDataA) zoneParts.push(`Exterior_Colors_ZoneA.${colorDataA}`);

            // 3. Puis les autres zones
            const colorDataB = findColorDataInXML(xmlRoot, 'Exterior_Colors_ZoneB', config.zoneB);
            if (colorDataB) zoneParts.push(`Exterior_Colors_ZoneB.${colorDataB}`);

            const colorDataC = findColorDataInXML(xmlRoot, 'Exterior_Colors_ZoneC', config.zoneC);
            if (colorDataC) zoneParts.push(`Exterior_Colors_ZoneC.${colorDataC}`);

            const colorDataD = findColorDataInXML(xmlRoot, 'Exterior_Colors_ZoneD', config.zoneD);
            if (colorDataD) zoneParts.push(`Exterior_Colors_ZoneD.${colorDataD}`);

            // Reconstruire paintConfig avec zones + schéma (ordre du XML)
            paintConfig = [...zoneParts, schemePart].filter(Boolean).join('/');
        } else {
            // Utiliser le bookmark complet (zones pas encore initialisées)
            console.log('   > Utilisation du bookmark complet (zones non initialisées)');
            paintConfig = paintBookmarkValue;
        }
    } else {
        // Fallback si bookmark introuvable
        console.warn('   ⚠️ Bookmark introuvable, utilisation fallback');
        paintConfig = `Exterior_PaintScheme.${config.paintScheme}`;
    }

    // US-027 : Construire config intérieur personnalisée
    // IMPORTANT: NE PAS envoyer Interior_PrestigeSelection
    // On envoie SEULEMENT les 10 parties individuelles (le prestige sert juste à initialiser les valeurs)
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

    // DEBUG: Afficher ce qui est envoyé à l'API pour vérification
    log.debug('Interior SeatCovers envoyé:', config.seatCovers);
    log.debug('Interior Config complète:', interiorConfig);

    // US-022: Position dépend de la vue (exterior/interior)
    const positionValue = (config.viewType === "interior")
        ? "Interieur"           // Vue intérieure → Position fixe
        : config.decor;         // Vue extérieure → Position selon décor

    const configParts = [
        `Version.${config.version}`,
        paintConfig,           // Config depuis XML (avec zones personnalisées si définies)
        interiorConfig,        // US-027: Config intérieur personnalisée (10 parties)
        `Decor.${decorData.suffix}`,
        `Position.${positionValue}`,
        `Exterior_Spinner.${config.spinner}`,
        `SunGlass.${config.sunglass}`,        // US-024: Dynamique (SunGlassON/OFF)
        `Tablet.${config.tablet}`,            // US-023: Dynamique (Open/Closed)
        `Door_pilot.${config.doorPilot}`,     // US-025: Dynamique (Open/Closed)
        `Door_passenger.${config.doorPassenger}` // US-026: Dynamique (Open/Closed)
    ];

    const fullConfigStr = configParts.filter(Boolean).join('/');
    console.log('✅ Config string construite:', fullConfigStr);

    return fullConfigStr;
}

// ======================================
// Cache pour le XML (évite de télécharger à chaque appel)
// ======================================
let cachedXML = null;

/**
 * US-027 : Parse le XML pour extraire la config intérieur d'un prestige
 *
 * @param {XMLDocument} xmlDoc - Le document XML parsé
 * @param {string} prestigeName - Nom du prestige (ex: "Oslo")
 * @returns {Object} Objet avec 10 propriétés : { carpet, seatCovers, tabletFinish, ... }
 * @throws {Error} Si le bookmark n'est pas trouvé
 */
export function parsePrestigeConfig(xmlDoc, prestigeName) {
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

/**
 * Fonction générique pour extraire les options d'un Parameter du XML
 * Utilisable pour tous les dropdowns (intérieur ET extérieur)
 *
 * @param {XMLDocument} xmlDoc - Le document XML de la database
 * @param {string} parameterLabel - Le label du Parameter (ex: "Interior_Carpet", "Exterior_Version")
 * @param {boolean} formatLabel - Si true, formate le label (ex: "BeigeGray_2242" → "Beige Gray"). Si false, utilise le label brut
 * @returns {Array} Tableau d'options [{label, value}]
 */
export function extractParameterOptions(xmlDoc, parameterLabel, formatLabel = true) {
    const parameter = xmlDoc.querySelector(`Parameter[label="${parameterLabel}"]`);
    if (!parameter) {
        log.warn(`Parameter ${parameterLabel} non trouvé dans le XML`);
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
                // Formatter le label : "Aegean_2242_Leather" → "Aegean"
                // Prendre le premier segment (avant underscore + chiffres ou _belt/_Leather/etc.)
                const namePart = rawLabel.split('_')[0];
                // Convertir CamelCase en espaces : "BeigeGray" → "Beige Gray"
                displayLabel = namePart.replace(/([A-Z])/g, ' $1').trim();
            } else {
                // Utiliser le label brut
                displayLabel = rawLabel;
            }

            options.push({ label: displayLabel, value: configValue });
        }
    });

    log.debug(`${parameterLabel}: ${options.length} options extraites`);
    return options;
}

/**
 * Extrait les options disponibles pour les dropdowns intérieur depuis le XML
 * Retourne un objet avec les listes pour chaque dropdown
 *
 * @param {XMLDocument} xmlDoc - Le document XML de la database
 * @returns {Object} Objet contenant les listes d'options pour chaque dropdown
 */
export function getInteriorOptionsFromXML(xmlDoc) {
    log.int('Extraction des options intérieur depuis XML...');

    const options = {
        carpet: extractParameterOptions(xmlDoc, 'Interior_Carpet'),
        seatCovers: extractParameterOptions(xmlDoc, 'Interior_SeatCovers'),
        tabletFinish: extractParameterOptions(xmlDoc, 'Interior_TabletFinish'),
        seatbelts: extractParameterOptions(xmlDoc, 'Interior_Seatbelts'),
        metalFinish: extractParameterOptions(xmlDoc, 'Interior_MetalFinish'),
        upperSidePanel: extractParameterOptions(xmlDoc, 'Interior_UpperSidePanel'),
        lowerSidePanel: extractParameterOptions(xmlDoc, 'Interior_LowerSidePanel'),
        ultraSuedeRibbon: extractParameterOptions(xmlDoc, 'Interior_Ultra-SuedeRibbon'),
        centralSeatMaterial: extractParameterOptions(xmlDoc, 'Interior_CentralSeatMaterial')
    };

    log.int('✓ Carpet:', options.carpet.length, 'options');
    log.int('✓ SeatCovers:', options.seatCovers.length, 'options');
    log.int('✓ Seatbelts:', options.seatbelts.length, 'options');
    return options;
}

/**
 * Extrait les options disponibles pour les dropdowns extérieur depuis le XML
 * Retourne un objet avec les listes pour chaque dropdown
 *
 * @param {XMLDocument} xmlDoc - Le document XML de la database
 * @returns {Object} Objet contenant les listes d'options pour chaque dropdown
 */
export function getExteriorOptionsFromXML(xmlDoc) {
    log.ext('Extraction des options extérieur depuis XML...');

    // Fonctions spéciales pour formater les labels

    // "Alize_B-0_B-D_B-D_B-D_B-D" → "Alize"
    const formatPaintSchemeLabel = (rawLabel) => {
        return rawLabel.split('_')[0];
    };

    // "Studio_Ground" → "Studio", "Fjord_Flight" → "Fjord"
    const formatDecorLabel = (rawLabel) => {
        return rawLabel.replace('_Ground', '').replace('_Flight', '');
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
    options.paintScheme = paintRaw.map(opt => ({
        label: formatPaintSchemeLabel(opt.label),
        value: formatPaintSchemeLabel(opt.value)
    }));

    // Prestige - SPECIAL : Les prestiges sont des ConfigurationBookmark, pas des Parameters
    const prestigeBookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark[label^="Interior_PrestigeSelection_"]');
    options.prestige = Array.from(prestigeBookmarks).map(bookmark => {
        const label = bookmark.getAttribute('label').replace('Interior_PrestigeSelection_', '');
        return { label, value: label };
    });

    // Spinner
    options.spinner = extractParameterOptions(xmlDoc, 'Exterior_Spinner', false);

    // Decor - extraire et formater (label ET value)
    const decorRaw = extractParameterOptions(xmlDoc, 'Decor', false);
    options.decor = decorRaw.map(opt => ({
        label: formatDecorLabel(opt.label),
        value: formatDecorLabel(opt.value)  // Formater aussi la value pour correspondre à DECORS_CONFIG
    }));

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
        log.warn('Parameter Exterior_RegistrationNumber_Style non trouvé, utilisation des valeurs hardcodées');
        options.styleSlanted = ['A', 'B', 'C', 'D', 'E'];
        options.styleStraight = ['F', 'G', 'H', 'I', 'J'];
    }

    log.ext('✓ Version:', options.version.length, 'options');
    log.ext('✓ PaintScheme:', options.paintScheme.length, 'options');
    log.ext('✓ Prestige:', options.prestige.length, 'options');
    log.ext('✓ Spinner:', options.spinner.length, 'options');
    log.ext('✓ Decor:', options.decor.length, 'options');
    log.ext('✓ Styles:', options.styleSlanted.length + options.styleStraight.length, 'options');

    return options;
}

/**
 * Télécharge le XML de la database depuis l'API
 * (Équivalent Python lignes 80-108)
 *
 * US-027 : Exporté pour utilisation dans app.js (event listener prestige)
 *
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

/**
 * Trouve le camera group ID pour un décor ou une vue
 * (Équivalent Python lignes 110-116)
 *
 * US-022: Support viewType "interior" / "exterior"
 *
 * Logique de recherche:
 * - Si viewType === "interior" → Chercher name="Interieur" (fixe, pas de variation)
 * - Si viewType === "exterior" → Comportement original (recherche par décor)
 *   1. Recherche exacte: "Exterieur_Decor{decorName}"
 *   2. Recherche partielle: contient "Decor{decorName}"
 *
 * @param {string} decorName - Nom du décor (ex: "Tarmac")
 * @param {string} viewType - Type de vue: "exterior" ou "interior"
 * @returns {Promise<string>} L'ID du groupe caméra
 * @throws {Error} Si aucun groupe caméra n'est trouvé
 */
async function findCameraGroupId(decorName, viewType = "exterior") {
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

    // Vue extérieure: comportement original
    // Recherche 1 : Nom exact "Exterieur_Decor{decorName}"
    const target = `Exterieur_Decor${decorName}`;
    console.log(`   > Recherche exacte: "${target}"`);

    for (let group of groups) {
        const groupName = group.getAttribute('name');
        if (groupName === target) {
            const id = group.getAttribute('id');
            console.log(`   ✅ Camera group trouvé (exact): ${id}`);
            return id;
        }
    }

    // Recherche 2 : Nom partiel contenant "Decor{decorName}"
    const partialTarget = `Decor${decorName}`;
    console.log(`   > Recherche partielle: contient "${partialTarget}"`);

    for (let group of groups) {
        const groupName = group.getAttribute('name') || '';
        if (groupName.includes(partialTarget)) {
            const id = group.getAttribute('id');
            console.log(`   ✅ Camera group trouvé (partiel): ${id} (nom: ${groupName})`);
            return id;
        }
    }

    // Pas trouvé
    throw new Error(`❌ Groupe caméra introuvable pour décor: ${decorName}`);
}

/**
 * Construit le payload JSON pour l'API Lumiscaphe
 * Reproduction exacte du payload du script Python (lignes 323-334)
 *
 * IMPORTANT: Cette fonction est maintenant ASYNC car elle doit télécharger le XML
 *
 * @param {Object} config - La configuration actuelle (depuis state)
 * @returns {Promise<Object>} Le payload JSON prêt à être envoyé
 */
export async function buildPayload(config) {
    console.log('🔧 === Construction du payload API ===');
    console.log('Config reçue:', config);

    // 1. Télécharger le XML pour extraire les données
    const xmlDoc = await getDatabaseXML();

    // 2. Extraire les anchors pour le positionnement (depuis XML)
    const anchors = extractAnchors(xmlDoc, config.paintScheme);

    // 3. Générer les surfaces (positions des lettres)
    const surfaces = generateSurfaces(config.immat, anchors);

    // 4. Construire la config string complète (depuis XML)
    const fullConfigStr = getConfigString(xmlDoc, config);
    console.log('Config string:', fullConfigStr);

    // 5. Extraire la partie PaintScheme depuis la config string (pour les couleurs)
    // La config string contient maintenant les vraies configs du XML avec les couleurs
    const paintSchemePart = fullConfigStr.split('/').find(part => part.startsWith('Exterior_PaintScheme'))
        || `Exterior_PaintScheme.${config.paintScheme}`;

    console.log('Paint scheme part:', paintSchemePart);

    // 6. Générer les matériaux et couleurs
    const { materials, materialMultiLayers } = generateMaterialsAndColors(
        config.immat,
        config.style,
        fullConfigStr,
        paintSchemePart
    );

    // 6. Trouver le camera group ID (ASYNC - télécharge le XML)
    // US-022: Passer viewType (exterior/interior)
    const cameraGroupId = await findCameraGroupId(config.decor, config.viewType || "exterior");

    // 7. Construire le payload final (structure identique au Python)
    const payload = {
        scene: [{
            database: getDatabaseId(),
            configuration: fullConfigStr,
            materials: materials,
            materialMultiLayers: materialMultiLayers,
            surfaces: surfaces
        }],
        mode: {
            images: {
                cameraGroup: cameraGroupId
            }
        },
        renderParameters: {
            width: config.imageWidth || 1920,
            height: config.imageHeight || 1080,
            antialiasing: true,
            superSampling: "2"
        },
        encoder: {
            jpeg: {
                quality: 95
            }
        }
    };

    console.log('✅ Payload construit:', JSON.stringify(payload, null, 2));
    return payload;
}

/**
 * Appelle l'API Lumiscaphe pour générer les rendus
 * Gestion des erreurs HTTP et retry automatique
 *
 * @param {Object} payload - Le payload JSON construit par buildPayload()
 * @param {number} retryCount - Nombre de tentatives (défaut: 3)
 * @returns {Promise<Array<string>>} Tableau des URLs d'images
 * @throws {Error} Si l'appel échoue après toutes les tentatives
 */
export async function callLumiscapheAPI(payload, retryCount = 3) {
    console.log('🚀 Appel API Lumiscaphe...');

    const url = `${API_BASE_URL}/Snapshot`;
    const timeout = 30000; // 30 secondes

    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            console.log(`   Tentative ${attempt}/${retryCount}...`);

            // Créer un AbortController pour gérer le timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            // Appel fetch avec timeout
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Vérifier le code HTTP
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Vérifier le content-type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Réponse non-JSON reçue: ${contentType}`);
            }

            // Parser la réponse JSON
            const data = await response.json();

            // Vérifier que c'est un tableau
            if (!Array.isArray(data)) {
                throw new Error('Réponse API invalide: tableau attendu');
            }

            // Extraire les URLs
            const imageUrls = data
                .filter(item => item && item.url)
                .map(item => item.url);

            if (imageUrls.length === 0) {
                throw new Error('Aucune URL d\'image dans la réponse');
            }

            console.log(`✅ ${imageUrls.length} images reçues`);
            return imageUrls;

        } catch (error) {
            console.error(`❌ Tentative ${attempt} échouée:`, error.message);

            // Si c'est un timeout
            if (error.name === 'AbortError') {
                console.error('   Timeout après 30 secondes');
            }

            // Si c'est la dernière tentative, on throw
            if (attempt === retryCount) {
                throw new Error(`Échec après ${retryCount} tentatives: ${error.message}`);
            }

            // Sinon, attendre avant de réessayer (backoff exponentiel)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`   Nouvelle tentative dans ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Retourne les URLs d'images sans validation préalable
 * Le navigateur chargera les images directement via <img src="">
 *
 * Note: La validation HEAD a été supprimée car:
 * - Certaines APIs ne supportent pas HEAD
 * - Les URLs peuvent expirer rapidement
 * - Le navigateur gère naturellement les erreurs de chargement
 *
 * @param {Array<string>} imageUrls - Les URLs des images
 * @returns {Promise<Array<string>>} Les URLs des images
 */
export async function downloadImages(imageUrls) {
    console.log(`📥 Préparation de ${imageUrls.length} images...`);

    // Afficher les URLs dans la console pour debug
    imageUrls.forEach((url, i) => {
        console.log(`   Image ${i + 1}: ${url}`);
    });

    console.log(`✅ ${imageUrls.length} images prêtes à charger`);

    // Retourner directement les URLs, le navigateur les chargera
    return imageUrls;
}

/**
 * FONCTION PRINCIPALE : Génère les rendus via l'API
 * Orchestre la construction du payload, l'appel API et le téléchargement
 *
 * @param {Object} config - La configuration actuelle
 * @returns {Promise<Array<string>>} Les URLs des images
 */
export async function fetchRenderImages(config) {
    console.log('🎬 === GÉNÉRATION DES RENDUS ===');
    console.log('Configuration:', config);

    try {
        // 1. Construire le payload (ASYNC - télécharge le XML pour le camera group ID)
        const payload = await buildPayload(config);

        // US-021 : Sauvegarder le payload pour téléchargement ultérieur
        setLastPayload(payload);
        console.log('💾 Payload sauvegardé pour téléchargement JSON');

        // 2. Appeler l'API
        const imageUrls = await callLumiscapheAPI(payload);

        // 3. Valider les images
        const validatedUrls = await downloadImages(imageUrls);

        console.log('✅ Génération terminée avec succès');
        return validatedUrls;

    } catch (error) {
        console.error('❌ Échec de la génération:', error);
        throw error;
    }
}

// ======================================
// FONCTION DE TEST (DÉVELOPPEMENT)
// ======================================

/**
 * Parse une couleur depuis le format XML
 * Format: SocataWhite-29017-#dcdcd7-#D9D7C8-A+-29017-socata-white-solid-light
 *
 * @param {string} colorStr - La chaîne de couleur à parser
 * @returns {Object|null} Objet avec { name, htmlColor, tag, keywords } ou null si invalide
 */
function parseColorString(colorStr) {
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
 *
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
 *
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

/**
 * Teste la construction du payload sans appeler l'API
 * Pour tester : Appeler testPayloadBuild() dans la console (retourne une Promise)
 *
 * IMPORTANT: Cette fonction est maintenant ASYNC (télécharge le XML)
 */
export async function testPayloadBuild() {
    console.log('🧪 === TEST BUILD PAYLOAD ===');

    const testConfig = {
        version: "960",
        paintScheme: "Sirocco",
        prestige: "Oslo",
        decor: "Tarmac",
        spinner: "PolishedAluminium",
        fontType: "slanted",
        style: "A",
        immat: "NWM1MW",
        imageWidth: 1920,
        imageHeight: 1080
    };

    const payload = await buildPayload(testConfig);

    console.log('\n📊 Payload généré:');
    console.log(JSON.stringify(payload, null, 2));

    console.log('\n📋 Vérifications:');
    console.log('✓ scene.database:', payload.scene[0].database);
    console.log('✓ scene.configuration:', payload.scene[0].configuration);
    console.log('✓ materials count:', payload.scene[0].materials.length);
    console.log('✓ materialMultiLayers count:', payload.scene[0].materialMultiLayers.length);
    console.log('✓ surfaces count:', payload.scene[0].surfaces.length);
    console.log('✓ renderParameters:', payload.renderParameters);
    console.log('✓ cameraGroup:', payload.mode.images.cameraGroup);

    console.log('\n✅ Test terminé');
    return payload;
}
