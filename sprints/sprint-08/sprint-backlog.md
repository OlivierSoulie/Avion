# Sprint Backlog - Sprint #8

**Projet** : 005-Configurateur_Daher
**Sprint** : Sprint #8
**Sprint Goal** : "Permettre le téléchargement individuel et par lot des images générées"
**Date de démarrage** : 05/12/2025
**Capacity** : 7 Story Points (US-031: 2 SP + US-032: 5 SP)
**Équipe** : 6 agents (PO + ARCH + COORDINATOR + DEV-Généraliste + QA-Fonctionnel + DOC)

---

## 📋 User Stories du Sprint

### [US-031] Téléchargement individuel d'images (2 SP)

**Description** :
En tant qu'utilisateur, je veux pouvoir télécharger une image individuellement en cliquant sur une icône, afin de sauvegarder rapidement une vue spécifique.

**Critères d'acceptation** :
- [ ] Icône download visible en coin supérieur droit de chaque vignette mosaïque
- [ ] Clic sur icône → téléchargement immédiat de l'image
- [ ] Nommage : `vue_exterieur_N.png` (N = 1 à 5) ou `vue_interieur_N.png` (N = 1 à 6)
- [ ] Pas d'impact sur le clic pour ouvrir en fullscreen (clic sur image uniquement)
- [ ] Icône visible au hover sur vignette
- [ ] Toast de succès après téléchargement

### [US-032] Téléchargement par lot avec sélection (5 SP)

**Description** :
En tant qu'utilisateur, je veux pouvoir sélectionner plusieurs images et les télécharger en lot, afin de gagner du temps quand je veux plusieurs vues.

**Critères d'acceptation** :
- [ ] Bouton "Télécharger plusieurs images" dans la section viewport
- [ ] Clic sur bouton → Active mode sélection
- [ ] Checkboxes visibles sur chaque vignette en mode sélection
- [ ] Compteur de sélection : "3 images sélectionnées"
- [ ] Bouton "Télécharger la sélection (3)" actif seulement si au moins 1 image sélectionnée
- [ ] Bouton "Annuler" pour quitter le mode sélection
- [ ] Téléchargements séquentiels (pas parallèle) avec délai 200ms entre chaque
- [ ] Barre de progression : "Téléchargement 2/5..."
- [ ] Toast de succès à la fin : "5 images téléchargées avec succès"

---

## 🔧 Décomposition Technique

### US-031 : Téléchargement individuel (2 SP - ~1h)

#### T1.1 : Ajouter icône download sur vignettes (HTML/JS) - 15 min
**Fichier** : `code/js/ui.js` (fonction `renderMosaic()`)

**Tâche** :
1. Dans `renderMosaic()`, créer un conteneur wrapper pour chaque image
2. Wrapper contient : `<img>` + `<button class="download-btn">`
3. Bouton avec icône SVG download (⬇️ ou icône Material/FontAwesome)
4. Event listener sur bouton → `downloadImage(url, filename)`
5. Event listener sur `<img>` conservé pour fullscreen

**Code structure** :
```javascript
// Dans renderMosaic(), remplacer :
// mosaicGrid.appendChild(img);
// Par :
const wrapper = document.createElement('div');
wrapper.classList.add('mosaic-item');

const img = document.createElement('img');
img.src = url;
img.alt = `Vue TBM ${index + 1}`;
img.loading = 'lazy';
img.addEventListener('click', () => openFullscreen(index));

const downloadBtn = document.createElement('button');
downloadBtn.classList.add('download-btn');
downloadBtn.innerHTML = '⬇️'; // Ou icône SVG
downloadBtn.setAttribute('aria-label', 'Télécharger cette image');
downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Empêcher l'ouverture fullscreen
    const filename = generateFilename(viewType, index + 1);
    downloadImage(url, filename);
});

wrapper.appendChild(img);
wrapper.appendChild(downloadBtn);
mosaicGrid.appendChild(wrapper);
```

#### T1.2 : Créer fonction downloadImage() (JS) - 20 min
**Fichier** : `code/js/ui.js` (nouvelle fonction export)

**Tâche** :
1. Créer `export function downloadImage(imageUrl, filename)`
2. Créer un `<a>` temporaire avec `href = imageUrl` et `download = filename`
3. Trigger click programmatique sur le lien
4. Supprimer le lien temporaire
5. Afficher toast de succès : `showSuccessToast('Image téléchargée !')`

**Code** :
```javascript
/**
 * Télécharge une image avec un nom de fichier donné
 * @param {string} imageUrl - URL de l'image (base64 ou blob)
 * @param {string} filename - Nom du fichier (ex: "vue_exterieur_1.png")
 */
export function downloadImage(imageUrl, filename) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccessToast(`Image téléchargée : ${filename}`);
    console.log(`✅ Image téléchargée : ${filename}`);
}
```

