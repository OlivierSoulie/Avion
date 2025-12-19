/**
 * @fileoverview Point d'entrée de l'application
 * @version 1.0
 */

import { getConfig, updateConfig, setImages, setLoading, setError, hashConfig, getLastPayload, getViewType } from './state.js';
import {
    STYLES_SLANTED,
    STYLES_STRAIGHT,
    DEFAULT_CONFIG,
    getAirplaneType // US-044
    // IMPORTANT : Toutes les listes de choix (VERSION, PAINT_SCHEMES, PRESTIGE, SPINNER, DECORS, etc.)
    // sont maintenant extraites dynamiquement du XML via getExteriorOptionsFromXML() et getInteriorOptionsFromXML()
} from './config.js';
import {
    renderMosaic,
    renderConfigMosaic,
    renderOverviewMosaic, // US-044
    renderPDFView, // Vue PDF avec hotspots
    initFullscreen,
    showLoader,
    hideLoader,
    showError,
    hideError,
    showPlaceholder,
    hidePlaceholder,
    showSuccessToast,
    initRetryButton,
    initConnectionStatus,
    disableControls,
    enableControls,
    downloadImage,
    enterSelectionMode,
    exitSelectionMode,
    downloadSelectedImages,
    initMobileMenu // Menu burger mobile
} from './ui/index.js';
import { fetchRenderImages, fetchConfigurationImages, fetchOverviewImages, generatePDFView, fetchDatabases, setDatabaseId, getDatabaseId, getDefaultConfig, getInteriorPrestigeConfig as parsePrestigeConfig, getDatabaseXML, getExteriorColorZones, parsePaintSchemeBookmark, getInteriorOptionsFromXML, getExteriorOptionsFromXML, getCameraListFromGroup, validateConfigForDatabase, getPDFCameraId } from './api/index.js';
import { analyzeDatabaseStructure, exportStructureAsJSON } from './api/database-analyzer.js';
import { log } from './logger.js';

// ======================================
// US-033 : Cache des couleurs avec tags pour le filtrage
// ======================================

let colorZonesData = {
    zoneA: [],
    zoneB: [],
    zoneC: [],
    zoneD: [],
    zoneAPlus: []
};

// ======================================
// Configuration Modal - Database Schema
// ======================================

let currentDatabaseStructure = null;

/**
 * Ouvre le modal de configuration et analyse la base actuelle
 */
