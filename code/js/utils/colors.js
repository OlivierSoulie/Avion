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

            } catch (error) {
                console.warn(`[WARN] Parsing couleur: ${part}`, error.message);
                continue;
            }
        }
    }

    return colorMap;
}

/**
 * Résout les couleurs des lettres selon le style et la config de peinture
 *
 * @description Détermine les couleurs à appliquer aux lettres d'immatriculation
 *              en fonction du style sélectionné et du schéma de peinture.
 *
 * @logic
 *   - Mapping par couple : A/F → paire[0], B/G → paire[1], C/H → paire[2], D/I → paire[3], E/J → paire[4]
 *   - Chaque paire "X-Y" : X = première zone (LETTRE), Y = deuxième zone (CONTOUR/OMBRE)
 *   - Layer 0 reçoit la couleur de la zone X (1ère valeur) via diffuseColor
 *   - Layer 1 reçoit la couleur de la zone Y (2ème valeur) via diffuseColor
 *   - Si Y = "0" : Layer 1 utilise la couleur de X (fallback)
 *   - Si X = "0" : hasLayer1 = false (cas normalement impossible)
 *
 * @param {string} styleLetter - La lettre du style (A-J)
 * @param {string} paintSchemeConfigPart - La partie config "Exterior_PaintScheme.Zephir_B-0_B-D_..."
 * @param {Object<string, string>} colorMap - Map des zones vers couleurs hex (de parseColorsFromConfig)
 * @returns {Object} Objet contenant :
 *   - {string|null} primaryColor - Couleur hex pour Layer 0 (zone X)
 *   - {string|null} secondaryColor - Couleur hex pour Layer 1 (zone Y ou fallback X)
 *   - {boolean} hasLayer1 - true si Layer 1 doit être envoyé
 *
 * @example
 *   // Pour style "A" avec config "Zephir_A-D_B-0_..."
 *   // Paire[0] = "A-D"
 *   // Retourne: { primaryColor: colorMap["A"], secondaryColor: colorMap["D"], hasLayer1: true }
 */
