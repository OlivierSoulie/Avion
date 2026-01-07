/**
 * @fileoverview API Hotspot - Projection de positions 3D en 2D
 * @module api/hotspot
 * @version 1.0
 */

import { API_BASE_URL } from '../config.js';
import { setLastHotspotPayload } from '../state.js';

/**
 * Appelle l'API /Hotspot pour projeter des positions 3D en coordonnées 2D
 * @param {Object} payload - Payload contenant scene, mode, renderParameters, positions
 * @returns {Promise<Array<Object>>} Tableau de hotspots [{position: {x, y}, visibility: "visible|hidden|occluded"}]
 * @throws {Error} Si l'appel échoue
 */
export async function callHotspotAPI(payload) {
    const url = `${API_BASE_URL}/Hotspot`;

    // Sauvegarder le payload pour download JSON
    setLastHotspotPayload(payload);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hotspot API HTTP ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Réponse non-JSON reçue: ${contentType}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Réponse API Hotspot invalide: attendu un tableau');
        }

        return data;

    } catch (error) {
        console.error('❌ Erreur API Hotspot:', error.message);
        throw error;
    }
}

/**
 * Construit le payload pour l'API Hotspot à partir d'une config et de positions 3D
 * @param {Object} scene - Scene payload (database, configuration, etc.)
 * @param {Object} mode - Mode payload (image avec camera, ou images avec cameraGroup)
 * @param {Object} renderParameters - Paramètres de rendu (width, height)
 * @param {Array<Object>} positions3D - Tableau de positions 3D [{x, y, z}, ...]
 * @returns {Object} Payload Hotspot prêt pour l'API
 */
export function buildHotspotPayload(scene, mode, renderParameters, positions3D) {
    return {
        scene,
        mode,
        renderParameters,
        positions: positions3D
    };
}

/**
 * Construit le payload MINIMAL pour l'API Hotspot (export JSON documentation)
 * Conforme au guide GUIDE-INTEGRATEUR-HOTSPOTS.md section 5.6
 * @param {Object} scene - Scene payload (seul database sera extrait)
 * @param {Object} mode - Mode payload (image avec camera, ou images avec cameraGroup)
 * @param {Object} renderParameters - Paramètres de rendu (seuls width/height seront extraits)
 * @param {Array<Object>} positions3D - Tableau de positions 3D [{x, y, z}, ...]
 * @returns {Object} Payload Hotspot minimal prêt pour documentation
 */
export function buildMinimalHotspotPayload(scene, mode, renderParameters, positions3D) {
    // Extraire uniquement le GUID de la database (section 5.2 du guide)
    const minimalScene = [{
        database: Array.isArray(scene) ? scene[0]?.database : scene?.database
    }];

    // Extraire uniquement width et height (section 5.4 du guide)
    const minimalRenderParameters = {
        width: renderParameters.width,
        height: renderParameters.height
    };

    // Mode et positions restent identiques
    return {
        scene: minimalScene,
        mode,
        renderParameters: minimalRenderParameters,
        positions: positions3D
    };
}
