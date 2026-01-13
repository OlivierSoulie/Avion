/**
 * @fileoverview Point d'entrée de l'application
 * @version 1.0
 */

import { getConfig, setConfig, updateConfig, setImages, setLoading, setError, hashConfig, getLastPayload, getLastHotspotPayload, getViewType, getPDFCamera0SnapshotPayload, getPDFCamera0HotspotPayload } from './state.js';
import {
    STYLES_SLANTED,
    STYLES_STRAIGHT,
    DEFAULT_CONFIG,
    getAirplaneType // US-044
    // IMPORTANT : Toutes les listes de choix (VERSION, PAINT_SCHEMES, PRESTIGE, SPINNER, DECORS, etc.)
    // sont maintenant extraites dynamiquement du XML via getExteriorOptionsFromXML() et getInteriorOptionsFromXML()
} from './config.js';
import {
    renderMosaic,
    renderConfigMosaic,
    renderOverviewMosaic, // US-044
    renderPDFView, // Vue PDF avec hotspots
    loadAndDisplayPDFView,
    initFullscreen,
    showLoader,
    hideLoader,
    showError,
    hideError,
    showPlaceholder,
    hidePlaceholder,
    showSuccessToast,
    initRetryButton,
    initConnectionStatus,
    disableControls,
    enableControls,
    downloadImage,
    enterSelectionMode,
    exitSelectionMode,
    downloadSelectedImages,
    initMobileMenu, // Menu burger mobile
    initColorZones, // Gestion des couleurs
    populateColorZone,
    syncZonesWithPaintScheme,
    filterColorDropdown,
    renderPDFMosaic,
    initConfigSchemaModal // Modal Documentation XML
} from './ui/index.js';
import { fetchRenderImages, fetchConfigurationImages, fetchOverviewImages, generatePDFView, generatePDFMosaic, fetchDatabases, setDatabaseId, getDatabaseId, getDefaultConfig, getInteriorPrestigeConfig as parsePrestigeConfig, getDatabaseXML, getExteriorColorZones, parsePaintSchemeBookmark, getInteriorOptionsFromXML, getExteriorOptionsFromXML, getCameraListFromGroup, validateConfigForDatabase, getPDFCameraId, getPDFCameras } from './api/index.js';
import { analyzeDatabaseStructure, exportStructureAsJSON } from './api/database-analyzer.js';
import { buildMinimalHotspotPayload } from './api/hotspot.js';
import { loadDefaultConfigFromXML } from './api/config-loader.js';
import { loadDatabases } from './api/database-loader.js';
import { downloadJSON } from './utils/json-export.js';
import { attachEventListeners } from './ui/events/index.js';
import { currentDatabaseStructure } from './ui/config-schema-modal.js';
import { colorZonesData } from './ui/color-manager.js';
import { populateAllDropdowns } from './ui/index.js';
import {
    populateSelect,
    populateDropdown,
    hidePDFViewer,
    toggleViewControls,
    updateDefaultImmatFromModel,
    updateStyleDropdown,
    initAccordion,
    checkViewAvailability,
    checkActionButtonsAvailability,
    checkConfigFieldsAvailability
} from './utils/validators.js';
import { log } from './logger.js';




// ======================================
// ======================================
// US-019 : Gestion des bases de données
// ======================================


// ======================================
// Initialisation UI
// ======================================

/**
 * Initialise les zones de couleurs personnalisées
 * Récupère les couleurs depuis le XML et peuple les 5 dropdowns
 */



/**
 * Initialise l'interface utilisateur
 * Remplit tous les dropdowns avec les valeurs de config
 */
async function initUI() {

    // US-019: Charger les bases de données en premier
    await loadDatabases();

    const config = getConfig();

    // Peupler tous les dropdowns depuis le XML
    try {
        await populateAllDropdowns();
    } catch (error) {
        log.error('Erreur chargement options depuis XML:', error);
        // En cas d'erreur, les dropdowns resteront vides
    }

    // Initialiser les radio buttons perforation
    const perforatedRadios = document.querySelectorAll('input[name="perforated-seat"]');
    perforatedRadios.forEach(radio => {
        if (radio.value === config.perforatedSeatOptions) {
            radio.checked = true;
        }
    });

    // Peupler les zones de couleurs personnalisées
    await initColorZones();

    // US-032 : Event listeners mode sélection
    const btnBulkDownload = document.getElementById('btnBulkDownload');
    const btnCancelSelection = document.getElementById('btnCancelSelection');
    const btnDownloadSelected = document.getElementById('btnDownloadSelected');

    btnBulkDownload?.addEventListener('click', enterSelectionMode);
    btnCancelSelection?.addEventListener('click', exitSelectionMode);
    btnDownloadSelected?.addEventListener('click', downloadSelectedImages);

}

