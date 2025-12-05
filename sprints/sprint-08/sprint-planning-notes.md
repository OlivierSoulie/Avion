# Sprint Planning Notes - Sprint #8

**Projet** : 005-Configurateur_Daher
**Sprint** : Sprint #8
**Date** : 05/12/2025
**Participants** : PO, ARCH, COORDINATOR, DEV-Généraliste, QA-Fonctionnel, DOC
**Durée** : 30 min
**Animé par** : ARCH

---

## 🎯 Sprint Goal

**"Permettre le téléchargement individuel et par lot des images générées"**

L'utilisateur pourra :
1. Télécharger une image individuellement en cliquant sur une icône
2. Sélectionner plusieurs images et les télécharger en lot avec barre de progression

---

## 📋 User Stories Sélectionnées

### 1. [US-031] Téléchargement individuel d'images (2 SP)

**Priorité** : Moyenne
**Complexité** : Simple
**Temps estimé** : ~1h

**Description** :
Ajouter une icône download en coin supérieur droit de chaque vignette mosaïque. Clic → téléchargement immédiat avec nommage `vue_exterieur_N.png` ou `vue_interieur_N.png`.

**Critères d'acceptation** :
- Icône visible au hover
- Téléchargement immédiat au clic
- Pas d'impact sur clic pour fullscreen
- Toast de succès

**Décomposition technique** :
- T1.1 : Ajouter icône download sur vignettes (HTML/JS) - 15 min
- T1.2 : Créer fonction downloadImage() (JS) - 20 min
- T1.3 : Créer fonction generateFilename() (JS) - 10 min
- T1.4 : Styles CSS pour icône download (CSS) - 15 min

### 2. [US-032] Téléchargement par lot avec sélection (5 SP)

**Priorité** : Moyenne
**Complexité** : Moyenne
**Temps estimé** : ~3h

**Description** :
Bouton "Télécharger plusieurs images" active mode sélection avec checkboxes sur vignettes. Téléchargements séquentiels avec barre de progression et compteur.

**Critères d'acceptation** :
- Bouton active mode sélection
- Checkboxes sur vignettes
- Compteur de sélection
- Téléchargements séquentiels (délai 200ms)
- Barre de progression
- Toast de succès final

**Décomposition technique** :
- T2.1 : Bouton "Télécharger plusieurs images" (HTML) - 10 min
- T2.2 : Checkboxes sur vignettes (JS) - 20 min
- T2.3 : Barre de contrôles mode sélection (HTML) - 15 min
- T2.4 : Barre de progression (HTML) - 10 min
- T2.5 : Event listeners mode sélection (JS) - 30 min
- T2.6 : Fonctions mode sélection (JS) - 40 min
- T2.7 : Fonction téléchargement par lot (JS) - 50 min
- T2.8 : Styles CSS mode sélection (CSS) - 25 min

---

## 🏗️ Architecture Technique

### Fichiers à modifier

**US-031** :
- `code/js/ui.js` : renderMosaic(), downloadImage(), generateFilename()
- `code/styles/viewport.css` : .mosaic-item, .download-btn

**US-032** :
- `code/index.html` : btnBulkDownload, selectionControls, downloadProgress
- `code/js/ui.js` : enterSelectionMode(), exitSelectionMode(), updateSelectionCounter(), downloadSelectedImages()
- `code/js/app.js` : Event listeners dans initUI()
- `code/styles/viewport.css` : .selection-controls, .image-checkbox, .download-progress

### Dépendances

- US-032 **dépend de** US-031 (réutilise `downloadImage()`)
- Les deux US utilisent `getImages()` de `state.js`
- Les deux US utilisent `showSuccessToast()` de `ui.js`

### Décisions techniques

