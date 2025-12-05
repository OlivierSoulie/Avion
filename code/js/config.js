// Config.js - Constantes de configuration
// Configurateur TBM Daher
// Version : 1.0
// Date : 02/12/2025

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

// Configuration des décors (mapping vers camera groups)
// NOTE : Cette config est conservée car elle contient de la LOGIQUE (type, suffix)
// pas seulement des DONNÉES. Les noms de décors viennent toujours du XML.
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
    'I': 0.05,
    'DEFAULT': 0.20
};

export const SPACING = 0.05;

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
    fontType: "slanted",
    style: "A",
    immat: "N960TB",
    imageWidth: IMAGE_WIDTH,
    imageHeight: IMAGE_HEIGHT,
    viewType: "exterior", // US-022: Vue par défaut (exterior/interior)
    sunglass: "SunGlassOFF", // US-024: Lunettes de soleil par défaut OFF
    tablet: "Closed", // US-023: Tablette par défaut fermée
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
