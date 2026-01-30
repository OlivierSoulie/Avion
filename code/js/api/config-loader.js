/**
 * @fileoverview Chargement de la configuration par défaut depuis le XML
 * @module api/config-loader
 * @version 1.1
 * @description Module dédié au chargement et application de la configuration par défaut d'une base
 *              US-053/US-054 : Charge aussi les options des toggles depuis le XML
 */

import { parseDefaultConfigString } from './config-parser.js';
import { getDefaultConfig, getDatabaseXML, findPrestigeFromInteriorConfig } from './index.js';
import { updateConfig } from '../state.js';
import { syncZonesWithPaintScheme } from '../ui/color-manager.js';
import { populateAllDropdowns } from '../ui/index.js';
import { checkViewAvailability, checkActionButtonsAvailability, checkConfigFieldsAvailability } from '../utils/validators.js';

/**
 * Charge la configuration par défaut depuis le XML et met à jour l'interface
 * Appelé lors du changement de base de données
 *
 * Workflow:
 * 1. Recharge les dropdowns depuis le nouveau XML
 * 2. Récupère la configuration par défaut (bookmark Tehuano_export)
 * 3. Parse la chaîne de configuration
 * 4. Met à jour le state
 * 5. Met à jour les valeurs des dropdowns
 * 6. Synchronise les zones de couleurs
 * 7. Vérifie la disponibilité des vues/boutons/champs (US-040)
 *
 * @async
 * @returns {Promise<boolean>} true si chargement réussi, false sinon
 *
 * @example
 * const success = await loadDefaultConfigFromXML();
 */
