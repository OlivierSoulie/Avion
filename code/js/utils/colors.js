/**
 * @fileoverview Gestion des couleurs d'immatriculation
 * @module utils/colors
 * @version 1.0
 * @description Ce module gère la résolution des couleurs, la génération des matériaux
 *              et des multi-layers pour les lettres d'immatriculation selon le schéma
 *              de peinture sélectionné.
 */

import { STYLES_SLANTED } from '../config.js';

// ======================================
// US-007 : Gestion des couleurs et matériaux
// ======================================

/**
 * Parse la chaîne de configuration pour extraire les couleurs des zones
 *
 * @description Analyse les parties "Exterior_Colors_Zone" de la config string
 *              et extrait les codes couleur hexadécimaux.
 *              IMPORTANT : Utilise le 2ème code hex (Code HTML Lumiscaphe)
 *
 * @param {string} fullConfigStr - La chaîne de configuration complète
 * @returns {Object<string, string>} Map des zones vers couleurs hex
 *
 * @example
 *   // Input: "...Exterior_Colors_ZoneA.#FFFFFF-#000000/..."
 *   // Output: { "A": "#000000" } (2ème couleur = Code HTML Lumiscaphe)
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

                // Prioriser la deuxième couleur si elle existe (Code HTML Lumiscaphe), sinon prendre la première
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
 * @description Détermine les couleurs à appliquer aux lettres d'immatriculation
 *              en fonction du style sélectionné et du schéma de peinture.
 *              IMPORTANT : L'API Lumiscaphe inverse les layers !
 *
 * @logic
 *   - Mapping par couple : A/F → paire[0], B/G → paire[1], C/H → paire[2], D/I → paire[3], E/J → paire[4]
 *   - Chaque paire "X-Y" : X = première zone, Y = deuxième zone
 *   - Layer 0 reçoit la couleur de la DEUXIÈME zone (inversion API)
 *   - Layer 1 reçoit la couleur de la PREMIÈRE zone (inversion API)
 *   - Si Y = "0" : pas de Layer 0 à envoyer
 *   - Si X = "0" : hasLayer1 = false
 *
 * @param {string} styleLetter - La lettre du style (A-J)
 * @param {string} paintSchemeConfigPart - La partie config "Exterior_PaintScheme.Zephir_B-0_B-D_..."
 * @param {Object<string, string>} colorMap - Map des zones vers couleurs hex (de parseColorsFromConfig)
 * @returns {Object} Objet contenant :
 *   - {string|null} primaryColor - Couleur hex pour Layer 0 (ou null si zone = "0")
 *   - {string|null} secondaryColor - Couleur hex pour Layer 1 (ou null si zone = "0")
 *   - {boolean} hasLayer1 - true si Layer 1 doit être envoyé
 *
 * @example
 *   // Pour style "A" avec config "Zephir_A-D_B-0_..."
 *   // Paire[0] = "A-D"
 *   // Retourne: { primaryColor: colorMap["D"], secondaryColor: colorMap["A"], hasLayer1: true }
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
            return { primaryColor: "#000000", secondaryColor: "#FFFFFF", hasLayer1: true };
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
        let primaryColor = colorMap[z1] || null;  // Layer 0 = deuxième zone (z1)
        let secondaryColor = colorMap[z0] || null;  // Layer 1 = première zone (z0)

        // Si z1 = "0", pas de Layer 0 (retourne null)
        if (z1 === '0') {
            primaryColor = null;
        }

        // Si z0 = "0", pas de Layer 1
        const hasLayer1 = (z0 !== '0');
        if (!hasLayer1) {
            secondaryColor = null;
        }

        console.log(`  Couleurs résolues (INVERSÉES): Layer0=${primaryColor} (zone ${z1}), Layer1=${secondaryColor} (zone ${z0}), hasLayer1=${hasLayer1}`);
        return { primaryColor, secondaryColor, hasLayer1 };

    } catch (error) {
        console.error('  Erreur résolution couleurs:', error);
        return { primaryColor: "#000000", secondaryColor: "#FFFFFF", hasLayer1: true };
    }
}

/**
 * Génère la liste des matériaux pour le payload API
 *
 * @description Crée les matériaux pour chaque lettre de l'immatriculation.
 *              Les styles slanted utilisent Left/Right, les straight utilisent une texture unique.
 *
 * @param {string} immatString - L'immatriculation (ex: "N960TB")
 * @param {string} styleLetter - Le style (A-J)
 * @returns {Array<Object>} Liste des matériaux
 *
 * @example
 *   // Style slanted "A" avec immat "N960"
 *   // Retourne: [
 *   //   { name: "RegL0", filename: "Style_A_Left_N" },
 *   //   { name: "RegR0", filename: "Style_A_Right_N" },
 *   //   ...
 *   // ]
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
 *
 * @description Crée les multi-layers pour appliquer les couleurs aux lettres.
 *              Évite les doublons : un seul multi-layer par caractère unique.
 *              IMPORTANT : Layer 1 toujours envoyé, même si zone = "0" (utilise primaryColor en fallback)
 *
 * @param {string} immatString - L'immatriculation
 * @param {string} styleLetter - Le style (A-J)
 * @param {string|null} primaryColor - Couleur du layer 0 (peut être null)
 * @param {string|null} secondaryColor - Couleur du layer 1 (peut être null)
 * @param {boolean} hasLayer1 - Si false, utiliser primaryColor pour Layer 1
 * @returns {Array<Object>} Liste des multi-layers
 *
 * @example
 *   // Style slanted "A", immat "N960", primaryColor="#C4C5C6", secondaryColor=null, hasLayer1=false
 *   // Layer 1 utilisera primaryColor en fallback
 */