async function openConfigSchemaModal() {
    const modal = document.getElementById('configSchemaModal');
    if (!modal) return;

    modal.classList.remove('hidden');

    try {
        // Analyser la base actuelle
        const databaseId = getDatabaseId();
        const databaseName = document.getElementById('selectDatabase')?.selectedOptions[0]?.text || 'Base inconnue';

        // Vider les conteneurs (pas le body entier!)
        const containers = [
            'configFeatures',
            'configCameraGroups',
            'configParameters',
            'configPrestiges',
            'configBookmarks'
        ];

        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<p style="text-align: center; padding: 1rem; color: #999;">⏳ Chargement...</p>';
        });

        // Analyser la structure
        currentDatabaseStructure = await analyzeDatabaseStructure(databaseId);
        currentDatabaseStructure.name = databaseName;

        // Afficher les résultats
        renderDatabaseStructure(currentDatabaseStructure);

    } catch (error) {
        console.error('❌ Erreur analyse base:', error);

        // Afficher l'erreur dans les conteneurs
        const containers = ['configFeatures', 'configCameraGroups', 'configParameters', 'configPrestiges', 'configBookmarks'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<p style="text-align: center; padding: 1rem; color: red;">❌ Erreur: ${error.message}</p>`;
        });
    }
}

/**
 * Ferme le modal de configuration
 */
function closeConfigSchemaModal() {
    const modal = document.getElementById('configSchemaModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Affiche la structure de la base dans le modal
 */
function renderDatabaseStructure(structure) {
    if (!structure) {
        console.error('❌ Structure de base invalide');
        return;
    }


    // Infos générales - avec vérification null
    const dbNameEl = document.getElementById('configDbName');
    const dbIdEl = document.getElementById('configDbId');
    const analyzedAtEl = document.getElementById('configAnalyzedAt');

    if (dbNameEl) dbNameEl.textContent = structure.name || '-';
    if (dbIdEl) {
        if (structure.id) {
            // Créer un lien cliquable vers le XML
            const xmlUrl = `https://wr-daher.lumiscaphe.com/Database?databaseId=${structure.id}`;
            dbIdEl.innerHTML = `<a href="${xmlUrl}" target="_blank" rel="noopener noreferrer" class="db-id-link">${structure.id}</a>`;
        } else {
            dbIdEl.textContent = '-';
        }
    }

    if (analyzedAtEl) {
        analyzedAtEl.textContent = structure.analyzedAt ? new Date(structure.analyzedAt).toLocaleString('fr-FR') : '-';
    }

    // US-046 : Type de base (POC/Production) détecté en backend uniquement (pas d'affichage UI)

    // Features
    const featuresContainer = document.getElementById('configFeatures');
    if (!featuresContainer) {
        console.error('❌ Element configFeatures non trouvé');
        return;
    }
    featuresContainer.innerHTML = '';

    const featuresList = [
        // Vues (niveau racine)
        { key: 'hasExterior', label: 'Vue Extérieur', icon: '🏞️', path: 'features' },
        { key: 'hasInterior', label: 'Vue Intérieur', icon: '🪑', path: 'features' },
        { key: 'hasConfiguration', label: 'Vue Configuration', icon: '⚙️', path: 'features' },
        { key: 'hasOverview', label: 'Vue Overview', icon: '📊', path: 'features' },

        // Fonctionnalités interactives (production)
        { key: 'hasDecor', label: 'Décor', icon: '🌍', path: 'features.production' },
        { key: 'hasDoorPilot', label: 'Porte Pilote', icon: '🚪', path: 'features.production' },
        { key: 'hasDoorPassenger', label: 'Porte Passager', icon: '🚪', path: 'features.production' },
        { key: 'hasSunGlass', label: 'Volet Hublots', icon: '🪟', path: 'features.production' },
        { key: 'hasTablet', label: 'Tablette', icon: '📱', path: 'features.production' },
        { key: 'hasLightingCeiling', label: 'Éclairage Plafond', icon: '💡', path: 'features.production' },
        { key: 'hasMoodLights', label: 'Mood Lights', icon: '✨', path: 'features.production' }
    ];

    featuresList.forEach(({ key, label, path }) => {
        // Accéder à la valeur selon le path
        const target = path === 'features' ? structure.features : structure.features.production;
        const available = target[key];

        const item = document.createElement('div');
        item.className = `config-feature-item ${available ? 'available' : 'unavailable'}`;
        item.innerHTML = `
            <span class="icon">${available ? '✅' : '❌'}</span>
            <span class="label">${label}</span>
        `;
        featuresContainer.appendChild(item);
    });

    // Camera Groups
    const cameraGroupsContainer = document.getElementById('configCameraGroups');
    cameraGroupsContainer.innerHTML = '';

    Object.entries(structure.cameraGroups).forEach(([type, data]) => {
        if (!data.available) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'config-camera-group';

        let groupsListHTML = '';
        data.groups.forEach(group => {
            // Liste des noms et IDs de caméras
            let camerasListHTML = '';
            if (group.cameras && group.cameras.length > 0) {
                camerasListHTML = '<ul class="cameras-list">';
                group.cameras.forEach(cam => {
                    camerasListHTML += `<li><span class="cam-name">${cam.name}</span><span class="cam-id">${cam.id}</span></li>`;
                });
                camerasListHTML += '</ul>';
            }

            groupsListHTML += `
                <div class="config-camera-group-item">
                    <div class="name">${group.name}</div>
                    <div class="count">${group.cameraCount} caméra(s)</div>
                    ${camerasListHTML}
                </div>
            `;
        });

        groupDiv.innerHTML = `
            <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
            <div class="pattern">Pattern: ${data.pattern || 'N/A'}</div>
            <div class="groups-list">${groupsListHTML}</div>
        `;
        cameraGroupsContainer.appendChild(groupDiv);
    });

    // Parameters
    const parametersContainer = document.getElementById('configParameters');
    parametersContainer.innerHTML = '';

    // Regroupement spécial pour les Exterior_Colors_Zone
    const colorZonesABCD = ['Exterior_Colors_ZoneA', 'Exterior_Colors_ZoneB', 'Exterior_Colors_ZoneC', 'Exterior_Colors_ZoneD'];
    const processedParams = new Set();

    Object.entries(structure.parameters).forEach(([paramName, paramData]) => {
        // Si c'est une zone A/B/C/D et qu'on ne l'a pas encore traitée
        if (colorZonesABCD.includes(paramName) && !processedParams.has('Colors_ABCD_Group')) {
            // Créer une seule div pour toutes les zones A/B/C/D
            const paramDiv = document.createElement('div');
            paramDiv.className = 'config-parameter-item';

            // Collecter toutes les options de toutes les zones A/B/C/D
            const allOptions = [];
            let totalCount = 0;
            colorZonesABCD.forEach(zoneName => {
                if (structure.parameters[zoneName]) {
                    totalCount += structure.parameters[zoneName].optionCount;
                    structure.parameters[zoneName].options.forEach(opt => {
                        // Éviter les doublons (les couleurs sont les mêmes dans toutes les zones)
                        if (!allOptions.find(o => o.label === opt.label)) {
                            allOptions.push(opt);
                        }
                    });
                }
            });

            let optionsHTML = '';
            allOptions.forEach(opt => {
                optionsHTML += `<div class="config-option-item" title="${opt.value}">${opt.label}</div>`;
            });

            // Utiliser le pattern et la description du premier paramètre trouvé
            const firstZoneData = structure.parameters[colorZonesABCD.find(z => structure.parameters[z])];
            let descriptionHTML = '';
            if (firstZoneData.patternDescription) {
                descriptionHTML = `<div class="config-parameter-description">ℹ️ ${firstZoneData.patternDescription}</div>`;
            }

            paramDiv.innerHTML = `
                <div class="config-parameter-header">
                    <span class="config-parameter-name">Exterior_Colors_ZoneA<br>Exterior_Colors_ZoneB<br>Exterior_Colors_ZoneC<br>Exterior_Colors_ZoneD</span>
                    <span class="config-parameter-count">${allOptions.length} option(s)</span>
                </div>
                <div class="config-parameter-pattern">Pattern: ${firstZoneData.pattern || 'N/A'}</div>
                ${descriptionHTML}
                <div class="config-parameter-options">${optionsHTML}</div>
            `;
            parametersContainer.appendChild(paramDiv);
            processedParams.add('Colors_ABCD_Group');
            return; // Skip les autres zones A/B/C/D
        }

        // Si c'est une zone A/B/C/D mais déjà traitée en groupe, skip
        if (colorZonesABCD.includes(paramName)) {
            return;
        }

        // Traiter normalement tous les autres paramètres (y compris ZoneA+)
        const paramDiv = document.createElement('div');
        paramDiv.className = 'config-parameter-item';

        let optionsHTML = '';
        paramData.options.forEach(opt => {
            optionsHTML += `<div class="config-option-item" title="${opt.value}">${opt.label}</div>`;
        });

        // Description du pattern (si existe)
        let descriptionHTML = '';
        if (paramData.patternDescription) {
            descriptionHTML = `<div class="config-parameter-description">ℹ️ ${paramData.patternDescription}</div>`;
        }

        paramDiv.innerHTML = `
            <div class="config-parameter-header">
                <span class="config-parameter-name">${paramName}</span>
                <span class="config-parameter-count">${paramData.optionCount} option(s)</span>
            </div>
            <div class="config-parameter-pattern">Pattern: ${paramData.pattern || 'N/A'}</div>
            ${descriptionHTML}
            <div class="config-parameter-options">${optionsHTML}</div>
        `;
        parametersContainer.appendChild(paramDiv);
    });

    // Prestiges
    const prestigesContainer = document.getElementById('configPrestiges');
    prestigesContainer.innerHTML = '';

    if (structure.prestigeOptions && structure.prestigeOptions.length > 0) {
        structure.prestigeOptions.forEach(prestige => {
            const prestigeDiv = document.createElement('div');
            prestigeDiv.className = 'config-prestige-item';
            prestigeDiv.textContent = prestige;
            prestigesContainer.appendChild(prestigeDiv);
        });
    } else {
        prestigesContainer.innerHTML = '<p style="color: var(--color-text-secondary);">Aucune option Prestige</p>';
    }

    // Configuration Bookmarks (patterns comme les parameters)
    const bookmarksContainer = document.getElementById('configBookmarks');
    bookmarksContainer.innerHTML = '';

    if (structure.bookmarkPatterns && structure.bookmarkPatterns.length > 0) {
        structure.bookmarkPatterns.forEach(patternData => {
            const patternDiv = document.createElement('div');
            patternDiv.className = 'config-parameter-item';

            // Exemples HTML
            let examplesHTML = '';
            patternData.examples.forEach(example => {
                examplesHTML += `<div class="config-option-item" title="${example}">${example}</div>`;
            });

            // Description du pattern
            let descriptionHTML = '';
            if (patternData.description) {
                descriptionHTML = `<div class="config-parameter-description">ℹ️ ${patternData.description}</div>`;
            }

            // Titre basé sur le pattern
            let titleName = patternData.pattern;
            // Pour Interior_PrestigeSelection_{PrestigeName}, extraire juste "Interior_PrestigeSelection"
            if (titleName.includes('Interior_PrestigeSelection_')) {
                titleName = 'Interior_PrestigeSelection';
            }
            // Pour Exterior_{PaintSchemeName}, extraire juste "Exterior"
            if (titleName.includes('Exterior_{PaintSchemeName}')) {
                titleName = 'Exterior';
            }
            // Pour les patterns RegL/RegR multi-lignes, afficher en lignes séparées
            const titleNameFormatted = titleName.replace(/\n/g, '<br>');
            const patternFormatted = patternData.pattern.replace(/\n/g, '<br>');

            patternDiv.innerHTML = `
                <div class="config-parameter-header">
                    <span class="config-parameter-name">${titleNameFormatted}</span>
                    <span class="config-parameter-count">${patternData.examples.length} bookmark(s)</span>
                </div>
                <div class="config-parameter-pattern">Pattern: ${patternFormatted}</div>
                ${descriptionHTML}
                <div class="config-parameter-options" style="display: flex; flex-direction: column; gap: 0.5rem;">${examplesHTML}</div>
            `;
            bookmarksContainer.appendChild(patternDiv);
        });
    } else {
        bookmarksContainer.innerHTML = '<p style="color: var(--color-text-secondary);">Aucun bookmark</p>';
    }
}

