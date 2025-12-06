/**
 * @fileoverview Fonctions spécifiques à la vue Configuration
 * @module api/configuration
 * @version 1.0
 */

import { buildPayloadForSingleCamera } from './payload-builder.js';
import { callLumiscapheAPI } from './api-client.js';
import { getDatabaseXML, getCameraListFromGroup } from './xml-parser.js';

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
    console.log('🎬 === GÉNÉRATION CONFIGURATION (SIMPLIFIÉ) ===');
    console.log(`Décor actuel: ${config.decor}`);

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
        console.log(`📊 ${cameras.length} caméras dans le groupe Configuration`);

        // 3. Filtrer les caméras
        const finalImages = [];
        const registrationStyles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        // IMPORTANT: Les caméras RegistrationNumber sont nommées selon le PAINT SCHEME, pas le décor !
        const targetRegistrationName = `RegistrationNumber_${config.paintScheme}`;

        console.log(`🎯 Recherche de la caméra: ${targetRegistrationName}`);

        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];

            // Cas 1 : Caméra RegistrationNumber correspondant au décor actuel
            if (camera.name === targetRegistrationName) {
                console.log(`📸 Caméra RegistrationNumber trouvée: ${camera.name}`);
                console.log(`   → Génération de 10 vignettes (styles A à J)...`);

                // Shooter avec tous les styles A à J
                for (let styleIdx = 0; styleIdx < registrationStyles.length; styleIdx++) {
                    const style = registrationStyles[styleIdx];

                    const width = camera.ratioType === '16:9' ? 400 : 100;
                    const height = camera.ratioType === '16:9' ? 225 : 100;

                    console.log(`   📷 Style ${style} (${styleIdx + 1}/10)...`);

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
                            finalImages.push({
                                url: images[0].url,
                                cameraId: camera.id,
                                cameraName: `${camera.name} (Style ${style})`,
                                groupName: 'Configuration',
                                ratioType: camera.ratioType
                            });
                            console.log(`      ✅ Style ${style} OK`);
                        } else {
                            console.warn(`      ⚠️ Aucune image pour style ${style}`);
                        }

                    } catch (error) {
                        console.error(`      ❌ Erreur style ${style}:`, error);
                    }
                }

            }
            // Cas 2 : Caméra RegistrationNumber mais pas le bon décor → IGNORER
            else if (camera.name.startsWith('RegistrationNumber_')) {
                console.log(`⏭️  Ignorer ${camera.name} (décor différent)`);
                continue;
            }
            // Cas 3 : Autre caméra (paint scheme, Spinner, Colors, etc.) → GARDER
            else {
                const width = camera.ratioType === '16:9' ? 400 : 100;
                const height = camera.ratioType === '16:9' ? 225 : 100;

                console.log(`📸 Caméra ${i + 1}/${cameras.length}: ${camera.name} (${camera.ratioType})`);

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
                        finalImages.push({
                            url: images[0].url,
                            cameraId: camera.id,
                            cameraName: camera.name,
                            groupName: 'Configuration',
                            ratioType: camera.ratioType
                        });
                        console.log(`   ✅ Image générée`);
                    } else {
                        console.warn(`   ⚠️ Aucune image reçue`);
                    }

                } catch (error) {
                    console.error(`   ❌ Erreur:`, error);
                }
            }
        }

        console.log(`✅ ${finalImages.length} images Configuration générées`);
        console.log(`   → 10 vignettes RegistrationNumber (styles A-J)`);
        console.log(`   → ${finalImages.length - 10} autres vignettes`);
        return finalImages;

    } catch (error) {
        console.error('❌ Échec génération Configuration:', error);
        throw error;
    }
}
