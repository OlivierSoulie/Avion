# Sprint Backlog #14 - Vue Overview + UX Mobile/Medium

**Sprint Goal** : "Ajouter une vue Overview avec mosaïque personnalisée, filigrane type d'avion, et optimiser l'UX mobile/écrans moyens"
**Capacity** : 8 Story Points (étendu en cours de sprint)
**Date début** : 07/12/2025
**Date fin** : 07/12/2025
**Status** : ✅ COMPLETED

---

## 📋 User Story

### [US-044] Vue Overview avec mosaïque personnalisée et filigrane type d'avion
- **Story Points** : 5 SP
- **Priorité** : Haute
- **Status** : ✅ Done

### [US-045] Optimisation UX Mobile et Écrans Moyens (ajouté en cours de sprint)
- **Story Points** : 3 SP
- **Priorité** : Haute
- **Status** : ✅ Done

---

## 🔧 Tâches Complétées

### Bloc 1 : Backend - API et récupération caméras Overview ✅

#### [T044-1] Parser le groupe "Overview" depuis le XML
- **Status** : ✅ Done
- **Fichier** : `code/js/api/xml-parser.js`
- **Résultat** : Fonction `getCameraGroupOverview()` implémentée, recherche groupe "Overview", retourne 4 caméras

#### [T044-2] Support viewType="overview" dans rendering
- **Status** : ✅ Done
- **Fichier** : `code/js/api/rendering.js`
- **Résultat** : Fonction `fetchOverviewImages(config)` créée, 2 appels API (PNG transparent + JPEG)

#### [T044-3] Payload API avec background transparent
- **Status** : ✅ Done (avec correction critique)
- **Fichier** : `code/js/api/payload-builder.js`
- **Résultat** : `sensor.background: "transparent"` (String) dans camera object, compression PNG = 1
- **Bug fix** : Correction `renderParameters.background` (Boolean) → `sensor.background` (String "transparent")

---

### Bloc 2 : Frontend - UI et mosaïque ✅

#### [T044-4] Ajout onglet "Overview" dans index.html
- **Status** : ✅ Done
- **Fichier** : `code/index.html`
- **Résultat** : Bouton Overview ajouté, container `#overviewMosaic` créé, structure HTML complète

