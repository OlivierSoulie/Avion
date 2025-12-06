# Sprint #12 - Backlog

**Sprint Goal** : "Ajouter une vue Configuration avec mosaïque adaptative de 27 vignettes (1x16:9 + 26x1:1)"

**Dates** : 06/12/2025 - 06/12/2025 (Sprint court - 1 US)
**Story Points** : 5 SP
**Équipe** : DEV, QA

---

## 📊 Vue d'ensemble

| User Story | Story Points | Status |
|------------|--------------|--------|
| US-042 : Mosaïque Configuration avec vignettes adaptatives | 5 SP | To Do |

**Total Sprint** : 5 SP

---

## 🎯 US-042 : Mosaïque Configuration avec vignettes adaptatives

**Contexte** :
- 27 caméras dans le groupe "Configuration" (1x16:9 + 26x1:1)
- Détection automatique des ratios via sensorId → Sensor width/height
- Tailles : 16:9 = 400x225px, 1:1 = 100x100px

---

## 📋 Tâches détaillées

### Phase 1 : Backend - API et détection ratios (1h)

#### [T042-1] Fonction getCameraSensorInfo() dans api.js (30 min)

**Description** : Créer une fonction pour extraire les informations de sensor d'une caméra et calculer automatiquement son ratio.

**Fichier** : `code/js/api.js`

**Implémentation** :
```javascript
/**
 * Récupère les informations du sensor d'une caméra
 * @param {string} cameraId - L'ID de la caméra
 * @returns {Promise<Object>} { sensorId, sensorName, width, height, ratio, ratioType }
 */
export async function getCameraSensorInfo(cameraId) {
    const xmlDoc = await getDatabaseXML();

    // 1. Trouver la caméra
    const camera = xmlDoc.querySelector(`Camera[id="${cameraId}"]`);
    if (!camera) {
        throw new Error(`Camera ${cameraId} not found in XML`);
    }

    // 2. Récupérer le sensorId
    const sensorId = camera.getAttribute('sensorId');

    // 3. Trouver le sensor
    const sensor = xmlDoc.querySelector(`Sensor[id="${sensorId}"]`);
    if (!sensor) {
        throw new Error(`Sensor ${sensorId} not found in XML`);
    }

    // 4. Extraire dimensions et calculer ratio
    const width = parseFloat(sensor.getAttribute('width'));
    const height = parseFloat(sensor.getAttribute('height'));
    const ratio = width / height;

    // 5. Déterminer le type de ratio (1:1 ou 16:9)
    const ratioType = Math.abs(ratio - 1.0) < 0.01 ? '1:1' : '16:9';

    return {
        sensorId,
        sensorName: sensor.getAttribute('name'),
        width,
        height,
        ratio,
        ratioType
    };
}
```

**Tests** :
- [ ] Appeler avec cameraId de "paint scheme" → retourne ratio 16:9
- [ ] Appeler avec cameraId de "Spinner" → retourne ratio 1:1
- [ ] Gérer erreur si cameraId invalide

---

#### [T042-2] Support viewType="configuration" dans findCameraGroupId() (30 min)

**Description** : Modifier la fonction `findCameraGroupId()` pour supporter la vue "configuration".

**Fichier** : `code/js/api.js`

**Modification** :
```javascript
async function findCameraGroupId(decorName, viewType = "exterior") {
    console.log(`📷 Recherche camera group - Décor: ${decorName}, Vue: ${viewType}`);

    const xmlDoc = await getDatabaseXML();
    const groups = xmlDoc.querySelectorAll('Group');

    console.log(`   > ${groups.length} groupes trouvés dans le XML`);

    // US-042: Si vue configuration, chercher "Configuration"
    if (viewType === "configuration") {
        console.log(`   > Recherche vue configuration: name="Configuration"`);

        for (let group of groups) {
            const groupName = group.getAttribute('name');
            if (groupName === "Configuration") {
                const id = group.getAttribute('id');
                console.log(`   ✅ Camera group Configuration trouvé: ${id}`);
                return id;
            }
        }

        throw new Error(`❌ Groupe caméra "Configuration" introuvable dans le XML`);
    }

    // US-022: Si vue intérieure, chercher "Interieur"
    if (viewType === "interior") {
        // ... (code existant)
    }

    // Vue extérieure: comportement original
    // ... (code existant)
}
```

