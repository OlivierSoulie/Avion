# Changelog - Configurateur Daher

Ce fichier contient l'historique complet de toutes les modifications, sprints et maintenances du projet.

---

## 13/01/2026 (US-051: Configuration logos TBM et 9xx + Fix loader images)

**Type** : Feature + Bug fix critique
**Durée** : ~3h
**Context** : Support nouvelle base V0.9.7 avec paramètres logos + correction visibilité loader

### Fonctionnalités implémentées

**1. Configuration couleurs logos (US-051)**
- **Paramètres ajoutés** : `Exterior_Logo_TBM` et `Exterior_Logo_9xx`
- **Format XML** : `{ColorName}_{HexCode}` (ex: "LogoBlack_#262626", "LogoRed_#A40000")
- **Détection dynamique** : Sections affichées uniquement si paramètres présents dans XML
- **Pattern réplication** : Exact replication du pattern Spinner (8 fichiers modifiés, ~90 lignes)

**Architecture** :
- Extraction couleurs depuis XML (`<Option>` tags)
- Dropdown affiche nom couleur (ex: "LogoBlack")
- API reçoit valeur complète avec hex (ex: "LogoBlack_#262626")
- RESET + affichage conditionnel au changement de base

**Fichiers modifiés** :
- `code/js/state.js` (lignes 60-61) - Ajout logoTBM/logo9xx dans config
- `code/js/config.js` (lignes 33-34) - Valeurs par défaut depuis XML
- `code/js/api/xml-parser.js` (lignes 622-636) - Extraction options logos
- `code/js/ui/dropdown-manager.js` (lignes 35-51) - RESET + détection dynamique
- `code/js/ui/events/config-events.js` (lignes 195-211) - Event listeners logos
- `code/js/api/payload-builder.js` (lignes 292-293) - Ajout logos dans payload
- `code/js/api/config-parser.js` (lignes 44-47) - Parsing bookmarks logos
- `code/index.html` (lignes 378-404) - Sections UI logos avec `display: none`

**Résultat** :
- ✅ Configuration couleurs logos TBM et 9xx fonctionnelle
- ✅ Détection dynamique : sections visibles uniquement si paramètres existent
- ✅ RESET correct au changement de base (pas de sections fantômes)
- ✅ Pattern 100% cohérent avec reste du code

**2. Documentation badges et patterns**
- **Badges features** : Ajout "Logo TBM" et "Logo 9xx" dans section features disponibles
- **Documentation groupée** : Section unique pour les deux logos (pattern groupé)
- **Description enrichie** : Explication usage pratique (UI display + contraste couleur)

**Fichiers modifiés** :
- `code/js/api/database-analyzer.js` (lignes 129-130, 434-440) - Détection + description
- `code/js/ui/config-schema-modal.js` (lignes 127-128, 190-297) - Badges + groupement

**Résultat** :
- ✅ Documentation complète et structurée
- ✅ Badges visibles dans modal Documentation
- ✅ Description pratique et utile pour développeurs

**3. BUG FIX CRITIQUE - Auto-refresh au changement de base**
- **Problème** : Images ne se rafraîchissaient pas automatiquement après changement de base
- **Cause** : Variable `lastConfigHash` locale dans app.js non connectée à `window.lastConfigHash`
- **Solution** : Exposition via `Object.defineProperty` avec getter/setter

**Fichiers modifiés** :
- `code/js/app.js` (lignes 398-403) - Exposition lastConfigHash sur window

**Résultat** :
- ✅ Images visibles immédiatement au changement de base
- ✅ Plus besoin de changer d'onglet pour voir les images

**4. BUG FIX CRITIQUE - Loader visible pendant chargement GPU**
- **Problème** : Loader disparaissait immédiatement après réception URLs API, mais avant téléchargement images par navigateur
- **Symptôme** : Icônes images cassées visibles pendant 5-10 secondes (temps GPU + download)
- **Cause** : `hideLoader()` appelé avant que les images soient chargées dans le DOM
- **Solution** :
  - Rendre `renderMosaic` async avec `Promise.all` pour attendre chargement images
  - Déplacer `hideLoader()` APRÈS `await renderMosaic()` et `await renderConfigMosaic()`
  - Event handlers `onload`/`onerror` pour chaque image

**Fichiers modifiés** :
- `code/js/ui/mosaic.js` (lignes 180-250) - `renderMosaic` async + Promise.all
- `code/js/app.js` (lignes 235-244) - Déplacement hideLoader() après await

**Résultat** :
- ✅ Loader visible pendant temps GPU serveur (5-10 secondes)
- ✅ Loader visible pendant téléchargement images navigateur
- ✅ Loader disparaît uniquement quand TOUTES les images sont affichées
- ✅ Plus d'icônes cassées visibles
- ✅ Expérience utilisateur fluide

### Statistiques

| Métrique | Valeur |
|----------|--------|
| **Fichiers modifiés** | 14 |
| **Lignes ajoutées** | ~250 |
| **Lignes supprimées** | ~10 |
| **Features majeures** | 2 (Logos + Loader) |
| **Bugs critiques** | 2 (Auto-refresh + Loader) |
| **Pattern replication** | 100% Spinner |
| **Rétrocompatibilité** | 100% (V0.2-V0.9.6 sans logos) |

**Versions supportées** :
- V0.9.7+ : Logos TBM et 9xx configurables
- V0.2-V0.9.6 : Fonctionne sans changement (logos masqués automatiquement)

---

## 07/01/2026 (Sprint #19: Support décor V0.9.2 + Centrage optique + Bug fixes)

