/**
 * Database Analyzer - Analyse automatique de la structure XML des bases de données
 *
 * Ce module analyse le XML d'une base de données et extrait toutes les métadonnées :
 * - Features disponibles (Overview, Configuration, Tablet, etc.)
 * - Camera groups et leurs patterns
 * - Parameters avec toutes leurs options
 * - Configuration bookmarks
 *
 * Utilisation :
 *   import { analyzeDatabaseStructure } from './api/database-analyzer.js';
 *   const schema = await analyzeDatabaseStructure(databaseId);
 */

import { getDatabaseXML } from './xml-parser.js';

/**
 * Détecte si une base de données est POC (V0.1) ou Production (V0.2+)
 * @param {XMLDocument} xmlDoc - Document XML de la base
 * @returns {Object} { databaseType: "POC"|"Production", isPOC: boolean }
 */
function detectDatabaseType(xmlDoc) {
    const parameters = xmlDoc.querySelectorAll('Parameter');
    const paramNames = new Set();

    parameters.forEach(p => {
        const label = p.getAttribute('label');
        if (label) paramNames.add(label);
    });

    // Règle de détection : Si "POC Decor" existe, c'est une base POC (V0.1)
    // Sinon, c'est une base Production (V0.2+)
    const isPOC = paramNames.has('POC Decor');
    const databaseType = isPOC ? 'POC' : 'Production';

    return { databaseType, isPOC };
}

/**
 * Analyse complète de la structure d'une base de données
 * @param {string} databaseId - ID de la base à analyser
 * @returns {Promise<Object>} Schéma complet de la base
 */
export async function analyzeDatabaseStructure(databaseId) {

    const xmlDoc = await getDatabaseXML(databaseId);

    // Détecter si c'est une base POC ou Production
    const { databaseType, isPOC } = detectDatabaseType(xmlDoc);

    const structure = {
        id: databaseId,
        analyzedAt: new Date().toISOString(),
        databaseType,        // "POC" ou "Production"
        isPOC,               // boolean
        features: analyzeFeatures(xmlDoc),
        cameraGroups: analyzeCameraGroups(xmlDoc),
        parameters: analyzeParameters(xmlDoc),
        configurationBookmarks: analyzeConfigurationBookmarks(xmlDoc),
        bookmarkPatterns: analyzeBookmarkPatterns(analyzeConfigurationBookmarks(xmlDoc)),
        prestigeOptions: analyzePrestigeOptions(xmlDoc)
    };

    return structure;
}

/**
 * Analyse les features disponibles dans la base
 */
function analyzeFeatures(xmlDoc) {
    const groups = xmlDoc.querySelectorAll('Group');
    const parameters = xmlDoc.querySelectorAll('Parameter');
    const bookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark');

    // Collecter noms de groups et parameters
    const groupNames = new Set();
    groups.forEach(g => {
        const name = g.getAttribute('name');
        if (name) groupNames.add(name);
    });

    const paramNames = new Set();
    parameters.forEach(p => {
        const label = p.getAttribute('label');
        if (label) paramNames.add(label);
    });

    const bookmarkLabels = [];
    bookmarks.forEach(b => {
        const label = b.getAttribute('label');
        if (label) bookmarkLabels.push(label);
    });

    // Helper pour détecter si un groupe de caméras existe (avec variantes)
    const hasGroup = (patterns) => {
        return patterns.some(pattern => {
            // Si c'est un pattern avec wildcard, vérifier si un groupe commence par ce pattern
            if (pattern.includes('*')) {
                const prefix = pattern.replace('*', '');
                return Array.from(groupNames).some(g => g.startsWith(prefix));
            }
            // Sinon, vérification exacte
            return groupNames.has(pattern);
        });
    };

    // Helper pour détecter si un paramètre existe (avec variantes)
    const hasParam = (variants) => variants.some(v => paramNames.has(v));

    return {
        // FEATURES = Fonctionnalités du configurateur
        // Vues (communes POC et Production)
        hasExterior: hasGroup(['Exterieur*', 'Exterieur']),
        hasInterior: hasGroup(['Interieur']),
        hasConfiguration: hasGroup(['Configuration']),
        hasOverview: hasGroup(['Overview']),

        // ========================================
        // PRODUCTION FEATURES (V0.2+)
        // ========================================
        production: {
            hasDecor: paramNames.has('Decor'),
            hasDoorPilot: paramNames.has('Door_pilot'),
            hasDoorPassenger: paramNames.has('Door_passenger'),
            hasSunGlass: paramNames.has('SunGlass'),
            hasTablet: paramNames.has('Tablet'),
            hasLightingCeiling: paramNames.has('Lighting_Ceiling') || paramNames.has('Lighting_ceiling'),
            hasMoodLights: paramNames.has('Lighting_mood') || paramNames.has('Mood_Lights') || paramNames.has('MoodLights'),
            hasLogoTBM: paramNames.has('Exterior_Logo_TBM'),  // US-051
            hasLogo9xx: paramNames.has('Exterior_Logo_9xx'),  // US-051

            // Variantes de nommage (pour gérer les différences mineures entre V0.2, V0.3, V0.4)
            lightingCeilingNaming: paramNames.has('Lighting_ceiling') ? 'Lighting_ceiling' : 'Lighting_Ceiling',
            moodLightsNaming: paramNames.has('Lighting_mood') ? 'Lighting_mood' :
                             paramNames.has('Mood_Lights') ? 'Mood_Lights' : 'MoodLights'
        },

        // ========================================
        // POC FEATURES (V0.1 - NON SUPPORTÉES)
        // ========================================
        // ⚠️ RÈGLE IMPORTANTE : Tous les paramètres préfixés "POC" ne doivent PAS être implémentés
        // Ces paramètres sont des versions de test/POC et ne sont pas destinés à la production
        // Le configurateur ne supporte QUE les bases Production (V0.2+)
        poc: {
            hasPOCDecor: paramNames.has('POC Decor'),
            hasPOCDoorPilot: paramNames.has('POC Door pilot'),
            hasPOCDoorPassenger: paramNames.has('POC Door passenger'),
            hasPOCSunGlass: paramNames.has('POC Sun glass'),
            hasPOCLightingCeiling: paramNames.has('POC Lighting ceiling'),
            hasPOCLightingMood: paramNames.has('POC Lighting mood 960'),
            hasPOCLeather: paramNames.has('POC Leather'),
            hasPOCStickers: paramNames.has('POC Stickers'),
            hasPOCStorageLeft: paramNames.has('POC Storage left'),
            hasPOCStorageRight: paramNames.has('POC Storage right')
        }
    };
}

