/**
 * @fileoverview Event listeners divers (Download JSON)
 * @module ui/events/misc-events
 * @version 1.0
 * @description Gère les fonctionnalités diverses (US-021)
 */

import { downloadJSON } from '../../utils/json-export.js';

/**
 * Attache les event listeners divers
 * @returns {void}
 */
export function attachMiscEvents() {
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
}
