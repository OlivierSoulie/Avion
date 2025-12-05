# Architecture Technique - Configurateur_Daher

**Projet** : 005-Configurateur_Daher
**Architecte** : Claude (ARCH Agent)
**Date** : 02/12/2025
**Version** : 1.0

---

## 🎯 Vue d'ensemble

Application web locale permettant de configurer et visualiser des rendus TBM via l'API Lumiscaphe.

**Contraintes** :
- ✅ Exécution locale sans serveur (double-clic sur index.html)
- ✅ Pas de build step (pas de npm, webpack, etc.)
- ✅ Moderne et maintenable
- ✅ Compatible navigateurs récents (Chrome, Firefox, Edge)

---

## 🏗️ Stack Technique

### Frontend
- **HTML5** : Structure sémantique
- **CSS3 Custom** : Sans framework (Flexbox/Grid natifs)
- **JavaScript ES6+** : Modules natifs (`type="module"`)

### API
- **API REST Lumiscaphe** : `https://wr-daher.lumiscaphe.com`
  - Endpoint principal : `POST /Snapshot`
  - Format : JSON
  - Réponse : Array d'objets avec URLs d'images

### Pas de dépendances externes
- ❌ Pas de npm/node_modules
- ❌ Pas de framework JS (React, Vue, etc.)
- ❌ Pas de framework CSS (Bootstrap, Tailwind)
- ✅ JavaScript natif uniquement
- ✅ CSS custom optimisé

---

## 📁 Structure des fichiers

```
005-Configurateur_Daher/
├── code/
│   ├── index.html                 # Point d'entrée
│   ├── styles/
│   │   ├── main.css              # Styles principaux
│   │   ├── viewport.css          # Styles carrousel
│   │   ├── controls.css          # Styles panel de contrôles
│   │   └── animations.css        # Loaders, transitions
│   └── js/
│       ├── app.js                # Point d'entrée JS (module principal)
│       ├── config.js             # Constantes (copie du Python)
│       ├── api.js                # Gestion API Lumiscaphe
│       ├── positioning.js        # Calculs positions (extractAnchors, calculateTransforms)
│       ├── colors.js             # Calculs couleurs (parseColors, resolveLetterColors)
│       ├── ui.js                 # Gestion UI (carrousel, états loading)
│       └── state.js              # Gestion état global
├── generate_full_render.py        # Script Python original (référence)
├── README.md
└── docs/
    └── architecture.md            # Ce fichier
```

---

## 🔄 Architecture applicative

### Pattern : MVC simplifié avec State Management

```
┌─────────────────────────────────────────────────┐
│                   index.html                    │
│  (Vue : Structure DOM + Bindings événements)   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│                   app.js                        │
│     (Contrôleur : Orchestration générale)       │
└──┬──────────┬──────────┬──────────┬────────────┘
   │          │          │          │
   │          │          │          │
   ▼          ▼          ▼          ▼
┌─────┐  ┌─────┐  ┌─────────┐  ┌──────┐
│state│  │ ui  │  │   api   │  │config│
│ .js │  │ .js │  │   .js   │  │ .js  │
└──┬──┘  └──┬──┘  └────┬────┘  └──────┘
   │        │          │
   │        │          ▼
   │        │     ┌──────────────┐
   │        │     │positioning.js│
   │        │     │  colors.js   │
   │        │     └──────────────┘
   │        │
   └────────┴─────────────┐
                          ▼
                     ┌─────────┐
                     │   DOM   │
                     └─────────┘
```

### Modules et responsabilités

#### **config.js** (Données statiques)
```javascript
export const VERSION_LIST = ["960", "980"];
export const PAINT_SCHEMES = ["Sirocco", "Alize", "Mistral", "Meltem", "Tehuano", "Zephyr"];
export const PRESTIGE_LIST = ["Oslo", "SanPedro", "London", ...];
export const DECORS_CONFIG = { ... };
export const CHAR_WIDTHS = { W: 0.30, M: 0.30, I: 0.05, DEFAULT: 0.20 };
export const SPACING = 0.05;
export const API_BASE_URL = "https://wr-daher.lumiscaphe.com";
export const DATABASE_ID = "8ad3eaf3-0547-4558-ae34-647f17c84e88";
```

#### **state.js** (État global)
```javascript
const state = {
  config: {
    version: "960",
    paintScheme: "Sirocco",
    prestige: "Oslo",
    decor: "Tarmac",
    spinner: "PolishedAluminium",
    fontType: "slanted",
    style: "A",
    immat: "NWM1MW",
    imageWidth: 1920,
    imageHeight: 1080
  },
  images: [],
  currentImageIndex: 0,
  loading: false,
  error: null
};

export function getState() { return state; }
export function updateConfig(key, value) { state.config[key] = value; }
export function setImages(images) { state.images = images; }
export function setLoading(isLoading) { state.loading = isLoading; }
export function setError(error) { state.error = error; }
```

#### **positioning.js** (Logique métier - Calculs positions)
```javascript
// Port direct du Python (lignes 120-198)
export function extractAnchors(xmlRoot, scheme) { ... }
export function calculateTransformsAbsolute(immatString, startX, direction) { ... }
```

#### **colors.js** (Logique métier - Calculs couleurs)
```javascript
// Port direct du Python (lignes 210-237)
export function parseColorsFromConfig(fullConfigStr) { ... }
export function resolveLetterColors(styleLetter, paintSchemeConfigPart, colorMap) { ... }
```

#### **api.js** (Intégration API)
```javascript
export async function generateRender(config) {
  const payload = buildPayload(config);
  const response = await fetch(`${API_BASE_URL}/Snapshot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return data.map(item => item.url);
}

