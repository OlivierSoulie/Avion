/**
 * @fileoverview Gestion de l'état global de l'application
 * @module state
 * @version 1.0
 */

import { DEFAULT_CONFIG } from './config.js';

// ======================================
// État global de l'application
// ======================================

const state = {
    // Configuration actuelle
    config: {
        version: DEFAULT_CONFIG.version,
        paintScheme: DEFAULT_CONFIG.paintScheme,
        prestige: DEFAULT_CONFIG.prestige,
        decor: DEFAULT_CONFIG.decor,
        spinner: DEFAULT_CONFIG.spinner,
        logoTBM: DEFAULT_CONFIG.logoTBM,     // US-051
        logo9xx: DEFAULT_CONFIG.logo9xx,     // US-051
        fontType: DEFAULT_CONFIG.fontType,
        style: DEFAULT_CONFIG.style,
        immat: DEFAULT_CONFIG.immat,
        hasCustomImmat: false, // US-034: Flag pour tracker si user a customisé l'immat
        imageWidth: DEFAULT_CONFIG.imageWidth,
        imageHeight: DEFAULT_CONFIG.imageHeight,
        viewType: "exterior", // US-022: "exterior" ou "interior"
        sunglass: DEFAULT_CONFIG.sunglass, // US-024: Lunettes de soleil
        tablet: DEFAULT_CONFIG.tablet, // US-023: Tablette
        doorPilot: DEFAULT_CONFIG.doorPilot, // US-025: Porte pilote
        doorPassenger: DEFAULT_CONFIG.doorPassenger, // US-026: Porte passager

        // US-027 : Configuration intérieur personnalisée
        carpet: DEFAULT_CONFIG.carpet,
        seatCovers: DEFAULT_CONFIG.seatCovers,
        tabletFinish: DEFAULT_CONFIG.tabletFinish,
        seatbelts: DEFAULT_CONFIG.seatbelts,
        metalFinish: DEFAULT_CONFIG.metalFinish,
        upperSidePanel: DEFAULT_CONFIG.upperSidePanel,
        lowerSidePanel: DEFAULT_CONFIG.lowerSidePanel,
        ultraSuedeRibbon: DEFAULT_CONFIG.ultraSuedeRibbon,
        centralSeatMaterial: DEFAULT_CONFIG.centralSeatMaterial,
        stitching: DEFAULT_CONFIG.stitching, // US-036
        perforatedSeatOptions: DEFAULT_CONFIG.perforatedSeatOptions,

        // Zones de couleurs personnalisées
        zoneA: null,  // Sera initialisé depuis le XML
        zoneB: null,
        zoneC: null,
        zoneD: null,
        zoneAPlus: null
    },

    // Images du carrousel
    images: [],

    // Index de l'image courante
    currentImageIndex: 0,

    // État de chargement
    loading: false,

    // Erreur éventuelle
    error: null,

    // Dernière configuration valide (pour retry)
    lastValidConfig: null,

    // US-021 : Dernier payload envoyé à l'API (pour téléchargement JSON)
    lastPayload: null,

    // US-051 : Dernier payload Hotspot envoyé à l'API (pour téléchargement JSON)
    lastHotspotPayload: null,

    // US-052 : Payloads PDF caméra 0 (16:9) pour téléchargement JSON
    pdfCamera0SnapshotPayload: null,
    pdfCamera0HotspotPayload: null
};

// ======================================
// Getters
// ======================================

/**
 * Retourne l'état complet
 * @returns {Object} L'état global
 */
export function getState() {
    return state;
}

/**
 * Retourne la configuration actuelle
 * @returns {Object} La configuration
 */
export function getConfig() {
    return state.config;
}

/**
 * Retourne les images
 * @returns {Array} Les URLs des images
 */
export function getImages() {
    return state.images;
}

/**
 * Retourne l'index de l'image courante
 * @returns {number} L'index
 */
export function getCurrentImageIndex() {
    return state.currentImageIndex;
}

/**
 * Retourne l'état de chargement
 * @returns {boolean} True si en chargement
 */
