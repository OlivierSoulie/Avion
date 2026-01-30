/**
 * @fileoverview Gestion de l'état global de l'application
 * @module state
 * @version 2.0
 * @description Toutes les valeurs de configuration viennent du XML via loadDefaultConfigFromXML()
 */

import { IMAGE_WIDTH, IMAGE_HEIGHT } from './config.js';

// ======================================
// État global de l'application
// Toutes les valeurs sont initialisées à null et chargées depuis le XML
// ======================================

const state = {
    // Configuration actuelle - TOUTES les valeurs viennent du XML
    config: {
        // Extérieur (chargé depuis XML)
        version: null,
        paintScheme: null,
        prestige: null,
        decor: null,
        spinner: null,
        logoTBM: null,
        logo9xx: null,

        // Immatriculation (valeurs par défaut car pas dans XML)
        fontType: "slanted",
        style: "A",
        immat: "N960TB",
        hasCustomImmat: false,

        // Dimensions images (constantes techniques)
        imageWidth: IMAGE_WIDTH,
        imageHeight: IMAGE_HEIGHT,

        // Vue (état UI)
        viewType: "exterior",

        // Toggles (chargés depuis XML)
        sunglass: null,
        tablet: null,
        doorPilot: null,
        doorPassenger: null,
        moodLights: null,
        lightingCeiling: null,

        // Intérieur (chargé depuis XML via prestige)
        carpet: null,
        seatCovers: null,
        tabletFinish: null,
        seatbelts: null,
        metalFinish: null,
        upperSidePanel: null,
        lowerSidePanel: null,
        ultraSuedeRibbon: null,
        centralSeatMaterial: null,
        stitching: null,
        perforatedSeatOptions: null,

        // Zones de couleurs (chargées depuis XML)
        zoneA: null,
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

    // Dernier payload envoyé à l'API
    lastPayload: null,

    // Dernier payload Hotspot envoyé à l'API
    lastHotspotPayload: null,

    // Payloads PDF caméra 0
    pdfCamera0SnapshotPayload: null,
    pdfCamera0HotspotPayload: null
};

// ======================================
// Getters
// ======================================

export function getState() {
    return state;
}

export function getConfig() {
    return state.config;
}

export function getImages() {
    return state.images;
}

export function getCurrentImageIndex() {
    return state.currentImageIndex;
}

export function isLoading() {
    return state.loading;
}

export function getError() {
    return state.error;
}

export function getLastPayload() {
    return state.lastPayload;
}

export function getLastHotspotPayload() {
    return state.lastHotspotPayload;
}

export function getSunGlass() {
    return state.config.sunglass;
}

export function getTablet() {
    return state.config.tablet;
}

export function getDoorPilot() {
    return state.config.doorPilot;
}

export function getDoorPassenger() {
    return state.config.doorPassenger;
}

export function getCarpet() {
    return state.config.carpet;
}

export function getSeatCovers() {
    return state.config.seatCovers;
}

export function getTabletFinish() {
    return state.config.tabletFinish;
}

export function getSeatbelts() {
    return state.config.seatbelts;
}

export function getMetalFinish() {
    return state.config.metalFinish;
}

export function getUpperSidePanel() {
    return state.config.upperSidePanel;
}

export function getLowerSidePanel() {
    return state.config.lowerSidePanel;
}

export function getUltraSuedeRibbon() {
    return state.config.ultraSuedeRibbon;
}

export function getCentralSeatMaterial() {
    return state.config.centralSeatMaterial;
}

export function getPerforatedSeatOptions() {
    return state.config.perforatedSeatOptions;
}

export function getViewType() {
    return state.config.viewType;
}

// ======================================
// Setters
// ======================================

export function updateConfig(key, value) {
    if (state.config.hasOwnProperty(key)) {
        state.config[key] = value;
    } else {
        console.warn(`La clé "${key}" n'existe pas dans la configuration`);
    }
}

export function setConfig(newConfig) {
    state.config = { ...state.config, ...newConfig };
}

export function setImages(images) {
    state.images = images;
    state.currentImageIndex = 0;
}

export function setCurrentImageIndex(index) {
    if (index >= 0 && index < state.images.length) {
        state.currentImageIndex = index;
    } else {
        console.warn(`Index ${index} hors limites (0-${state.images.length - 1})`);
    }
}

export function setLoading(isLoading) {
    state.loading = isLoading;
}

export function setError(error) {
    state.error = error;
}

export function setLastPayload(payload) {
    state.lastPayload = payload;
}

export function setLastHotspotPayload(payload) {
    state.lastHotspotPayload = payload;
}

export function getPDFCamera0SnapshotPayload() {
    return state.pdfCamera0SnapshotPayload;
}

export function setPDFCamera0SnapshotPayload(payload) {
    state.pdfCamera0SnapshotPayload = payload;
}

export function getPDFCamera0HotspotPayload() {
    return state.pdfCamera0HotspotPayload;
}

export function setPDFCamera0HotspotPayload(payload) {
    state.pdfCamera0HotspotPayload = payload;
}

export function saveLastValidConfig() {
    state.lastValidConfig = { ...state.config };
}

export function restoreLastValidConfig() {
    if (state.lastValidConfig) {
        state.config = { ...state.lastValidConfig };
    }
}

// ======================================
// Utilitaires
// ======================================

export function areConfigsEqual(config1, config2) {
    if (!config1 || !config2) return false;
    const keys1 = Object.keys(config1);
    const keys2 = Object.keys(config2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => config1[key] === config2[key]);
}

export function hashConfig(config) {
    return JSON.stringify(config);
}
