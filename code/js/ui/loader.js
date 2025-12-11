/**
 * @fileoverview Gestion du loader et états de chargement
 * @module ui/loader
 * @version 1.0
 * @description Gère l'affichage du loader, des erreurs, du placeholder et des toasts
 */

// ======================================
// Gestion du loader
// ======================================

/**
 * Affiche le loader de chargement
 * @param {string} message - Message à afficher (défaut: "Génération en cours...")
 * @public
 */
export function showLoader(message = 'Génération en cours...') {
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
 * @public
 */
export function hideLoader() {
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
 * @public
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
 * @public
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
 * @public
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
// Gestion du placeholder
// ======================================

/**
 * Affiche le placeholder
 * @param {string} message - Message à afficher (défaut: "Sélectionnez une configuration pour générer le rendu")
 * @public
 */
export function showPlaceholder(message = 'Sélectionnez une configuration pour générer le rendu') {
    const placeholder = document.querySelector('.viewport-placeholder');
    if (placeholder) {
        const p = placeholder.querySelector('p');
        if (p) p.textContent = message;
        placeholder.classList.remove('hidden');
    }

    // Masquer la mosaïque
    const mosaicGrid = document.getElementById('mosaicGrid');
    if (mosaicGrid) {
        mosaicGrid.classList.add('hidden');
    }
}

/**
 * Masque le placeholder
 * @public
 */
export function hidePlaceholder() {
    const placeholder = document.querySelector('.viewport-placeholder');
    if (placeholder) {
        placeholder.classList.add('hidden');
    }
}

// ======================================
// Toast de succès (BUG-002 FIX)
// ======================================

/**
 * Affiche un toast de succès temporaire
 * @param {string} message - Message à afficher (défaut: "Rendu généré avec succès !")
 * @public
 */
export function showSuccessToast(message = 'Rendu généré avec succès !') {
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
// Indicateur de connexion (BUG-003 FIX)
// ======================================

/**
 * Initialise les event listeners pour le statut de connexion
 * @public
 */
export function initConnectionStatus() {
    // Afficher le statut initial
    updateConnectionStatus(navigator.onLine);

    // Écouter les changements de connexion
    window.addEventListener('online', () => {
        updateConnectionStatus(true);
    });

    window.addEventListener('offline', () => {
        updateConnectionStatus(false);
    });
}

/**
 * Met à jour l'affichage du statut de connexion
 * @param {boolean} isOnline - True si en ligne, false si hors ligne
 * @public
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
// Contrôles de formulaire
// ======================================

/**
 * Désactive tous les contrôles pendant un chargement
 * @public
 */
export function disableControls() {
    const controls = document.querySelectorAll('.form-control, button');
    controls.forEach(control => {
        control.disabled = true;
    });
}

/**
 * Réactive tous les contrôles après un chargement
 * @public
 */
export function enableControls() {
    const controls = document.querySelectorAll('.form-control, button');
    controls.forEach(control => {
        control.disabled = false;
    });
}
