/**
 * @fileoverview Point d'entrée du module UI
 * @module ui
 * @version 1.0
 * @description Module UI refactorisé - Gestion de l'interface utilisateur
 *
 * Architecture (4 modules spécialisés selon SRP) :
 * - mosaic.js  : Affichage mosaïques (Extérieur/Intérieur/Configuration)
 * - modal.js   : Modal plein écran avec navigation
 * - loader.js  : Loader, erreurs, placeholder, toasts
 * - download.js: Téléchargement individuel et par lot
 */

// ======================================
// Imports
// ======================================

// Mosaïques
import { renderMosaic, renderConfigMosaic } from './mosaic.js';

// Modal plein écran
import { openFullscreen, closeFullscreen, fullscreenPrev, fullscreenNext, initFullscreen } from './modal.js';

// Loader et états
import {
    showLoader,
    hideLoader,
    showError,
    hideError,
    showPlaceholder,
    hidePlaceholder,
    showSuccessToast,
    initRetryButton,
    initConnectionStatus,
    updateConnectionStatus,
    disableControls,
    enableControls
} from './loader.js';

// Téléchargement
import {
    downloadImage,
    enterSelectionMode,
    exitSelectionMode,
    downloadSelectedImages
} from './download.js';

// ======================================
// Re-exports publics
// ======================================

// Mosaïques
export { renderMosaic, renderConfigMosaic };

// Modal plein écran
export { openFullscreen, closeFullscreen, fullscreenPrev, fullscreenNext, initFullscreen };

// Loader et états
export {
    showLoader,
    hideLoader,
    showError,
    hideError,
    showPlaceholder,
    hidePlaceholder,
    showSuccessToast,
    initRetryButton,
    initConnectionStatus,
    updateConnectionStatus,
    disableControls,
    enableControls
};

// Téléchargement
export {
    downloadImage,
    enterSelectionMode,
    exitSelectionMode,
    downloadSelectedImages
};

// ======================================
// Export par défaut pour compatibilité
// ======================================

export default {
    // Mosaïques
    renderMosaic,
    renderConfigMosaic,

    // Modal
    openFullscreen,
    closeFullscreen,
    fullscreenPrev,
    fullscreenNext,
    initFullscreen,

    // Loader
    showLoader,
    hideLoader,
    showError,
    hideError,
    showPlaceholder,
    hidePlaceholder,
    showSuccessToast,
    initRetryButton,
    initConnectionStatus,
    updateConnectionStatus,
    disableControls,
    enableControls,

    // Download
    downloadImage,
    enterSelectionMode,
    exitSelectionMode,
    downloadSelectedImages
};
