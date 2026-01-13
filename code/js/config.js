/**
 * @fileoverview Configuration globale et constantes
 * @module config
 * @version 1.0
 */

// ======================================
// Configuration API
// ======================================

export const API_BASE_URL = "https://wr-daher.lumiscaphe.com";

// NOTE US-019: DATABASE_ID n'est plus hardcodé ici
// Il est géré dynamiquement via setDatabaseId() / getDatabaseId() dans api.js

export const IMAGE_WIDTH = 1920;
export const IMAGE_HEIGHT = 1080;

// ======================================
// Listes de choix
// ======================================

// IMPORTANT : La majorité des listes ont été SUPPRIMÉES car elles violaient
// la règle "jamais hardcoder, toujours XML".
//
// Désormais, toutes les options sont extraites dynamiquement depuis le XML :
// - VERSION_LIST → extractParameterOptions('Exterior_Version')
// - PAINT_SCHEMES_LIST → extractParameterOptions('Exterior_PaintScheme')
// - PRESTIGE_LIST → extractParameterOptions('Interior_PrestigeSelection')
// - SPINNER_LIST → extractParameterOptions('Exterior_Spinner')
//
// Voir : code/js/api.js - fonction getExteriorOptionsFromXML()
// Appelé dans : code/js/app.js - fonction initUI()

// Styles de police d'immatriculation (conservés comme fallback si absents du XML)
export const STYLES_SLANTED = ["A", "B", "C", "D", "E"];
export const STYLES_STRAIGHT = ["F", "G", "H", "I", "J"];

// ⚠️ DEPRECATED - NE PLUS UTILISER
// Ce dictionnaire hardcodé est conservé uniquement pour compatibilité avec generate_full_render.py
// Le JavaScript lit maintenant les décors DIRECTEMENT depuis le XML (source de vérité)
// depuis le 11/12/2025 : buildDecorConfig() dans payload-builder.js utilise startsWith() sur le XML
// pour supporter TOUS les décors dynamiquement, même ceux non présents dans ce dictionnaire
export const DECORS_CONFIG = {
    "Tarmac":   { suffix: "Tarmac_Ground",   type: "Ground" },
    "Studio":   { suffix: "Studio_Ground",   type: "Ground" },
    "Hangar":   { suffix: "Hangar_Ground",   type: "Ground" },
    "Onirique": { suffix: "Onirique_Ground", type: "Ground" },
    "Fjord":    { suffix: "Fjord_Flight",    type: "Flight" }
};

// ======================================
// Paramètres physiques (positionnement)
// ======================================

export const CHAR_WIDTHS = {
    'W': 0.30,
    'M': 0.30,
    'I': 0.05,  // US-053: Lettre I étroite (5cm)
    '1': 0.09,  // US-053: Chiffre 1 étroit (9cm)
    '-': 0.15,  // US-053: Tiret (15cm)
    'DEFAULT': 0.20
};

export const SPACING = 0.05;

// ======================================
// Constantes UI et messages
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
    BTN_VIEW_OVERVIEW: 'btnViewOverview', // US-044

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
    RENDER_DEBOUNCE: 300,  // Debounce pour le rendu auto
    ERROR_HIDE: 3000       // Durée d'affichage des erreurs
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
// Valeurs par défaut
// ======================================

// ======================================
// US-027 : Listes de choix intérieur personnalisé
// ======================================
//
// NOTE IMPORTANTE : Les listes intérieur (SEAT_COVERS_LIST, CARPET_LIST, etc.)
// ont été SUPPRIMÉES car elles violaient la règle "jamais hardcoder, toujours XML".
//
// Désormais, toutes les options intérieur sont extraites dynamiquement depuis le XML
// via la fonction getInteriorOptionsFromXML() dans api.js.
//
// Cette fonction parse les balises <Parameter label="Interior_XXX"> du XML
// et extrait toutes les valeurs disponibles avec leurs labels.
//
// Voir : code/js/api.js - fonction getInteriorOptionsFromXML()
// Appelé dans : code/js/app.js - fonction initUI()
//
// ======================================
// Valeurs par défaut
// ======================================

export const DEFAULT_CONFIG = {
    version: "960",
    paintScheme: "Sirocco", // BUG-001 FIXED: "TBM Original" n'existe pas dans PAINT_SCHEMES_LIST, remplacé par "Sirocco"
    prestige: "Oslo",
    decor: "Tarmac",
    spinner: "PolishedAluminium",
    logoTBM: "LogoBlack_#262626",  // US-051 : Extrait depuis XML <Default>
    logo9xx: "LogoRed_#A40000",    // US-051 : Extrait depuis XML <Default>
    fontType: "slanted",
    style: "A",
    immat: "N960TB",
    imageWidth: IMAGE_WIDTH,
    imageHeight: IMAGE_HEIGHT,
    viewType: "exterior", // US-022: Vue par défaut (exterior/interior)
    sunglass: "SunGlassOFF", // US-024: Lunettes de soleil par défaut OFF
    tablet: "Closed", // US-023: Tablette par défaut fermée
    moodLights: "Lighting_Mood_OFF", // Mood Lights par défaut OFF
    doorPilot: "Closed", // US-025: Porte pilote par défaut fermée
    doorPassenger: "Closed", // US-026: Porte passager par défaut fermée

    // US-027 : Configuration intérieur personnalisée (valeurs par défaut = Prestige Oslo)
    carpet: "LightBrown_carpet_Premium",
    seatCovers: "BeigeGray_2176_Leather_Premium",
    tabletFinish: "SapelliMat_table_wood_Premium",
    seatbelts: "OatMeal_belt",
    metalFinish: "BrushedStainless_metal_Premium",
    upperSidePanel: "WhiteSand_2192_Leather_Premium",
    lowerSidePanel: "BeigeGray_2176_Leather_Premium",
    ultraSuedeRibbon: "Elephant_3367_Suede_Premium",
    centralSeatMaterial: "Leather_Premium",
    stitching: null, // US-036 : Sera initialisé depuis le XML ou Prestige
    perforatedSeatOptions: "NoSeatPerforation_Premium"
};

// ======================================
// US-044 : Utilitaires Vue Overview
// ======================================

/**
 * US-044 : Retourne le nom complet de l'avion pour le filigrane Overview
 * @param {string} version - Version de l'avion depuis dropdown (ex: "960", "980", "TBM 960", "TBM 980")
 * @returns {string} Nom complet de l'avion ("TBM 960", "TBM 980") ou "???" si inconnu
 */
export function getAirplaneType(version) {
    if (!version || typeof version !== 'string') {
        console.warn('getAirplaneType: version invalide ou manquante');
        return '???';
    }

    // Ajouter le préfixe "TBM " si pas déjà présent
    if (version.includes('960')) {
        return version.includes('TBM') ? version : 'TBM 960';
    } else if (version.includes('980')) {
        return version.includes('TBM') ? version : 'TBM 980';
    } else {
        console.warn(`getAirplaneType: Type d'avion inconnu pour version "${version}"`);
        return '???';
    }
}
