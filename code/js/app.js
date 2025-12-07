/**
 * @fileoverview Point d'entrée de l'application
 * @version 1.0
 */

import { getConfig, updateConfig, setImages, setLoading, setError, hashConfig, getLastPayload, getViewType } from './state.js';
import {
    STYLES_SLANTED,
    STYLES_STRAIGHT,
    DECORS_CONFIG,
    DEFAULT_CONFIG,
    getAirplaneType // US-044
    // IMPORTANT : Toutes les listes de choix (VERSION, PAINT_SCHEMES, PRESTIGE, SPINNER, etc.)
    // sont maintenant extraites dynamiquement du XML via getExteriorOptionsFromXML() et getInteriorOptionsFromXML()
    // DECORS_CONFIG est conservé car il contient de la logique (type, suffix), pas seulement des données
} from './config.js';
import {
    renderMosaic,
    renderConfigMosaic,
    renderOverviewMosaic, // US-044
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
import { fetchRenderImages, fetchConfigurationImages, fetchOverviewImages, fetchDatabases, setDatabaseId, getDatabaseId, getDefaultConfig, getInteriorPrestigeConfig as parsePrestigeConfig, getDatabaseXML, getExteriorColorZones, parsePaintSchemeBookmark, getInteriorOptionsFromXML, getExteriorOptionsFromXML, getCameraListFromGroup } from './api/index.js';
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

    console.log(`📋 populateDropdown: ${selectId}, ${optionsList.length} options, défaut="${defaultValue}"`);

    // Si pas de defaultValue et qu'on a des options, utiliser la première
    const effectiveDefault = defaultValue || (optionsList.length > 0 ? optionsList[0].value : null);

    // Vider le select existant
    select.innerHTML = '';

    // Ajouter les options
    optionsList.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        if (option.value === effectiveDefault) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });

    console.log(`✓ ${selectId}: ${select.options.length} options ajoutées (sélectionné: ${effectiveDefault})`);
}

/**
 * US-021 : Télécharge le dernier payload JSON
 * Génère un fichier JSON avec le payload envoyé à l'API
 */
function downloadJSON() {
    console.log('📥 Téléchargement du payload JSON...');

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

        // Générer le nom de fichier avec timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const config = getConfig();
        const filename = `configurateur-payload-${config.version}-${config.paintScheme}-${timestamp}.json`;

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

        console.log(`✅ JSON téléchargé : ${filename}`);
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
    console.log('🔧 Parsing de la config string par défaut...');
    console.log('   Config string complète:', configString);

    const config = {};
    const parts = configString.split('/');

    console.log('   Parties trouvées:', parts);

    for (const part of parts) {
        console.log('   > Analyse de:', part);

        if (part.startsWith('Version.')) {
            config.version = part.replace('Version.', '');
            console.log('     ✅ Version:', config.version);
        } else if (part.startsWith('Exterior_PaintScheme.')) {
            // Prendre tout après "Exterior_PaintScheme." mais juste le nom (avant les autres params)
            const fullValue = part.replace('Exterior_PaintScheme.', '');
            // Le nom du scheme est le premier élément (avant underscore avec chiffres)
            config.paintScheme = fullValue.split('_')[0];
            console.log('     ✅ PaintScheme (valeur complète):', fullValue);
            console.log('     ✅ PaintScheme (nom extrait):', config.paintScheme);
        } else if (part.startsWith('Interior_PrestigeSelection.')) {
            const fullValue = part.replace('Interior_PrestigeSelection.', '');
            config.prestige = fullValue.split('_')[0];
            console.log('     ✅ Prestige:', config.prestige);
        } else if (part.startsWith('Position.')) {
            config.decor = part.replace('Position.', '');
            console.log('     ✅ Decor (Position):', config.decor);
        } else if (part.startsWith('Decor.')) {
            // Extraire le nom du décor (avant _Ground ou _Flight)
            const decorFull = part.replace('Decor.', '');
            config.decor = decorFull.split('_')[0];
            console.log('     ✅ Decor:', config.decor);
        } else if (part.startsWith('Exterior_Spinner.')) {
            config.spinner = part.replace('Exterior_Spinner.', '');
            console.log('     ✅ Spinner:', config.spinner);
        } else if (part.startsWith('Interior_Stitching.')) {
            config.stitching = part.replace('Interior_Stitching.', '');
            console.log('     ✅ Stitching:', config.stitching);
        }
    }

    console.log('✅ Config parsée finale:', config);
    return config;
}