/**
 * Analyse les camera groups et détecte leurs patterns
 */
function analyzeCameraGroups(xmlDoc) {
    const groups = xmlDoc.querySelectorAll('Group');

    const groupsByType = {
        exterior: { available: false, pattern: null, groups: [] },
        interior: { available: false, pattern: null, groups: [] },
        configuration: { available: false, pattern: null, groups: [] },
        overview: { available: false, pattern: null, groups: [] }
    };

    groups.forEach(group => {
        const name = group.getAttribute('name');
        const id = group.getAttribute('id');
        const cameras = group.querySelectorAll('Camera');
        const cameraCount = cameras.length;

        if (!name) return;

        // Extraire les noms et IDs des caméras
        const camerasList = [];
        cameras.forEach(cam => {
            const camName = cam.getAttribute('name');
            const camId = cam.getAttribute('id');
            if (camName) {
                camerasList.push({ name: camName, id: camId || 'N/A' });
            }
        });

        const groupData = { name, id, cameraCount, cameras: camerasList };

        if (name.startsWith('Exterieur')) {
            groupsByType.exterior.available = true;
            groupsByType.exterior.groups.push(groupData);

            // Détecter pattern
            if (name.includes('Decor')) {
                groupsByType.exterior.pattern = 'Exterieur_Decor{name}';
            } else {
                groupsByType.exterior.pattern = 'Exterieur';
            }
        } else if (name.startsWith('Interieur')) {
            groupsByType.interior.available = true;
            groupsByType.interior.groups.push(groupData);
            groupsByType.interior.pattern = 'Interieur';
        } else if (name === 'Configuration') {
            groupsByType.configuration.available = true;
            groupsByType.configuration.groups.push(groupData);
            groupsByType.configuration.pattern = 'Configuration';
        } else if (name === 'Overview') {
            groupsByType.overview.available = true;
            groupsByType.overview.groups.push(groupData);
            groupsByType.overview.pattern = 'Overview';
        }
    });

    return groupsByType;
}

/**
 * Analyse tous les parameters avec leurs options
 */
function analyzeParameters(xmlDoc) {
    const parameters = xmlDoc.querySelectorAll('Parameter');
    const paramList = {};

    parameters.forEach(param => {
        const label = param.getAttribute('label');
        if (!label) return;

        // Extraire les options (Value elements)
        const options = [];
        const valueElements = param.querySelectorAll('Value');

        valueElements.forEach(val => {
            const optLabel = val.getAttribute('label');
            const optSymbol = val.getAttribute('symbol');

            if (optLabel && optSymbol) {
                options.push({
                    label: optLabel,
                    value: optSymbol
                });
            }
        });

        const patternInfo = options.length > 0 ? detectValuePattern(label, options) : { pattern: null, description: null };

        paramList[label] = {
            xmlName: label,
            optionCount: options.length,
            options: options,
            pattern: patternInfo.pattern,
            patternDescription: patternInfo.description
        };
    });

    return paramList;
}

