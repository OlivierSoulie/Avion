/**
 * @fileoverview Gestion des dropdowns (population)
 * @module ui/dropdown-manager
 * @version 1.0
 * @description Module dédié à la population des dropdowns de configuration
 */

import { getDatabaseXML, getExteriorOptionsFromXML, getInteriorOptionsFromXML } from '../api/index.js';
import { getConfig } from '../state.js';
import { populateDropdown, updateStyleDropdown } from '../utils/validators.js';

/**
 * Peuple tous les dropdowns de configuration depuis le XML
 * Appelé lors du changement de base de données
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Si le téléchargement du XML échoue
 */
export async function populateAllDropdowns() {

    try {
        const xmlDoc = await getDatabaseXML();
        const config = getConfig();

        // Extraire les options extérieur
        const exteriorOptions = getExteriorOptionsFromXML(xmlDoc);

        // Peupler les dropdowns extérieur
        populateDropdown('selectVersion', exteriorOptions.version, config.version);
        populateDropdown('selectPaintScheme', exteriorOptions.paintScheme, config.paintScheme);
        populateDropdown('selectPrestige', exteriorOptions.prestige, config.prestige);
        populateDropdown('selectSpinner', exteriorOptions.spinner, config.spinner);

        // US-051 : Logos (détection dynamique - RESET puis affichage conditionnel)
        const sectionLogoTBM = document.getElementById('sectionLogoTBM');
        const sectionLogo9xx = document.getElementById('sectionLogo9xx');

        // RESET : Toujours cacher les sections au début (important lors du changement de base)
        if (sectionLogoTBM) sectionLogoTBM.style.display = 'none';
        if (sectionLogo9xx) sectionLogo9xx.style.display = 'none';

        // Afficher uniquement si paramètres existent dans le XML
        if (exteriorOptions.logoTBM && exteriorOptions.logoTBM.length > 0) {
            sectionLogoTBM.style.display = '';
            populateDropdown('selectLogoTBM', exteriorOptions.logoTBM, config.logoTBM);
        }
        if (exteriorOptions.logo9xx && exteriorOptions.logo9xx.length > 0) {
            sectionLogo9xx.style.display = '';
            populateDropdown('selectLogo9xx', exteriorOptions.logo9xx, config.logo9xx);
        }

        populateDropdown('selectDecor', exteriorOptions.decor, config.decor);
        // Peupler aussi le dropdown décor de la section intérieur (synchronisé)
        populateDropdown('selectDecorInterior', exteriorOptions.decor, config.decor);

        // Mettre à jour le dropdown Style selon le type de police actuel
        updateStyleDropdown(config.fontType, exteriorOptions.styleSlanted, exteriorOptions.styleStraight);

        // Extraire les options intérieur
        const interiorOptions = getInteriorOptionsFromXML(xmlDoc);

        // Peupler les dropdowns intérieur
        populateDropdown('carpet', interiorOptions.carpet, config.carpet);
        populateDropdown('seat-covers', interiorOptions.seatCovers, config.seatCovers);
        populateDropdown('tablet-finish', interiorOptions.tabletFinish, config.tabletFinish);
        populateDropdown('seatbelts', interiorOptions.seatbelts, config.seatbelts);
        populateDropdown('metal-finish', interiorOptions.metalFinish, config.metalFinish);
        populateDropdown('upper-side-panel', interiorOptions.upperSidePanel, config.upperSidePanel);
        populateDropdown('lower-side-panel', interiorOptions.lowerSidePanel, config.lowerSidePanel);
        populateDropdown('ultra-suede-ribbon', interiorOptions.ultraSuedeRibbon, config.ultraSuedeRibbon);
        populateDropdown('stitching', interiorOptions.stitching, config.stitching);

    } catch (error) {
        console.error('❌ Erreur peuplement dropdowns:', error);
        throw error;
    }
}
