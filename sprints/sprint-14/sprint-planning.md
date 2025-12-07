# Sprint Planning #14 - Vue Overview

**Date** : 07/12/2025
**Participants** : PO + ARCH + COORDINATOR
**Durée** : 45 min
**Sprint Goal** : "Ajouter une vue Overview avec mosaïque personnalisée et filigrane type d'avion"

---

## 📊 Contexte du Sprint

### Sprint précédent (Sprint #13)
- ✅ Refactoring complet du code (20 SP)
- ✅ Architecture modulaire opérationnelle
- ✅ 15/15 tests passés (100%)
- ✅ Code propre et maintenable

### Capacité de l'équipe
- **Vélocité moyenne** : 5-10 SP par sprint (sprints courts)
- **Équipe** : 6 agents (PO + ARCH + COORDINATOR + DEV + QA + DOC)
- **Sprint #14 capacity** : 5 SP

---

## 🎯 Sprint Goal

**"Ajouter une vue Overview avec mosaïque personnalisée (image principale 16:9 + 3 secondaires) et filigrane indiquant le type d'avion (960/980)"**

### Critères de succès
- ✅ Onglet "Overview" visible et fonctionnel
- ✅ Mosaïque affiche 4 images (A en 16:9 + B/C/D)
- ✅ Image A en PNG transparent avec filigrane "960" ou "980" en rouge
- ✅ Modal plein écran fonctionne avec navigation et métadonnées
- ✅ Responsive (desktop/tablette/mobile)
- ✅ Console sans erreurs

---

## 📋 User Story du Sprint

### [US-044] Vue Overview avec mosaïque personnalisée et filigrane type d'avion

**Priorité** : Haute
**Story Points** : 5 SP
**Assigné à** : DEV-Généraliste (dev) + QA-Fonctionnel (tests) + DOC (documentation)

**Description** :
En tant qu'utilisateur,
Je veux une nouvelle vue "Overview" affichant un aperçu synthétique de l'avion,
Afin d'avoir une vue d'ensemble avec une image principale en 16:9 et trois images secondaires, avec indication du type d'avion en filigrane.

**Contexte métier** :
Cette vue utilise les caméras du groupe "Overview" défini dans le XML de l'API.
L'organisation visuelle met en avant l'image principale (caméra "A") en grand format 16:9, avec un filigrane indiquant le type d'avion (960 ou 980) en rouge, partiellement masqué par l'avion transparent.

---

## 🔧 Décomposition technique (par ARCH)

### Bloc 1 : Backend - API et récupération caméras Overview (1h30)

#### [T044-1] Parser le groupe "Overview" depuis le XML (30 min)
- **Fichier** : `code/js/api/xml-parser.js`
- **Description** : Fonction `getCameraGroupOverview()` pour récupérer les 4 caméras du groupe "Overview"
- **Critères de complétion** :
  - [ ] Fonction créée et exportée
  - [ ] Recherche du groupe `name="Overview"` dans le XML
  - [ ] Retourne array de 4 objets caméra `[{id, name, sensorWidth, sensorHeight}, ...]`
  - [ ] Gère le cas où groupe "Overview" n'existe pas (throw error clair)
  - [ ] JSDoc complète

#### [T044-2] Support viewType="overview" dans rendering (30 min)
- **Fichier** : `code/js/api/rendering.js`
- **Description** : Nouvelle fonction `fetchOverviewImages()` pour gérer le rendu Overview
- **Critères de complétion** :
  - [ ] Fonction `fetchOverviewImages(config)` créée et exportée
  - [ ] Appelle `getCameraGroupOverview()` pour récupérer les caméras
  - [ ] 2 appels API distincts : PNG transparent (caméra A) + JPEG (caméras B/C/D)
  - [ ] Retourne objet `{imageA: {url, metadata}, imagesSecondary: [{url, metadata}, ...]}`
  - [ ] JSDoc complète

