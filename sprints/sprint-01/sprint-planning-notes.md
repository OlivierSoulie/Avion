# Sprint Planning Notes - Sprint #1

**Projet** : 005-Configurateur_Daher
**Date** : 02/12/2025
**Participants** : PO (Claude), ARCH (Claude), Stakeholder (Olivier Soulie)
**Durée** : Automatisée via processus Scrumban

---

## 📋 Ordre du jour

1. Revue Product Backlog
2. Définition Sprint Goal
3. Sélection User Stories
4. Décomposition en tâches techniques
5. Validation capacité
6. Validation DoD
7. Engagement équipe

---

## 🎯 Sprint Goal

**"Permettre à un utilisateur de configurer et visualiser des rendus TBM via une interface web locale moderne, sans installation Python, avec toutes les fonctionnalités du script original."**

---

## 📊 User Stories sélectionnées

### User Stories engagées (10 US, 48 SP)

1. **[US-001]** Architecture HTML/CSS/JS de base (3 SP) - **Critique**
2. **[US-002]** Viewport avec carrousel d'images (5 SP) - **Critique**
3. **[US-003]** Panel de contrôles - Sélecteurs principaux (8 SP) - **Critique**
4. **[US-004]** Gestion de l'immatriculation (3 SP) - **Critique**
5. **[US-005]** Intégration API Lumiscaphe (8 SP) - **Critique**
6. **[US-006]** Logique de calcul des positions (5 SP) - **Haute**
7. **[US-007]** Gestion des couleurs et matériaux (5 SP) - **Haute**
8. **[US-008]** Appel API automatique sur changements (3 SP) - **Haute**
9. **[US-009]** États de chargement et feedbacks UX (3 SP) - **Haute**
10. **[US-010]** Gestion des erreurs API (3 SP) - **Moyenne**

**Justification** : Toutes les US sont nécessaires pour un MVP fonctionnel end-to-end.

---

## 🏗️ Décisions d'architecture

### Stack technique validée

**Frontend**
- HTML5 (structure sémantique)
- CSS3 Custom (Flexbox/Grid, pas de framework)
- JavaScript ES6+ (modules natifs, pas de build)

**Rationale** :
- ✅ Contrainte Stakeholder : "Lancement direct via index.html"
- ✅ Moderne et maintenable
- ✅ Pas de complexité de build
- ✅ Performance native navigateur

**API**
- API REST Lumiscaphe : `https://wr-daher.lumiscaphe.com`
- Endpoint : `POST /Snapshot`
- Format : JSON

**Alternatives rejetées**
- ❌ React/Vue : Trop complexe, nécessite build
- ❌ Tailwind CSS : CDN trop lourd, pas nécessaire
- ❌ TypeScript : Nécessite compilation
- ❌ Backend local (Node/Flask) : Pas requis pour MVP

### Structure de fichiers

```
code/
├── index.html
├── styles/
│   ├── main.css          # Variables, reset, layout
│   ├── viewport.css      # Carrousel
│   ├── controls.css      # Panel contrôles
│   └── animations.css    # Loaders, transitions
└── js/
    ├── app.js            # Orchestration
    ├── config.js         # Constantes
    ├── state.js          # État global
    ├── api.js            # Intégration API
    ├── positioning.js    # Calculs positions
    ├── colors.js         # Calculs couleurs
    └── ui.js             # Gestion UI
```

**Pattern** : MVC simplifié avec State Management

---

## 🔨 Décomposition technique

**Total** : 61 tâches techniques réparties sur 10 US

**Estimation totale** : ~32h30min de développement pur
- Avec buffer (tests, bugs, intégration) : ~40-45h réelles
- **Durée recommandée** : 5-7 jours ouvrés

### Ordre de développement

**Phase 1 : Foundation** (Jour 1)
- US-001 : Architecture de base (~2h15)
- US-002 : Viewport + carrousel (~3h30)

**Phase 2 : Controls** (Jour 2)
- US-003 : Panel de contrôles (~5h30)
- US-004 : Immatriculation (~1h25)

**Phase 3 : Logic** (Jour 3)
- US-006 : Calculs positions (~3h45)
- US-007 : Calculs couleurs (~4h)

**Phase 4 : Integration** (Jour 4)
- US-005 : API Lumiscaphe (~5h)
- US-008 : Auto-render (~1h50)

**Phase 5 : Polish** (Jour 5)
- US-009 : Feedbacks UX (~2h20)
- US-010 : Gestion erreurs (~2h45)

---

## 📝 Clarifications techniques

### Questions posées durant planning

**Q1** : XML doit être géré côté frontend ou backend ?
**R** : API gère tout. Frontend n'a pas besoin du XML.

**Q2** : Utiliser un framework CSS ou custom ?
**R** : CSS custom. Pas de surcharge inutile pour ce projet.

**Q3** : Build step ou pas ?
**R** : Pas de build. Modules ES6 natifs seulement.

