// Colors.js - Gestion des couleurs et matériaux
// Configurateur TBM Daher
// Version : 1.0
// Date : 02/12/2025

import { STYLES_SLANTED } from './config.js';

// ======================================
// US-007 : Gestion des couleurs et matériaux
// ======================================

/**
 * Parse la chaîne de configuration pour extraire les couleurs des zones
 * Analyse les parties "Exterior_Colors_Zone" pour extraire les couleurs hex
 *
 * Format attendu (du script Python lignes 210-222):
 * "...Exterior_Colors_Zone1.#FFFFFF-#000000/.../Exterior_Colors_Zone2.#123456-#ABCDEF/..."
 *
 * @param {string} fullConfigStr - La chaîne de configuration complète
 * @returns {Object} Map des zones vers couleurs hex { "1": "#FFFFFF", "2": "#123456", ... }
 */
export function parseColorsFromConfig(fullConfigStr) {
    console.log('🎨 Parse des couleurs depuis config...');

    const colorMap = {};
    const parts = fullConfigStr.split('/');

    for (const part of parts) {
        if (part.startsWith('Exterior_Colors_Zone')) {
            try {
                // Extraire le numéro de zone
                // Ex: "Exterior_Colors_Zone1.#FFFFFF-#000000" -> zoneKey = "1"
                const zoneKey = part
                    .split('.')[0]                      // "Exterior_Colors_Zone1"
                    .replace('Exterior_Colors_Zone', '') // "1"
                    .replace('+', '');                   // Enlever les "+" éventuels

                // Extraire les valeurs (couleurs hex)
                // Ex: ".#FFFFFF-#000000" -> values = ["#FFFFFF", "#000000"]
                const values = part.split('.')[1].split('-');

                // Filtrer pour garder uniquement les couleurs hex
                const hexCandidates = values.filter(v => v.startsWith('#'));

                // Prioriser la deuxième couleur si elle existe, sinon prendre la première
                if (hexCandidates.length >= 2) {
                    colorMap[zoneKey] = hexCandidates[1];
                } else if (hexCandidates.length === 1) {
                    colorMap[zoneKey] = hexCandidates[0];
                }

                console.log(`  Zone ${zoneKey}: ${colorMap[zoneKey]}`);
            } catch (error) {
                console.warn(`  Erreur parsing couleur pour: ${part}`, error);
                continue;
            }
        }
    }

    console.log('✅ Couleurs parsées:', colorMap);
    return colorMap;
}

/**
 * Résout les couleurs des lettres selon le style et la config de peinture
 *
 * Logique (du script Python lignes 224-251):
 * - Mapping par couple : A/F -> paire[0], B/G -> paire[1], C/H -> paire[2], D/I -> paire[3], E/J -> paire[4]
 * - Chaque paire "X-Y" : X = zone Layer 0, Y = zone Layer 1
 * - Si Y = "0" : pas de Layer 1 à envoyer
 *
 * @param {string} styleLetter - La lettre du style (A-J)
 * @param {string} paintSchemeConfigPart - La partie config "Exterior_PaintScheme.Zephir_B-0_B-D_..."
 * @param {Object} colorMap - Map des zones vers couleurs (de parseColorsFromConfig)
 * @returns {Object} { colorL0, colorL1, hasLayer1 } - Les couleurs et le flag Layer 1
 */
