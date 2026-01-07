/**
 * @fileoverview Export JSON des payloads de configuration
 * @module utils/json-export
 * @version 1.0
 * @description Module dédié au téléchargement des payloads JSON (vue PDF : 2 fichiers, autres vues : 1 fichier)
 */

import { getConfig, getLastPayload, getPDFCamera0SnapshotPayload, getPDFCamera0HotspotPayload } from '../state.js';
import { buildMinimalHotspotPayload } from '../api/hotspot.js';
import { showSuccessToast, showError, hideError } from '../ui/loader.js';
import { currentDatabaseStructure } from '../ui/config-schema-modal.js';

/**
 * US-021 : Télécharge le dernier payload JSON
 * Génère un fichier JSON avec le payload envoyé à l'API
 *
 * Pour vue PDF (US-052) : Télécharge 2 fichiers (Snapshot + Hotspot minimal de la caméra 0)
 * Pour autres vues : Télécharge 1 fichier (payload complet)
 *
 * @returns {void}
 */
export function downloadJSON() {
    const config = getConfig();
    const databaseName = currentDatabaseStructure?.name || 'base-inconnue';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    // US-052 : Si vue PDF, télécharger les payloads de la caméra 0 (16:9)
    if (config.viewType === 'pdf') {
        const snapshotPayload = getPDFCamera0SnapshotPayload();
        const hotspotPayload = getPDFCamera0HotspotPayload();

        if (!snapshotPayload || !hotspotPayload) {
            console.warn('⚠️ Aucun payload PDF disponible');
            showError('Aucune vue PDF générée. Veuillez d\'abord aller dans l\'onglet PDF.');
            setTimeout(() => hideError(), 3000);
            return;
        }

        try {
            // 1. Télécharger le payload Snapshot caméra 0
            const snapshotJsonContent = JSON.stringify(snapshotPayload, null, 2);
            const snapshotBlob = new Blob([snapshotJsonContent], { type: 'application/json' });
            const snapshotFilename = `configurateur-snapshot-camera0-${databaseName}-${config.version}-${config.paintScheme}-${timestamp}.json`;

            const snapshotUrl = URL.createObjectURL(snapshotBlob);
            const snapshotLink = document.createElement('a');
            snapshotLink.href = snapshotUrl;
            snapshotLink.download = snapshotFilename;
            document.body.appendChild(snapshotLink);
            snapshotLink.click();
            document.body.removeChild(snapshotLink);
            URL.revokeObjectURL(snapshotUrl);

            // 2. Télécharger le payload Hotspot minimal caméra 0
            const minimalHotspotPayload = buildMinimalHotspotPayload(
                hotspotPayload.scene,
                hotspotPayload.mode,
                hotspotPayload.renderParameters,
                hotspotPayload.positions
            );

            const hotspotJsonContent = JSON.stringify(minimalHotspotPayload, null, 2);
            const hotspotBlob = new Blob([hotspotJsonContent], { type: 'application/json' });
            const hotspotFilename = `configurateur-hotspot-minimal-camera0-${databaseName}-${config.version}-${config.paintScheme}-${timestamp}.json`;

            const hotspotUrl = URL.createObjectURL(hotspotBlob);
            const hotspotLink = document.createElement('a');
            hotspotLink.href = hotspotUrl;
            hotspotLink.download = hotspotFilename;
            document.body.appendChild(hotspotLink);
            hotspotLink.click();
            document.body.removeChild(hotspotLink);
            URL.revokeObjectURL(hotspotUrl);

            showSuccessToast('2 fichiers JSON caméra 0 (16:9) téléchargés avec succès !');

        } catch (error) {
            console.error('❌ Erreur lors du téléchargement JSON PDF:', error);
            showError('Erreur lors du téléchargement des fichiers JSON.');
            setTimeout(() => hideError(), 3000);
        }
        return;
    }

    // Pour les autres vues (Ext/Int/Overview/Config) : comportement classique
    const payload = getLastPayload();

    if (!payload) {
        console.warn('⚠️ Aucun payload disponible');
        showError('Aucune configuration générée. Veuillez d\'abord générer un rendu.');
        setTimeout(() => hideError(), 3000);
        return;
    }

    try {
        // Télécharger le payload principal
        const jsonContent = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const filename = `configurateur-payload-${databaseName}-${config.version}-${config.paintScheme}-${timestamp}.json`;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showSuccessToast('JSON téléchargé avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors du téléchargement JSON:', error);
        showError('Erreur lors du téléchargement du JSON.');
        setTimeout(() => hideError(), 3000);
    }
}
