# Sprint Backlog - Sprint #1

**Projet** : 005-Configurateur_Daher
**Sprint** : Sprint #1 (MVP Configurateur Web)
**Date début** : 02/12/2025
**Date fin prévue** : [À définir]
**Sprint Goal** : Livrer un configurateur web fonctionnel reproduisant 100% du script Python

---

## 📊 Capacité Sprint

- **Story Points engagés** : 48 SP
- **User Stories sélectionnées** : 10 US
- **Tâches techniques totales** : 45 tâches

---

## 🎯 Sprint Goal

**"Permettre à un utilisateur de configurer et visualiser des rendus TBM via une interface web locale moderne, sans installation Python, avec toutes les fonctionnalités du script original."**

---

## 📋 User Stories et Tâches

### [US-001] Architecture HTML/CSS/JS de base (3 SP)

**Priorité** : Critique
**Assigné à** : DEV

#### Tâches techniques

- [ ] **T1.1** - Créer structure de fichiers (15min)
  - Créer `code/index.html`
  - Créer `code/styles/` avec 4 fichiers CSS
  - Créer `code/js/` avec 7 fichiers JS
  - **Livrable** : Arborescence complète

- [ ] **T1.2** - Écrire HTML de base avec structure sémantique (30min)
  - Header avec titre application
  - Grid container 2 colonnes (viewport + controls)
  - Section viewport (placeholder)
  - Section controls (placeholder)
  - Footer avec infos
  - **Livrable** : `index.html` valide HTML5

- [ ] **T1.3** - CSS principal : reset + variables + layout (45min)
  - CSS reset moderne
  - Variables CSS (couleurs, spacing, shadows)
  - Layout Grid responsive
  - Styles de base (typo, boutons, inputs)
  - **Livrable** : `styles/main.css` fonctionnel

- [ ] **T1.4** - Modules JS : structure de base (30min)
  - Créer `config.js` avec constantes
  - Créer `state.js` avec état global
  - Créer `app.js` avec init
  - Import/export ES6 modules
  - **Livrable** : 3 fichiers JS avec structure

- [ ] **T1.5** - Vérification console + responsive (15min)
  - Tester dans Chrome, Firefox, Edge
  - Vérifier console sans erreurs
  - Tester responsive 1920x1080 et 768px
  - **Livrable** : Validation cross-browser

**Estimation totale** : ~2h15min

---

### [US-002] Viewport avec carrousel d'images (5 SP)

**Priorité** : Critique
**Assigné à** : DEV

#### Tâches techniques

- [ ] **T2.1** - HTML viewport : structure carrousel (20min)
  - Container viewport avec aspect ratio
  - Slider container (flex)
  - Boutons prev/next
  - Indicateurs de position
  - Zone loader
  - **Livrable** : HTML viewport complet

- [ ] **T2.2** - CSS viewport : layout + animations (45min)
  - Styles carrousel (flex slider)
  - Transitions smooth (transform)
  - Responsive images (object-fit)
  - Styles boutons navigation
  - Styles indicateurs
  - **Livrable** : `styles/viewport.css`

- [ ] **T2.3** - JS : fonction initCarousel() (30min)
  - Initialiser état carrousel
  - Bind event listeners boutons
  - Fonction showSlide(index)
  - Fonction updateIndicators()
  - **Livrable** : `ui.js` - partie carrousel

- [ ] **T2.4** - JS : fonction updateCarousel(images) (30min)
  - Charger images dans DOM
  - Gérer array d'URLs
  - Précharger images (Promise.all)
  - Afficher première image
  - **Livrable** : Fonction updateCarousel complète

- [ ] **T2.5** - Loader : HTML + CSS + JS (30min)
  - Spinner CSS animé
  - Overlay semi-transparent
  - Fonctions showLoader() / hideLoader()
  - Message "Génération en cours..."
  - **Livrable** : Loader fonctionnel

- [ ] **T2.6** - Tests : navigation carrousel (15min)
  - Tester avec array de 3 images test
  - Vérifier prev/next
  - Vérifier indicateurs
  - Vérifier responsive
  - **Livrable** : Carrousel validé

**Estimation totale** : ~3h30min

---

### [US-003] Panel de contrôles - Sélecteurs principaux (8 SP)

**Priorité** : Critique
**Assigné à** : DEV

#### Tâches techniques

