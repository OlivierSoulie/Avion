/**
 * @fileoverview Parser pour les chaînes de configuration XML
 * @module api/config-parser
 * @version 1.0
 * @description Module dédié au parsing des chaînes de configuration par défaut du XML
 */

/**
 * Parse une chaîne de configuration par défaut du XML
 * Format: "Version.XXX/Exterior_PaintScheme.YYY/Position.ZZZ/Decor.AAA/..."
 *
 * @param {string} configString - Chaîne de configuration à parser
 * @returns {Object} Configuration parsée avec clés: version, paintScheme, prestige, decor, spinner, stitching
 *
 * @example
 * const config = parseDefaultConfigString('Version.TBM960/Exterior_PaintScheme.Zephir_A-0_.../Position.Studio/...');
 * // Retourne: { version: 'TBM960', paintScheme: 'Zephir_A-0_...', decor: 'Studio', ... }
 */
export function parseDefaultConfigString(configString) {

    const config = {};
    const parts = configString.split('/');


    for (const part of parts) {

        if (part.startsWith('Version.')) {
            config.version = part.replace('Version.', '');
        } else if (part.startsWith('Exterior_PaintScheme.')) {
            // Prendre la valeur complète après "Exterior_PaintScheme."
            const fullValue = part.replace('Exterior_PaintScheme.', '');
            config.paintScheme = fullValue;
        } else if (part.startsWith('Interior_PrestigeSelection.')) {
            const fullValue = part.replace('Interior_PrestigeSelection.', '');
            config.prestige = fullValue.split('_')[0];
        } else if (part.startsWith('Position.')) {
            config.decor = part.replace('Position.', '');
        } else if (part.startsWith('Decor.')) {
            // Extraire le nom du décor (avant _Ground ou _Flight)
            const decorFull = part.replace('Decor.', '');
            config.decor = decorFull.split('_')[0];
        } else if (part.startsWith('Exterior_Spinner.')) {
            config.spinner = part.replace('Exterior_Spinner.', '');
        } else if (part.startsWith('Exterior_Logo_TBM.')) {  // US-051
            config.logoTBM = part.replace('Exterior_Logo_TBM.', '');
        } else if (part.startsWith('Exterior_Logo_9xx.')) {  // US-051
            config.logo9xx = part.replace('Exterior_Logo_9xx.', '');
        } else if (part.startsWith('Interior_Stitching.')) {
            config.stitching = part.replace('Interior_Stitching.', '');
        }
        // US-053/US-054 : Toggles extraits du XML
        else if (part.startsWith('SunGlass.')) {
            config.sunglass = part.replace('SunGlass.', '');
        } else if (part.startsWith('Tablet.')) {
            config.tablet = part.replace('Tablet.', '');
        } else if (part.startsWith('Door_pilot.')) {
            config.doorPilot = part.replace('Door_pilot.', '');
        } else if (part.startsWith('Door_passenger.')) {
            config.doorPassenger = part.replace('Door_passenger.', '');
        } else if (part.startsWith('Lighting_mood.')) {
            config.moodLights = part.replace('Lighting_mood.', '');
        } else if (part.startsWith('Lighting_Ceiling.') || part.startsWith('Lighting_ceiling.')) {
            config.lightingCeiling = part.replace(/Lighting_[Cc]eiling\./, '');
        }
        // Paramètres intérieur (10 paramètres)
        else if (part.startsWith('Interior_Carpet.')) {
            config.carpet = part.replace('Interior_Carpet.', '');
        } else if (part.startsWith('Interior_SeatCovers.')) {
            config.seatCovers = part.replace('Interior_SeatCovers.', '');
        } else if (part.startsWith('Interior_TabletFinish.')) {
            config.tabletFinish = part.replace('Interior_TabletFinish.', '');
        } else if (part.startsWith('Interior_Seatbelts.')) {
            config.seatbelts = part.replace('Interior_Seatbelts.', '');
        } else if (part.startsWith('Interior_MetalFinish.')) {
            config.metalFinish = part.replace('Interior_MetalFinish.', '');
        } else if (part.startsWith('Interior_UpperSidePanel.')) {
            config.upperSidePanel = part.replace('Interior_UpperSidePanel.', '');
        } else if (part.startsWith('Interior_LowerSidePanel.')) {
            config.lowerSidePanel = part.replace('Interior_LowerSidePanel.', '');
        } else if (part.startsWith('Interior_Ultra-SuedeRibbon.')) {
            config.ultraSuedeRibbon = part.replace('Interior_Ultra-SuedeRibbon.', '');
        } else if (part.startsWith('Interior_CentralSeatMaterial.')) {
            config.centralSeatMaterial = part.replace('Interior_CentralSeatMaterial.', '');
        } else if (part.startsWith('Interior_PerforatedSeatOptions.')) {
            config.perforatedSeatOptions = part.replace('Interior_PerforatedSeatOptions.', '');
        }
    }

    return config;
}
