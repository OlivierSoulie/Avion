/**
 * @fileoverview Fonctions spécifiques à la vue Configuration
 * @module api/configuration
 * @version 1.0
 */

import { buildPayloadForSingleCamera } from './payload-builder.js';
import { callLumiscapheAPI } from './api-client.js';
import {
    getDatabaseXML,
    getCameraListFromGroup,
    getProductIdByName,          // US-049 [T049-1]
    parsePrestigeBookmarkOrdered  // US-049 [T049-4]
} from './xml-parser.js';

/**
 * US-042 (Simplifié) : Génère les rendus pour la vue Configuration
 * - Filtre pour ne garder que la caméra RegistrationNumber du décor actuel
 * - Duplique cette caméra avec tous les styles A à J (10 vignettes)
 * - Garde toutes les autres caméras une seule fois
 * @param {Object} config - La configuration actuelle
 * @returns {Promise<Array<Object>>} Tableau d'objets {url, cameraId, cameraName, groupName, ratioType}
 * @throws {Error} Si la génération échoue
 */
export async function fetchConfigurationImages(config) {

    try {
        // 1. Récupérer le groupe Configuration
        const xmlDoc = await getDatabaseXML();
        const groups = xmlDoc.querySelectorAll('Group');
        let configGroupId = null;

        for (let group of groups) {
            if (group.getAttribute('name') === 'Configuration') {
                configGroupId = group.getAttribute('id');
                break;
            }
        }

        if (!configGroupId) {
            throw new Error('Groupe Configuration non trouvé dans le XML');
        }

        // 2. Récupérer toutes les caméras
        const cameras = await getCameraListFromGroup(configGroupId);

        // 3. Filtrer les caméras et organiser par sections
        const avionImages = [];
        const registrationImages = [];
        const prestigeImages = [];
        const decorImages = [];

        const registrationStyles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        // IMPORTANT: Les caméras RegistrationNumber sont nommées selon le PAINT SCHEME, pas le décor !
        // Extraire le nom court du paintScheme (ex: "Alize_2_B-0_..." → "Alize")
        const paintSchemeName = config.paintScheme.split('_')[0];
        const targetRegistrationName = `RegistrationNumber_${paintSchemeName}`;


        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];

            // Cas 1 : Caméra RegistrationNumber correspondant au paint scheme actuel
            if (camera.name === targetRegistrationName) {

                // Shooter avec tous les styles A à J
                for (let styleIdx = 0; styleIdx < registrationStyles.length; styleIdx++) {
                    const style = registrationStyles[styleIdx];

                    const width = camera.ratioType === '16:9' ? 400 : 100;
                    const height = camera.ratioType === '16:9' ? 225 : 100;


                    try {
                        // Build payload avec ce style spécifique
                        const payload = await buildPayloadForSingleCamera({
                            ...config,
                            cameraId: camera.id,
                            decor: config.decor,
                            registrationStyle: style,  // Changer le style
                            imageWidth: width,
                            imageHeight: height
                        });

                        const images = await callLumiscapheAPI(payload);

                        if (images && images.length > 0) {
                            registrationImages.push({
                                url: images[0].url,
                                cameraId: camera.id,
                                cameraName: `${camera.name} (Style ${style})`,
                                groupName: 'Configuration',
                                ratioType: camera.ratioType
                            });
                        } else {
                            console.warn(`      ⚠️ Aucune image pour style ${style}`);
                        }

                    } catch (error) {
                        console.error(`      ❌ Erreur style ${style}:`, error);
                    }
                }

            }
            // US-049 [T049-7] : Cas spécial PrestigeSelection → Générer UNE vignette composite (prestige sélectionné)
            else if (camera.name === 'PrestigeSelection') {

                try {
                    // US-049 OPTIMISÉ : Générer SEULEMENT le prestige actuellement sélectionné
                    const compositeImage = await generatePrestigeCompositeImage(
                        config.prestige,  // Ex: "Oslo", "London", etc.
                        config,
                        cameras,
                        configGroupId
                    );
                    prestigeImages.push(compositeImage);

                } catch (error) {
                    console.error(`[ERROR] Prestige "${config.prestige}":`, error.message);
                }

                // Passer à la caméra suivante
                continue;
            }
            // Cas 2 : Caméra RegistrationNumber mais pas le bon paint scheme → IGNORER
            else if (camera.name.startsWith('RegistrationNumber_')) {
                continue;
            }
            // Cas 3 : Autre caméra (paint scheme, Spinner, Colors, etc.) → GARDER
            else {
                const width = camera.ratioType === '16:9' ? 400 : 100;
                const height = camera.ratioType === '16:9' ? 225 : 100;


                try {
                    // Shooter avec décor Studio
                    const payload = await buildPayloadForSingleCamera({
                        ...config,
                        cameraId: camera.id,
                        decor: 'Studio',
                        imageWidth: width,
                        imageHeight: height
                    });

                    const images = await callLumiscapheAPI(payload);

                    if (images && images.length > 0) {
                        const imageData = {
                            url: images[0].url,
                            cameraId: camera.id,
                            cameraName: camera.name,
                            groupName: 'Configuration',
                            ratioType: camera.ratioType
                        };

                        // Classifier par section
                        const isDecor = camera.name.match(/^Decor/);
                        if (isDecor) {
                            decorImages.push(imageData);
                        } else {
                            avionImages.push(imageData);
                        }

                    } else {
                        console.warn(`   ⚠️ Aucune image reçue`);
                    }

                } catch (error) {
                    console.error(`   ❌ Erreur:`, error);
                }
            }
        }

        // 4. Assembler dans le bon ordre avec séparateurs
        const finalImages = [];

        // Section AVION
        if (avionImages.length > 0) {
            finalImages.push({ type: 'divider', label: 'Avion' });
            finalImages.push(...avionImages);
        }

        // Section REGISTRATION STYLES
        if (registrationImages.length > 0) {
            finalImages.push({ type: 'divider', label: 'Registration Styles' });
            finalImages.push(...registrationImages);
        }

        // Section PRESTIGE SELECTION (avec nom du prestige)
        if (prestigeImages.length > 0) {
            finalImages.push({ type: 'divider', label: `Prestige Selection - ${config.prestige}` });
            finalImages.push(...prestigeImages);
        }

        // Section DECOR
        if (decorImages.length > 0) {
            finalImages.push({ type: 'divider', label: 'Decor' });
            finalImages.push(...decorImages);
        }

        return finalImages;

    } catch (error) {
        console.error('❌ Échec génération Configuration:', error);
        throw error;
    }
}