- [ ] **T3.1** - config.js : Ajouter toutes les constantes (30min)
  - `VERSION_LIST`, `PAINT_SCHEMES`, `PRESTIGE_LIST`
  - `DECORS_CONFIG`, `SPINNER_LIST`
  - `STYLES_SLANTED`, `STYLES_STRAIGHT`
  - **Livrable** : config.js complet (copie Python)

- [ ] **T3.2** - HTML : Dropdown Modèle Avion (15min)
  - Label + select#version
  - Options 960, 980
  - Valeur par défaut : 960
  - **Livrable** : HTML dropdown version

- [ ] **T3.3** - HTML : Dropdown Schéma Peinture (15min)
  - Label + select#paintScheme
  - 6 options (Sirocco, Alize, ...)
  - Valeur par défaut : Sirocco
  - **Livrable** : HTML dropdown peinture

- [ ] **T3.4** - HTML : Dropdown Intérieur (15min)
  - Label + select#prestige
  - 8 options (Oslo, SanPedro, ...)
  - Valeur par défaut : Oslo
  - **Livrable** : HTML dropdown intérieur

- [ ] **T3.5** - HTML : Dropdown Décor (15min)
  - Label + select#decor
  - 5 options (Tarmac, Studio, ...)
  - Valeur par défaut : Tarmac
  - **Livrable** : HTML dropdown décor

- [ ] **T3.6** - HTML : Dropdown Hélice (15min)
  - Label + select#spinner
  - 2 options (PolishedAluminium, MattBlack)
  - Valeur par défaut : PolishedAluminium
  - **Livrable** : HTML dropdown hélice

- [ ] **T3.7** - HTML : Radio buttons Type Police (20min)
  - Label "Type Police"
  - Radio "Slanted" + Radio "Straight"
  - Valeur par défaut : Slanted
  - **Livrable** : HTML radio type police

- [ ] **T3.8** - HTML : Dropdown Style (dynamique) (20min)
  - Label + select#style
  - Options A-E (Slanted) ou F-J (Straight)
  - Logique conditionnelle selon type police
  - **Livrable** : HTML dropdown style dynamique

- [ ] **T3.9** - CSS : Styles panel de contrôles (1h)
  - Layout vertical avec spacing
  - Styles labels (typo, couleur)
  - Styles selects (border, padding, hover)
  - Styles radio buttons (custom design)
  - Responsive (largeur fixe 400px desktop)
  - **Livrable** : `styles/controls.css`

- [ ] **T3.10** - JS : Populate selects depuis config.js (30min)
  - Fonction populateSelect(id, values)
  - Populate tous les dropdowns au load
  - Gérer options dynamiques (style)
  - **Livrable** : Selects peuplés dynamiquement

- [ ] **T3.11** - JS : Event listeners sur contrôles (45min)
  - Listeners sur change pour chaque select
  - Listener sur change radio type police
  - Mettre à jour state.js
  - Trigger debounceRender() (sauf immat)
  - **Livrable** : Event listeners fonctionnels

- [ ] **T3.12** - JS : Logique style dynamique (20min)
  - Quand type police change → vider et repeupler dropdown style
  - Slanted → A-E, Straight → F-J
  - Mettre à jour state avec nouvelle valeur
  - **Livrable** : Dropdown style dynamique fonctionnel

**Estimation totale** : ~5h30min

---

### [US-004] Gestion de l'immatriculation (3 SP)

**Priorité** : Critique
**Assigné à** : DEV

#### Tâches techniques

- [ ] **T4.1** - HTML : Champ immatriculation + bouton (15min)
  - Label "Immatriculation"
  - Input text#immat (maxlength=6, placeholder)
  - Bouton "Envoyer"
  - Span pour message erreur
  - **Livrable** : HTML immatriculation

- [ ] **T4.2** - CSS : Styles input + bouton (20min)
  - Styles input (border, padding, focus)
  - Styles bouton (primary, hover, active)
  - Styles message erreur (rouge, petit)
  - Layout horizontal (input + bouton)
  - **Livrable** : Styles immatriculation

- [ ] **T4.3** - JS : Validation temps réel (30min)
  - Listener sur input → toUpperCase()
  - Validation 1-6 caractères alphanumériques
  - Afficher/masquer message erreur
  - Désactiver bouton si invalide
  - **Livrable** : Validation temps réel fonctionnelle

- [ ] **T4.4** - JS : Event listener bouton Envoyer (20min)
  - Listener sur click bouton
  - Vérifier si valeur changée depuis dernier render
  - Mettre à jour state.immat
  - Appeler loadRender()
  - **Livrable** : Bouton Envoyer fonctionnel

**Estimation totale** : ~1h25min

---

