/**
 * @fileoverview Fonctions de validation et helpers UI
 * @module utils/validators
 * @version 1.0
 * @description Module dédié aux fonctions de validation d'état UI et helpers de gestion d'interface
 */

import { getConfig, updateConfig } from '../state.js';
import { STYLES_SLANTED, STYLES_STRAIGHT } from '../config.js';
import { getDatabaseXML } from '../api/index.js';

// ======================================
// Utilitaires de population de dropdowns
// ======================================

/**
 * Peuple un élément select avec des options (format simple: array de strings)
 * @param {string} selectId - L'ID du select à remplir
 * @param {Array} values - Les valeurs à ajouter comme options
 * @param {string} defaultValue - La valeur par défaut à sélectionner
 */
export function populateSelect(selectId, values, defaultValue) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.warn(`Select avec ID "${selectId}" non trouvé`);
        return;
    }

    // Vider le select existant
    select.innerHTML = '';

    // Ajouter les options
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;

        // Sélectionner la valeur par défaut
        if (value === defaultValue) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}

/**
 * US-027 : Peuple un dropdown avec une liste d'options (format {label, value})
 * Masque le dropdown si la liste est vide (paramètre manquant ou base POC)
 *
 * @param {string} selectId - L'ID du select à remplir
 * @param {Array} optionsList - Liste d'objets {label, value}
 * @param {string} defaultValue - La valeur par défaut à sélectionner
 */
export function populateDropdown(selectId, optionsList, defaultValue) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.warn(`Select avec ID "${selectId}" non trouvé`);
        return;
    }

    if (optionsList.length === 0) {
        const formGroup = select.closest('.form-group');
        if (formGroup) {
            console.warn(`⚠️ Dropdown ${selectId} vide (paramètre manquant ou base POC) → masqué`);
            formGroup.classList.add('hidden');
            formGroup.style.display = 'none';
        }
        return;
    }

    const formGroup = select.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('hidden');
        formGroup.style.display = '';
    }

    const effectiveDefault = defaultValue || (optionsList.length > 0 ? optionsList[0].value : null);
    select.innerHTML = '';

    // Match intelligent : chercher par value OU par label
    let matchFound = false;
    optionsList.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;

        // Match par value (exact)
        if (option.value === effectiveDefault) {
            optionElement.selected = true;
            matchFound = true;
        }
        // Si pas de match par value, essayer par label (ex: "Studio" → match "Studio")
        else if (!matchFound && option.label === effectiveDefault) {
            optionElement.selected = true;
            matchFound = true;
        }

        select.appendChild(optionElement);
    });

    // Si aucun match trouvé, sélectionner la première option
    if (!matchFound && optionsList.length > 0) {
        select.selectedIndex = 0;
    }
}

// ======================================
// Gestion de visibilité des éléments
// ======================================

/**
 * Masque le viewer PDF
 * Utilisé lors du changement d'onglet
 */
export function hidePDFViewer() {
    const pdfViewWrapper = document.querySelector('.pdf-view-wrapper');
    if (pdfViewWrapper) {
        pdfViewWrapper.remove();
    }
}

/**
 * Toggle l'affichage des contrôles selon le type de vue
 * Gère l'affichage conditionnel des sections de contrôles et d'actions
 *
 * @param {string} viewType - Type de vue: 'exterior', 'interior', 'configuration', 'overview', 'pdf'
 */
