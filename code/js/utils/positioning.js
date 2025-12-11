/**
 * @fileoverview Calculs des positions d'immatriculation
 * @module utils/positioning
 * @version 1.0
 * @description Ce module gère l'extraction des points d'ancrage depuis le XML
 *              et le calcul des positions absolues des lettres d'immatriculation.
 */

import { CHAR_WIDTHS, SPACING } from '../config.js';

// ======================================
// US-006 : Logique de calcul des positions
// ======================================

/**
 * Extrait les anchors (points de départ et directions) depuis le XML parsé
 * Porte la logique Python lignes 120-157 de generate_full_render.py
 *
 * Recherche les bookmarks du type "{SCHEME}_REG_REGL" et "{SCHEME}_REG_REGR"
 * et extrait les coordonnées X de départ et les directions
 *
 * @param {XMLDocument} xmlRoot - Le document XML parsé
 * @param {string} scheme - Le schéma de peinture (ex: "Sirocco")
 * @returns {Object} Les paramètres d'ancrage { Left: {Start, Direction}, Right: {Start, Direction}, Y }
 */
export function extractAnchors(xmlRoot, scheme) {

    const params = {
        Left: null,
        Right: null,
        Y: 0.0
    };

    // Chercher dans ConfigurationBookmark ET Bookmark
    const candidates = [];
    candidates.push(...xmlRoot.querySelectorAll('ConfigurationBookmark'));
    candidates.push(...xmlRoot.querySelectorAll('Bookmark'));


    for (const item of candidates) {
        const name = (item.getAttribute('name') || item.getAttribute('label') || '').toUpperCase();

        // Formats supportés :
        // V0.2-V0.5 : "{SCHEME}_REGL_{X1}_{X2}_{X3}_{X4}_{X5}_{X6}_{Y}" (9 parties)
        //             Ex: "SIROCCO_REGL_0.34_0.35_0.36_0.37_0.38_0.39_0.0"
        // V0.6+     : "{SCHEME}_REGL_{X1}_{Y}" (4 parties)
        //             Ex: "TEHUANO_REGL_0.34_0.0"
        const targetLeft = `${scheme.toUpperCase()}_REGL`;
        const targetRight = `${scheme.toUpperCase()}_REGR`;

        if (name.startsWith(targetLeft) || name.startsWith(targetRight)) {
            const parts = name.split('_');
            const isLeft = name.startsWith(targetLeft);

            // Besoin de 4 parties minimum (V0.6) ou 9 parties (V0.2-V0.5)
            if (parts.length >= 4) {
                try {
                    let startX, y, direction;

                    if (parts.length >= 9) {
                        // V0.2-V0.5 : Format long (6 positions)
                        // parts = [SCHEME, REGL/REGR, X1, X2, X3, X4, X5, X6, Y] = 9 parties
                        const coords = [
                            parseFloat(parts[2]),
                            parseFloat(parts[3]),
                            parseFloat(parts[4]),
                            parseFloat(parts[5]),
                            parseFloat(parts[6]),
                            parseFloat(parts[7])
                        ];
                        y = parseFloat(parts[8]);
                        startX = coords[0];

                        // Détection de la direction : si coords[1] < coords[0], direction négative
                        if (coords.length > 1 && coords[1] < coords[0]) {
                            direction = -1.0;
                        } else {
                            direction = 1.0;
                        }
                    } else {
                        // V0.6+ : Format court (1 seule position)
                        // parts = [SCHEME, REGL/REGR, X1, Y]
                        startX = parseFloat(parts[2]);
                        y = parseFloat(parts[3]);

                        // Direction TOUJOURS positive en V0.6+ car le signe est déjà dans startX
                        // Ex: REGL_0.34_0.0 → startX=+0.34, REGR_-0.34_0.0 → startX=-0.34
                        direction = 1.0;
                    }

                    // Construire les données du côté
                    const sideData = {
                        Start: startX,
                        Direction: direction
                    };

                    // Identifier le côté (Left ou Right)
                    if (isLeft) {
                        params.Left = sideData;
                        params.Y = y;
                    } else {
                        params.Right = sideData;
                    }
                } catch (error) {
                    console.warn(`   ⚠️ Erreur parsing bookmark "${name}":`, error);
                    continue;
                }
            }
        }
    }

    // Si aucun anchor trouvé, utiliser valeurs par défaut (lignes 154-157 du Python)
    if (!params.Left) {
        console.warn(`   ⚠️ Aucun anchor trouvé dans le XML, utilisation valeurs par défaut`);
        params.Left = { Start: 0.34, Direction: 1.0 };
        params.Right = { Start: -0.34, Direction: -1.0 };
        params.Y = 0.0;
    }

    return params;
}

