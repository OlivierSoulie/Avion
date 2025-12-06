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
    getExteriorColorZones
} from './xml-parser.js';

// ======================================
// Re-export API Client
// ======================================
export {
    setDatabaseId,
    getDatabaseId,
    setLastPayload,
    getLastPayload,
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
    fetchRenderImages
} from './rendering.js';

// ======================================
// Re-export Configuration
// ======================================
export {
    fetchConfigurationImages
} from './configuration.js';
