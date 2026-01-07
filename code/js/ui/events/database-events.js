/**
 * @fileoverview Event listeners pour le dropdown Base de données
 * @module ui/events/database-events
 * @version 1.0
 * @description Gère la sélection de la base de données (US-019, US-039)
 */

import { setDatabaseId } from '../../api/index.js';
import { loadDefaultConfigFromXML } from '../../api/config-loader.js';
import { showLoader, hideLoader, showSuccessToast, showError } from '../loader.js';

/**
 * Attache les event listeners pour le dropdown base de données
 * @returns {void}
 */
export function attachDatabaseEvents() {
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
                window.lastConfigHash = null;

                // 4. Charger les images avec la nouvelle config
                await window.loadRender();

                showSuccessToast(`Base "${databaseName}" chargée avec succès`);

            } catch (error) {
                hideLoader();
                console.error('❌ Erreur lors du changement de base:', error);
                showError(`Erreur lors du chargement de la base: ${error.message}`);
            }
        });
    }
}