/**
 * Détecte le pattern des valeurs d'un paramètre de manière détaillée
 * @returns {Object} { pattern: string, description: string|null }
 */
function detectValuePattern(paramName, options) {
    if (options.length === 0) return { pattern: null, description: null };

    // Analyser plusieurs valeurs pour détecter le pattern
    const samples = options.slice(0, Math.min(5, options.length));

    // ⚠️ Paramètres POC : Ne PAS documenter, juste indiquer qu'ils ne sont pas supportés
    if (paramName.startsWith('POC ')) {
        return {
            pattern: `POC ${paramName.substring(4)}.{value}`,
            description: '⚠️ NON SUPPORTÉ dans le configurateur'
        };
    }

    // Patterns spéciaux connus avec descriptions (PRODUCTION uniquement)
    if (paramName === 'Decor') {
        // Il y a 3 patterns possibles pour Decor Production:
        // 1. V0.2 : {decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz (coordonnées numériques)
        // 2. V0.3-V0.9.1 : {decorName}_{Flight|Ground} (position sans index)
        // 3. V0.9.2+ : {decorName}_{Flight|Ground}_{Index} (position avec index pour tri)

        const firstLabel = samples[0].label;

        // Détecter si format Flight/Ground ou coordonnées numériques (vérifier label ET value)
        const hasFlightGround = samples.some(opt =>
            opt.label.includes('_Flight') || opt.label.includes('_Ground') ||
            opt.value.includes('_Flight') || opt.value.includes('_Ground')
        );

        if (hasFlightGround) {
            // Détecter si format V0.9.2+ avec index après Flight/Ground
            // Pattern V0.9.2+ : "Studio_Ground_6", "Fjord_Flight_2"
            // Pattern V0.3-V0.9.1 : "Studio_Ground", "Fjord_Flight"
            const hasIndex = samples.some(opt => {
                const parts = opt.label.split('_');
                // Si on a 3 parties ET que la dernière partie est un nombre pur, c'est V0.9.2+
                // Exemple: Fjord_Flight_2 → ['Fjord', 'Flight', '2']
                return parts.length === 3 && /^\d+$/.test(parts[2]);
            });

            if (hasIndex) {
                // Format V0.9.2+ : {decorName}_{Flight|Ground}_{Index}
                return {
                    pattern: `Decor.{decorName}_{Flight|Ground}_{Index}`,
                    description: 'V0.9.2+ : decorName = Nom de l\'environnement 3D (Studio, Tarmac, Fjord, Etc..), Flight/Ground = Position de l\'avion (Ground = au sol, Flight = en vol), Index = Position de tri dans le dropdown (1, 2, 3...). Le dropdown affiche uniquement {decorName} (sans suffixes). Tri numérique par index croissant. Mode groupe de caméras `Exterieur_Decor{DecorName}`. ⚠️ Toujours utilisé avec le paramètre Position.{DecorName} (voir paramètre Position). Exemples: Studio_Ground_6, Fjord_Flight_2, Tarmac_Ground_5.'
                };
            } else {
                // Format V0.3-V0.9.1 : {decorName}_{Flight|Ground} (sans index)
                return {
                    pattern: `Decor.{decorName}_{Flight|Ground}`,
                    description: 'V0.3-V0.9.1 : decorName = Nom de l\'environnement 3D (Studio, Tarmac, Fjord, Etc..). Flight/Ground = Position de l\'avion dans l\'image pour filtrage (Ground = au sol, Flight = en vol). Tri alphabétique. Mode groupe de caméras `Exterieur_Decor{DecorName}`. ⚠️ Toujours utilisé avec le paramètre Position.{DecorName} (voir paramètre Position). Exemples: Studio_Ground, Fjord_Flight.'
                };
            }
        } else {
            // Format V0.2 : coordonnées numériques
            // Vérifier si on a bien 6 parties numériques à la fin (Tx, Ty, Tz, Rx, Ry, Rz)
            const parts = firstLabel.split('_');
            const hasNumericCoords = parts.length >= 7 && parts.slice(-6).every(p => /^-?\d+$/.test(p));

            if (hasNumericCoords) {
                return {
                    pattern: `Decor.{decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz`,
                    description: 'V0.2 : decorName = Nom du décor, cameraName = Nom de la caméra à utiliser. Mode image simple (pas de groupe de caméras). Tx/Ty/Tz = Translation (coordonnées X,Y,Z), Rx/Ry/Rz = Rotation (angles en degrés) de l\'avion, appliqués dans le bloc configuration de la requête API.'
                };
            }
        }
    }

    if (paramName === 'Position') {
        return {
            pattern: `Position.{decorName}`,
            description: 'V0.3+ : Définit la position/pose de l\'avion dans l\'environnement 3D. decorName = Nom du décor (extrait du paramètre Decor). IMPORTANT : Le {decorName} de Position DOIT correspondre au {decorName} de Decor. Exemple : Decor.Fjord_Flight → Position.Fjord. V0.1-V0.2 : Paramètre absent (coordonnées Translation/Rotation directement dans Decor).'
        };
    }

    if (paramName.includes('PaintScheme')) {
        // Analyser le pattern selon le nombre de segments
        const segmentCounts = samples.map(opt => opt.label.split('_').length);
        const maxSegments = Math.max(...segmentCounts);

        if (maxSegments === 1) {
            // V0.1 : Format POC simple (juste le nom du schéma)
            return {
                pattern: `${paramName}.{schemeName}`,
                description: 'V0.1 (POC) : schemeName = Nom du schéma de peinture uniquement (ex: Alize, Zephir). Pas de configuration de zones.'
            };
        }

        // Détecter si on a le nouveau pattern V0.6 avec index
        // V0.2-V0.5 : "Alize_B-0_B-D_B-D_B-D_B-D" (6 segments)
        // V0.6      : "Alize_2_B-0_B-D_B-D_B-D_B-D" (6 segments avec index en 2ème position)
        const hasIndex = samples.some(opt => {
            const parts = opt.label.split('_');
            // Si le 2ème segment est un chiffre pur, c'est un index V0.6
            return parts.length >= 2 && /^\d+$/.test(parts[1]);
        });

        if (hasIndex) {
            // V0.6 : Pattern avec index pour tri personnalisé
            return {
                pattern: `${paramName}.{schemeName}_{index}_{pair0}_{pair1}_{pair2}_{pair3}_{pair4}`,
                description: 'V0.6+ : schemeName = Nom du schéma (Zephir, Tehuano, etc.), index = Position de tri dans le dropdown (démarre à 1), pair0-4 = Paires de couleurs pour l\'immatriculation. Chaque paire X-Y définit 2 zones : X couleur lettre {Layer0} + Y couleur contour/ombre {Layer1}. Format paire: A-0 (pas de 2ème zone) ou A-D (2 zones). Tri par index.'
            };
        } else {
            // V0.2-V0.5 : Pattern sans index (tri alphabétique)
            return {
                pattern: `${paramName}.{schemeName}_{pair0}_{pair1}_{pair2}_{pair3}_{pair4}`,
                description: 'V0.2-V0.5 : schemeName = Nom du schéma (Zephir, Tehuano, etc.), pair0-4 = Paires de couleurs pour l\'immatriculation. Chaque paire X-Y définit 2 zones : X couleur lettre {Layer0} + Y couleur contour/ombre {Layer1}. Format paire: A-0 (pas de 2ème zone) ou A-D (2 zones). Tri alphabétique.'
            };
        }
    }

    if (paramName.includes('Door') || paramName.includes('door')) {
        return {
            pattern: `${paramName}.{Open|Closed}`,
            description: 'V0.2+ : Contrôle l\'ouverture/fermeture de la porte. Open = porte ouverte, Closed = porte fermée.'
        };
    }

    if (paramName.includes('SunGlass') || paramName.includes('Sun glass')) {
        return {
            pattern: `${paramName}.{SunGlassON|SunGlassOFF}`,
            description: 'V0.3+ : Contrôle les volets de hublots. SunGlassON = volets fermés (hublots cachés), SunGlassOFF = volets ouverts (hublots visibles).'
        };
    }

    if (paramName.includes('Tablet')) {
        return {
            pattern: `${paramName}.{Open|Closed}`,
            description: 'V0.3+ : Contrôle la tablette. Open = tablette dépliée, Closed = tablette repliée.'
        };
    }

    if (paramName.includes('Lighting') || paramName.includes('Mood')) {
        const lightType = paramName.includes('Ceiling') ? 'plafond' : 'd\'ambiance (Mood Lights)';
        return {
            pattern: `${paramName}.{ON|OFF}`,
            description: `V0.3+ : Contrôle l'éclairage ${lightType}. ON = lumières allumées, OFF = lumières éteintes.`
        };
    }

    if (paramName.includes('Spinner')) {
        // Détecter si on a le nouveau pattern V0.9+ avec index
        // V0.1-V0.8.1 : "PolishedAluminium" (1 segment)
        // V0.9+       : "PolishedAluminium_1", "MatteBlack_2" (index pour tri)
        const hasIndex = samples.some(opt => {
            const parts = opt.label.split('_');
            // Si dernier segment est un chiffre pur, c'est un index V0.9+
            return parts.length >= 2 && /^\d+$/.test(parts[parts.length - 1]);
        });

        if (hasIndex) {
            // V0.9+ : Pattern avec index pour tri personnalisé
            return {
                pattern: `${paramName}.{spinnerName}_{index}`,
                description: 'V0.9+ : spinnerName = Nom de la finition du spinner (cône d\'hélice), index = Position de tri dans le dropdown (démarre à 1). Le dropdown affiche uniquement {spinnerName} (sans index). Tri numérique par index croissant. Exemples: PolishedAluminium_1, MatteBlack_2.'
            };
        } else {
            // V0.1-V0.8.1 : Format simple sans index (tri alphabétique)
            return {
                pattern: `${paramName}.{spinnerName}`,
                description: 'V0.1-V0.8.1 : spinnerName = Nom de la finition du spinner (cône d\'hélice). Format simple sans index. Tri alphabétique. Exemple: MatteBlack, PolishedAluminium.'
            };
        }
    }

    // ⚠️ Stitching est maintenant géré dans la section Interior_ (ligne 452)
    // Ce code a été supprimé pour éviter les doublons

    // US-051 : Patterns Exterior_Logo_TBM et Exterior_Logo_9xx (V0.9.7+)
    if (paramName === 'Exterior_Logo_TBM' || paramName === 'Exterior_Logo_9xx') {
        return {
            pattern: `${paramName}.{colorName}_{hexCode}`,
            description: 'V0.9.7+ : Couleur des logos TBM et 9xx sur l\'extérieur de l\'avion. Structure en 2 segments : {colorName} = Nom de la couleur pour affichage IHM/dropdown (ex: LogoBlack, LogoRed, LogoWhite). Utilisé pour le label du dropdown dans l\'interface utilisateur. {hexCode} = Code couleur HTML du logo (ex: #262626, #A40000, #EFEFEF). Peut servir à calculer un contraste avec la couleur de la zone de fuselage sur laquelle le logo est appliqué (utiliser les codes {hexLAB} des paramètres Exterior_Colors_Zone pour le calcul de contraste). Format: ColorName_HexCode. Exemples: LogoBlack_#262626, LogoRed_#A40000, LogoWhite_#EFEFEF.'
        };
    }

    // Patterns Exterior_Colors_ZoneA, ZoneB, ZoneC, ZoneD, ZoneA+ (V0.2+)
    // TOUTES les zones ont exactement la même structure (6 segments + metadata variable)
    if (paramName.includes('Colors_Zone')) {
        // Pattern différent pour ZoneA+ (affiché séparément)
        if (paramName === 'Exterior_Colors_ZoneA+') {
            return {
                pattern: `Exterior_Colors_ZoneA+.{colorName}-{code}-{hexLAB}-{hexLumiscaphe}-{tagVoilure}-{metadata...}`,
                description: 'V0.2+ : Zone de couleur A+ (voilure). Structure identique aux zones A/B/C/D (6 segments). colorName = Nom de la couleur (ex: PureWhite), code = Code Daher (ex: 09010), hexLAB = Code couleur navigateur (ex: #e0dcd1) pour calculer le contraste, hexLumiscaphe = Code couleur API Lumiscaphe (ex: #E0DAC7) pour colorer les lettres d\'immatriculation, tagVoilure = Tag de filtrage (toujours "A+" pour cette zone), metadata... = Mots-clés pour recherche, en nombre variable (ex: 09010-pure-white-solid-light).'
            };
        }

        // Pattern pour ZoneA, ZoneB, ZoneC, ZoneD (regroupées)
        return {
            pattern: `Exterior_Colors_ZoneA | Exterior_Colors_ZoneB | Exterior_Colors_ZoneC | Exterior_Colors_ZoneD.{colorName}-{code}-{hexLAB}-{hexLumiscaphe}-{tagVoilure}-{metadata...}`,
            description: 'V0.2+ : Zones de couleur A/B/C/D (fuselage). Toutes utilisent exactement la même structure (6 segments). colorName = Nom de la couleur (ex: PureWhite), code = Code Daher (ex: 09010), hexLAB = Code couleur navigateur (ex: #e0dcd1) pour calculer le contraste, hexLumiscaphe = Code couleur API Lumiscaphe (ex: #E0DAC7) pour colorer les lettres d\'immatriculation, tagVoilure = Tag de filtrage (A+ ou noA+) pour contrôler la disponibilité dans le dropdown Zone A+, metadata... = Mots-clés pour recherche, en nombre variable (ex: 09010-pure-white-solid-light).'
        };
    }

    // Patterns Interior_ (V0.2+) - 7 catégories distinctes selon DATABASE-PATTERNS.md
    if (paramName.startsWith('Interior_')) {
        // Catégorie 1 : Matériaux Cuir/Suède avec Code Daher (4 segments)
        // Interior_SeatCovers, Interior_UpperSidePanel, Interior_LowerSidePanel, Interior_Ultra-SuedeRibbon
        if (paramName === 'Interior_SeatCovers' || paramName === 'Interior_UpperSidePanel' ||
            paramName === 'Interior_LowerSidePanel' || paramName === 'Interior_Ultra-SuedeRibbon') {
            return {
                pattern: `${paramName}.{Name}_{Code}_{Type}_{Premium}`,
                description: 'V0.2+ : Matériau avec code Daher (4 segments). Name = Nom couleur (ex: BeigeGray), Code = Code Daher 4 chiffres (ex: 2176), Type = Leather ou Suede, Premium = Niveau de finition pour filtrage.'
            };
        }

        // Catégorie 2 : Finitions sans Code (3 segments)
        // Interior_Carpet, Interior_MetalFinish
        if (paramName === 'Interior_Carpet' || paramName === 'Interior_MetalFinish') {
            return {
                pattern: `${paramName}.{Name}_{Type}_{Premium}`,
                description: 'V0.2+ : Finition sans code (3 segments). Format: {Name}_{Type}_{Premium}. Exemples: LightBrown_carpet_Premium, BrushedStainless_metal_Premium.'
            };
        }

        // Catégorie 3 : TabletFinish - Type composé (4 segments)
        if (paramName === 'Interior_TabletFinish') {
            return {
                pattern: `${paramName}.{Name}_{Type}_{SubType}_{Premium}`,
                description: 'V0.2+ : Finition tablette (4 segments). Name = Nom du bois/matériau (ex: SapelliMat, Carbon), Type = Identifiant fixe, SubType = wood ou carbonFiber, Premium = Niveau de finition.'
            };
        }

        // Catégorie 4 : Couleurs simples (2 segments) - Stitching
        if (paramName === 'Interior_Stitching') {
            return {
                pattern: `${paramName}.{ColorName}_{Premium}`,
                description: 'V0.3+ : Couleur du fil de couture des sièges (2 segments). ColorName = Nom de la couleur (ex: BeigeGrey, White, Black, Charcoal), Premium = Niveau de finition.'
            };
        }

        // Catégorie 5 : Options binaires (2 segments) - PerforatedSeatOptions
        if (paramName === 'Interior_PerforatedSeatOptions') {
            return {
                pattern: `${paramName}.{OptionName}_{Premium}`,
                description: 'V0.2+ : Option perforation sièges (2 segments). Format: {OptionName}_{Premium}. Exemples: NoSeatPerforation_Premium, SeatPerforation_Premium.'
            };
        }

        // Catégorie 6 : Type matériau seul (2 segments) - CentralSeatMaterial
        if (paramName === 'Interior_CentralSeatMaterial') {
            return {
                pattern: `${paramName}.{Type}_{Premium}`,
                description: 'V0.2+ : Matériau central siège (2 segments). Format: {Type}_{Premium}. Exemples: Leather_Premium, Suede_Premium.'
            };
        }

        // Catégorie 7 : Seatbelts - EXCEPTION sans Premium (2 segments)
        if (paramName === 'Interior_Seatbelts') {
            return {
                pattern: `${paramName}.{ColorName}_{Type}`,
                description: 'V0.2+ : Couleur ceintures (2 segments). Format: {ColorName}_{Type}. Exemples: OatMeal_belt, Black_belt, Charcoal_belt. ⚠️ Pas de suffixe _Premium.'
            };
        }

        // Fallback générique si nouveau paramètre Interior_ inconnu
        const firstValue = samples.length > 0 ? samples[0].label : '';
        const segments = firstValue.split('_').length;
        return {
            pattern: `${paramName}.{materialName}`,
            description: `V0.2+ : Paramètre Interior détecté (${segments} segments). Voir les exemples ci-dessous pour la structure exacte.`
        };
    }

    // Pattern Version
    if (paramName === 'Version') {
        return {
            pattern: `Version.{960|980}`,
            description: 'V0.1+ : Modèle de l\'avion. 960 = TBM 960, 980 = TBM 980.'
        };
    }

    // Pattern générique: analyser la structure réelle
    const firstValue = options[0].value;

    if (firstValue.startsWith(paramName + '.')) {
        const suffix = firstValue.substring(paramName.length + 1);

        // Détecter si contient des underscores (multi-parties)
        if (suffix.includes('_')) {
            const parts = suffix.split('_');
            return {
                pattern: `${paramName}.{part1}_..._{part${parts.length}}`,
                description: null
            };
        }

        return {
            pattern: `${paramName}.{value}`,
            description: null
        };
    }

    return {
        pattern: firstValue,
        description: 'Pattern personnalisé, voir exemples ci-dessous.'
    };
}