/**
 * Charge la config par défaut depuis le XML et initialise le state
 * Retourne true si une config a été chargée, false sinon
 */
async function loadDefaultConfigFromXML() {
    console.log('📦 Chargement de la configuration par défaut depuis le XML...');

    try {
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

        console.log('✅ Configuration par défaut appliquée depuis le XML');
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
    console.log('📋 Chargement de la liste des bases de données...');

    const selectDatabase = document.getElementById('selectDatabase');
    if (!selectDatabase) {
        console.error('❌ Sélecteur de base non trouvé dans le DOM');
        return;
    }

    console.log('   > Sélecteur trouvé:', selectDatabase);

    try {
        // Appeler l'API pour récupérer les bases
        console.log('   > Appel fetchDatabases()...');
        const databases = await fetchDatabases();
        console.log('   > fetchDatabases() terminé, données reçues:', databases);

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
                console.log(`✅ Base par défaut (dernière): ${db.name} (${db.id})`);
            }

            selectDatabase.appendChild(option);
        });

        console.log(`✅ ${databases.length} base(s) chargée(s) dans le sélecteur`);

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
    console.log('🎨 Initialisation des zones de couleurs...');

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
            await syncZonesWithPaintScheme(currentScheme);
            console.log('✅ Zones synchronisées avec le schéma par défaut');
        } else {
            // Fallback: Initialiser avec les premières couleurs si pas de schéma
            if (zones.zoneA.length > 0) updateConfig('zoneA', zones.zoneA[0].name);
            if (zones.zoneB.length > 0) updateConfig('zoneB', zones.zoneB[0].name);
            if (zones.zoneC.length > 0) updateConfig('zoneC', zones.zoneC[0].name);
            if (zones.zoneD.length > 0) updateConfig('zoneD', zones.zoneD[0].name);
            if (zonePlusColors.length > 0) updateConfig('zoneAPlus', zonePlusColors[0].name);
        }

        console.log('✅ Zones de couleurs initialisées');

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

    console.log(`   > Peuplement ${selectId} : ${colors.length} couleurs`);

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

    console.log(`   ✅ ${selectId} peuplé avec ${select.options.length} options`);

    // Sélectionner la première couleur par défaut
    if (colors.length > 0) {
        select.value = colors[0].name;
    }

    console.log(`   > ${selectId}: ${colors.length} couleurs`);
}

/**
 * Synchronise les zones de couleurs avec un schéma de peinture
 * Appelé quand l'utilisateur change le schéma
 *
 * @param {string} schemeName - Nom du schéma (ex: "Zephir")
 */
async function syncZonesWithPaintScheme(schemeName) {
    console.log(`🔄 Synchronisation zones avec schéma: ${schemeName}`);

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
                    console.log(`   ✅ ${stateKey}: ${colorName}`);
                }
            }
        }

        console.log('✅ Zones synchronisées avec succès');

    } catch (error) {
        console.error('❌ Erreur synchronisation zones:', error);
    }
}

/**
 * Initialise l'interface utilisateur
 * Remplit tous les dropdowns avec les valeurs de config
 */