**Type** : Maintenance et évolutions majeures
**Durée** : ~4h
**Commits** : `2602ada`, `5d7cadf`

### Fonctionnalités implémentées

**1. Support format décor V0.9.2 avec index**
- **Format XML** : `{DecorName}_{Ground|Flight}_{Index}` (ex: "Studio_Ground_6", "Fjord_Flight_2")
- **Dropdown** : Affiche uniquement le nom propre ("Studio", "Fjord", etc.)
- **Tri** : Par index croissant (1, 2, 3, 4, 5, 6) au lieu d'alphabétique
- **API** : Reçoit le nom complet avec index
- **Rétrocompatibilité** : V0.2, V0.3-V0.9.1 continuent de fonctionner

**Fichiers modifiés** :
- `code/js/api/xml-parser.js` : Extraction nom propre + index, tri, intelligent matching
- `code/js/api/payload-builder.js` : Extraction nom de base pour paramètres XML
- `code/js/api/rendering.js` : Fix détection format V0.2 vs V0.9.2+
- `code/js/utils/validators.js` : Intelligent matching par label en fallback
- `code/js/app.js` : Synchronisation dropdown après validation

**2. Vue PDF forcée en décor Studio**
- Indépendant de la sélection dropdown utilisateur
- Validation automatique selon version de base (ex: "Studio" → "Studio_Ground_6" en V0.9.2)

**Fichiers modifiés** :
- `code/js/api/pdf-generation.js` : Force `decor: 'Studio'` avant validation dans `generatePDFView()` et `generatePDFMosaic()`

**3. Centrage optique immatriculation**
- **Grandes lettres (W, M)** : Décalage +5cm vers droite
- **Petites lettres (I, 1)** : Décalage -5cm vers gauche
- Décalage appliqué uniquement à la référence de départ (toutes les lettres suivantes ajustées automatiquement)

**Fichiers modifiés** :
- `code/js/utils/positioning.js` : Ajout fonction `getOpticalOffset()`, calcul `adjustedStartX`

**4. Refactoring architectural : Event listeners**
- Séparation complète des event listeners dans modules dédiés
- `app.js` réduit de 2300+ lignes (suppression orchestration events)
- 13 nouveaux fichiers créés : `code/js/ui/events/`, `validators.js`, `color-manager.js`, etc.

### Bug fixes

**BUG CRITIQUE : Position avion V0.9.2**
- **Problème** : Position.XXX recevait nom complet avec suffixes (ex: "Position.Studio_Ground_6")
- **Cause** : Utilisation de `config.decor` au lieu de `decorPositionValue` (nom de base)
- **Solution** : Utilisation de `decorPositionValue` depuis `buildDecorConfig()`
- **Résultat** : Avion correctement positionné pour tous les décors

**Fichier modifié** :
- `code/js/api/payload-builder.js` (lignes 277-285)

### Statistiques

| Métrique | Valeur |
|----------|--------|
| **Commits** | 2 |
| **Fichiers modifiés** | 53 |
| **Lignes ajoutées** | +7016 |
| **Lignes supprimées** | -2778 |
| **Features majeures** | 3 |
| **Bugs critiques** | 1 |
| **Nouveaux modules** | 13 |
| **Rétrocompatibilité** | 100% |

**Documentation complète** : `sprints/sprint-19/RATIFICATION-SESSION-2026-01-07.md`

---

## 22/12/2025 (Hotfixes: Mosaïque PDF 3 caméras + Système labels coins)

**Type** : Corrections et améliorations hors sprint
**Durée** : ~4h
**Context** : Améliorations ergonomie et corrections vue PDF mosaïque

### 1. BUG FIX CRITIQUE - Positionnement hotspots vues carrées (1:1)

**Problème** :
- Hotspots mal positionnés dans les 2 vues carrées (dessus/dessous) de la mosaïque PDF
- Les coordonnées 3D→2D projetées ne correspondaient pas à l'affichage réel

**Cause** :
- API recevait 1920x1080 pour toutes les caméras
- Les vues carrées nécessitent 1080x1080 pour projection correcte

**Solution** :
- Adaptation dimensions selon index caméra dans `generatePDFMosaic()`
- Caméra 0 (profil) : 16:9 → 1920x1080
- Caméras 1 et 2 (dessus/dessous) : 1:1 → 1080x1080
- Dimensions passées à `/Snapshot` ET `/Hotspot`

**Fichiers modifiés** :
- `code/js/api/pdf-generation.js` (lignes 113-157)

**Résultat** :
- ✅ Hotspots correctement positionnés sur toutes les vues

---

### 2. BUG FIX - Duplication images lors changement onglet

**Problème** :
- Clic répété sur onglet PDF dupliquait les images

**Cause** :
- Suppression uniquement de `.pdf-view-wrapper`, pas de `.pdf-mosaic-wrapper`

**Solution** :
- Ajout suppression `.pdf-mosaic-wrapper` avant recréation

**Fichiers modifiés** :
- `code/js/ui/pdf-view.js` (lignes 752-755)

**Résultat** :
- ✅ Pas de duplication images

---

### 3. AMÉLIORATION UI - Tailles et proportions mosaïque

**Modifications** :
- Vue profil (16:9) : 32vh
- Vues carrées (1:1) : 38vh container, maxWidth 67.6vh
- Largeur totale mosaïque : largeur 2 vues carrées = largeur vue profil

**Fichiers modifiés** :
- `code/styles/viewport.css` (dimensions mosaïque PDF)

