/**
 * @fileoverview Event listeners pour les dropdowns de configuration
 * @module ui/events/config-events
 * @version 1.0
 * @description Gère les dropdowns de configuration (version, paintScheme, prestige, decor, spinner)
 */

import { updateConfig, getConfig } from '../../state.js';
import { getDatabaseXML, getInteriorPrestigeConfig as parsePrestigeConfig } from '../../api/index.js';
import { syncZonesWithPaintScheme } from '../color-manager.js';
import { showError, hideError } from '../loader.js';

/**
 * US-034: Met à jour l'immatriculation par défaut selon le modèle
 * @param {string} version - Version du modèle (ex: "Version_TBM960")
 */
function updateDefaultImmatFromModel(version) {
    const config = getConfig();

    // Si l'utilisateur n'a pas personnalisé l'immatriculation
    if (!config.hasCustomImmat) {
        const inputImmat = document.getElementById('inputImmat');

        if (version.includes('960')) {
            updateConfig('immat', 'N960TB');
            if (inputImmat) inputImmat.value = 'N960TB';
        } else if (version.includes('980')) {
            updateConfig('immat', 'N980TB');
            if (inputImmat) inputImmat.value = 'N980TB';
        }
    }
}

/**
 * Attache les event listeners pour les dropdowns de configuration
 * @returns {void}
 */
