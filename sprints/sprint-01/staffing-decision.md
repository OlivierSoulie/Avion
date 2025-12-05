# Décision de Staffing - Sprint #1

**Projet** : 005-Configurateur_Daher
**Sprint** : Sprint #1 (MVP Configurateur Web)
**Date** : 02/12/2025
**COORDINATOR** : Claude

---

## 📊 Analyse du Sprint

### Sprint Goal
"Permettre à un utilisateur de configurer et visualiser des rendus TBM via une interface web locale moderne, sans installation Python, avec toutes les fonctionnalités du script original."

### Métriques Sprint
- **Story Points** : 48 SP
- **User Stories** : 10 US
- **Tâches techniques** : 61 tâches
- **Estimation** : ~32h30min dev pur, ~40-45h avec buffer
- **Durée recommandée** : 5-7 jours ouvrés

---

## 🔍 Analyse des domaines techniques

### Domaines identifiés dans le Sprint Backlog

**Frontend (HTML/CSS/JS pur)**
- US-001 : Architecture HTML/CSS/JS de base
- US-002 : Viewport avec carrousel d'images
- US-003 : Panel de contrôles - Sélecteurs principaux
- US-004 : Gestion de l'immatriculation
- US-008 : Appel API automatique sur changements
- US-009 : États de chargement et feedbacks UX
- US-010 : Gestion des erreurs API

**Logique métier (JavaScript)**
- US-006 : Logique de calcul des positions (port Python → JS)
- US-007 : Gestion des couleurs et matériaux (port Python → JS)

**Intégration API**
- US-005 : Intégration API Lumiscaphe (API REST externe)

**Backend** : ❌ Aucun (pas de serveur Node/Flask)
**Database** : ❌ Aucune (pas de base de données locale)

### Conclusion analyse
- Projet **100% Frontend** (HTML/CSS/JavaScript)
- Pas de backend serveur
- Pas de base de données
- API externe (Lumiscaphe) - intégration simple via fetch()
- **1 DEV Généraliste** suffit (full-stack frontend)

---

## 👥 Décision de Staffing

### Configuration choisie : **Équipe minimale (6 agents)**

**Noyau fixe (3 agents)**
- ✅ **PO** (Product Owner) - Gestion backlog, validation Sprint Review
- ✅ **ARCH** (Architecte/Scrum Master) - Architecture technique, facilitation cérémonies
- ✅ **COORDINATOR** (Moi) - Coordination opérationnelle quotidienne

**Agents opérationnels (3 agents)**
- ✅ **1 DEV-Généraliste** (Full-stack Frontend)
  - Compétences : HTML5, CSS3, JavaScript ES6+, API REST
  - Responsabilité : Développer les 10 US
  - Charge : ~40-45h sur 5-7 jours

- ✅ **1 QA-Fonctionnel** (Quality Assurance)
  - Compétences : Tests manuels, tests cross-browser, validation critères d'acceptation
  - Responsabilité : Tester toutes les US après développement
  - Tests : Fonctionnels, responsive, compatibilité navigateurs

- ✅ **1 DOC** (Documentation)
  - Compétences : Rédaction documentation utilisateur, captures d'écran
  - Responsabilité : Documenter l'utilisation du configurateur web
  - Livrable : Guide utilisateur, README

---

## 📋 Justification de la configuration

### Pourquoi 1 seul DEV ?
- ✅ Projet frontend pur (pas de multiples domaines techniques)
- ✅ Pas de dépendances complexes entre tâches (séquentiel possible)
- ✅ Architecture simple (Vanilla JS, pas de framework)
- ✅ ~40-45h de dev sur 5-7 jours = faisable pour 1 DEV
- ✅ Cohérence du code (1 seul style de code)