1. **Téléchargement** : Utiliser attribut `download` sur lien `<a>` temporaire (standard HTML5)
2. **Mode sélection** : Classe CSS `.selection-mode` sur `#mosaicGrid` pour toggle checkboxes
3. **Téléchargements séquentiels** : Boucle `async/await` avec délai 200ms (éviter saturation navigateur)
4. **Nommage** : `vue_exterieur_N.png` (N = 1 à 5) / `vue_interieur_N.png` (N = 1 à 6)
5. **Checkboxes** : Positionnement absolute, `data-index`, `data-url`, `data-filename` pour faciliter la récupération

---

## 👥 Assignations

### DEV-Généraliste
- **US-031** : Toutes les tâches T1.1 à T1.4 (~1h)
- **US-032** : Toutes les tâches T2.1 à T2.8 (~3h)

### QA-Fonctionnel
- Tests US-031 : 6 critères d'acceptation + tests navigateurs (Chrome, Firefox, Edge)
- Tests US-032 : 9 critères d'acceptation + tests multi-sélection (1, 3, 5, 11 images)

### DOC
- Mise à jour USER_GUIDE avec section "Téléchargement d'images"
- Screenshots des nouvelles fonctionnalités

---

## 📊 Capacity Planning

**Sprint Capacity** : 7 Story Points

| Agent | Tâches | Temps estimé |
|-------|--------|--------------|
| DEV-Généraliste | US-031 + US-032 | ~4h |
| QA-Fonctionnel | Tests US-031 + US-032 | ~30 min |
| DOC | Documentation | ~30 min |
| **TOTAL** | | **~5h** |

**Marge** : ~1h pour bugs/ajustements

---

## ⚠️ Risques Identifiés

### Risque 1 : Format images base64
**Probabilité** : Faible
**Impact** : Moyen
**Mitigation** : Tester download avec images base64 dès T1.2, vérifier compatibilité navigateurs

### Risque 2 : Téléchargements bloqués par navigateur
**Probabilité** : Faible
**Impact** : Élevé
**Mitigation** : Délai 200ms entre téléchargements, tester sur Chrome/Firefox/Edge

### Risque 3 : UX checkboxes en mode sélection
**Probabilité** : Moyenne
**Impact** : Faible
**Mitigation** : Styles CSS clairs, hover effects, feedback visuel immédiat

---

## ✅ Definition of Done

Pour considérer le sprint Done :
- [ ] Toutes les tâches complétées (12 tâches)
- [ ] Tous les critères d'acceptation validés (15 critères total)
- [ ] Tests QA passés à 100%
- [ ] Pas de bugs bloquants
- [ ] Documentation utilisateur mise à jour
- [ ] Code commité sur Git avec message descriptif
- [ ] Validation stakeholder (démo fonctionnelle)
- [ ] Kanban Board mis à jour
- [ ] Sprint Review complétée

---

## 📅 Timeline Prévue

**Jour 1 (05/12/2025)** :
- Sprint Planning (30 min) ✅
- DEV : US-031 complète (~1h)
- DEV : US-032 complète (~3h)
- QA : Tests US-031 + US-032 (~30 min)
- DOC : Documentation (~30 min)
- Sprint Review (15 min)

**Durée totale estimée** : ~5h30

---

## 📝 Questions / Clarifications

**Q1** : Faut-il télécharger les images en parallèle ou séquentiellement ?
**R** : Séquentiellement avec délai 200ms pour éviter de saturer le navigateur (décision ARCH)

**Q2** : Quel format de fichier ? PNG ou JPEG ?
**R** : PNG (qualité maximale, pas de compression avec perte)

**Q3** : Faut-il une confirmation avant téléchargement par lot ?
**R** : Non, l'utilisateur a déjà sélectionné les images et cliqué sur "Télécharger la sélection", pas besoin de confirmation supplémentaire

---

## 🎯 Success Metrics

Le sprint sera considéré comme réussi si :
- ✅ 100% des critères d'acceptation validés
- ✅ 0 bugs bloquants
- ✅ Tests QA passés sur 3 navigateurs (Chrome, Firefox, Edge)
- ✅ Validation stakeholder positive
- ✅ Documentation complète

---

**Notes prises par** : ARCH
**Validé par** : COORDINATOR
**Prochaine étape** : DEV commence US-031