**Tests** :
- [ ] Appeler avec viewType="configuration" → retourne l'ID du groupe Configuration
- [ ] Vérifier que viewType="interior" et "exterior" fonctionnent toujours
- [ ] Console log affiche le bon message

---

### Phase 2 : Frontend - UI et mosaïque (1h30)

#### [T042-3] Ajout onglet "CONFIGURATION" dans index.html (15 min)

**Description** : Ajouter un troisième onglet "CONFIGURATION" aux côtés de "EXTÉRIEUR" et "INTÉRIEUR".

**Fichier** : `code/index.html`

**Modification** :
```html
<!-- Dans la section .view-toggle -->
<div class="view-toggle">
    <button id="btnViewExterior" class="active">EXTÉRIEUR</button>
    <button id="btnViewInterior">INTÉRIEUR</button>
    <button id="btnViewConfiguration">CONFIGURATION</button>
</div>
```

**Tests** :
- [ ] Le bouton "CONFIGURATION" s'affiche correctement
- [ ] Style cohérent avec les autres onglets
- [ ] Clic sur le bouton fonctionne (event listener ajouté dans T042-7)

---

#### [T042-4] Fonction renderConfigMosaic() dans ui.js (45 min)

**Description** : Créer une fonction dédiée pour afficher la mosaïque de configuration avec vignettes de tailles adaptatives.

**Fichier** : `code/js/ui.js`

**Implémentation** :
```javascript
import { getCameraSensorInfo } from './api.js';

/**
 * Affiche la mosaïque de configuration avec vignettes adaptatives
 * @param {Array} images - Liste des images avec cameraId
 */
export async function renderConfigMosaic(images) {
    const mosaicGrid = document.getElementById('mosaicGrid');
    if (!mosaicGrid) {
        console.error('❌ mosaicGrid non trouvé');
        return;
    }

    // Vider la grille
    mosaicGrid.innerHTML = '';
    mosaicGrid.classList.add('config-mosaic');

    console.log(`📸 Rendu mosaïque Configuration: ${images.length} images`);

    // Pour chaque image
    for (let index = 0; index < images.length; index++) {
        const imageData = images[index];

        // Récupérer le ratio du sensor
        let ratioType = '1:1'; // Défaut
        if (imageData.cameraId) {
            try {
                const sensorInfo = await getCameraSensorInfo(imageData.cameraId);
                ratioType = sensorInfo.ratioType;
                console.log(`   > Caméra ${imageData.cameraName || imageData.cameraId}: ${ratioType}`);
            } catch (error) {
                console.warn(`⚠️ Impossible de déterminer le ratio pour ${imageData.cameraId}:`, error);
            }
        }

        // Créer le wrapper
        const wrapper = document.createElement('div');
        wrapper.classList.add('mosaic-item');
        wrapper.classList.add(ratioType === '16:9' ? 'vignette-16-9' : 'vignette-1-1');

        // Créer l'image
        const img = document.createElement('img');
        img.src = imageData.url || imageData;
        img.alt = imageData.cameraName || `Configuration ${index + 1}`;
        img.loading = 'lazy';

        // Event listener pour modal plein écran
        img.addEventListener('click', () => {
            openFullscreenModal(images, index);
        });

        wrapper.appendChild(img);
        mosaicGrid.appendChild(wrapper);
    }

    console.log('✅ Mosaïque Configuration affichée');
}
```

**Tests** :
- [ ] Les 27 images s'affichent correctement
- [ ] 1 vignette grande (16:9) et 26 petites (1:1)
- [ ] Clic sur une vignette ouvre le modal plein écran
- [ ] Console log affiche le ratio de chaque caméra

---

#### [T042-5] CSS Grid adaptatif dans viewport.css (30 min)

**Description** : Créer les styles CSS pour la mosaïque Configuration avec vignettes de tailles différentes.

**Fichier** : `code/styles/viewport.css`