/**
 * Exporte toutes les bases de données
 */
async function exportAllDatabaseSchemas() {
    try {
        const databases = await fetchDatabases();
        const allStructures = {
            generatedAt: new Date().toISOString(),
            databaseVersions: []
        };

        // Afficher progression
        const btn = document.getElementById('exportAllSchemasBtn');
        const originalText = btn.textContent;
        btn.disabled = true;

        for (let i = 0; i < databases.length; i++) {
            const db = databases[i];
            btn.textContent = `⏳ Analyse ${i + 1}/${databases.length}...`;

            const structure = await analyzeDatabaseStructure(db.id);
            structure.name = db.name;
            allStructures.databaseVersions.push(structure);
        }

        // Export
        const jsonString = JSON.stringify(allStructures, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all-databases-schema.json';
        a.click();
        URL.revokeObjectURL(url);

        btn.textContent = originalText;
        btn.disabled = false;

        showSuccessToast(`${databases.length} bases exportées !`);

    } catch (error) {
        console.error('❌ Erreur export:', error);
        showError(`Erreur export: ${error.message}`);
    }
}

/**
 * Initialise les event listeners du modal Configuration
 */
function initConfigSchemaModal() {
    // Bouton d'ouverture dans le header
    const openBtn = document.getElementById('configSchemaBtn');
    if (openBtn) {
        openBtn.addEventListener('click', openConfigSchemaModal);
    }

    // Boutons de fermeture
    const closeBtn = document.getElementById('configSchemaClose');
    const closeBtn2 = document.getElementById('closeConfigSchemaBtn');
    const backdrop = document.getElementById('configSchemaBackdrop');

    if (closeBtn) closeBtn.addEventListener('click', closeConfigSchemaModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeConfigSchemaModal);
    if (backdrop) backdrop.addEventListener('click', closeConfigSchemaModal);

    // Bouton export base actuelle
    const exportCurrentBtn = document.getElementById('exportCurrentSchemaBtn');
    if (exportCurrentBtn) {
        exportCurrentBtn.addEventListener('click', () => {
            if (currentDatabaseStructure) {
                exportStructureAsJSON(currentDatabaseStructure, `${currentDatabaseStructure.name || 'database'}-schema.json`);
                showSuccessToast('Schéma exporté !');
            }
        });
    }

    // Bouton export toutes les bases
    const exportAllBtn = document.getElementById('exportAllSchemasBtn');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', exportAllDatabaseSchemas);
    }

    // Fermeture au clavier (Escape)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('configSchemaModal');
            if (modal && !modal.classList.contains('hidden')) {
                closeConfigSchemaModal();
            }
        }
    });
}

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

/**
 * US-027 : Peuple un dropdown avec une liste d'options (format {label, value})
 * @param {string} selectId - L'ID du select à remplir
 * @param {Array} optionsList - Liste d'objets {label, value}
 * @param {string} defaultValue - La valeur par défaut à sélectionner
 */
function populateDropdown(selectId, optionsList, defaultValue) {
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

    optionsList.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        if (option.value === effectiveDefault) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });
}

/**
 * US-021 : Télécharge le dernier payload JSON
 * Génère un fichier JSON avec le payload envoyé à l'API
 */
function downloadJSON() {

    // Récupérer le dernier payload
    const payload = getLastPayload();

    if (!payload) {
        console.warn('⚠️ Aucun payload disponible');
        showError('Aucune configuration générée. Veuillez d\'abord générer un rendu.');
        setTimeout(() => hideError(), 3000);
        return;
    }

    try {
        // Créer le contenu JSON (indenté pour lisibilité)
        const jsonContent = JSON.stringify(payload, null, 2);

        // Créer un Blob avec le contenu
        const blob = new Blob([jsonContent], { type: 'application/json' });

        // Générer le nom de fichier avec timestamp et nom de la base
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const config = getConfig();
        const databaseName = currentDatabaseStructure?.name || 'base-inconnue';
        const filename = `configurateur-payload-${databaseName}-${config.version}-${config.paintScheme}-${timestamp}.json`;

        // Créer un lien de téléchargement temporaire
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // Déclencher le téléchargement
        document.body.appendChild(link);
        link.click();

        // Nettoyer
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showSuccessToast('JSON téléchargé avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors du téléchargement JSON:', error);
        showError('Erreur lors du téléchargement du JSON.');
        setTimeout(() => hideError(), 3000);
    }
}

// ======================================
// Gestion de la configuration par défaut depuis XML
// ======================================

/**
 * Parse une config string du XML et extrait les valeurs individuelles
 * Format: "Version.960/Exterior_PaintScheme.Sirocco/Interior_PrestigeSelection.Oslo/..."
 *
 * @param {string} configString - La config string depuis <Default value="..." />
 * @returns {Object} Config parsée {version, paintScheme, prestige, decor, spinner}
 */
function parseDefaultConfigString(configString) {

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
        } else if (part.startsWith('Interior_Stitching.')) {
            config.stitching = part.replace('Interior_Stitching.', '');
        }
    }

    return config;
}

/**
 * Vérifie quels groupes caméra existent et masque/affiche les boutons de vue en conséquence
 * US-040: V0.1/V0.2 n'ont pas tous les groupes (Overview, Configuration, etc.)
 */