**Résultat** :
- ✅ Proportions harmonieuses sans ascenseurs
- ✅ Alignement largeur parfait

---

### 4. FEATURE MAJEURE - Système labels 6 zones coins (vues 1:1)

**Problème** :
- Système slots horizontal inadapté aux vues dessus/dessous
- Labels couvraient l'avion central

**Solution** :
- **6 zones coins** : topLeft, topRight, middleLeft, middleRight, bottomLeft, bottomRight
- **Distribution intelligente** :
  - Séparation gauche/droite selon position X hotspot
  - Tri par Y (haut vers bas)
  - Répartition tiers égaux par côté (1/3 top, 1/3 middle, 1/3 bottom)
- **Zone middle** : 55% hauteur (alignement ailes avion)

**Fichiers modifiés** :
- `code/js/ui/pdf-view.js` (lignes 263-327)

**Résultat** :
- ✅ Labels toujours dans zones sans avion
- ✅ Distribution équilibrée automatique

---

### 5. AMÉLIORATION UI - Layout labels (texte sous carré)

**Évolution** : Plusieurs itérations pour layout optimal

**Layout final** :
- **Ordre** : BORD → CARRÉ → TEXTE (vertical)
- Carré au bord (selon zone : gauche ou droite)
- Texte centré horizontalement sous le carré
- Ligne vers centre du carré depuis hotspot

**Paramètres** :
- Largeur texte : 55px (fixe)
- Espacement carré-texte : 4px
- Offset bord : 0.25x textOffset

**Fichiers modifiés** :
- `code/js/ui/pdf-view.js` (`createCornerLabel` lignes 540-656)

**Résultat** :
- ✅ Layout épuré et lisible
- ✅ Texte toujours dans l'image

---

### 6. BUG FIX - Débordement zones bottom

**Problème** :
- Labels zones bottom dépassaient hors image
- Texte/carrés non visibles

**Cause** :
- Position baseY au coin, mais empilage vers le bas
- Dernier élément sortait de l'image

**Solution** :
- Calcul `baseY = cornerPos.y - totalHeight` pour zones bottom
- Empilement vers le haut au lieu du bas
- Hauteur totale = carré + texte + espacement

**Fichiers modifiés** :
- `code/js/ui/pdf-view.js` (`createCornerLabel` lignes 558-569)

**Résultat** :
- ✅ Tous labels visibles dans l'image

---

### 7. AMÉLIORATION - Justification texte adaptative

**Implémentation** :
- Zones left : texte justifié gauche (`textAnchor='start'`)
- Zones right : texte justifié droite (`textAnchor='end'`)
- Zones bottom : texte centré sous carré (`textAnchor='middle'`)

**Fichiers modifiés** :
- `code/js/ui/pdf-view.js` (SVG + Canvas)

**Résultat** :
- ✅ Lisibilité optimale selon position

---

### 8. FEATURE CRITIQUE - Navigation fullscreen avec SVG bakés

**Problème** :
- Fullscreen : seule image cliquée avait overlay SVG
- Navigation (flèches) : autres images sans hotspots

**Cause** :
- Génération composite uniquement pour image cliquée

**Solution** :
- **Génération parallèle** : 3 composites via `Promise.all`
- **Stockage hotspots** : `wrapper.dataset.hotspots` (JSON)
- **Remplacement temporaire** : 3 images sources
- **Cleanup intelligent** : `MutationObserver` détecte fermeture modal
- **Révocation blobs** : libération mémoire automatique

**Fichiers modifiés** :
- `code/js/ui/pdf-view.js` (`createPDFViewElement` lignes 1310-1372)

**Résultat** :
- ✅ Navigation fullscreen complète avec hotspots sur les 3 vues
- ✅ Pas de fuite mémoire (cleanup blobs)

---

### 9. AMÉLIORATION - Détection PDF mosaic dans modal

**Ajout** :
- Support `.pdf-mosaic-wrapper` dans détection mosaïque active
- Génération filenames pour download (`vue_pdf_profil_hotspots.png`, etc.)

**Fichiers modifiés** :
- `code/js/ui/modal.js` (lignes 38, 54-57, 75-83)

**Résultat** :
- ✅ Fullscreen + download fonctionnent pour mosaïque PDF

---

**Impact total** :
- 5 fichiers modifiés
- ~600 lignes ajoutées/modifiées
- 9 corrections/améliorations majeures

**Fonctionnalités finales** :
- ✅ Mosaïque PDF 3 caméras (1x 16:9 + 2x 1:1)
- ✅ Hotspots précis sur toutes vues
- ✅ Labels 6 zones intelligentes (vues 1:1)
- ✅ Layout texte sous carré
- ✅ Navigation fullscreen complète
- ✅ Code production (pas de console.log)

---

## 19/12/2025 (Sprint #18: Vue PDF + Maintenance watermark Overview)

### A. Sprint #18 - Vue PDF avec Hotspots (✅ TERMINÉ - Hors process Scrumban)

**Type** : Feature majeure (13 SP) - **Développement hors process** (documentation rétroactive)
**Durée** : ~8h
**Commits** : `262ebe4`, `3a5924d`, `18fb93e` (18-19/12/2025)

**Fonctionnalité implémentée** : Vue PDF avec visualisation interactive des zones de couleur via hotspots 2D

**Architecture** :
```
XML Config → API Snapshot → API Hotspot → SVG Overlay → Canvas Export
```

