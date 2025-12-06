# Sprint Planning Notes - Sprint #10

**Projet** : 005-Configurateur_Daher
**Sprint** : Sprint #10
**Date** : 06/12/2025
**Participants** : PO, ARCH, COORDINATOR, DEV-Généraliste, QA-Fonctionnel
**Animé par** : ARCH
**Durée** : 30 min

---

## 🎯 Sprint Goal

**"Corriger formatage dropdowns + Compléter configuration intérieur (Stitching + Réorganisation Sièges + Radio buttons)"**

---

## 📋 User Stories Sélectionnées

### Sprint #10 Backlog

| US | Titre | SP | Priorité | Assigné |
|----|-------|----|----|---------|
| US-038 | Corriger formatage noms dropdowns | 1 | HIGH | DEV-Généraliste |
| US-035 | Réorganiser section Sièges | 1 | MEDIUM | DEV-Généraliste |
| US-036 | Ajouter paramètre Stitching | 2 | MEDIUM | DEV-Généraliste |
| US-037 | Radio buttons Matériau Central | 1 | LOW | DEV-Généraliste |
| **TOTAL** | | **5 SP** | | |

**Velocity cible** : 5 SP
**Durée estimée** : ~2h30

---

## 🔍 Contexte

### Origine des US

**Source** : Stakeholder a identifié des paramètres intérieur manquants/mal configurés

**Problèmes remontés** :
1. Dropdowns affichent des codes au lieu de noms propres (ex: "Wite San 2192" au lieu de "White Sand")
2. Ultra-Suede Ribbon est dans la mauvaise section (Matériaux au lieu de Sièges)
3. Paramètre Stitching complètement manquant
4. Matériau Central devrait être un sélecteur (radio buttons) et non un dropdown

### Analyse ARCH

**US-038 (Formatage)** : Bug critique affectant UX. Code existant semble correct (`extractParameterOptions()` ligne 429-433), mais comportement observé ne correspond pas. Investigation nécessaire.

**US-035 (Réorganisation)** : Tâche simple de réorganisation HTML, aucun risque technique.

**US-036 (Stitching)** : Feature complète nécessitant modifications sur 4 fichiers (api.js, state.js, config.js, app.js, index.html). Synchronisation avec Prestige à ne pas oublier.

**US-037 (Radio buttons)** : Transformation UI simple, mais nécessite modifications des event listeners.

---

## 🏗️ Décomposition Technique

### US-038 : Corriger formatage noms dropdowns (1 SP)

**Tâches** :
- **T1.1** : Débugger `extractParameterOptions()` pour identifier source (15 min)
- **T1.2** : Corriger logique de formatage si nécessaire (15 min)
- **T1.3** : Tester sur tous les dropdowns concernés (10 min)

**Fichiers** : `code/js/api.js`

**Décisions techniques** :
- Ajouter `console.log()` pour tracer `rawLabel` avant formatage
- Si regex CamelCase ne fonctionne pas, ajouter filtre numérique : `cleanName.replace(/\d+/g, '')`
- Tester avec exemples concrets : "BlackOnyx_5557_Suede_Premium" → "Black Onyx"

---

### US-035 : Réorganiser section Sièges (1 SP)

**Tâches** :
- **T2.1** : Déplacer Ultra-Suede Ribbon de Matériaux vers Sièges (5 min)
- **T2.2** : Réordonner éléments dans Sièges (5 min)
- **T2.3** : Vérifier intégrité HTML et indentation (5 min)

**Fichiers** : `code/index.html` (lignes 374-441)

**Ordre final attendu** :
1. Cuir des sièges
2. Ultra-Suede Ribbon (déplacé)
3. Stitching (placeholder - sera ajouté par US-036)
4. Matériau Central
5. Perforation des sièges
6. Ceintures

**Décisions techniques** :
- Déplacer bloc HTML complet (lignes 436-439) de Matériaux → Sièges
- Déplacer Ceintures après Perforation

---

### US-036 : Ajouter paramètre Stitching (2 SP)

**Tâches** :
- **T3.1** : Ajouter extraction `Interior_Stitching` dans `getInteriorOptionsFromXML()` (10 min)
- **T3.2** : Ajouter propriété `stitching` dans `state.js` (5 min)
- **T3.3** : Ajouter valeur par défaut dans `config.js` (2 min)
- **T3.4** : Ajouter dropdown Stitching dans `index.html` (5 min)
- **T3.5** : Peupler dropdown dans `app.js` init (5 min)
- **T3.6** : Ajouter event listener (5 min)
- **T3.7** : Intégrer dans payload API (10 min)
- **T3.8** : Synchroniser avec Prestige (15 min)

**Fichiers** : `code/js/api.js`, `code/js/state.js`, `code/js/config.js`, `code/js/app.js`, `code/index.html`

**Décisions techniques** :
- Extraire options via `extractParameterOptions(xmlDoc, 'Interior_Stitching')`
- Position HTML : Après Ultra-Suede, avant Matériau Central (position 3)
- Event listener : Format identique aux autres dropdowns intérieur
- Payload : Ajouter `Interior_Stitching.${config.stitching}` dans configuration string

---

### US-037 : Transformer Matériau Central en radio buttons (1 SP)

**Tâches** :
- **T4.1** : Remplacer dropdown par radio buttons dans HTML (10 min)
- **T4.2** : Modifier event listener (10 min)
- **T4.3** : Supprimer peuplement dropdown dans init (2 min)
- **T4.4** : Synchroniser radio buttons avec Prestige (10 min)
- **T4.5** : Tester les deux options (10 min)