async function initUI() {
    console.log('Initialisation de l\'interface...');

    // US-019: Charger les bases de données en premier
    await loadDatabases();

    const config = getConfig();

    // Télécharger le XML et extraire TOUTES les options (extérieur + intérieur)
    try {
        log.init('Extraction de toutes les options depuis XML...');
        const xmlDoc = await getDatabaseXML();

        // Extraire les options extérieur
        const exteriorOptions = getExteriorOptionsFromXML(xmlDoc);

        // Peupler les dropdowns extérieur avec les valeurs du XML
        populateDropdown('selectVersion', exteriorOptions.version, DEFAULT_CONFIG.version);
        populateDropdown('selectPaintScheme', exteriorOptions.paintScheme, DEFAULT_CONFIG.paintScheme);
        populateDropdown('selectPrestige', exteriorOptions.prestige, DEFAULT_CONFIG.prestige);
        populateDropdown('selectSpinner', exteriorOptions.spinner, DEFAULT_CONFIG.spinner);

        // Peupler le décor
        populateDropdown('selectDecor', exteriorOptions.decor, DEFAULT_CONFIG.decor);

        // Peupler le dropdown Style selon le type de police par défaut
        // Utiliser les styles extraits du XML (ou fallback hardcodé si absent)
        updateStyleDropdown(DEFAULT_CONFIG.fontType, exteriorOptions.styleSlanted, exteriorOptions.styleStraight);

        // Extraire les options intérieur
        const interiorOptions = getInteriorOptionsFromXML(xmlDoc);

        // Peupler les dropdowns intérieur avec les valeurs du XML
        populateDropdown('carpet', interiorOptions.carpet, config.carpet);
        populateDropdown('seat-covers', interiorOptions.seatCovers, config.seatCovers);
        populateDropdown('tablet-finish', interiorOptions.tabletFinish, config.tabletFinish);
        populateDropdown('seatbelts', interiorOptions.seatbelts, config.seatbelts);
        populateDropdown('metal-finish', interiorOptions.metalFinish, config.metalFinish);
        populateDropdown('upper-side-panel', interiorOptions.upperSidePanel, config.upperSidePanel);
        populateDropdown('lower-side-panel', interiorOptions.lowerSidePanel, config.lowerSidePanel);
        populateDropdown('ultra-suede-ribbon', interiorOptions.ultraSuedeRibbon, config.ultraSuedeRibbon);
        populateDropdown('stitching', interiorOptions.stitching, config.stitching); // US-036
        // US-037 : central-seat-material est maintenant des radio buttons statiques (pas de populate)

        log.success('Tous les dropdowns peuplés depuis le XML');
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

    console.log('Interface initialisée avec succès');
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
 * Charge un nouveau rendu via l'API
 * Gère loader, erreurs et mise à jour du carrousel
 */
async function loadRender() {
    console.log('Chargement du rendu...');

    try {
        // 1. Récupérer la config actuelle
        const config = getConfig();

        // BUG-001 FIX: Vérifier si la config a changé
        const currentHash = hashConfig(config);
        if (currentHash === lastConfigHash) {
            console.log('Configuration identique à la dernière - API non appelée');
            return;
        }
        lastConfigHash = currentHash;

        // 2. Afficher le loader
        showLoader('Génération en cours...');
        disableControls();
        setLoading(true);
        setError(null);

        // 3. Appeler l'API
        const viewType = getViewType(); // Récupérer la vue courante (exterior/interior/configuration)

        let images;

        // US-042: Pour la vue Configuration, utiliser fetchConfigurationImages() qui fait 2 appels API
        if (viewType === 'configuration') {
            console.log('📸 Vue Configuration: appel API avec tailles multiples...');
            images = await fetchConfigurationImages(config);
        } else {
            // Pour exterior/interior, appel API classique
            images = await fetchRenderImages(config);
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

        console.log('Rendu chargé avec succès');

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

        console.log('✅ Contrôles et actions EXTÉRIEUR affichés');
    } else if (viewType === 'interior') {
        // Masquer contrôles extérieur, afficher contrôles intérieur
        controlsExterior.style.display = 'none';
        controlsInterior.style.display = 'block';

        // Masquer actions extérieur, afficher actions intérieur
        if (actionsExterior) actionsExterior.style.display = 'none';
        if (actionsInterior) actionsInterior.style.display = 'flex';

        // Afficher le panneau d'actions
        if (actionsPanel) actionsPanel.style.display = 'block';

        console.log('✅ Contrôles et actions INTÉRIEUR affichés');
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

        console.log('✅ Vue OVERVIEW - Contrôles masqués');
    }
}

/**
 * DEPRECATED : Utiliser toggleViewControls() à la place
 * US-027 : Toggle section configuration intérieur personnalisée
 * @param {string} viewType - 'exterior' ou 'interior'
 */
function toggleInteriorConfig(viewType) {
    console.warn('⚠️ toggleInteriorConfig() est DEPRECATED. Utilisez toggleViewControls() à la place.');
    // Gardé pour compatibilité mais ne fait plus rien
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
        console.log('🔒 Immatriculation personnalisée, pas de mise à jour automatique');
        return;
    }

    // Déterminer l'immat par défaut selon le modèle
    const defaultImmat = model === '980' ? 'N980TB' : 'N960TB';

    // Mettre à jour l'immat si elle est différente
    if (currentConfig.immat !== defaultImmat) {
        console.log(`🔄 Mise à jour immat par défaut: ${defaultImmat} (modèle ${model})`);

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

    console.log(`🔍 Filtrage ${zoneKey}: "${term}" → ${filteredColors.length} résultats`);
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

    // US-019: Dropdown Base de données
    const selectDatabase = document.getElementById('selectDatabase');
    if (selectDatabase) {
        selectDatabase.addEventListener('change', (e) => {
            const databaseId = e.target.value;
            const databaseName = e.target.options[e.target.selectedIndex].text;

            console.log(`🔄 Changement de base: ${databaseName} (${databaseId})`);
            setDatabaseId(databaseId);

            // Réinitialiser les images (la base a changé)
            showPlaceholder('Base de données changée. Sélectionnez une configuration pour générer le rendu.');
            setImages([]);
        });
    }

    // Dropdown Modèle Avion (version)
    const selectVersion = document.getElementById('selectVersion');
    if (selectVersion) {
        selectVersion.addEventListener('change', (e) => {
            updateConfig('version', e.target.value);
            updateDefaultImmatFromModel(e.target.value); // US-034: Mettre à jour immat par défaut
            console.log('Version changée:', e.target.value);
            triggerRender(); // US-005: Appel API automatique
        });
    }

    // Dropdown Schéma Peinture
    const selectPaintScheme = document.getElementById('selectPaintScheme');
    if (selectPaintScheme) {
        selectPaintScheme.addEventListener('change', async (e) => {
            const schemeName = e.target.value;
            updateConfig('paintScheme', schemeName);
            console.log('Schéma peinture changé:', schemeName);

            // Synchroniser les zones de couleurs avec le schéma
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
            console.log('🎨 Changement de prestige:', prestigeName);

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
                log.int('Mise à jour dropdowns avec prestige:', prestigeName);

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

                log.debug('Dropdowns mis à jour - carpet:', carpetSelect?.value, 'seatCovers:', seatCoversSelect?.value);

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

                console.log('✅ Prestige config appliquée:', prestigeConfig);

                // 5. Déclencher nouveau rendu
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
                updateConfig('hasCustomImmat', true); // US-034: Marquer comme personnalisée
                console.log('Immatriculation personnalisée:', currentImmat);
                triggerRender(); // US-005: Appel API
            } else {
                console.log('Immatriculation inchangée');
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

    if (btnViewExterior && btnViewInterior) {
        btnViewExterior.addEventListener('click', () => {
            // Mettre à jour l'UI
            btnViewExterior.classList.add('active');
            btnViewInterior.classList.remove('active');
            if (btnViewConfiguration) btnViewConfiguration.classList.remove('active');
            if (btnViewOverview) btnViewOverview.classList.remove('active');

            // Mettre à jour le state
            updateConfig('viewType', 'exterior');
            console.log('Vue changée: exterior');

            // US-028 : Affichage conditionnel des contrôles
            toggleViewControls('exterior');

            // Déclencher le rendu
            triggerRender();
        });

        btnViewInterior.addEventListener('click', () => {
            // Mettre à jour l'UI
            btnViewInterior.classList.add('active');
            btnViewExterior.classList.remove('active');
            if (btnViewConfiguration) btnViewConfiguration.classList.remove('active');
            if (btnViewOverview) btnViewOverview.classList.remove('active');

            // Mettre à jour le state
            updateConfig('viewType', 'interior');
            console.log('Vue changée: interior');

            // US-028 : Affichage conditionnel des contrôles
            toggleViewControls('interior');

            // Déclencher le rendu
            triggerRender();
        });
    }

    // US-042: Bouton vue Configuration
    if (btnViewConfiguration) {
        btnViewConfiguration.addEventListener('click', () => {
            // Mettre à jour l'UI
            btnViewConfiguration.classList.add('active');
            if (btnViewExterior) btnViewExterior.classList.remove('active');
            if (btnViewInterior) btnViewInterior.classList.remove('active');
            if (btnViewOverview) btnViewOverview.classList.remove('active');

            // Mettre à jour le state
            updateConfig('viewType', 'configuration');
            console.log('Vue changée: configuration');

            // Masquer tous les contrôles (pas de personnalisation en vue Configuration)
            toggleViewControls('configuration');

            // Déclencher le rendu
            triggerRender();
        });
    }

    // US-044: Bouton vue Overview
    const btnViewOverview = document.getElementById('btnViewOverview');
    if (btnViewOverview) {
        btnViewOverview.addEventListener('click', async () => {
            try {
                // Mettre à jour l'UI
                btnViewOverview.classList.add('active');
                if (btnViewExterior) btnViewExterior.classList.remove('active');
                if (btnViewInterior) btnViewInterior.classList.remove('active');
                if (btnViewConfiguration) btnViewConfiguration.classList.remove('active');

                console.log('Vue changée: overview');

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

    // US-024 : Event listeners Lunettes de soleil
    const btnSunGlassOFF = document.getElementById('btnSunGlassOFF');
    const btnSunGlassON = document.getElementById('btnSunGlassON');

    if (btnSunGlassOFF && btnSunGlassON) {
        btnSunGlassOFF.addEventListener('click', () => {
            btnSunGlassOFF.classList.add('active');
            btnSunGlassON.classList.remove('active');
            updateConfig('sunglass', 'SunGlassOFF');
            console.log('Lunettes de soleil: OFF');
            triggerRender();
        });

        btnSunGlassON.addEventListener('click', () => {
            btnSunGlassON.classList.add('active');
            btnSunGlassOFF.classList.remove('active');
            updateConfig('sunglass', 'SunGlassON');
            console.log('Lunettes de soleil: ON');
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
            console.log('Tablette: Fermée');
            triggerRender();
        });

        btnTabletOpen.addEventListener('click', () => {
            btnTabletOpen.classList.add('active');
            btnTabletClosed.classList.remove('active');
            updateConfig('tablet', 'Open');
            console.log('Tablette: Ouverte');
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
            console.log('Porte pilote: Fermée');
            triggerRender();
        });

        btnDoorPilotOpen.addEventListener('click', () => {
            btnDoorPilotOpen.classList.add('active');
            btnDoorPilotClosed.classList.remove('active');
            updateConfig('doorPilot', 'Open');
            console.log('Porte pilote: Ouverte');
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
            console.log('Porte passager: Fermée');
            triggerRender();
        });

        btnDoorPassengerOpen.addEventListener('click', () => {
            btnDoorPassengerOpen.classList.add('active');
            btnDoorPassengerClosed.classList.remove('active');
            updateConfig('doorPassenger', 'Open');
            console.log('Porte passager: Ouverte');
            triggerRender();
        });
    }

    // ======================================
    // US-027 : Event listeners pour les 10 dropdowns intérieur
    // ======================================

    document.getElementById('carpet').addEventListener('change', (e) => {
        updateConfig('carpet', e.target.value);
        console.log('Tapis changé:', e.target.value);
        triggerRender();
    });

    document.getElementById('seat-covers').addEventListener('change', (e) => {
        updateConfig('seatCovers', e.target.value);
        console.log('Cuir sièges changé:', e.target.value);
        triggerRender();
    });

    document.getElementById('tablet-finish').addEventListener('change', (e) => {
        updateConfig('tabletFinish', e.target.value);
        console.log('Bois tablette changé:', e.target.value);
        triggerRender();
    });

    document.getElementById('seatbelts').addEventListener('change', (e) => {
        updateConfig('seatbelts', e.target.value);
        console.log('Ceintures changées:', e.target.value);
        triggerRender();
    });

    document.getElementById('metal-finish').addEventListener('change', (e) => {
        updateConfig('metalFinish', e.target.value);
        console.log('Finition métal changée:', e.target.value);
        triggerRender();
    });

    document.getElementById('upper-side-panel').addEventListener('change', (e) => {
        updateConfig('upperSidePanel', e.target.value);
        console.log('Panneau latéral sup changé:', e.target.value);
        triggerRender();
    });

    document.getElementById('lower-side-panel').addEventListener('change', (e) => {
        updateConfig('lowerSidePanel', e.target.value);
        console.log('Panneau latéral inf changé:', e.target.value);
        triggerRender();
    });

    document.getElementById('ultra-suede-ribbon').addEventListener('change', (e) => {
        updateConfig('ultraSuedeRibbon', e.target.value);
        console.log('Ruban Ultra-Suede changé:', e.target.value);
        triggerRender();
    });

    // US-036 : Event listener Stitching
    document.getElementById('stitching').addEventListener('change', (e) => {
        updateConfig('stitching', e.target.value);
        console.log('Stitching changé:', e.target.value);
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
            console.log('Matériau siège central: Suede');
            triggerRender();
        });

        btnCentralSeatCuir.addEventListener('click', () => {
            btnCentralSeatCuir.classList.add('active');
            btnCentralSeatSuede.classList.remove('active');
            updateConfig('centralSeatMaterial', 'Leather_Premium');
            console.log('Matériau siège central: Cuir');
            triggerRender();
        });
    }

    // Event listener pour les radio buttons perforation
    const perforatedRadios = document.querySelectorAll('input[name="perforated-seat"]');
    perforatedRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateConfig('perforatedSeatOptions', e.target.value);
            console.log('Perforation sièges changée:', e.target.value);
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
            console.log(`Zone A changée: ${colorName} (tag: ${colorTag})`);

            // Auto-sync: Si la couleur a le tag A+, mettre à jour Zone A+
            if (colorTag === 'A+' && selectZoneAPlus) {
                selectZoneAPlus.value = colorName;
                updateConfig('zoneAPlus', colorName);
                console.log(`   → Auto-sync Zone A+ → ${colorName}`);
            }

            triggerRender();
        });
    }

    if (selectZoneB) {
        selectZoneB.addEventListener('change', (e) => {
            updateConfig('zoneB', e.target.value);
            console.log('Zone B changée:', e.target.value);
            triggerRender();
        });
    }

    if (selectZoneC) {
        selectZoneC.addEventListener('change', (e) => {
            updateConfig('zoneC', e.target.value);
            console.log('Zone C changée:', e.target.value);
            triggerRender();
        });
    }

    if (selectZoneD) {
        selectZoneD.addEventListener('change', (e) => {
            updateConfig('zoneD', e.target.value);
            console.log('Zone D changée:', e.target.value);
            triggerRender();
        });
    }

    if (selectZoneAPlus) {
        selectZoneAPlus.addEventListener('change', (e) => {
            updateConfig('zoneAPlus', e.target.value);
            console.log('Zone A+ changée:', e.target.value);
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

    console.log('Event listeners attachés');
}

/**
 * Met à jour le dropdown Style selon le type de police
 * @param {string} fontType - 'slanted' ou 'straight'
 */
function updateStyleDropdown(fontType, stylesSlanted = null, stylesStraight = null) {
    console.log(`🎨 updateStyleDropdown appelée: fontType=${fontType}, slanted=${stylesSlanted}, straight=${stylesStraight}`);

    // Utiliser les styles fournis en paramètre, ou fallback sur les constantes
    // BUGFIX: Gérer les chaînes vides (pas seulement null/undefined)
    const slantedList = (stylesSlanted && stylesSlanted.length > 0) ? stylesSlanted : STYLES_SLANTED;
    const straightList = (stylesStraight && stylesStraight.length > 0) ? stylesStraight : STYLES_STRAIGHT;

    const styles = fontType === 'slanted' ? slantedList : straightList;
    const defaultStyle = fontType === 'slanted' ? 'A' : 'F';

    console.log(`🎨 Styles à peupler: ${styles.join(', ')} (défaut: ${defaultStyle})`);

    // Repeupler le dropdown
    populateSelect('selectStyle', styles, defaultStyle);

    // Mettre à jour le state avec la nouvelle valeur par défaut
    updateConfig('style', defaultStyle);

    log.ui(`Dropdown style mis à jour pour ${fontType}: ${styles.join(', ')}`);
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
    console.log('🎯 Initialisation accordéon');

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
                console.log(`✅ Accordéon ouvert: ${header.textContent.trim()}`);
            } else {
                console.log(`📁 Accordéon fermé: ${header.textContent.trim()}`);
            }
        });
    });

    console.log(`✅ ${accordionHeaders.length} accordéons initialisés`);
}

// ======================================

/**
 * Point d'entrée principal de l'application
 * Appelé quand le DOM est prêt
 */
async function init() {
    console.log('Configurateur TBM Daher - Initialisation');
    console.log('Version : 1.0');
    console.log('Configuration initiale :', getConfig());

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

    // Initialiser le bouton Réessayer (US-005)
    initRetryButton(() => {
        console.log('Réessayer cliqué');
        loadRender();
    });

    // Attacher les event listeners sur les contrôles (US-003)
    attachEventListeners();

    // Initialiser le système d'accordéon
    initAccordion();

    // US-027 : Afficher/masquer section intérieur selon vue initiale
    toggleInteriorConfig(getConfig().viewType);

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
        console.warn('⚠️ testPayloadBuild() a été supprimé lors du refactoring');
    } else {
        // Charger automatiquement le rendu initial avec la config par défaut
        console.log('🚀 Chargement automatique du rendu initial...');
        if (defaultConfigLoaded) {
            console.log('   > Config par défaut du XML chargée, génération du rendu...');
        } else {
            console.log('   > Utilisation de la config hardcodée, génération du rendu...');
        }
        loadRender();
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

    console.log('Test mosaïque avec', testImages.length, 'images');

    setTimeout(() => {
        renderMosaic(testImages, 'exterior');
        console.log('Mosaïque de test chargée');
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

// testPayloadBuild supprimé lors du refactoring
window.loadRender = loadRender;
