/**
 * @fileoverview Event listeners pour les zones de couleurs
 * @module ui/events/color-events
 * @version 1.0
 * @description Gère les zones de couleurs personnalisées et la recherche par tags (US-033)
 */

import { updateConfig } from '../../state.js';
import { filterColorDropdown } from '../color-manager.js';

/**
 * Attache les event listeners pour les zones de couleurs
 * @returns {void}
 */
export function attachColorEvents() {
    // Zones de couleurs personnalisées
    const selectZoneA = document.getElementById('selectZoneA');
    const selectZoneB = document.getElementById('selectZoneB');
    const selectZoneC = document.getElementById('selectZoneC');
    const selectZoneD = document.getElementById('selectZoneD');
    const selectZoneAPlus = document.getElementById('selectZoneAPlus');

    if (selectZoneA) {
        selectZoneA.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const colorName = selectedOption.value;
            const colorTag = selectedOption.dataset.tag;

            updateConfig('zoneA', colorName);

            // Auto-sync: Si la couleur a le tag A+, mettre à jour Zone A+
            if (colorTag === 'A+' && selectZoneAPlus) {
                selectZoneAPlus.value = colorName;
                updateConfig('zoneAPlus', colorName);
            }

            window.triggerRender();
        });
    }

    if (selectZoneB) {
        selectZoneB.addEventListener('change', (e) => {
            updateConfig('zoneB', e.target.value);
            window.triggerRender();
        });
    }

    if (selectZoneC) {
        selectZoneC.addEventListener('change', (e) => {
            updateConfig('zoneC', e.target.value);
            window.triggerRender();
        });
    }

    if (selectZoneD) {
        selectZoneD.addEventListener('change', (e) => {
            updateConfig('zoneD', e.target.value);
            window.triggerRender();
        });
    }

    if (selectZoneAPlus) {
        selectZoneAPlus.addEventListener('change', (e) => {
            updateConfig('zoneAPlus', e.target.value);
            window.triggerRender();
        });
    }

    // ======================================
    // US-033 : Recherche par tags dans zones de couleurs
    // ======================================

    const searchZoneA = document.getElementById('searchZoneA');
    const searchZoneB = document.getElementById('searchZoneB');
    const searchZoneC = document.getElementById('searchZoneC');
    const searchZoneD = document.getElementById('searchZoneD');
    const searchZoneAPlus = document.getElementById('searchZoneAPlus');

    if (searchZoneA) {
        searchZoneA.addEventListener('input', (e) => {
            filterColorDropdown('selectZoneA', e.target.value);
        });
    }

    if (searchZoneB) {
        searchZoneB.addEventListener('input', (e) => {
            filterColorDropdown('selectZoneB', e.target.value);
        });
    }

    if (searchZoneC) {
        searchZoneC.addEventListener('input', (e) => {
            filterColorDropdown('selectZoneC', e.target.value);
        });
    }

    if (searchZoneD) {
        searchZoneD.addEventListener('input', (e) => {
            filterColorDropdown('selectZoneD', e.target.value);
        });
    }

    if (searchZoneAPlus) {
        searchZoneAPlus.addEventListener('input', (e) => {
            filterColorDropdown('selectZoneAPlus', e.target.value);
        });
    }
}
