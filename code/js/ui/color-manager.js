/**
 * @fileoverview Gestion des zones de couleurs
 * @module ui/color-manager
 * @version 1.0
 * @description Module dédié à la gestion des dropdowns de zones de couleurs (A, B, C, D, A+)
 */

import { getExteriorColorZones, getDatabaseXML, parsePaintSchemeBookmark } from '../api/index.js';
import { getConfig, updateConfig } from '../state.js';

// ======================================
// Cache des couleurs
// ======================================

/**
 * Cache des données de couleurs par zone
 * Permet le filtrage sans réinterroger l'API
 */
export let colorZonesData = {
    zoneA: [],
    zoneB: [],
    zoneC: [],
    zoneD: [],
    zoneAPlus: []
};

// ======================================
// Fonctions principales
// ======================================

/**
 * Initialise les zones de couleurs depuis le XML
 * Peuple les dropdowns et synchronise avec le schéma de peinture actuel
 */
export async function initColorZones() {

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
export function populateColorZone(selectId, colors) {
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
export async function syncZonesWithPaintScheme(schemeName) {

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
 * Filtre un dropdown de couleurs selon un terme de recherche
 * Recherche dans le nom et les tags de couleur
 *
 * @param {string} zoneId - ID du select à filtrer
 * @param {string} searchTerm - Terme de recherche
 */
export function filterColorDropdown(zoneId, searchTerm) {
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