/**
 * Analyse tous les ConfigurationBookmarks
 */
function analyzeConfigurationBookmarks(xmlDoc) {
    const bookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark');
    const bookmarkList = [];

    bookmarks.forEach(bookmark => {
        const label = bookmark.getAttribute('label');
        const value = bookmark.getAttribute('value');
        if (label) {
            bookmarkList.push({
                label: label,
                value: value || '(vide)'
            });
        }
    });

    return bookmarkList;
}

/**
 * Analyse les options de prestige
 */
function analyzePrestigeOptions(xmlDoc) {
    const prestiges = xmlDoc.querySelectorAll('ConfigurationBookmark[label^="Interior_PrestigeSelection_"]');
    const prestigeList = [];

    prestiges.forEach(bookmark => {
        const label = bookmark.getAttribute('label');
        if (label) {
            const prestigeName = label.replace('Interior_PrestigeSelection_', '');
            prestigeList.push(prestigeName);
        }
    });

    return prestigeList;
}

/**
 * Détecte le pattern d'un bookmark et retourne sa description
 * @param {Array} bookmarks - Liste des bookmarks
 * @returns {Array} Patterns détectés avec exemples
 */
function analyzeBookmarkPatterns(bookmarks) {
    const patterns = {};

    bookmarks.forEach(bookmark => {
        const label = bookmark.label;

        // Pattern 1 : {PaintSchemeName}_RegL/RegR_{X}_{Y} (V0.6+)
        if (label.match(/^[A-Za-z]+_Reg[LR]_-?\d+\.?\d*_-?\d+\.?\d*$/)) {
            const key = 'Reg_V0.6';
            if (!patterns[key]) {
                patterns[key] = {
                    pattern: '{PaintSchemeName}_RegL_{X}_{Y}\n{PaintSchemeName}_RegR_{X}_{Y}',
                    description: 'V0.6+ : Points de départ pour positionnement de l\'immatriculation des deux côtés de l\'avion. PaintSchemeName = Nom du schéma de peinture (ex: Alize, Meltem, Mistral, Sirocco, Tehuano, Zephir), RegL = Tag de surface "Registration Left" (côté gauche), RegR = Tag de surface "Registration Right" (côté droit), X = Position horizontale en mètres (coordonnée 3D), Y = Position verticale en mètres (coordonnée 3D). Utilisé pour calculer les positions des lettres d\'immatriculation.',
                    examples: []
                };
            }
            patterns[key].examples.push(label);
        }
        // Pattern 2 : {PaintSchemeName}_RegL/RegR_{X1}_{X2}_{X3}_{X4}_{X5}_{X6}_{Y} (V0.2-V0.5)
        else if ((label.includes('_RegL_') || label.includes('_RegR_')) && label.split('_').length >= 8) {
            const key = 'Reg_V0.2';
            if (!patterns[key]) {
                patterns[key] = {
                    pattern: '{PaintSchemeName}_RegL_{X1}_{X2}_{X3}_{X4}_{X5}_{X6}_{Y}\n{PaintSchemeName}_RegR_{X1}_{X2}_{X3}_{X4}_{X5}_{X6}_{Y}',
                    description: 'V0.2-V0.5 : Points de départ pour positionnement de l\'immatriculation (format long). PaintSchemeName = Nom du schéma de peinture, RegL = Tag de surface "Registration Left" (côté gauche), RegR = Tag de surface "Registration Right" (côté droit), X1-X6 = 6 positions horizontales alternatives en mètres (le code utilise X1), Y = Position verticale en mètres. Utilisé pour calculer les positions des lettres d\'immatriculation.',
                    examples: []
                };
            }
            patterns[key].examples.push(label);
        }
        // Pattern 5 : Exterior_{PaintSchemeName}
        else if (label.match(/^Exterior_(Alize|Meltem|Mistral|Sirocco|Tehuano|Zephir|Zephyr)$/)) {
            const key = 'Exterior';
            if (!patterns[key]) {
                patterns[key] = {
                    pattern: 'Exterior_{PaintSchemeName}',
                    description: 'V0.2+ : Bookmark de configuration complète pour les couleurs extérieures selon le schéma de peinture. PaintSchemeName = Nom du schéma de peinture (ex: Alize, Meltem, Mistral, Sirocco, Tehuano, Zephyr). Contient une configuration prédéfinie de 5 zones de couleur (Exterior_Colors_ZoneA, Exterior_Colors_ZoneB, Exterior_Colors_ZoneC, Exterior_Colors_ZoneD, Exterior_Colors_ZoneA+). Permet de modifier toute la configuration extérieure de l\'avion en une seule fois en envoyant toutes les valeurs du bookmark. Exemple: Exterior_Alize contient "Exterior_Colors_ZoneA+.PureWhite-09010-#e0dcd1-#E0DAC7-A+-09010-pure-white-solid-light;Exterior_Colors_ZoneA.PureWhite-09010-#e0dcd1-#E0DAC7-A+-09010-pure-white-solid-light;..."',
                    examples: []
                };
            }
            patterns[key].examples.push(label);
        }
        // Pattern 6 : Interior_PrestigeSelection_{PrestigeName}
        else if (label.startsWith('Interior_PrestigeSelection_')) {
            const key = 'Prestige';
            if (!patterns[key]) {
                patterns[key] = {
                    pattern: 'Interior_PrestigeSelection_{PrestigeName}',
                    description: 'V0.2+ : Bookmark de configuration complète pour le niveau de finition Prestige de l\'intérieur. PrestigeName = Nom du niveau de prestige (ex: Oslo, SanPedro, London, Labrador, GooseBay, BlackFriars, Fjord, Atacama). Contient une configuration prédéfinie de 11 paramètres intérieur (Interior_Carpet, Interior_CentralSeatMaterial, Interior_LowerSidePanel, Interior_MetalFinish, Interior_PerforatedSeatOptions, Interior_SeatCovers, Interior_Seatbelts, Interior_Stitching, Interior_TabletFinish, Interior_Ultra-SuedeRibbon, Interior_UpperSidePanel). Permet de modifier toute la configuration intérieure de l\'avion en une seule fois en envoyant toutes les valeurs du bookmark. Exemple: Interior_PrestigeSelection_Oslo contient "Interior_Carpet.LightBrown_carpet_Premium;Interior_CentralSeatMaterial.Leather_Premium;Interior_LowerSidePanel.BeigeGray_2176_Leather_Premium;..."',
                    examples: []
                };
            }
            patterns[key].examples.push(label);
        }
        // Pattern 7 : Tehuano export (bookmark unique)
        else if (label === 'Tehuano export') {
            const key = 'TehuanoExport';
            if (!patterns[key]) {
                patterns[key] = {
                    pattern: 'Tehuano export',
                    description: 'V0.2+ : Bookmark unique de configuration par défaut garantie en fin de travail Lumiscaphe. Utilisé pour s\'assurer qu\'une configuration valide et complète est toujours disponible après les opérations de rendu.',
                    examples: []
                };
            }
            patterns[key].examples.push(label);
        }
        // Pattern 8 : Autres bookmarks génériques
        else {
            const key = 'Other';
            if (!patterns[key]) {
                patterns[key] = {
                    pattern: 'Divers',
                    description: 'Bookmarks de configuration ou de positionnement dont le pattern n\'est pas standardisé.',
                    examples: []
                };
            }
            patterns[key].examples.push(label);
        }
    });

    return Object.values(patterns);
}