**Styles** :
```css
/* Mosaïque Configuration - Grille adaptative */
.mosaic-grid.config-mosaic {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 15px;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
    align-items: center;
    justify-items: center;
}

/* Vignette 16:9 (paint scheme) */
.mosaic-item.vignette-16-9 {
    width: 400px;
    height: 225px;
    grid-column: span 4; /* Occupe 4 colonnes */
}

.mosaic-item.vignette-16-9 img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Vignette 1:1 (détails) */
.mosaic-item.vignette-1-1 {
    width: 100px;
    height: 100px;
}

.mosaic-item.vignette-1-1 img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Hover effects */
.mosaic-item img:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 1200px) {
    .mosaic-item.vignette-16-9 {
        width: 320px;
        height: 180px;
        grid-column: span 3;
    }
}

@media (max-width: 768px) {
    .mosaic-grid.config-mosaic {
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 10px;
    }

    .mosaic-item.vignette-16-9 {
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
        grid-column: span 2;
    }

    .mosaic-item.vignette-1-1 {
        width: 80px;
        height: 80px;
    }
}
```

**Tests** :
- [ ] La grille s'affiche correctement sur desktop (1920x1080)
- [ ] La vignette 16:9 est bien plus grande que les 1:1
- [ ] Hover effect fonctionne
- [ ] Responsive sur tablette et mobile

---

### Phase 3 : Intégration et appel API (45 min)

#### [T042-6] Intégration appel API avec viewType="configuration" (30 min)

**Description** : Modifier l'appel API pour supporter le groupe Configuration et gérer les tailles multiples.

**Fichier** : `code/js/api.js` (modification de `buildPayload()`)

**Modification** :
```javascript
// Dans buildPayload(), après récupération du cameraGroupId
// US-042: Pour la vue Configuration, ne pas spécifier de taille fixe
// L'API utilisera les tailles par défaut des sensors
if (config.viewType === 'configuration') {
    console.log('📐 Vue Configuration: utilisation des tailles sensors par défaut');
    // Les renderParameters utilisent les dimensions par défaut
    // Pas de override nécessaire
}
```

**Note** : L'API Lumiscaphe utilise automatiquement les dimensions des sensors si non spécifiées dans `renderParameters`. Pour la vue Configuration, on laisse l'API utiliser les tailles natives.

**Tests** :
- [ ] Appel API avec viewType="configuration" fonctionne
- [ ] Les 27 images sont retournées
- [ ] Les images respectent les ratios des sensors (16:9 vs 1:1)

---

#### [T042-7] Event listeners et navigation onglets (15 min)

**Description** : Ajouter les event listeners pour le bouton "CONFIGURATION" et la navigation entre les vues.

**Fichier** : `code/js/app.js`

**Implémentation** :
```javascript
// Event listener pour le bouton Configuration
document.getElementById('btnViewConfiguration')?.addEventListener('click', async () => {
    console.log('🔄 Basculement vers vue Configuration');

    // 1. Mettre à jour les boutons actifs
    document.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btnViewConfiguration').classList.add('active');

    // 2. Masquer les sections de contrôles Ext/Int (optionnel)
    // Pour l'instant, on laisse visible car certaines config peuvent s'appliquer

    // 3. Afficher le loader
    showLoader();

    try {
        // 4. Récupérer la configuration actuelle
        const config = getConfig();
        config.viewType = 'configuration';

        // 5. Appeler l'API
        const images = await fetchRenderImages(config);

        // 6. Afficher la mosaïque Configuration
        await renderConfigMosaic(images);

        hideLoader();
        console.log('✅ Vue Configuration affichée');

    } catch (error) {
        console.error('❌ Erreur chargement Configuration:', error);
        showError('Erreur lors du chargement de la vue Configuration');
        hideLoader();
    }
});
```

**Tests** :
- [ ] Clic sur "CONFIGURATION" déclenche le bon flow
- [ ] Le loader s'affiche pendant le chargement
- [ ] La mosaïque Configuration apparaît après le chargement
- [ ] Les erreurs sont gérées correctement

---

### Phase 4 : Tests et ajustements (30 min)

#### [T042-8] Tests manuels end-to-end (20 min)

**Description** : Tester l'ensemble de la fonctionnalité Configuration.

