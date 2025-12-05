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

export const VERSION_LIST = ["960", "980"];

export const STYLES_SLANTED = ["A", "B", "C", "D", "E"];
export const STYLES_STRAIGHT = ["F", "G", "H", "I", "J"];

export const DECORS_CONFIG = {
    "Tarmac":   { suffix: "Tarmac_Ground",   type: "Ground" },
    "Studio":   { suffix: "Studio_Ground",   type: "Ground" },
    "Hangar":   { suffix: "Hangar_Ground",   type: "Ground" },
    "Onirique": { suffix: "Onirique_Ground", type: "Ground" },
    "Fjord":    { suffix: "Fjord_Flight",    type: "Flight" }
};

export const PAINT_SCHEMES_LIST = [
    "Sirocco",
    "Alize",
    "Mistral",
    "Meltem",
    "Tehuano",
    "Zephir"
];

export const PRESTIGE_LIST = [
    "Oslo",
    "SanPedro",
    "London",
    "Labrador",
    "GooseBay",
    "BlackFriars",
    "Fjord",
    "Atacama"
];

export const SPINNER_LIST = [
    "PolishedAluminium",
    "MattBlack"
];

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

// Sièges (4 listes)
export const SEAT_COVERS_LIST = [
    { label: "Beige Gray 2176", value: "BeigeGray_2176_Leather_Premium" },
    { label: "White Sand 2192", value: "WhiteSand_2192_Leather_Premium" },
    { label: "Doeskin 2195", value: "Doeskin_2195_Leather_Premium" },
    { label: "Camel 2200", value: "Camel_2200_Leather_Premium" },
    { label: "Golden Sand 2210", value: "GoldenSand_2210_Leather_Premium" },
    { label: "Soft Moon 2212", value: "SoftMoon_2212_Leather_Premium" },
    { label: "Cool Gray 2220", value: "CoolGray_2220_Leather_Premium" },
    { label: "Charcoal 2280", value: "Charcoal_2280_Leather_Premium" },
    { label: "Smoke Gray 2281", value: "SmokeGray_2281_Leather_Premium" },
    { label: "Carbon 2282", value: "Carbon_2282_Leather_Premium" },
    { label: "Stone 2319", value: "Stone_2319_Leather_Premium" },
    { label: "Night Blue 2327", value: "NightBlue_2327_Leather_Premium" },
    { label: "Deep Sea 2328", value: "DeepSea_2328_Leather_Premium" },
    { label: "Saddle Brown 2345", value: "SaddleBrown_2345_Leather_Premium" },
    { label: "Cognac 2352", value: "Cognac_2352_Leather_Premium" },
    { label: "Tuscan 2356", value: "Tuscan_2356_Leather_Premium" },
    { label: "Elephant 2360", value: "Elephant_2360_Leather_Premium" },
    { label: "Mink 2370", value: "Mink_2370_Leather_Premium" },
    { label: "Malachite 3206", value: "Malachite_3206_Leather_Premium" },
    { label: "Pine Green 3214", value: "PineGreen_3214_Leather_Premium" },
    { label: "Navy Blue 3215", value: "NavyBlue_3215_Leather_Premium" },
    { label: "Amarone 3216", value: "Amarone_3216_Leather_Premium" },
    { label: "Blood Orange 3217", value: "BloodOrange_3217_Leather_Premium" },
    { label: "Cherry Red 3218", value: "CherryRed_3218_Leather_Premium" },
    { label: "Bordeaux 3221", value: "Bordeaux_3221_Leather_Premium" },
    { label: "Purple Heart 3222", value: "PurpleHeart_3222_Leather_Premium" },
    { label: "Imperial Blue 3224", value: "ImperialBlue_3224_Leather_Premium" },
    { label: "Dark Brown 3226", value: "DarkBrown_3226_Leather_Premium" },
    { label: "Black Jet 3253", value: "BlackJet_3253_Leather_Premium" },
    { label: "Parchment 3277", value: "Parchment_3277_Leather_Premium" },
    { label: "Platinum 3288", value: "Platinum_3288_Leather_Premium" },
    { label: "Pewter 3290", value: "Pewter_3290_Leather_Premium" },
    { label: "Steel 3291", value: "Steel_3291_Leather_Premium" },
    { label: "Soft Gray 3292", value: "SoftGray_3292_Leather_Premium" },
    { label: "Cool Gray 3293", value: "CoolGray_3293_Leather_Premium" },
    { label: "Oat Meal 3296", value: "OatMeal_3296_Leather_Premium" },
    { label: "Light Brown 3297", value: "LightBrown_3297_Leather_Premium" },
    { label: "Biscuit 3298", value: "Biscuit_3298_Leather_Premium" },
    { label: "Caramel 3299", value: "Caramel_3299_Leather_Premium" },
    { label: "Mushroom 3300", value: "Mushroom_3300_Leather_Premium" },
    { label: "Chrome Gray 3301", value: "ChromeGray_3301_Leather_Premium" },
    { label: "Cashmere 3302", value: "Cashmere_3302_Leather_Premium" },
    { label: "Medium Gray 3303", value: "MediumGray_3303_Leather_Premium" },
    { label: "Titanium 3304", value: "Titanium_3304_Leather_Premium" },
    { label: "Graphite 3305", value: "Graphite_3305_Leather_Premium" },
    { label: "Black Onyx 3306", value: "BlackOnyx_3306_Leather_Premium" }
];

