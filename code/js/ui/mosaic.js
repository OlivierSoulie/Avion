/**
 * @fileoverview Rendu des mosaïques d'images
 * @module ui/mosaic
 * @version 1.0
 * @description Gère l'affichage des mosaïques d'images (Extérieur, Intérieur, Configuration)
 */

import { showPlaceholder, hidePlaceholder, hideError, showSuccessToast, showError } from './loader.js';
import { openFullscreen } from './modal.js';
import { downloadImage } from './download.js';

// ======================================
// US-029 : Mosaïque d'images Extérieur/Intérieur
// ======================================

/**
 * Affiche les images dans une mosaïque cliquable (Extérieur ou Intérieur)
 * @param {Array<Object|string>} imageData - Tableau d'objets { url, cameraId, cameraName, groupName } ou URLs
 * @param {string} viewType - Type de vue ('exterior' ou 'interior')
 * @public
 */
export function renderMosaic(imageData, viewType = 'exterior') {
    console.log(`🖼️ Affichage mosaïque avec ${imageData.length} images (vue: ${viewType})`);

    const mosaicGrid = document.getElementById('mosaicGrid');
    if (!mosaicGrid) {
        console.error('Élément mosaïque manquant dans le DOM');
        return;
    }

    if (!imageData || imageData.length === 0) {
        showPlaceholder('Aucune image disponible');
        return;
    }

    // Masquer placeholder et erreur
    hidePlaceholder();
    hideError();

    // Vider la mosaïque
    mosaicGrid.innerHTML = '';

    // Ajouter la classe correspondant à la vue
    mosaicGrid.classList.remove('exterior', 'interior', 'configuration');
    mosaicGrid.classList.add(viewType);

    // Créer les images avec event listeners
    imageData.forEach((item, index) => {
        // Support ancien format (string URL) et nouveau format (objet)
        const url = typeof item === 'string' ? item : item.url;
        const cameraId = typeof item === 'object' ? item.cameraId : '';
        const cameraName = typeof item === 'object' ? item.cameraName : '';
        const groupName = typeof item === 'object' ? item.groupName : '';

        // US-031: Créer un wrapper pour image + bouton download + checkbox
        const wrapper = document.createElement('div');
        wrapper.classList.add('mosaic-item');

        const img = document.createElement('img');
        img.src = url;
        img.alt = `Vue TBM ${index + 1}`;
        img.loading = 'lazy';

        // Ajouter les métadonnées dans data-attributes
        if (groupName) img.dataset.groupName = groupName;
        if (cameraName) img.dataset.cameraName = cameraName;
        if (cameraId) img.dataset.cameraId = cameraId;

        // Clic sur image → ouvre en plein écran
        img.addEventListener('click', () => {
            openFullscreen(index);
        });

        // US-031: Bouton download
        const downloadBtn = document.createElement('button');
        downloadBtn.classList.add('download-btn');
        downloadBtn.innerHTML = '⬇️';
        downloadBtn.setAttribute('aria-label', 'Télécharger cette image');
        downloadBtn.setAttribute('title', 'Télécharger cette image');

        // Event listener sur bouton download (stopPropagation pour éviter l'ouverture fullscreen)
        downloadBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const filename = generateFilename(viewType, index + 1);
            try {
                await downloadImage(url, filename);
                showSuccessToast(`Image téléchargée : ${filename}`);
            } catch (error) {
                showError(`Erreur lors du téléchargement de ${filename}`);
            }
        });

        // US-032: Checkbox pour sélection multiple
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('image-checkbox');
        checkbox.dataset.index = index;
        checkbox.dataset.url = url;
        checkbox.dataset.filename = generateFilename(viewType, index + 1);

        // Empêcher l'ouverture fullscreen lors du clic sur checkbox
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Ajouter image, bouton et checkbox au wrapper
        wrapper.appendChild(img);
        wrapper.appendChild(downloadBtn);
        wrapper.appendChild(checkbox);

        mosaicGrid.appendChild(wrapper);
    });

    // Afficher la mosaïque
    mosaicGrid.classList.remove('hidden');

    console.log('✅ Mosaïque affichée');
}

// ======================================
// US-042 : Mosaïque Configuration avec ratios mixtes
// ======================================