export function isLoading() {
    return state.loading;
}

/**
 * Retourne l'erreur actuelle
 * @returns {string|null} Le message d'erreur ou null
 */
export function getError() {
    return state.error;
}

/**
 * US-021 : Retourne le dernier payload envoyé à l'API
 * @returns {Object|null} Le payload ou null
 */
export function getLastPayload() {
    return state.lastPayload;
}

/**
 * US-051 : Retourne le dernier payload Hotspot envoyé à l'API
 * @returns {Object|null} Le payload Hotspot ou null
 */
export function getLastHotspotPayload() {
    return state.lastHotspotPayload;
}

/**
 * US-024 : Retourne l'état des lunettes de soleil
 * @returns {string} "SunGlassON" ou "SunGlassOFF"
 */
export function getSunGlass() {
    return state.config.sunglass;
}

/**
 * US-023 : Retourne l'état de la tablette
 * @returns {string} "Open" ou "Closed"
 */
export function getTablet() {
    return state.config.tablet;
}

/**
 * US-025 : Retourne l'état de la porte pilote
 * @returns {string} "Open" ou "Closed"
 */
export function getDoorPilot() {
    return state.config.doorPilot;
}

/**
 * US-026 : Retourne l'état de la porte passager
 * @returns {string} "Open" ou "Closed"
 */
export function getDoorPassenger() {
    return state.config.doorPassenger;
}

/**
 * US-027 : Retourne le tapis sélectionné
 * @returns {string} Ex: "LightBrown_carpet_Premium"
 */
export function getCarpet() {
    return state.config.carpet;
}

/**
 * US-027 : Retourne le cuir des sièges
 * @returns {string} Ex: "BeigeGray_2176_Leather_Premium"
 */
export function getSeatCovers() {
    return state.config.seatCovers;
}

/**
 * US-027 : Retourne la finition bois de la tablette
 * @returns {string} Ex: "SapelliMat_table_wood_Premium"
 */
export function getTabletFinish() {
    return state.config.tabletFinish;
}

/**
 * US-027 : Retourne la couleur des ceintures
 * @returns {string} Ex: "OatMeal_belt"
 */
export function getSeatbelts() {
    return state.config.seatbelts;
}

/**
 * US-027 : Retourne la finition métallique
 * @returns {string} Ex: "BrushedStainless_metal_Premium"
 */
export function getMetalFinish() {
    return state.config.metalFinish;
}

/**
 * US-027 : Retourne le cuir du panneau latéral supérieur
 * @returns {string} Ex: "WhiteSand_2192_Leather_Premium"
 */
export function getUpperSidePanel() {
    return state.config.upperSidePanel;
}

/**
 * US-027 : Retourne le cuir du panneau latéral inférieur
 * @returns {string} Ex: "BeigeGray_2176_Leather_Premium"
 */
export function getLowerSidePanel() {
    return state.config.lowerSidePanel;
}

/**
 * US-027 : Retourne la couleur du ruban Ultra-Suede
 * @returns {string} Ex: "Elephant_3367_Suede_Premium"
 */
export function getUltraSuedeRibbon() {
    return state.config.ultraSuedeRibbon;
}

/**
 * US-027 : Retourne le matériau du siège central
 * @returns {string} Ex: "Leather_Premium" ou "Ultra-Suede_Premium"
 */
export function getCentralSeatMaterial() {
    return state.config.centralSeatMaterial;
}

/**
 * US-027 : Retourne les options de perforation des sièges
 * @returns {string} Ex: "NoSeatPerforation_Premium" ou "SeatCenterPerforation_Premium"
 */
export function getPerforatedSeatOptions() {
    return state.config.perforatedSeatOptions;
}

/**
 * US-022 : Retourne le type de vue actuel
 * @returns {string} "exterior" ou "interior"
 */
export function getViewType() {
    return state.config.viewType;
}

// ======================================
// Setters
// ======================================

/**
 * Met à jour un paramètre de configuration
 * @param {string} key - La clé du paramètre
 * @param {*} value - La nouvelle valeur
 */