export function generateMaterialMultiLayers(immatString, styleLetter, primaryColor, secondaryColor, hasLayer1) {
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

                // Layer 0 (toujours présent si primaryColor existe)
                if (primaryColor) {
                    multiLayersList.push({
                        name: textureFilenameLeft,
                        layer: 0,
                        diffuseColor: primaryColor
                    });
                    multiLayersList.push({
                        name: textureFilenameRight,
                        layer: 0,
                        diffuseColor: primaryColor
                    });
                }

                // Layer 1 : TOUJOURS envoyer, même si hasLayer1 == false
                // Si pas de Layer 1 défini (zone = "0"), utiliser la couleur du Layer 0
                const finalSecondaryColor = (hasLayer1 && secondaryColor) ? secondaryColor : primaryColor;
                if (finalSecondaryColor) {
                    multiLayersList.push({
                        name: textureFilenameLeft,
                        layer: 1,
                        diffuseColor: finalSecondaryColor
                    });
                    multiLayersList.push({
                        name: textureFilenameRight,
                        layer: 1,
                        diffuseColor: finalSecondaryColor
                    });
                }
            } else {
                // Pour straight : SANS Left/Right dans materialMultiLayers
                const textureFilename = `Style_${styleLetter}_${char}`;

                // Layer 0 (toujours présent si primaryColor existe)
                if (primaryColor) {
                    multiLayersList.push({
                        name: textureFilename,
                        layer: 0,
                        diffuseColor: primaryColor
                    });
                }

                // Layer 1 : TOUJOURS envoyer, même si hasLayer1 == false
                // Si pas de Layer 1 défini (zone = "0"), utiliser la couleur du Layer 0
                const finalSecondaryColor = (hasLayer1 && secondaryColor) ? secondaryColor : primaryColor;
                if (finalSecondaryColor) {
                    multiLayersList.push({
                        name: textureFilename,
                        layer: 1,
                        diffuseColor: finalSecondaryColor
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
 * @description Orchestre l'ensemble du processus de génération des matériaux et couleurs
 *              pour l'immatriculation personnalisée.
 *
 * @param {string} immatString - L'immatriculation
 * @param {string} styleLetter - Le style (A-J)
 * @param {string} fullConfigStr - La config complète pour parser les couleurs
 * @param {string} paintSchemeConfigPart - La partie "Exterior_PaintScheme...."
 * @returns {Object} Objet contenant :
 *   - {Array<Object>} materials - Liste des matériaux
 *   - {Array<Object>} materialMultiLayers - Liste des multi-layers
 *   - {Object} colors - Couleurs résolues (pour debug)
 */
export function generateMaterialsAndColors(immatString, styleLetter, fullConfigStr, paintSchemeConfigPart) {
    console.log('🎨 === Génération matériaux et couleurs ===');

    // 1. Parser les couleurs depuis la config
    const colorMap = parseColorsFromConfig(fullConfigStr);

    // 2. Résoudre les couleurs des lettres selon le style
    const { primaryColor, secondaryColor, hasLayer1 } = resolveLetterColors(styleLetter, paintSchemeConfigPart, colorMap);

    // 3. Générer les matériaux
    const materials = generateMaterials(immatString, styleLetter);

    // 4. Générer les multi-layers
    const materialMultiLayers = generateMaterialMultiLayers(immatString, styleLetter, primaryColor, secondaryColor, hasLayer1);

    console.log('✅ Génération matériaux et couleurs terminée');

    return {
        materials,
        materialMultiLayers,
        colors: { primaryColor, secondaryColor, hasLayer1 } // Pour debug
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
