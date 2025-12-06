# Guide Développeur - Configurateur Daher

## Architecture Globale

### Flux de données
```
User Input → State → API → Rendering → UI
```

### Points d'entrée principaux

#### app.js
- `initApp()` : Initialise l'application
- `loadRender()` : Charge un rendu
- `registerEventListeners()` : Enregistre tous les listeners

#### api/index.js
- `fetchRenderImages(config)` : Génère rendus Ext/Int
- `fetchConfigurationImages(config)` : Génère rendus Config
- `buildPayload(config)` : Construit payload API

---

## Structure des modules

### api/
- `xml-parser.js` : Parsing XML base de données (10 fonctions)
  - `getDatabaseXML()` - Télécharge et cache le XML
  - `findCameraGroupId()` - Trouve groupe caméras selon décor/vue
  - `getConfigFromLabel()` - Extrait config depuis bookmark

- `payload-builder.js` : Construction payloads API (8 fonctions atomiques)
  - `buildPayload()` - Payload mode normal (groupe caméras)
  - `buildPayloadForSingleCamera()` - Payload caméra unique
  - `buildPayloadBase()` - Logique commune (élimine duplication)

- `api-client.js` : Appels HTTP API Lumiscaphe (6 fonctions)
  - `callLumiscapheAPI()` - Appel HTTP avec retry
  - `downloadImages()` - Téléchargement et validation images

- `rendering.js` : Génération rendus Ext/Int
  - `fetchRenderImages()` - Point d'entrée vues Ext/Int

- `configuration.js` : Génération rendus Config
  - `fetchConfigurationImages()` - Point d'entrée vue Config

### ui/
- `mosaic.js` : Affichage mosaïques d'images (2 fonctions)
  - `renderMosaic()` - Mosaïque Ext/Int
  - `renderConfigMosaic()` - Mosaïque Config (ratios mixtes)

- `modal.js` : Modal plein écran (4 fonctions)
  - `openFullscreen()` - Ouvre modal
  - `closeFullscreen()` - Ferme modal
  - `fullscreenPrev()` / `fullscreenNext()` - Navigation

- `loader.js` : États de chargement (4 fonctions)
  - `showLoader()` / `hideLoader()` - Loader
  - `showError()` - Affiche erreur
  - `hidePlaceholder()` - Masque placeholder

- `download.js` : Téléchargements (3 fonctions)
  - `downloadImage()` - Téléchargement individuel
  - `enableSelectionMode()` - Mode sélection multiple
  - `downloadSelectedImages()` - Téléchargement par lot

### Modules utilitaires (racine js/)
- `colors.js` : Gestion couleurs immatriculation (3 fonctions)
  - `parseColorsFromConfig()` - Parse couleurs depuis XML
  - `resolveLetterColors()` - Résout couleurs selon style
  - `generateMaterialsAndColors()` - Génère materials pour API

- `positioning.js` : Calcul positions lettres (2 fonctions)
  - `calculateLetterPositions()` - Calcule positions X
  - `getCharWidth()` - Largeur caractère

- `state.js` : Gestion de l'état global (20+ fonctions)
  - Getters : `getConfig()`, `getImages()`, etc.
  - Setters : `updateConfig()`, `setImages()`, etc.

- `logger.js` : Système de logging structuré
  - Catégories : `log.init()`, `log.api()`, `log.error()`, etc.

---

## Comment ajouter une nouvelle fonctionnalité

### Exemple : Ajouter un nouveau contrôle UI

**Étape 1 : State** - Ajouter la propriété dans DEFAULT_CONFIG (`config.js`)
```javascript
export const DEFAULT_CONFIG = {
    // ... existing
    nouveauParametre: 'valeurParDefaut'
};
```

**Étape 2 : UI** - Créer le dropdown/toggle dans `index.html`
```html
<div class="control-group">
    <label for="selectNouveauParametre">Nouveau Paramètre</label>
    <select id="selectNouveauParametre">
        <option value="option1">Option 1</option>
    </select>
</div>
```

