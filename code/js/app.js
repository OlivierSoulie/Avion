// App.js - Point d'entrée principal
// Configurateur TBM Daher
// Version : 1.0
// Date : 02/12/2025

import { getConfig, updateConfig, setImages, setLoading, setError } from './state.js';
import {
    VERSION_LIST,
    PAINT_SCHEMES_LIST,
    PRESTIGE_LIST,
    DECORS_CONFIG,
    SPINNER_LIST,
    STYLES_SLANTED,
    STYLES_STRAIGHT,
    DEFAULT_CONFIG
} from './config.js';
import { initCarousel, initRetryButton, updateCarousel, showLoader, hideLoader, showError, hideError, disableControls, enableControls } from './ui.js';
import { fetchRenderImages, testPayloadBuild } from './api.js';

// ======================================
// Fonctions utilitaires UI
// ======================================

/**
 * Remplit un élément select avec des options
 * @param {string} selectId - L'ID du select à remplir
 * @param {Array} values - Les valeurs à ajouter comme options
 * @param {string} defaultValue - La valeur par défaut à sélectionner
 */
function populateSelect(selectId, values, defaultValue) {
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

// ======================================
// Initialisation UI
// ======================================

/**
 * Initialise l'interface utilisateur
 * Remplit tous les dropdowns avec les valeurs de config
 */
function initUI() {
    console.log('Initialisation de l\'interface...');

    // Peupler les dropdowns
    populateSelect('selectVersion', VERSION_LIST, DEFAULT_CONFIG.version);
    populateSelect('selectPaintScheme', PAINT_SCHEMES_LIST, DEFAULT_CONFIG.paintScheme);
    populateSelect('selectPrestige', PRESTIGE_LIST, DEFAULT_CONFIG.prestige);

    // Pour les décors, on prend les clés de DECORS_CONFIG
    const decorsList = Object.keys(DECORS_CONFIG);
    populateSelect('selectDecor', decorsList, DEFAULT_CONFIG.decor);

    populateSelect('selectSpinner', SPINNER_LIST, DEFAULT_CONFIG.spinner);

    // Peupler le dropdown Style selon le type de police par défaut
    updateStyleDropdown(DEFAULT_CONFIG.fontType);

    console.log('Interface initialisée avec succès');
}

// ======================================
// US-005 : Gestion des rendus API
// ======================================

let renderTimeout = null;

/**
 * Déclenche le rendu avec debounce de 300ms
 * Évite les appels multiples lors de changements rapides
 */
function triggerRender() {
    // Annuler le timeout précédent
    if (renderTimeout) {
        clearTimeout(renderTimeout);
    }

    // Programmer un nouveau rendu après 300ms
    renderTimeout = setTimeout(() => {
        loadRender();
    }, 300);
}

/**
 * Charge un nouveau rendu via l'API
 * Gère loader, erreurs et mise à jour du carrousel
 */
async function loadRender() {
    console.log('Chargement du rendu...');

    try {
        // 1. Récupérer la config actuelle
        const config = getConfig();

        // 2. Afficher le loader
        showLoader('Génération en cours...');
        disableControls();
        setLoading(true);
        setError(null);

        // 3. Appeler l'API
        const imageUrls = await fetchRenderImages(config);

        // 4. Mettre à jour le state
        setImages(imageUrls);

        // 5. Afficher les images dans le carrousel
        hideLoader();
        updateCarousel(imageUrls);

        console.log('Rendu chargé avec succès');

    } catch (error) {
        // Gérer l'erreur
        console.error('Erreur lors du chargement du rendu:', error);

        hideLoader();

        // Mapper les erreurs vers des messages user-friendly
        let errorMessage = 'Une erreur est survenue lors de la génération du rendu.';

        if (error.message.includes('HTTP 404')) {
            errorMessage = 'La configuration demandée n\'a pas été trouvée.';
        } else if (error.message.includes('HTTP 500')) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.message.includes('Timeout')) {
            errorMessage = 'La génération a pris trop de temps. Veuillez réessayer.';
        } else if (error.message.includes('Échec après')) {
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        }

        showError(errorMessage);
        setError(errorMessage);

    } finally {
        // Toujours réactiver les contrôles
        setLoading(false);
        enableControls();
    }
}