export const SEATBELTS_LIST = [
    { label: "Black Jet", value: "BlackJet_belt" },
    { label: "Chrome Gray", value: "ChromeGray_belt" },
    { label: "Oat Meal", value: "OatMeal_belt" },
    { label: "Soft Moon", value: "SoftMoon_belt" }
];

export const CENTRAL_SEAT_MATERIAL_LIST = [
    { label: "Cuir", value: "Leather_Premium" },
    { label: "Ultra-Suede", value: "Ultra-Suede_Premium" }
];

export const PERFORATED_SEAT_OPTIONS_LIST = [
    { label: "Sans perforation", value: "NoSeatPerforation_Premium" },
    { label: "Perforation centrale", value: "SeatCenterPerforation_Premium" }
];

// Matériaux et finitions (6 listes)
export const CARPET_LIST = [
    { label: "Charcoal Black", value: "CharcoalBlack_carpet_Premium" },
    { label: "Light Brown", value: "LightBrown_carpet_Premium" },
    { label: "Taupe Gray", value: "TaupeGray_carpet_Premium" }
];

export const TABLET_FINISH_LIST = [
    { label: "Carbon", value: "Carbon_table_wood_Premium" },
    { label: "Glossy Walnut", value: "GlossyWalnut_table_wood_Premium" },
    { label: "Koto Mat", value: "KotoMat_table_wood_Premium" },
    { label: "Sapelli Mat", value: "SapelliMat_table_wood_Premium" }
];

export const METAL_FINISH_LIST = [
    { label: "Brushed Stainless", value: "BrushedStainless_metal_Premium" },
    { label: "Flat Black", value: "FlatBlack_metal_Premium" },
    { label: "Gold", value: "Gold_metal_Premium" }
];

export const UPPER_SIDE_PANEL_LIST = SEAT_COVERS_LIST; // Réutilise la liste cuir

export const LOWER_SIDE_PANEL_LIST = SEAT_COVERS_LIST; // Réutilise la liste cuir

export const ULTRA_SUEDE_RIBBON_LIST = [
    { label: "Black Onyx 3368", value: "BlackOnyx_3368_Suede_Premium" },
    { label: "Bone 3386", value: "Bone_3386_Suede_Premium" },
    { label: "Elephant 3367", value: "Elephant_3367_Suede_Premium" },
    { label: "Mink 3369", value: "Mink_3369_Suede_Premium" },
    { label: "Oat Meal 3387", value: "OatMeal_3387_Suede_Premium" },
    { label: "White Sand 3388", value: "WhiteSand_3388_Suede_Premium" },
    { label: "Camel 3389", value: "Camel_3389_Suede_Premium" },
    { label: "Mushroom 3390", value: "Mushroom_3390_Suede_Premium" },
    { label: "Cashmere 3391", value: "Cashmere_3391_Suede_Premium" },
    { label: "Graphite 3392", value: "Graphite_3392_Suede_Premium" },
    { label: "Medium Gray 3393", value: "MediumGray_3393_Suede_Premium" },
    { label: "Chrome Gray 3394", value: "ChromeGray_3394_Suede_Premium" }
];

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
    perforatedSeatOptions: "NoSeatPerforation_Premium"
};