export function resolveLetterColors(styleLetter, paintSchemeConfigPart, colorMap) {
    console.log(`🔍 Résolution couleurs pour style ${styleLetter}...`);

    try {
        // Parser la config pour extraire les paires de zones
        // Ex: "Exterior_PaintScheme.Zephir_B-0_B-D_B-D_B-D_B-D" -> ["B-0", "B-D", ...]
        const segments = paintSchemeConfigPart.split('.')[1].split('_');
        const configPairs = segments.slice(1); // Enlever le premier segment (nom du scheme)

        console.log('  Paires de config:', configPairs);

        if (configPairs.length < 5) {
            console.warn('  Config pairs insuffisantes, utilisation couleurs par défaut');
            return { colorL0: "#000000", colorL1: "#FFFFFF", hasLayer1: true };
        }

        // Mapping correct : A-E -> 0-4 (slanted), F-J -> 0-4 (straight)
        let styleIdx;
        if (styleLetter <= 'E') {
            styleIdx = styleLetter.charCodeAt(0) - 'A'.charCodeAt(0); // A=0, B=1, C=2, D=3, E=4
        } else {
            styleIdx = styleLetter.charCodeAt(0) - 'F'.charCodeAt(0); // F=0, G=1, H=2, I=3, J=4
        }

        console.log(`  Style ${styleLetter} -> index ${styleIdx}`);

        if (styleIdx < 0 || styleIdx >= 5) {
            console.warn('  Index de style invalide, utilisation index 0');
            styleIdx = 0;
        }

        // Récupérer la paire de zones correspondante
        const targetPair = configPairs[styleIdx]; // Ex: "B-0" ou "B-D"
        const [z0, z1] = targetPair.split('-');

        console.log(`  Zones cibles: ${z0}, ${z1}`);

        // INVERSION : L'API interprète les layers à l'envers
        // Pour "A-D" : on veut Layer 0 = Zone A, Layer 1 = Zone D
        // Mais l'API applique Layer 0 = deuxième valeur, Layer 1 = première valeur
        // Donc on inverse l'attribution
        let c0 = colorMap[z1] || null;  // Layer 0 = deuxième zone (z1)
        let c1 = colorMap[z0] || null;  // Layer 1 = première zone (z0)

        // Si z1 = "0", pas de Layer 0 (retourne null)
        if (z1 === '0') {
            c0 = null;
        }

        // Si z0 = "0", pas de Layer 1
        const hasLayer1 = (z0 !== '0');
        if (!hasLayer1) {
            c1 = null;
        }

        console.log(`  Couleurs résolues (INVERSÉES): Layer0=${c0} (zone ${z1}), Layer1=${c1} (zone ${z0}), hasLayer1=${hasLayer1}`);
        return { colorL0: c0, colorL1: c1, hasLayer1 };

    } catch (error) {
        console.error('  Erreur résolution couleurs:', error);
        return { colorL0: "#000000", colorL1: "#FFFFFF", hasLayer1: true };
    }
}

/**
 * Génère la liste des matériaux pour le payload API
 *
 * @param {string} immatString - L'immatriculation
 * @param {string} styleLetter - Le style (A-J)
 * @returns {Array<Object>} Liste des matériaux [{name: "RegL0", filename: "Style_A_Left_N"}, ...]
 */
export function generateMaterials(immatString, styleLetter) {
    console.log('🎨 Génération des matériaux...');

    const materialsList = [];
    const isSlanted = STYLES_SLANTED.includes(styleLetter);

    for (let index = 0; index < immatString.length; index++) {
        const char = immatString[index];

        if (isSlanted) {
            // Pour slanted : ajouter Left/Right selon le côté
            const textureFilenameLeft = `Style_${styleLetter}_Left_${char}`;
            const textureFilenameRight = `Style_${styleLetter}_Right_${char}`;

            materialsList.push({
                name: `RegL${index}`,
                filename: textureFilenameLeft
            });

            materialsList.push({
                name: `RegR${index}`,
                filename: textureFilenameRight
            });
        } else {
            // Pour straight : même texture pour gauche et droite
            const textureFilename = `Style_${styleLetter}_${char}`;

            materialsList.push({
                name: `RegL${index}`,
                filename: textureFilename
            });

            materialsList.push({
                name: `RegR${index}`,
                filename: textureFilename
            });
        }
    }

    console.log(`✅ ${materialsList.length} matériaux générés (slanted: ${isSlanted})`);
    return materialsList;
}

/**
 * Génère la liste des material multi-layers pour le payload API
 * Évite les doublons : un seul multi-layer par caractère unique
 *
 * @param {string} immatString - L'immatriculation
 * @param {string} styleLetter - Le style (A-J)
 * @param {string} colorL0 - Couleur du layer 0 (peut être null)
 * @param {string} colorL1 - Couleur du layer 1 (peut être null)
 * @param {boolean} hasLayer1 - Si false, ne pas générer de Layer 1
 * @returns {Array<Object>} Liste des multi-layers
 */