/**
 * Calcule les positions absolues des lettres avec espacement bord-à-bord de 5cm
 *
 * Logique (du script Python lignes 159-198):
 * - Lettre 0 : centre exactement à start_x
 * - Lettre N : centre = start_x + (moitié_lettre_0) + somme(largeurs_complètes 1..N-1) + (N × SPACING) + (moitié_lettre_N)
 *
 * @param {string} immatString - L'immatriculation (ex: "NWM1MW")
 * @param {number} startX - Position X de départ
 * @param {number} directionSign - Direction (1.0 = droite, -1.0 = gauche)
 * @returns {Array<number>} Les positions X absolues de chaque lettre
 */
export function calculateTransformsAbsolute(immatString, startX, directionSign) {

    const transforms = [];

    for (let i = 0; i < immatString.length; i++) {
        if (i === 0) {
            // Première lettre : centre exactement à start_x
            transforms.push(startX);
        } else {
            // 1. Moitié de la première lettre (pour partir de son bord droit)
            const wFirst = CHAR_WIDTHS[immatString[0]] || CHAR_WIDTHS.DEFAULT;
            const halfFirst = wFirst / 2.0;

            // 2. Somme des largeurs COMPLÈTES des lettres entre la première et l'actuelle
            let sumWidthsMiddle = 0.0;
            for (let j = 1; j < i; j++) {
                const width = CHAR_WIDTHS[immatString[j]] || CHAR_WIDTHS.DEFAULT;
                sumWidthsMiddle += width;
            }

            // 3. Nombre d'espaces = nombre de lettres précédentes
            const numSpaces = i;

            // 4. Moitié de la largeur de la lettre actuelle
            const wCurr = CHAR_WIDTHS[immatString[i]] || CHAR_WIDTHS.DEFAULT;
            const halfCurr = wCurr / 2.0;

            // 5. Calcul de l'offset total par rapport au Start
            const offset = halfFirst + sumWidthsMiddle + (numSpaces * SPACING) + halfCurr;

            // 6. Application de la direction (positif = droite, négatif = gauche)
            const position = startX + (offset * directionSign);

            // 7. Arrondir à 4 décimales (comme Python)
            const roundedPosition = Math.round(position * 10000) / 10000;

            transforms.push(roundedPosition);

        }
    }

    return transforms;
}

/**
 * Génère les surfaces pour le payload API
 * Combine les positions Left et Right avec les anchors
 *
 * @param {string} immatString - L'immatriculation
 * @param {Object} anchors - Les anchors extraits via extractAnchors()
 * @returns {Array<Object>} Les surfaces à injecter dans le payload
 */
export function generateSurfaces(immatString, anchors) {

    // Calculer positions Left
    const absXLeft = calculateTransformsAbsolute(
        immatString,
        anchors.Left.Start,
        anchors.Left.Direction
    );

    // Calculer positions Right
    const absXRight = calculateTransformsAbsolute(
        immatString,
        anchors.Right.Start,
        anchors.Right.Direction
    );

    // Construire les surfaces selon format API (lignes 313-321 du Python)
    const surfaces = [];

    // Surface Left (RegL)
    const labelsL = [];
    for (let i = 0; i < absXLeft.length; i++) {
        labelsL.push({
            index: i,
            translation: {
                x: absXLeft[i],
                y: anchors.Y
            }
        });
    }
    surfaces.push({
        tag: "RegL",
        labels: labelsL
    });

    // Surface Right (RegR)
    const labelsR = [];
    for (let i = 0; i < absXRight.length; i++) {
        labelsR.push({
            index: i,
            translation: {
                x: absXRight[i],
                y: anchors.Y
            }
        });
    }
    surfaces.push({
        tag: "RegR",
        labels: labelsR
    });

    return surfaces;
}

// ======================================
// FONCTION DE TEST (DÉVELOPPEMENT)
// ======================================

/**
 * Teste les fonctions de positionnement avec l'immatriculation par défaut
 * Pour tester : Appeler testPositioning() dans la console
 */
export function testPositioning() {

    const testImmat = "NWM1MW";
    const anchors = extractAnchors("Sirocco");
    const surfaces = generateSurfaces(testImmat, anchors);


    return surfaces;
}
