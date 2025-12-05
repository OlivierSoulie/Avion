// UI.js - Gestion de l'interface utilisateur
// Configurateur TBM Daher
// Version : 1.0
// Date : 02/12/2025

import { setCurrentImageIndex, getCurrentImageIndex, getImages } from './state.js';

// ======================================
// État du carrousel
// ======================================

let carouselState = {
    currentIndex: 0,
    totalImages: 0,
    isAnimating: false
};

// ======================================
// Éléments DOM
// ======================================

const elements = {
    carousel: null,
    carouselSlider: null,
    carouselPrev: null,
    carouselNext: null,
    carouselIndicators: null,
    viewportPlaceholder: null,
    viewportLoader: null,
    viewportError: null
};

// ======================================
// Initialisation du carrousel
// ======================================

/**
 * Initialise le carrousel d'images
 * Bind les event listeners sur les boutons prev/next
 */
export function initCarousel() {
    console.log('🎠 Initialisation du carrousel...');

    // Récupérer les éléments DOM
    elements.carousel = document.getElementById('carousel');
    elements.carouselSlider = document.getElementById('carouselSlider');
    elements.carouselPrev = document.getElementById('carouselPrev');
    elements.carouselNext = document.getElementById('carouselNext');
    elements.carouselIndicators = document.getElementById('carouselIndicators');
    elements.viewportPlaceholder = document.querySelector('.viewport-placeholder');
    elements.viewportLoader = document.getElementById('viewportLoader');
    elements.viewportError = document.getElementById('viewportError');

    // Vérifier que les éléments existent
    if (!elements.carousel || !elements.carouselSlider) {
        console.error('Éléments carrousel manquants dans le DOM');
        return;
    }

    // Bind event listeners sur les boutons
    if (elements.carouselPrev) {
        elements.carouselPrev.addEventListener('click', () => {
            navigateCarousel('prev');
        });
    }

    if (elements.carouselNext) {
        elements.carouselNext.addEventListener('click', () => {
            navigateCarousel('next');
        });
    }

    console.log('✅ Carrousel initialisé');
}

// ======================================
// Navigation du carrousel
// ======================================

/**
 * Navigue dans le carrousel (précédent/suivant)
 * @param {string} direction - 'prev' ou 'next'
 */
function navigateCarousel(direction) {
    if (carouselState.isAnimating) return;

    const totalImages = carouselState.totalImages;
    if (totalImages === 0) return;

    let newIndex = carouselState.currentIndex;

    if (direction === 'prev') {
        newIndex = (carouselState.currentIndex - 1 + totalImages) % totalImages;
    } else if (direction === 'next') {
        newIndex = (carouselState.currentIndex + 1) % totalImages;
    }

    showSlide(newIndex);
}

/**
 * Affiche une slide spécifique
 * @param {number} index - Index de la slide à afficher
 */
function showSlide(index) {
    if (carouselState.isAnimating) return;

    const totalImages = carouselState.totalImages;
    if (totalImages === 0 || index < 0 || index >= totalImages) return;

    carouselState.isAnimating = true;
    carouselState.currentIndex = index;

    // Mettre à jour state global
    setCurrentImageIndex(index);

    // Créer ou récupérer le carousel-track
    let track = elements.carouselSlider.querySelector('.carousel-track');
    if (track) {
        // Appliquer la transformation
        const translateX = -index * 100;
        track.style.transform = `translateX(${translateX}%)`;
    }

    // Mettre à jour les indicateurs
    updateIndicators(index);

    // Mettre à jour les boutons
    updateButtons(index, totalImages);

    // Débloquer l'animation après transition
    setTimeout(() => {
        carouselState.isAnimating = false;
    }, 400);
}

/**
 * Met à jour les indicateurs de position
 * @param {number} currentIndex - Index actuel
 */
function updateIndicators(currentIndex) {
    if (!elements.carouselIndicators) return;

    const indicators = elements.carouselIndicators.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });

    // Mettre à jour le compteur textuel (si existe)
    const counter = document.querySelector('.carousel-counter');
    if (counter) {
        counter.textContent = `${currentIndex + 1}/${carouselState.totalImages}`;
    }
}

/**
 * Met à jour l'état des boutons prev/next
 * @param {number} currentIndex - Index actuel
 * @param {number} totalImages - Nombre total d'images
 */
function updateButtons(currentIndex, totalImages) {
    // Pour un carrousel circulaire, les boutons sont toujours actifs
    // Si on veut désactiver aux extrémités, décommenter ci-dessous:

    // if (elements.carouselPrev) {
    //     elements.carouselPrev.disabled = (currentIndex === 0);
    // }

    // if (elements.carouselNext) {
    //     elements.carouselNext.disabled = (currentIndex === totalImages - 1);
    // }
}