### [US-005] Intégration API Lumiscaphe (8 SP)

**Priorité** : Critique
**Assigné à** : DEV

#### Tâches techniques

- [ ] **T5.1** - api.js : Fonction buildPayload(config) - Scene (1h)
  - Construire objet `scene` avec database, configuration
  - Appeler positioning.js pour surfaces
  - Appeler colors.js pour materials
  - Gérer materialMultiLayers
  - **Livrable** : Fonction buildPayload partie scene

- [ ] **T5.2** - api.js : Fonction buildPayload(config) - Mode + Render (30min)
  - Ajouter `mode.images.cameraGroup` (hardcodé pour MVP)
  - Ajouter `renderParameters` (width, height, antialiasing, superSampling)
  - Ajouter `encoder.jpeg.quality`
  - **Livrable** : Fonction buildPayload complète

- [ ] **T5.3** - api.js : Fonction generateRender(config) (45min)
  - Construire payload via buildPayload()
  - Fetch POST vers API
  - Headers Content-Type application/json
  - Timeout 30s
  - Parser réponse JSON
  - **Livrable** : Fonction generateRender basique

- [ ] **T5.4** - api.js : Gestion erreurs HTTP (30min)
  - Try/catch sur fetch
  - Gérer status 404, 500, etc.
  - Gérer timeout
  - Gérer erreur réseau (no connection)
  - Retourner erreur formatée
  - **Livrable** : Gestion erreurs complète

- [ ] **T5.5** - api.js : Téléchargement images (30min)
  - Extraire URLs depuis réponse
  - Promise.all() pour charger toutes images
  - Retourner array d'URLs
  - **Livrable** : Fonction retourne URLs images

- [ ] **T5.6** - app.js : Fonction loadRender() (45min)
  - Appeler setLoading(true) + showLoader()
  - Appeler generateRender(state.config)
  - Mettre à jour state.images
  - Appeler updateCarousel(images)
  - Catch erreurs → showError()
  - Finally → setLoading(false) + hideLoader()
  - **Livrable** : Fonction loadRender complète

- [ ] **T5.7** - Tests : Appel API réel (30min)
  - Tester avec config par défaut
  - Vérifier payload JSON envoyé (console.log)
  - Vérifier réponse API
  - Vérifier images affichées
  - **Livrable** : Premier appel API validé

**Estimation totale** : ~5h

---

### [US-006] Logique de calcul des positions (5 SP)

**Priorité** : Haute
**Assigné à** : DEV

#### Tâches techniques

- [ ] **T6.1** - positioning.js : Port fonction extractAnchors() (1h)
  - Porter logique Python (lignes 120-157)
  - Parser config string pour trouver anchors
  - Retourner objet {Left: {Start, Direction}, Right: {...}, Y}
  - Gérer fallback si anchors non trouvés
  - **Livrable** : Fonction extractAnchors() complète

- [ ] **T6.2** - positioning.js : Port fonction calculateTransformsAbsolute() (1h30min)
  - Porter logique Python (lignes 159-198)
  - Utiliser CHAR_WIDTHS depuis config.js
  - Calculer positions X avec spacing 5cm
  - Retourner array de positions
  - **Livrable** : Fonction calculateTransformsAbsolute() complète

- [ ] **T6.3** - positioning.js : Fonction buildSurfaces(immat, anchors) (45min)
  - Appeler calculateTransformsAbsolute() pour Left et Right
  - Construire array surfaces avec RegL et RegR
  - Format : {tag, labels: [{index, translation: {x, y}}]}
  - **Livrable** : Fonction buildSurfaces() complète

- [ ] **T6.4** - Tests : Validation avec "NWM1MW" (30min)
  - Tester extractAnchors() (log résultats)
  - Tester calculateTransformsAbsolute() avec "NWM1MW"
  - Vérifier positions cohérentes
  - Comparer avec script Python
  - **Livrable** : Tests positions validés

**Estimation totale** : ~3h45min

---

### [US-007] Gestion des couleurs et matériaux (5 SP)

**Priorité** : Haute
**Assigné à** : DEV

#### Tâches techniques

- [ ] **T7.1** - colors.js : Port fonction parseColorsFromConfig() (1h)
  - Porter logique Python (lignes 210-222)
  - Parser config string (split `/`)
  - Extraire zones et hex colors
  - Retourner objet colorMap {zone: hexColor}
  - **Livrable** : Fonction parseColorsFromConfig() complète