#### T1.3 : Créer fonction generateFilename() (JS) - 10 min
**Fichier** : `code/js/ui.js` (nouvelle fonction interne)

**Tâche** :
1. Créer `function generateFilename(viewType, imageNumber)`
2. Si `viewType === 'exterior'` → `vue_exterieur_${imageNumber}.png`
3. Si `viewType === 'interior'` → `vue_interieur_${imageNumber}.png`
4. Retourner le filename

**Code** :
```javascript
/**
 * Génère le nom de fichier pour une image
 * @param {string} viewType - 'exterior' ou 'interior'
 * @param {number} imageNumber - Numéro de l'image (1-based)
 * @returns {string} Nom de fichier (ex: "vue_exterieur_1.png")
 */
function generateFilename(viewType, imageNumber) {
    const prefix = viewType === 'exterior' ? 'vue_exterieur' : 'vue_interieur';
    return `${prefix}_${imageNumber}.png`;
}
```

#### T1.4 : Styles CSS pour icône download (CSS) - 15 min
**Fichier** : `code/styles/viewport.css`

**Tâche** :
1. Wrapper `.mosaic-item` en position relative
2. `.download-btn` en position absolute, top-right avec padding 8px
3. Background semi-transparent : `rgba(0, 0, 0, 0.6)`
4. Couleur blanche, border-radius, transition
5. Visible seulement au hover de `.mosaic-item`
6. Hover effect : background plus opaque

**Code** :
```css
/* Wrapper pour image + bouton download */
.mosaic-item {
    position: relative;
    width: 100%;
    cursor: pointer;
}

.mosaic-item img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: var(--radius-md);
    transition: transform 0.2s ease;
}

.mosaic-item:hover img {
    transform: scale(1.02);
}

/* Bouton download */
.download-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    opacity: 0;
    transition: opacity 0.2s ease, background 0.2s ease;
    z-index: 10;
}

.mosaic-item:hover .download-btn {
    opacity: 1;
}

.download-btn:hover {
    background: rgba(0, 0, 0, 0.85);
    transform: scale(1.1);
}
```

---

### US-032 : Téléchargement par lot (5 SP - ~2-3h)

#### T2.1 : Ajouter bouton "Télécharger plusieurs images" (HTML) - 10 min
**Fichier** : `code/index.html`

**Tâche** :
1. Dans `.technical-controls` (après le bouton "Télécharger JSON")
2. Ajouter bouton `<button id="btnBulkDownload">Télécharger plusieurs images</button>`
3. Classe : `btn btn-secondary`

**Code** :
```html
<!-- Après le bouton Télécharger JSON -->
<button id="btnBulkDownload" class="btn btn-secondary">
    📥 Télécharger plusieurs images
</button>
```

#### T2.2 : Ajouter checkboxes sur vignettes (JS) - 20 min
**Fichier** : `code/js/ui.js` (fonction `renderMosaic()`)

**Tâche** :
1. Dans `renderMosaic()`, ajouter `<input type="checkbox" class="image-checkbox" data-index="${index}">` dans chaque wrapper
2. Checkbox cachée par défaut (CSS `display: none`)
3. Visible seulement quand `.mosaic-grid` a la classe `.selection-mode`

**Code** :
```javascript
// Dans renderMosaic(), après downloadBtn :
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.classList.add('image-checkbox');
checkbox.dataset.index = index;
checkbox.dataset.url = url;
checkbox.dataset.filename = generateFilename(viewType, index + 1);

wrapper.appendChild(checkbox);
```

#### T2.3 : Créer barre de contrôles mode sélection (HTML) - 15 min
**Fichier** : `code/index.html`

**Tâche** :
1. Ajouter `<div id="selectionControls" class="selection-controls hidden">` dans `.viewport-container`
2. Contenu : compteur + bouton télécharger + bouton annuler
3. Position : au-dessus de la mosaïque

**Code** :
```html
<!-- Dans .viewport-container, avant #mosaicGrid -->
<div id="selectionControls" class="selection-controls hidden">
    <span id="selectionCounter" class="selection-counter">0 images sélectionnées</span>
    <button id="btnDownloadSelected" class="btn btn-primary" disabled>
        Télécharger la sélection (0)
    </button>
    <button id="btnCancelSelection" class="btn btn-secondary">
        Annuler
    </button>
</div>
```

#### T2.4 : Créer barre de progression (HTML) - 10 min
**Fichier** : `code/index.html`

**Tâche** :
1. Ajouter `<div id="downloadProgress" class="download-progress hidden">`
2. Contenu : barre de progression + texte statut

**Code** :
```html
<!-- Dans .viewport-container, après selectionControls -->
<div id="downloadProgress" class="download-progress hidden">
    <p id="downloadStatus">Téléchargement en cours...</p>
    <div class="progress-bar">
        <div id="progressFill" class="progress-fill" style="width: 0%"></div>
    </div>
</div>
```