**Modules créés (4 nouveaux fichiers - 898 lignes)** :
- `code/js/api/pdf-generation.js` (78 lignes) - Orchestration pipeline
- `code/js/api/hotspot.js` (66 lignes) - Appel endpoint `/Hotspot` (nouveau)
- `code/js/ui/pdf-view.js` (651 lignes) - Rendu SVG overlay ⭐
- `code/js/utils/hotspot-helper.js` (103 lignes) - Enrichissement couleurs

**Données** :
- `code/data/pdf-hotspots.json` (266 lignes) - Positions 3D validées (6 paint schemes)

**Modules modifiés** : 10 fichiers (+352 lignes)
- `code/index.html`, `code/js/app.js`, `code/js/api/xml-parser.js`
- `code/js/ui/modal.js`, `code/js/ui/mosaic.js`, `code/js/ui/index.js`
- `code/js/config.js`, `code/js/utils/positioning.js`

**Features livrées** :
- ✅ API `/Snapshot` avec caméra PDF (2ème du groupe Studio)
- ✅ API `/Hotspot` pour projection 3D→2D (premier usage projet)
- ✅ SVG overlay avec carrés colorés + labels (nom zone + couleur actuelle)
- ✅ Calculs proportionnels adaptatifs (1.2% titre, 0.9% sous-titre)
- ✅ Export image composite PNG (SVG bakés via Canvas HTML5)
- ✅ Bouton "PDF" dans barre navigation
- ✅ Support fullscreen + download
- ✅ Bonus: Fix largeurs immatriculation ('I', '1', '-' → 10cm)

**Impact total** :
- 18 fichiers modifiés/créés
- +1696 lignes ajoutées, -59 lignes supprimées

**Limitations** :
- Caméra PDF fixe (2ème du groupe Studio) → Fonctionne uniquement décor Studio
- Positions 3D manuelles dans JSON → Nécessite saisie pour nouveaux paint schemes

**Documentation créée** :
- `docs/ANALYSE-RETROACTIVE-US-051.md` - Analyse complète
- `artifacts/US-051-vue-pdf-hotspots.md` - User Story format standard
- `docs/RESUME-EXECUTIF-US-051.md` - Résumé exécutif
- `docs/FICHIERS-MODIFIES-US-051.md` - Liste fichiers

---

### B. Maintenance (19/12/2025) - Corrections watermark Overview + Fuite mémoire

**Type** : Maintenance corrective
**Durée** : ~1h
**Context** : Améliorations vue Overview (watermark avion)

#### 1. 🎨 AMÉLIORATION - Positionnement watermark proportionnel

