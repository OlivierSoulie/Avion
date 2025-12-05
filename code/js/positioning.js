// Positioning.js - Calculs des positions d'immatriculation
// Configurateur TBM Daher
// Version : 1.0
// Date : 02/12/2025

import { CHAR_WIDTHS, SPACING } from './config.js';

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
    console.log(`📍 Extraction anchors depuis XML pour scheme: ${scheme}`);

    const params = {
        Left: null,
        Right: null,
        Y: 0.0
    };

    const target = `${scheme.toUpperCase()}_REG`;

    // Chercher dans ConfigurationBookmark ET Bookmark
    const candidates = [];
    candidates.push(...xmlRoot.querySelectorAll('ConfigurationBookmark'));
    candidates.push(...xmlRoot.querySelectorAll('Bookmark'));

    console.log(`   > ${candidates.length} bookmarks trouvés dans le XML`);
    console.log(`   > Recherche des bookmarks contenant: "${target}"`);

    for (const item of candidates) {
        const name = (item.getAttribute('name') || item.getAttribute('label') || '').toUpperCase();

        if (name.startsWith(target)) {
            // Format attendu: "{SCHEME}_REG_REGL_{coords}_Y" ou "{SCHEME}_REG_REGR_{coords}_Y"
            // Ex: "SIROCCO_REG_REGL_0.34_0.35_0.36_0.37_0.38_0.39_0.0"
            const parts = name.split('_');

            if (parts.length >= 9) {
                try {
                    // Extraire les 6 coordonnées (parts[2] à parts[7])
                    const coords = [
                        parseFloat(parts[2]),
                        parseFloat(parts[3]),
                        parseFloat(parts[4]),
                        parseFloat(parts[5]),
                        parseFloat(parts[6]),
                        parseFloat(parts[7])
                    ];

                    // Extraire Y (parts[8])
                    const y = parseFloat(parts[8]);

                    // Détection de la direction : si coords[1] < coords[0], direction négative
                    let direction = 1.0;
                    if (coords.length > 1 && coords[1] < coords[0]) {
                        direction = -1.0;
                    }

                    // On garde le point de départ (coords[0] = Start)
                    const sideData = {
                        Start: coords[0],
                        Direction: direction
                    };

                    // Identifier le côté (Left ou Right)
                    if (parts[1].toUpperCase().includes('REGL')) {
                        params.Left = sideData;
                        params.Y = y;
                        console.log(`   ✅ Anchors LEFT trouvés: Start=${coords[0]}, Direction=${direction}, Y=${y}`);
                    } else if (parts[1].toUpperCase().includes('REGR')) {
                        params.Right = sideData;
                        console.log(`   ✅ Anchors RIGHT trouvés: Start=${coords[0]}, Direction=${direction}`);
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

    console.log('✅ Anchors extraits:', params);
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
    console.log(`🔢 Calcul positions pour "${immatString}" | Start=${startX}, Dir=${directionSign}`);

    const transforms = [];

    for (let i = 0; i < immatString.length; i++) {
        if (i === 0) {
            // Première lettre : centre exactement à start_x
            transforms.push(startX);
            console.log(`  Lettre ${i} (${immatString[i]}): X=${startX} (première lettre)`);
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

            console.log(`  Lettre ${i} (${immatString[i]}): offset=${offset.toFixed(4)}, X=${roundedPosition}`);
        }
    }

    console.log('✅ Positions calculées:', transforms);
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
    console.log('🎨 Génération des surfaces...');

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

    console.log('✅ Surfaces générées:', surfaces);
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
    console.log('🧪 === TEST POSITIONING ===');

    const testImmat = "NWM1MW";
    const anchors = extractAnchors("Sirocco");
    const surfaces = generateSurfaces(testImmat, anchors);

    console.log('\n📊 Résultats du test:');
    console.log('Immatriculation:', testImmat);
    console.log('Anchors:', anchors);
    console.log('Surfaces:', JSON.stringify(surfaces, null, 2));

    console.log('\n✅ Test terminé');
    return surfaces;
}
