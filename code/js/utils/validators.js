/**
 * @fileoverview Fonctions de validation
 * @module utils/validators
 * @version 1.0
 * @description Valide les configurations et données avant génération ou traitement.
 */

/**
 * Valide une configuration avant génération
 *
 * @param {Object} config - Configuration à valider
 * @returns {boolean} true si valide
 * @throws {Error} Si validation échoue
 *
 * @example
 *   validateConfig({ version: "960", paintScheme: "Sirocco", decor: "Tarmac" })
 *   // → true
 */
export function validateConfig(config) {
    if (!config.version) {
        throw new Error('Version manquante dans la configuration');
    }
    if (!config.paintScheme) {
        throw new Error('Paint scheme manquant dans la configuration');
    }
    if (!config.decor) {
        throw new Error('Décor manquant dans la configuration');
    }
    return true;
}

/**
 * Valide qu'une URL d'image est accessible
 *
 * @param {string} url - URL à valider
 * @returns {Promise<boolean>} true si accessible
 *
 * @example
 *   await validateImageUrl('https://example.com/image.jpg')
 *   // → true ou false
 */
export async function validateImageUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Valide une chaîne d'immatriculation
 *
 * @param {string} immat - Immatriculation à valider
 * @returns {boolean} true si valide
 * @throws {Error} Si validation échoue
 *
 * @example
 *   validateImmatriculation("N960TB")  // → true
 *   validateImmatriculation("ABC1234") // → Error (>6 caractères)
 */
export function validateImmatriculation(immat) {
    if (!immat || typeof immat !== 'string') {
        throw new Error('Immatriculation invalide : doit être une chaîne non vide');
    }

    if (immat.length > 6) {
        throw new Error('Immatriculation invalide : maximum 6 caractères');
    }

    // Vérifier que ce sont uniquement des caractères alphanumériques
    const alphanumericRegex = /^[A-Z0-9]+$/;
    if (!alphanumericRegex.test(immat)) {
        throw new Error('Immatriculation invalide : uniquement lettres majuscules et chiffres');
    }

    return true;
}

/**
 * Valide un code couleur hexadécimal
 *
 * @param {string} color - Code couleur à valider
 * @returns {boolean} true si valide
 * @throws {Error} Si validation échoue
 *
 * @example
 *   validateHexColor("#FFFFFF")  // → true
 *   validateHexColor("FFFFFF")   // → Error (manque #)
 *   validateHexColor("#GGG")     // → Error (caractères invalides)
 */
export function validateHexColor(color) {
    if (!color || typeof color !== 'string') {
        throw new Error('Couleur invalide : doit être une chaîne non vide');
    }

    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(color)) {
        throw new Error(`Couleur invalide : "${color}" n'est pas un code hex valide (format: #RRGGBB)`);
    }

    return true;
}

/**
 * Valide une réponse d'API
 *
 * @param {Response} response - Réponse HTTP à valider
 * @returns {boolean} true si valide
 * @throws {Error} Si validation échoue
 *
 * @example
 *   const response = await fetch('https://api.example.com/data');
 *   validateApiResponse(response); // → true ou Error
 */
export function validateApiResponse(response) {
    if (!response) {
        throw new Error('Réponse API invalide : réponse null ou undefined');
    }

    if (!response.ok) {
        throw new Error(`Réponse API invalide : HTTP ${response.status} ${response.statusText}`);
    }

    return true;
}
