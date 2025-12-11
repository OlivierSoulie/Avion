/**
 * @fileoverview Construction des payloads pour l'API Lumiscaphe
 * @module api/payload-builder
 * @version 1.0
 */

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
    // Extraire le nom court du paintScheme (pour chercher le bookmark)
    // V0.2-V0.5 : "Zephir_B-0_B-D_..." → "Zephir"
    // V0.6+     : "Zephir_1_B-0_B-D_..." → "Zephir" (ignorer l'index)
    const paintSchemeName = config.paintScheme.split('_')[0];

    // Récupérer le bookmark du schéma de peinture depuis le XML
    // Ce bookmark contient à la fois Exterior_PaintScheme.XXX ET les zones Exterior_Colors_ZoneX.XXX
    const paintBookmarkValue = getConfigFromLabel(xmlDoc, `Exterior_${paintSchemeName}`);

    if (!paintBookmarkValue) {
        // Fallback si bookmark introuvable - utiliser le nom court + la valeur complète
        console.warn('   ⚠️ Bookmark introuvable, utilisation fallback');
        return `Exterior_PaintScheme.${config.paintScheme}`; // Valeur complète pour fallback
    }

    // ⚠️ WORKAROUND V0.6 : Le bookmark contient Exterior_PaintScheme sans index
    // mais l'API attend avec l'index inséré (erreur dans la base V0.6)
    // On doit rajouter l'index dans la partie Exterior_PaintScheme
    const bookmarkParts = paintBookmarkValue.split('/');

    // Trouver et corriger la partie Exterior_PaintScheme
    let schemePart = bookmarkParts.find(p => p.startsWith('Exterior_PaintScheme.'));

    if (schemePart) {
        // Extraire l'index de config.paintScheme si présent
        // config.paintScheme = "Tehuano_6_A-0_A-D_..." → index = 6
        const configParts = config.paintScheme.split('_');
        const hasIndex = configParts.length >= 2 && /^\d+$/.test(configParts[1]);

        if (hasIndex) {
            const index = configParts[1];

            // Vérifier si le bookmark contient déjà l'index
            const schemeValue = schemePart.replace('Exterior_PaintScheme.', '');
            const schemeValueParts = schemeValue.split('_');
            const bookmarkHasIndex = schemeValueParts.length >= 2 && /^\d+$/.test(schemeValueParts[1]);

            if (bookmarkHasIndex) {
                // Le bookmark contient déjà l'index, ne rien faire
            } else {
                // Le bookmark n'a pas d'index, l'ajouter
                const schemeName = schemeValueParts[0]; // "Tehuano"
                const restOfScheme = schemeValue.substring(schemeName.length + 1); // "A-0_A-D_..."

                schemePart = `Exterior_PaintScheme.${schemeName}_${index}_${restOfScheme}`;
            }
        }
    }

    // Vérifier si les zones sont définies dans la config (elles le sont toujours après init)
    const zonesAreDefined = config.zoneA && config.zoneB && config.zoneC && config.zoneD && config.zoneAPlus;

    if (zonesAreDefined) {
        // Construire avec zones personnalisées + schemePart corrigé
        return buildPaintConfigWithZones(xmlDoc, config, schemePart);
    } else {
        // Utiliser le bookmark complet (zones pas encore initialisées)
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

    return interiorConfig;
}

/**
 * Construit la configuration décor selon le format de la base
 * @param {XMLDocument} xmlDoc - Document XML pour détecter le format
 * @param {string} decorName - Nom du décor (ex: "Studio", "Fjord")
 * @returns {Object} {prefix, suffix, positionValue}
 */