**Fichiers** : `code/index.html`, `code/js/app.js`

**Décisions techniques** :
- 2 radio buttons statiques : `Ultra-Suede_Premium` (Suede) / `Leather_Premium` (Cuir)
- Utiliser `name="central-seat-material"` au lieu de `id`
- Event listener : `querySelectorAll('input[name="central-seat-material"]')`
- Supprimer `populateDropdown()` pour central-seat-material

---

## 🚀 Stratégie de Développement

### Ordre de développement

1. **US-038** (HIGH PRIORITY) : Corriger formatage AVANT d'ajouter Stitching
2. **US-035** : Réorganiser HTML (simple, pas de risque)
3. **US-036** : Ajouter Stitching (feature complète)
4. **US-037** : Radio buttons (transformation UI)

**Raison** : Corriger le bug de formatage en premier garantit que le nouveau dropdown Stitching s'affichera correctement dès son implémentation.

### Staffing

**Équipe minimale** : 6 agents
- **PO** : Validation critères d'acceptation
- **ARCH** : Supervision technique, résolution blocages
- **COORDINATOR** : Orchestration workflow
- **DEV-Généraliste** : Développement séquentiel (éviter conflits Git)
- **QA-Fonctionnel** : Tests après chaque US
- **DOC** : Mise à jour documentation si nécessaire

**Développement séquentiel** : DEV travaille seul pour éviter conflits Git sur les mêmes fichiers (api.js, app.js, index.html)

---

## ⚠️ Risques et Mitigations

### Risque #1 : Bug formatage vient du XML, pas du code JS

**Probabilité** : Moyenne
**Impact** : Faible

**Mitigation** :
- Si le XML contient déjà les codes numériques dans le `label`, documenter dans Retrospective
- Possibilité de parser différemment ou demander correction XML source
- Fallback : Ajouter filtre numérique dans `extractParameterOptions()` pour nettoyer

---

### Risque #2 : Prestige Sync complexe pour Stitching

**Probabilité** : Faible
**Impact** : Moyen

**Mitigation** :
- Réutiliser pattern existant pour autres paramètres intérieur (carpet, seatCovers, etc.)
- Si Stitching n'est pas dans le preset Prestige XML, utiliser valeur par défaut null
- Tester avec tous les Prestige (Oslo, SanPedro, London, etc.)

---

### Risque #3 : CSS radio buttons ne s'applique pas correctement

**Probabilité** : Très faible
**Impact** : Faible

**Mitigation** :
- Vérifier que les classes `.radio-group` et `.radio-label` existent dans le CSS
- Référence : Perforation des sièges (lignes 394-405 dans index.html) utilise déjà des radio buttons
- Copier le format exact

---

## 📊 Métriques Prévisionnelles

**Velocity Sprint #10** : 5 SP
**Durée estimée** : ~2h30
**Nombre de tâches** : 17 tâches techniques
**Fichiers modifiés** : 5 fichiers (api.js, state.js, config.js, app.js, index.html)

**Comparaison** :
- Sprint #9 : 6 SP en ~3h30 (2 US)
- Sprint #10 : 5 SP en ~2h30 (4 US)

**Conclusion** : Sprint réaliste, 4 US de petite taille (1-2 SP chacune)

---

## ✅ Critères de Succès

### US-038
- ✅ Dropdowns affichent "Black Onyx" au lieu de "BlackOnyx_5557_Suede_Premium"
- ✅ Aucun code numérique visible
- ✅ Conversion CamelCase → espaces fonctionnelle

### US-035
- ✅ Ultra-Suede Ribbon visible dans section Sièges (pas Matériaux)
- ✅ Ordre correct : Cuir → Ultra-Suede → Stitching → Matériau Central → Perforation → Ceintures

### US-036
- ✅ Dropdown Stitching visible et fonctionnel
- ✅ Options extraites depuis XML
- ✅ Payload API contient `Interior_Stitching.XXX`
- ✅ Synchronisation Prestige fonctionnelle

### US-037
- ✅ 2 radio buttons visibles (Suede / Cuir)
- ✅ Sélection change le payload API
- ✅ Synchronisation Prestige fonctionnelle

---

## 📝 Actions Post-Planning

- [x] Sprint Backlog créé (`sprints/sprint-10/sprint-backlog.md`)
- [x] Sprint Planning Notes documentées (ce fichier)
- [ ] Kanban Board initialisé (artifacts/kanban-board.md)
- [ ] COORDINATOR lance DEV pour développement US-038
- [ ] QA prépare plan de tests (4 US à tester)

---

## 💬 Questions / Réponses

**Q1** : Pourquoi US-038 est HIGH PRIORITY alors qu'elle est 1 SP seulement ?
**R1** : Bug affectant l'UX globalement (tous les dropdowns intérieur). Corriger en premier évite que Stitching (US-036) hérite du même problème.

**Q2** : Pourquoi ne pas développer en parallèle pour aller plus vite ?
**R2** : Les 4 US modifient les mêmes fichiers (api.js, app.js, index.html). Développement séquentiel évite conflits Git et garantit cohérence.

**Q3** : Stitching doit-il être formaté sans suffixe _Premium ?
**R3** : Oui, la règle de formatage s'applique à TOUS les dropdowns intérieur. US-038 corrige le formatage global, US-036 bénéficie de cette correction.

---

**Rédigé par** : ARCH
**Validé par** : PO, COORDINATOR
**Date** : 06/12/2025
**Status** : ✅ VALIDÉ - Prêt pour développement