#### T2.5 : Event listeners mode sélection (JS) - 30 min
**Fichier** : `code/js/app.js` (dans `initUI()`)

**Tâche** :
1. Listener sur `#btnBulkDownload` → `enterSelectionMode()`
2. Listener sur `#btnCancelSelection` → `exitSelectionMode()`
3. Listener sur `#btnDownloadSelected` → `downloadSelectedImages()`
4. Listener sur toutes les checkboxes → `updateSelectionCounter()`

**Code** :
```javascript
// Dans initUI()
const btnBulkDownload = document.getElementById('btnBulkDownload');
const btnCancelSelection = document.getElementById('btnCancelSelection');
const btnDownloadSelected = document.getElementById('btnDownloadSelected');

btnBulkDownload?.addEventListener('click', enterSelectionMode);
btnCancelSelection?.addEventListener('click', exitSelectionMode);
btnDownloadSelected?.addEventListener('click', downloadSelectedImages);
```

#### T2.6 : Fonctions mode sélection (JS) - 40 min
**Fichier** : `code/js/ui.js` (nouvelles fonctions export)

**Tâche** :
1. Créer `export function enterSelectionMode()`
   - Ajouter classe `.selection-mode` à `#mosaicGrid`
   - Afficher `#selectionControls`
   - Masquer boutons download individuels
   - Ajouter listeners sur checkboxes
2. Créer `export function exitSelectionMode()`
   - Retirer classe `.selection-mode`
   - Masquer `#selectionControls`
   - Décocher toutes les checkboxes
   - Reset compteur
3. Créer `function updateSelectionCounter()`
   - Compter checkboxes cochées
   - Mettre à jour texte compteur
   - Activer/désactiver bouton download

**Code** :
```javascript
/**
 * Active le mode sélection pour téléchargement par lot
 */
export function enterSelectionMode() {
    const mosaicGrid = document.getElementById('mosaicGrid');
    const selectionControls = document.getElementById('selectionControls');

    mosaicGrid?.classList.add('selection-mode');
    selectionControls?.classList.remove('hidden');

    // Masquer boutons download individuels
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.style.display = 'none';
    });

    // Ajouter listeners sur checkboxes
    document.querySelectorAll('.image-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectionCounter);
    });

    console.log('Mode sélection activé');
}

/**
 * Désactive le mode sélection
 */
export function exitSelectionMode() {
    const mosaicGrid = document.getElementById('mosaicGrid');
    const selectionControls = document.getElementById('selectionControls');

    mosaicGrid?.classList.remove('selection-mode');
    selectionControls?.classList.add('hidden');

    // Réafficher boutons download individuels
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.style.display = '';
    });

    // Décocher toutes les checkboxes
    document.querySelectorAll('.image-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });

    updateSelectionCounter();
    console.log('Mode sélection désactivé');
}

/**
 * Met à jour le compteur de sélection
 */
function updateSelectionCounter() {
    const checkboxes = document.querySelectorAll('.image-checkbox:checked');
    const count = checkboxes.length;

    const counter = document.getElementById('selectionCounter');
    const btnDownload = document.getElementById('btnDownloadSelected');

    if (counter) {
        counter.textContent = `${count} image${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}`;
    }

    if (btnDownload) {
        btnDownload.disabled = count === 0;
        btnDownload.textContent = `Télécharger la sélection (${count})`;
    }
}
```

#### T2.7 : Fonction téléchargement par lot (JS) - 50 min
**Fichier** : `code/js/ui.js` (nouvelle fonction export)

**Tâche** :
1. Créer `export async function downloadSelectedImages()`
2. Récupérer toutes les checkboxes cochées
3. Extraire URLs et filenames depuis `dataset`
4. Afficher barre de progression
5. Boucle séquentielle : télécharger chaque image avec délai 200ms
6. Mettre à jour barre de progression après chaque téléchargement
7. Masquer barre, quitter mode sélection, toast de succès