// ======================================
// US-029 : Mosaïque d'images (remplace le carousel)
// ======================================

/**
 * Affiche les images dans une mosaïque cliquable
 * @param {Array<string>} imageUrls - Tableau d'URLs d'images
 * @param {string} viewType - Type de vue ('exterior' ou 'interior')
 */
export function renderMosaic(imageUrls, viewType = 'exterior') {
    console.log(`🖼️ Affichage mosaïque avec ${imageUrls.length} images (vue: ${viewType})`);

    const mosaicGrid = document.getElementById('mosaicGrid');
    if (!mosaicGrid) {
        console.error('Élément mosaïque manquant dans le DOM');
        return;
    }

    if (!imageUrls || imageUrls.length === 0) {
        showPlaceholder('Aucune image disponible');
        return;
    }

    // Masquer placeholder et erreur
    hidePlaceholder();
    hideError();

    // Vider la mosaïque
    mosaicGrid.innerHTML = '';

    // Ajouter la classe correspondant à la vue
    mosaicGrid.classList.remove('exterior', 'interior');
    mosaicGrid.classList.add(viewType);

    // Créer les images avec event listeners
    imageUrls.forEach((url, index) => {
        // US-031: Créer un wrapper pour image + bouton download
        const wrapper = document.createElement('div');
        wrapper.classList.add('mosaic-item');

        const img = document.createElement('img');
        img.src = url;
        img.alt = `Vue TBM ${index + 1}`;
        img.loading = 'lazy';

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
// DEPRECATED : Mise à jour du carrousel (conservé pour compatibilité temporaire)
// ======================================

/**
 * Met à jour le carrousel avec un nouveau set d'images
 * DEPRECATED : Utiliser renderMosaic() à la place
 * @param {Array<string>} imageUrls - Tableau d'URLs d'images
 */
export function updateCarousel(imageUrls) {
    console.warn('⚠️ updateCarousel() est DEPRECATED. Utilisez renderMosaic() à la place.');

    // Rediriger vers renderMosaic pour compatibilité
    renderMosaic(imageUrls, 'exterior');
}

/**
 * Construit le HTML du carrousel avec les images
 * @param {Array<string>} imageUrls - Tableau d'URLs d'images
 */
function buildCarouselHTML(imageUrls) {
    if (!elements.carouselSlider || !elements.carouselIndicators) return;

    // Construire le track avec les slides
    const trackHTML = `
        <div class="carousel-track">
            ${imageUrls.map((url, index) => `
                <div class="carousel-slide" data-index="${index}">
                    <img src="${url}" alt="Vue TBM ${index + 1}" loading="lazy">
                </div>
            `).join('')}
        </div>
        <div class="carousel-counter">${1}/${imageUrls.length}</div>
    `;

    elements.carouselSlider.innerHTML = trackHTML;

    // Construire les indicateurs
    const indicatorsHTML = imageUrls.map((_, index) => `
        <div class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');

    elements.carouselIndicators.innerHTML = indicatorsHTML;

    // Bind event listeners sur les indicateurs
    const indicators = elements.carouselIndicators.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
        });
    });
}

// ======================================
// Gestion du placeholder
// ======================================

/**
 * Affiche le placeholder
 * @param {string} message - Message à afficher
 */
export function showPlaceholder(message = 'Sélectionnez une configuration pour générer le rendu') {
    const placeholder = document.querySelector('.viewport-placeholder');
    if (placeholder) {
        const p = placeholder.querySelector('p');
        if (p) p.textContent = message;
        placeholder.classList.remove('hidden');
        console.log('✅ Placeholder affiché');
    }

    // Masquer la mosaïque
    const mosaicGrid = document.getElementById('mosaicGrid');
    if (mosaicGrid) {
        mosaicGrid.classList.add('hidden');
    }
}

/**
 * Masque le placeholder
 */
function hidePlaceholder() {
    const placeholder = document.querySelector('.viewport-placeholder');
    if (placeholder) {
        placeholder.classList.add('hidden');
        console.log('✅ Placeholder masqué');
    }
}

// ======================================
// Gestion du loader
// ======================================

/**
 * Affiche le loader de chargement
 * @param {string} message - Message à afficher
 */
export function showLoader(message = 'Génération en cours...') {
    console.log('⏳ Affichage loader');

    const loader = document.getElementById('viewportLoader');
    if (loader) {
        const p = loader.querySelector('p');
        if (p) p.textContent = message;
        loader.classList.remove('hidden');
    }

    // Masquer mosaïque et placeholder
    const mosaicGrid = document.getElementById('mosaicGrid');
    if (mosaicGrid) {
        mosaicGrid.classList.add('hidden');
    }
    hidePlaceholder();
}

/**
 * Masque le loader de chargement
 */
export function hideLoader() {
    console.log('✅ Masquage loader');

    const loader = document.getElementById('viewportLoader');
    if (loader) {
        loader.classList.add('hidden');
    }
}

// ======================================
// Gestion des erreurs
// ======================================

/**
 * Affiche un message d'erreur
 * @param {string} message - Message d'erreur à afficher
 */
export function showError(message) {
    console.error('❌ Erreur:', message);

    const errorDiv = document.getElementById('viewportError');
    if (errorDiv) {
        const errorMsg = errorDiv.querySelector('.error-message');
        if (errorMsg) errorMsg.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    // Masquer mosaïque, placeholder et loader
    const mosaicGrid = document.getElementById('mosaicGrid');
    if (mosaicGrid) {
        mosaicGrid.classList.add('hidden');
    }
    hidePlaceholder();
    hideLoader();
}

/**
 * Masque le message d'erreur
 */
export function hideError() {
    const errorDiv = document.getElementById('viewportError');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

/**
 * Initialise le bouton "Réessayer"
 * @param {Function} retryCallback - Fonction à appeler lors du retry
 */
export function initRetryButton(retryCallback) {
    const btnRetry = document.getElementById('btnRetry');
    if (btnRetry && retryCallback) {
        btnRetry.addEventListener('click', () => {
            hideError();
            retryCallback();
        });
    }
}

// ======================================
// Indicateur de connexion (BUG-003 FIX)
// ======================================

/**
 * Initialise les event listeners pour le statut de connexion
 */
export function initConnectionStatus() {
    console.log('Initialisation du statut de connexion...');

    // Afficher le statut initial
    updateConnectionStatus(navigator.onLine);

    // Écouter les changements de connexion
    window.addEventListener('online', () => {
        console.log('Connexion établie');
        updateConnectionStatus(true);
    });

    window.addEventListener('offline', () => {
        console.log('Connexion perdue');
        updateConnectionStatus(false);
    });
}

/**
 * Met à jour l'affichage du statut de connexion
 * @param {boolean} isOnline - True si en ligne, false si hors ligne
 */
export function updateConnectionStatus(isOnline) {
    const badge = document.getElementById('connectionBadge');
    if (!badge) return;

    if (isOnline) {
        badge.classList.remove('offline');
        badge.querySelector('.badge-text').textContent = 'En ligne';
    } else {
        badge.classList.add('offline');
        badge.querySelector('.badge-text').textContent = 'Hors ligne';
    }
}

// ======================================
// Toast de succès (BUG-002 FIX)
// ======================================

/**
 * Affiche un toast de succès temporaire
 * @param {string} message - Message à afficher
 */
export function showSuccessToast(message = 'Rendu généré avec succès !') {
    console.log('✅ Toast succès:', message);

    // Créer le toast s'il n'existe pas
    let toast = document.getElementById('successToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'successToast';
        toast.className = 'success-toast';
        document.body.appendChild(toast);
    }

    // Définir le message et afficher
    toast.textContent = message;
    toast.classList.add('show');

    // Masquer après 3 secondes
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ======================================
// Contrôles de formulaire
// ======================================

/**
 * Désactive tous les contrôles pendant un chargement
 */
export function disableControls() {
    const controls = document.querySelectorAll('.form-control, button');
    controls.forEach(control => {
        control.disabled = true;
    });
}

/**
 * Réactive tous les contrôles après un chargement
 */
export function enableControls() {
    const controls = document.querySelectorAll('.form-control, button');
    controls.forEach(control => {
        control.disabled = false;
    });
}

// ======================================
// Export des fonctions
// ======================================

// ======================================
// US-020 : Plein écran
// ======================================

let fullscreenImages = [];
let fullscreenCurrentIndex = 0;

/**
 * Ouvre la modal plein écran avec l'image à l'index donné
 * @param {number} imageIndex - Index de l'image à afficher
 */
export function openFullscreen(imageIndex) {
    const modal = document.getElementById('fullscreenModal');
    const image = document.getElementById('fullscreenImage');
    const counter = document.getElementById('fullscreenCounter');

    // Récupérer les images de la mosaïque
    const mosaicGrid = document.getElementById('mosaicGrid');
    if (!mosaicGrid) return;

    const images = mosaicGrid.querySelectorAll('img');
    if (images.length === 0) return;

    // Stocker les URLs
    fullscreenImages = Array.from(images).map(img => img.src);
    fullscreenCurrentIndex = imageIndex;

    // Afficher l'image
    image.src = fullscreenImages[fullscreenCurrentIndex];
    counter.textContent = `${fullscreenCurrentIndex + 1} / ${fullscreenImages.length}`;

    // Afficher la modal
    modal.classList.remove('hidden');

    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';

    console.log(`Plein écran ouvert : image ${fullscreenCurrentIndex + 1}/${fullscreenImages.length}`);
}

/**
 * Ferme la modal plein écran
 */
export function closeFullscreen() {
    const modal = document.getElementById('fullscreenModal');
    modal.classList.add('hidden');

    // Restaurer le scroll du body
    document.body.style.overflow = '';

    console.log('Plein écran fermé');
}

/**
 * Navigation vers l'image précédente en plein écran
 */
export function fullscreenPrev() {
    if (fullscreenImages.length === 0) return;

    fullscreenCurrentIndex = (fullscreenCurrentIndex - 1 + fullscreenImages.length) % fullscreenImages.length;

    const image = document.getElementById('fullscreenImage');
    const counter = document.getElementById('fullscreenCounter');

    image.src = fullscreenImages[fullscreenCurrentIndex];
    counter.textContent = `${fullscreenCurrentIndex + 1} / ${fullscreenImages.length}`;

    console.log(`Navigation plein écran : image ${fullscreenCurrentIndex + 1}/${fullscreenImages.length}`);
}

/**
 * Navigation vers l'image suivante en plein écran
 */
export function fullscreenNext() {
    if (fullscreenImages.length === 0) return;

    fullscreenCurrentIndex = (fullscreenCurrentIndex + 1) % fullscreenImages.length;

    const image = document.getElementById('fullscreenImage');
    const counter = document.getElementById('fullscreenCounter');

    image.src = fullscreenImages[fullscreenCurrentIndex];
    counter.textContent = `${fullscreenCurrentIndex + 1} / ${fullscreenImages.length}`;

    console.log(`Navigation plein écran : image ${fullscreenCurrentIndex + 1}/${fullscreenImages.length}`);
}

/**
 * Initialise les event listeners pour le plein écran
 */
export function initFullscreen() {
    const btnFullscreen = document.getElementById('btnFullscreen');
    const btnClose = document.getElementById('fullscreenClose');
    const btnPrev = document.getElementById('fullscreenPrev');
    const btnNext = document.getElementById('fullscreenNext');
    const backdrop = document.getElementById('fullscreenBackdrop');

    // Bouton plein écran dans le viewport
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            // Ouvrir avec l'image courante du carrousel
            const currentIndex = getCurrentImageIndex();
            openFullscreen(currentIndex);
        });
    }

    // Bouton fermer
    if (btnClose) {
        btnClose.addEventListener('click', closeFullscreen);
    }

    // Navigation prev/next
    if (btnPrev) {
        btnPrev.addEventListener('click', fullscreenPrev);
    }

    if (btnNext) {
        btnNext.addEventListener('click', fullscreenNext);
    }

    // Clic sur le backdrop pour fermer
    if (backdrop) {
        backdrop.addEventListener('click', closeFullscreen);
    }

    // Touche ESC pour fermer
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('fullscreenModal');
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'Escape') {
                closeFullscreen();
            } else if (e.key === 'ArrowLeft') {
                fullscreenPrev();
            } else if (e.key === 'ArrowRight') {
                fullscreenNext();
            }
        }
    });

    console.log('Plein écran initialisé');
}

// ======================================
// US-031 : Téléchargement d'images
// ======================================

/**
 * Génère le nom de fichier pour une image
 * @param {string} viewType - 'exterior' ou 'interior'
 * @param {number} imageNumber - Numéro de l'image (1-based)
 * @returns {string} Nom de fichier (ex: "vue_exterieur_1.png")
 */
function generateFilename(viewType, imageNumber) {
    const prefix = viewType === 'exterior' ? 'vue_exterieur' : 'vue_interieur';
    return `${prefix}_${imageNumber}.png`;
}

/**
 * Télécharge une image avec un nom de fichier donné
 * @param {string} imageUrl - URL de l'image (base64 ou blob)
 * @param {string} filename - Nom du fichier (ex: "vue_exterieur_1.png")
 */
export async function downloadImage(imageUrl, filename) {
    try {
        // Convertir data URL en blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Utiliser l'API moderne pour télécharger
        if (window.navigator.msSaveOrOpenBlob) {
            // Pour IE/Edge legacy
            window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            // Pour navigateurs modernes
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = blobUrl;
            link.download = filename;

            // Forcer l'attribut download
            link.setAttribute('download', filename);

            document.body.appendChild(link);

            // Déclencher le téléchargement
            link.click();

            // Nettoyer
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            }, 100);
        }

        console.log(`✅ Image téléchargée : ${filename}`);
    } catch (error) {
        console.error(`❌ Erreur téléchargement ${filename}:`, error);
        throw error;
    }
}

// ======================================
// US-032 : Téléchargement par lot
// ======================================

/**
 * Active le mode sélection pour téléchargement par lot
 */
export function enterSelectionMode() {
    const mosaicGrid = document.getElementById('mosaicGrid');
    const selectionControls = document.getElementById('selectionControls');

    mosaicGrid?.classList.add('selection-mode');
    selectionControls?.classList.remove('hidden');

    // Masquer boutons download individuels
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.style.display = 'none';
    });

    // Ajouter listeners sur checkboxes
    document.querySelectorAll('.image-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectionCounter);
    });

    console.log('Mode sélection activé');
}

/**
 * Désactive le mode sélection
 */
export function exitSelectionMode() {
    const mosaicGrid = document.getElementById('mosaicGrid');
    const selectionControls = document.getElementById('selectionControls');

    mosaicGrid?.classList.remove('selection-mode');
    selectionControls?.classList.add('hidden');

    // Réafficher boutons download individuels
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.style.display = '';
    });

    // Décocher toutes les checkboxes
    document.querySelectorAll('.image-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });

    updateSelectionCounter();
    console.log('Mode sélection désactivé');
}

/**
 * Met à jour le compteur de sélection
 */
function updateSelectionCounter() {
    const checkboxes = document.querySelectorAll('.image-checkbox:checked');
    const count = checkboxes.length;

    const counter = document.getElementById('selectionCounter');
    const btnDownload = document.getElementById('btnDownloadSelected');

    if (counter) {
        counter.textContent = `${count} image${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`;
    }

    if (btnDownload) {
        btnDownload.disabled = count === 0;
        btnDownload.textContent = `Télécharger la sélection (${count})`;
    }
}

/**
 * Télécharge toutes les images sélectionnées de manière séquentielle
 */
export async function downloadSelectedImages(e) {
    // Empêcher propagation si appelé depuis un event
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const checkboxes = document.querySelectorAll('.image-checkbox:checked');

    if (checkboxes.length === 0) {
        showError('Aucune image sélectionnée');
        return;
    }

    const total = checkboxes.length;
    const progressDiv = document.getElementById('downloadProgress');
    const statusText = document.getElementById('downloadStatus');
    const progressFill = document.getElementById('progressFill');

    // Afficher barre de progression
    progressDiv?.classList.remove('hidden');

    // Télécharger chaque image séquentiellement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const url = checkbox.dataset.url;
        const filename = checkbox.dataset.filename;

        // Mettre à jour statut
        if (statusText) {
            statusText.textContent = `Téléchargement ${i + 1}/${total}...`;
        }

        if (progressFill) {
            const percent = ((i + 1) / total) * 100;
            progressFill.style.width = `${percent}%`;
        }

        // Télécharger l'image (await car downloadImage est async)
        try {
            await downloadImage(url, filename);
            successCount++;
        } catch (error) {
            console.error(`Erreur téléchargement ${filename}:`, error);
            errorCount++;
        }

        // Délai de 200ms entre chaque téléchargement
        if (i < checkboxes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    // Masquer barre de progression
    setTimeout(() => {
        progressDiv?.classList.add('hidden');
        if (progressFill) progressFill.style.width = '0%';
    }, 500);

    // Quitter mode sélection
    exitSelectionMode();

    // Toast de succès ou erreur
    if (errorCount === 0) {
        showSuccessToast(`${successCount} image${successCount > 1 ? 's' : ''} téléchargée${successCount > 1 ? 's' : ''} avec succès !`);
    } else if (successCount > 0) {
        showSuccessToast(`${successCount}/${total} images téléchargées (${errorCount} erreur${errorCount > 1 ? 's' : ''})`);
    } else {
        showError(`Erreur : aucune image n'a pu être téléchargée`);
    }

    console.log(`✅ ${successCount} images téléchargées, ${errorCount} erreurs`);
}

export default {
    initCarousel,
    updateCarousel,
    renderMosaic,
    showPlaceholder,
    showLoader,
    hideLoader,
    showError,
    hideError,
    initRetryButton,
    initConnectionStatus,
    showSuccessToast,
    disableControls,
    enableControls,
    openFullscreen,
    closeFullscreen,
    initFullscreen
};
