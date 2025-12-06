# Sprint #12 - Planning Notes

**Date** : 06/12/2025
**Participants** : ARCH (Scrum Master), PO
**Durée** : 45 min
**Sprint Goal** : "Ajouter une vue Configuration avec mosaïque adaptative de 27 vignettes (1x16:9 + 26x1:1)"

---

## 📋 User Story du Sprint

### [US-042] Mosaïque "Configuration" avec vignettes adaptatives (16:9 et 1:1)

**Priorité** : Haute
**Story Points** : 5 SP
**Status** : To Do → In Progress (Sprint #12)

**User Story** :
En tant qu'utilisateur,
Je veux visualiser toutes les caméras du groupe "Configuration" sous forme de mosaïque d'illustrations,
Afin d'avoir un aperçu visuel rapide de différentes vues de configuration.

**Contexte métier** :
Le groupe de caméras "Configuration" contient 27 caméras destinées à créer des vignettes d'illustration avec des ratios mixtes (16:9 et 1:1). Ces vignettes sont optimisées pour tenir sur une seule page.

---

## 🔍 Investigation PO (Terminée)

### Découvertes clés

**Groupe XML "Configuration"** :
- **ID** : `4c4154db-3245-414a-85c4-030ee180ecd4`
- **Nombre de caméras** : 27
- **Distribution** :
  - 1 caméra **16:9** : "paint scheme" (vue d'ensemble peinture)
  - 26 caméras **1:1** : détails de configuration

### Méthode de détection des ratios

**Approche validée** : Détection automatique via sensors

```javascript
Camera → sensorId → Sensor (width, height) → ratio = width/height
```

**Exemples** :
- Sensor "Sensor CONFIGURATION Paintscheme" : width="36" height="20.25" → **ratio 1.778 (16:9)**
- Sensor "Sensor CONFIGURATION" : width="36" height="36" → **ratio 1.0 (1:1)**

### Tailles de rendu recommandées

| Ratio | Largeur | Hauteur | Nombre | Usage |
|-------|---------|---------|--------|-------|
| 16:9  | 400px   | 225px   | 1      | Vue d'ensemble peinture |
| 1:1   | 100px   | 100px   | 26     | Détails configuration |

---

## 🎯 Critères d'acceptation

### 1. Nouvelle vue "Configuration"
- [ ] Nouvel onglet "CONFIGURATION" aux côtés de "EXTÉRIEUR" et "INTÉRIEUR"
- [ ] Clic sur l'onglet charge les 27 caméras du groupe "Configuration"
- [ ] Mosaïque affichée (pas de carousel)

### 2. Gestion des ratios multiples
- [ ] Caméra 16:9 affichée en vignette 400x225px
- [ ] 26 caméras 1:1 affichées en vignettes 100x100px
- [ ] Détection automatique via sensorId → Sensor width/height
- [ ] Pas de mapping manuel hardcodé

### 3. Organisation en grille adaptative
- [ ] Grille CSS Grid avec colonnes auto-adaptatives
- [ ] Toutes les vignettes tiennent sur une page (scroll minimal)
- [ ] Respect des ratios sans déformation
- [ ] Espacement homogène (gap: 10-15px)

### 4. Interaction utilisateur
- [ ] Clic sur vignette → Modal plein écran (réutilisation US-020)
- [ ] Modal affiche l'image en résolution native
- [ ] Fermeture avec ✕ ou Echap
- [ ] Navigation clavier (flèches gauche/droite)

### 5. Appel API optimisé
- [ ] Utilise le groupe "Configuration" du XML (cameraGroupId dynamique)
- [ ] Tailles de rendu adaptées selon ratio détecté
- [ ] Un seul appel API pour générer toutes les vignettes

### 6. Intégration UI
- [ ] Style cohérent avec onglets existants
- [ ] Réutilisation CSS `.mosaic-grid` (US-029)
- [ ] Pas de régression sur EXTÉRIEUR et INTÉRIEUR

---

## 🏗️ Décomposition technique

### Phase 1 : Backend - API et détection ratios (~1h)

**[T042-1] Fonction getCameraSensorInfo() (30 min)**
- Créer fonction dans `api.js` pour extraire sensor d'une caméra
- Input : `cameraId`
- Output : `{ sensorId, width, height, ratio, ratioType }`
- Logique : Query XML pour Camera → sensorId → Sensor → calcul ratio

**[T042-2] Support viewType="configuration" (30 min)**
- Modifier `findCameraGroupId()` dans `api.js`
- Ajouter case `viewType === "configuration"` → Chercher `name="Configuration"`
- Retourner l'ID du groupe : `4c4154db-3245-414a-85c4-030ee180ecd4`

### Phase 2 : Frontend - UI et mosaïque (~1h30)

**[T042-3] Onglet "CONFIGURATION" (15 min)**
- Ajouter bouton dans `index.html` aux côtés des onglets existants
- Style cohérent avec `.view-toggle button`
- Event listener pour basculer vers vue Configuration

**[T042-4] Fonction renderConfigMosaic() (45 min)**
- Créer dans `ui.js` fonction dédiée à la mosaïque Configuration
- Pour chaque image retournée par l'API :
  - Appeler `getCameraSensorInfo(cameraId)` pour déterminer ratio
  - Appliquer classe CSS selon ratio : `.vignette-16-9` ou `.vignette-1-1`
- Générer la grille avec vignettes de tailles différentes
- Réutiliser logique modal plein écran (US-020)

**[T042-5] CSS Grid adaptatif (30 min)**
- Créer styles dans `viewport.css` :
  - `.vignette-16-9` : width 400px, height 225px
  - `.vignette-1-1` : width 100px, height 100px
- Grille adaptative : `grid-template-columns: repeat(auto-fit, minmax(100px, 1fr))`
- Gap : 15px
- Responsive : ajuster colonnes selon largeur écran

### Phase 3 : Intégration et appel API (~45 min)

**[T042-6] Intégration appel API (30 min)**
- Modifier `fetchRenderImages()` pour supporter viewType="configuration"
- Générer payload avec groupe "Configuration"
- Gérer tailles multiples dans le payload (16:9 vs 1:1)
- Parser les résultats avec cameraId pour chaque image

**[T042-7] Event listeners et navigation (15 min)**
- Ajouter event listener sur bouton "CONFIGURATION"
- Basculer les sections de contrôles (masquer Ext/Int, afficher Config si nécessaire)
- Appeler `fetchRenderImages({ viewType: 'configuration' })`
- Appeler `renderConfigMosaic(images)`

### Phase 4 : Tests et ajustements (30 min)

**[T042-8] Tests manuels (20 min)**
- Tester chargement onglet Configuration
- Vérifier affichage des 27 vignettes (1 grande + 26 petites)
- Tester modal plein écran sur chaque vignette
- Vérifier navigation clavier
- Tester responsive (desktop, tablette)

**[T042-9] Ajustements visuels (10 min)**
- Ajuster espacement si nécessaire
- Vérifier alignement grille
- Optimiser taille des vignettes si scroll excessif

---

## 📁 Fichiers impactés

### Backend (JavaScript)
- `code/js/api.js` :
  - Nouvelle fonction `getCameraSensorInfo(cameraId)`
  - Modification `findCameraGroupId()` pour viewType="configuration"
  - Modification `buildPayload()` pour tailles multiples

### Frontend (HTML/JavaScript/CSS)
- `code/index.html` : Nouvel onglet "CONFIGURATION"
- `code/js/ui.js` : Nouvelle fonction `renderConfigMosaic(images)`
- `code/js/app.js` : Event listeners pour onglet Configuration
- `code/styles/viewport.css` : Classes `.vignette-16-9` et `.vignette-1-1`

---

## 🔗 Dépendances

### Dépendances internes (déjà livrées)
- ✅ US-029 : Mosaïque d'images (réutilisation `.mosaic-grid`)
- ✅ US-022 : Sélecteur de vue (pattern onglets)
- ✅ US-020 : Modal plein écran (réutilisation)
- ✅ Fonction `getDatabaseXML()` : Déjà disponible dans `api.js`

### Dépendances externes
- ✅ API Lumiscaphe : Groupe "Configuration" confirmé dans XML
- ✅ Sensors définis dans XML avec width/height

---

## ⚠️ Risques identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Performance : 27 images à charger | Moyen | Faible | Utiliser tailles optimisées (100x100 pour 1:1) |
| Layout : Vignettes de tailles différentes mal alignées | Faible | Moyenne | CSS Grid avec `align-items: center` |
| API : Timeout si trop d'images | Moyen | Faible | Tailles réduites → payload plus léger |
| UX : Trop de scroll sur petits écrans | Faible | Moyenne | Media queries responsive |

---

## 📊 Estimation finale

**Story Points** : 5 SP (~2h30 - 3h de développement)

**Breakdown** :
- Phase 1 : Backend (1h)
- Phase 2 : Frontend (1h30)
- Phase 3 : Intégration (45 min)
- Phase 4 : Tests (30 min)

**Total** : ~3h45 (marge incluse pour ajustements)

---

## ✅ Validation Sprint Planning

**Sprint Goal validé** : ✅
**Tâches décomposées** : ✅ (9 tâches)
**Fichiers identifiés** : ✅
**Risques analysés** : ✅
**Dépendances vérifiées** : ✅

**Prêt pour développement** : ✅

---

**Prochaine étape** : Création du `sprint-backlog.md` avec toutes les tâches détaillées.