**Code** :
```javascript
/**
 * Télécharge toutes les images sélectionnées de manière séquentielle
 */
export async function downloadSelectedImages() {
    const checkboxes = document.querySelectorAll('.image-checkbox:checked');

    if (checkboxes.length === 0) {
        showError('Aucune image sélectionnée');
        return;
    }

    const total = checkboxes.length;
    const progressDiv = document.getElementById('downloadProgress');
    const statusText = document.getElementById('downloadStatus');
    const progressFill = document.getElementById('progressFill');

    // Afficher barre de progression
    progressDiv?.classList.remove('hidden');

    // Télécharger chaque image séquentiellement
    for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const url = checkbox.dataset.url;
        const filename = checkbox.dataset.filename;

        // Mettre à jour statut
        if (statusText) {
            statusText.textContent = `Téléchargement ${i + 1}/${total}...`;
        }

        if (progressFill) {
            const percent = ((i + 1) / total) * 100;
            progressFill.style.width = `${percent}%`;
        }

        // Télécharger l'image
        downloadImage(url, filename);

        // Délai de 200ms entre chaque téléchargement
        if (i < checkboxes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    // Masquer barre de progression
    setTimeout(() => {
        progressDiv?.classList.add('hidden');
        if (progressFill) progressFill.style.width = '0%';
    }, 500);

    // Quitter mode sélection
    exitSelectionMode();

    // Toast de succès
    showSuccessToast(`${total} image${total > 1 ? 's' : ''} téléchargée${total > 1 ? 's' : ''} avec succès !`);

    console.log(`✅ ${total} images téléchargées`);
}
```

#### T2.8 : Styles CSS mode sélection (CSS) - 25 min
**Fichier** : `code/styles/viewport.css`

**Tâche** :
1. Styles pour `.selection-controls` (flexbox, padding, background)
2. Styles pour checkboxes (position absolute, visible en mode sélection)
3. Styles pour `.download-progress` (barre de progression)
4. Styles pour `.progress-bar` et `.progress-fill`

**Code** :
```css
/* ========================================
   Mode Sélection
   ======================================== */

/* Contrôles mode sélection */
.selection-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-md);
}

.selection-controls.hidden {
    display: none;
}

.selection-counter {
    flex: 1;
    font-weight: 600;
    color: var(--color-text-primary);
}

/* Checkboxes sur images */
.image-checkbox {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    z-index: 10;
    display: none; /* Caché par défaut */
}

/* Afficher checkboxes en mode sélection */
.mosaic-grid.selection-mode .image-checkbox {
    display: block;
}

/* Masquer boutons download en mode sélection */
.mosaic-grid.selection-mode .download-btn {
    display: none !important;
}

/* Barre de progression */
.download-progress {
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-md);
}

.download-progress.hidden {
    display: none;
}

.download-progress p {
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
    color: var(--color-text-primary);
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: var(--color-border);
    border-radius: var(--radius-full);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: var(--color-primary);
    transition: width 0.3s ease;
    border-radius: var(--radius-full);
}
```

---

## 📊 Estimation de temps

### US-031 (2 SP)
- T1.1 : Ajouter icône download (15 min)
- T1.2 : Fonction downloadImage() (20 min)
- T1.3 : Fonction generateFilename() (10 min)
- T1.4 : Styles CSS icône (15 min)
**Total** : ~1h

### US-032 (5 SP)
- T2.1 : Bouton "Télécharger plusieurs images" (10 min)
- T2.2 : Checkboxes sur vignettes (20 min)
- T2.3 : Barre de contrôles sélection (15 min)
- T2.4 : Barre de progression (10 min)
- T2.5 : Event listeners (30 min)
- T2.6 : Fonctions mode sélection (40 min)
- T2.7 : Fonction téléchargement par lot (50 min)
- T2.8 : Styles CSS mode sélection (25 min)
**Total** : ~3h

**Total Sprint #8** : ~4h dev + 30min QA + 15min review = **~4h45**

---

## ✅ Definition of Done

Pour chaque US :
- [ ] Tous les critères d'acceptation validés
- [ ] Code implémenté et testé
- [ ] Tests QA passés (100%)
- [ ] Pas de bugs bloquants
- [ ] Documentation mise à jour si nécessaire
- [ ] Code commité sur Git
- [ ] Validation stakeholder

---

## 📝 Notes Techniques

### Architecture des fichiers modifiés

**US-031** :
- `code/js/ui.js` : renderMosaic(), downloadImage(), generateFilename()
- `code/styles/viewport.css` : .mosaic-item, .download-btn

**US-032** :
- `code/index.html` : btnBulkDownload, selectionControls, downloadProgress
- `code/js/ui.js` : enterSelectionMode(), exitSelectionMode(), updateSelectionCounter(), downloadSelectedImages()
- `code/js/app.js` : Event listeners dans initUI()
- `code/styles/viewport.css` : .selection-controls, .image-checkbox, .download-progress

### Dépendances

- US-032 dépend de US-031 (réutilise `downloadImage()`)
- Les deux US utilisent `getImages()` de `state.js`
- Les deux US utilisent `showSuccessToast()` de `ui.js`

### Risques identifiés

1. **Format images** : Les images sont en base64, vérifier que le download fonctionne
2. **Navigateurs** : Tester sur Chrome, Firefox, Edge (download attribute)
3. **Taille fichiers** : Images potentiellement volumineuses, délai 200ms peut être ajusté

---

**Sprint créé par** : ARCH
**Date** : 05/12/2025
**Validé par** : COORDINATOR
