/**
 * @fileoverview Construction des payloads pour l'API Lumiscaphe
 * @module api/payload-builder
 * @version 1.0
 */

import { DECORS_CONFIG } from '../config.js';
import { getDatabaseXML, getConfigFromLabel, findColorDataInXML, findCameraGroupId } from './xml-parser.js';
import { getDatabaseId } from './api-client.js';
import { extractAnchors, generateSurfaces } from '../utils/positioning.js';
import { generateMaterialsAndColors } from '../utils/colors.js';
import { log } from '../logger.js';

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
    // Récupérer le bookmark du schéma de peinture depuis le XML
    // Ce bookmark contient à la fois Exterior_PaintScheme.XXX ET les zones Exterior_Colors_ZoneX.XXX
    const paintBookmarkValue = getConfigFromLabel(xmlDoc, `Exterior_${config.paintScheme}`);

    if (!paintBookmarkValue) {
        // Fallback si bookmark introuvable
        console.warn('   ⚠️ Bookmark introuvable, utilisation fallback');
        return `Exterior_PaintScheme.${config.paintScheme}`;
    }

    // Parser le bookmark pour extraire les parties
    const bookmarkParts = paintBookmarkValue.split('/');

    // Séparer la partie PaintScheme des parties zones
    const schemePart = bookmarkParts.find(p => p.startsWith('Exterior_PaintScheme.'));

    // Vérifier si les zones sont définies dans la config (elles le sont toujours après init)
    const zonesAreDefined = config.zoneA && config.zoneB && config.zoneC && config.zoneD && config.zoneAPlus;

    if (zonesAreDefined) {
        return buildPaintConfigWithZones(xmlDoc, config, schemePart);
    } else {
        // Utiliser le bookmark complet (zones pas encore initialisées)
        console.log('   > Utilisation du bookmark complet (zones non initialisées)');
        return paintBookmarkValue;
    }
}

/**
 * Construit la config paint scheme avec zones personnalisées
 * @param {XMLDocument} xmlDoc - Document XML
 * @param {Object} config - Configuration utilisateur
 * @param {string} schemePart - Partie Exterior_PaintScheme.XXX
 * @returns {string} Configuration complète avec zones
 */
function buildPaintConfigWithZones(xmlDoc, config, schemePart) {
    console.log('   > Construction config avec zones depuis state');

    // Construire les parties zones depuis le state
    const zoneParts = [];

    // IMPORTANT : L'ORDRE EST CRITIQUE !
    // Zone A+ doit venir EN PREMIER, sinon elle écrase Zone A dans le parsing
    // (les deux deviennent "A" après replace du "+")

    // 1. Zone A+ EN PREMIER
    const colorDataAPlus = findColorDataInXML(xmlDoc, 'Exterior_Colors_ZoneA+', config.zoneAPlus);
    if (colorDataAPlus) zoneParts.push(`Exterior_Colors_ZoneA+.${colorDataAPlus}`);

    // 2. Puis Zone A (écrasera A+ dans le color_map)
    const colorDataA = findColorDataInXML(xmlDoc, 'Exterior_Colors_ZoneA', config.zoneA);
    if (colorDataA) zoneParts.push(`Exterior_Colors_ZoneA.${colorDataA}`);

    // 3. Puis les autres zones
    const colorDataB = findColorDataInXML(xmlDoc, 'Exterior_Colors_ZoneB', config.zoneB);
    if (colorDataB) zoneParts.push(`Exterior_Colors_ZoneB.${colorDataB}`);

    const colorDataC = findColorDataInXML(xmlDoc, 'Exterior_Colors_ZoneC', config.zoneC);
    if (colorDataC) zoneParts.push(`Exterior_Colors_ZoneC.${colorDataC}`);

    const colorDataD = findColorDataInXML(xmlDoc, 'Exterior_Colors_ZoneD', config.zoneD);
    if (colorDataD) zoneParts.push(`Exterior_Colors_ZoneD.${colorDataD}`);

    // Reconstruire paintConfig avec zones + schéma (ordre du XML)
    return [...zoneParts, schemePart].filter(Boolean).join('/');
}

/**
 * Construit la string de configuration intérieur
 * @param {Object} config - Configuration utilisateur
 * @returns {string} Configuration intérieur formatée
 */
function buildInteriorConfigString(config) {
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
        `Interior_Stitching.${config.stitching}`, // US-036
        `Interior_TabletFinish.${config.tabletFinish}`,
        `Interior_Ultra-SuedeRibbon.${config.ultraSuedeRibbon}`,
        `Interior_UpperSidePanel.${config.upperSidePanel}`
    ].join('/');

    // DEBUG: Afficher ce qui est envoyé à l'API pour vérification
    log.debug('Interior SeatCovers envoyé:', config.seatCovers);
    log.debug('Interior Config complète:', interiorConfig);

    return interiorConfig;
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
    return configString.split('/').find(part => part.startsWith('Exterior_PaintScheme')) || '';
}