export function generateMaterialMultiLayers(immatString, styleLetter, colorL0, colorL1, hasLayer1) {
    console.log('🎨 Génération des material multi-layers...');

    const multiLayersList = [];
    const processedChars = new Set();
    const isSlanted = STYLES_SLANTED.includes(styleLetter);

    for (const char of immatString) {
        // Éviter les doublons (si une lettre apparaît plusieurs fois)
        if (!processedChars.has(char)) {
            if (isSlanted) {
                // Pour slanted : GARDER Left/Right dans materialMultiLayers
                const textureFilenameLeft = `Style_${styleLetter}_Left_${char}`;
                const textureFilenameRight = `Style_${styleLetter}_Right_${char}`;

                // Layer 0 (toujours présent si colorL0 existe)
                if (colorL0) {
                    multiLayersList.push({
                        name: textureFilenameLeft,
                        layer: 0,
                        diffuseColor: colorL0
                    });
                    multiLayersList.push({
                        name: textureFilenameRight,
                        layer: 0,
                        diffuseColor: colorL0
                    });
                }

                // Layer 1 : TOUJOURS envoyer, même si hasLayer1 == false
                // Si pas de Layer 1 défini (zone = "0"), utiliser la couleur du Layer 0
                const finalColorL1 = (hasLayer1 && colorL1) ? colorL1 : colorL0;
                if (finalColorL1) {
                    multiLayersList.push({
                        name: textureFilenameLeft,
                        layer: 1,
                        diffuseColor: finalColorL1
                    });
                    multiLayersList.push({
                        name: textureFilenameRight,
                        layer: 1,
                        diffuseColor: finalColorL1
                    });
                }
            } else {
                // Pour straight : SANS Left/Right dans materialMultiLayers
                const textureFilename = `Style_${styleLetter}_${char}`;

                // Layer 0 (toujours présent si colorL0 existe)
                if (colorL0) {
                    multiLayersList.push({
                        name: textureFilename,
                        layer: 0,
                        diffuseColor: colorL0
                    });
                }

                // Layer 1 : TOUJOURS envoyer, même si hasLayer1 == false
                // Si pas de Layer 1 défini (zone = "0"), utiliser la couleur du Layer 0
                const finalColorL1 = (hasLayer1 && colorL1) ? colorL1 : colorL0;
                if (finalColorL1) {
                    multiLayersList.push({
                        name: textureFilename,
                        layer: 1,
                        diffuseColor: finalColorL1
                    });
                }
            }

            processedChars.add(char);
        }
    }

    console.log(`✅ ${multiLayersList.length} multi-layers générés pour ${processedChars.size} caractères uniques (slanted: ${isSlanted}, hasLayer1: ${hasLayer1})`);
    return multiLayersList;
}

/**
 * Fonction principale : génère tous les matériaux et couleurs
 *
 * @param {string} immatString - L'immatriculation
 * @param {string} styleLetter - Le style (A-J)
 * @param {string} fullConfigStr - La config complète pour parser les couleurs
 * @param {string} paintSchemeConfigPart - La partie "Exterior_PaintScheme...."
 * @returns {Object} { materials, materialMultiLayers }
 */
export function generateMaterialsAndColors(immatString, styleLetter, fullConfigStr, paintSchemeConfigPart) {
    console.log('🎨 === Génération matériaux et couleurs ===');

    // 1. Parser les couleurs depuis la config
    const colorMap = parseColorsFromConfig(fullConfigStr);

    // 2. Résoudre les couleurs des lettres selon le style
    const { colorL0, colorL1, hasLayer1 } = resolveLetterColors(styleLetter, paintSchemeConfigPart, colorMap);

    // 3. Générer les matériaux
    const materials = generateMaterials(immatString, styleLetter);

    // 4. Générer les multi-layers
    const materialMultiLayers = generateMaterialMultiLayers(immatString, styleLetter, colorL0, colorL1, hasLayer1);

    console.log('✅ Génération matériaux et couleurs terminée');

    return {
        materials,
        materialMultiLayers,
        colors: { colorL0, colorL1, hasLayer1 } // Pour debug
    };
}

// ======================================
// FONCTION DE TEST (DÉVELOPPEMENT)
// ======================================

/**
 * Teste les fonctions de gestion des couleurs
 * Pour tester : Appeler testColors() dans la console
 */
export function testColors() {
    console.log('🧪 === TEST COLORS ===');

    // Config de test (simulée) - avec zone "0" pour tester le Layer 1 conditionnel
    const testConfig = "Version.960/Exterior_PaintScheme.Zephir_B-0_B-D_B-D_B-D_B-D/Exterior_Colors_ZoneB.#c6c7c8-#C4C5C6/Exterior_Colors_ZoneD.#dcdcd7-#D9D7C8";

    const paintSchemePart = "Exterior_PaintScheme.Zephir_B-0_B-D_B-D_B-D_B-D";

    console.log('\n--- Test Style A (slanted, paire 0: B-0) ---');
    const resultA = generateMaterialsAndColors("N960TB", "A", testConfig, paintSchemePart);
    console.log('Materials:', resultA.materials);
    console.log('Material Multi-Layers:', resultA.materialMultiLayers);
    console.log('Colors:', resultA.colors);

    console.log('\n--- Test Style F (straight, paire 0: B-0) ---');
    const resultF = generateMaterialsAndColors("N960TB", "F", testConfig, paintSchemePart);
    console.log('Materials:', resultF.materials);
    console.log('Material Multi-Layers:', resultF.materialMultiLayers);
    console.log('Colors:', resultF.colors);

    console.log('\n✅ Test terminé - A et F devraient avoir les mêmes couleurs');
    return { resultA, resultF };
}
