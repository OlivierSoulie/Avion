# Sprint Planning Report - Sprint #4

**Projet** : 005-Configurateur_Daher
**Date Sprint Planning** : 04/12/2025
**Sprint Duration** : À définir (estimation 4-6h dev)
**Sprint Goal** : Enrichir l'expérience utilisateur avec visualisation plein écran, export JSON, et navigation Ext/Int

**Participants** :
- PO : Claude (Product Owner Agent)
- ARCH : Claude (Architecte/Scrum Master Agent)
- DEV : À venir
- QA : À venir

---

## 📋 User Stories sélectionnées

### [US-020] Bouton plein écran pour les images
**Story Points** : 2 SP
**Priorité** : Haute
**Assigné** : DEV

**Objectif** : Permettre à l'utilisateur de voir les images en mode plein écran pour examiner les détails.

**Tâches techniques** :
1. [ ] Ajouter bouton "Plein écran" dans viewport HTML
2. [ ] Créer styles CSS modal overlay + animations
3. [ ] Implémenter `openFullscreen(imageIndex)` dans ui.js
4. [ ] Implémenter `closeFullscreen()` dans ui.js
5. [ ] Ajouter navigation prev/next en plein écran
6. [ ] Event listeners (ESC, click backdrop, flèches)
7. [ ] Tester sur Chrome, Firefox, Edge

**Fichiers impactés** :
- `code/index.html`
- `code/styles/main.css`
- `code/js/ui.js`

**Estimation temps** : 1-2h

---

### [US-021] Téléchargement de la requête JSON
**Story Points** : 2 SP
**Priorité** : Moyenne
**Assigné** : DEV

**Objectif** : Permettre le téléchargement du payload JSON pour debug et analyse.

**Tâches techniques** :
1. [ ] Ajouter bouton "Télécharger JSON" dans contrôles HTML
2. [ ] Stocker dernier payload généré dans state.js
3. [ ] Implémenter `downloadJSON()` dans app.js
4. [ ] Créer fonction helper `createDownloadLink()`
5. [ ] Générer nom fichier avec timestamp/config
6. [ ] Ajouter feedback toast "JSON téléchargé !"
7. [ ] Tester téléchargement et format JSON

**Fichiers impactés** :
- `code/index.html`
- `code/js/state.js`
- `code/js/app.js`

**Estimation temps** : 1h

---

### [US-022] Sélecteur de vue Extérieur / Intérieur
**Story Points** : 5 SP
**Priorité** : Haute
**Assigné** : DEV

**Objectif** : Basculer entre vues extérieures et intérieures de l'avion.

**Tâches techniques** :
1. [ ] Ajouter toggle "Extérieur / Intérieur" dans contrôles HTML
2. [ ] Créer styles CSS pour toggle actif/inactif
3. [ ] Ajouter `viewType: "exterior"` dans state.js (DEFAULT_CONFIG)
4. [ ] Modifier `findCameraGroupId()` pour accepter `viewType` param
   - Si `viewType === "interior"` → chercher `name="Interieur"` (fixe)
   - Si `viewType === "exterior"` → comportement actuel (par décor)
5. [ ] Modifier `buildPayload()` pour passer `viewType` à `findCameraGroupId()`
6. [ ] Ajouter event listener sur toggle dans app.js
7. [ ] Appeler `triggerRender()` au changement de vue
8. [ ] Tester basculement Ext ↔ Int avec différentes configs
9. [ ] Vérifier que l'état persiste lors des changements de config

**Fichiers impactés** :
- `code/index.html`
- `code/styles/main.css`
- `code/js/state.js`
- `code/js/api.js` (findCameraGroupId, buildPayload)
- `code/js/app.js`

**Estimation temps** : 2-3h

**Notes critiques** :
- ⚠️ Camera group intérieur = `name="Interieur"` (unique, pas de variation par décor)
- Vérifier existence dans XML avant implémentation

---

## 🎯 Ordre d'implémentation recommandé

**Séquence optimale** :
1. **US-021** (Téléchargement JSON) - 1h - Simple, pas de dépendances
2. **US-020** (Plein écran) - 1-2h - Simple, utilise carrousel existant
3. **US-022** (Sélecteur Ext/Int) - 2-3h - Plus complexe, modification API

**Total estimé** : 4-6h de développement

---

## ⚠️ Risques et mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Camera group "Interieur" introuvable dans XML | **Bloquant** | Faible | Vérifier XML avec Grep avant US-022 |
| Fullscreen API non supporté (vieux navigateurs) | Moyen | Faible | Fallback modal simple sans fullscreen |
| Gestion d'état viewType complexe | Faible | Moyenne | Tests unitaires sur state.js |
| Payload trop gros pour téléchargement | Faible | Très faible | Limiter à 10MB, afficher warning si > |

---

## ✅ Definition of Done (rappel)

Pour chaque US, vérifier :
- [ ] Code fonctionnel testé manuellement
- [ ] Code commenté (fonctions complexes)
- [ ] Pas d'erreurs console
- [ ] Testé sur Chrome, Firefox, Edge
- [ ] Responsive (desktop + tablette)
- [ ] Documentation utilisateur à jour (si applicable)
- [ ] Tests QA documentés et validés

---

## 📝 Notes Sprint Planning

**Consensus** :
- Sprint léger (9 SP) adapté pour 3 fonctionnalités indépendantes
- Ordre d'implémentation validé (quick wins d'abord)
- Camera group intérieur confirmé : `name="Interieur"`

**Actions immédiates** :
1. DEV : Vérifier existence camera group "Interieur" dans XML
2. DEV : Démarrer par US-021 (quick win)
3. ARCH : Suivre progression quotidienne (Daily Scrum)

**Questions ouvertes** :
- Aucune (toutes clarifiées avec PO)

---

**Sprint Planning approuvé par** :
- PO : ✅ User Stories validées
- ARCH : ✅ Plan technique validé
- DEV : ⏳ En attente de démarrage

**Date approbation** : 04/12/2025

---

**Prochaine étape** : DEV démarre l'implémentation
**Daily Scrum** : Après chaque US complétée
**Sprint Review** : À la fin des 3 US