// ======================================
// US-049 : Génération Vignettes Prestige Composites (Canvas)
// ======================================

/**
 * US-049 [T049-5] : Assemble des images horizontalement en une seule image composite (Canvas HTML5)
 * @param {Array<string>} imageUrls - URLs des images à assembler côte à côte
 * @param {number} width - Largeur de chaque mini-image (ex: 30)
 * @param {number} height - Hauteur commune (ex: 100)
 * @returns {Promise<string>} Data URL de l'image composite (JPEG base64)
 */
async function assembleImagesHorizontally(imageUrls, width, height) {

    // 1. Créer le canvas avec les bonnes dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width * imageUrls.length;  // Ex: 30 × 10 = 300
    canvas.height = height;  // Ex: 100
    const ctx = canvas.getContext('2d');


    // 2. Charger toutes les images en parallèle
    const imagePromises = imageUrls.map((url, index) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';  // IMPORTANT : Éviter les erreurs CORS
            img.onload = () => {
                resolve(img);
            };
            img.onerror = (error) => {
                console.error(`      ❌ Erreur chargement image ${index + 1}:`, error);
                reject(new Error(`Échec chargement image ${index + 1}`));
            };
            img.src = url;
        });
    });

    try {
        const loadedImages = await Promise.all(imagePromises);

        // 3. Dessiner les images côte à côte sur le canvas
        loadedImages.forEach((img, index) => {
            const x = index * width;  // Position X : 0, 30, 60, ..., 270
            ctx.drawImage(img, x, 0, width, height);
        });


        // 4. Exporter en Data URL (JPEG quality 95%)
        const dataURL = canvas.toDataURL('image/jpeg', 0.95);

        return dataURL;

    } catch (error) {
        console.error('❌ Erreur assemblage Canvas:', error);
        throw error;
    }
}