export async function loadDefaultConfigFromXML() {

    try {
        // D'abord recharger les options des dropdowns depuis le nouveau XML
        await populateAllDropdowns();

        const defaultConfigString = await getDefaultConfig();

        if (!defaultConfigString) {
            console.warn('⚠️ Pas de config par défaut dans le XML, utilisation des valeurs hardcodées');
            return false;
        }

        // Parser la config string
        const parsedConfig = parseDefaultConfigString(defaultConfigString);

        // Mettre à jour le state avec les valeurs parsées
        if (parsedConfig.version) updateConfig('version', parsedConfig.version);
        if (parsedConfig.paintScheme) updateConfig('paintScheme', parsedConfig.paintScheme);
        if (parsedConfig.prestige) updateConfig('prestige', parsedConfig.prestige);
        if (parsedConfig.decor) updateConfig('decor', parsedConfig.decor);
        if (parsedConfig.spinner) updateConfig('spinner', parsedConfig.spinner);
        if (parsedConfig.stitching) updateConfig('stitching', parsedConfig.stitching);

        // US-053/US-054 : Toggles extraits du XML
        if (parsedConfig.sunglass) updateConfig('sunglass', parsedConfig.sunglass);
        if (parsedConfig.tablet) updateConfig('tablet', parsedConfig.tablet);
        if (parsedConfig.doorPilot) updateConfig('doorPilot', parsedConfig.doorPilot);
        if (parsedConfig.doorPassenger) updateConfig('doorPassenger', parsedConfig.doorPassenger);
        if (parsedConfig.moodLights) updateConfig('moodLights', parsedConfig.moodLights);
        if (parsedConfig.lightingCeiling) updateConfig('lightingCeiling', parsedConfig.lightingCeiling);

        // Paramètres intérieur extraits du XML
        if (parsedConfig.carpet) updateConfig('carpet', parsedConfig.carpet);
        if (parsedConfig.seatCovers) updateConfig('seatCovers', parsedConfig.seatCovers);
        if (parsedConfig.tabletFinish) updateConfig('tabletFinish', parsedConfig.tabletFinish);
        if (parsedConfig.seatbelts) updateConfig('seatbelts', parsedConfig.seatbelts);
        if (parsedConfig.metalFinish) updateConfig('metalFinish', parsedConfig.metalFinish);
        if (parsedConfig.upperSidePanel) updateConfig('upperSidePanel', parsedConfig.upperSidePanel);
        if (parsedConfig.lowerSidePanel) updateConfig('lowerSidePanel', parsedConfig.lowerSidePanel);
        if (parsedConfig.ultraSuedeRibbon) updateConfig('ultraSuedeRibbon', parsedConfig.ultraSuedeRibbon);
        if (parsedConfig.centralSeatMaterial) updateConfig('centralSeatMaterial', parsedConfig.centralSeatMaterial);
        if (parsedConfig.perforatedSeatOptions) updateConfig('perforatedSeatOptions', parsedConfig.perforatedSeatOptions);

        // Déduire le prestige depuis les valeurs intérieur
        if (parsedConfig.carpet && parsedConfig.seatCovers) {
            const xmlDoc = await getDatabaseXML();
            const foundPrestige = findPrestigeFromInteriorConfig(xmlDoc, parsedConfig);
            if (foundPrestige) {
                parsedConfig.prestige = foundPrestige;
                updateConfig('prestige', foundPrestige);
            }
        }

        // Mettre à jour les dropdowns pour refléter ces valeurs
        if (parsedConfig.version) {
            const selectVersion = document.getElementById('selectVersion');
            if (selectVersion) selectVersion.value = parsedConfig.version;
        }
        if (parsedConfig.paintScheme) {
            const selectPaintScheme = document.getElementById('selectPaintScheme');
            if (selectPaintScheme) selectPaintScheme.value = parsedConfig.paintScheme;

            // Resynchroniser les zones de couleurs avec le schéma chargé du XML
            // Extraire le nom court pour chercher le bookmark
            // V0.2-V0.5 : "Sirocco_B-0_..." → "Sirocco"
            // V0.6+     : "Sirocco_6_B-0_..." → "Sirocco"
            const schemeName = parsedConfig.paintScheme.split('_')[0];
            await syncZonesWithPaintScheme(schemeName);
        }
        if (parsedConfig.prestige) {
            const selectPrestige = document.getElementById('selectPrestige');
            if (selectPrestige) selectPrestige.value = parsedConfig.prestige;
        }
        if (parsedConfig.decor) {
            const selectDecor = document.getElementById('selectDecor');
            if (selectDecor) selectDecor.value = parsedConfig.decor;
        }
        if (parsedConfig.spinner) {
            const selectSpinner = document.getElementById('selectSpinner');
            if (selectSpinner) selectSpinner.value = parsedConfig.spinner;
        }
        if (parsedConfig.stitching) {
            const selectStitching = document.getElementById('stitching');
            if (selectStitching) selectStitching.value = parsedConfig.stitching;
        }

        // Mettre à jour les dropdowns intérieur
        if (parsedConfig.carpet) {
            const el = document.getElementById('carpet');
            if (el) el.value = parsedConfig.carpet;
        }
        if (parsedConfig.seatCovers) {
            const el = document.getElementById('seat-covers');
            if (el) el.value = parsedConfig.seatCovers;
        }
        if (parsedConfig.tabletFinish) {
            const el = document.getElementById('tablet-finish');
            if (el) el.value = parsedConfig.tabletFinish;
        }
        if (parsedConfig.seatbelts) {
            const el = document.getElementById('seatbelts');
            if (el) el.value = parsedConfig.seatbelts;
        }
        if (parsedConfig.metalFinish) {
            const el = document.getElementById('metal-finish');
            if (el) el.value = parsedConfig.metalFinish;
        }
        if (parsedConfig.upperSidePanel) {
            const el = document.getElementById('upper-side-panel');
            if (el) el.value = parsedConfig.upperSidePanel;
        }
        if (parsedConfig.lowerSidePanel) {
            const el = document.getElementById('lower-side-panel');
            if (el) el.value = parsedConfig.lowerSidePanel;
        }
        if (parsedConfig.ultraSuedeRibbon) {
            const el = document.getElementById('ultra-suede-ribbon');
            if (el) el.value = parsedConfig.ultraSuedeRibbon;
        }

        // Toggle matériau central
        if (parsedConfig.centralSeatMaterial) {
            const btnSuede = document.getElementById('btnCentralSeatSuede');
            const btnCuir = document.getElementById('btnCentralSeatCuir');
            if (btnSuede && btnCuir) {
                if (parsedConfig.centralSeatMaterial.includes('Suede')) {
                    btnSuede.classList.add('active');
                    btnCuir.classList.remove('active');
                } else {
                    btnCuir.classList.add('active');
                    btnSuede.classList.remove('active');
                }
            }
        }

        // Radio buttons perforation
        if (parsedConfig.perforatedSeatOptions) {
            const radios = document.querySelectorAll('input[name="perforated-seat"]');
            radios.forEach(radio => {
                radio.checked = (radio.value === parsedConfig.perforatedSeatOptions);
            });
        }

        // US-053/US-054 : Mettre à jour l'état visuel des toggles
        // Helper pour activer le bon bouton toggle
        const setToggleState = (btnOffId, btnOnId, value) => {
            const btnOff = document.getElementById(btnOffId);
            const btnOn = document.getElementById(btnOnId);
            if (btnOff && btnOn) {
                const isOn = value && (value.toUpperCase().includes('ON') || value.toUpperCase().includes('OPEN'));
                if (isOn) {
                    btnOn.classList.add('active');
                    btnOff.classList.remove('active');
                } else {
                    btnOff.classList.add('active');
                    btnOn.classList.remove('active');
                }
            }
        };

        if (parsedConfig.sunglass) {
            setToggleState('btnSunGlassOFF', 'btnSunGlassON', parsedConfig.sunglass);
        }
        if (parsedConfig.tablet) {
            setToggleState('btnTabletClosed', 'btnTabletOpen', parsedConfig.tablet);
        }
        if (parsedConfig.doorPilot) {
            setToggleState('btnDoorPilotClosed', 'btnDoorPilotOpen', parsedConfig.doorPilot);
        }
        if (parsedConfig.doorPassenger) {
            setToggleState('btnDoorPassengerClosed', 'btnDoorPassengerOpen', parsedConfig.doorPassenger);
        }
        if (parsedConfig.moodLights) {
            setToggleState('btnMoodLightsOFF', 'btnMoodLightsON', parsedConfig.moodLights);
        }
        if (parsedConfig.lightingCeiling) {
            setToggleState('btnLightingCeilingOFF', 'btnLightingCeilingON', parsedConfig.lightingCeiling);
        }

        // US-040 V0.1/V0.2 : Vérifier quelles vues sont disponibles et masquer les boutons inexistants
        await checkViewAvailability();

        // US-040 : Vérifier quels boutons d'actions sont disponibles selon les parameters XML
        await checkActionButtonsAvailability();

        // US-040 : Vérifier quels champs de configuration sont disponibles selon les parameters XML
        await checkConfigFieldsAvailability();

        return true;

    } catch (error) {
        console.error('❌ Erreur chargement config par défaut:', error);
        return false;
    }
}
