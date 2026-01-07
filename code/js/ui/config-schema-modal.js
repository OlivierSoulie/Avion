/**
 * @fileoverview Gestion du modal de schema de configuration (Documentation)
 * @module ui/config-schema-modal
 * @version 1.0
 */

import { analyzeDatabaseStructure, exportStructureAsJSON } from '../api/database-analyzer.js';
import { getDatabaseId, fetchDatabases } from '../api/index.js';
import { showSuccessToast, showError } from './loader.js';

// Variable globale pour stocker la structure actuelle (partagée avec app.js)
export let currentDatabaseStructure = null;

/**
 * Ouvre le modal de schema de configuration
 * Analyse la base actuelle et affiche sa structure
 */
export async function openConfigSchemaModal() {
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
export function closeConfigSchemaModal() {
    const modal = document.getElementById('configSchemaModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Affiche la structure de la base dans le modal
 * @param {Object} structure - Structure de la base analysée
 */
export function renderDatabaseStructure(structure) {
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
 * Exporte toutes les bases de données en un seul fichier JSON
 */
export async function exportAllDatabaseSchemas() {
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
export function initConfigSchemaModal() {
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
            } else {
                showError('Aucune base analysée');
            }
        });
    }

    // Bouton export toutes les bases
    const exportAllBtn = document.getElementById('exportAllSchemasBtn');
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', exportAllDatabaseSchemas);
    }
}
