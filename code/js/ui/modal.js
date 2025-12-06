/**
 * @fileoverview Modal plein écran pour images
 * @module ui/modal
 * @version 1.0
 * @description Gère le modal plein écran avec navigation et métadonnées
 */

// ======================================
// État du modal (privé au module)
// ======================================

let currentImages = [];
let currentMetadata = [];
let currentIndex = 0;

// ======================================
// US-020 : Plein écran
// ======================================

/**
 * Ouvre le modal plein écran avec l'image à l'index donné
 * @param {number} imageIndex - Index de l'image à afficher
 * @public
 */
export function openFullscreen(imageIndex) {
    const modal = document.getElementById('fullscreenModal');
    const image = document.getElementById('fullscreenImage');
    const counter = document.getElementById('fullscreenCounter');
    const metadata = document.getElementById('fullscreenMetadata');

    // Récupérer les images de la mosaïque
    const mosaicGrid = document.getElementById('mosaicGrid');
    if (!mosaicGrid) return;

    const images = mosaicGrid.querySelectorAll('img');
    if (images.length === 0) return;

    // Stocker les URLs et métadonnées
    currentImages = Array.from(images).map(img => img.src);
    currentMetadata = Array.from(images).map(img => ({
        groupName: img.dataset.groupName || '',
        cameraName: img.dataset.cameraName || '',
        cameraId: img.dataset.cameraId || ''
    }));
    currentIndex = imageIndex;

    // Afficher l'image
    updateFullscreenImage();

    // Afficher la modal
    modal.classList.remove('hidden');

    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';

    console.log(`Plein écran ouvert : image ${currentIndex + 1}/${currentImages.length}`);
}

/**
 * Ferme le modal plein écran
 * @public
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
 * @public
 */
export function fullscreenPrev() {
    if (currentImages.length === 0) return;

    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateFullscreenImage();

    console.log(`Navigation plein écran : image ${currentIndex + 1}/${currentImages.length}`);
}

/**
 * Navigation vers l'image suivante en plein écran
 * @public
 */
export function fullscreenNext() {
    if (currentImages.length === 0) return;

    currentIndex = (currentIndex + 1) % currentImages.length;
    updateFullscreenImage();

    console.log(`Navigation plein écran : image ${currentIndex + 1}/${currentImages.length}`);
}

/**
 * Met à jour l'affichage du modal (image + compteur + métadonnées)
 * @private
 */
function updateFullscreenImage() {
    const image = document.getElementById('fullscreenImage');
    const counter = document.getElementById('fullscreenCounter');
    const metadata = document.getElementById('fullscreenMetadata');

    if (!image || !counter || !metadata) return;

    // Mettre à jour l'image et le compteur
    image.src = currentImages[currentIndex];
    counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;

    // Mettre à jour les métadonnées
    const meta = currentMetadata[currentIndex];
    if (meta && (meta.groupName || meta.cameraName || meta.cameraId)) {
        metadata.innerHTML = `
            ${meta.groupName ? `<div><strong>Groupe:</strong> ${meta.groupName}</div>` : ''}
            ${meta.cameraName ? `<div><strong>Caméra:</strong> ${meta.cameraName}</div>` : ''}
            ${meta.cameraId ? `<div><strong>ID:</strong> ${meta.cameraId}</div>` : ''}
        `;
        metadata.style.display = 'block';
    } else {
        metadata.style.display = 'none';
    }
}

// ======================================
// Initialisation des event listeners
// ======================================

/**
 * Initialise les event listeners pour le plein écran
 * @public
 */
export function initFullscreen() {
    const btnClose = document.getElementById('fullscreenClose');
    const btnPrev = document.getElementById('fullscreenPrev');
    const btnNext = document.getElementById('fullscreenNext');
    const backdrop = document.getElementById('fullscreenBackdrop');

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

    // Touches clavier : ESC pour fermer, flèches pour naviguer
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
