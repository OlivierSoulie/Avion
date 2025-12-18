/**
 * @fileoverview Point d'entrée du module API
 * @module api
 * @version 1.0
 */

// ======================================
// Re-export XML Parser
// ======================================
export {
    getDatabaseXML,
    invalidateXMLCache,
    findCameraGroupId,
    getCameraListFromGroup,
    getCameraSensorInfo,
    getConfigFromLabel,
    findColorDataInXML,
    extractParameterOptions,
    getExteriorOptionsFromXML,
    getInteriorOptionsFromXML,
    getInteriorPrestigeConfig,
    getDefaultConfig,
    fetchDatabases,
    parseColorString,
    parsePaintSchemeBookmark,
    getExteriorColorZones,
    validateConfigForDatabase, // US-040
    getPDFCameraId // PDF View : récupération caméra dynamique
} from './xml-parser.js';

// ======================================
// Re-export API Client
// ======================================
export {
    setDatabaseId,
    getDatabaseId,
    callLumiscapheAPI,
    downloadImages
} from './api-client.js';

// ======================================
// Re-export Payload Builder
// ======================================
export {
    buildPayload,
    buildPayloadForSingleCamera,
    buildConfigString
} from './payload-builder.js';

// ======================================
// Re-export Rendering
// ======================================
export {
    fetchRenderImages,
    fetchOverviewImages // US-044
} from './rendering.js';

// ======================================
// Re-export Configuration
// ======================================
export {
    fetchConfigurationImages
} from './configuration.js';

// ======================================
// Re-export Hotspot
// ======================================
export {
    callHotspotAPI,
    buildHotspotPayload
} from './hotspot.js';

// ======================================
// Re-export PDF Generation
// ======================================
export {
    generatePDFView
} from './pdf-generation.js';