export function resolveLetterColors(styleLetter, paintSchemeConfigPart, colorMap) {

    try {
        // Parser la config pour extraire les paires de zones
        // V0.2-V0.5 : "Exterior_PaintScheme.Zephir_B-0_B-D_B-D_B-D_B-D"
        // V0.6+     : "Exterior_PaintScheme.Tehuano_6_A-0_A-D_A-D_A-D_A-D" (avec index)
        const segments = paintSchemeConfigPart.split('.')[1].split('_');

        // Enlever le nom du scheme (premier segment)
        let startIdx = 1;

        // V0.6+ : Si le 2ème segment est un nombre (index), le sauter aussi
        if (segments.length > 1 && /^\d+$/.test(segments[1])) {
            startIdx = 2;
        }

        const configPairs = segments.slice(startIdx); // ["A-0", "A-D", ...]


        if (configPairs.length < 5) {
            return { primaryColor: "#000000", secondaryColor: "#FFFFFF", hasLayer1: true };
        }

        // Mapping correct : A-E -> 0-4 (slanted), F-J -> 0-4 (straight)
        let styleIdx;
        if (styleLetter <= 'E') {
            styleIdx = styleLetter.charCodeAt(0) - 'A'.charCodeAt(0); // A=0, B=1, C=2, D=3, E=4
        } else {
            styleIdx = styleLetter.charCodeAt(0) - 'F'.charCodeAt(0); // F=0, G=1, H=2, I=3, J=4
        }


        if (styleIdx < 0 || styleIdx >= 5) {
            styleIdx = 0;
        }

        // Récupérer la paire de zones correspondante
        const targetPair = configPairs[styleIdx]; // Ex: "A-0" ou "A-D"
        const [z0, z1] = targetPair.split('-');


        // Mapping zones → layers pour materialMultiLayers
        // Chaque paire "X-Y" définit 2 zones de couleur (diffuseColor)
        //
        // Pour paire "A-D" :
        //   - Layer 0 : diffuseColor = couleur zone A (1ère valeur) → Appliqué à la LETTRE
        //   - Layer 1 : diffuseColor = couleur zone D (2ème valeur) → Appliqué au CONTOUR/OMBRE
        //
        // Pour paire "A-0" (pas de 2ème zone) :
        //   - Layer 0 : diffuseColor = couleur zone A
        //   - Layer 1 : diffuseColor = couleur zone A (fallback car pas de 2ème couleur)
        let primaryColor = colorMap[z0] || null;  // Layer 0 = première zone (z0)
        let secondaryColor = colorMap[z1] || null;  // Layer 1 = deuxième zone (z1)

        // Si z1 = "0", utiliser z0 pour Layer 1 aussi (fallback)
        if (z1 === '0') {
            secondaryColor = primaryColor;
        }

        // Si z0 = "0", pas de Layer 0 (ne devrait jamais arriver)
        const hasLayer1 = (z0 !== '0');
        if (!hasLayer1) {
            secondaryColor = null;
        }

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

    const materialsList = [];
    const isSlanted = STYLES_SLANTED.includes(styleLetter);

    for (let index = 0; index < immatString.length; index++) {
        const char = immatString[index];

        if (isSlanted) {
            // Pour slanted : ajouter Left/Right selon le côté
            // CONVENTIONS AVIATION CIVILE : Lettres penchées vers l'arrière
            const textureFilenameLeft = `Style_${styleLetter}_Left_${char}`;
            const textureFilenameRight = `Style_${styleLetter}_Right_${char}`;

            // RegL (côté GAUCHE avion) → texture Right (penché vers l'arrière /)
            materialsList.push({
                name: `RegL${index}`,
                filename: textureFilenameRight
            });

            // RegR (côté DROIT avion) → texture Left (penché vers l'arrière \)
            materialsList.push({
                name: `RegR${index}`,
                filename: textureFilenameLeft
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

    const multiLayersList = [];
    const processedChars = new Set();
    const isSlanted = STYLES_SLANTED.includes(styleLetter);

    for (const char of immatString) {
        // Éviter les doublons (si une lettre apparaît plusieurs fois)
        if (!processedChars.has(char)) {
            if (isSlanted) {
                // Pour slanted : GARDER Left/Right dans materialMultiLayers
                // IMPORTANT : Respecter conventions aviation civile (lettres penchées vers l'arrière)
                // - Côté GAUCHE avion (RegL) → orientation Right (penché vers l'arrière /)
                // - Côté DROIT avion (RegR) → orientation Left (penché vers l'arrière \)
                const textureFilenameLeft = `Style_${styleLetter}_Left_${char}`;
                const textureFilenameRight = `Style_${styleLetter}_Right_${char}`;

                // Layer 0 : TOUJOURS envoyé avec primaryColor
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

                // Layer 1 : TOUJOURS envoyé avec secondaryColor
                if (secondaryColor) {
                    multiLayersList.push({
                        name: textureFilenameLeft,
                        layer: 1,
                        diffuseColor: secondaryColor
                    });
                    multiLayersList.push({
                        name: textureFilenameRight,
                        layer: 1,
                        diffuseColor: secondaryColor
                    });
                }
            } else {
                // Pour straight : SANS Left/Right dans materialMultiLayers
                const textureFilename = `Style_${styleLetter}_${char}`;

                // Layer 0 : TOUJOURS envoyé avec primaryColor
                if (primaryColor) {
                    multiLayersList.push({
                        name: textureFilename,
                        layer: 0,
                        diffuseColor: primaryColor
                    });
                }

                // Layer 1 : TOUJOURS envoyé avec secondaryColor
                if (secondaryColor) {
                    multiLayersList.push({
                        name: textureFilename,
                        layer: 1,
                        diffuseColor: secondaryColor
                    });
                }
            }

            processedChars.add(char);
        }
    }

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

    // 1. Parser les couleurs depuis la config
    const colorMap = parseColorsFromConfig(fullConfigStr);

    // 2. Résoudre les couleurs des lettres selon le style
    const { primaryColor, secondaryColor, hasLayer1 } = resolveLetterColors(styleLetter, paintSchemeConfigPart, colorMap);

    // 3. Générer les matériaux
    const materials = generateMaterials(immatString, styleLetter);

    // 4. Générer les multi-layers
    const materialMultiLayers = generateMaterialMultiLayers(immatString, styleLetter, primaryColor, secondaryColor, hasLayer1);


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
