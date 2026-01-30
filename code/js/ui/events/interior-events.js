/**
 * @fileoverview Event listeners pour les actions intérieures
 * @module ui/events/interior-events
 * @version 1.2
 * @description Gère les actions intérieures (SunGlass, Tablet, MoodLights, Doors, Dropdowns intérieur)
 *              US-053/US-054 : Utilise les valeurs du XML via getExteriorOptionsFromXML
 */

import { updateConfig } from '../../state.js';
import { getDatabaseXML, getExteriorOptionsFromXML } from '../../api/index.js';

// Cache des options toggles (chargé une fois au init)
let toggleOptionsCache = null;

/**
 * Charge les options des toggles depuis le XML (même pattern que les dropdowns)
 */
async function loadToggleOptions() {
    if (toggleOptionsCache) return toggleOptionsCache;
    try {
        const xmlDoc = await getDatabaseXML();
        const options = getExteriorOptionsFromXML(xmlDoc);
        toggleOptionsCache = {
            sunGlass: options.sunGlass || [],
            tablet: options.tablet || [],
            doorPilot: options.doorPilot || [],
            doorPassenger: options.doorPassenger || [],
            moodLights: options.moodLights || [],
            lightingCeiling: options.lightingCeiling || []
        };
        return toggleOptionsCache;
    } catch (e) {
        console.error('Erreur chargement options toggles:', e);
        return null;
    }
}

/**
 * Trouve la valeur OFF d'un toggle depuis les options XML
 */
function findOffValue(options) {
    if (!options || options.length === 0) return null;
    const off = options.find(o => o.value.toUpperCase().includes('OFF') || o.value.toUpperCase().includes('CLOSED'));
    return off ? off.value : options[0].value;
}

/**
 * Trouve la valeur ON d'un toggle depuis les options XML
 */
function findOnValue(options) {
    if (!options || options.length === 0) return null;
    const on = options.find(o => o.value.toUpperCase().includes('ON') || o.value.toUpperCase().includes('OPEN'));
    return on ? on.value : (options.length > 1 ? options[1].value : options[0].value);
}

/**
 * Attache les event listeners pour les actions intérieures
 * @returns {void}
 */
