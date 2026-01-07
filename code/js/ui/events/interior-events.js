/**
 * @fileoverview Event listeners pour les actions intérieures
 * @module ui/events/interior-events
 * @version 1.0
 * @description Gère les actions intérieures (SunGlass, Tablet, MoodLights, Doors, Dropdowns intérieur)
 */

import { updateConfig } from '../../state.js';

/**
 * Attache les event listeners pour les actions intérieures
 * @returns {void}
 */
export function attachInteriorEvents() {
    // US-024 : Event listeners Lunettes de soleil
    const btnSunGlassOFF = document.getElementById('btnSunGlassOFF');
    const btnSunGlassON = document.getElementById('btnSunGlassON');

    if (btnSunGlassOFF && btnSunGlassON) {
        btnSunGlassOFF.addEventListener('click', () => {
            btnSunGlassOFF.classList.add('active');
            btnSunGlassON.classList.remove('active');
            updateConfig('sunglass', 'SunGlassOFF');
            window.triggerRender();
        });

        btnSunGlassON.addEventListener('click', () => {
            btnSunGlassON.classList.add('active');
            btnSunGlassOFF.classList.remove('active');
            updateConfig('sunglass', 'SunGlassON');
            window.triggerRender();
        });
    }

    // US-023 : Event listeners Tablette
    const btnTabletClosed = document.getElementById('btnTabletClosed');
    const btnTabletOpen = document.getElementById('btnTabletOpen');

    if (btnTabletClosed && btnTabletOpen) {
        btnTabletClosed.addEventListener('click', () => {
            btnTabletClosed.classList.add('active');
            btnTabletOpen.classList.remove('active');
            updateConfig('tablet', 'Closed');
            window.triggerRender();
        });

        btnTabletOpen.addEventListener('click', () => {
            btnTabletOpen.classList.add('active');
            btnTabletClosed.classList.remove('active');
            updateConfig('tablet', 'Open');
            window.triggerRender();
        });
    }

    // Event listeners Mood Lights
    const btnMoodLightsOFF = document.getElementById('btnMoodLightsOFF');
    const btnMoodLightsON = document.getElementById('btnMoodLightsON');

    if (btnMoodLightsOFF && btnMoodLightsON) {
        btnMoodLightsOFF.addEventListener('click', () => {
            btnMoodLightsOFF.classList.add('active');
            btnMoodLightsON.classList.remove('active');
            updateConfig('moodLights', 'Lighting_Mood_OFF');
            window.triggerRender();
        });

        btnMoodLightsON.addEventListener('click', () => {
            btnMoodLightsON.classList.add('active');
            btnMoodLightsOFF.classList.remove('active');
            updateConfig('moodLights', 'Lighting_Mood_ON');
            window.triggerRender();
        });
    }

    // US-025 : Event listeners Porte pilote
    const btnDoorPilotClosed = document.getElementById('btnDoorPilotClosed');
    const btnDoorPilotOpen = document.getElementById('btnDoorPilotOpen');

    if (btnDoorPilotClosed && btnDoorPilotOpen) {
        btnDoorPilotClosed.addEventListener('click', () => {
            btnDoorPilotClosed.classList.add('active');
            btnDoorPilotOpen.classList.remove('active');
            updateConfig('doorPilot', 'Closed');
            window.triggerRender();
        });

        btnDoorPilotOpen.addEventListener('click', () => {
            btnDoorPilotOpen.classList.add('active');
            btnDoorPilotClosed.classList.remove('active');
            updateConfig('doorPilot', 'Open');
            window.triggerRender();
        });
    }

    // US-026 : Event listeners Porte passager
    const btnDoorPassengerClosed = document.getElementById('btnDoorPassengerClosed');
    const btnDoorPassengerOpen = document.getElementById('btnDoorPassengerOpen');

    if (btnDoorPassengerClosed && btnDoorPassengerOpen) {
        btnDoorPassengerClosed.addEventListener('click', () => {
            btnDoorPassengerClosed.classList.add('active');
            btnDoorPassengerOpen.classList.remove('active');
            updateConfig('doorPassenger', 'Closed');
            window.triggerRender();
        });

        btnDoorPassengerOpen.addEventListener('click', () => {
            btnDoorPassengerOpen.classList.add('active');
            btnDoorPassengerClosed.classList.remove('active');
            updateConfig('doorPassenger', 'Open');
            window.triggerRender();
        });
    }

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