/**
 * Affiche la mosaïque des vignettes Configuration avec ratios adaptatifs
 * @param {Array<Object>} imagesData - Tableau d'objets { url, cameraId, cameraName, groupName, ratioType }
 * @public
 */
export async function renderConfigMosaic(imagesData) {
    console.log(`🖼️ Affichage mosaïque Configuration avec ${imagesData.length} vignettes`);

    const mosaicGrid = document.getElementById('mosaicGrid');
    if (!mosaicGrid) {
        console.error('Élément mosaïque manquant dans le DOM');
        return;
    }

    if (!imagesData || imagesData.length === 0) {
        showPlaceholder('Aucune image disponible');
        return;
    }

    // Masquer placeholder et erreur
    hidePlaceholder();
    hideError();

    // Vider la mosaïque
    mosaicGrid.innerHTML = '';

    // Ajouter la classe configuration
    mosaicGrid.classList.remove('exterior', 'interior');
    mosaicGrid.classList.add('configuration');

    // Créer les vignettes avec détection de ratio
    for (let i = 0; i < imagesData.length; i++) {
        const { url, cameraId, cameraName, groupName, ratioType } = imagesData[i];

        // Utiliser le ratioType fourni ou par défaut '1:1'
        const finalRatioType = ratioType || '1:1';

        console.log(`📸 Image ${i + 1}: ratio=${finalRatioType}, camera=${cameraName || 'NULL'}`);

        // Créer wrapper
        const wrapper = document.createElement('div');
        wrapper.classList.add('mosaic-item');

        // Ajouter classe selon ratio
        if (finalRatioType === '16:9') {
            wrapper.classList.add('vignette-16-9');
        } else {
            wrapper.classList.add('vignette-1-1');
        }

        const img = document.createElement('img');
        img.src = url;
        img.alt = `Configuration ${i + 1} (${finalRatioType})`;
        img.loading = 'lazy';

        // Ajouter les métadonnées dans data-attributes
        if (groupName) img.dataset.groupName = groupName;
        if (cameraName) img.dataset.cameraName = cameraName;
        if (cameraId) img.dataset.cameraId = cameraId;

        // Clic sur image → ouvre en plein écran
        img.addEventListener('click', () => {
            openFullscreen(i);
        });

        // Bouton download
        const downloadBtn = document.createElement('button');
        downloadBtn.classList.add('download-btn');
        downloadBtn.innerHTML = '⬇️';
        downloadBtn.setAttribute('aria-label', 'Télécharger cette vignette');
        downloadBtn.setAttribute('title', 'Télécharger cette vignette');

        // Event listener sur bouton download
        downloadBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const filename = `configuration_${i + 1}_${ratioType.replace(':', 'x')}.png`;
            try {
                await downloadImage(url, filename);
                showSuccessToast(`Vignette téléchargée : ${filename}`);
            } catch (error) {
                showError(`Erreur lors du téléchargement de ${filename}`);
            }
        });

        // Checkbox pour sélection multiple
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('image-checkbox');
        checkbox.dataset.index = i;
        checkbox.dataset.url = url;
        checkbox.dataset.filename = `configuration_${i + 1}_${ratioType.replace(':', 'x')}.png`;

        // Empêcher l'ouverture fullscreen lors du clic sur checkbox
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Ajouter image, bouton et checkbox au wrapper
        wrapper.appendChild(img);
        wrapper.appendChild(downloadBtn);
        wrapper.appendChild(checkbox);

        mosaicGrid.appendChild(wrapper);
    }

    // Afficher la mosaïque
    mosaicGrid.classList.remove('hidden');

    console.log('✅ Mosaïque Configuration affichée');
}

// ======================================
// Helpers privés
// ======================================

/**
 * Génère le nom de fichier pour une image
 * @param {string} viewType - 'exterior' ou 'interior'
 * @param {number} imageNumber - Numéro de l'image (1-based)
 * @returns {string} Nom de fichier (ex: "vue_exterieur_1.png")
 * @private
 */
function generateFilename(viewType, imageNumber) {
    const prefix = viewType === 'exterior' ? 'vue_exterieur' : 'vue_interieur';
    return `${prefix}_${imageNumber}.png`;
}
