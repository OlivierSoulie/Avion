/**
 * @fileoverview Event listeners pour la gestion de l'immatriculation
 * @module ui/events/immat-events
 * @version 1.0
 * @description Gère le type de police, le style et l'immatriculation (US-004, US-005)
 */

import { updateConfig, getConfig } from '../../state.js';

/**
 * US-029: Met à jour le dropdown Style selon le type de police
 * @param {string} fontType - 'slanted' ou 'straight'
 */
function updateStyleDropdown(fontType) {
    const selectStyle = document.getElementById('selectStyle');
    if (!selectStyle) return;

    // Vider le dropdown
    selectStyle.innerHTML = '';

    if (fontType === 'slanted') {
        // Styles penchés : A, B, C, D, E
        ['A', 'B', 'C', 'D', 'E'].forEach(style => {
            const option = document.createElement('option');
            option.value = style;
            option.textContent = `Style ${style}`;
            selectStyle.appendChild(option);
        });
    } else if (fontType === 'straight') {
        // Styles droits : F, G, H, I, J
        ['F', 'G', 'H', 'I', 'J'].forEach(style => {
            const option = document.createElement('option');
            option.value = style;
            option.textContent = `Style ${style}`;
            selectStyle.appendChild(option);
        });
    }

    // Sélectionner le premier style par défaut
    selectStyle.value = selectStyle.options[0].value;
    updateConfig('style', selectStyle.value);
}

/**
 * Attache les event listeners pour l'immatriculation
 * @returns {void}
 */
export function attachImmatEvents() {
    // Radio buttons Type Police
    const radioSlanted = document.getElementById('radioSlanted');
    const radioStraight = document.getElementById('radioStraight');

    if (radioSlanted) {
        radioSlanted.addEventListener('change', () => {
            if (radioSlanted.checked) {
                updateConfig('fontType', 'slanted');
                updateStyleDropdown('slanted');
                window.triggerRender(); // US-005: Appel API automatique
            }
        });
    }

    if (radioStraight) {
        radioStraight.addEventListener('change', () => {
            if (radioStraight.checked) {
                updateConfig('fontType', 'straight');
                updateStyleDropdown('straight');
                window.triggerRender(); // US-005: Appel API automatique
            }
        });
    }

    // Dropdown Style
    const selectStyle = document.getElementById('selectStyle');
    if (selectStyle) {
        selectStyle.addEventListener('change', (e) => {
            updateConfig('style', e.target.value);
            window.triggerRender(); // US-005: Appel API automatique
        });
    }

    // ======================================
    // US-004 : Gestion de l'immatriculation
    // ======================================

    // Input immatriculation
    const inputImmat = document.getElementById('inputImmat');
    const errorImmat = document.getElementById('errorImmat');
    const btnSubmitImmat = document.getElementById('btnSubmitImmat');

    if (inputImmat) {
        inputImmat.addEventListener('input', (e) => {
            let value = e.target.value;

            // Conversion automatique en majuscules
            if (value !== value.toUpperCase()) {
                e.target.value = value.toUpperCase();
                value = e.target.value;
            }

            // Validation : le champ HTML a déjà maxlength="6"
            if (value.length > 6) {
                errorImmat.classList.remove('hidden');
                console.warn('Immatriculation > 6 caractères');
            } else {
                errorImmat.classList.add('hidden');
            }

        });
    }

    // Bouton Envoyer immatriculation (US-004 + US-005)
    if (btnSubmitImmat) {
        btnSubmitImmat.addEventListener('click', (e) => {
            e.preventDefault();

            const currentImmat = inputImmat.value;
            const previousImmat = getConfig().immat;

            // Vérifier que la valeur a changé
            if (currentImmat !== previousImmat) {
                updateConfig('immat', currentImmat);
                updateConfig('hasCustomImmat', true); // US-034: Marquer comme personnalisée
                window.triggerRender(); // US-005: Appel API
            }
        });
    }
}
