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
    console.log(`🔍 Analyse de la base de données: ${databaseId}`);

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
        prestigeOptions: analyzePrestigeOptions(xmlDoc)
    };

    console.log(`✅ Analyse terminée: ${databaseType} database`, structure);
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
            hasMoodLights: paramNames.has('Mood_Lights') || paramNames.has('MoodLights') || paramNames.has('Mood Lights'),

            // Variantes de nommage (pour gérer les différences mineures entre V0.2, V0.3, V0.4)
            lightingCeilingNaming: paramNames.has('Lighting_ceiling') ? 'Lighting_ceiling' : 'Lighting_Ceiling',
            moodLightsNaming: paramNames.has('Mood_Lights') ? 'Mood_Lights' :
                             paramNames.has('MoodLights') ? 'MoodLights' : 'Mood Lights'
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
            description: '⚠️ Paramètre POC (V0.1) - NON SUPPORTÉ dans le configurateur. Voir CLAUDE.md pour plus d\'informations.'
        };
    }

    // Patterns spéciaux connus avec descriptions (PRODUCTION uniquement)
    if (paramName === 'Decor') {
        // Il y a seulement 2 patterns possibles pour Decor Production:
        // 1. V0.2 : {decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz (coordonnées numériques)
        // 2. V0.3/V0.4/V0.5 : {decorName}_{Flight|Ground} (position)

        const firstValue = samples[0].value;

        // Détecter si format Flight/Ground ou coordonnées numériques
        const hasFlightGround = samples.some(opt => opt.value.endsWith('_Flight') || opt.value.endsWith('_Ground'));

        if (hasFlightGround) {
            // Format V0.3/V0.4/V0.5 : {decorName}_{Flight|Ground}
            return {
                pattern: `Decor.{decorName}_{Flight|Ground}`,
                description: 'decorName = Nom du décor (Studio, Tarmac, Fjord, Hangar, Onirique). Flight/Ground = Position de l\'avion (en vol ou au sol), utilisé pour filtrer les décors compatibles.'
            };
        } else {
            // Format V0.2 : coordonnées numériques
            // Vérifier si on a bien 6 parties numériques à la fin (Tx, Ty, Tz, Rx, Ry, Rz)
            const parts = firstValue.split('_');
            const hasNumericCoords = parts.length >= 7 && parts.slice(-6).every(p => /^-?\d+$/.test(p));

            if (hasNumericCoords) {
                return {
                    pattern: `Decor.{decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz`,
                    description: 'Format V0.2 : decorName = Nom du décor, cameraName = Nom de la caméra à utiliser (mode image simple, pas de groupe), Tx/Ty/Tz = Translation, Rx/Ry/Rz = Rotation de l\'avion dans la scène 3D.'
                };
            }
        }
    }

    if (paramName.includes('PaintScheme')) {
        return {
            pattern: `${paramName}.{schemeName}_{style}_{pair0}_{pair1}_{pair2}_{pair3}_{pair4}`,
            description: 'schemeName = Nom du schéma (Zephir, Tehuano, etc.), style = Lettre A-J (A-E slanted, F-J straight), pair0-4 = Paires de couleurs (format: Zone-Index)'
        };
    }

    if (paramName.includes('Door') || paramName.includes('door')) {
        return {
            pattern: `${paramName}.{Open|Closed}`,
            description: 'Contrôle l\'ouverture/fermeture de la porte. Open = porte ouverte, Closed = porte fermée.'
        };
    }

    if (paramName.includes('SunGlass') || paramName.includes('Sun glass')) {
        return {
            pattern: `${paramName}.{ON|OFF}`,
            description: 'Contrôle les volets de hublots. ON = volets fermés (hublots cachés), OFF = volets ouverts (hublots visibles).'
        };
    }

    if (paramName.includes('Tablet')) {
        return {
            pattern: `${paramName}.{Open|Closed}`,
            description: 'Contrôle la tablette. Open = tablette dépliée, Closed = tablette repliée.'
        };
    }

    if (paramName.includes('Lighting') || paramName.includes('Mood')) {
        const lightType = paramName.includes('Ceiling') ? 'plafond' : 'd\'ambiance';
        return {
            pattern: `${paramName}.{ON|OFF}`,
            description: `Contrôle l'éclairage ${lightType}. ON = lumières allumées, OFF = lumières éteintes.`
        };
    }

    if (paramName.includes('Spinner')) {
        return {
            pattern: `${paramName}.{color}`,
            description: 'Couleur du spinner (cône d\'hélice). Exemples: Silver, Black, etc.'
        };
    }

    if (paramName.includes('Stitching')) {
        return {
            pattern: `${paramName}.{color}`,
            description: 'Couleur du fil de couture des sièges. Exemples: White, Black, Red, etc.'
        };
    }

    if (paramName.includes('Colors_Zone')) {
        return {
            pattern: `${paramName}.{colorName}-{code}-{hex}-{tag}`,
            description: 'colorName = Nom de la couleur, code = Code Daher, hex = Code HTML (#RRGGBB), tag = Métadonnées (noA+, A+, etc.)'
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
        if (label) {
            bookmarkList.push(label);
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

    console.log(`📥 Schéma exporté: ${filename} (${(jsonString.length / 1024).toFixed(2)} KB)`);
}