#### [T044-5] CSS Layout Overview (mosaïque + filigrane)
- **Status** : ✅ Done (avec ajustements multiples)
- **Fichier** : `code/styles/viewport.css`
- **Résultat** : Layout flexbox, filigrane positionné (top: 10%, z-index: 0), image A (z-index: 1), responsive
- **Ajustements** :
  - Filigrane : 180px → 120px (tient sur 1 ligne)
  - Position : top: 50% → 10% (visible au-dessus de l'avion)
  - Image principale : max-height: 50vh (sans ascenseur en desktop)
  - Images secondaires : max-height: 120px (vignettes compactes)
  - Gaps réduits : 1rem → 0.5rem

#### [T044-6] Fonction renderOverviewMosaic() dans ui/mosaic.js
- **Status** : ✅ Done (avec ajouts fonctionnalités)
- **Fichier** : `code/js/ui/mosaic.js`
- **Résultat** : Fonction créée, affiche images A/B/C/D, filigrane dynamique, event listeners
- **Ajouts** : Boutons download + checkboxes pour sélection multiple

---

### Bloc 3 : Intégration et logique métier ✅

#### [T044-7] Fonction getAirplaneType() dans config.js
- **Status** : ✅ Done (avec correction)
- **Fichier** : `code/js/config.js`
- **Résultat** : Retourne "TBM 960" ou "TBM 980" (avec préfixe "TBM ")
- **Correction** : Utilise `config.version` au lieu de `databaseId`

#### [T044-8] Event listeners vue Overview dans app.js
- **Status** : ✅ Done
- **Fichier** : `code/js/app.js`
- **Résultat** : Event listener bouton Overview, `handleOverviewView()`, gestion loader/erreurs
- **Bug fix** : Bouton Overview reste actif → ajout `classList.remove('active')` dans autres vues

---

### Bloc 4 : Modal plein écran ✅

#### [T044-9] Intégration modal pour vue Overview
- **Status** : ✅ Done
- **Fichier** : `code/js/ui/modal.js`
- **Résultat** : Modal fonctionne avec Overview, métadonnées, navigation, téléchargement

---

### Bloc 5 : UX Mobile et Écrans Moyens ✅ (ajouté en cours de sprint)

#### [T045-1] Menu burger mobile avec sidebar
- **Status** : ✅ Done
- **Fichiers** :
  - `code/styles/mobile-menu.css` (nouveau)
  - `code/js/ui/mobile-menu.js` (nouveau)
  - `code/index.html` (structure burger + sidebar)
- **Résultat** :
  - Burger menu avec animation (3 lignes → X)
  - Sidebar slide-in avec overlay
  - Déplacement données techniques dans sidebar (≤1366px)
  - Keyboard support (Escape pour fermer)

#### [T045-2] Masquage téléchargement en mobile/medium
- **Status** : ✅ Done
- **Fichier** : `code/styles/mobile-menu.css`
- **Résultat** : Tous les boutons download, checkboxes, et fonctionnalités de téléchargement masqués ≤1366px

#### [T045-3] Optimisations écrans moyens (769px-1366px)
- **Status** : ✅ Done
- **Fichier** : `code/styles/medium-screen.css` (nouveau)
- **Résultat** :
  - Breakpoint 769-1024px : colonne droite 250px, fonts 0.875rem, watermark 100px
  - Breakpoint 1025-1366px : colonne droite 280px, fonts 0.9375rem, watermark 140px
  - Paddings/gaps réduits, boutons compacts

#### [T045-4] Corrections layout et scroll
- **Status** : ✅ Done
- **Fichiers** : `code/styles/main.css`, `code/styles/viewport.css`
- **Résultat** :
  - Mobile scroll : `overflow: hidden` retiré de html/body
  - Desktop : `overflow: hidden` uniquement ≥769px
  - Vue Overview : tout tient sans ascenseur (image 50vh, vignettes 120px)

#### [T045-5] Masquage viewport-actions-panel quand vide
- **Status** : ✅ Done
- **Fichier** : `code/js/app.js`
- **Résultat** : Panneau affiché (Extérieur/Intérieur), masqué (Configuration/Overview)

#### [T045-6] Téléchargement et sélection multiple Overview
- **Status** : ✅ Done
- **Fichiers** : `code/js/ui/mosaic.js`, `code/js/ui/download.js`, `code/styles/viewport.css`
- **Résultat** :
  - Boutons download sur 4 images Overview (hover opacity: 0 → 1)
  - Checkboxes pour sélection multiple
  - Mode sélection appliqué à `.overview-mosaic`

---

## 📊 Progression Finale

| Bloc | Tâches | Status | Progression |
|------|--------|--------|-------------|
| **Bloc 1 : Backend** | T044-1, T044-2, T044-3 | ✅ Done | 3/3 (100%) |
| **Bloc 2 : Frontend** | T044-4, T044-5, T044-6 | ✅ Done | 3/3 (100%) |
| **Bloc 3 : Intégration** | T044-7, T044-8 | ✅ Done | 2/2 (100%) |
| **Bloc 4 : Modal** | T044-9 | ✅ Done | 1/1 (100%) |
| **Bloc 5 : UX Mobile/Medium** | T045-1 à T045-6 | ✅ Done | 6/6 (100%) |
| **TOTAL** | 15 tâches | ✅ Done | **15/15 (100%)** |

---

## 🐛 Bugs Corrigés en Cours de Sprint

### Bug #1 : PNG Transparency API Error (CRITIQUE)
- **Erreur** : HTTP 400 - Expected Boolean but got String for `renderParameters.background`
- **Cause** : Mauvaise compréhension de l'API WebRender
- **Solution** : Utiliser `sensor.background: "transparent"` (String) dans camera object
- **Fichier** : `code/js/api/payload-builder.js` lignes 361-372
- **Documentation** : Lecture SwaggerHub API via curl

### Bug #2 : Watermark affiche "???"
- **Cause** : Utilisation de `databaseId` au lieu de `config.version`
- **Solution** : `getAirplaneType(config.version)` + ajout préfixe "TBM "
- **Fichier** : `code/js/config.js` lignes 237-257

### Bug #3 : Watermark caché par l'avion
- **Cause** : Centré verticalement (top: 50%)
- **Solution** : Positionné en haut (top: 10%)
- **Fichier** : `code/styles/viewport.css` ligne 442

### Bug #4 : Images B/C/D cachées sous footer
- **Cause** : Image principale trop grande
- **Solution** : max-height réduit progressivement (40vh → 50vh final après réduction vignettes)
- **Fichier** : `code/styles/viewport.css` ligne 434

### Bug #5 : Pas de scroll en mobile
- **Cause** : `overflow: hidden` sur html/body
- **Solution** : `min-height: 100vh` au lieu de `height`, overflow retiré
- **Fichier** : `code/styles/main.css` lignes 17-34

### Bug #6 : Bouton Overview reste actif
- **Cause** : Pas de `classList.remove('active')` dans autres vues
- **Solution** : Ajout dans handlers Extérieur/Intérieur/Configuration
- **Fichier** : `code/js/app.js` lignes 1138, 1156, 1177

### Bug #7 : Boutons download invisibles en Overview
- **Cause** : Règle CSS hover uniquement pour `.mosaic-item`
- **Solution** : Ajout `.overview-main-image-wrapper:hover` et `.overview-secondary-item:hover`
- **Fichier** : `code/styles/viewport.css` lignes 194-198

### Bug #8 : Checkboxes invisibles en Overview
- **Cause** : Classe `selection-mode` non appliquée à `.overview-mosaic`
- **Solution** : Ajout dans `enterSelectionMode()` et `exitSelectionMode()`
- **Fichiers** : `code/js/ui/download.js`, `code/styles/viewport.css`

---

## 📝 Fichiers Créés

1. `code/styles/mobile-menu.css` - Menu burger et sidebar mobile
2. `code/js/ui/mobile-menu.js` - Logique menu burger
3. `code/styles/medium-screen.css` - Optimisations écrans moyens

## 📝 Fichiers Modifiés

1. `code/js/api/payload-builder.js` - Payload PNG transparent
2. `code/js/api/xml-parser.js` - Parser groupe Overview
3. `code/js/api/rendering.js` - Fetch images Overview
4. `code/js/config.js` - getAirplaneType()
5. `code/js/app.js` - Handler vue Overview, toggleViewControls()
6. `code/js/ui/mosaic.js` - renderOverviewMosaic() avec download/checkboxes
7. `code/js/ui/download.js` - Support Overview en mode sélection
8. `code/js/ui/index.js` - Export initMobileMenu()
9. `code/index.html` - Bouton Overview, burger menu, sidebar
10. `code/styles/viewport.css` - Layout Overview, hover download, checkboxes
11. `code/styles/main.css` - Fix overflow mobile
12. `code/styles/mobile-menu.css` - Breakpoints ≤1366px

---

**Dernière mise à jour** : 07/12/2025 23:30 - Sprint #14 COMPLETED ✅
**Velocity** : 8 SP complétés en 1 journée
**Prochaine étape** : Sprint Review + Synchronisation GitHub
