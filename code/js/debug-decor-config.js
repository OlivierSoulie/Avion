/**
 * @fileoverview Debug script pour tester buildDecorConfig avec différents XML
 * @version 1.0
 * @date 2025-12-11
 *
 * Usage:
 * 1. Ouvrir la console DevTools
 * 2. Importer ce script
 * 3. Appeler testDecorConfig() avec différents cas de test
 */

import { getDatabaseXML } from './api/xml-parser.js';

/**
 * Teste la fonction buildDecorConfig avec le XML actuel
 * @param {string} decorName - Nom du décor à tester
 */
export async function testDecorConfig(decorName) {
    console.log(`\n========================================`);
    console.log(`TEST buildDecorConfig avec decorName="${decorName}"`);
    console.log(`========================================\n`);

    try {
        // 1. Télécharger le XML
        console.log('1️⃣ Téléchargement du XML...');
        const xmlDoc = await getDatabaseXML();
        console.log('   ✅ XML téléchargé\n');

        // 2. Afficher les valeurs du Parameter Decor
        console.log('2️⃣ Inspection du Parameter[label="Decor"]...');
        const decorParam = xmlDoc.querySelector('Parameter[label="Decor"]');

        if (!decorParam) {
            console.error('   ❌ Parameter Decor non trouvé (Base POC?)');
            return;
        }

        const values = decorParam.querySelectorAll('Value');
        console.log(`   > ${values.length} valeurs trouvées dans le XML:`);

        values.forEach((val, idx) => {
            const symbol = val.getAttribute('symbol');
            const label = val.getAttribute('label');
            console.log(`      ${idx + 1}. symbol="${symbol}", label="${label}"`);
        });

        // 3. Détecter le format
        console.log('\n3️⃣ Détection du format...');
        const firstValue = values[0]?.getAttribute('symbol') || '';
        const isV02 = /^[A-Za-z]+_[A-Za-z0-9]+_[\d\-_]+$/.test(firstValue);
        console.log(`   > Format: ${isV02 ? 'V0.2 (avec coordonnées)' : 'V0.3+ (avec Ground/Flight)'}`);
        console.log(`   > Première valeur: "${firstValue}"`);

        // 4. Tester la recherche avec startsWith()
        console.log(`\n4️⃣ Recherche avec startsWith("${decorName}")...`);

        let found = false;
        for (const value of values) {
            const symbol = value.getAttribute('symbol');
            if (symbol.toLowerCase().startsWith(decorName.toLowerCase() + '_')) {
                console.log(`   ✅ TROUVÉ : "${symbol}"`);
                found = true;
                break;
            }
        }

        if (!found) {
            console.warn(`   ⚠️ AUCUNE correspondance pour "${decorName}"`);
            console.warn(`   > Fallback générique : "${decorName}_Ground"`);
        }

        console.log(`\n========================================`);
        console.log(`FIN TEST`);
        console.log(`========================================\n`);

    } catch (error) {
        console.error('❌ ERREUR lors du test:', error);
    }
}

/**
 * Teste tous les décors connus
 */
export async function testAllDecors() {
    const decorsToTest = [
        'Tarmac',
        'Studio',
        'Hangar',
        'Onirique',
        'Fjord',
        'NewDecor', // Nouveau décor hypothétique
        '', // Cas vide
        'UnknownDecor' // Décor inconnu
    ];

    for (const decor of decorsToTest) {
        await testDecorConfig(decor);
        // Pause de 500ms entre chaque test pour lire la console
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

/**
 * Affiche un résumé des valeurs Decor dans la base actuelle
 */
export async function listAllDecors() {
    console.log(`\n========================================`);
    console.log(`LISTE DES DÉCORS DISPONIBLES`);
    console.log(`========================================\n`);

    try {
        const xmlDoc = await getDatabaseXML();
        const decorParam = xmlDoc.querySelector('Parameter[label="Decor"]');

        if (!decorParam) {
            console.error('❌ Parameter Decor non trouvé (Base POC?)');
            return;
        }

        const values = decorParam.querySelectorAll('Value');
        const decors = new Set();

        values.forEach(val => {
            const symbol = val.getAttribute('symbol');
            // Extraire le nom du décor (avant le premier underscore)
            const decorName = symbol.split('_')[0];
            decors.add(decorName);
        });

        console.log(`✅ ${decors.size} décor(s) unique(s) trouvé(s) :\n`);
        Array.from(decors).sort().forEach((decor, idx) => {
            console.log(`   ${idx + 1}. ${decor}`);
        });

        console.log(`\n========================================\n`);

    } catch (error) {
        console.error('❌ ERREUR:', error);
    }
}
