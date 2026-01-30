/**
 * @fileoverview Configuration globale et constantes TECHNIQUES uniquement
 * @module config
 * @version 2.0
 * @description Contient UNIQUEMENT les constantes techniques qui ne changent pas.
 *              Toutes les valeurs de configuration viennent du XML (source de vérité).
 */

// ======================================
// Configuration API
// ======================================

export const API_BASE_URL = "https://wr-daher.lumiscaphe.com";

export const IMAGE_WIDTH = 1920;
export const IMAGE_HEIGHT = 1080;

// ======================================
// Paramètres physiques (positionnement immatriculation)
// Ces valeurs sont des constantes physiques, pas des valeurs de config
// ======================================

export const CHAR_WIDTHS = {
    'W': 0.30,
    'M': 0.30,
    'I': 0.05,
    '1': 0.09,
    '-': 0.15,
    'DEFAULT': 0.20
};

export const SPACING = 0.05;

// Styles de police d'immatriculation (liste fixe, ne change pas selon la base)
export const STYLES_SLANTED = ["A", "B", "C", "D", "E"];
export const STYLES_STRAIGHT = ["F", "G", "H", "I", "J"];

// ======================================
// Constantes UI
// ======================================

/**
 * Sélecteurs DOM utilisés dans l'application
 */
export const SELECTORS = {
    // Contrôles
    CONTROLS_EXTERIOR: 'controls-exterior',
    CONTROLS_INTERIOR: 'controls-interior',
    SELECT_DATABASE: 'selectDatabase',
    SELECT_VERSION: 'selectVersion',
    SELECT_PAINT_SCHEME: 'selectPaintScheme',
    SELECT_PRESTIGE: 'selectPrestige',
    SELECT_DECOR: 'selectDecor',
    SELECT_SPINNER: 'selectSpinner',
    SELECT_STYLE: 'selectStyle',
    RADIO_SLANTED: 'radioSlanted',
    RADIO_STRAIGHT: 'radioStraight',
    INPUT_IMMAT: 'inputImmat',
    ERROR_IMMAT: 'errorImmat',
    BTN_SUBMIT_IMMAT: 'btnSubmitImmat',

    // Vues
    BTN_VIEW_EXTERIOR: 'btnViewExterior',
    BTN_VIEW_INTERIOR: 'btnViewInterior',
    BTN_VIEW_CONFIGURATION: 'btnViewConfiguration',
    BTN_VIEW_OVERVIEW: 'btnViewOverview',

    // Zones de couleurs
    SELECT_ZONE_A: 'selectZoneA',
    SELECT_ZONE_B: 'selectZoneB',
    SELECT_ZONE_C: 'selectZoneC',
    SELECT_ZONE_D: 'selectZoneD',
    SELECT_ZONE_A_PLUS: 'selectZoneAPlus',
    SEARCH_ZONE_A: 'searchZoneA',
    SEARCH_ZONE_B: 'searchZoneB',
    SEARCH_ZONE_C: 'searchZoneC',
    SEARCH_ZONE_D: 'searchZoneD',
    SEARCH_ZONE_A_PLUS: 'searchZoneAPlus',

    // Intérieur
    CARPET: 'carpet',
    SEAT_COVERS: 'seat-covers',
    TABLET_FINISH: 'tablet-finish',
    SEATBELTS: 'seatbelts',
    METAL_FINISH: 'metal-finish',
    UPPER_SIDE_PANEL: 'upper-side-panel',
    LOWER_SIDE_PANEL: 'lower-side-panel',
    ULTRA_SUEDE_RIBBON: 'ultra-suede-ribbon',
    STITCHING: 'stitching',
    BTN_CENTRAL_SEAT_SUEDE: 'btnCentralSeatSuede',
    BTN_CENTRAL_SEAT_CUIR: 'btnCentralSeatCuir',

    // Toggle buttons
    BTN_SUNGLASS_OFF: 'btnSunGlassOFF',
    BTN_SUNGLASS_ON: 'btnSunGlassON',
    BTN_TABLET_CLOSED: 'btnTabletClosed',
    BTN_TABLET_OPEN: 'btnTabletOpen',
    BTN_DOOR_PILOT_CLOSED: 'btnDoorPilotClosed',
    BTN_DOOR_PILOT_OPEN: 'btnDoorPilotOpen',
    BTN_DOOR_PASSENGER_CLOSED: 'btnDoorPassengerClosed',
    BTN_DOOR_PASSENGER_OPEN: 'btnDoorPassengerOpen',

    // Actions
    ACTIONS_EXTERIOR: 'actions-exterior',
    ACTIONS_INTERIOR: 'actions-interior',
    BTN_DOWNLOAD_JSON: 'btnDownloadJSON',
    BTN_BULK_DOWNLOAD: 'btnBulkDownload',
    BTN_CANCEL_SELECTION: 'btnCancelSelection',
    BTN_DOWNLOAD_SELECTED: 'btnDownloadSelected'
};

/**
 * Messages d'erreur standards
 */
export const ERROR_MESSAGES = {
    NO_PAYLOAD: 'Aucune configuration générée. Veuillez d\'abord générer un rendu.',
    CONFIG_NOT_FOUND: 'La configuration demandée n\'a pas été trouvée.',
    SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
    TIMEOUT: 'La génération a pris trop de temps. Veuillez réessayer.',
    CONNECTION_ERROR: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
    GENERAL_ERROR: 'Une erreur est survenue lors de la génération du rendu.',
    NO_DATABASE: 'Aucune base disponible',
    DATABASE_LOAD_ERROR: 'Impossible de charger les bases de données. Vérifiez votre connexion.',
    PRESTIGE_LOAD_ERROR: 'Erreur lors du chargement du prestige',
    COLOR_ZONE_ERROR: 'Erreur lors de l\'initialisation des zones de couleurs'
};

/**
 * Messages de succès
 */
export const SUCCESS_MESSAGES = {
    RENDER_GENERATED: 'Rendu généré avec succès !',
    JSON_DOWNLOADED: 'JSON téléchargé avec succès !'
};

/**
 * Timeouts (en millisecondes)
 */
export const TIMEOUTS = {
    RENDER_DEBOUNCE: 300,
    ERROR_HIDE: 3000
};

/**
 * Codes HTTP
 */
export const HTTP_STATUS = {
    OK: 200,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
};

// ======================================
// Utilitaires
// ======================================

/**
 * Retourne le nom complet de l'avion pour le filigrane Overview
 * @param {string} version - Version de l'avion (ex: "960", "980")
 * @returns {string} Nom complet ("TBM 960", "TBM 980") ou "???"
 */
export function getAirplaneType(version) {
    if (!version || typeof version !== 'string') {
        console.warn('getAirplaneType: version invalide ou manquante');
        return '???';
    }

    if (version.includes('960')) {
        return version.includes('TBM') ? version : 'TBM 960';
    } else if (version.includes('980')) {
        return version.includes('TBM') ? version : 'TBM 980';
    } else {
        console.warn(`getAirplaneType: Type d'avion inconnu pour version "${version}"`);
        return '???';
    }
}
