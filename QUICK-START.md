# Guide de Demarrage - Configurateur_Daher

**Projet** : 005-Configurateur_Daher

---

## Etape 1 : Demarrer avec le Product Owner

1. Ouvrir Claude (conversation nouvelle)
2. Copier le contenu de `agents/PO-prompt.md`
3. Coller dans Claude
4. Decrire votre projet :
   - Objectif du projet
   - Fonctionnalites principales
   - Utilisateurs cibles
   - Contraintes techniques

Le PO va :
- Poser des questions pour clarifier
- Creer les premieres User Stories
- Mettre a jour `artifacts/product-backlog.md`

---

## Etape 2 : Sprint Planning

Une fois 3-5 User Stories creees :

1. Ouvrir nouvelle conversation Claude
2. Copier le contenu de `agents/ARCH-prompt.md`
3. Dire : "Je veux lancer un Sprint Planning"
4. ARCH va :
   - Faciliter le Sprint Planning
   - Aider a decomposer les US en taches
   - Definir le Sprint Goal
   - Creer le Sprint Backlog

---

## Etape 3 : Developpement

### Increment 1 (1h15)

**DEV (1h)** :
1. Ouvrir conversation Claude avec `agents/DEV-prompt.md`
2. Donner la spec technique (creee par ARCH)
3. DEV code la fonctionnalite

**Daily Scrum (5min)** :
1. Conversation avec ARCH
2. Partager avancement DEV/QA/DOC

**QA (10min)** :
1. Ouvrir conversation Claude avec `agents/QA-prompt.md`
2. Donner le code a tester
3. QA execute les tests
4. Si bugs → retour DEV (max 3 iterations)

**Validation** : Checkpoint OK ? Continuer sinon escalade ARCH

### Repeter pour Increment 2, 3, etc.

---

## Etape 4 : Sprint Review

Apres 4-6h de developpement :

1. Conversation avec ARCH + PO
2. Demo des fonctionnalites terminees
3. Validation PO
4. Mise a jour Product Backlog

---

## Etape 5 : Sprint Retrospective

1. Conversation avec ARCH
2. Format Start/Stop/Continue
3. Identifier 2-3 actions d'amelioration
4. Documenter dans sprint report

---

## Fichiers Importants

- **Product Backlog** : `artifacts/product-backlog.md`
- **Kanban Board** : `artifacts/kanban-board.md`
- **Prompts Agents** : `agents/*.md`
- **Metriques** : `metrics/metrics-dashboard.md`

---

**Bon premier sprint **
