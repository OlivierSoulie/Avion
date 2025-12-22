/**
 * @fileoverview Génération de la vue PDF avec hotspots
 * @module api/pdf-generation
 * @version 2.0 - Ajout mosaïque 3 caméras
 */

import { getConfig } from '../state.js';
import { buildPayloadForSingleCamera } from './payload-builder.js';
import { callLumiscapheAPI } from './api-client.js';
import { callHotspotAPI, buildHotspotPayload } from './hotspot.js';
import { enrichHotspotsWithColors } from '../utils/hotspot-helper.js';
import { getDatabaseXML, getPDFCameras } from './xml-parser.js';

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

/**
 * Génère la mosaïque PDF avec 3 caméras (caméras 4, 5, 6 du groupe Overview)
 * @param {Array<Object>} pdfHotspots - Hotspots [{name, description, position3D: {x, y, z}}]
 * @returns {Promise<Array<Object>>} Array de 3 objets {imageUrl, hotspots, cameraId, cameraName}
 */
export async function generatePDFMosaic(pdfHotspots) {
    try {
        // 1. Récupérer les 3 dernières caméras du groupe Overview
        const cameras = await getPDFCameras();

        if (cameras.length !== 3) {
            throw new Error(`Attendu 3 caméras, reçu ${cameras.length}`);
        }

        // 2. Récupérer la config actuelle
        const config = getConfig();

        // 3. Extraire les positions 3D des hotspots (une seule fois, partagées par toutes les caméras)
        const positions3D = pdfHotspots.map(h => h.position3D);

        // 4. Enrichir les hotspots avec les couleurs actuelles (une seule fois)
        const hotspotsEnriched = await enrichHotspotsWithColors(pdfHotspots);

        // 5. Pour chaque caméra : Snapshot + Hotspot
        const results = await Promise.all(cameras.map(async (camera, index) => {
            // Construire le payload pour cette caméra
            const configWithCamera = {
                ...config,
                cameraId: camera.id
            };

            const snapshotPayload = await buildPayloadForSingleCamera(configWithCamera);

            // Adapter les dimensions selon la caméra pour correspondre à l'affichage
            // Caméra 0 (index 0) : 16:9 → 1920x1080 (image principale)
            // Caméras 1 et 2 (index 1, 2) : 1:1 → 1080x1080 (images carrées)
            let renderWidth, renderHeight;
            if (index === 0) {
                // Image principale en 16:9
                renderWidth = 1920;
                renderHeight = 1080;
            } else {
                // Images secondaires en 1:1 (carré)
                renderWidth = 1080;
                renderHeight = 1080;
            }

            // Surcharger les renderParameters avec les dimensions correctes
            const adjustedRenderParameters = {
                ...snapshotPayload.renderParameters,
                width: renderWidth,
                height: renderHeight
            };

            // Générer l'image via /Snapshot avec les dimensions ajustées
            const adjustedSnapshotPayload = {
                ...snapshotPayload,
                renderParameters: adjustedRenderParameters
            };

            const imagesResponse = await callLumiscapheAPI(adjustedSnapshotPayload);

            if (!imagesResponse || imagesResponse.length === 0) {
                throw new Error(`Aucune image générée par /Snapshot pour caméra ${camera.name || camera.id}`);
            }

            const imageUrl = imagesResponse[0].url;

            // Construire le payload pour /Hotspot avec les MÊMES dimensions
            const hotspotPayload = buildHotspotPayload(
                snapshotPayload.scene,
                snapshotPayload.mode,
                adjustedRenderParameters,  // ← Utiliser les dimensions ajustées
                positions3D
            );

            // Appeler /Hotspot pour obtenir les positions 2D pour cette caméra
            const hotspots2D = await callHotspotAPI(hotspotPayload);

            // Fusionner positions 2D + données enrichies
            const hotspotsComplete = hotspots2D.map((hotspot2D, idx) => ({
                ...hotspotsEnriched[idx],  // name, colorName, colorHtml, position3D
                position2D: hotspot2D.position2D,  // {x, y} depuis API Hotspot
                visibility: hotspot2D.visibility  // "Visible" | "Hidden" | "Occluded"
            }));

            return {
                imageUrl,
                hotspots: hotspotsComplete,
                cameraId: camera.id,
                cameraName: camera.name || `Camera ${index + 1}`
            };
        }));

        return results;

    } catch (error) {
        console.error('❌ Erreur génération mosaïque PDF:', error);
        throw error;
    }
}