### Pourquoi 1 seul QA ?
- ✅ Tests manuels uniquement (Sprint #1 MVP)
- ✅ Pas de tests automatisés requis
- ✅ QA-Fonctionnel couvre tous les besoins (UI, UX, compatibilité)
- ✅ Pas de besoins spécifiques performance ou sécurité critiques

### Pourquoi 1 seul DOC ?
- ✅ Documentation utilisateur simple (guide d'utilisation)
- ✅ Pas de documentation API complexe (API externe)
- ✅ 1 DOC suffit pour un configurateur web

### Alternatives rejetées

**2 DEV (Frontend + Backend)** : ❌ Rejeté
- Pas de backend dans ce projet
- Surcharge inutile

**2 QA (Fonctionnel + Performance)** : ❌ Rejeté
- Pas de critères de performance explicites pour MVP
- Tests performance possibles en Sprint #2 si besoin

**Plus de DOC** : ❌ Rejeté
- Projet simple, 1 DOC suffit

---

## 📅 Plan d'assignation des tâches

### Phase 1 : Foundation (Jour 1)
- **DEV-Généraliste** : US-001 → US-002
- **QA-Fonctionnel** : En attente (préparation plan de tests)
- **DOC** : En attente (préparation template documentation)

### Phase 2 : Controls (Jour 2)
- **DEV-Généraliste** : US-003 → US-004
- **QA-Fonctionnel** : Tester US-001 et US-002
- **DOC** : Documenter US-001 et US-002 validées

### Phase 3 : Logic (Jour 3)
- **DEV-Généraliste** : US-006 → US-007
- **QA-Fonctionnel** : Tester US-003 et US-004
- **DOC** : Documenter US-003 et US-004 validées

### Phase 4 : Integration (Jour 4)
- **DEV-Généraliste** : US-005 → US-008
- **QA-Fonctionnel** : Tester US-006 et US-007
- **DOC** : Documenter US-006 et US-007 validées

### Phase 5 : Polish (Jour 5)
- **DEV-Généraliste** : US-009 → US-010
- **QA-Fonctionnel** : Tester US-005 et US-008
- **DOC** : Documenter US-005 et US-008 validées

### Phase 6 : Finalisation (Jour 6-7)
- **DEV-Généraliste** : Corrections bugs QA si nécessaire
- **QA-Fonctionnel** : Tester US-009 et US-010, tests de régression complets
- **DOC** : Finaliser documentation complète, Sprint Review

---

## 🔄 Workflow opérationnel

### Daily Scrum (quotidien, 15 min)
**Format** : Tour de table rapide
- DEV-Généraliste : Progression, prochaine tâche, blocages
- QA-Fonctionnel : Tests effectués, bugs trouvés, prochains tests
- DOC : Documentation avancée, prochaines sections
- **COORDINATOR** : Synchronisation, résolution blocages

### Boucle feedback DEV ↔ QA
1. DEV termine US → Passe en "Testing" (Kanban)
2. QA teste US
   - ✅ PASS → US passe en "Done"
   - ❌ FAIL → US retourne en "In Progress" vers DEV
3. Max 3 itérations DEV ↔ QA par US
4. COORDINATOR coordonne la boucle

### Documentation
- DOC documente les US validées par QA
- Captures d'écran, guide utilisateur
- Finalisation en fin de sprint

---

## ✅ Validation de la décision

**Contraintes minimales respectées** :
- ✅ Minimum 1 DEV (1 DEV-Généraliste)
- ✅ Minimum 1 QA (1 QA-Fonctionnel)
- ✅ Minimum 1 DOC (1 DOC)
- ✅ Noyau fixe : PO + ARCH + COORDINATOR

**Configuration finale** : **6 agents** (minimale et adaptée)

---

## 🎯 Prochaines étapes

1. ✅ Décision de staffing documentée
2. ▶️ Lancer DEV-Généraliste sur US-001 (Tâche T1.1)
3. Daily Scrum après 1h de développement
4. Continuer orchestration complète du sprint

---

**Décision validée par** : COORDINATOR (Claude)
**Date** : 02/12/2025
**Équipe Sprint #1** : 6 agents (PO + ARCH + COORDINATOR + DEV-Généraliste + QA-Fonctionnel + DOC)