/**
 * Trouve le nom XML d'un paramètre canonique selon la base actuelle
 * @param {Object} structure - Structure analysée de la base
 * @param {string} canonicalName - Nom canonique (ex: "Decor", "Door_pilot")
 * @returns {string|null} Nom XML réel ou null si absent
 */
export function getParameterXmlName(structure, canonicalName) {
    // Mapping des noms canoniques vers les variantes possibles
    const variants = {
        'Decor': [structure.features.decorNaming],
        'Door_pilot': [structure.features.doorPilotNaming],
        'Door_passenger': [structure.features.doorPassengerNaming],
        'SunGlass': [structure.features.sunGlassNaming],
        'Lighting_Ceiling': [structure.features.lightingCeilingNaming]
    };

    // Si le paramètre a des variantes connues
    if (variants[canonicalName]) {
        const xmlName = variants[canonicalName][0];
        return structure.parameters[xmlName] ? xmlName : null;
    }

    // Sinon, chercher directement
    return structure.parameters[canonicalName] ? canonicalName : null;
}

/**
 * Vérifie si une feature est disponible
 * @param {Object} structure - Structure analysée
 * @param {string} featureName - Nom de la feature
 * @returns {boolean}
 */
export function hasFeature(structure, featureName) {
    return structure.features[featureName] || false;
}

/**
 * Exporte la structure complète en JSON
 * @param {Object} structure - Structure analysée
 * @param {string} filename - Nom du fichier (optionnel)
 */
export function exportStructureAsJSON(structure, filename = 'database-schema.json') {
    const jsonString = JSON.stringify(structure, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

}