// ======================================
// US-005 : Gestion des rendus API
// ======================================

let renderTimeout = null;
// BUG-001 FIX: Variable pour détecter si la config a changé
let lastConfigHash = null;

/**
 * Déclenche le rendu avec debounce de 300ms
 * Évite les appels multiples lors de changements rapides
 */
function triggerRender() {
    // Annuler le timeout précédent
    if (renderTimeout) {
        clearTimeout(renderTimeout);
    }

    // Programmer un nouveau rendu après 300ms
    renderTimeout = setTimeout(() => {
        loadRender();
    }, 300);
}

/**
 * Masque le viewer PDF s'il existe
 */

/**
 * Génère et affiche la vue PDF avec hotspots
 * @returns {Promise<Object>} {imageUrl, hotspots}
 * @throws {Error} Si le chargement ou la génération échoue
}

/**
 * Charge un nouveau rendu via l'API
 * Gère loader, erreurs et mise à jour du carrousel
 */
async function loadRender() {

    try {
        // 1. Récupérer la config actuelle
        const config = getConfig();

        // US-040: Valider la config pour la base actuelle
        const { config: validatedConfig, corrections } = await validateConfigForDatabase(config);

        // Si corrections appliquées, mettre à jour l'état + dropdowns silencieusement
        if (corrections.length > 0) {
            // Sauvegarder la config validée dans l'état
            setConfig(validatedConfig);

            // Mettre à jour les dropdowns pour refléter les corrections
            const selectDecor = document.getElementById('selectDecor');
            if (selectDecor && validatedConfig.decor) {
                selectDecor.value = validatedConfig.decor;
            }
            const selectDecorInterior = document.getElementById('selectDecorInterior');
            if (selectDecorInterior && validatedConfig.decor) {
                selectDecorInterior.value = validatedConfig.decor;
            }
        }

        // BUG-001 FIX: Vérifier si la config a changé
        const currentHash = hashConfig(validatedConfig);
        if (currentHash === lastConfigHash) {
            return;
        }
        lastConfigHash = currentHash;

        // 2. Afficher le loader
        showLoader('Génération en cours...');
        disableControls();
        setLoading(true);
        setError(null);

        // 3. Appeler l'API avec la config validée
        const viewType = getViewType(); // Récupérer la vue courante (exterior/interior/configuration/pdf)

        let images;

        // Vue PDF : Regénérer la vue avec les nouvelles couleurs
        if (viewType === 'pdf') {
            await loadAndDisplayPDFView();

            hideLoader();
            enableControls();
            setLoading(false);

            showSuccessToast('Vue PDF mise à jour avec succès !');
            return; // Sortir de la fonction
        }

        // US-042: Pour la vue Configuration, utiliser fetchConfigurationImages() qui fait 2 appels API
        if (viewType === 'configuration') {
            images = await fetchConfigurationImages(validatedConfig);
        } else {
            // Pour exterior/interior, appel API classique
            images = await fetchRenderImages(validatedConfig);
        }

        // 4. Mettre à jour le state
        setImages(images);

        // 5. Afficher les images dans la mosaïque
        if (viewType === 'configuration') {
            // Afficher la mosaïque Configuration avec ratios mixtes
            await renderConfigMosaic(images);
        } else {
            // Pour exterior/interior, passer les objets complets avec métadonnées
            await renderMosaic(images, viewType);
        }

        // Cacher le loader seulement après que toutes les images sont chargées
        hideLoader();

        // BUG-002 FIX: Afficher le message de succès
        showSuccessToast('Rendu généré avec succès !');


    } catch (error) {
        // Gérer l'erreur
        console.error('Erreur lors du chargement du rendu:', error);

        hideLoader();

        // BUG-004 FIX: Afficher le placeholder avant l'erreur
        showPlaceholder('Erreur lors de la génération du rendu');

        // Mapper les erreurs vers des messages user-friendly
        let errorMessage = 'Une erreur est survenue lors de la génération du rendu.';

        if (error.message.includes('HTTP 404')) {
            errorMessage = 'La configuration demandée n\'a pas été trouvée.';
        } else if (error.message.includes('HTTP 500')) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.message.includes('Timeout')) {
            errorMessage = 'La génération a pris trop de temps. Veuillez réessayer.';
        } else if (error.message.includes('Échec après')) {
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        }

        showError(errorMessage);
        setError(errorMessage);

    } finally {
        // Toujours réactiver les contrôles
        setLoading(false);
        enableControls();
    }
}

