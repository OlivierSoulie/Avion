/**
 * @fileoverview Client HTTP pour l'API Lumiscaphe
 * @module api/api-client
 * @version 1.0
 */

import { API_BASE_URL } from '../config.js';

// ======================================
// Constantes
// ======================================
const DEFAULT_TIMEOUT = 30000; // 30 secondes
const MAX_RETRIES = 3;

// ======================================
// Gestion dynamique DATABASE_ID (US-019)
// ======================================

// ID de base actuelle (dynamique, n'est plus importé depuis config.js)
let currentDatabaseId = null;

/**
 * Définit l'ID de la base de données active
 * @param {string} databaseId - L'ID de la base à utiliser
 */
export function setDatabaseId(databaseId) {
    console.log(`📦 Changement de base de données: ${databaseId}`);
    currentDatabaseId = databaseId;
    // Invalider le cache XML pour forcer le rechargement
    // Note: L'invalidation est gérée via un callback pour éviter import circulaire
    if (xmlCacheInvalidator) {
        xmlCacheInvalidator();
    }
}

// Callback pour invalider le cache XML (évite import circulaire)
let xmlCacheInvalidator = null;

/**
 * Enregistre le callback d'invalidation du cache XML
 * @param {Function} callback - Fonction à appeler pour invalider le cache
 */
export function registerXMLCacheInvalidator(callback) {
    xmlCacheInvalidator = callback;
}

/**
 * Récupère l'ID de la base de données active
 * @returns {string} L'ID de la base actuelle
 * @throws {Error} Si DATABASE_ID non défini
 */
export function getDatabaseId() {
    if (!currentDatabaseId) {
        throw new Error('DATABASE_ID non défini. Appelez setDatabaseId() d\'abord.');
    }
    return currentDatabaseId;
}

// ======================================
// Appels API
// ======================================

/**
 * Appelle l'API Lumiscaphe pour générer les rendus
 * Gestion des erreurs HTTP et retry automatique
 * @param {Object} payload - Le payload JSON construit par buildPayload()
 * @param {number} retryCount - Nombre de tentatives (défaut: 3)
 * @returns {Promise<Array<Object>|Object>} Images générées [{url, cameraId}] ou {url} en mode image singulier
 * @throws {Error} Si l'appel échoue après toutes les tentatives
 */
export async function callLumiscapheAPI(payload, retryCount = MAX_RETRIES) {
    console.log('🚀 Appel API Lumiscaphe...');

    const url = `${API_BASE_URL}/Snapshot`;
    const timeout = DEFAULT_TIMEOUT;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            console.log(`   Tentative ${attempt}/${retryCount}...`);

            // Créer un AbortController pour gérer le timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            // Appel fetch avec timeout
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Vérifier le code HTTP
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Vérifier le content-type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Réponse non-JSON reçue: ${contentType}`);
            }

            // Parser la réponse JSON
            const data = await response.json();

            // Mode "image" (singulier) peut retourner un objet unique ou un tableau avec 1 élément
            // Mode "images" (pluriel) retourne toujours un tableau
            let dataArray;
            if (Array.isArray(data)) {
                dataArray = data;
            } else if (data && typeof data === 'object' && data.url) {
                // Réponse unique (mode "image") → convertir en tableau
                dataArray = [data];
            } else {
                throw new Error('Réponse API invalide: ni tableau ni objet image');
            }

            // US-042: Extraire les URLs avec cameraId pour support vue Configuration
            const images = dataArray
                .filter(item => item && item.url)
                .map(item => ({
                    url: item.url,
                    cameraId: item.cameraId || null
                }));

            if (images.length === 0) {
                throw new Error('Aucune URL d\'image dans la réponse');
            }

            console.log(`✅ ${images.length} images reçues`);
            return images;

        } catch (error) {
            console.error(`❌ Tentative ${attempt} échouée:`, error.message);

            // Si c'est un timeout
            if (error.name === 'AbortError') {
                console.error('   Timeout après 30 secondes');
            }

            // Si c'est la dernière tentative, on throw
            if (attempt === retryCount) {
                throw new Error(`Échec après ${retryCount} tentatives: ${error.message}`);
            }

            // Sinon, attendre avant de réessayer (backoff exponentiel)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`   Nouvelle tentative dans ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Retourne les images sans validation préalable
 * Le navigateur chargera les images directement via <img src="">
 *
 * Note: La validation HEAD a été supprimée car:
 * - Certaines APIs ne supportent pas HEAD
 * - Les URLs peuvent expirer rapidement
 * - Le navigateur gère naturellement les erreurs de chargement
 *
 * US-042: Support nouveau format {url, cameraId}
 * @param {Array<Object>} images - Tableau d'objets {url, cameraId}
 * @returns {Promise<Array<Object>>} Les images avec URLs et cameraId
 */
export async function downloadImages(images) {
    console.log(`📥 Préparation de ${images.length} images...`);

    // Afficher les URLs dans la console pour debug
    images.forEach((img, i) => {
        console.log(`   Image ${i + 1}: ${img.url}${img.cameraId ? ` (camera: ${img.cameraId})` : ''}`);
    });

    console.log(`✅ ${images.length} images prêtes à charger`);

    // Retourner directement les images, le navigateur les chargera
    return images;
}