#### [T044-3] Payload API avec background transparent (30 min)
- **Fichier** : `code/js/api/payload-builder.js`
- **Description** : Fonction `buildOverviewPayload(cameraId, isMainImage)` pour payload Overview
- **Critères de complétion** :
  - [ ] Fonction créée et exportée
  - [ ] Si `isMainImage=true` : `mode: "image"`, `background: "transparent"`, `compression: 1`, `width: 1920`, `height: 1080`
  - [ ] Si `isMainImage=false` : payload JPEG standard (mode: "image", width/height depuis sensor)
  - [ ] Intègre la configuration actuelle (paintScheme, decor, etc.)
  - [ ] JSDoc complète

---

### Bloc 2 : Frontend - UI et mosaïque (1h30)

#### [T044-4] Ajout onglet "Overview" dans index.html (15 min)
- **Fichier** : `code/index.html`
- **Description** : Ajouter bouton "Overview" et structure HTML de la mosaïque
- **Critères de complétion** :
  - [ ] Bouton "Overview" ajouté dans le sélecteur de vue (ligne ~120)
  - [ ] Container `<div id="overviewMosaic" class="overview-mosaic hidden">` créé
  - [ ] Div wrapper image principale : `<div class="overview-main-image-wrapper">`
  - [ ] Div filigrane : `<div id="airplaneTypeWatermark" class="airplane-type-watermark">960</div>`
  - [ ] Image principale : `<img id="overviewImageA" class="overview-main-image" />`
  - [ ] Div wrapper images secondaires : `<div class="overview-secondary-images">`
  - [ ] 3 images secondaires : `<img id="overviewImageB/C/D" class="overview-secondary-image" />`

#### [T044-5] CSS Layout Overview (mosaïque + filigrane) (45 min)
- **Fichier** : `code/styles/viewport.css`
- **Description** : Styles pour la mosaïque Overview et le filigrane
- **Critères de complétion** :
  - [ ] `.overview-mosaic` : display flex, flex-direction column, gap 1rem
  - [ ] `.overview-main-image-wrapper` : position relative, width 100%, aspect-ratio 16/9
  - [ ] `.airplane-type-watermark` : position absolute, top/left 50%, transform translate(-50%, -50%), font-size 180px, font-weight bold, color #E00500, z-index 0, opacity 0.8
  - [ ] `.overview-main-image` : position relative, z-index 1, width 100%, height 100%, object-fit contain
  - [ ] `.overview-secondary-images` : display grid, grid-template-columns repeat(3, 1fr), gap 1rem
  - [ ] `.overview-secondary-image` : width 100%, height auto, object-fit cover, cursor pointer, hover effect
  - [ ] Media query mobile : grid-template-columns 1fr (empilé verticalement)
  - [ ] Filigrane responsive : font-size adapté au viewport (120px mobile, 180px desktop)

#### [T044-6] Fonction renderOverviewMosaic() dans ui/mosaic.js (30 min)
- **Fichier** : `code/js/ui/mosaic.js`
- **Description** : Fonction pour afficher la mosaïque Overview
- **Critères de complétion** :
  - [ ] Fonction `renderOverviewMosaic(imageA, imagesSecondary, airplaneType)` créée et exportée
  - [ ] Affiche image A dans `#overviewImageA` (src = imageA.url)
  - [ ] Affiche images B, C, D dans `#overviewImageB/C/D` (src = imagesSecondary[i].url)
  - [ ] Met à jour le filigrane avec `airplaneType` ("960" ou "980")
  - [ ] Ajoute event listeners click sur toutes les images pour ouvrir modal
  - [ ] Passe les métadonnées au modal (nom caméra, groupe, ID)
  - [ ] Gère le cas où moins de 4 images (affiche celles disponibles)
  - [ ] JSDoc complète

---

### Bloc 3 : Intégration et logique métier (45 min)

#### [T044-7] Fonction getAirplaneType() dans config.js (15 min)
- **Fichier** : `code/js/config.js`
- **Description** : Fonction pour extraire le type d'avion (960 ou 980) depuis databaseId
- **Critères de complétion** :
  - [ ] Fonction `getAirplaneType()` créée et exportée
  - [ ] Récupère `config.databaseId` depuis le state
  - [ ] Si contient "960" → retourne "960"
  - [ ] Si contient "980" → retourne "980"
  - [ ] Sinon → retourne "???" (fallback)
  - [ ] JSDoc complète