export function updateConfig(key, value) {
    if (state.config.hasOwnProperty(key)) {
        state.config[key] = value;
    } else {
        console.warn(`La clé "${key}" n'existe pas dans la configuration`);
    }
}

/**
 * Met à jour toute la configuration
 * @param {Object} newConfig - La nouvelle configuration
 */
export function setConfig(newConfig) {
    state.config = { ...state.config, ...newConfig };
}

/**
 * Réinitialise la configuration aux valeurs par défaut
 */
export function resetConfig() {
    state.config = { ...DEFAULT_CONFIG };
}

/**
 * Met à jour les images du carrousel
 * @param {Array} images - Les URLs des images
 */
export function setImages(images) {
    state.images = images;
    state.currentImageIndex = 0; // Reset à la première image
}

/**
 * Met à jour l'index de l'image courante
 * @param {number} index - Le nouvel index
 */
export function setCurrentImageIndex(index) {
    if (index >= 0 && index < state.images.length) {
        state.currentImageIndex = index;
    } else {
        console.warn(`Index ${index} hors limites (0-${state.images.length - 1})`);
    }
}

/**
 * Met à jour l'état de chargement
 * @param {boolean} isLoading - True si en chargement
 */
export function setLoading(isLoading) {
    state.loading = isLoading;
}

/**
 * Met à jour l'erreur
 * @param {string|null} error - Le message d'erreur ou null
 */
export function setError(error) {
    state.error = error;
}

/**
 * US-021 : Sauvegarde le payload envoyé à l'API
 * @param {Object} payload - Le payload JSON
 */
export function setLastPayload(payload) {
    state.lastPayload = payload;
}

/**
 * US-051 : Sauvegarde le payload Hotspot envoyé à l'API
 * @param {Object} payload - Le payload Hotspot JSON
 */
export function setLastHotspotPayload(payload) {
    state.lastHotspotPayload = payload;
}

/**
 * US-052 : Retourne le payload Snapshot de la caméra 0 PDF
 * @returns {Object|null} Le payload Snapshot caméra 0
 */
export function getPDFCamera0SnapshotPayload() {
    return state.pdfCamera0SnapshotPayload;
}

/**
 * US-052 : Sauvegarde le payload Snapshot de la caméra 0 PDF
 * @param {Object} payload - Le payload Snapshot
 */
export function setPDFCamera0SnapshotPayload(payload) {
    state.pdfCamera0SnapshotPayload = payload;
}

/**
 * US-052 : Retourne le payload Hotspot de la caméra 0 PDF
 * @returns {Object|null} Le payload Hotspot caméra 0
 */
export function getPDFCamera0HotspotPayload() {
    return state.pdfCamera0HotspotPayload;
}

/**
 * US-052 : Sauvegarde le payload Hotspot de la caméra 0 PDF
 * @param {Object} payload - Le payload Hotspot
 */
export function setPDFCamera0HotspotPayload(payload) {
    state.pdfCamera0HotspotPayload = payload;
}

/**
 * Sauvegarde la configuration actuelle comme dernière config valide
 */
export function saveLastValidConfig() {
    state.lastValidConfig = { ...state.config };
}

/**
 * Restaure la dernière configuration valide
 */
export function restoreLastValidConfig() {
    if (state.lastValidConfig) {
        state.config = { ...state.lastValidConfig };
    }
}

// ======================================
// Utilitaires
// ======================================

/**
 * Compare deux configurations pour voir si elles sont identiques
 * @param {Object} config1 - Première configuration
 * @param {Object} config2 - Deuxième configuration
 * @returns {boolean} True si identiques
 */
export function areConfigsEqual(config1, config2) {
    if (!config1 || !config2) return false;

    const keys1 = Object.keys(config1);
    const keys2 = Object.keys(config2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => config1[key] === config2[key]);
}

/**
 * Génère un hash de la configuration pour détection de changements
 * @param {Object} config - La configuration
 * @returns {string} Le hash
 */
export function hashConfig(config) {
    return JSON.stringify(config);
}