export function toggleViewControls(viewType) {
    const controlsExterior = document.getElementById('controls-exterior');
    const controlsInterior = document.getElementById('controls-interior');
    const actionsExterior = document.getElementById('actions-exterior');
    const actionsInterior = document.getElementById('actions-interior');
    const actionsPanel = document.querySelector('.viewport-actions-panel');

    if (!controlsExterior || !controlsInterior) {
        console.warn('Sections controls-exterior ou controls-interior non trouvées');
        return;
    }

    if (viewType === 'exterior') {
        // Afficher contrôles extérieur, masquer contrôles intérieur
        controlsExterior.style.display = 'block';
        controlsInterior.style.display = 'none';

        // Afficher actions extérieur, masquer actions intérieur
        if (actionsExterior) actionsExterior.style.display = 'flex';
        if (actionsInterior) actionsInterior.style.display = 'none';

        // Afficher le panneau d'actions
        if (actionsPanel) actionsPanel.style.display = 'block';

    } else if (viewType === 'interior') {
        // Masquer contrôles extérieur, afficher contrôles intérieur
        controlsExterior.style.display = 'none';
        controlsInterior.style.display = 'block';

        // Masquer actions extérieur, afficher actions intérieur
        if (actionsExterior) actionsExterior.style.display = 'none';
        if (actionsInterior) actionsInterior.style.display = 'flex';

        // Afficher le panneau d'actions
        if (actionsPanel) actionsPanel.style.display = 'block';

    } else if (viewType === 'configuration') {
        // US-042: Vue Configuration - masquer tous les contrôles (pas de personnalisation)
        controlsExterior.style.display = 'none';
        controlsInterior.style.display = 'none';

        // Masquer toutes les actions
        if (actionsExterior) actionsExterior.style.display = 'none';
        if (actionsInterior) actionsInterior.style.display = 'none';

        // Masquer le panneau d'actions (vide)
        if (actionsPanel) actionsPanel.style.display = 'none';
    } else if (viewType === 'overview') {
        // US-044: Vue Overview - masquer tous les contrôles (pas de personnalisation)
        controlsExterior.style.display = 'none';
        controlsInterior.style.display = 'none';

        // Masquer toutes les actions
        if (actionsExterior) actionsExterior.style.display = 'none';
        if (actionsInterior) actionsInterior.style.display = 'none';

        // Masquer le panneau d'actions (vide)
        if (actionsPanel) actionsPanel.style.display = 'none';

    } else if (viewType === 'pdf') {
        // Vue PDF avec hotspots - afficher les contrôles extérieurs pour modifier les couleurs
        controlsExterior.style.display = 'block';
        controlsInterior.style.display = 'none';

        // Masquer toutes les actions (pas besoin de décor, portes, etc.)
        if (actionsExterior) actionsExterior.style.display = 'none';
        if (actionsInterior) actionsInterior.style.display = 'none';

        // Masquer le panneau d'actions
        if (actionsPanel) actionsPanel.style.display = 'none';
    }
}

// ======================================
// Validation et mise à jour conditionnelle
// ======================================

/**
 * US-034 : Met à jour l'immatriculation par défaut selon le modèle d'avion
 * Ne met à jour QUE si l'utilisateur n'a pas customisé l'immat
 *
 * @param {string} model - Modèle d'avion ("960" ou "980")
 */
export function updateDefaultImmatFromModel(model) {
    const currentConfig = getConfig();

    // Si l'utilisateur a customisé l'immat, ne rien faire
    if (currentConfig.hasCustomImmat) {
        return;
    }

    // Déterminer l'immat par défaut selon le modèle
    const defaultImmat = model === '980' ? 'N980TB' : 'N960TB';

    // Mettre à jour l'immat si elle est différente
    if (currentConfig.immat !== defaultImmat) {

        // Mettre à jour le state
        updateConfig('immat', defaultImmat);

        // Mettre à jour l'input visuel
        const inputImmat = document.getElementById('inputImmat');
        if (inputImmat) {
            inputImmat.value = defaultImmat;
        }
    }
}

/**
 * Met à jour le dropdown de style selon le type de police
 * Utilisé quand l'utilisateur change entre slanted et straight
 *
 * @param {string} fontType - Type de police: 'slanted' ou 'straight'
 * @param {Array} stylesSlanted - Liste des styles slanted (ou null pour utiliser constante)
 * @param {Array} stylesStraight - Liste des styles straight (ou null pour utiliser constante)
 */
export function updateStyleDropdown(fontType, stylesSlanted = null, stylesStraight = null) {

    // Utiliser les styles fournis en paramètre, ou fallback sur les constantes
    // BUGFIX: Gérer les chaînes vides (pas seulement null/undefined)
    const slantedList = (stylesSlanted && stylesSlanted.length > 0) ? stylesSlanted : STYLES_SLANTED;
    const straightList = (stylesStraight && stylesStraight.length > 0) ? stylesStraight : STYLES_STRAIGHT;

    const styles = fontType === 'slanted' ? slantedList : straightList;
    const defaultStyle = fontType === 'slanted' ? 'A' : 'F';


    // Repeupler le dropdown
    populateSelect('selectStyle', styles, defaultStyle);

    // Mettre à jour le state avec la nouvelle valeur par défaut
    updateConfig('style', defaultStyle);

}

// ======================================
// Initialisation des interactions UI
// ======================================

/**
 * Initialise le système d'accordéon pour les sections de configuration
 * Permet d'ouvrir/fermer les sections en cliquant sur les headers
 * Ferme automatiquement les autres sections de la même zone (extérieur/intérieur)
 */