#### [T044-8] Event listeners vue Overview dans app.js (30 min)
- **Fichier** : `code/js/app.js`
- **Description** : Event listeners pour la vue Overview
- **Critères de complétion** :
  - [ ] Event listener sur bouton "Overview" (querySelector + addEventListener)
  - [ ] Fonction `handleOverviewView()` créée
  - [ ] Appelle `fetchOverviewImages()` avec la config actuelle
  - [ ] Affiche loader pendant l'appel API
  - [ ] Récupère le type d'avion via `getAirplaneType()`
  - [ ] Appelle `renderOverviewMosaic(imageA, imagesSecondary, airplaneType)`
  - [ ] Masque les autres mosaïques (Ext/Int/Config)
  - [ ] Affiche la mosaïque Overview
  - [ ] Met à jour le state `viewType: "overview"`
  - [ ] Gère les erreurs (affiche message d'erreur si échec)
  - [ ] Cache le loader après rendu

---

### Bloc 4 : Modal plein écran et métadonnées (30 min)

#### [T044-9] Intégration modal pour vue Overview (30 min)
- **Fichier** : `code/js/ui/modal.js`
- **Description** : Adapter le modal plein écran pour la vue Overview
- **Critères de complétion** :
  - [ ] Fonction `openFullscreen()` supporte le format Overview
  - [ ] Format images : array `[imageA, imageB, imageC, imageD]`
  - [ ] Métadonnées affichées : Groupe "Overview", Nom caméra, ID caméra
  - [ ] Navigation ←/→ fonctionne entre les 4 images
  - [ ] Compteur "1 / 4", "2 / 4", etc.
  - [ ] Bouton téléchargement individuel fonctionne (download image actuelle)
  - [ ] Nom fichier téléchargé : `overview_A.png`, `overview_B.jpg`, etc.

---

### Bloc 5 : Tests et validation (1h)

#### [T044-10] Tests manuels end-to-end (45 min)
- **Responsable** : QA-Fonctionnel
- **Description** : Tests complets de la vue Overview
- **Critères de complétion** :
  - [ ] **Desktop (1920x1080)** :
    - [ ] Clic sur "Overview" charge les 4 images
    - [ ] Image A affichée en 16:9 pleine largeur
    - [ ] Filigrane "960" ou "980" visible en rouge derrière l'image A
    - [ ] Images B, C, D affichées en 3 colonnes
    - [ ] Hover effect sur les images fonctionne
    - [ ] Clic sur image A ouvre modal plein écran avec PNG transparent
    - [ ] Navigation ←/→ fonctionne entre les 4 images
    - [ ] Métadonnées affichées correctement
    - [ ] Bouton téléchargement fonctionne (PNG pour A, JPEG pour B/C/D)
  - [ ] **Tablette (iPad 768px)** :
    - [ ] Layout identique au desktop (3 colonnes)
    - [ ] Filigrane lisible et centré
  - [ ] **Mobile (375px)** :
    - [ ] Image A affichée en 16:9 pleine largeur
    - [ ] Images B, C, D empilées verticalement
    - [ ] Filigrane adapté à la taille (120px)
  - [ ] **Console** :
    - [ ] Aucune erreur JavaScript
    - [ ] Logs de debug clairs (si activés)
  - [ ] **Tests de régression** :
    - [ ] Vues Extérieur/Intérieur/Configuration fonctionnent toujours
    - [ ] Changement de configuration régénère le rendu Overview

#### [T044-11] Validation finale et ajustements (15 min)
- **Responsable** : ARCH + DEV
- **Description** : Revue finale et corrections
- **Critères de complétion** :
  - [ ] Tous les bugs détectés par QA sont corrigés
  - [ ] ARCH valide l'architecture et le code
  - [ ] Code respecte les conventions (ESLint, Prettier)
  - [ ] JSDoc complète sur toutes les nouvelles fonctions
  - [ ] Utilisateur valide la fonctionnalité

---

## 👥 Staffing décidé par COORDINATOR

**Équipe Sprint #14** : 6 agents

### Noyau fixe (3 agents)
- **PO** : Validation métier, acceptation des critères
- **ARCH** : Architecture technique, revue de code, résolution blocages
- **COORDINATOR** : Coordination quotidienne, assignation tâches, Kanban

### Agents opérationnels (3 agents)
- **1 x DEV-Généraliste** : Développement Frontend + Backend (11 tâches)
- **1 x QA-Fonctionnel** : Tests manuels end-to-end (tests systematiques)
- **1 x DOC** : Documentation après validation QA

**Justification** :
- US simple et bien définie (5 SP, ~5h de travail)
- 1 DEV suffit (pas de dépendances complexes entre tâches)
- QA-Fonctionnel uniquement (pas de critères performance ou sécurité)
- DOC standard pour mise à jour documentation utilisateur

---

## 📊 Plan d'exécution

### Ordre des tâches (séquentiel)

**Jour 1 - Développement Backend (1h30)**
1. T044-1 : Parser groupe Overview XML (30 min)
2. T044-2 : Support viewType="overview" (30 min)
3. T044-3 : Payload background transparent (30 min)

**Jour 1 - Développement Frontend (1h30)**
4. T044-4 : Ajout onglet Overview HTML (15 min)
5. T044-5 : CSS Layout + filigrane (45 min)
6. T044-6 : Fonction renderOverviewMosaic() (30 min)

**Jour 1 - Intégration (45 min)**
7. T044-7 : Fonction getAirplaneType() (15 min)
8. T044-8 : Event listeners Overview (30 min)

**Jour 1 - Modal (30 min)**
9. T044-9 : Intégration modal (30 min)

**Jour 1 - Tests (1h)**
10. T044-10 : Tests end-to-end (45 min)
11. T044-11 : Validation finale (15 min)

**Durée totale estimée** : ~5h15

---

## 📋 Definition of Done

Une tâche est considérée **Done** quand :
- [ ] Code développé et testé localement par DEV
- [ ] Code respecte ESLint + Prettier
- [ ] JSDoc complète sur les nouvelles fonctions
- [ ] Tests QA passés (critères d'acceptation validés)
- [ ] Aucune régression sur les fonctionnalités existantes
- [ ] Console sans erreurs
- [ ] Code revu par ARCH (si nécessaire)
- [ ] Documentation mise à jour par DOC

US-044 est considérée **Done** quand :
- [ ] Toutes les 11 tâches sont Done
- [ ] Tests manuels end-to-end passés (15+ tests)
- [ ] Validation utilisateur finale
- [ ] Kanban Board mis à jour

---

## 🔄 Daily Scrum

**Format** : 15 min quotidien (si sprint > 1 jour)
- Chaque agent répond aux 3 questions :
  1. Qu'est-ce que j'ai fait hier ?
  2. Qu'est-ce que je fais aujourd'hui ?
  3. Ai-je des blocages ?
- COORDINATOR identifie les blocages et synchronise les dépendances
- COORDINATOR met à jour le Kanban Board

---

## 📦 Livrables attendus

### Code
- ✅ 1 nouvelle fonction dans `api/xml-parser.js`
- ✅ 1 nouvelle fonction dans `api/rendering.js`
- ✅ 1 nouvelle fonction dans `api/payload-builder.js`
- ✅ 1 nouvelle fonction dans `config.js`
- ✅ 1 nouvelle fonction dans `ui/mosaic.js`
- ✅ Modification de `ui/modal.js`
- ✅ Ajout HTML dans `index.html`
- ✅ Ajout CSS dans `viewport.css`
- ✅ Event listeners dans `app.js`

### Documentation
- ✅ JSDoc sur toutes les nouvelles fonctions
- ✅ Documentation utilisateur mise à jour (si nécessaire)
- ✅ Sprint Review Report (fin de sprint)

### Tests
- ✅ 15+ tests manuels validés par QA
- ✅ Tests de régression (vues Ext/Int/Config)

---

## 🎯 Sprint Goal rappel

**"Ajouter une vue Overview avec mosaïque personnalisée (image principale 16:9 + 3 secondaires) et filigrane indiquant le type d'avion (960/980)"**

---

**Sprint Planning #14** : ✅ Terminé
**Prochaine étape** : COORDINATOR assigne les tâches et lance le développement