**Checklist de tests** :
- [ ] **Chargement initial** :
  - [ ] Ouvrir la page, cliquer sur "CONFIGURATION"
  - [ ] Vérifier que les 27 vignettes s'affichent
  - [ ] Vérifier 1 grande vignette (16:9) + 26 petites (1:1)
  - [ ] Aucune erreur console

- [ ] **Modal plein écran** :
  - [ ] Clic sur une vignette 16:9 → modal s'ouvre en 16:9
  - [ ] Clic sur une vignette 1:1 → modal s'ouvre en 1:1
  - [ ] Fermeture avec ✕ fonctionne
  - [ ] Fermeture avec Echap fonctionne
  - [ ] Navigation flèches gauche/droite fonctionne

- [ ] **Navigation onglets** :
  - [ ] Basculer EXTÉRIEUR → CONFIGURATION → INTÉRIEUR
  - [ ] Vérifier que chaque vue s'affiche correctement
  - [ ] Pas de régression sur les vues existantes

- [ ] **Responsive** :
  - [ ] Tester sur desktop 1920x1080 → affichage optimal
  - [ ] Tester sur tablette 1024x768 → vignettes ajustées
  - [ ] Tester sur mobile 375x667 → grille adaptée

- [ ] **Performance** :
  - [ ] Temps de chargement < 5 secondes
  - [ ] Pas de freeze de l'UI

**Fichiers de référence** :
- Test manuel : Ouvrir `code/index.html` dans le navigateur
- Console navigateur pour les logs

---

#### [T042-9] Ajustements visuels et optimisations (10 min)

**Description** : Ajuster les détails visuels après les tests.

**Points d'attention** :
- [ ] Espacement entre vignettes (ajuster `gap` si nécessaire)
- [ ] Alignement de la grille (centré ou aligné à gauche ?)
- [ ] Taille des vignettes sur petits écrans (réduire si scroll excessif)
- [ ] Bordures/ombres des vignettes (cohérence visuelle)

**Fichiers concernés** :
- `code/styles/viewport.css` : Ajustements CSS

---

## 📁 Fichiers modifiés/créés

### Backend
- ✏️ `code/js/api.js` :
  - Nouvelle fonction `getCameraSensorInfo(cameraId)`
  - Modification `findCameraGroupId()` (support viewType="configuration")

### Frontend
- ✏️ `code/index.html` : Ajout onglet "CONFIGURATION"
- ✏️ `code/js/ui.js` : Nouvelle fonction `renderConfigMosaic(images)`
- ✏️ `code/js/app.js` : Event listeners pour onglet Configuration
- ✏️ `code/styles/viewport.css` : Classes `.vignette-16-9` et `.vignette-1-1`

---

## 🔗 Dépendances

### Dépendances réutilisées
- ✅ `getDatabaseXML()` : Disponible dans `api.js`
- ✅ `findCameraGroupId()` : Existant, à modifier
- ✅ `openFullscreenModal()` : Existant (US-020)
- ✅ `.mosaic-grid` : Existant (US-029), à étendre

### Dépendances externes
- ✅ API Lumiscaphe : Groupe "Configuration" confirmé
- ✅ XML : Sensors avec width/height disponibles

---

## ⏱️ Estimation totale

| Phase | Durée estimée |
|-------|---------------|
| Phase 1 : Backend | 1h |
| Phase 2 : Frontend | 1h30 |
| Phase 3 : Intégration | 45 min |
| Phase 4 : Tests | 30 min |
| **Total** | **3h45** |

**Story Points** : 5 SP (cohérent avec ~3-4h de développement)

---

## 🎯 Definition of Done (DoD)

- [ ] Code fonctionnel testé manuellement
- [ ] Tous les critères d'acceptation validés
- [ ] Pas d'erreurs console
- [ ] Testé sur Chrome, Firefox, Edge
- [ ] Responsive (desktop + tablette + mobile)
- [ ] Code commenté (nouvelles fonctions)
- [ ] Pas de régression sur vues EXTÉRIEUR/INTÉRIEUR
- [ ] Tests QA documentés (test-report.md)

---

**Prêt pour développement** : ✅
**Assigné à** : DEV
**Prochaine étape** : Mise à jour Kanban Board + Lancement développement