// ======================================
// US-027 : Affichage conditionnel section intérieur
// ======================================

/**
 * US-027 : Affiche ou masque la section intérieur selon le type de vue
 * @param {string} viewType - "exterior" ou "interior"
 */
/**
 * US-028 : Affichage conditionnel des contrôles selon la vue active
 * @param {string} viewType - 'exterior' ou 'interior'
 */


// ======================================
// US-033 : Recherche par tags dans zones de couleurs
// ======================================

/**
 * US-033 : Filtre un dropdown de zone de couleur selon le terme de recherche
 * Recherche dans le nom de la couleur ET dans les tags
 * Insensible à la casse
 *
 * @param {string} zoneId - ID du dropdown (ex: "selectZoneA")
 * @param {string} searchTerm - Terme de recherche
 */

// ======================================
// Event Listeners sur les contrôles (US-003 + US-005)
// ======================================
// NOTE : Les event listeners sont maintenant dans ui/events/
// Voir: ui/events/index.js (fonction attachEventListeners)

// ======================================

/**
 * Point d'entrée principal de l'application
 * Appelé quand le DOM est prêt
 */
async function init() {

    // Initialiser l'UI (async car charge les bases de données)
    await initUI();

    // Charger la config par défaut depuis le XML
    const defaultConfigLoaded = await loadDefaultConfigFromXML();

    // US-034 : Initialiser immat par défaut selon modèle
    updateDefaultImmatFromModel(getConfig().version);

    // Initialiser le carrousel (US-029: Remplacé par mosaïque, plus besoin d'init)
    // initCarousel();

    // BUG-003 FIX: Initialiser l'indicateur de connexion
    initConnectionStatus();

    // US-020: Initialiser le plein écran
    initFullscreen();

    // Initialiser le menu burger mobile
    initMobileMenu();

    // Initialiser le modal Configuration/Schémas XML
    initConfigSchemaModal();

    // Initialiser le bouton Réessayer (US-005)
    initRetryButton(() => {
        loadRender();
    });

    // Attacher les event listeners sur les contrôles (US-003)
    attachEventListeners();

    // Initialiser le système d'accordéon
    initAccordion();

    // US-027 : Afficher/masquer section intérieur selon vue initiale
    toggleViewControls(getConfig().viewType);

    // Modes de test
    if (window.location.search.includes('test-carousel')) {
        testCarousel();
    } else if (window.location.search.includes('test-controls')) {
        testControls();
    } else if (window.location.search.includes('test-immat')) {
        testImmatriculation();
    } else if (window.location.search.includes('test-payload')) {
        console.warn('⚠️ testPayloadBuild() a été supprimé lors du refactoring');
    } else {
        // Charger automatiquement le rendu initial avec la config par défaut
        if (defaultConfigLoaded) {
        } else {
        }
        loadRender();
    }

}

// ======================================
// ======================================
// Démarrage au chargement du DOM
// ======================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ======================================
// Exposer les fonctions de test pour debug
// ======================================

// testPayloadBuild supprimé lors du refactoring
window.loadRender = loadRender;
window.triggerRender = triggerRender;

// Exposer lastConfigHash pour permettre le reset au changement de base (database-events.js)
// On utilise un getter/setter pour maintenir l'accès à la variable locale
Object.defineProperty(window, 'lastConfigHash', {
    get: () => lastConfigHash,
    set: (value) => { lastConfigHash = value; }
});
