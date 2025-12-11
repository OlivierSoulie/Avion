/**
 * Configuration globale des logs
 * @module debug-config
 *
 * MODE PRODUCTION : Désactive tous les logs non-critiques
 * Pour activer les logs : DEBUG_MODE = true
 */

export const DEBUG_MODE = false; // ⚠️ Mettre à true pour déboguer

// Logger conditionnel
export const debug = {
    log: (...args) => { if (DEBUG_MODE) console.log(...args); },
    info: (...args) => { if (DEBUG_MODE) console.log(...args); },
    warn: (...args) => console.warn(...args), // Toujours actif
    error: (...args) => console.error(...args), // Toujours actif
    success: (...args) => { if (DEBUG_MODE) console.log(...args); }
};