/**
 * Construit la configuration string complète
 * @param {XMLDocument} xmlDoc - Document XML
 * @param {Object} config - Configuration utilisateur
 * @returns {string} Configuration string complète
 */
export function buildConfigString(xmlDoc, config) {
    console.log('🔧 Construction config string depuis XML...');

    const paintConfig = extractPaintConfig(xmlDoc, config);
    const interiorConfig = buildInteriorConfigString(config);
    const { suffix: decorSuffix } = buildDecorConfig(config.decor);

    // US-022: Position dépend de la vue (exterior/interior)
    const positionValue = (config.viewType === "interior")
        ? "Interieur"           // Vue intérieure → Position fixe
        : config.decor;         // Vue extérieure → Position selon décor

    const configParts = [
        `Version.${config.version}`,
        paintConfig,           // Config depuis XML (avec zones personnalisées si définies)
        interiorConfig,        // US-027: Config intérieur personnalisée (10 parties)
        `Decor.${decorSuffix}`,
        `Position.${positionValue}`,
        `Exterior_Spinner.${config.spinner}`,
        `SunGlass.${config.sunglass}`,        // US-024: Dynamique (SunGlassON/OFF)
        `Tablet.${config.tablet}`,            // US-023: Dynamique (Open/Closed)
        `Door_pilot.${config.doorPilot}`,     // US-025: Dynamique (Open/Closed)
        `Door_passenger.${config.doorPassenger}`, // US-026: Dynamique (Open/Closed)
        config.registrationStyle ? `Exterior_RegistrationNumber_Style.${config.registrationStyle}` : null
    ];

    const fullConfigStr = configParts.filter(Boolean).join('/');
    console.log('✅ Config string construite:', fullConfigStr);

    return fullConfigStr;
}

// ======================================
// Construction payloads
// ======================================

/**
 * Construit un payload BASE (logique commune aux 2 modes)
 * @param {Object} config - Configuration utilisateur
 * @param {string} mode - "normal" (cameraGroup) ou "singleCamera" (camera)
 * @returns {Promise<Object>} Payload prêt pour l'API
 */
async function buildPayloadBase(config, mode) {
    console.log(`🔧 === Construction du payload API (mode: ${mode}) ===`);
    console.log('Config reçue:', config);

    // 1. Télécharger le XML pour extraire les données
    const xmlDoc = await getDatabaseXML();

    // 2. Construire la config string complète (depuis XML)
    const fullConfigStr = buildConfigString(xmlDoc, config);
    console.log('Config string:', fullConfigStr);

    // 3. Extraire la partie PaintScheme depuis la config string (pour les couleurs)
    const paintSchemePart = extractPaintSchemePart(fullConfigStr) || `Exterior_PaintScheme.${config.paintScheme}`;
    console.log('Paint scheme part:', paintSchemePart);

    // 4. Générer les matériaux et couleurs
    const { materials, materialMultiLayers } = generateMaterialsAndColors(
        config.immat,
        config.registrationStyle || config.style,
        fullConfigStr,
        paintSchemePart
    );

    // 5. Construire surfaces (vide pour singleCamera, rempli pour normal)
    let surfaces = [];
    if (mode === 'normal') {
        // Extraire les anchors pour le positionnement (depuis XML)
        const anchors = extractAnchors(xmlDoc, config.paintScheme);
        // Générer les surfaces (positions des lettres)
        surfaces = generateSurfaces(config.immat, anchors);
    }

    // 6. Construire le mode (cameraGroup vs camera)
    let modeConfig;
    if (mode === 'singleCamera') {
        modeConfig = {
            image: {
                camera: config.cameraId  // Mode singulier avec camera au lieu de cameraGroup
            }
        };
    } else {
        // Mode normal : groupe de caméras
        const cameraGroupId = await findCameraGroupId(config.decor, config.viewType || "exterior");
        modeConfig = {
            images: {
                cameraGroup: cameraGroupId
            }
        };
    }

    // 7. Construire le payload final (structure identique au Python)
    const payload = {
        scene: [{
            database: getDatabaseId(),
            configuration: fullConfigStr,
            materials: materials,
            materialMultiLayers: materialMultiLayers,
            surfaces: surfaces
        }],
        mode: modeConfig,
        renderParameters: {
            width: config.imageWidth || (mode === 'singleCamera' ? 400 : 1920),
            height: config.imageHeight || (mode === 'singleCamera' ? 225 : 1080),
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
 * Construit un payload pour l'API Lumiscaphe (mode normal - groupe de caméras)
 * @param {Object} config - Configuration utilisateur
 * @returns {Promise<Object>} Payload prêt pour l'API
 */
export async function buildPayload(config) {
    return buildPayloadBase(config, 'normal');
}

/**
 * Construit un payload pour une caméra unique
 * @param {Object} config - Configuration avec cameraId
 * @returns {Promise<Object>} Payload prêt pour l'API
 */
export async function buildPayloadForSingleCamera(config) {
    return buildPayloadBase(config, 'singleCamera');
}
