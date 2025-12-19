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
// US-044 : Baker le watermark sur l'image Overview
// ======================================

/**
 * Baker le watermark (nom de l'avion) sur l'image
 * @param {HTMLImageElement} img - Image source
 * @param {string} watermarkText - Texte du watermark (ex: "TBM 960")
 * @returns {Promise<string>} URL blob de l'image composite
 */
async function bakeWatermarkOnImage(img, watermarkText) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Attendre que l'image soit chargée si nécessaire
        const drawWatermark = () => {
            // Utiliser les dimensions naturelles de l'image
            const width = img.naturalWidth;
            const height = img.naturalHeight;

            canvas.width = width;
            canvas.height = height;

            // Calculer la taille de police proportionnelle (120px pour ~1200px de largeur)
            const fontSize = Math.max(width * 0.1, 60); // Min 60px, proportionnel à 10% de la largeur

            // 1. DESSINER LE WATERMARK EN PREMIER (arrière-plan)
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = '#E00500'; // Rouge Daher
            ctx.globalAlpha = 0.8; // Opacité
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Position: centré horizontalement, à 25% du haut (moitié de la moitié supérieure)
            const x = width / 2;
            const y = height * 0.25;

            ctx.fillText(watermarkText, x, y);

            // 2. DESSINER L'IMAGE PAR-DESSUS (premier plan)
            ctx.globalAlpha = 1.0; // Rétablir l'opacité complète pour l'image
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir en blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                } else {
                    reject(new Error('Échec génération image avec watermark'));
                }
            }, 'image/png');
        };

        // Si l'image est déjà chargée, dessiner immédiatement
        if (img.complete && img.naturalWidth > 0) {
            drawWatermark();
        } else {
            // Sinon attendre le chargement
            img.onload = drawWatermark;
            img.onerror = () => reject(new Error('Échec chargement image'));
        }
    });
}

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
    const mosaicGrid = document.getElementById('mosaicGrid');
    const overviewMosaic = document.getElementById('overviewMosaic');
    const viewportDisplay = document.getElementById('viewportDisplay');

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

    // Masquer la mosaïque Overview si elle existe
    if (overviewMosaic) {
        overviewMosaic.classList.add('hidden');
    }

    // Masquer la vue PDF si elle existe
    if (viewportDisplay) {
        const pdfWrapper = viewportDisplay.querySelector('.pdf-view-wrapper');
        if (pdfWrapper) {
            pdfWrapper.classList.add('hidden');
        }
    }

    // Afficher mosaicGrid
    mosaicGrid.classList.remove('hidden');

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
    const mosaicGrid = document.getElementById('mosaicGrid');
    const overviewMosaic = document.getElementById('overviewMosaic');
    const viewportDisplay = document.getElementById('viewportDisplay');

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

    // Masquer la mosaïque Overview si elle existe
    if (overviewMosaic) {
        overviewMosaic.classList.add('hidden');
    }

    // Masquer la vue PDF si elle existe
    if (viewportDisplay) {
        const pdfWrapper = viewportDisplay.querySelector('.pdf-view-wrapper');
        if (pdfWrapper) {
            pdfWrapper.classList.add('hidden');
        }
    }

    // Afficher mosaicGrid
    mosaicGrid.classList.remove('hidden');

    // Vider la mosaïque
    mosaicGrid.innerHTML = '';

    // Ajouter la classe configuration
    mosaicGrid.classList.remove('exterior', 'interior');
    mosaicGrid.classList.add('configuration');

    // Créer les vignettes avec détection de ratio
    let imageIndex = 0; // Compteur d'images réelles (sans les dividers)
    for (let i = 0; i < imagesData.length; i++) {
        const imageData = imagesData[i];

        // Détecter les séparateurs
        if (imageData.type === 'divider') {
            const divider = document.createElement('div');
            divider.classList.add('mosaic-divider');
            if (imageData.label) {
                divider.innerHTML = `<span>${imageData.label}</span>`;
            }
            mosaicGrid.appendChild(divider);
            continue;
        }

        const { url, cameraId, cameraName, groupName, ratioType } = imageData;

        // Utiliser le ratioType fourni ou par défaut '1:1'
        const finalRatioType = ratioType || '1:1';

        // Créer wrapper
        const wrapper = document.createElement('div');
        wrapper.classList.add('mosaic-item');

        // Ajouter classe selon ratio
        if (finalRatioType === '16:9') {
            wrapper.classList.add('vignette-16-9');
        } else if (finalRatioType === '3:1') {
            // US-049 : Support ratio 3:1 pour vignettes Prestige composites (300×100)
            wrapper.classList.add('vignette-3-1');
        } else {
            wrapper.classList.add('vignette-1-1');
        }

        const img = document.createElement('img');
        img.src = url;
        img.alt = `Configuration ${imageIndex + 1} (${finalRatioType})`;
        img.loading = 'lazy';

        // Ajouter les métadonnées dans data-attributes
        if (groupName) img.dataset.groupName = groupName;
        if (cameraName) img.dataset.cameraName = cameraName;
        if (cameraId) img.dataset.cameraId = cameraId;

        // Clic sur image → ouvre en plein écran (utiliser imageIndex, pas i)
        const currentImageIndex = imageIndex; // Capture de la valeur pour la closure
        img.addEventListener('click', () => {
            openFullscreen(currentImageIndex);
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
            const filename = `configuration_${imageIndex + 1}_${ratioType.replace(':', 'x')}.png`;
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
        checkbox.dataset.index = imageIndex;
        checkbox.dataset.url = url;
        checkbox.dataset.filename = `configuration_${imageIndex + 1}_${ratioType.replace(':', 'x')}.png`;

        // Empêcher l'ouverture fullscreen lors du clic sur checkbox
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Ajouter image, bouton et checkbox au wrapper
        wrapper.appendChild(img);
        wrapper.appendChild(downloadBtn);
        wrapper.appendChild(checkbox);

        mosaicGrid.appendChild(wrapper);

        // Incrémenter le compteur d'images réelles
        imageIndex++;
    }

    // Afficher la mosaïque
    mosaicGrid.classList.remove('hidden');
}

// ======================================
// US-044 : Mosaïque Overview
// ======================================

/**
 * US-044 : Affiche la mosaïque Overview (1 image principale 16:9 + 3 images secondaires)
 * @param {Object} imageA - Objet image principale {url, cameraId, cameraName, groupName}
 * @param {Array<Object>} imagesSecondary - Array de 3 objets images secondaires
 * @param {string} airplaneType - Type d'avion ("960" ou "980")
 * @public
 */
export function renderOverviewMosaic(imageA, imagesSecondary, airplaneType) {
    const overviewMosaic = document.getElementById('overviewMosaic');
    const mainWrapper = document.getElementById('overviewMainWrapper');
    const secondaryWrapper = document.getElementById('overviewSecondaryWrapper');
    const imageAElement = document.getElementById('overviewImageA');
    const watermark = document.getElementById('airplaneTypeWatermark');
    const mosaicGrid = document.getElementById('mosaicGrid');
    const viewportDisplay = document.getElementById('viewportDisplay');

    if (!overviewMosaic || !mainWrapper || !secondaryWrapper || !imageAElement || !watermark) {
        console.error('Éléments Overview manquants dans le DOM');
        return;
    }

    // Masquer placeholder et erreur
    hidePlaceholder();
    hideError();

    // Masquer la mosaïque standard si elle existe
    if (mosaicGrid) {
        mosaicGrid.classList.add('hidden');
    }

    // Masquer la vue PDF si elle existe
    if (viewportDisplay) {
        const pdfWrapper = viewportDisplay.querySelector('.pdf-view-wrapper');
        if (pdfWrapper) {
            pdfWrapper.classList.add('hidden');
        }
    }

    // Afficher la mosaïque Overview
    overviewMosaic.classList.remove('hidden');

    // 1. Afficher image A (principale)
    // Cloner l'élément pour supprimer tous les anciens event listeners (éviter fuites mémoire)
    const newImageAElement = imageAElement.cloneNode(false);
    imageAElement.parentNode.replaceChild(newImageAElement, imageAElement);

    // Mettre à jour la référence (l'ancien élément est remplacé)
    const imageA_element = newImageAElement;

    imageA_element.crossOrigin = 'anonymous'; // Permet l'export canvas depuis autre domaine
    imageA_element.src = imageA.url;
    imageA_element.dataset.groupName = imageA.groupName || '';
    imageA_element.dataset.cameraName = imageA.cameraName || '';
    imageA_element.dataset.cameraId = imageA.cameraId || '';

    // Event listener pour ouvrir en plein écran (nouveau listener sur élément cloné)
    imageA_element.addEventListener('click', async () => {
        // Baker le watermark sur l'image avant d'ouvrir en plein écran
        const compositeUrl = await bakeWatermarkOnImage(imageA_element, watermark.textContent);
        const originalSrc = imageA_element.src;
        imageA_element.src = compositeUrl;

        openFullscreen(0); // Index 0 pour image A

        // Restaurer l'image originale après un court délai
        setTimeout(() => {
            imageA_element.src = originalSrc;
            URL.revokeObjectURL(compositeUrl);
        }, 100);
    });

    // Ajouter bouton download pour image A (après l'image, avant la fin du wrapper)
    let downloadBtnA = mainWrapper.querySelector('.download-btn');
    if (!downloadBtnA) {
        downloadBtnA = document.createElement('button');
        downloadBtnA.classList.add('download-btn');
        downloadBtnA.innerHTML = '⬇️';
        downloadBtnA.setAttribute('aria-label', 'Télécharger cette image');
        downloadBtnA.setAttribute('title', 'Télécharger cette image');
        mainWrapper.appendChild(downloadBtnA);
    } else {
        // Cloner le bouton pour supprimer les anciens listeners (bonne pratique)
        const newDownloadBtnA = downloadBtnA.cloneNode(true);
        downloadBtnA.parentNode.replaceChild(newDownloadBtnA, downloadBtnA);
        downloadBtnA = newDownloadBtnA;
    }

    downloadBtnA.addEventListener('click', async (e) => {
        e.stopPropagation();
        const filename = 'vue_overview_principale.png';
        try {
            // Baker le watermark sur l'image avant de télécharger
            const compositeUrl = await bakeWatermarkOnImage(imageA_element, watermark.textContent);
            await downloadImage(compositeUrl, filename);
            URL.revokeObjectURL(compositeUrl);
            showSuccessToast(`Image téléchargée : ${filename}`);
        } catch (error) {
            showError(`Erreur lors du téléchargement de ${filename}`);
        }
    });

    // Ajouter checkbox pour image A
    let checkboxA = mainWrapper.querySelector('.image-checkbox');
    if (!checkboxA) {
        checkboxA = document.createElement('input');
        checkboxA.type = 'checkbox';
        checkboxA.classList.add('image-checkbox');
        checkboxA.dataset.index = '0';
        mainWrapper.appendChild(checkboxA);
    } else {
        // Cloner la checkbox pour supprimer les anciens listeners (bonne pratique)
        const newCheckboxA = checkboxA.cloneNode(true);
        checkboxA.parentNode.replaceChild(newCheckboxA, checkboxA);
        checkboxA = newCheckboxA;
    }

    // Mettre à jour les data attributes
    checkboxA.dataset.url = imageA.url;
    checkboxA.dataset.filename = 'vue_overview_principale.png';

    // Ajouter le listener sur l'élément propre
    checkboxA.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêcher ouverture fullscreen
    });

    // 2. Mettre à jour le filigrane avec le type d'avion
    watermark.textContent = airplaneType;

    // 3. Vider et recréer les images secondaires (B, C, D) avec boutons download
    secondaryWrapper.innerHTML = '';

    imagesSecondary.forEach((img, index) => {
        if (img) {
            // Créer wrapper pour image + bouton
            const itemWrapper = document.createElement('div');
            itemWrapper.classList.add('overview-secondary-item');

            // Créer image
            const imgElement = document.createElement('img');
            imgElement.src = img.url;
            imgElement.alt = `Overview ${String.fromCharCode(66 + index)}`; // B, C, D
            imgElement.classList.add('overview-secondary-image');
            imgElement.dataset.groupName = img.groupName || '';
            imgElement.dataset.cameraName = img.cameraName || '';
            imgElement.dataset.cameraId = img.cameraId || '';

            // Event listener pour ouvrir en plein écran
            imgElement.addEventListener('click', () => {
                openFullscreen(index + 1); // Index 1, 2, 3 pour B, C, D
            });

            // Créer bouton download
            const downloadBtn = document.createElement('button');
            downloadBtn.classList.add('download-btn');
            downloadBtn.innerHTML = '⬇️';
            downloadBtn.setAttribute('aria-label', 'Télécharger cette image');
            downloadBtn.setAttribute('title', 'Télécharger cette image');

            const filename = `vue_overview_${String.fromCharCode(66 + index).toLowerCase()}.png`; // b, c, d
            downloadBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    await downloadImage(img.url, filename);
                    showSuccessToast(`Image téléchargée : ${filename}`);
                } catch (error) {
                    showError(`Erreur lors du téléchargement de ${filename}`);
                }
            });

            // Créer checkbox pour sélection multiple
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('image-checkbox');
            checkbox.dataset.index = (index + 1).toString(); // 1, 2, 3 pour B, C, D
            checkbox.dataset.url = img.url;
            checkbox.dataset.filename = filename;
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation(); // Empêcher ouverture fullscreen
            });

            // Assembler
            itemWrapper.appendChild(imgElement);
            itemWrapper.appendChild(downloadBtn);
            itemWrapper.appendChild(checkbox);
            secondaryWrapper.appendChild(itemWrapper);
        }
    });

    // 4. La mosaïque Overview est déjà affichée en haut de la fonction
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
