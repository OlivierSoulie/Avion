/**
 * @fileoverview Téléchargement d'images
 * @module ui/download
 * @version 1.0
 * @description Gère le téléchargement individuel et par lot des images
 */

import { showSuccessToast, showError } from './loader.js';

// ======================================
// US-031 : Téléchargement d'images
// ======================================

/**
 * Télécharge une image avec un nom de fichier donné
 * @param {string} imageUrl - URL de l'image (base64 ou blob)
 * @param {string} filename - Nom du fichier (ex: "vue_exterieur_1.png")
 * @public
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
 * @public
 */
export function enterSelectionMode() {
    const mosaicGrid = document.getElementById('mosaicGrid');
    const overviewMosaic = document.getElementById('overviewMosaic');
    const selectionControls = document.getElementById('selectionControls');

    mosaicGrid?.classList.add('selection-mode');
    overviewMosaic?.classList.add('selection-mode');
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
 * @public
 */
export function exitSelectionMode() {
    const mosaicGrid = document.getElementById('mosaicGrid');
    const overviewMosaic = document.getElementById('overviewMosaic');
    const selectionControls = document.getElementById('selectionControls');

    mosaicGrid?.classList.remove('selection-mode');
    overviewMosaic?.classList.remove('selection-mode');
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
 * @private
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
 * @public
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
