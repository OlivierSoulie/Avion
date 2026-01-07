/**
 * @fileoverview Chargement et gestion des bases de données
 * @module api/database-loader
 * @version 1.0
 * @description Module dédié au chargement de la liste des bases de données et initialisation du sélecteur
 */

import { fetchDatabases, setDatabaseId } from './index.js';
import { showError } from '../ui/index.js';

/**
 * Charge la liste des bases de données et peuple le sélecteur
 * Sélectionne automatiquement la DERNIÈRE base par défaut
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Si le sélecteur n'existe pas dans le DOM ou si l'API échoue
 *
 * @example
 * await loadDatabases(); // Charge et peuple le dropdown des bases
 */
export async function loadDatabases() {

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
