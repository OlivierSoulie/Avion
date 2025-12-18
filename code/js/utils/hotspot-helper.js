/**
 * @fileoverview Helper pour extraction données hotspots
 * @module utils/hotspot-helper
 * @version 1.0
 */

import { getConfig } from '../state.js';
import { getExteriorColorZones } from '../api/index.js';

/**
 * Mapping des noms de zones du JSON vers les clés config
 */
const ZONE_NAME_MAP = {
    'Zone A': 'zoneA',
    'Zone B': 'zoneB',
    'Zone C': 'zoneC',
    'Zone D': 'zoneD',
    'Zone A+': 'zoneAPlus',
    'Zone A+ (WINGS)': 'zoneAPlus',
    'ZONE A': 'zoneA',
    'ZONE B': 'zoneB',
    'ZONE C': 'zoneC',
    'ZONE D': 'zoneD',
    'ZONE A+': 'zoneAPlus'
};

/**
 * Normalise le nom d'une zone depuis le JSON vers la clé config
 * @param {string} zoneName - Nom de la zone depuis le JSON (ex: "Zone A")
 * @returns {string|null} Clé de zone normalisée (ex: "zoneA") ou null si non reconnu
 */
export function normalizeZoneName(zoneName) {
    return ZONE_NAME_MAP[zoneName] || null;
}

/**
 * Récupère les données de couleur complètes pour une zone
 * @param {string} zoneName - Nom de la zone depuis le JSON (ex: "Zone A")
 * @returns {Promise<Object|null>} Objet avec {name, htmlColor, code} ou null si non trouvé
 */
export async function getZoneColorData(zoneName) {
    try {
        const config = getConfig();
        const normalizedZone = normalizeZoneName(zoneName);

        if (!normalizedZone) {
            return null;
        }

        // Récupérer le nom de couleur depuis la config (ex: config.zoneA = "CobaltBlue")
        const colorName = config[normalizedZone];

        if (!colorName) {
            return null;
        }

        // Récupérer toutes les couleurs depuis le XML
        const allZones = await getExteriorColorZones();
        const colorsForZone = allZones[normalizedZone];

        if (!colorsForZone || colorsForZone.length === 0) {
            return null;
        }

        // Chercher la couleur correspondante par nom
        const colorData = colorsForZone.find(c => c.name === colorName);

        if (!colorData) {
            return null;
        }

        return {
            name: colorData.name,           // Ex: "CobaltBlue"
            htmlColor: colorData.htmlColor, // Ex: "#282742" (Code HTML Lumiscaphe)
            code: colorData.code            // Ex: "05013"
        };

    } catch (error) {
        console.error(`Erreur extraction couleur pour ${zoneName}:`, error.message);
        return null;
    }
}

/**
 * Enrichit les hotspots du JSON avec les couleurs depuis la config actuelle
 * @param {Array<Object>} hotspots - Hotspots depuis le JSON [{name, description, position3D}]
 * @returns {Promise<Array<Object>>} Hotspots enrichis avec {name, description, position3D, colorHtml, colorName}
 */
export async function enrichHotspotsWithColors(hotspots) {
    const enrichedHotspots = [];

    for (const hotspot of hotspots) {
        const colorData = await getZoneColorData(hotspot.name);

        enrichedHotspots.push({
            ...hotspot,
            colorHtml: colorData?.htmlColor || '#000000',
            colorName: colorData?.name || 'Unknown'
        });
    }

    return enrichedHotspots;
}