// ======================================
// Event Listeners sur les contrôles (US-003 + US-005)
// ======================================

/**
 * Attache les event listeners sur tous les contrôles
 * Met à jour le state quand l'utilisateur change une valeur
 */
function attachEventListeners() {
    console.log('Attachement des event listeners...');

    // Dropdown Modèle Avion (version)
    const selectVersion = document.getElementById('selectVersion');
    if (selectVersion) {
        selectVersion.addEventListener('change', (e) => {
            updateConfig('version', e.target.value);
            console.log('Version changée:', e.target.value);
            triggerRender(); // US-005: Appel API automatique
        });
    }

    // Dropdown Schéma Peinture
    const selectPaintScheme = document.getElementById('selectPaintScheme');
    if (selectPaintScheme) {
        selectPaintScheme.addEventListener('change', (e) => {
            updateConfig('paintScheme', e.target.value);
            console.log('Schéma peinture changé:', e.target.value);
            triggerRender(); // US-005: Appel API automatique
        });
    }

    // Dropdown Intérieur (prestige)
    const selectPrestige = document.getElementById('selectPrestige');
    if (selectPrestige) {
        selectPrestige.addEventListener('change', (e) => {
            updateConfig('prestige', e.target.value);
            console.log('Intérieur changé:', e.target.value);
            triggerRender(); // US-005: Appel API automatique
        });
    }

    // Dropdown Décor
    const selectDecor = document.getElementById('selectDecor');
    if (selectDecor) {
        selectDecor.addEventListener('change', (e) => {
            updateConfig('decor', e.target.value);
            console.log('Décor changé:', e.target.value);
            triggerRender(); // US-005: Appel API automatique
        });
    }

    // Dropdown Hélice (spinner)
    const selectSpinner = document.getElementById('selectSpinner');
    if (selectSpinner) {
        selectSpinner.addEventListener('change', (e) => {
            updateConfig('spinner', e.target.value);
            console.log('Hélice changée:', e.target.value);
            triggerRender(); // US-005: Appel API automatique
        });
    }

    // Radio buttons Type Police
    const radioSlanted = document.getElementById('radioSlanted');
    const radioStraight = document.getElementById('radioStraight');

    if (radioSlanted) {
        radioSlanted.addEventListener('change', () => {
            if (radioSlanted.checked) {
                updateConfig('fontType', 'slanted');
                updateStyleDropdown('slanted');
                console.log('Type police changé: slanted');
                triggerRender(); // US-005: Appel API automatique
            }
        });
    }

    if (radioStraight) {
        radioStraight.addEventListener('change', () => {
            if (radioStraight.checked) {
                updateConfig('fontType', 'straight');
                updateStyleDropdown('straight');
                console.log('Type police changé: straight');
                triggerRender(); // US-005: Appel API automatique
            }
        });
    }

    // Dropdown Style
    const selectStyle = document.getElementById('selectStyle');
    if (selectStyle) {
        selectStyle.addEventListener('change', (e) => {
            updateConfig('style', e.target.value);
            console.log('Style changé:', e.target.value);
            triggerRender(); // US-005: Appel API automatique
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

            console.log('Immatriculation input:', value);
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
                console.log('Immatriculation mise à jour:', currentImmat);
                triggerRender(); // US-005: Appel API
            } else {
                console.log('Immatriculation inchangée');
            }
        });
    }

    console.log('Event listeners attachés');
}

/**
 * Met à jour le dropdown Style selon le type de police
 * @param {string} fontType - 'slanted' ou 'straight'
 */
function updateStyleDropdown(fontType) {
    const styles = fontType === 'slanted' ? STYLES_SLANTED : STYLES_STRAIGHT;
    const defaultStyle = fontType === 'slanted' ? 'A' : 'F';

    // Repeupler le dropdown
    populateSelect('selectStyle', styles, defaultStyle);

    // Mettre à jour le state avec la nouvelle valeur par défaut
    updateConfig('style', defaultStyle);

    console.log(`Dropdown style mis à jour pour ${fontType}: ${styles.join(', ')}`);
}

// ======================================
// Initialisation de l'application
// ======================================