export function attachInteriorEvents() {
    // Charger les options des toggles depuis le XML (async)
    loadToggleOptions().then(opts => {
        if (!opts) return;

        // US-024 : Lunettes de soleil
        const btnSunGlassOFF = document.getElementById('btnSunGlassOFF');
        const btnSunGlassON = document.getElementById('btnSunGlassON');
        if (btnSunGlassOFF && btnSunGlassON) {
            btnSunGlassOFF.addEventListener('click', () => {
                btnSunGlassOFF.classList.add('active');
                btnSunGlassON.classList.remove('active');
                updateConfig('sunglass', findOffValue(opts.sunGlass) || 'SunGlassOFF');
                window.triggerRender();
            });
            btnSunGlassON.addEventListener('click', () => {
                btnSunGlassON.classList.add('active');
                btnSunGlassOFF.classList.remove('active');
                updateConfig('sunglass', findOnValue(opts.sunGlass) || 'SunGlassON');
                window.triggerRender();
            });
        }

        // US-023 : Tablette
        const btnTabletClosed = document.getElementById('btnTabletClosed');
        const btnTabletOpen = document.getElementById('btnTabletOpen');
        if (btnTabletClosed && btnTabletOpen) {
            btnTabletClosed.addEventListener('click', () => {
                btnTabletClosed.classList.add('active');
                btnTabletOpen.classList.remove('active');
                updateConfig('tablet', findOffValue(opts.tablet) || 'Closed');
                window.triggerRender();
            });
            btnTabletOpen.addEventListener('click', () => {
                btnTabletOpen.classList.add('active');
                btnTabletClosed.classList.remove('active');
                updateConfig('tablet', findOnValue(opts.tablet) || 'Open');
                window.triggerRender();
            });
        }

        // US-053 : Mood Lights
        const btnMoodLightsOFF = document.getElementById('btnMoodLightsOFF');
        const btnMoodLightsON = document.getElementById('btnMoodLightsON');
        if (btnMoodLightsOFF && btnMoodLightsON) {
            btnMoodLightsOFF.addEventListener('click', () => {
                btnMoodLightsOFF.classList.add('active');
                btnMoodLightsON.classList.remove('active');
                updateConfig('moodLights', findOffValue(opts.moodLights) || 'Lighting_Mood_OFF');
                window.triggerRender();
            });
            btnMoodLightsON.addEventListener('click', () => {
                btnMoodLightsON.classList.add('active');
                btnMoodLightsOFF.classList.remove('active');
                updateConfig('moodLights', findOnValue(opts.moodLights) || 'Lighting_Mood_ON');
                window.triggerRender();
            });
        }

        // US-054 : Lighting Ceiling
        const btnLightingCeilingOFF = document.getElementById('btnLightingCeilingOFF');
        const btnLightingCeilingON = document.getElementById('btnLightingCeilingON');
        if (btnLightingCeilingOFF && btnLightingCeilingON) {
            btnLightingCeilingOFF.addEventListener('click', () => {
                btnLightingCeilingOFF.classList.add('active');
                btnLightingCeilingON.classList.remove('active');
                updateConfig('lightingCeiling', findOffValue(opts.lightingCeiling) || 'Lighting_Ceiling_OFF');
                window.triggerRender();
            });
            btnLightingCeilingON.addEventListener('click', () => {
                btnLightingCeilingON.classList.add('active');
                btnLightingCeilingOFF.classList.remove('active');
                updateConfig('lightingCeiling', findOnValue(opts.lightingCeiling) || 'Lighting_Ceiling_ON');
                window.triggerRender();
            });
        }

        // US-025 : Porte pilote
        const btnDoorPilotClosed = document.getElementById('btnDoorPilotClosed');
        const btnDoorPilotOpen = document.getElementById('btnDoorPilotOpen');
        if (btnDoorPilotClosed && btnDoorPilotOpen) {
            btnDoorPilotClosed.addEventListener('click', () => {
                btnDoorPilotClosed.classList.add('active');
                btnDoorPilotOpen.classList.remove('active');
                updateConfig('doorPilot', findOffValue(opts.doorPilot) || 'Closed');
                window.triggerRender();
            });
            btnDoorPilotOpen.addEventListener('click', () => {
                btnDoorPilotOpen.classList.add('active');
                btnDoorPilotClosed.classList.remove('active');
                updateConfig('doorPilot', findOnValue(opts.doorPilot) || 'Open');
                window.triggerRender();
            });
        }

        // US-026 : Porte passager
        const btnDoorPassengerClosed = document.getElementById('btnDoorPassengerClosed');
        const btnDoorPassengerOpen = document.getElementById('btnDoorPassengerOpen');
        if (btnDoorPassengerClosed && btnDoorPassengerOpen) {
            btnDoorPassengerClosed.addEventListener('click', () => {
                btnDoorPassengerClosed.classList.add('active');
                btnDoorPassengerOpen.classList.remove('active');
                updateConfig('doorPassenger', findOffValue(opts.doorPassenger) || 'Closed');
                window.triggerRender();
            });
            btnDoorPassengerOpen.addEventListener('click', () => {
                btnDoorPassengerOpen.classList.add('active');
                btnDoorPassengerClosed.classList.remove('active');
                updateConfig('doorPassenger', findOnValue(opts.doorPassenger) || 'Open');
                window.triggerRender();
            });
        }
    });

    // ======================================
    // US-027 : Event listeners pour les 10 dropdowns intérieur
    // ======================================

    document.getElementById('carpet').addEventListener('change', (e) => {
        updateConfig('carpet', e.target.value);
        window.triggerRender();
    });

    document.getElementById('seat-covers').addEventListener('change', (e) => {
        updateConfig('seatCovers', e.target.value);
        window.triggerRender();
    });

    document.getElementById('tablet-finish').addEventListener('change', (e) => {
        updateConfig('tabletFinish', e.target.value);
        window.triggerRender();
    });

    document.getElementById('seatbelts').addEventListener('change', (e) => {
        updateConfig('seatbelts', e.target.value);
        window.triggerRender();
    });

    document.getElementById('metal-finish').addEventListener('change', (e) => {
        updateConfig('metalFinish', e.target.value);
        window.triggerRender();
    });

    document.getElementById('upper-side-panel').addEventListener('change', (e) => {
        updateConfig('upperSidePanel', e.target.value);
        window.triggerRender();
    });

    document.getElementById('lower-side-panel').addEventListener('change', (e) => {
        updateConfig('lowerSidePanel', e.target.value);
        window.triggerRender();
    });

    document.getElementById('ultra-suede-ribbon').addEventListener('change', (e) => {
        updateConfig('ultraSuedeRibbon', e.target.value);
        window.triggerRender();
    });

    // US-036 : Event listener Stitching
    document.getElementById('stitching').addEventListener('change', (e) => {
        updateConfig('stitching', e.target.value);
        window.triggerRender();
    });

    // US-037 : Toggle buttons Matériau Central
    const btnCentralSeatSuede = document.getElementById('btnCentralSeatSuede');
    const btnCentralSeatCuir = document.getElementById('btnCentralSeatCuir');

    if (btnCentralSeatSuede && btnCentralSeatCuir) {
        btnCentralSeatSuede.addEventListener('click', () => {
            btnCentralSeatSuede.classList.add('active');
            btnCentralSeatCuir.classList.remove('active');
            updateConfig('centralSeatMaterial', 'Ultra-Suede_Premium');
            window.triggerRender();
        });

        btnCentralSeatCuir.addEventListener('click', () => {
            btnCentralSeatCuir.classList.add('active');
            btnCentralSeatSuede.classList.remove('active');
            updateConfig('centralSeatMaterial', 'Leather_Premium');
            window.triggerRender();
        });
    }

    // Event listener pour les radio buttons perforation
    const perforatedRadios = document.querySelectorAll('input[name="perforated-seat"]');
    perforatedRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateConfig('perforatedSeatOptions', e.target.value);
            window.triggerRender();
        });
    });
}