/**
 * US-049 [T049-6] : Génère une vignette composite pour un prestige (10 matériaux assemblés)
 * @param {string} prestigeName - Nom du prestige (ex: "Oslo")
 * @param {Object} config - Configuration de base
 * @param {Array} cameras - Liste des caméras du groupe Configuration
 * @param {string} configGroupId - ID du groupe Configuration
 * @returns {Promise<Object>} {url, cameraId, cameraName, groupName, ratioType}
 */
async function generatePrestigeCompositeImage(prestigeName, config, cameras, configGroupId) {

    try {
        // 1. Récupérer le XML et parser le bookmark prestige (ordre matériaux)
        const xmlDoc = await getDatabaseXML();
        const materials = parsePrestigeBookmarkOrdered(xmlDoc, prestigeName);

        // 2. Récupérer l'ID du produit "PresetThumbnail"
        const presetProductId = await getProductIdByName("PresetThumbnail");

        // 3. Trouver la caméra "PrestigeSelection"
        const prestigeCamera = cameras.find(cam => cam.name === 'PrestigeSelection');
        if (!prestigeCamera) {
            console.error('   ❌ Caméra PrestigeSelection INTROUVABLE !');
            console.error('   > Caméras disponibles:', cameras.map(c => c.name));
            throw new Error('Caméra PrestigeSelection introuvable dans le groupe Configuration');
        }

        // 4. Générer les 10 mini-vignettes (1 appel API par matériau)
        const miniImageUrls = [];

        for (let i = 0; i < materials.length; i++) {
            const material = materials[i];
            const materialName = material.split('.')[0];  // Ex: "Interior_Carpet"


            try {
                // Build payload avec productId + matériau seul + camera + 30×100

                // US-049 : CORRECTION - Format PresetThumbnail = "Material.XXX"
                // Extraire la valeur après le point : "Interior_Carpet.LightBrown_carpet_Premium" → "LightBrown_carpet_Premium"
                const materialValue = material.split('.')[1];
                const presetConfig = `Material.${materialValue}`;

                const payload = await buildPayloadForSingleCamera({
                    cameraId: prestigeCamera.id,
                    productId: presetProductId,  // ⭐ Produit PresetThumbnail
                    configurationString: presetConfig,  // ⭐ US-049 : Format "Material.XXX"
                    skipExtras: true,  // ⭐ US-049 : Pas de materials/materialMultiLayers/surfaces
                    imageWidth: 30,
                    imageHeight: 100
                });

                // Appel API
                const images = await callLumiscapheAPI(payload);

                if (images && images.length > 0) {
                    miniImageUrls.push(images[0].url);
                } else {
                    console.warn(`      ⚠️ Aucune image reçue pour ${materialName}`);
                    // Continuer avec les autres matériaux
                }

            } catch (error) {
                console.error(`      ❌ Erreur ${materialName}:`, error.message);
                // Continuer avec les autres matériaux (gestion d'erreur robuste)
            }
        }


        if (miniImageUrls.length === 0) {
            throw new Error(`Aucune mini-vignette générée pour prestige ${prestigeName}`);
        }

        // 5. Assembler les mini-vignettes avec Canvas HTML5
        const compositeDataURL = await assembleImagesHorizontally(miniImageUrls, 30, 100);

        // 6. Retourner l'objet vignette composite
        const result = {
            url: compositeDataURL,
            cameraId: prestigeCamera.id,
            cameraName: `Prestige ${prestigeName}`,
            groupName: 'Configuration',
            ratioType: '3:1'  // Ratio spécial 300×100
        };

        return result;

    } catch (error) {
        console.error(`❌ Échec génération vignette composite "${prestigeName}":`, error);
        throw error;
    }
}