**Q4** : localStorage pour historique configs ?
**R** : Pas pour Sprint #1. Prévu Sprint #2 (US-012).

**Q5** : Tests automatisés ou manuels ?
**R** : Manuels pour Sprint #1. Automatisés si besoin post-MVP.

---

## 🚧 Risques et dépendances

### Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| API Lumiscaphe lente (>10s) | Moyenne | Moyen | Loader + timeout + messages clairs |
| Calculs positions incorrects | Faible | Haut | Tests unitaires vs script Python |
| CORS API externe | Faible | Haut | Tester rapidement (US-005 Jour 4) |
| Débordement temps (>5 jours) | Moyenne | Moyen | Prioriser US critiques, reporter US-010 si besoin |

### Dépendances

- **US-005 dépend de US-006 et US-007** : API ne peut pas fonctionner sans calculs positions/couleurs
- **US-008 dépend de US-005** : Auto-render nécessite fonction API fonctionnelle
- **US-009 et US-010 dépendent de US-005** : Feedbacks nécessitent états API

**Impact planning** : Développement séquentiel par phase obligatoire.

---

## ✅ Definition of Done - Rappels

**Critères obligatoires** (extrait DoD) :

- [ ] Code fonctionnel testé manuellement
- [ ] Tous critères d'acceptation US remplis
- [ ] Pas d'erreurs console
- [ ] Testé Chrome, Firefox, Edge
- [ ] Responsive (desktop + tablette)
- [ ] Code commenté (fonctions complexes)
- [ ] Rapport QA rédigé
- [ ] Validation PO en Sprint Review

**Document complet** : `artifacts/definition-of-done.md`

---

## 🎯 Capacité et engagement

### Capacité disponible
- **Équipe** : 1 développeur full-stack
- **Disponibilité** : [À confirmer avec Stakeholder]
- **Vélocité cible** : 48 SP

### Engagement
- ✅ ARCH valide l'architecture technique
- ✅ DEV s'engage sur les 10 US (48 SP)
- ✅ QA s'engage sur tests manuels complets
- ✅ PO valide la sélection et priorisation

---

## 📋 Actions post-planning

### Actions immédiates

**DEV**
- [ ] Lire `docs/architecture.md` en détail
- [ ] Lire `sprints/sprint-01/sprint-backlog.md`
- [ ] Commencer US-001 (Tâche T1.1)
- [ ] Daily Scrum après 1h de dev

**QA**
- [ ] Lire Product Backlog US-001 à US-010
- [ ] Préparer plan de tests basé sur critères d'acceptation
- [ ] Identifier scénarios de test critiques

**DOC**
- [ ] Préparer template documentation utilisateur
- [ ] Planifier captures d'écran pour guide

**ARCH**
- [ ] Disponible pour questions techniques DEV
- [ ] Monitoring progression (Daily Scrums)

---

## 🔄 Ceremonies suivantes

### Daily Scrum
- **Fréquence** : Après chaque 1h de développement
- **Format** : 3 questions
  1. Qu'ai-je fait depuis le dernier Daily ?
  2. Que vais-je faire maintenant ?
  3. Y a-t-il des blocages ?

### Sprint Review
- **Quand** : Fin Sprint (après US-010 terminée)
- **Participants** : PO, ARCH, DEV, QA, Stakeholder
- **Objectif** : Démo fonctionnalités, validation Sprint Goal

### Sprint Retrospective
- **Quand** : Après Sprint Review
- **Participants** : PO, ARCH, DEV, QA
- **Objectif** : Identifier améliorations processus

---

## 📊 Métriques Sprint

**À tracker** :
- Vélocité réelle vs. cible (48 SP)
- Nombre de bugs détectés par QA
- Nombre d'itérations DEV ↔ QA par US
- Temps moyen par tâche vs. estimation
- Taux d'acceptation US en Sprint Review

**Objectifs** :
- Vélocité réelle ≥ 80% de cible (≥38 SP)
- Bugs critiques = 0 en fin de sprint
- Itérations DEV ↔ QA < 3 par US
- Taux d'acceptation Sprint Review ≥ 90%

---

## 🎉 Conclusion Sprint Planning

**Statut** : ✅ Sprint Planning validé et complet

**Prochaine étape** : Lancer DEV sur US-001

**Documents créés** :
- ✅ `docs/architecture.md`
- ✅ `sprints/sprint-01/sprint-backlog.md`
- ✅ `sprints/sprint-01/sprint-planning-notes.md` (ce fichier)

**Kanban Board** : À mettre à jour avec US en "To Do"

---

**Sprint Planning terminé** : 02/12/2025
**Sprint commence** : 02/12/2025
**Sprint se termine** : [À définir selon disponibilité]

---

**Signature ARCH** : ✅ Claude (Architecture validée)
**Signature PO** : ✅ Claude (Backlog validé)
**Signature Stakeholder** : [En attente]