**Étape 3 : Event** - Ajouter l'event listener dans `app.js`
```javascript
function registerExteriorControlListeners() {
    // ... existing

    const selectNouveau = document.getElementById('selectNouveauParametre');
    selectNouveau.addEventListener('change', (e) => {
        updateConfig({ nouveauParametre: e.target.value });
        triggerRender();
    });
}
```

**Étape 4 : Payload** - Ajouter le paramètre dans `buildConfigString()` (`api/payload-builder.js`)
```javascript
export async function buildConfigString(xmlDoc, config) {
    const configParts = [
        // ... existing
        `NouveauParametre.${config.nouveauParametre}`
    ];
    return configParts.filter(Boolean).join('/');
}
```

**Étape 5 : Test** - Tester le rendu
1. Charger la page
2. Modifier le nouveau contrôle
3. Vérifier que le rendu se régénère

---

## Conventions de code

### Nommage
- **Variables/fonctions** : camelCase (`getUserConfig`, `currentImages`)
- **Constantes** : UPPER_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_TIMEOUT`)
- **Classes** : PascalCase (pas utilisé actuellement)
- **Fichiers** : kebab-case (`xml-parser.js`, `payload-builder.js`)

### Fonctions
- **Une fonction = une action** (Single Responsibility Principle)
- **Max 20 lignes par fonction** (idéalement)
- **JSDoc obligatoire** pour toutes les exports
- **Noms descriptifs** : `buildPayload()` pas `build()`

### JSDoc
```javascript
/**
 * Description courte de la fonction
 * @param {Type} paramName - Description du paramètre
 * @returns {Type} Description du retour
 * @throws {Error} Description de l'erreur possible
 */
export function maFonction(paramName) {
    // ...
}
```

### Logs
Utiliser les emojis pour classifier :
- 🎬 **Info** : Début opération (`console.log('🎬 Début chargement XML')`)
- ✅ **Success** : Opération réussie (`console.log('✅ Rendu généré')`)
- ⚠️ **Warning** : Attention non bloquant (`console.warn('⚠️ Cache expiré')`)
- ❌ **Error** : Erreur bloquante (`console.error('❌ Erreur API')`)

---

## Debugging

### Problèmes courants

**"Cannot find module './api.js'"**
→ Imports non mis à jour après refactoring
→ Solution : Utiliser `./api/index.js` au lieu de `./api.js`

**"buildPayload is not a function"**
→ Import incorrect
→ Solution : Vérifier l'import `import { buildPayload } from './api/index.js';`

**"Uncaught ReferenceError: showLoader is not defined"**
→ Fonction non importée
→ Solution : `import { showLoader } from './ui/index.js';`

**Images ne se chargent pas**
→ Vérifier DATABASE_ID dans api-client.js
→ Vérifier payload dans console (bouton "Télécharger JSON")

---

## Tests manuels

### Checklist complète

Voir `sprints/sprint-13/test-checklist.md` pour la liste exhaustive.

**Tests rapides** :
1. Charger la page → Placeholder s'affiche
2. Vue Extérieur → Génère 6 images
3. Vue Intérieur → Génère 4 images
4. Vue Configuration → Génère ~26 images
5. Modal plein écran → Navigation ←/→
6. Téléchargement JSON → Fichier .json téléchargé

---

## Performance

### Optimisations actuelles
- **Cache XML** : Le XML de la base est téléchargé 1 seule fois
- **Lazy loading** : Images chargées à la demande
- **Debouncing** : Pas de rendu pendant que l'utilisateur tape

### Métriques cibles
- **Temps de chargement initial** : < 2s
- **Temps de génération rendu** : < 30s
- **Taille bundle JS** : ~150 KB (non minifié)

---

## Architecture future

### Améliorations possibles
1. **Tests unitaires** : Jest + Testing Library
2. **Build system** : Vite ou Rollup pour bundling
3. **TypeScript** : Typage fort pour réduire bugs
4. **State management** : Zustand ou Pinia si complexité augmente
5. **Composants** : Web Components natifs (pas de framework)

---

**Bon développement ! 🚀**
