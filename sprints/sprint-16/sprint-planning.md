# Sprint Planning - Sprint #16

**Date** : 10/12/2025
**Sprint Goal** : "Implémenter les vignettes Prestige composites dans la vue Configuration avec assemblage Canvas HTML5"
**Capacity** : 8 Story Points
**Durée** : 1-2 jours

---

## 📊 Sprint Backlog

### User Stories sélectionnées

| US | Description | SP | Priorité |
|----|-------------|----|----|
| US-049 | Vignettes Prestige Composites (Canvas) | 8 | Haute |
| **TOTAL** | | **8 SP** | |

---

## 🎯 Sprint Goal

"Implémenter les vignettes Prestige composites dans la vue Configuration avec assemblage Canvas HTML5"

**Critères de succès** :
- ✅ 8 vignettes Prestige affichées dans Configuration (Oslo, London, SanPedro, etc.)
- ✅ Chaque vignette = 10 matériaux assemblés horizontalement (300×100 px)
- ✅ Produit "PresetThumbnail" utilisé pour Prestige
- ✅ Assemblage Canvas HTML5 fonctionnel
- ✅ Tests QA passés

---

## 👥 Staffing Décision

### Équipe Sprint #16 : **6 agents**

| Rôle | Agent | Responsabilité |
|------|-------|---------------|
| Product Owner | PO | Validation US-049, critères d'acceptation |
| Architecte / Scrum Master | ARCH | Supervision technique, code review |
| Coordinator | COORDINATOR | Coordination quotidienne, Kanban, Daily Scrum |
| Développeur Généraliste | DEV-Généraliste | Implémentation complète US-049 (12 tâches) |
| QA Fonctionnel | QA-Fonctionnel | Tests end-to-end, validation visuelle |
| Documentaliste | DOC | Documentation technique (si nécessaire) |

**Justification** :
- US-049 = 8 SP, complexité haute → 1 DEV-Généraliste suffit (full-stack)
- Pas de besoin multi-spécialisation (Frontend/Backend/Database)
- Équipe minimale efficace

---

## 📋 Décomposition US-049 (12 tâches)

### Phase 1 : Backend - Support Produits (2h) - 3 tâches
1. **[T049-1]** Ajouter `getProductIdByName()` dans xml-parser.js (30 min) - DEV
2. **[T049-2]** Ajouter `getAllPrestigeNames()` dans xml-parser.js (30 min) - DEV
3. **[T049-3]** Modifier `buildPayloadBase()` pour supporter `productId` (1h) - DEV

### Phase 2 : Génération Vignettes Composites (3h30) - 3 tâches
4. **[T049-4]** Créer `parsePrestigeBookmarkOrdered()` dans xml-parser.js (30 min) - DEV
5. **[T049-5]** Créer `assembleImagesHorizontally()` (Canvas) dans configuration.js (1h) - DEV
6. **[T049-6]** Créer `generatePrestigeCompositeImage()` dans configuration.js (2h) - DEV

### Phase 3 : Intégration (1h30) - 3 tâches
7. **[T049-7]** Modifier `fetchConfigurationImages()` - Détecter caméra PrestigeSelection (15 min) - DEV
8. **[T049-8]** Intégrer génération des 8 vignettes Prestige (45 min) - DEV
9. **[T049-9]** Gérer cas d'erreur et robustesse (30 min) - DEV

### Phase 4 : Tests et Validation (2h) - 3 tâches
10. **[T049-10]** Tests manuels end-to-end (1h) - QA-Fonctionnel
11. **[T049-11]** Validation visuelle et ajustements (30 min) - QA + DEV
12. **[T049-12]** Tests de robustesse (30 min) - QA-Fonctionnel

**Total** : 12 tâches, ~9h de travail

---

## 📅 Planning Prévisionnel

### Jour 1 (10/12/2025)
- **Matin (4h)** :
  - T049-1, T049-2, T049-3 (Backend - Support Produits)
  - T049-4, T049-5 (Début génération Canvas)
- **Après-midi (4h)** :
  - T049-6 (Fin génération composite)
  - T049-7, T049-8, T049-9 (Intégration)

### Jour 2 (11/12/2025)
- **Matin (2h)** :
  - T049-10, T049-11, T049-12 (Tests QA)
- **Après-midi (1h)** :
  - Corrections si nécessaire
  - Sprint Review + Clôture

**Durée totale estimée** : 1,5 jour

---

## 🎯 Definition of Done

Pour marquer US-049 comme "Done" :

### Code
- ✅ Code implémenté et testé (12 tâches complétées)
- ✅ Pas de console.error en production
- ✅ Code modulaire et commenté (JSDoc)
- ✅ Pas de duplication de code

### Tests
- ✅ Tests QA fonctionnels passés (T049-10, T049-11, T049-12)
- ✅ Validation visuelle OK (8 prestiges affichés correctement)
- ✅ Tests de robustesse OK (erreurs gérées)
- ✅ Tests sur différentes bases (V0.2, V0.3, V0.6)

### Fonctionnel
- ✅ 8 vignettes Prestige affichées dans Configuration
- ✅ Chaque vignette = 300×100 pixels
- ✅ 10 matériaux assemblés horizontalement
- ✅ Ordre matériaux = ordre bookmark XML
- ✅ Nom affiché = "Prestige {nom}"
- ✅ Clic vignette → Modal plein écran fonctionne

### Technique
- ✅ Produit "PresetThumbnail" utilisé pour Prestige
- ✅ Caméra "PrestigeSelection" utilisée
- ✅ Canvas HTML5 assemblage fonctionne (pas d'erreur CORS)
- ✅ Export Data URL (JPEG quality 95%)
- ✅ Gestion d'erreur robuste

### Documentation
- ⚠️ Documentation technique si nécessaire (optionnel pour cette US)

### Validation
- ✅ Code review ARCH (si bloquant structurel)
- ✅ Validation PO (critères acceptation)
- ✅ Pas de bugs critiques

---

## 🚨 Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| CORS bloque Canvas | Faible | Bloquant | `crossOrigin='anonymous'` + vérifier headers API |
| Performance (80 API calls) | Moyenne | UX | Loader + progression + Promise.all |
| Bookmark incomplet | Faible | Mineur | Gestion dynamique nombre matériaux |
| Produit PresetThumbnail absent | Très faible | Bloquant | Error explicite + logs |

---

## 📊 Métriques Cibles

- **Velocity** : 8/8 SP (100%)
- **Cycle Time** : < 2 jours
- **Bugs** : 0 bug critique
- **Taux de qualité** : 100% (tous tests passés)

---

## 🎉 Cérémonie de Lancement

### Daily Scrum Planning
- **Quand** : Chaque matin (si sprint > 1 jour)
- **Durée** : 15 min max
- **Format** : Tour de table (3 questions)

### Sprint Review
- **Quand** : Fin sprint (après T049-12)
- **Participants** : PO + ARCH + COORDINATOR + DEV + QA
- **Objectif** : Démonstration + validation

---

**Sprint Planning complété par** : COORDINATOR
**Date** : 10/12/2025
**Participants** : PO + ARCH + COORDINATOR + DEV + QA + DOC