/**
 * Point d'entrée principal de l'application
 * Appelé quand le DOM est prêt
 */
function init() {
    console.log('Configurateur TBM Daher - Initialisation');
    console.log('Version : 1.0');
    console.log('Configuration initiale :', getConfig());

    // Initialiser l'UI
    initUI();

    // Initialiser le carrousel
    initCarousel();

    // Initialiser le bouton Réessayer (US-005)
    initRetryButton(() => {
        console.log('Réessayer cliqué');
        loadRender();
    });

    // Attacher les event listeners sur les contrôles (US-003)
    attachEventListeners();

    // Modes de test
    if (window.location.search.includes('test-carousel')) {
        console.log('Mode test carrousel activé');
        testCarousel();
    } else if (window.location.search.includes('test-controls')) {
        console.log('Mode test contrôles activé');
        testControls();
    } else if (window.location.search.includes('test-immat')) {
        console.log('Mode test immatriculation activé');
        testImmatriculation();
    } else if (window.location.search.includes('test-payload')) {
        console.log('Mode test payload activé');
        testPayloadBuild();
    } else {
        // Charger le rendu initial avec la config par défaut (US-005)
        console.log('Chargement du rendu initial...');
        // Désactiver temporairement pour éviter l'appel API au lancement
        // Décommenter pour activer : loadRender();
    }

    console.log('Application prête');
}

// ======================================
// Fonctions de test
// ======================================

function testCarousel() {
    const testImages = [
        'https://picsum.photos/1920/1080?random=1',
        'https://picsum.photos/1920/1080?random=2',
        'https://picsum.photos/1920/1080?random=3',
        'https://picsum.photos/1920/1080?random=4',
        'https://picsum.photos/1920/1080?random=5'
    ];

    console.log('Test carrousel avec', testImages.length, 'images');

    setTimeout(() => {
        updateCarousel(testImages);
        console.log('Carrousel de test chargé');
    }, 500);
}

function testControls() {
    console.log('Test des contrôles interactifs');
    console.log('Configuration initiale:', getConfig());

    setTimeout(() => {
        console.log('Changement automatique version → 980');
        document.getElementById('selectVersion').value = '980';
        document.getElementById('selectVersion').dispatchEvent(new Event('change'));

        setTimeout(() => {
            console.log('Changement automatique peinture → Mistral');
            document.getElementById('selectPaintScheme').value = 'Mistral';
            document.getElementById('selectPaintScheme').dispatchEvent(new Event('change'));

            setTimeout(() => {
                console.log('Changement automatique type police → Straight');
                document.getElementById('radioStraight').checked = true;
                document.getElementById('radioStraight').dispatchEvent(new Event('change'));

                setTimeout(() => {
                    console.log('Tests terminés !');
                    console.log('Configuration finale:', getConfig());
                }, 1000);
            }, 1000);
        }, 1000);
    }, 2000);
}

function testImmatriculation() {
    console.log('Test de l\'immatriculation (US-004)');

    const inputImmat = document.getElementById('inputImmat');
    const btnSubmitImmat = document.getElementById('btnSubmitImmat');

    if (!inputImmat || !btnSubmitImmat) {
        console.error('Éléments immatriculation non trouvés');
        return;
    }

    setTimeout(() => {
        console.log('Test 1: Conversion en majuscules');
        inputImmat.value = 'abc123';
        inputImmat.dispatchEvent(new Event('input'));
        setTimeout(() => {
            console.log('Résultat:', inputImmat.value === 'ABC123' ? 'PASS' : 'FAIL');
        }, 100);
    }, 500);

    setTimeout(() => {
        console.log('Test 2: Soumission immatriculation');
        inputImmat.value = 'XYZ789';
        inputImmat.dispatchEvent(new Event('input'));
        btnSubmitImmat.click();
        console.log('Résultat:', getConfig().immat === 'XYZ789' ? 'PASS' : 'FAIL');
    }, 1500);
}

// ======================================
// Démarrage au chargement du DOM
// ======================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ======================================
// Exposer les fonctions de test pour debug
// ======================================

window.testPayloadBuild = testPayloadBuild;
window.loadRender = loadRender;