export function initAccordion() {

    // Récupérer tous les headers d'accordéon
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            const isActive = section.classList.contains('active');

            // Récupérer tous les accordéons de la même section (ext ou int)
            const parentSection = section.closest('.controls-view-section');
            const allSections = parentSection.querySelectorAll('.accordion-section');

            // Fermer tous les accordéons de cette section
            allSections.forEach(s => s.classList.remove('active'));

            // Si la section n'était pas active, l'ouvrir
            if (!isActive) {
                section.classList.add('active');
            } else {
            }
        });
    });

}

// ======================================
// US-040 : Validation disponibilité éléments UI selon XML
// ======================================

/**
 * Vérifie quels groupes caméra existent et masque/affiche les boutons de vue en conséquence
 * US-040: V0.1/V0.2 n'ont pas tous les groupes (Overview, Configuration, etc.)
 *
 * @async
 * @returns {Promise<void>}
 */
export async function checkViewAvailability() {

    try {
        const xmlDoc = await getDatabaseXML();
        const groups = xmlDoc.querySelectorAll('Group');

        // Collecter les groupes disponibles AVEC au moins 1 caméra
        const availableGroups = new Map(); // Map<groupName, cameraCount>
        for (let group of groups) {
            const groupName = group.getAttribute('name');
            if (groupName) {
                const cameraCount = group.querySelectorAll('Camera').length;
                availableGroups.set(groupName, cameraCount);
            }
        }

        availableGroups.forEach((count, name) => {
        });

        // Mapping: bouton → groupe caméra requis (avec fallbacks pour anciennes versions)
        const viewButtons = [
            { id: 'btnViewExterior', groups: ['Exterieur_Decor', 'Exterieur'], partial: true }, // Partial: commence par, fallback V0.1/V0.2
            { id: 'btnViewInterior', groups: ['Interieur'], partial: false },
            { id: 'btnViewConfiguration', groups: ['Configuration'], partial: false },
            { id: 'btnViewOverview', groups: ['Overview'], partial: false }
        ];

        // Pour chaque bouton, vérifier si le groupe existe ET contient des caméras
        viewButtons.forEach(({ id, groups, partial }) => {
            const btn = document.getElementById(id);
            if (!btn) return;

            let isAvailable = false;
            let foundGroup = null;

            // Essayer chaque groupe dans l'ordre (premier = préféré, suivants = fallbacks)
            for (let group of groups) {
                if (partial) {
                    // Recherche partielle (ex: Exterieur_Decor* ou Exterieur)
                    for (let [groupName, cameraCount] of availableGroups) {
                        if (groupName.startsWith(group) && cameraCount > 0) {
                            isAvailable = true;
                            foundGroup = groupName;
                            break;
                        }
                    }
                } else {
                    // Recherche exacte
                    const cameraCount = availableGroups.get(group) || 0;
                    if (cameraCount > 0) {
                        isAvailable = true;
                        foundGroup = group;
                    }
                }

                // Si trouvé, arrêter la recherche
                if (isAvailable) break;
            }

            if (isAvailable) {
                btn.classList.remove('hidden');
                btn.disabled = false;
            } else {
                btn.classList.add('hidden');
                btn.disabled = true;
            }
        });

    } catch (error) {
        console.warn('⚠️ Erreur vérification vues:', error);
    }
}

/**
 * Vérifie quels parameters existent et masque/affiche les boutons d'actions en conséquence
 * US-040: V0.1/V0.2 n'ont pas tous les parameters (Door_pilot, Door_passenger, Tablet, SunGlass)
 *
 * @async
 * @returns {Promise<void>}
 */