function buildPayload(config) {
  // Construction du payload JSON identique au Python
  // Utilise positioning.js et colors.js
}
```

#### **ui.js** (Gestion UI)
```javascript
export function initCarousel() { ... }
export function updateCarousel(images) { ... }
export function showLoader() { ... }
export function hideLoader() { ... }
export function showError(message) { ... }
export function updateControls(config) { ... }
```

#### **app.js** (Orchestration)
```javascript
import { getState, updateConfig, setImages, setLoading, setError } from './state.js';
import { generateRender } from './api.js';
import { updateCarousel, showLoader, hideLoader, showError } from './ui.js';

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  attachEventListeners();
  loadInitialRender();
});

// Event handlers
function onConfigChange(key, value) {
  updateConfig(key, value);
  debounceRender();
}

function onImmatSubmit() {
  loadRender();
}

async function loadRender() {
  setLoading(true);
  showLoader();
  try {
    const images = await generateRender(getState().config);
    setImages(images);
    updateCarousel(images);
  } catch (error) {
    setError(error);
    showError(error.message);
  } finally {
    setLoading(false);
    hideLoader();
  }
}
```

---

## 🎨 Architecture CSS

### Approche : CSS Vanilla avec Variables et Composition

```css
/* main.css - Variables globales */
:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-bg: #ffffff;
  --color-text: #1e293b;
  --color-error: #ef4444;
  --color-success: #10b981;

  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;

  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Layout principal : Grid 2 colonnes */
.app-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-lg);
  height: 100vh;
  padding: var(--spacing-md);
}

.viewport-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.controls-section {
  overflow-y: auto;
  padding: var(--spacing-md);
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

/* Responsive : Mobile-first */
@media (max-width: 1024px) {
  .app-container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
}
```

---

## 🔐 Sécurité

### Validation inputs
- **Immatriculation** : Max 6 caractères, alphanumériques uniquement
- **Dimensions images** : Min 100px, Max 10000px
- **Sélecteurs** : Validation contre listes prédéfinies (pas d'injection)

### API
- **CORS** : Géré par l'API Lumiscaphe (domaine externe)
- **Timeout** : 30 secondes maximum
- **Retry** : 1 tentative automatique en cas d'échec réseau
- **Pas de credentials** : API publique (pas d'auth requise)

---

## ⚡ Performance

### Optimisations
- **Debounce** : 300ms sur changements de configuration
- **Image loading** : Lazy avec `Promise.all()`
- **CSS** : Minifié (optionnel pour MVP)
- **JS** : Modules ES6 natifs (tree-shaking par navigateur)

### Métriques cibles
- **First Paint** : < 500ms
- **Interactive** : < 2s
- **API Response** : < 10s (dépend backend)

---

## 🧪 Tests

### Manuel (MVP Sprint #1)
- Tests cross-browser (Chrome, Firefox, Edge)
- Tests responsive (Desktop 1920x1080, Tablette 768px)
- Tests fonctionnels (chaque critère d'acceptation US)

### Automatisés (Post-MVP)
- Unit tests : positioning.js, colors.js (Jest)
- E2E tests : Playwright (optionnel)

---

## 🚀 Déploiement

### Local (MVP)
1. Cloner le repo
2. Ouvrir `code/index.html` dans un navigateur
3. Ça fonctionne !

### Serveur web (Optionnel)
- Hébergement statique : GitHub Pages, Netlify, Vercel
- Pas de configuration serveur requise

---

## 📊 Décisions techniques

| Décision | Rationale | Alternative rejetée |
|----------|-----------|---------------------|
| Vanilla JS | Simplicité, pas de build, performance | React (trop complexe pour le besoin) |
| Modules ES6 natifs | Supporté par tous navigateurs modernes | Webpack/Rollup (build non souhaité) |
| CSS Custom | Contrôle total, léger, maintenable | Tailwind CDN (surcharge inutile) |
| Fetch API | Natif, moderne, async/await | Axios (dépendance externe) |
| Pas de localStorage | Pas de besoin Sprint #1 | IndexedDB (Sprint #2 si besoin) |

---

## 🔄 Évolution future (Post-Sprint #1)

- **State management avancé** : Si complexité augmente, considérer pattern Observer
- **Routing** : Si multi-pages, ajouter routing simple (hash-based)
- **Build** : Si optimisations nécessaires, ajouter Vite (dev-only)
- **Tests** : Ajouter Jest + Playwright si maintenance long-terme

---

## 📝 Notes d'implémentation

### Port Python → JavaScript

**Fonctions à porter directement** :
- `extractAnchors()` : Extraction anchors depuis config
- `calculateTransformsAbsolute()` : Calcul positions lettres
- `parseColorsFromConfig()` : Extraction couleurs zones
- `resolveLetterColors()` : Résolution couleurs selon style

**Équivalences Python → JS** :
```python
# Python
def calculate_transforms_absolute(immat_string, start_x, direction_sign):
    transforms = []
    for i in range(len(immat_string)):
        # ...
    return transforms
```

```javascript
// JavaScript
export function calculateTransformsAbsolute(immatString, startX, directionSign) {
  const transforms = [];
  for (let i = 0; i < immatString.length; i++) {
    // ...
  }
  return transforms;
}
```

**Différences à gérer** :
- `.split('/')` identique en JS
- `.get()` Python → bracket notation JS : `dict['key']`
- `len()` → `.length`
- `range(n)` → `for (let i = 0; i < n; i++)`

---

**Document validé** : 02/12/2025
**Prochaine révision** : Fin Sprint #1 (Sprint Retrospective)