**Problème** :
- Watermark "TBM 960/980" mal positionné (10% puis 50%, pas adaptatif)
- Ordre superposition incorrect (watermark devant l'avion)
- Pas proportionnel entre mosaïque et plein écran

**Solution** :
- **Position** : 25% du haut (moitié de la moitié supérieure) - proportionnel partout
- **Ordre** : Watermark dessiné AVANT l'image (arrière-plan correct)
- **Canvas** : `globalAlpha = 1.0` restauré pour l'image après watermark
- **CSS** : `top: 25%` + `transform: translate(-50%, -50%)`
- **JS** : `y = height * 0.25` (proportionnel à taille réelle)

**Fichiers modifiés** :
- `code/styles/viewport.css` (ligne 525)
- `code/js/ui/mosaic.js` (lignes 39-54)

**Résultat** :
- ✅ Watermark toujours en arrière-plan derrière l'avion
- ✅ Position 25% proportionnelle (mosaïque + plein écran + téléchargement)

#### 2. 🐛 BUG FIX - Fuite mémoire event listeners

**Problème** :
- Event listeners empilés à chaque appel `renderOverviewMosaic()`
- Fuite mémoire lors de changements multiples de configuration

**Solution** :
- **Clonage d'éléments** : `cloneNode()` + `replaceChild()` pour supprimer anciens listeners
- **Nettoyage systématique** : 3 éléments (imageA, downloadBtn, checkbox)

**Fichiers modifiés** :
- `code/js/ui/mosaic.js` (lignes 397-478)

**Résultat** :
- ✅ Aucune fuite mémoire (même après 100+ changements config)
- ✅ Code professionnel et maintenable

---

### C. Corrections bugs critiques (19/12/2025) - Fullscreen + Immatriculation PDF

**Type** : Bug fixes critiques
**Durée** : ~1h
**Context** : Corrections de bugs bloquants identifiés par l'utilisateur

#### 1. 🐛 BUG FIX CRITIQUE - Collision fullscreen entre vues PDF et Overview

**Problème** :
- Quand on passait de PDF à Overview (ou inverse), le fullscreen affichait la mauvaise image
- Symptôme : Cliquer sur l'image Overview affichait l'image PDF en fullscreen (et vice-versa)

**Cause** :
- Deux mécanismes de masquage différents utilisés de manière incohérente :
  - Classe CSS `hidden` (utilisée pour `mosaicGrid` et `overviewMosaic`)
  - Style inline `style.display = 'none'` (utilisé pour `pdfViewWrapper`)
- La détection de visibilité dans `modal.js` ne vérifiait pas les deux mécanismes
- Résultat : `pdfViewWrapper` masqué avec `display: none` était détecté comme visible car pas de classe `hidden`

**Solution** :
- **Unification complète** sur classe CSS `hidden` uniquement (suppression de tous les `style.display`)
- Simplification de la détection : vérification uniquement de `!classList.contains('hidden')`

**Fichiers modifiés** :
- `code/js/ui/pdf-view.js` (lignes 67-69) : Utilisation de `classList.add('hidden')`
- `code/js/ui/mosaic.js` (3 fonctions) :
  - `renderMosaic()` : Suppression `style.display`, ajout `classList` pour `pdfWrapper`
  - `renderConfigMosaic()` : Suppression `style.display`, ajout `classList` pour `pdfWrapper`
  - `renderOverviewMosaic()` : Suppression `style.display`, ajout `classList` pour `pdfWrapper`
- `code/js/ui/modal.js` (lignes 42-52 et 70) : Simplification détection visibilité (classe uniquement)

**Résultat** :
- ✅ Fullscreen affiche maintenant toujours la bonne image selon la vue active
- ✅ Code plus maintenable avec un seul mécanisme de masquage
- ✅ Respect des bonnes pratiques CSS (séparation des responsabilités)

#### 2. 🐛 BUG FIX CRITIQUE - Immatriculation non positionnée dans vue PDF

**Problème** :
- Les lettres d'immatriculation n'apparaissaient pas correctement positionnées dans la vue PDF
- Symptôme : Lettres absentes ou mal placées sur l'avion dans l'onglet PDF

**Cause** :
- Les `surfaces` (positions des lettres d'immatriculation) étaient générées uniquement pour le mode `'normal'`
- La vue PDF utilise le mode `'singleCamera'` via `buildPayloadForSingleCamera()`
- Condition ligne 327 : `if (mode === 'normal')` excluait le mode `'singleCamera'`
- Résultat : Payload PDF envoyé à l'API sans tableau `surfaces` → lettres non positionnées

**Solution** :
- Génération des surfaces pour **TOUS** les modes (suppression de la condition `if (mode === 'normal')`)
- Les surfaces sont maintenant incluses systématiquement dans le payload, quel que soit le mode

**Fichiers modifiés** :
- `code/js/api/payload-builder.js` (lignes 326-336) : Suppression condition mode, génération systématique

**Résultat** :
- ✅ Vue PDF affiche maintenant l'immatriculation correctement positionnée sur l'avion
- ✅ Cohérence entre toutes les vues (Extérieur, Intérieur, Overview, PDF)
- ✅ Payload PDF complet avec toutes les données nécessaires

---

### D. Améliorations UI + Documentation XML (19/12/2025)

**Type** : Améliorations interface + Documentation système
**Durée** : ~3h
**Context** : Améliorations ergonomie + Documentation complète patterns XML

#### 1. 🎨 AMÉLIORATION UI - Navigation fullscreen pour image unique

**Problème** :
- Flèches de navigation affichées même quand une seule image (cas vue PDF)
- Ergonomie confuse : flèches inutiles visibles

**Solution** :
- Détection du nombre d'images dans `openFullscreen()`
- Masquage automatique des boutons prev/next si `currentImages.length === 1`

**Fichiers modifiés** :
- `code/js/ui/modal.js` (lignes 80-85)

**Résultat** :
- ✅ Navigation fullscreen propre pour images uniques
- ✅ Meilleure expérience utilisateur

#### 2. 🐛 BUG FIX - Index offset vue Configuration

**Problème** :
- Clic sur image Configuration ouvrait la mauvaise image en fullscreen
- Décalage d'index causé par les dividers (titres de sections)

**Cause** :
- Compteur `imageIndex` incrémenté pour TOUS les éléments (images + dividers)
- Les dividers ne sont pas des images mais comptaient dans l'index

**Solution** :
- Pattern closure pour capturer le bon index avant incrémentation
- Incrémentation uniquement APRÈS création de chaque image réelle
- `const currentImageIndex = imageIndex;` avant le listener

**Fichiers modifiés** :
- `code/js/ui/mosaic.js` (`renderConfigMosaic()` lignes 200-250)

**Résultat** :
- ✅ Fullscreen affiche la bonne image Configuration
- ✅ Alignement parfait entre mosaïque et modal

#### 3. 🎨 AMÉLIORATION - Support Spinner indexé (V0.9+)

**Problème** :
- Nouvelle base V0.9+ utilise format `{NomSpinner}_{index}` (ex: `PolishedAluminium_1`)
- Dropdown affichait le format brut avec index
- Besoin de tri par index au lieu de tri alphabétique

**Solution** :
- Détection automatique du format indexé via pattern matching
- Extraction nom propre (sans index) pour affichage dropdown
- Tri par index numérique croissant au lieu de tri alphabétique
- Backward compatible avec anciennes versions sans index

**Fichiers modifiés** :
- `code/js/api/xml-parser.js` (`extractParameterOptions()` lignes 450-510)

**Résultat** :
- ✅ Dropdown affiche noms propres sans index (`PolishedAluminium` au lieu de `PolishedAluminium_1`)
- ✅ Ordre logique par index (1, 2, 3...) au lieu d'alphabétique
- ✅ Rétrocompatible avec V0.2-V0.8

#### 4. 📊 AMÉLIORATION - Notation version avec "+" (standardisation)

**Problème** :
- Confusion sur les versions : certains patterns marqués "V0.2-V0.9" alors que toujours valides en V1.0+
- Documentation imprécise sur la persistance des patterns

**Solution** :
- Notation "V0.X+" pour indiquer "introduit en V0.X et toujours valide dans versions supérieures"
- Uniformisation de TOUS les patterns dans `database-analyzer.js`

**Exemples** :
- `V0.2+` : Introduit en V0.2, toujours valide
- `V0.6+` : Introduit en V0.6, toujours valide
- `V0.9+` : Introduit en V0.9, toujours valide

**Fichiers modifiés** :
- `code/js/api/database-analyzer.js` (toutes les descriptions de patterns)

**Résultat** :
- ✅ Documentation claire de l'évolution des patterns
- ✅ Compréhension immédiate de la compatibilité versions

#### 5. 🎨 AMÉLIORATION UI - Renommage bouton Documentation

**Problème** :
- Bouton "⚙️ Configuration" prêtait à confusion (pas de configuration, mais documentation XML)

**Solution** :
- Renommage "⚙️ Configuration" → "📚 Documentation"
- Mise à jour aria-label correspondant

**Fichiers modifiés** :
- `code/index.html` (ligne 45)

**Résultat** :
- ✅ Terminologie claire et cohérente
- ✅ Utilisateur comprend immédiatement le rôle du bouton

#### 6. 🎨 AMÉLIORATION UI - Suppression scrollbars internes

**Problème** :
- Double scrollbars dans modal Documentation (scrollbar du body + scrollbar de chaque section)
- Interface encombrée et peu ergonomique

**Solution** :
- Passage de `grid` à `flex-direction: column` pour Parameters et Bookmarks
- Suppression des hauteurs max et overflow internes
- Scroll global uniquement (au niveau du body modal)

**Fichiers modifiés** :
- `code/styles/config-schema.css` (lignes 372-376, 465-469)

**Résultat** :
- ✅ Interface épurée avec scrollbar unique
- ✅ Sections s'étendent naturellement selon contenu

#### 7. 📚 FEATURE MAJEURE - Documentation patterns Bookmarks

**Problème** :
- Section Bookmarks affichait liste brute sans explication
- Pas de documentation des patterns de nommage
- Difficile de comprendre la structure des bookmarks

**Solution** :
- Implémentation système de détection de patterns identique aux Parameters
- Regroupement par pattern avec description détaillée
- Support multi-ligne pour patterns combinés (ex: RegL + RegR)

**Patterns documentés** (6 catégories) :
1. **Interior_PrestigeSelection_{PrestigeName}** (V0.2+)
   - Bookmarks de sélection niveau finition Prestige
   - Contient configuration par défaut de TOUS les paramètres intérieurs
   - Exemple : `Interior_PrestigeSelection_Oslo`

2. **Exterior_{PaintSchemeName}** (V0.2+)
   - Bookmarks de sélection schéma de peinture
   - Contient configuration par défaut de TOUS les paramètres extérieurs
   - Exemple : `Exterior_Alize`, `Exterior_Meltem`, `Exterior_Sirocco`, etc.

3. **{PaintSchemeName}_RegL_{X}_{Y} / {PaintSchemeName}_RegR_{X}_{Y}** (V0.6+)
   - Points de départ pour positionnement immatriculation
   - RegL = Tag surface "Registration Left", RegR = Tag surface "Registration Right"
   - X/Y = Positions 3D en mètres
   - Exemple : `Alize_RegL_-0.647_0.004`, `Alize_RegR_0.647_0.004`

4. **{PaintSchemeName}_RegL_{X1}_{X2}_{X3}_{X4}_{X5}_{X6}_{Y}** (V0.2-V0.5)
   - Ancienne version du pattern RegL/RegR (6 positions X au lieu d'une)
   - Deprecated en V0.6+ mais conservé pour compatibilité bases anciennes

5. **Tehuano_export** (V0.2+)
   - Bookmark spécial pour garantir configuration par défaut
   - Utilisé en fin de travail Lumiscaphe

6. **Divers** (patterns non standardisés)
   - Bookmarks de configuration ou positionnement sans pattern spécifique
   - Exemples : bookmarks techniques internes Lumiscaphe

**Fichiers modifiés** :
- `code/js/api/database-analyzer.js` (lignes 1100-1300) - Détection patterns bookmarks
- `code/js/app.js` (lignes 1850-2100) - Affichage patterns bookmarks avec multi-ligne
- `code/styles/config-schema.css` (ligne 467) - Flex column pour bookmarks

**Résultat** :
- ✅ Documentation complète et structurée des bookmarks
- ✅ Compréhension immédiate de la structure XML
- ✅ Support affichage multi-ligne pour patterns combinés

#### 8. 📊 AMÉLIORATION - Regroupement zones couleur

**Problème** :
- Zones A/B/C/D affichées séparément alors que structure identique
- Redondance de documentation (même description répétée 4 fois)

**Solution** :
- Regroupement Zones A/B/C/D dans un seul cadre avec titre multi-ligne
- Zone A+ dans un cadre séparé (structure identique mais usage différent)
- Consolidation des exemples (toutes les couleurs disponibles dans un seul dropdown)

**Format d'affichage** :
```
Exterior_Colors_ZoneA
Exterior_Colors_ZoneB
Exterior_Colors_ZoneC
Exterior_Colors_ZoneD

Pattern: Exterior_Colors_ZoneA | B | C | D.{colorName}-{code}-{hexLAB}-{hexLumiscaphe}-{tagVoilure}-{metadata...}
```

**Fichiers modifiés** :
- `code/js/api/database-analyzer.js` (lignes 550-600) - Patterns regroupés
- `code/js/app.js` (lignes 1650-1750) - Affichage regroupé avec titres multi-ligne

**Résultat** :
- ✅ Documentation épurée et sans redondance
- ✅ Compréhension immédiate de la structure commune
- ✅ Affichage compact et professionnel

**Résumé section D** :
- 10 fichiers modifiés
- 8 améliorations/features majeures
- Ergonomie + Documentation = Expérience utilisateur optimale

---

## 11/12/2025 (Maintenance: Corrections critiques + Nettoyage code)

**Type** : Maintenance corrective hors sprint (entre Sprint #16 et Sprint #17)
**Durée** : ~2h
**Fichiers impactés** : 20 fichiers modifiés, ~200 lignes

### 1. BUG FIX CRITIQUE - Support décors dynamiques depuis XML

- **Problème** : Nouvelle base avec nouveau décor non présent dans dictionnaire hardcodé `DECORS_CONFIG`
- **Conséquence** : Payloads API sans décor ni position → Violation principe "XML = source de vérité"
- **Cause racine** : `buildDecorConfig()` utilisait dictionnaire hardcodé au lieu de lire XML
- **Solution** :
  - Réécriture complète de `buildDecorConfig()` pour lecture dynamique XML
  - Ajout `.replace(/^Decor\./i, '')` pour extraire suffix du symbol complet
  - Pattern matching `startsWith()` pour supporter TOUS les décors
  - Suppression import `DECORS_CONFIG` dans payload-builder.js et app.js
- **Fichiers modifiés** :
  - `code/js/api/payload-builder.js` (lignes 163-248) - buildDecorConfig() réécrit
  - `code/js/config.js` (lignes 39-50) - DECORS_CONFIG marqué DEPRECATED
  - `code/js/app.js` - Import DECORS_CONFIG supprimé
- **Résultat** : TOUS les décors XML fonctionnent automatiquement sans modification code
- **Documentation** :
  - `code/js/debug-decor-config.js` (script de test)
  - `docs/FIX-DECOR-DYNAMIC-V03.md` (doc technique complète)
  - `IMPLEMENTATION-SUMMARY-DECOR-DYNAMIC.md` (résumé exécutif)

### 2. NETTOYAGE - Suppression console.log production

- **Problème** : ~100+ `console.log()` polluant la console utilisateur
- **Solution** :
  - Suppression TOUS les `console.log()` via sed (2 passes)
  - Suppression appels `log.init()`, `log.ui()`, `log.debug()`, `log.success()`
  - Conservation uniquement `console.error()` et `console.warn()`
- **Fichiers modifiés (18 fichiers)** :
  - `code/js/app.js` (~100+ logs supprimés)
  - `code/js/api/*.js` (7 fichiers) - Tous logs supprimés
  - `code/js/ui/*.js` (5 fichiers) - Tous logs supprimés
  - `code/js/utils/*.js` (2 fichiers) - Tous logs supprimés
  - `code/js/state.js`, `code/js/config.js`, `code/js/logger.js`
- **Résultat** : Console propre, code professionnel

### 3. CLEANUP - Fonction deprecated supprimée

- **Problème** : Warning "toggleInteriorConfig() est DEPRECATED" en console
- **Solution** :
  - Remplacement `toggleInteriorConfig()` par `toggleViewControls()` (ligne 2264)
  - Suppression complète fonction deprecated (lignes 1355-1362)
- **Fichiers modifiés** : `code/js/app.js`
- **Résultat** : Plus de warnings, code nettoyé

### 4. AMÉLIORATION - Favicon Lumiscaphe

- **Problème** : Erreur 404 `/favicon.ico` en console
- **Solution** :
  - Téléchargement favicon depuis www.lumiscaphe.com
  - Ajout link tag dans index.html (lignes 10-11)
- **Fichiers modifiés** :
  - `code/index.html` (2 lignes ajoutées)
  - `code/favicon.ico` (nouveau fichier - 4.5KB)
- **Résultat** : Plus d'erreur 404, icône Lumiscaphe visible

**Commit** : `7ef93ea` - fix: Maintenance critique - Décor dynamique + Nettoyage console.log
**GitHub** : ✅ Poussé vers origin/main le 11/12/2025

---

## 09/12/2025 (Fix critique V0.6+ immatriculation + améliorations)

- **BUG FIX CRITIQUE** : Direction V0.6+ pour immatriculation
  - **Problème** : En V0.6+, les positions RegR allaient vers la gauche au lieu de la droite
  - **Cause** : Le signe est encodé dans startX du bookmark (ex: `REGR_-0.34_0.0`), le code appliquait en plus une direction négative
  - **Solution** : Direction toujours positive (1.0) en V0.6+ pour REGL et REGR
  - Modifié : `code/js/utils/positioning.js` ligne 93
  - Modifié : `generate_full_render.py` lignes 188-195
  - **Résultat** : Positions V0.5 et V0.6+ maintenant identiques
  - ⚠️ **EN ATTENTE** : Validation visuelle en attente des modifications Lumiscaphe (démasquage surfaces RegL/RegR en base V0.6)
- **BUG FIX** : Bouton "Download JSON" ne fonctionnait plus
  - **Cause** : Payload sauvegardé dans `api-client.js` mais lu depuis `state.js`
  - **Solution** : Unification du stockage dans `state.js` uniquement
  - Modifié : `code/js/api/rendering.js` (import depuis state.js)
  - Modifié : `code/js/api/api-client.js` (suppression lastPayload local)
  - Modifié : `code/js/api/index.js` (retrait ré-exportation)
- **AMÉLIORATION** : Nom de base dans fichier JSON téléchargé
  - Format : `configurateur-payload-{databaseName}-{version}-{paintScheme}-{timestamp}.json`
  - Modifié : `code/js/app.js` ligne 502

---

## 10/12/2025 (Correction Documentation Layers)

- **DOC FIX CRITIQUE** : Correction documentation système de couleurs
  - **CLARIFICATION** : Pas d'inversion des layers par l'API
  - Pour paire "A-D" : Layer 0 = Zone A (LETTRE), Layer 1 = Zone D (CONTOUR/OMBRE)
  - Correction des commentaires dans `code/js/utils/colors.js`
  - Correction de la documentation dans `CLAUDE.md`, `DATABASE-PATTERNS.md`, `GLOSSARY.md`
  - Note : Les entrées historiques ci-dessous mentionnant "inversion" étaient erronées

---

## 05/12/2025 (Mise à jour Python v3.0 + Documentation GitHub)

- **CHANGEMENT MAJEUR** : Le JavaScript devient la source de vérité pour la logique métier
  - Le script Python a été mis à jour pour refléter toutes les corrections du JavaScript
  - Version Python v3.0 : Aligné avec le site web JavaScript
- **PYTHON v3.0** : Corrections et améliorations synchronisées avec JavaScript
  - ~~BUG FIX : Inversion des layers~~ (NOTE 10/12: cette entrée était erronée, pas d'inversion)
  - Layer 1 toujours envoyé (même si zone = "0", identique à colors.js lignes 231-244)
  - US-019 : DATABASE_ID dynamique avec sélection TBM 960/980 (corrigé initialisation)
  - US-023 à US-026 : Support Tablet/SunGlass/Doors dynamiques
  - Immatriculation par défaut : "NWM1MW" → "N960TB" (aligné avec JS)
  - Schéma peinture : "Zephyr" → "Zephir" (aligné avec JS)
  - Documentation complète de la synchronisation avec JavaScript
- **DOC** : Mise à jour CLAUDE.md
  - Section "Sources de Vérité" : JavaScript fait autorité pour la logique
  - Section "Synchronisation GitHub" : Repository, règles de commit, workflow
  - Processus de développement mis à jour

---

## 05/12/2025

- **BUG FIX CRITIQUE** : Correction application des couleurs pour styles slanted (A-E)
  - **Problème** : Lettres penchées (slanted A-E) restaient blanches, seules les lettres droites (straight F-J) étaient colorisées
  - **Cause racine** : Nommage différent requis pour slanted vs straight dans `materialMultiLayers`
  - **Solution** : Nommage conditionnel dans `generateMaterialMultiLayers()` :
    - Slanted (A-E) : `Style_A_Left_N` et `Style_A_Right_N` (AVEC Left/Right)
    - Straight (F-J) : `Style_F_N` (SANS Left/Right)
    - Layer 1 toujours envoyé, même pour paire "X-0" (utilise couleur Layer 0 si zone = "0")
  - Corrigé dans `code/js/colors.js` lignes 209-273 (nommage)
  - ~~NOTE : Mention d'inversion des layers était erronée (correction 10/12/2025)~~
- **DOC** : Mise à jour section "Système de couleurs" dans CLAUDE.md
  - Documentation des règles de nommage slanted vs straight

---

## 04/12/2025

- **BUG FIX CRITIQUE** : Correction du mapping styles → couleurs
  - **Problème** : Styles slanted et straight avaient des couleurs différentes
  - **Cause** : Mauvais calcul de `style_idx = (ord(style_letter) - ord('A')) // 2`
  - **Solution** : Mapping par couple correct : A/F→paire[0], B/G→paire[1], C/H→paire[2], D/I→paire[3], E/J→paire[4]
  - Corrigé dans `generate_full_render.py` lignes 230-234
  - Corrigé dans `code/js/colors.js` lignes 93-99
- **BUG FIX** : Gestion conditionnelle du Layer 1
  - **Solution** : Layer 1 toujours envoyé (même pour zone "0", utilise fallback sur Layer 0)
  - Corrigé dans `generate_full_render.py` lignes 247-248, 326-333
  - Corrigé dans `code/js/colors.js` lignes 124-127, 215-240
- **BUG FIX** : Correction du schéma de peinture par défaut
  - Correction "Zephyr" → "Zephir" dans `code/js/config.js` pour correspondre au XML
- **BUG FIX** : Correction affichage immatriculation style slanted (lettres penchées)
  - Ajout orientation Left/Right pour styles slanted (A-E) dans `generate_full_render.py`
  - Ajout orientation Left/Right pour styles slanted (A-E) dans `code/js/colors.js`
  - Format textures : `Style_A_Left_N` et `Style_A_Right_N` pour slanted, `Style_F_N` pour straight
- **CONFIG** : Changement immatriculation par défaut "NWM1MW" → "N960TB"
  - Modifié dans `code/js/config.js` et `code/index.html`
- **DOC** : Ajout section "Règles de Développement" dans CLAUDE.md
  - Documentation des sources de vérité (XML pour données, JavaScript pour logique)
  - Documentation du système de couleurs (mapping couples, Layer 0/Layer 1)

---

## 03/12/2025

- **DEV** : Implementation du telechargement XML et extraction camera group ID
  - Ajout de `getDatabaseXML()` pour telecharger le XML depuis l'API
  - Reecriture de `findCameraGroupId()` avec recherche exacte et partielle
  - Fonctions `buildPayload()`, `fetchRenderImages()`, et `testPayloadBuild()` maintenant async
  - Camera group ID maintenant dynamique au lieu de null
  - Creation de la page de test `code/test-camera-group.html`
  - Documentation technique complete dans `docs/IMPLEMENTATION-XML-CAMERA-GROUP.md`

---

## 02/12/2025

- Projet cree
- Structure initialisee
- Prompts agents configures
