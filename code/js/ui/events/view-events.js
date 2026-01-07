/**
 * @fileoverview Event listeners pour les boutons de vue
 * @module ui/events/view-events
 * @version 1.0
 * @description Gère les boutons de vue (Extérieur, Intérieur, Configuration, Overview, PDF)
 */

import { updateConfig, getConfig, setImages, setLoading } from '../../state.js';
import { fetchOverviewImages } from '../../api/rendering.js';
import { renderOverviewMosaic } from '../mosaic.js';
import { loadAndDisplayPDFView } from '../pdf-view.js';
import {
    showLoader,
    hideLoader,
    showSuccessToast,
    showError,
    showPlaceholder,
    disableControls,
    enableControls
} from '../loader.js';

/**
 * US-028: Affiche/masque les contrôles selon le type de vue
 * @param {string} viewType - Type de vue ('exterior', 'interior', 'configuration', 'overview', 'pdf')
 */
function toggleViewControls(viewType) {
    const exteriorControls = document.querySelector('.config-exterior');
    const interiorControls = document.querySelector('.config-interior');
    const immatControls = document.querySelector('.config-immatriculation');

    if (!exteriorControls || !interiorControls || !immatControls) return;

    if (viewType === 'exterior' || viewType === 'pdf') {
        // Vue Extérieur ou PDF : Afficher contrôles extérieurs (couleurs) + immatriculation
        exteriorControls.classList.remove('hidden');
        interiorControls.classList.add('hidden');
        immatControls.classList.remove('hidden');
    } else if (viewType === 'interior') {
        // Vue Intérieur : Afficher contrôles intérieurs + masquer extérieur + immatriculation
        exteriorControls.classList.add('hidden');
        interiorControls.classList.remove('hidden');
        immatControls.classList.add('hidden');
    } else if (viewType === 'configuration' || viewType === 'overview') {
        // Vues Configuration/Overview : Masquer tous les contrôles (pas de personnalisation)
        exteriorControls.classList.add('hidden');
        interiorControls.classList.add('hidden');
        immatControls.classList.add('hidden');
    }
}

/**
 * US-043: Masque le viewer PDF
 */
function hidePDFViewer() {
    const pdfViewWrapper = document.getElementById('pdfViewWrapper');
    if (pdfViewWrapper) {
        pdfViewWrapper.classList.add('hidden');
    }
}

/**
 * US-044: Récupère le type d'avion depuis la version
 * @param {string} version - Version du modèle (ex: "Version_TBM960")
 * @returns {string} Type d'avion ("TBM 960" ou "TBM 980")
 */
function getAirplaneType(version) {
    if (version.includes('960')) {
        return 'TBM 960';
    } else if (version.includes('980')) {
        return 'TBM 980';
    }
    return 'TBM 960'; // Fallback
}

/**
 * Attache les event listeners pour les boutons de vue
 * @returns {void}
 */
export function attachViewEvents() {
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
            window.triggerRender();
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
            window.triggerRender();
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
            window.lastConfigHash = null;
            setImages([]); // Vider les images du state pour forcer la regénération

            // Déclencher le rendu
            window.triggerRender();
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
}