- [ ] **T7.2** - colors.js : Port fonction resolveLetterColors() (1h)
  - Porter logique Python (lignes 224-237)
  - Mapper style A-J vers paires de zones
  - Résoudre couleurs L0 et L1 depuis colorMap
  - Gérer fallback noir/blanc
  - **Livrable** : Fonction resolveLetterColors() complète

- [ ] **T7.3** - colors.js : Fonction buildMaterials(immat, styleLetter) (45min)
  - Construire array materials : un par lettre
  - Format : {name: "RegL0", filename: "Style_A_N"}
  - Gérer Left et Right
  - **Livrable** : Fonction buildMaterials() complète

- [ ] **T7.4** - colors.js : Fonction buildMaterialMultiLayers(immat, colors) (45min)
  - Construire array materialMultiLayers
  - Éviter doublons (caractères uniques uniquement)
  - Format : {name, layer, diffuseColor}
  - 2 layers par texture (L0, L1)
  - **Livrable** : Fonction buildMaterialMultiLayers() complète

- [ ] **T7.5** - Tests : Validation couleurs (30min)
  - Tester parseColorsFromConfig() avec config test
  - Tester resolveLetterColors() pour styles A-J
  - Vérifier hex colors corrects
  - Log résultats dans console
  - **Livrable** : Tests couleurs validés

**Estimation totale** : ~4h

---

### [US-008] Appel API automatique sur changements (3 SP)

**Priorité** : Haute
**Assigné à** : DEV

#### Tâches techniques

- [ ] **T8.1** - app.js : Fonction debounce(fn, delay) (20min)
  - Implémenter debounce générique
  - Delay 300ms par défaut
  - Annuler timeout précédent
  - **Livrable** : Fonction debounce() réutilisable

- [ ] **T8.2** - app.js : Fonction debounceRender() (15min)
  - Wrapper autour de loadRender()
  - Debounce 300ms
  - **Livrable** : Fonction debounceRender()

- [ ] **T8.3** - app.js : Modifier event listeners contrôles (30min)
  - Tous les selects/radios → appeler debounceRender()
  - Sauf input immatriculation (uniquement bouton)
  - **Livrable** : Auto-render sur changements

- [ ] **T8.4** - app.js : Détection changement config (30min)
  - Fonction hasConfigChanged()
  - Comparer state actuel vs précédent
  - Ne pas appeler API si identique
  - **Livrable** : Éviter appels API inutiles

- [ ] **T8.5** - Tests : Validation debounce (15min)
  - Changer plusieurs dropdowns rapidement
  - Vérifier un seul appel API après 300ms
  - Tester immatriculation n'appelle pas auto
  - **Livrable** : Debounce validé

**Estimation totale** : ~1h50min

---

### [US-009] États de chargement et feedbacks UX (3 SP)

**Priorité** : Haute
**Assigné à** : DEV

#### Tâches techniques

- [ ] **T9.1** - HTML : Zone messages (placeholder déjà fait) (5min)
  - Vérifier zone messages viewport
  - **Livrable** : HTML messages ok

- [ ] **T9.2** - CSS : Animations loader (30min)
  - Spinner CSS avec @keyframes rotate
  - Overlay semi-transparent
  - Transitions smooth
  - **Livrable** : `styles/animations.css`

- [ ] **T9.3** - ui.js : Fonctions showLoader() / hideLoader() (20min)
  - Toggle classe .loading sur viewport
  - Afficher spinner + message
  - **Livrable** : Fonctions loader complètes

- [ ] **T9.4** - ui.js : Fonction showError(message) (30min)
  - Afficher message d'erreur dans viewport
  - Style rouge avec icône
  - Bouton "Réessayer"
  - **Livrable** : Fonction showError() complète

- [ ] **T9.5** - ui.js : Fonction showSuccess() (optionnel toast) (20min)
  - Toast "Rendu généré !" en haut à droite
  - Disparaît après 3s
  - **Livrable** : Notification success

- [ ] **T9.6** - app.js : Désactiver contrôles pendant loading (20min)
  - Fonction disableControls()
  - Fonction enableControls()
  - Appeler dans loadRender()
  - **Livrable** : Contrôles désactivés pendant loading

- [ ] **T9.7** - Tests : Validation feedbacks (15min)
  - Tester loader pendant appel API
  - Tester message erreur (couper internet)
  - Tester success toast
  - **Livrable** : Feedbacks UX validés

**Estimation totale** : ~2h20min

---

### [US-010] Gestion des erreurs API (3 SP)

**Priorité** : Moyenne
**Assigné à** : DEV