export function attachConfigEvents() {
    // Dropdown Modèle Avion (version)
    const selectVersion = document.getElementById('selectVersion');
    if (selectVersion) {
        selectVersion.addEventListener('change', (e) => {
            updateConfig('version', e.target.value);
            updateDefaultImmatFromModel(e.target.value); // US-034: Mettre à jour immat par défaut
            window.triggerRender(); // US-005: Appel API automatique
        });
    }

    // Dropdown Schéma Peinture
    const selectPaintScheme = document.getElementById('selectPaintScheme');
    if (selectPaintScheme) {
        selectPaintScheme.addEventListener('change', async (e) => {
            const schemeValue = e.target.value; // Valeur complète : "Tehuano_6_B-0_..."
            updateConfig('paintScheme', schemeValue);

            // Synchroniser les zones de couleurs avec le schéma
            // Extraire le nom court pour chercher le bookmark
            // V0.2-V0.5 : "Tehuano_B-0_..." → "Tehuano"
            // V0.6+     : "Tehuano_6_B-0_..." → "Tehuano"
            const schemeName = schemeValue.split('_')[0];
            await syncZonesWithPaintScheme(schemeName);

            window.triggerRender(); // US-005: Appel API automatique
        });
    }

    // Dropdown Intérieur (prestige)
    // US-027 : Modifié pour parser le XML et mettre à jour les 10 dropdowns
    const selectPrestige = document.getElementById('selectPrestige');
    if (selectPrestige) {
        selectPrestige.addEventListener('change', async (e) => {
            const prestigeName = e.target.value;

            updateConfig('prestige', prestigeName);

            try {
                // 1. Télécharger le XML
                const xmlDoc = await getDatabaseXML();

                // 2. Parser la config du prestige
                const prestigeConfig = parsePrestigeConfig(xmlDoc, prestigeName);

                // 3. Mettre à jour l'état
                updateConfig('carpet', prestigeConfig.carpet);
                updateConfig('seatCovers', prestigeConfig.seatCovers);
                updateConfig('tabletFinish', prestigeConfig.tabletFinish);
                updateConfig('seatbelts', prestigeConfig.seatbelts);
                updateConfig('metalFinish', prestigeConfig.metalFinish);
                updateConfig('upperSidePanel', prestigeConfig.upperSidePanel);
                updateConfig('lowerSidePanel', prestigeConfig.lowerSidePanel);
                updateConfig('ultraSuedeRibbon', prestigeConfig.ultraSuedeRibbon);
                updateConfig('stitching', prestigeConfig.stitching); // US-036
                updateConfig('centralSeatMaterial', prestigeConfig.centralSeatMaterial);
                updateConfig('perforatedSeatOptions', prestigeConfig.perforatedSeatOptions);

                // 4. Mettre à jour les dropdowns visuellement

                const carpetSelect = document.getElementById('carpet');
                const seatCoversSelect = document.getElementById('seat-covers');
                const tabletFinishSelect = document.getElementById('tablet-finish');
                const seatbeltsSelect = document.getElementById('seatbelts');
                const metalFinishSelect = document.getElementById('metal-finish');
                const upperSidePanelSelect = document.getElementById('upper-side-panel');
                const lowerSidePanelSelect = document.getElementById('lower-side-panel');
                const ultraSuedeRibbonSelect = document.getElementById('ultra-suede-ribbon');
                const stitchingSelect = document.getElementById('stitching'); // US-036

                if (carpetSelect) carpetSelect.value = prestigeConfig.carpet;
                if (seatCoversSelect) seatCoversSelect.value = prestigeConfig.seatCovers;
                if (tabletFinishSelect) tabletFinishSelect.value = prestigeConfig.tabletFinish;
                if (seatbeltsSelect) seatbeltsSelect.value = prestigeConfig.seatbelts;
                if (metalFinishSelect) metalFinishSelect.value = prestigeConfig.metalFinish;
                if (upperSidePanelSelect) upperSidePanelSelect.value = prestigeConfig.upperSidePanel;
                if (lowerSidePanelSelect) lowerSidePanelSelect.value = prestigeConfig.lowerSidePanel;
                if (ultraSuedeRibbonSelect) ultraSuedeRibbonSelect.value = prestigeConfig.ultraSuedeRibbon;
                if (stitchingSelect) stitchingSelect.value = prestigeConfig.stitching; // US-036


                // Mettre à jour les radio buttons perforation
                const perforatedRadios = document.querySelectorAll('input[name="perforated-seat"]');
                perforatedRadios.forEach(radio => {
                    if (radio.value === prestigeConfig.perforatedSeatOptions) {
                        radio.checked = true;
                    }
                });

                // US-037 : Mettre à jour les toggle buttons central-seat-material
                const btnCentralSeatSuede = document.getElementById('btnCentralSeatSuede');
                const btnCentralSeatCuir = document.getElementById('btnCentralSeatCuir');

                if (btnCentralSeatSuede && btnCentralSeatCuir) {
                    if (prestigeConfig.centralSeatMaterial === 'Ultra-Suede_Premium') {
                        btnCentralSeatSuede.classList.add('active');
                        btnCentralSeatCuir.classList.remove('active');
                    } else if (prestigeConfig.centralSeatMaterial === 'Leather_Premium') {
                        btnCentralSeatCuir.classList.add('active');
                        btnCentralSeatSuede.classList.remove('active');
                    }
                }


                // 5. Réinitialiser le hash pour forcer la regénération de la vue Configuration
                window.lastConfigHash = null;

                // 6. Déclencher nouveau rendu
                window.triggerRender();

            } catch (error) {
                console.error('❌ Erreur parsing prestige:', error);
                showError('Erreur lors du chargement du prestige');
                setTimeout(() => hideError(), 3000);
                // Quand même déclencher le rendu avec les valeurs par défaut
                window.triggerRender();
            }
        });
    }

    // Dropdown Décor (Extérieur)
    const selectDecor = document.getElementById('selectDecor');
    if (selectDecor) {
        selectDecor.addEventListener('change', (e) => {
            updateConfig('decor', e.target.value);

            // Synchroniser le dropdown décor de la section intérieur
            const selectDecorInterior = document.getElementById('selectDecorInterior');
            if (selectDecorInterior) selectDecorInterior.value = e.target.value;

            window.triggerRender(); // US-005: Appel API automatique
        });
    }

    // Dropdown Décor (Intérieur) - Synchronisé avec Extérieur
    const selectDecorInterior = document.getElementById('selectDecorInterior');
    if (selectDecorInterior) {
        selectDecorInterior.addEventListener('change', (e) => {
            updateConfig('decor', e.target.value);

            // Synchroniser le dropdown décor de la section extérieur
            const selectDecor = document.getElementById('selectDecor');
            if (selectDecor) selectDecor.value = e.target.value;

            window.triggerRender(); // US-005: Appel API automatique
        });
    }

    // Dropdown Hélice (spinner)
    const selectSpinner = document.getElementById('selectSpinner');
    if (selectSpinner) {
        selectSpinner.addEventListener('change', (e) => {
            updateConfig('spinner', e.target.value);
            window.triggerRender(); // US-005: Appel API automatique
        });
    }
}