function buildDecorConfig(xmlDoc, decorName) {
    // ⚠️ IMPORTANT : Supporte UNIQUEMENT les bases Production (V0.2+)
    // Les bases POC (V0.1) avec "POC Decor" ne sont PAS supportées


    // Chercher le paramètre Decor dans le XML (PRODUCTION uniquement)
    const decorParam = xmlDoc.querySelector('Parameter[label="Decor"]');

    if (!decorParam) {
        console.warn('⚠️ Paramètre Decor non trouvé - Base POC (V0.1) non supportée ou XML invalide');
        console.warn('   Utilisation fallback générique');
        return { prefix: 'Decor', suffix: `${decorName}_Ground`, positionValue: decorName };
    }

    // Extraire les valeurs pour détecter le format
    const values = decorParam.querySelectorAll('Value');

    if (values.length === 0) {
        console.warn('⚠️ Aucune valeur trouvée dans Parameter[label="Decor"]');
        console.warn('   Utilisation fallback générique');
        return { prefix: 'Decor', suffix: `${decorName}_Ground`, positionValue: decorName };
    }

    const firstSymbol = values[0]?.getAttribute('symbol') || '';
    // Extraire le suffix (enlever "Decor." au début)
    const firstValue = firstSymbol.replace(/^Decor\./i, '');

    // Détecter le format Production (V0.2 ou V0.3+)
    if (/^[A-Za-z]+_[A-Za-z0-9]+_[\d\-_]+$/.test(firstValue)) {
        // V0.2 : Format "{decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz"

        // Chercher la première valeur qui correspond au décor demandé
        for (const value of values) {
            const symbol = value.getAttribute('symbol');
            // Extraire le suffix (enlever "Decor." au début)
            const suffix = symbol.replace(/^Decor\./i, '');
            if (suffix.toLowerCase().startsWith(decorName.toLowerCase() + '_')) {
                return { prefix: 'Decor', suffix: suffix, positionValue: decorName };
            }
        }

        // Fallback si aucune correspondance
        console.warn(`   ⚠️ Aucune valeur V0.2 trouvée pour "${decorName}", utilisation première valeur`);
        return { prefix: 'Decor', suffix: firstValue, positionValue: decorName };
    } else {
        // V0.3+ : Format "{decorName}_{Ground|Flight}"

        // DEBUG : Afficher TOUTES les valeurs du XML
        for (const value of values) {
            const sym = value.getAttribute('symbol');
            const suf = sym.replace(/^Decor\./i, '');
        }

        // CORRECTION : Lire depuis le XML au lieu du dictionnaire hardcodé
        // Chercher la première valeur qui correspond au décor demandé
        for (const value of values) {
            const symbol = value.getAttribute('symbol');

            // Le symbol contient "Decor.Fjord_Flight" → extraire "Fjord_Flight"
            const suffix = symbol.replace(/^Decor\./i, '');

            // Vérifier si le suffix commence par le decorName
            // Exemples : "Studio_Ground", "Fjord_Flight", "NewDecor_Ground"
            if (suffix.toLowerCase().startsWith(decorName.toLowerCase() + '_')) {
                return { prefix: 'Decor', suffix: suffix, positionValue: decorName };
            }
        }

        // Fallback 1 : Si decorName est vide, utiliser la première valeur
        if (!decorName || decorName.trim() === '') {
            console.warn(`   ⚠️ decorName vide, utilisation première valeur : "${firstValue}"`);
            // Extraire le decorName de la première valeur (ex: "Studio_Ground" → "Studio")
            const extractedName = firstValue.split('_')[0];
            return { prefix: 'Decor', suffix: firstValue, positionValue: extractedName };
        }

        // Fallback 2 : Si aucune correspondance, utiliser un fallback générique
        console.warn(`   ⚠️ Aucune valeur V0.3+ trouvée pour "${decorName}"`);
        console.warn(`   ⚠️ Utilisation fallback générique : "${decorName}_Ground"`);
        return { prefix: 'Decor', suffix: `${decorName}_Ground`, positionValue: decorName };
    }
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

    const paintConfig = extractPaintConfig(xmlDoc, config);
    const interiorConfig = buildInteriorConfigString(config);
    const { prefix: decorPrefix, suffix: decorSuffix } = buildDecorConfig(xmlDoc, config.decor);

    // US-022: Position dépend de la vue (exterior/interior)
    const positionValue = (config.viewType === "interior")
        ? "Interieur"           // Vue intérieure → Position fixe
        : config.decor;         // Vue extérieure → Position selon décor

    const configParts = [
        `Version.${config.version}`,
        paintConfig,           // Config depuis XML (avec zones personnalisées si définies)
        interiorConfig,        // US-027: Config intérieur personnalisée (10 parties)
        `${decorPrefix}.${decorSuffix}`,  // Production V0.2+: "Decor.{value}"
        `Position.${positionValue}`,
        `Exterior_Spinner.${config.spinner}`,
        `SunGlass.${config.sunglass}`,        // US-024: Dynamique (SunGlassON/OFF)
        `Tablet.${config.tablet}`,            // US-023: Dynamique (Open/Closed)
        `Lighting_mood.${config.moodLights}`, // Mood Lights dynamique (Lighting_Mood_ON/OFF)
        `Door_pilot.${config.doorPilot}`,     // US-025: Dynamique (Open/Closed)
        `Door_passenger.${config.doorPassenger}`, // US-026: Dynamique (Open/Closed)
        config.registrationStyle ? `Exterior_RegistrationNumber_Style.${config.registrationStyle}` : null
    ];

    const fullConfigStr = configParts.filter(Boolean).join('/');

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

    // 1. Télécharger le XML pour extraire les données
    const xmlDoc = await getDatabaseXML();

    // 2. Construire la config string complète (depuis XML)
    // US-049 : Si config.configurationString est fourni, l'utiliser directement (pour Prestige)
    const fullConfigStr = config.configurationString
        ? config.configurationString
        : buildConfigString(xmlDoc, config);

    // 3. Extraire la partie PaintScheme depuis la config string (pour les couleurs)
    // US-049 : Skip si skipExtras activé (vignettes Prestige)
    let materials = [];
    let materialMultiLayers = [];
    let surfaces = [];

    if (!config.skipExtras) {
        const paintSchemePart = extractPaintSchemePart(fullConfigStr) || `Exterior_PaintScheme.${config.paintScheme}`;

        // 4. Générer les matériaux et couleurs
        const generated = generateMaterialsAndColors(
            config.immat,
            config.registrationStyle || config.style,
            fullConfigStr,
            paintSchemePart
        );
        materials = generated.materials;
        materialMultiLayers = generated.materialMultiLayers;

        // 5. Construire surfaces (vide pour singleCamera, rempli pour normal)
        if (mode === 'normal') {
            // Extraire le nom court du paintScheme pour les anchors
            // V0.2-V0.5 : "Zephir_B-0_..." → "Zephir"
            // V0.6+     : "Zephir_1_B-0_..." → "Zephir"
            const paintSchemeName = config.paintScheme.split('_')[0];

            // Extraire les anchors pour le positionnement (depuis XML)
            const anchors = extractAnchors(xmlDoc, paintSchemeName);
            // Générer les surfaces (positions des lettres)
            surfaces = generateSurfaces(config.immat, anchors);
        }
    } else {
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
            product: config.productId || null,  // US-049 [T049-3] : Support productId optionnel
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

    // US-049 [T049-3] : Nettoyer product si null (ne pas envoyer dans le payload)
    if (!payload.scene[0].product) {
        delete payload.scene[0].product;
    } else {
    }

    // US-049 : Nettoyer materials/materialMultiLayers/surfaces si skipExtras activé
    if (config.skipExtras) {
        delete payload.scene[0].materials;
        delete payload.scene[0].materialMultiLayers;
        delete payload.scene[0].surfaces;
    }

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

/**
 * US-044 : Construit un payload pour une caméra du groupe Overview
 * @param {string} cameraId - ID de la caméra
 * @param {boolean} isMainImage - true = PNG transparent (caméra A), false = JPEG (caméras B/C/D)
 * @param {Object} config - Configuration utilisateur
 * @returns {Promise<Object>} Payload prêt pour l'API
 */
export async function buildOverviewPayload(cameraId, isMainImage, config) {

    // 1. Télécharger le XML pour extraire les données
    const xmlDoc = await getDatabaseXML();

    // 2. Construire la config string complète
    const fullConfigStr = buildConfigString(xmlDoc, config);

    // 3. Extraire la partie PaintScheme
    const paintSchemePart = extractPaintSchemePart(fullConfigStr) || `Exterior_PaintScheme.${config.paintScheme}`;

    // 4. Générer les matériaux et couleurs
    const { materials, materialMultiLayers } = generateMaterialsAndColors(
        config.immat,
        config.registrationStyle || config.style,
        fullConfigStr,
        paintSchemePart
    );

    // 5. Générer les surfaces (positionnement des lettres)
    // Extraire le nom court du paintScheme pour les anchors
    // V0.2-V0.5 : "Zephir_B-0_..." → "Zephir"
    // V0.6+     : "Zephir_1_B-0_..." → "Zephir"
    const paintSchemeName = config.paintScheme.split('_')[0];
    const anchors = extractAnchors(xmlDoc, paintSchemeName);
    const surfaces = generateSurfaces(config.immat, anchors);

    // 6. Paramètres de rendu selon le type d'image
    let renderParams;
    let encoderParams;

    if (isMainImage) {
        // Image A : PNG transparent, 1920x1080, compression: 1
        // Doc API: background=false pour fond transparent, pngEncoder a SEULEMENT compression (1-9)
        renderParams = {
            width: 1920,
            height: 1080,
            antialiasing: true,
            superSampling: "2",
            background: false // false = fond transparent (Boolean selon spec API)
        };
        encoderParams = {
            png: {
                compression: 1 // Seul paramètre PNG selon spec officielle WebRender
            }
        };
    } else {
        // Images B/C/D : JPEG standard, 1920x1080
        renderParams = {
            width: 1920,
            height: 1080,
            antialiasing: true,
            superSampling: "2"
        };
        encoderParams = {
            jpeg: {
                quality: 95
            }
        };
    }

    // 7. Construire le payload final
    const payload = {
        scene: [{
            database: getDatabaseId(),
            configuration: fullConfigStr,
            materials: materials,
            materialMultiLayers: materialMultiLayers,
            surfaces: surfaces
        }],
        mode: {
            image: {
                camera: isMainImage ? {
                    id: cameraId,
                    sensor: {
                        background: "transparent" // String "transparent" pour PNG avec fond transparent
                    }
                } : cameraId // Images B/C/D : simple GUID string
            }
        },
        renderParameters: renderParams,
        encoder: encoderParams
    };

    return payload;
}