#### Tâches techniques

- [ ] **T10.1** - api.js : Mapper codes HTTP vers messages FR (30min)
  - Objet errorMessages {404: "...", 500: "..."}
  - Fonction getErrorMessage(status)
  - Messages user-friendly en français
  - **Livrable** : Mapping erreurs HTTP

- [ ] **T10.2** - api.js : Améliorer gestion timeout (20min)
  - AbortController avec timeout 30s
  - Message "Temps d'attente dépassé"
  - **Livrable** : Timeout géré proprement

- [ ] **T10.3** - api.js : Retry automatique (45min)
  - Fonction retryFetch(fn, retries = 1)
  - Retry uniquement erreurs réseau (pas 4xx/5xx)
  - Delay 1s entre tentatives
  - **Livrable** : Retry automatique fonctionnel

- [ ] **T10.4** - state.js : Garder dernière config valide (20min)
  - Propriété state.lastValidConfig
  - Mettre à jour après succès API
  - **Livrable** : Cache dernière config

- [ ] **T10.5** - ui.js : Bouton Réessayer dans erreur (20min)
  - Ajouter bouton dans showError()
  - Listener → relancer loadRender()
  - **Livrable** : Bouton Réessayer fonctionnel

- [ ] **T10.6** - Tests : Validation erreurs (30min)
  - Tester avec API offline
  - Tester avec URL invalide
  - Tester timeout (bloquer réseau)
  - Vérifier messages FR affichés
  - **Livrable** : Gestion erreurs validée

**Estimation totale** : ~2h45min

---

## 📊 Résumé par US

| US | Story Points | Tâches | Estimation |
|----|--------------|--------|------------|
| US-001 | 3 SP | 5 tâches | ~2h15min |
| US-002 | 5 SP | 6 tâches | ~3h30min |
| US-003 | 8 SP | 12 tâches | ~5h30min |
| US-004 | 3 SP | 4 tâches | ~1h25min |
| US-005 | 8 SP | 7 tâches | ~5h |
| US-006 | 5 SP | 4 tâches | ~3h45min |
| US-007 | 5 SP | 5 tâches | ~4h |
| US-008 | 3 SP | 5 tâches | ~1h50min |
| US-009 | 3 SP | 7 tâches | ~2h20min |
| US-010 | 3 SP | 6 tâches | ~2h45min |
| **TOTAL** | **48 SP** | **61 tâches** | **~32h30min** |

---

## 🎯 Ordre de développement recommandé

### Phase 1 : Foundation (Jour 1)
1. US-001 (Architecture de base)
2. US-002 (Viewport + carrousel)

### Phase 2 : Controls (Jour 2)
3. US-003 (Panel de contrôles)
4. US-004 (Immatriculation)

### Phase 3 : Logic (Jour 3)
5. US-006 (Calculs positions)
6. US-007 (Calculs couleurs)

### Phase 4 : Integration (Jour 4)
7. US-005 (API Lumiscaphe)
8. US-008 (Auto-render)

### Phase 5 : Polish (Jour 5)
9. US-009 (Feedbacks UX)
10. US-010 (Gestion erreurs)

---

## 🚧 Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| API Lumiscaphe lente (>10s) | Moyenne | Moyen | Loader + timeout + messages clairs |
| Calculs positions incorrects | Faible | Haut | Tests unitaires vs script Python |
| CORS API externe | Faible | Haut | Tester rapidement (US-005), fallback si besoin |
| Débordement temps (>5 jours) | Moyenne | Moyen | Prioriser US critiques, reporter US-010 si besoin |

---

## 📝 Notes Sprint Planning

- **Équipe** : 1 développeur full-stack
- **Capacité estimée** : ~32h30min de développement pur
- **Avec buffer (tests, bugs, intégration)** : ~40-45h réelles
- **Durée recommandée** : 5-7 jours ouvrés

**Décisions prises** :
- ✅ Architecture Vanilla JS (pas de framework)
- ✅ CSS custom (pas de Tailwind)
- ✅ Modules ES6 natifs (pas de build)
- ✅ Tests manuels uniquement (Sprint #1)
- ✅ Pas de XML local côté frontend (API gère)

**Actions post-planning** :
- [ ] DEV : Commencer par US-001 dès validation ARCH
- [ ] QA : Préparer plan de tests basé sur critères d'acceptation
- [ ] DOC : Préparer template documentation utilisateur

---

**Document créé** : 02/12/2025 (Sprint Planning)
**Prochaine mise à jour** : Daily Scrum quotidien
