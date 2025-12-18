/**
 * @fileoverview Génération de la vue PDF avec hotspots
 * @module api/pdf-generation
 * @version 1.0
 */

import { getConfig } from '../state.js';
import { buildPayloadForSingleCamera } from './payload-builder.js';
import { callLumiscapheAPI } from './api-client.js';
import { callHotspotAPI, buildHotspotPayload } from './hotspot.js';
import { enrichHotspotsWithColors } from '../utils/hotspot-helper.js';
import { getDatabaseXML } from './xml-parser.js';

/**
 * Génère la vue PDF complète avec image + hotspots
 * @param {Object} pdfConfig - Configuration PDF depuis le JSON
 * @param {string} pdfConfig.camera - GUID de la caméra
 * @param {Array<Object>} pdfConfig.hotspots - Hotspots [{name, description, position3D: {x, y, z}}]
 * @returns {Promise<Object>} {imageUrl, hotspots2D, hotspotsData}
 */
export async function generatePDFView(pdfConfig) {
    try {
        // 1. Récupérer la config actuelle
        const config = getConfig();

        // 2. Ajouter la caméra à la config
        const configWithCamera = {
            ...config,
            cameraId: pdfConfig.camera
        };

        // 3. Construire le payload pour /Snapshot (caméra unique)
        const snapshotPayload = await buildPayloadForSingleCamera(configWithCamera);

        // 4. Générer l'image via /Snapshot
        const imagesResponse = await callLumiscapheAPI(snapshotPayload);

        if (!imagesResponse || imagesResponse.length === 0) {
            throw new Error('Aucune image générée par /Snapshot');
        }

        const imageUrl = imagesResponse[0].url;

        // 5. Extraire les positions 3D des hotspots
        const positions3D = pdfConfig.hotspots.map(h => h.position3D);

        // 6. Construire le payload pour /Hotspot
        const hotspotPayload = buildHotspotPayload(
            snapshotPayload.scene,
            snapshotPayload.mode,
            snapshotPayload.renderParameters,
            positions3D
        );

        // 7. Appeler /Hotspot pour obtenir les positions 2D
        const hotspots2D = await callHotspotAPI(hotspotPayload);

        // 8. Enrichir les hotspots avec les couleurs depuis la config actuelle
        const hotspotsEnriched = await enrichHotspotsWithColors(pdfConfig.hotspots);

        // 9. Fusionner positions 2D + données enrichies
        const hotspotsComplete = hotspots2D.map((hotspot2D, index) => ({
            ...hotspotsEnriched[index],  // name, colorName, colorHtml, position3D (depuis JSON)
            position2D: hotspot2D.position2D,  // {x, y} depuis API Hotspot
            visibility: hotspot2D.visibility  // "Visible" | "Hidden" | "Occluded"
        }));

        // 10. Retourner les données pour le rendu
        return {
            imageUrl,
            hotspots: hotspotsComplete  // Tableau unique avec tout
        };

    } catch (error) {
        console.error('❌ Erreur génération vue PDF:', error);
        throw error;
    }
}