export async function checkActionButtonsAvailability() {

    try {
        const xmlDoc = await getDatabaseXML();
        const parameters = xmlDoc.querySelectorAll('Parameter');

        // Collecter tous les noms de parameters disponibles
        const availableParams = new Set();
        for (let param of parameters) {
            const paramLabel = param.getAttribute('label');
            if (paramLabel) {
                availableParams.add(paramLabel);
            }
        }


        // Mapping: groupe de boutons → parameter requis (avec variantes de nommage)
        const actionButtons = [
            {
                selector: '.form-group:has(#btnDoorPilotClosed)',
                params: ['Door_pilot'], // Production uniquement - POC non supporté
                name: 'Porte pilote'
            },
            {
                selector: '.form-group:has(#btnDoorPassengerClosed)',
                params: ['Door_passenger'], // Production uniquement - POC non supporté
                name: 'Porte passager'
            },
            {
                selector: '.form-group:has(#btnTabletClosed)',
                params: ['Tablet'], // Absent en V0.1/V0.2
                name: 'Tablette'
            },
            {
                selector: '.form-group:has(#btnSunGlassOFF)',
                params: ['SunGlass', 'Sun glass'], // Production : "SunGlass" ou "Sun glass" - POC non supporté
                name: 'Volet Hublots'
            },
            {
                selector: '.form-group:has(#btnMoodLightsOFF)',
                params: ['Lighting_mood'], // Mood Lights (V0.6+)
                name: 'Mood Lights'
            }
        ];

        // Pour chaque groupe de boutons, vérifier si UNE DES VARIANTES du parameter existe
        actionButtons.forEach(({ selector, params, name }) => {
            const formGroup = document.querySelector(selector);
            if (!formGroup) return;

            let isAvailable = false;
            let foundVariant = null;

            // Vérifier toutes les variantes
            for (let paramName of params) {
                if (availableParams.has(paramName)) {
                    isAvailable = true;
                    foundVariant = paramName;
                    break;
                }
            }

            if (isAvailable) {
                formGroup.classList.remove('hidden');
                formGroup.style.display = '';
            } else {
                formGroup.classList.add('hidden');
                formGroup.style.display = 'none';
            }
        });

    } catch (error) {
        console.warn('⚠️ Erreur vérification boutons actions:', error);
    }
}

/**
 * Vérifie quels champs de configuration existent et masque/affiche les dropdowns en conséquence
 * US-040: V0.1/V0.2 n'ont pas tous les parameters (Version, Spinner, Stitching, etc.)
 *
 * @async
 * @returns {Promise<void>}
 */
export async function checkConfigFieldsAvailability() {

    try {
        const xmlDoc = await getDatabaseXML();
        const parameters = xmlDoc.querySelectorAll('Parameter');

        // Collecter tous les noms de parameters disponibles
        const availableParams = new Set();
        for (let param of parameters) {
            const paramLabel = param.getAttribute('label');
            if (paramLabel) {
                availableParams.add(paramLabel);
            }
        }

        // Vérifier aussi les ConfigurationBookmark pour les Prestiges
        const prestigeBookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark[label^="Interior_PrestigeSelection_"]');
        const hasPrestige = prestigeBookmarks.length > 0;


        // Mapping: sélecteur de form-group → parameter requis (avec variantes de nommage)
        const configFields = [
            {
                selector: '.form-group:has(#selectVersion)',
                params: ['Version'], // Présent dans toutes les versions
                name: 'Modèle (Version)'
            },
            {
                selector: '.form-group:has(#selectPaintScheme)',
                params: ['Exterior_PaintScheme'], // Présent dans toutes les versions
                name: 'Schéma de peinture'
            },
            {
                selector: '.form-group:has(#selectSpinner)',
                params: ['Exterior_Spinner'], // Présent dans toutes les versions
                name: 'Spinner'
            },
            {
                selector: '.form-group:has(#selectDecor)',
                params: ['Decor'], // Production uniquement (V0.2+) - POC non supporté
                name: 'Décor (Extérieur)'
            },
            {
                selector: '.form-group:has(#selectDecorInterior)',
                params: ['Decor'], // Production uniquement (V0.2+) - POC non supporté
                name: 'Décor (Intérieur)'
            },
            {
                selector: '.form-group:has(#selectPrestige)',
                isPrestige: true,
                name: 'Prestige'
            },
            {
                selector: '.form-group:has(#stitching)',
                params: ['Interior_Stitching'], // Absent en V0.1/V0.2
                name: 'Stitching (fil de couture)'
            }
        ];

        // Pour chaque champ, vérifier si UNE DES VARIANTES du parameter existe
        configFields.forEach(({ selector, params, isPrestige, name }) => {
            const formGroup = document.querySelector(selector);
            if (!formGroup) return;

            let isAvailable = false;

            if (isPrestige) {
                // Cas spécial pour Prestige (ConfigurationBookmark)
                isAvailable = hasPrestige;
            } else {
                // Parameter classique: vérifier toutes les variantes
                for (let paramName of params) {
                    if (availableParams.has(paramName)) {
                        isAvailable = true;
                        break;
                    }
                }
            }

            if (isAvailable) {
                formGroup.classList.remove('hidden');
                formGroup.style.display = '';
            } else {
                formGroup.classList.add('hidden');
                formGroup.style.display = 'none';
            }
        });

    } catch (error) {
        console.warn('⚠️ Erreur vérification champs configuration:', error);
    }
}