async function checkViewAvailability() {

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
 */
async function checkActionButtonsAvailability() {

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
 */
async function checkConfigFieldsAvailability() {

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

/**
 * Peuple tous les dropdowns avec les options extraites du XML
 * Appelé lors de l'initialisation et lors du changement de base de données
 */
async function populateAllDropdowns() {

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

/**
 * Charge la config par défaut depuis le XML et initialise le state
 * Retourne true si une config a été chargée, false sinon
 */
async function loadDefaultConfigFromXML() {

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
            // Synchroniser le dropdown décor de la section intérieur
            const selectDecorInterior = document.getElementById('selectDecorInterior');
            if (selectDecorInterior) selectDecorInterior.value = parsedConfig.decor;
        }
        if (parsedConfig.spinner) {
            const selectSpinner = document.getElementById('selectSpinner');
            if (selectSpinner) selectSpinner.value = parsedConfig.spinner;
        }
        if (parsedConfig.stitching) {
            const selectStitching = document.getElementById('stitching');
            if (selectStitching) selectStitching.value = parsedConfig.stitching;
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

// ======================================
// US-019 : Gestion des bases de données
// ======================================

/**
 * Charge la liste des bases de données et peuple le sélecteur
 */
async function loadDatabases() {

    const selectDatabase = document.getElementById('selectDatabase');
    if (!selectDatabase) {
        console.error('❌ Sélecteur de base non trouvé dans le DOM');
        return;
    }


    try {
        // Appeler l'API pour récupérer les bases
        const databases = await fetchDatabases();

        // DEBUG : Afficher la liste complète des bases

        // Vider le select et ajouter les options
        selectDatabase.innerHTML = '';

        if (databases.length === 0) {
            selectDatabase.innerHTML = '<option value="" disabled selected>Aucune base disponible</option>';
            return;
        }

        databases.forEach((db, index) => {
            const option = document.createElement('option');
            option.value = db.id;
            option.textContent = db.name;

            // Sélectionner la DERNIÈRE base par défaut
            if (index === databases.length - 1) {
                option.selected = true;
                setDatabaseId(db.id);
            }

            selectDatabase.appendChild(option);
        });


    } catch (error) {
        console.error('❌ Erreur chargement des bases:', error);
        selectDatabase.innerHTML = '<option value="" disabled selected>Erreur de chargement</option>';
        showError('Impossible de charger les bases de données. Vérifiez votre connexion.');
    }
}

// ======================================
// Initialisation UI
// ======================================

/**
 * Initialise les zones de couleurs personnalisées
 * Récupère les couleurs depuis le XML et peuple les 5 dropdowns
 */
async function initColorZones() {

    try {
        // Récupérer les zones depuis le XML
        const zones = await getExteriorColorZones();

        // US-033 : Stocker les couleurs avec tags pour le filtrage
        colorZonesData = zones;

        // Peupler les dropdowns
        populateColorZone('selectZoneA', zones.zoneA);
        populateColorZone('selectZoneB', zones.zoneB);
        populateColorZone('selectZoneC', zones.zoneC);
        populateColorZone('selectZoneD', zones.zoneD);
        // Zone A+ : Filtrer uniquement les couleurs avec tag "A+"
        const zonePlusColors = zones.zoneAPlus.filter(color => color.tag === 'A+');
        populateColorZone('selectZoneAPlus', zonePlusColors);

        // Synchroniser les zones avec le schéma de peinture actuel
        const currentScheme = getConfig().paintScheme;
        if (currentScheme) {
            // Extraire le nom court du schéma (ignorer l'index et les zones)
            // V0.2-V0.5 : "Tehuano_B-0_..." → "Tehuano"
            // V0.6+     : "Tehuano_6_B-0_..." → "Tehuano"
            const schemeName = currentScheme.split('_')[0];
            await syncZonesWithPaintScheme(schemeName);
        } else {
            // Fallback: Initialiser avec les premières couleurs si pas de schéma
            if (zones.zoneA.length > 0) updateConfig('zoneA', zones.zoneA[0].name);
            if (zones.zoneB.length > 0) updateConfig('zoneB', zones.zoneB[0].name);
            if (zones.zoneC.length > 0) updateConfig('zoneC', zones.zoneC[0].name);
            if (zones.zoneD.length > 0) updateConfig('zoneD', zones.zoneD[0].name);
            if (zonePlusColors.length > 0) updateConfig('zoneAPlus', zonePlusColors[0].name);
        }


    } catch (error) {
        console.error('❌ Erreur initialisation zones de couleurs:', error);
    }
}

/**
 * Peuple un dropdown de zone de couleur
 * @param {string} selectId - ID du select
 * @param {Array} colors - Liste des couleurs parsées
 */
function populateColorZone(selectId, colors) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.warn(`⚠️ Select ${selectId} non trouvé dans le DOM`);
        return;
    }


    // Vider le select
    select.innerHTML = '';

    // Ajouter les options
    colors.forEach(color => {
        const option = document.createElement('option');
        option.value = color.name;
        option.textContent = color.name;
        // Stocker les données complètes dans data attributes
        option.dataset.htmlColor = color.htmlColor;
        option.dataset.tag = color.tag;
        select.appendChild(option);
    });


    // Sélectionner la première couleur par défaut
    if (colors.length > 0) {
        select.value = colors[0].name;
    }

}

/**
 * Synchronise les zones de couleurs avec un schéma de peinture
 * Appelé quand l'utilisateur change le schéma
 *
 * @param {string} schemeName - Nom du schéma (ex: "Zephir")
 */
async function syncZonesWithPaintScheme(schemeName) {

    try {
        // 1. Télécharger le XML
        const xmlDoc = await getDatabaseXML();

        // 2. Parser le bookmark du schéma
        const zoneColors = parsePaintSchemeBookmark(xmlDoc, schemeName);

        if (!zoneColors) {
            console.warn('⚠️ Impossible de parser le bookmark, zones non synchronisées');
            return;
        }

        // 3. Mettre à jour les dropdowns et le state
        const zoneMap = {
            zoneA: 'selectZoneA',
            zoneB: 'selectZoneB',
            zoneC: 'selectZoneC',
            zoneD: 'selectZoneD',
            zoneAPlus: 'selectZoneAPlus'
        };

        for (const [stateKey, selectId] of Object.entries(zoneMap)) {
            const colorName = zoneColors[stateKey];
            if (colorName) {
                const select = document.getElementById(selectId);
                if (select) {
                    select.value = colorName;
                    updateConfig(stateKey, colorName);
                }
            }
        }


    } catch (error) {
        console.error('❌ Erreur synchronisation zones:', error);
    }
}

/**
 * Initialise l'interface utilisateur
 * Remplit tous les dropdowns avec les valeurs de config
 */
async function initUI() {

    // US-019: Charger les bases de données en premier
    await loadDatabases();

    const config = getConfig();

    // Peupler tous les dropdowns depuis le XML
    try {
        await populateAllDropdowns();
    } catch (error) {
        log.error('Erreur chargement options depuis XML:', error);
        // En cas d'erreur, les dropdowns resteront vides
    }

    // Initialiser les radio buttons perforation
    const perforatedRadios = document.querySelectorAll('input[name="perforated-seat"]');
    perforatedRadios.forEach(radio => {
        if (radio.value === config.perforatedSeatOptions) {
            radio.checked = true;
        }
    });

    // Peupler les zones de couleurs personnalisées
    await initColorZones();

    // US-032 : Event listeners mode sélection
    const btnBulkDownload = document.getElementById('btnBulkDownload');
    const btnCancelSelection = document.getElementById('btnCancelSelection');
    const btnDownloadSelected = document.getElementById('btnDownloadSelected');

    btnBulkDownload?.addEventListener('click', enterSelectionMode);
    btnCancelSelection?.addEventListener('click', exitSelectionMode);
    btnDownloadSelected?.addEventListener('click', downloadSelectedImages);

}

// ======================================
// US-005 : Gestion des rendus API
// ======================================

let renderTimeout = null;
// BUG-001 FIX: Variable pour détecter si la config a changé
let lastConfigHash = null;

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
 * Masque le viewer PDF s'il existe
 */
function hidePDFViewer() {
    const pdfViewWrapper = document.querySelector('.pdf-view-wrapper');
    if (pdfViewWrapper) {
        pdfViewWrapper.remove();
    }
}

/**
 * Génère et affiche la vue PDF avec hotspots
 * @returns {Promise<Object>} {imageUrl, hotspots}
 * @throws {Error} Si le chargement ou la génération échoue
 */
async function loadAndDisplayPDFView() {
    // Récupérer le paint scheme actuel depuis la config
    const config = getConfig();
    const fullPaintScheme = config.paintScheme || 'Tehuano'; // Fallback sur Tehuano si non défini

    // Extraire le nom court du paintScheme (ex: "Tehuano_6_A-0_A-D_..." → "Tehuano")
    const paintScheme = fullPaintScheme.split('_')[0];

    console.log('🎨 Paint scheme complet:', fullPaintScheme);
    console.log('🎨 Paint scheme court (pour hotspots):', paintScheme);

    // Charger le fichier JSON consolidé avec tous les paint schemes
    const response = await fetch('data/pdf-hotspots.json');
    if (!response.ok) {
        throw new Error('Impossible de charger pdf-hotspots.json');
    }

    const pdfData = await response.json();
    console.log('📋 Paint schemes disponibles dans JSON:', Object.keys(pdfData));

    // Récupérer les hotspots pour le paint scheme actuel
    let paintSchemeData = pdfData[paintScheme];
    if (!paintSchemeData) {
        console.warn(`⚠️ Paint scheme "${paintScheme}" non trouvé dans pdf-hotspots.json, utilisation de Tehuano par défaut`);
        paintSchemeData = pdfData['Tehuano']; // Fallback
    } else {
        console.log('✅ Hotspots chargés pour:', paintScheme);
    }

    // Récupérer dynamiquement l'ID de la 2ème caméra du groupe Exterieur_DecorStudio depuis le XML
    const cameraId = await getPDFCameraId();

    // Construire l'objet de config pour generatePDFView
    const pdfConfig = {
        camera: cameraId,
        hotspots: paintSchemeData.hotspots
    };

    // Générer la vue PDF avec la config actuelle
    const { imageUrl, hotspots } = await generatePDFView(pdfConfig);

    // Afficher la vue PDF
    const container = document.getElementById('viewportDisplay');
    renderPDFView(container, imageUrl, hotspots);

    return { imageUrl, hotspots };
}

/**
 * Charge un nouveau rendu via l'API
 * Gère loader, erreurs et mise à jour du carrousel
 */
async function loadRender() {

    try {
        // 1. Récupérer la config actuelle
        const config = getConfig();

        // US-040: Valider la config pour la base actuelle
        const { config: validatedConfig, corrections } = await validateConfigForDatabase(config);

        // Si corrections appliquées, informer l'utilisateur
        if (corrections.length > 0) {
            console.warn(`⚠️ ${corrections.length} correction(s) appliquée(s) pour compatibilité base`);
            showSuccessToast(`Configuration adaptée (${corrections.length} corrections)`);
        }

        // BUG-001 FIX: Vérifier si la config a changé
        const currentHash = hashConfig(validatedConfig);
        if (currentHash === lastConfigHash) {
            return;
        }
        lastConfigHash = currentHash;

        // 2. Afficher le loader
        showLoader('Génération en cours...');
        disableControls();
        setLoading(true);
        setError(null);

        // 3. Appeler l'API avec la config validée
        const viewType = getViewType(); // Récupérer la vue courante (exterior/interior/configuration/pdf)

        let images;

        // Vue PDF : Regénérer la vue avec les nouvelles couleurs
        if (viewType === 'pdf') {
            await loadAndDisplayPDFView();

            hideLoader();
            enableControls();
            setLoading(false);

            showSuccessToast('Vue PDF mise à jour avec succès !');
            return; // Sortir de la fonction
        }

        // US-042: Pour la vue Configuration, utiliser fetchConfigurationImages() qui fait 2 appels API
        if (viewType === 'configuration') {
            images = await fetchConfigurationImages(validatedConfig);
        } else {
            // Pour exterior/interior, appel API classique
            images = await fetchRenderImages(validatedConfig);
        }

        // 4. Mettre à jour le state
        setImages(images);

        // 5. Afficher les images dans la mosaïque
        hideLoader();

        if (viewType === 'configuration') {
            // Afficher la mosaïque Configuration avec ratios mixtes
            await renderConfigMosaic(images);
        } else {
            // Pour exterior/interior, passer les objets complets avec métadonnées
            renderMosaic(images, viewType);
        }

        // BUG-002 FIX: Afficher le message de succès
        showSuccessToast('Rendu généré avec succès !');


    } catch (error) {
        // Gérer l'erreur
        console.error('Erreur lors du chargement du rendu:', error);

        hideLoader();

        // BUG-004 FIX: Afficher le placeholder avant l'erreur
        showPlaceholder('Erreur lors de la génération du rendu');

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
// US-027 : Affichage conditionnel section intérieur
// ======================================

/**
 * US-027 : Affiche ou masque la section intérieur selon le type de vue
 * @param {string} viewType - "exterior" ou "interior"
 */
/**
 * US-028 : Affichage conditionnel des contrôles selon la vue active
 * @param {string} viewType - 'exterior' ou 'interior'
 */
function toggleViewControls(viewType) {
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
// US-034 : Immatriculation dynamique selon modèle
// ======================================

/**
 * US-034 : Met à jour l'immatriculation par défaut selon le modèle
 * Ne met à jour QUE si l'utilisateur n'a pas customisé l'immat
 *
 * @param {string} model - Modèle d'avion ("960" ou "980")
 */
function updateDefaultImmatFromModel(model) {
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

// ======================================
// US-033 : Recherche par tags dans zones de couleurs
// ======================================

/**
 * US-033 : Filtre un dropdown de zone de couleur selon le terme de recherche
 * Recherche dans le nom de la couleur ET dans les tags
 * Insensible à la casse
 *
 * @param {string} zoneId - ID du dropdown (ex: "selectZoneA")
 * @param {string} searchTerm - Terme de recherche
 */
function filterColorDropdown(zoneId, searchTerm) {
    const dropdown = document.getElementById(zoneId);
    if (!dropdown) return;

    // Déterminer quelle zone on filtre
    const zoneMap = {
        'selectZoneA': 'zoneA',
        'selectZoneB': 'zoneB',
        'selectZoneC': 'zoneC',
        'selectZoneD': 'zoneD',
        'selectZoneAPlus': 'zoneAPlus'
    };

    const zoneKey = zoneMap[zoneId];
    if (!zoneKey || !colorZonesData[zoneKey]) {
        console.error('Zone inconnue:', zoneId);
        return;
    }

    const colors = colorZonesData[zoneKey];
    const currentValue = dropdown.value; // Sauvegarder la valeur sélectionnée

    // Normaliser le terme de recherche (lowercase, trim)
    const term = searchTerm.toLowerCase().trim();

    // Si pas de recherche, afficher tout
    if (term === '') {
        populateColorZone(zoneId, colors);
        dropdown.value = currentValue; // Restaurer la sélection
        return;
    }

    // Filtrer les couleurs
    const filteredColors = colors.filter(color => {
        // Recherche dans le nom (insensible à la casse)
        if (color.name.toLowerCase().includes(term)) {
            return true;
        }

        // Recherche dans les tags
        if (color.tags && Array.isArray(color.tags)) {
            return color.tags.some(tag => tag.toLowerCase().includes(term));
        }

        return false;
    });

    // Repeupler le dropdown avec les couleurs filtrées
    if (filteredColors.length > 0) {
        populateColorZone(zoneId, filteredColors);
        dropdown.value = currentValue; // Restaurer la sélection si elle est dans les résultats
    } else {
        // Aucune correspondance : afficher un message
        dropdown.innerHTML = '<option value="">Aucune correspondance</option>';
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

    // US-019: Dropdown Base de données
    const selectDatabase = document.getElementById('selectDatabase');
    if (selectDatabase) {
        selectDatabase.addEventListener('change', async (e) => {
            const databaseId = e.target.value;
            const databaseName = e.target.options[e.target.selectedIndex].text;


            try {
                // US-039: Changement de base → Recharger config par défaut
                showLoader('Chargement');

                // 1. Changer l'ID de base (invalide le cache XML)
                setDatabaseId(databaseId);

                // 2. Recharger la configuration par défaut depuis le nouveau XML
                await loadDefaultConfigFromXML();

                // 3. Réinitialiser le hash pour forcer le rechargement des images
                lastConfigHash = null;

                // 4. Charger les images avec la nouvelle config
                await loadRender();

                showSuccessToast(`Base "${databaseName}" chargée avec succès`);

            } catch (error) {
                hideLoader();
                console.error('❌ Erreur lors du changement de base:', error);
                showError(`Erreur lors du chargement de la base: ${error.message}`);
            }
        });
    }

    // Dropdown Modèle Avion (version)
    const selectVersion = document.getElementById('selectVersion');
    if (selectVersion) {
        selectVersion.addEventListener('change', (e) => {
            updateConfig('version', e.target.value);
            updateDefaultImmatFromModel(e.target.value); // US-034: Mettre à jour immat par défaut
            triggerRender(); // US-005: Appel API automatique
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

            triggerRender(); // US-005: Appel API automatique
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
                lastConfigHash = null;

                // 6. Déclencher nouveau rendu
                triggerRender();

            } catch (error) {
                console.error('❌ Erreur parsing prestige:', error);
                showError('Erreur lors du chargement du prestige');
                setTimeout(() => hideError(), 3000);
                // Quand même déclencher le rendu avec les valeurs par défaut
                triggerRender();
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

            triggerRender(); // US-005: Appel API automatique
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

            triggerRender(); // US-005: Appel API automatique
        });
    }

    // Dropdown Hélice (spinner)
    const selectSpinner = document.getElementById('selectSpinner');
    if (selectSpinner) {
        selectSpinner.addEventListener('change', (e) => {
            updateConfig('spinner', e.target.value);
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
                triggerRender(); // US-005: Appel API automatique
            }
        });
    }

    if (radioStraight) {
        radioStraight.addEventListener('change', () => {
            if (radioStraight.checked) {
                updateConfig('fontType', 'straight');
                updateStyleDropdown('straight');
                triggerRender(); // US-005: Appel API automatique
            }
        });
    }

    // Dropdown Style
    const selectStyle = document.getElementById('selectStyle');
    if (selectStyle) {
        selectStyle.addEventListener('change', (e) => {
            updateConfig('style', e.target.value);
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
                triggerRender(); // US-005: Appel API
            } else {
            }
        });
    }

    // ======================================
    // US-021 : Téléchargement JSON
    // ======================================

    const btnDownloadJSON = document.getElementById('btnDownloadJSON');
    if (btnDownloadJSON) {
        btnDownloadJSON.addEventListener('click', (e) => {
            e.preventDefault();
            downloadJSON();
        });
    }

    // ======================================
    // US-022 : Sélecteur Vue Ext/Int
    // US-042 : Ajout vue Configuration
    // ======================================

    const btnViewExterior = document.getElementById('btnViewExterior');
    const btnViewInterior = document.getElementById('btnViewInterior');
    const btnViewConfiguration = document.getElementById('btnViewConfiguration');
    const btnViewOverview = document.getElementById('btnViewOverview');
    const btnViewPDF = document.getElementById('btnViewPDF');

    if (btnViewExterior && btnViewInterior) {
        btnViewExterior.addEventListener('click', () => {
            // Masquer le viewer PDF si actif
            hidePDFViewer();

            // Mettre à jour l'UI
            btnViewExterior.classList.add('active');
            btnViewInterior.classList.remove('active');
            if (btnViewConfiguration) btnViewConfiguration.classList.remove('active');
            if (btnViewOverview) btnViewOverview.classList.remove('active');
            if (btnViewPDF) btnViewPDF.classList.remove('active');

            // Mettre à jour le state
            updateConfig('viewType', 'exterior');

            // US-028 : Affichage conditionnel des contrôles
            toggleViewControls('exterior');

            // Déclencher le rendu
            triggerRender();
        });

        btnViewInterior.addEventListener('click', () => {
            // Masquer le viewer PDF si actif
            hidePDFViewer();

            // Mettre à jour l'UI
            btnViewInterior.classList.add('active');
            btnViewExterior.classList.remove('active');
            if (btnViewConfiguration) btnViewConfiguration.classList.remove('active');
            if (btnViewOverview) btnViewOverview.classList.remove('active');
            if (btnViewPDF) btnViewPDF.classList.remove('active');

            // Mettre à jour le state
            updateConfig('viewType', 'interior');

            // US-028 : Affichage conditionnel des contrôles
            toggleViewControls('interior');

            // Déclencher le rendu
            triggerRender();
        });
    }

    // US-042: Bouton vue Configuration
    if (btnViewConfiguration) {
        btnViewConfiguration.addEventListener('click', () => {
            // Masquer le viewer PDF si actif
            hidePDFViewer();

            // Mettre à jour l'UI
            btnViewConfiguration.classList.add('active');
            if (btnViewExterior) btnViewExterior.classList.remove('active');
            if (btnViewInterior) btnViewInterior.classList.remove('active');
            if (btnViewOverview) btnViewOverview.classList.remove('active');
            if (btnViewPDF) btnViewPDF.classList.remove('active');

            // Mettre à jour le state
            updateConfig('viewType', 'configuration');

            // Masquer tous les contrôles (pas de personnalisation en vue Configuration)
            toggleViewControls('configuration');

            // US-049: Forcer la regénération pour avoir les vignettes à jour
            lastConfigHash = null;
            setImages([]); // Vider les images du state pour forcer la regénération

            // Déclencher le rendu
            triggerRender();
        });
    }

    // US-044: Bouton vue Overview
    if (btnViewOverview) {
        btnViewOverview.addEventListener('click', async () => {
            try {
                // Masquer le viewer PDF si actif
                hidePDFViewer();

                // Mettre à jour l'UI
                btnViewOverview.classList.add('active');
                if (btnViewExterior) btnViewExterior.classList.remove('active');
                if (btnViewInterior) btnViewInterior.classList.remove('active');
                if (btnViewConfiguration) btnViewConfiguration.classList.remove('active');
                if (btnViewPDF) btnViewPDF.classList.remove('active');


                // Masquer tous les contrôles (pas de personnalisation en vue Overview)
                toggleViewControls('overview');

                // Afficher le loader
                showLoader('Génération vue Overview...');
                disableControls();
                setLoading(true);

                // Récupérer la config actuelle
                const config = getConfig();

                // Appeler l'API pour récupérer les images Overview
                const { imageA, imagesSecondary } = await fetchOverviewImages(config);

                // Récupérer le type d'avion depuis la version du dropdown
                const airplaneType = getAirplaneType(config.version);

                // Masquer loader
                hideLoader();
                enableControls();
                setLoading(false);

                // Afficher la mosaïque Overview
                renderOverviewMosaic(imageA, imagesSecondary, airplaneType);

                // Afficher message de succès
                showSuccessToast('Vue Overview générée avec succès !');

            } catch (error) {
                console.error('Erreur génération vue Overview:', error);

                // Masquer loader
                hideLoader();
                enableControls();
                setLoading(false);

                // Afficher erreur
                showPlaceholder('Erreur lors de la génération de la vue Overview');
                showError('Erreur génération vue Overview: ' + error.message);
            }
        });
    }

    // Vue PDF avec hotspots
    if (btnViewPDF) {
        btnViewPDF.addEventListener('click', async () => {
            try {
                // Mettre à jour l'UI
                btnViewPDF.classList.add('active');
                if (btnViewExterior) btnViewExterior.classList.remove('active');
                if (btnViewInterior) btnViewInterior.classList.remove('active');
                if (btnViewConfiguration) btnViewConfiguration.classList.remove('active');
                if (btnViewOverview) btnViewOverview.classList.remove('active');

                // Mettre à jour le state
                updateConfig('viewType', 'pdf');

                // Afficher les contrôles extérieurs (couleurs)
                toggleViewControls('pdf');

                // Afficher le loader
                showLoader('Génération vue PDF avec hotspots...');
                disableControls();
                setLoading(true);

                // Générer et afficher la vue PDF
                await loadAndDisplayPDFView();

                // Masquer loader
                hideLoader();
                enableControls();
                setLoading(false);

                // Afficher message de succès
                showSuccessToast('Vue PDF générée avec succès !');

            } catch (error) {
                console.error('❌ Erreur génération vue PDF:', error);

                // Masquer loader
                hideLoader();
                enableControls();
                setLoading(false);

                // Afficher placeholder seulement (pas de popup)
                showPlaceholder('Erreur lors de la génération de la vue PDF. Voir console pour détails.');
            }
        });
    }

    // US-024 : Event listeners Lunettes de soleil
    const btnSunGlassOFF = document.getElementById('btnSunGlassOFF');
    const btnSunGlassON = document.getElementById('btnSunGlassON');

    if (btnSunGlassOFF && btnSunGlassON) {
        btnSunGlassOFF.addEventListener('click', () => {
            btnSunGlassOFF.classList.add('active');
            btnSunGlassON.classList.remove('active');
            updateConfig('sunglass', 'SunGlassOFF');
            triggerRender();
        });

        btnSunGlassON.addEventListener('click', () => {
            btnSunGlassON.classList.add('active');
            btnSunGlassOFF.classList.remove('active');
            updateConfig('sunglass', 'SunGlassON');
            triggerRender();
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
            triggerRender();
        });

        btnTabletOpen.addEventListener('click', () => {
            btnTabletOpen.classList.add('active');
            btnTabletClosed.classList.remove('active');
            updateConfig('tablet', 'Open');
            triggerRender();
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
            triggerRender();
        });

        btnMoodLightsON.addEventListener('click', () => {
            btnMoodLightsON.classList.add('active');
            btnMoodLightsOFF.classList.remove('active');
            updateConfig('moodLights', 'Lighting_Mood_ON');
            triggerRender();
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
            triggerRender();
        });

        btnDoorPilotOpen.addEventListener('click', () => {
            btnDoorPilotOpen.classList.add('active');
            btnDoorPilotClosed.classList.remove('active');
            updateConfig('doorPilot', 'Open');
            triggerRender();
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
            triggerRender();
        });

        btnDoorPassengerOpen.addEventListener('click', () => {
            btnDoorPassengerOpen.classList.add('active');
            btnDoorPassengerClosed.classList.remove('active');
            updateConfig('doorPassenger', 'Open');
            triggerRender();
        });
    }

    // ======================================
    // US-027 : Event listeners pour les 10 dropdowns intérieur
    // ======================================

    document.getElementById('carpet').addEventListener('change', (e) => {
        updateConfig('carpet', e.target.value);
        triggerRender();
    });

    document.getElementById('seat-covers').addEventListener('change', (e) => {
        updateConfig('seatCovers', e.target.value);
        triggerRender();
    });

    document.getElementById('tablet-finish').addEventListener('change', (e) => {
        updateConfig('tabletFinish', e.target.value);
        triggerRender();
    });

    document.getElementById('seatbelts').addEventListener('change', (e) => {
        updateConfig('seatbelts', e.target.value);
        triggerRender();
    });

    document.getElementById('metal-finish').addEventListener('change', (e) => {
        updateConfig('metalFinish', e.target.value);
        triggerRender();
    });

    document.getElementById('upper-side-panel').addEventListener('change', (e) => {
        updateConfig('upperSidePanel', e.target.value);
        triggerRender();
    });

    document.getElementById('lower-side-panel').addEventListener('change', (e) => {
        updateConfig('lowerSidePanel', e.target.value);
        triggerRender();
    });

    document.getElementById('ultra-suede-ribbon').addEventListener('change', (e) => {
        updateConfig('ultraSuedeRibbon', e.target.value);
        triggerRender();
    });

    // US-036 : Event listener Stitching
    document.getElementById('stitching').addEventListener('change', (e) => {
        updateConfig('stitching', e.target.value);
        triggerRender();
    });

    // US-037 : Toggle buttons Matériau Central
    const btnCentralSeatSuede = document.getElementById('btnCentralSeatSuede');
    const btnCentralSeatCuir = document.getElementById('btnCentralSeatCuir');

    if (btnCentralSeatSuede && btnCentralSeatCuir) {
        btnCentralSeatSuede.addEventListener('click', () => {
            btnCentralSeatSuede.classList.add('active');
            btnCentralSeatCuir.classList.remove('active');
            updateConfig('centralSeatMaterial', 'Ultra-Suede_Premium');
            triggerRender();
        });

        btnCentralSeatCuir.addEventListener('click', () => {
            btnCentralSeatCuir.classList.add('active');
            btnCentralSeatSuede.classList.remove('active');
            updateConfig('centralSeatMaterial', 'Leather_Premium');
            triggerRender();
        });
    }

    // Event listener pour les radio buttons perforation
    const perforatedRadios = document.querySelectorAll('input[name="perforated-seat"]');
    perforatedRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateConfig('perforatedSeatOptions', e.target.value);
            triggerRender();
        });
    });

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

            triggerRender();
        });
    }

    if (selectZoneB) {
        selectZoneB.addEventListener('change', (e) => {
            updateConfig('zoneB', e.target.value);
            triggerRender();
        });
    }

    if (selectZoneC) {
        selectZoneC.addEventListener('change', (e) => {
            updateConfig('zoneC', e.target.value);
            triggerRender();
        });
    }

    if (selectZoneD) {
        selectZoneD.addEventListener('change', (e) => {
            updateConfig('zoneD', e.target.value);
            triggerRender();
        });
    }

    if (selectZoneAPlus) {
        selectZoneAPlus.addEventListener('change', (e) => {
            updateConfig('zoneAPlus', e.target.value);
            triggerRender();
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

/**
 * Met à jour le dropdown Style selon le type de police
 * @param {string} fontType - 'slanted' ou 'straight'
 */
function updateStyleDropdown(fontType, stylesSlanted = null, stylesStraight = null) {

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
// Initialisation de l'application
// ======================================
// Système d'Accordéon
// ======================================

/**
 * Initialise le système d'accordéon pour les sections de configuration
 * Permet d'ouvrir/fermer les sections en cliquant sur les headers
 */
function initAccordion() {

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

/**
 * Point d'entrée principal de l'application
 * Appelé quand le DOM est prêt
 */
async function init() {

    // Initialiser l'UI (async car charge les bases de données)
    await initUI();

    // Charger la config par défaut depuis le XML
    const defaultConfigLoaded = await loadDefaultConfigFromXML();

    // US-034 : Initialiser immat par défaut selon modèle
    updateDefaultImmatFromModel(getConfig().version);

    // Initialiser le carrousel (US-029: Remplacé par mosaïque, plus besoin d'init)
    // initCarousel();

    // BUG-003 FIX: Initialiser l'indicateur de connexion
    initConnectionStatus();

    // US-020: Initialiser le plein écran
    initFullscreen();

    // Initialiser le menu burger mobile
    initMobileMenu();

    // Initialiser le modal Configuration/Schémas XML
    initConfigSchemaModal();

    // Initialiser le bouton Réessayer (US-005)
    initRetryButton(() => {
        loadRender();
    });

    // Attacher les event listeners sur les contrôles (US-003)
    attachEventListeners();

    // Initialiser le système d'accordéon
    initAccordion();

    // US-027 : Afficher/masquer section intérieur selon vue initiale
    toggleViewControls(getConfig().viewType);

    // Modes de test
    if (window.location.search.includes('test-carousel')) {
        testCarousel();
    } else if (window.location.search.includes('test-controls')) {
        testControls();
    } else if (window.location.search.includes('test-immat')) {
        testImmatriculation();
    } else if (window.location.search.includes('test-payload')) {
        console.warn('⚠️ testPayloadBuild() a été supprimé lors du refactoring');
    } else {
        // Charger automatiquement le rendu initial avec la config par défaut
        if (defaultConfigLoaded) {
        } else {
        }
        loadRender();
    }

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


    setTimeout(() => {
        renderMosaic(testImages, 'exterior');
    }, 500);
}

function testControls() {

    setTimeout(() => {
        document.getElementById('selectVersion').value = '980';
        document.getElementById('selectVersion').dispatchEvent(new Event('change'));

        setTimeout(() => {
            document.getElementById('selectPaintScheme').value = 'Mistral';
            document.getElementById('selectPaintScheme').dispatchEvent(new Event('change'));

            setTimeout(() => {
                document.getElementById('radioStraight').checked = true;
                document.getElementById('radioStraight').dispatchEvent(new Event('change'));

                setTimeout(() => {
                }, 1000);
            }, 1000);
        }, 1000);
    }, 2000);
}

function testImmatriculation() {

    const inputImmat = document.getElementById('inputImmat');
    const btnSubmitImmat = document.getElementById('btnSubmitImmat');

    if (!inputImmat || !btnSubmitImmat) {
        console.error('Éléments immatriculation non trouvés');
        return;
    }

    setTimeout(() => {
        inputImmat.value = 'abc123';
        inputImmat.dispatchEvent(new Event('input'));
        setTimeout(() => {
        }, 100);
    }, 500);

    setTimeout(() => {
        inputImmat.value = 'XYZ789';
        inputImmat.dispatchEvent(new Event('input'));
        btnSubmitImmat.click();
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

// testPayloadBuild supprimé lors du refactoring
window.loadRender = loadRender;
