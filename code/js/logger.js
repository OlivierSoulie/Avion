// Logger.js - Système de logging structuré
// Configurateur TBM Daher
// Permet de filtrer facilement les logs dans la console

/**
 * Préfixes de logging :
 * - [INIT] : Initialisation de l'application
 * - [DB]   : Gestion des bases de données
 * - [XML]  : Parsing et extraction depuis XML
 * - [API]  : Appels API et payloads
 * - [EXT]  : Configuration extérieur (couleurs, zones, décor)
 * - [INT]  : Configuration intérieur (prestige, matériaux)
 * - [RENDER] : Génération des rendus
 * - [UI]   : Interface utilisateur (dropdowns, accordéons)
 * - [DEBUG] : Débogage détaillé
 * - [ERROR] : Erreurs
 *
 * Exemples de filtrage dans la console :
 * - Pour voir uniquement l'intérieur : Filtrer par "[INT]"
 * - Pour voir uniquement le debug : Filtrer par "[DEBUG]"
 * - Pour voir les erreurs : Filtrer par "[ERROR]"
 */

export const log = {
    init: (...args) => console.log('[INIT]', ...args),
    db: (...args) => console.log('[DB]', ...args),
    xml: (...args) => console.log('[XML]', ...args),
    api: (...args) => console.log('[API]', ...args),
    ext: (...args) => console.log('[EXT]', ...args),
    int: (...args) => console.log('[INT]', ...args),
    render: (...args) => console.log('[RENDER]', ...args),
    ui: (...args) => console.log('[UI]', ...args),
    debug: (...args) => console.log('[DEBUG]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    success: (...args) => console.log('[✅]', ...args)
};
