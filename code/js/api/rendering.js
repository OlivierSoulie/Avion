/**
 * @fileoverview Fonctions de génération de rendus Extérieur/Intérieur
 * @module api/rendering
 * @version 1.0
 */

import { buildPayload } from './payload-builder.js';
import { callLumiscapheAPI, downloadImages, setLastPayload } from './api-client.js';
import { findCameraGroupId, getDatabaseXML } from './xml-parser.js';

/**
 * FONCTION PRINCIPALE : Génère les rendus via l'API
 * Orchestre la construction du payload, l'appel API et le téléchargement
 *
 * US-042: Retourne maintenant un tableau d'objets {url, cameraId}
 * @param {Object} config - La configuration actuelle
 * @returns {Promise<Array<Object>>} Tableau d'objets {url, cameraId, cameraName, groupName}
 * @throws {Error} Si la génération échoue
 */
export async function fetchRenderImages(config) {
    console.log('🎬 === GÉNÉRATION DES RENDUS ===');
    console.log('Configuration:', config);

    try {
        // 1. Construire le payload (ASYNC - télécharge le XML pour le camera group ID)
        const payload = await buildPayload(config);

        // US-021 : Sauvegarder le payload pour téléchargement ultérieur
        setLastPayload(payload);
        console.log('💾 Payload sauvegardé pour téléchargement JSON');

        // 2. Appeler l'API (retourne maintenant {url, cameraId})
        const images = await callLumiscapheAPI(payload);

        // 3. Valider les images
        const validatedImages = await downloadImages(images);

        // 4. Enrichir avec les métadonnées (groupName, cameraName)
        const groupId = await findCameraGroupId(config.decor, config.viewType);
        const xmlDoc = await getDatabaseXML();
        const group = xmlDoc.querySelector(`Group[id="${groupId}"]`);
        const groupName = group ? group.getAttribute('name') : '';

        const enrichedImages = validatedImages.map((img, index) => {
            // Chercher la caméra correspondante dans le XML
            const cameraId = img.cameraId;
            let cameraName = '';

            if (cameraId) {
                const cameraElement = xmlDoc.querySelector(`Camera[id="${cameraId}"]`);
                cameraName = cameraElement ? (cameraElement.getAttribute('name') || '') : '';
            }

            return {
                ...img,
                cameraName: cameraName || `Camera ${index + 1}`,
                groupName: groupName
            };
        });

        console.log('✅ Génération terminée avec succès');
        return enrichedImages;

    } catch (error) {
        console.error('❌ Échec de la génération:', error);
        throw error;
    }
}
