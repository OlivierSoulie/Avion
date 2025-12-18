/**
 * Script de test pour vérifier la structure de pdf-hotspots.json
 * Usage: node test-pdf-hotspots.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtenir __dirname dans un module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier JSON
const jsonPath = join(__dirname, 'code', 'data', 'pdf-hotspots.json');
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

console.log('🧪 Test de pdf-hotspots.json\n');
console.log('═'.repeat(60));

// Liste des paint schemes attendus
const expectedPaintSchemes = ['Zephir', 'Tehuano', 'Sirocco', 'Alize', 'Meltem', 'Mistral'];

// Vérifier que tous les paint schemes sont présents
console.log('\n1️⃣  Vérification des paint schemes présents:');
expectedPaintSchemes.forEach(scheme => {
    if (data[scheme]) {
        console.log(`   ✅ ${scheme} trouvé`);
    } else {
        console.log(`   ❌ ${scheme} MANQUANT`);
    }
});

// Vérifier la structure de chaque paint scheme
console.log('\n2️⃣  Vérification de la structure:');
Object.keys(data).forEach(scheme => {
    const schemeData = data[scheme];

    if (!schemeData.hotspots) {
        console.log(`   ❌ ${scheme}: Propriété 'hotspots' manquante`);
        return;
    }

    if (!Array.isArray(schemeData.hotspots)) {
        console.log(`   ❌ ${scheme}: 'hotspots' n'est pas un tableau`);
        return;
    }

    const count = schemeData.hotspots.length;
    if (count !== 5) {
        console.log(`   ⚠️  ${scheme}: ${count} hotspots (attendu: 5)`);
    } else {
        console.log(`   ✅ ${scheme}: ${count} hotspots`);
    }

    // Vérifier chaque hotspot
    schemeData.hotspots.forEach((hotspot, idx) => {
        if (!hotspot.name) {
            console.log(`      ❌ Hotspot #${idx}: 'name' manquant`);
        }
        if (!hotspot.position3D) {
            console.log(`      ❌ Hotspot #${idx}: 'position3D' manquant`);
        } else {
            if (typeof hotspot.position3D.x !== 'number' ||
                typeof hotspot.position3D.y !== 'number' ||
                typeof hotspot.position3D.z !== 'number') {
                console.log(`      ❌ Hotspot #${idx} (${hotspot.name}): Coordonnées 3D invalides`);
            }
        }
    });
});

// Vérifier les noms de zones
console.log('\n3️⃣  Vérification des noms de zones:');
const expectedZones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone A+'];
Object.keys(data).forEach(scheme => {
    const zones = data[scheme].hotspots.map(h => h.name);
    const allMatch = expectedZones.every(zone => zones.includes(zone));

    if (allMatch) {
        console.log(`   ✅ ${scheme}: Toutes les zones présentes`);
    } else {
        console.log(`   ❌ ${scheme}: Zones manquantes ou incorrectes`);
        console.log(`      Attendu: ${expectedZones.join(', ')}`);
        console.log(`      Trouvé:  ${zones.join(', ')}`);
    }
});

// Simuler le comportement du code
console.log('\n4️⃣  Simulation du chargement par paint scheme:');

function testLoadPaintScheme(paintScheme) {
    let paintSchemeData = data[paintScheme];

    if (!paintSchemeData) {
        console.warn(`   ⚠️  Paint scheme "${paintScheme}" non trouvé, fallback sur Tehuano`);
        paintSchemeData = data['Tehuano'];
    }

    if (paintSchemeData && paintSchemeData.hotspots) {
        console.log(`   ✅ ${paintScheme}: ${paintSchemeData.hotspots.length} hotspots chargés`);
        return true;
    } else {
        console.log(`   ❌ ${paintScheme}: Échec du chargement`);
        return false;
    }
}

// Tester avec des paint schemes valides
testLoadPaintScheme('Tehuano');
testLoadPaintScheme('Sirocco');
testLoadPaintScheme('Zephir');

// Tester avec un paint scheme invalide (doit fallback sur Tehuano)
testLoadPaintScheme('InvalidScheme');

console.log('\n═'.repeat(60));
console.log('✅ Tests terminés\n');
