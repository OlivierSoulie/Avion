/**
 * @fileoverview Fonctions de génération de rendus Extérieur/Intérieur/Overview
 * @module api/rendering
 * @version 1.0
 */

import { buildPayload, buildPayloadForSingleCamera, buildOverviewPayload } from './payload-builder.js';
import { callLumiscapheAPI, downloadImages, setLastPayload } from './api-client.js';
import { findCameraGroupId, getDatabaseXML, getCameraGroupOverview } from './xml-parser.js';

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
        // Détecter si format V0.1/V0.2 (coordonnées dans decor) pour vue extérieure
        const isV01V02Format = config.viewType === 'exterior' &&
                               config.decor &&
                               /^[A-Za-z]+_[A-Za-z0-9]+_[\d\-_]+$/.test(config.decor);

        if (isV01V02Format) {
            console.log('🔍 Format V0.1/V0.2 détecté : mode image simple');
            return await fetchRenderImagesSingle(config);
        }

        // Format V0.3+ : Mode groupe de caméras (logique actuelle)
        console.log('🔍 Format V0.3+ détecté : mode groupe de caméras');

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

/**
 * V0.1/V0.2 : Génère UNE SEULE image avec la caméra spécifiée dans le décor
 * Format décor : {decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz
 * @param {Object} config - Configuration avec decor au format V0.1/V0.2
 * @returns {Promise<Array<Object>>} Tableau avec une seule image {url, cameraId, cameraName}
 */
async function fetchRenderImagesSingle(config) {
    console.log('📷 Mode image simple (V0.1/V0.2)');

    // Parser le décor : {decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz
    const parts = config.decor.split('_');

    if (parts.length < 8) {
        throw new Error(`Format décor V0.1/V0.2 invalide : "${config.decor}". Attendu : {decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz`);
    }

    const decorName = parts[0]; // Ex: "Fjord"
    const cameraName = parts[1]; // Ex: "001" ou nom de caméra

    console.log(`   > Décor : ${decorName}`);
    console.log(`   > Caméra : ${cameraName}`);

    // Trouver l'ID de la caméra dans le XML
    const xmlDoc = await getDatabaseXML();
    const cameraElement = xmlDoc.querySelector(`Camera[name="${cameraName}"]`);

    if (!cameraElement) {
        throw new Error(`Caméra "${cameraName}" non trouvée dans le XML`);
    }

    const cameraId = cameraElement.getAttribute('id');
    console.log(`   > Caméra ID : ${cameraId}`);

    // Construire le payload avec la caméra unique (utiliser buildPayloadForSingleCamera)
    const payload = await buildPayloadForSingleCamera({
        ...config,
        cameraId: cameraId  // ID de la caméra spécifiée dans le nom du décor
    });

    setLastPayload(payload);

    // Appeler l'API
    const images = await callLumiscapheAPI(payload);
    const validatedImages = await downloadImages(images);

    // Enrichir avec métadonnées
    const enrichedImages = validatedImages.map(img => ({
        ...img,
        cameraName: cameraName,
        groupName: 'Single Camera (V0.1/V0.2)'
    }));

    console.log('✅ Image unique générée avec succès');
    return enrichedImages;
}

/**
 * US-044 : Génère les rendus Overview (1 PNG transparent + 3 JPEG)
 * @param {Object} config - La configuration actuelle
 * @returns {Promise<Object>} Objet {imageA: {url, metadata}, imagesSecondary: [{url, metadata}, ...]}
 * @throws {Error} Si la génération échoue
 */
export async function fetchOverviewImages(config) {
    console.log('🎬 === GÉNÉRATION VUE OVERVIEW ===');
    console.log('Configuration:', config);

    try {
        // 1. Récupérer les caméras du groupe Overview
        const cameras = await getCameraGroupOverview();

        if (cameras.length === 0) {
            throw new Error('Aucune caméra trouvée dans le groupe Overview');
        }

        console.log(`   > ${cameras.length} caméras récupérées pour Overview`);

        // 2. Appel API pour caméra A (PNG transparent)
        console.log('   > Génération image A (PNG transparent)...');
        const payloadA = await buildOverviewPayload(cameras[0].id, true, config);
        setLastPayload(payloadA); // Sauvegarder le dernier payload
        const imageAData = await callLumiscapheAPI(payloadA);
        const imageAValidated = await downloadImages(imageAData);

        // 3. Appels API pour caméras B, C, D (JPEG)
        console.log('   > Génération images B, C, D (JPEG)...');
        const secondaryCameras = cameras.slice(1); // Prendre caméras 1, 2, 3 (B, C, D)
        const secondaryPromises = secondaryCameras.map(async (camera) => {
            const payload = await buildOverviewPayload(camera.id, false, config);
            const imageData = await callLumiscapheAPI(payload);
            return downloadImages(imageData);
        });

        const imagesSecondaryArrays = await Promise.all(secondaryPromises);
        const imagesSecondary = imagesSecondaryArrays.flat(); // Aplatir les tableaux

        // 4. Enrichir avec métadonnées
        const imageA = {
            url: imageAValidated[0].url,
            cameraId: cameras[0].id,
            cameraName: cameras[0].name,
            groupName: 'Overview'
        };

        const enrichedSecondary = imagesSecondary.map((img, index) => ({
            url: img.url,
            cameraId: secondaryCameras[index].id,
            cameraName: secondaryCameras[index].name,
            groupName: 'Overview'
        }));

        console.log('✅ Vue Overview générée avec succès');
        return {
            imageA: imageA,
            imagesSecondary: enrichedSecondary
        };

    } catch (error) {
        console.error('❌ Échec génération vue Overview:', error);
        throw error;
    }
}
