/**
 * Moulinette de génération du fichier pdf-hotspots.json
 *
 * Lit tous les fichiers JSON dans ./Source/ et génère un fichier consolidé
 * pdf-hotspots.json utilisé par le configurateur.
 *
 * Usage:
 *   node generate-pdf-hotspots.js
 *
 * Input:  ./Source/*.json (6 fichiers paint schemes)
 * Output: ./pdf-hotspots.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, 'Source');
const OUTPUT_FILE = path.join(__dirname, 'pdf-hotspots.json');

/**
 * Extrait le nom du paint scheme depuis le nom de fichier
 * @param {string} filename - Nom du fichier (ex: "Alize.json")
 * @returns {string} Nom du paint scheme (ex: "Alize")
 */
function extractPaintSchemeName(filename) {
  return path.basename(filename, '.json');
}

/**
 * Transforme un hotspot source en hotspot simplifié
 * @param {object} sourceHotspot - Hotspot du fichier source
 * @returns {object} Hotspot simplifié { name, position3D }
 */
function transformHotspot(sourceHotspot) {
  return {
    name: sourceHotspot.name.trim(),
    position3D: {
      x: sourceHotspot.position3D.x,
      y: sourceHotspot.position3D.y,
      z: sourceHotspot.position3D.z
    }
  };
}

/**
 * Génère le fichier pdf-hotspots.json à partir des fichiers sources
 */
function generatePdfHotspots() {
  console.log('🚀 Démarrage de la génération pdf-hotspots.json...\n');

  // 1. Lire tous les fichiers JSON dans ./Source
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.error('❌ Aucun fichier JSON trouvé dans ./Source/');
    process.exit(1);
  }

  console.log(`📂 ${files.length} fichiers trouvés dans ./Source/`);
  files.forEach(f => console.log(`   - ${f}`));
  console.log('');

  // 2. Transformer chaque fichier
  const result = {};
  let totalHotspots = 0;

  files.forEach(filename => {
    const filePath = path.join(SOURCE_DIR, filename);
    const paintSchemeName = extractPaintSchemeName(filename);

    console.log(`📄 Traitement de ${filename} → "${paintSchemeName}"`);

    try {
      // Lire et parser le fichier JSON
      const rawData = fs.readFileSync(filePath, 'utf8');
      const sourceData = JSON.parse(rawData);

      // Vérifier que le fichier contient des hotspots
      if (!sourceData.hotspots || !Array.isArray(sourceData.hotspots)) {
        console.warn(`   ⚠️  Aucun hotspot trouvé dans ${filename}`);
        return;
      }

      // Transformer les hotspots
      const transformedHotspots = sourceData.hotspots.map(transformHotspot);

      console.log(`   ✅ ${transformedHotspots.length} hotspots extraits`);
      totalHotspots += transformedHotspots.length;

      // Ajouter au résultat
      result[paintSchemeName] = {
        hotspots: transformedHotspots
      };

    } catch (error) {
      console.error(`   ❌ Erreur lors du traitement de ${filename}:`, error.message);
    }
  });

  console.log('');

  // 3. Écrire le fichier de sortie
  const outputJson = JSON.stringify(result, null, 2);
  fs.writeFileSync(OUTPUT_FILE, outputJson, 'utf8');

  console.log(`✅ Fichier généré : ${OUTPUT_FILE}`);
  console.log(`📊 Statistiques :`);
  console.log(`   - Paint schemes : ${Object.keys(result).length}`);
  console.log(`   - Total hotspots : ${totalHotspots}`);
  console.log('\n🎉 Génération terminée avec succès !');
}

// Exécution
try {
  generatePdfHotspots();
} catch (error) {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}
