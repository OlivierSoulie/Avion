/**
 * @fileoverview Point d'entrée du module Events
 * @module ui/events
 * @version 1.0
 * @description Module Events refactorisé - Gestion centralisée de tous les event listeners
 *
 * Architecture (7 modules spécialisés selon domaine fonctionnel) :
 * - database-events.js  : Dropdown base de données (US-019, US-039)
 * - config-events.js    : Dropdowns configuration (version, paintScheme, prestige, decor, spinner)
 * - immat-events.js     : Type police, style, immatriculation (US-004, US-005)
 * - view-events.js      : Boutons de vue (Ext/Int/Config/Overview/PDF)
 * - interior-events.js  : Actions intérieures (SunGlass, Tablet, MoodLights, Doors, Dropdowns)
 * - color-events.js     : Zones de couleurs + recherche par tags (US-033)
 * - misc-events.js      : Fonctionnalités diverses (Download JSON - US-021)
 */

// ======================================
// Imports
// ======================================

import { attachDatabaseEvents } from './database-events.js';
import { attachConfigEvents } from './config-events.js';
import { attachImmatEvents } from './immat-events.js';
import { attachViewEvents } from './view-events.js';
import { attachInteriorEvents } from './interior-events.js';
import { attachColorEvents } from './color-events.js';
import { attachMiscEvents } from './misc-events.js';

// ======================================
// Fonction orchestratrice
// ======================================

/**
 * Attache tous les event listeners de l'application
 * Orchestre l'appel de tous les modules events spécialisés
 * @returns {void}
 */
export function attachEventListeners() {
    attachDatabaseEvents();  // Dropdown base de données
    attachConfigEvents();     // Dropdowns configuration
    attachImmatEvents();      // Immatriculation
    attachViewEvents();       // Boutons de vue
    attachInteriorEvents();   // Actions intérieures
    attachColorEvents();      // Zones de couleurs
    attachMiscEvents();       // Fonctionnalités diverses
}

// ======================================
// Re-exports publics (pour flexibilité)
// ======================================

export {
    attachDatabaseEvents,
    attachConfigEvents,
    attachImmatEvents,
    attachViewEvents,
    attachInteriorEvents,
    attachColorEvents,
    attachMiscEvents
};

// ======================================
// Export par défaut
// ======================================

export default {
    attachEventListeners,
    attachDatabaseEvents,
    attachConfigEvents,
    attachImmatEvents,
    attachViewEvents,
    attachInteriorEvents,
    attachColorEvents,
    attachMiscEvents
};
