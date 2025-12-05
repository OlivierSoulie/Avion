# Index de la Documentation - Configurateur TBM Daher

**Projet** : 005-Configurateur_Daher
**Version** : 1.0
**Dernière mise à jour** : 05/12/2025

---

## Vue d'ensemble

Ce document référence toute la documentation du projet Configurateur TBM Daher, organisée par catégorie et par user story.

---

## Documentation principale

### README général
- **[README.md](../README.md)** - Vue d'ensemble du projet
  - Quick Start
  - Fonctionnalités implémentées
  - Structure du projet
  - Architecture technique
  - Changelog
  - Métriques

### Règles de développement
- **[CLAUDE.md](../CLAUDE.md)** - Instructions pour les développeurs
  - Sources de vérité (XML + Python)
  - Système de couleurs de l'immatriculation
  - Règles de développement
  - Changelog des bugs fixes

---

## Documentation par User Story

### US-004 : Gestion de l'immatriculation

**Fichiers** :
1. **[README_US004.md](../README_US004.md)** - Documentation principale
   - Quick Start
   - Fichiers modifiés
   - Critères d'acceptation
   - Architecture
   - Tests

2. **[DEV_REPORT_US004.md](../DEV_REPORT_US004.md)** - Rapport développeur
   - Résumé exécutif
   - Validation des critères
   - Détails des modifications

3. **[TESTING_GUIDE_US004.md](../TESTING_GUIDE_US004.md)** - Guide de test
   - Tests automatisés
   - Tests manuels
   - Matrice de test

4. **[FILES_CREATED_US004.md](../FILES_CREATED_US004.md)** - Liste des fichiers créés

**Statut** : ✅ Complété (03/12/2025)

---

### US-027 : Configuration Intérieur Personnalisée

**Fichiers** :
1. **[USER_GUIDE_US027.md](USER_GUIDE_US027.md)** - Guide utilisateur **[NOUVEAU]**
   - Vue d'ensemble
   - Comment accéder à la configuration
   - Utiliser un template Prestige
   - Personnaliser l'intérieur (10 paramètres)
   - Workflow recommandé
   - Exemples d'utilisation
   - Dépannage
   - FAQ

2. **[TECHNICAL_DOC_US027.md](../sprints/sprint-06/TECHNICAL_DOC_US027.md)** - Documentation technique **[NOUVEAU]**
   - Architecture implémentée
   - Fichiers modifiés (détail complet)
   - Fonctions clés
   - Format des données
   - Flux de données
   - Points d'attention pour la maintenance
   - Tests et validation

**Statut** : ✅ Complété (05/12/2025)
**Tests QA** : 60/60 PASS

---

## Documentation technique

### Architecture
- **[architecture.md](architecture.md)** - Architecture système
  - Vue d'ensemble
  - Modules JavaScript
  - Flux de données
  - Technologies utilisées

### API Lumiscaphe
- **[IMPLEMENTATION-XML-CAMERA-GROUP.md](IMPLEMENTATION-XML-CAMERA-GROUP.md)** - Intégration camera groups
  - Téléchargement XML
  - Extraction camera group ID
  - Tests

### Tests
- **[Test-Guide.md](Test-Guide.md)** - Guide de test général
- **[SPRINT-2-TEST-GUIDE.md](SPRINT-2-TEST-GUIDE.md)** - Guide de test Sprint 2

---

## Documentation des Sprints

### Sprint 1-5
- **[sprints/sprint-01/](../sprints/sprint-01/)** - Documentation Sprint 1
- **[sprints/sprint-02/](../sprints/sprint-02/)** - Documentation Sprint 2
- (etc.)

### Sprint 6 (US-027)
- **[sprints/sprint-06/sprint-backlog.md](../sprints/sprint-06/sprint-backlog.md)** - Sprint Backlog
  - Sprint Goal
  - Tâches détaillées (T1-T13)
  - Ordre d'exécution
  - Notes architecturales

- **[sprints/sprint-06/TECHNICAL_DOC_US027.md](../sprints/sprint-06/TECHNICAL_DOC_US027.md)** - Documentation technique US-027
  - Architecture implémentée
  - Fichiers modifiés
  - Fonctions clés
  - Maintenance future

---

## Artefacts Scrum

### Product Backlog
- **[artifacts/product-backlog.md](../artifacts/product-backlog.md)** - Backlog produit complet
  - Liste de toutes les User Stories
  - Statut d'avancement
  - Critères d'acceptation

### Definition of Done
- **[artifacts/definition-of-done.md](../artifacts/definition-of-done.md)** - Critères DoD
  - Code fonctionnel
  - Tests
  - Documentation
  - Validation

### Kanban Board
- **[artifacts/kanban-board.md](../artifacts/kanban-board.md)** - Board Scrumban
  - To Do
  - In Progress
  - Testing
  - Done

---

## Guides par thème

### Guide utilisateur

#### Configuration de base
1. **Lancer l'application** : Voir [README.md#Quick-Start](../README.md#quick-start)
2. **Premier rendu** : Voir [README.md#Premier-rendu](../README.md#premier-rendu)

#### Configuration extérieure
- Immatriculation : [README_US004.md](../README_US004.md)
- Schéma peinture : [README.md#Extérieur](../README.md#extérieur)
- Décor : [README.md#Extérieur](../README.md#extérieur)

#### Configuration intérieure **[NOUVEAU]**
- **Guide complet** : [USER_GUIDE_US027.md](USER_GUIDE_US027.md)
  - Accéder à la configuration
  - Utiliser les prestiges
  - Personnaliser les 10 paramètres
  - Exemples d'utilisation
  - FAQ

#### Fonctionnalités avancées
- Mode plein écran : [README.md#US-020](../README.md#us-020--mode-plein-écran)
- Export JSON : [README.md#US-021](../README.md#us-021--export-json)
- Vues Extérieur/Intérieur : [README.md#US-022](../README.md#us-022--vue-extérieurintérieur)

---

### Guide développeur

#### Démarrage
1. **Structure du projet** : [README.md#Structure-du-projet](../README.md#structure-du-projet)
2. **Architecture technique** : [architecture.md](architecture.md)
3. **Règles de développement** : [CLAUDE.md](../CLAUDE.md)

#### Implémentation US-027
1. **Documentation technique** : [TECHNICAL_DOC_US027.md](../sprints/sprint-06/TECHNICAL_DOC_US027.md)
   - Architecture implémentée
   - Fichiers modifiés (code complet)
   - Fonctions clés
   - Format des données

2. **Sprint Backlog** : [sprint-backlog.md](../sprints/sprint-06/sprint-backlog.md)
   - Tâches détaillées (Layer 1-9)
   - Ordre d'exécution
   - Risques et dépendances

3. **Points d'attention** :
   - Ordre des parties config string
   - Cache XML
   - Export getDatabaseXML()
   - Nommage IDs HTML vs state
   - Performance

#### Maintenance
- **Ajouter un paramètre intérieur** : [TECHNICAL_DOC_US027.md#Maintenance-future](../sprints/sprint-06/TECHNICAL_DOC_US027.md#maintenance-future)
- **Modifier une liste** : [TECHNICAL_DOC_US027.md#Comment-modifier-une-liste](../sprints/sprint-06/TECHNICAL_DOC_US027.md#comment-modifier-une-liste-existante)
- **Débugger** : [TECHNICAL_DOC_US027.md#Comment-débugger](../sprints/sprint-06/TECHNICAL_DOC_US027.md#comment-débugger-un-problème-de-prestige)

---

### Guide QA/Testeur

#### Tests fonctionnels
- **US-004** : [TESTING_GUIDE_US004.md](../TESTING_GUIDE_US004.md)
  - Tests automatisés
  - 10 tests manuels détaillés

- **US-027** : [TECHNICAL_DOC_US027.md#Tests-et-validation](../sprints/sprint-06/TECHNICAL_DOC_US027.md#tests-et-validation)
  - 60 critères testés (60/60 PASS)
  - Tests UI, Prestige, Personnalisation, Payload, Cas limites

#### Rapports de test
- Sprint 2 : [SPRINT-2-TEST-GUIDE.md](SPRINT-2-TEST-GUIDE.md)
- Sprint 6 : [sprint-backlog.md#Tests](../sprints/sprint-06/sprint-backlog.md#tests-et-validation)

---

## Changeset et rapports

### Changesets
- **[CHANGESET-03-12-2025.md](../CHANGESET-03-12-2025.md)** - Modifications du 03/12/2025
- **[BUG_FIXES_SUMMARY.md](../BUG_FIXES_SUMMARY.md)** - Résumé des corrections de bugs

### Rapports de développement
- **[DEV_REPORT_US004.md](../DEV_REPORT_US004.md)** - Rapport US-004
- **[RESUME-MODIFICATIONS.md](RESUME-MODIFICATIONS.md)** - Résumé des modifications

---

## Documentation par rôle

### Pour le Product Owner
1. [Product Backlog](../artifacts/product-backlog.md) - État d'avancement
2. [README.md](../README.md) - Fonctionnalités implémentées
3. [USER_GUIDE_US027.md](USER_GUIDE_US027.md) - Dernière fonctionnalité (US-027)

### Pour l'Architecte
1. [architecture.md](architecture.md) - Architecture système
2. [CLAUDE.md](../CLAUDE.md) - Règles de développement
3. [TECHNICAL_DOC_US027.md](../sprints/sprint-06/TECHNICAL_DOC_US027.md) - Architecture US-027

### Pour le Développeur
1. [CLAUDE.md](../CLAUDE.md) - Sources de vérité + règles
2. [TECHNICAL_DOC_US027.md](../sprints/sprint-06/TECHNICAL_DOC_US027.md) - Implémentation US-027
3. [sprint-backlog.md](../sprints/sprint-06/sprint-backlog.md) - Tâches détaillées

### Pour le QA Tester
1. [TESTING_GUIDE_US004.md](../TESTING_GUIDE_US004.md) - Tests US-004
2. [TECHNICAL_DOC_US027.md#Tests](../sprints/sprint-06/TECHNICAL_DOC_US027.md#tests-et-validation) - Tests US-027
3. [Definition of Done](../artifacts/definition-of-done.md) - Critères de validation

### Pour l'Utilisateur final
1. [README.md#Quick-Start](../README.md#quick-start) - Démarrage rapide
2. [USER_GUIDE_US027.md](USER_GUIDE_US027.md) - Configuration intérieur
3. [README.md#Configuration](../README.md#configuration-de-lapplication) - Paramètres disponibles

---

## Liens rapides

### Documentation US-027 (Nouveau !)
- [Guide utilisateur US-027](USER_GUIDE_US027.md) - Comment utiliser les 10 paramètres intérieurs
- [Documentation technique US-027](../sprints/sprint-06/TECHNICAL_DOC_US027.md) - Implémentation complète

### Fichiers principaux
- [README.md](../README.md) - Vue d'ensemble projet
- [CLAUDE.md](../CLAUDE.md) - Règles de développement
- [Product Backlog](../artifacts/product-backlog.md) - État d'avancement

### Code source
- [code/index.html](../code/index.html) - Interface principale
- [code/js/app.js](../code/js/app.js) - Point d'entrée
- [code/js/api.js](../code/js/api.js) - Intégration API
- [code/js/config.js](../code/js/config.js) - Configuration + listes US-027

---

## Statistiques de documentation

### Fichiers de documentation
- **Total** : 20+ fichiers
- **Guides utilisateur** : 2
- **Guides techniques** : 5
- **Guides de test** : 3
- **Rapports** : 4
- **Artefacts Scrum** : 3

### Documentation US-027 (Sprint 6)
- **Guide utilisateur** : 1 fichier (350+ lignes)
- **Documentation technique** : 1 fichier (900+ lignes)
- **Sprint Backlog** : 1 fichier (950+ lignes)
- **Total** : 2200+ lignes de documentation

### Langues
- **Français** : 100% de la documentation
- **Commentaires code** : Français + Anglais (technique)

---

## Maintenance de la documentation

### Mise à jour de la documentation

Lors de l'ajout d'une nouvelle User Story :

1. **Créer la documentation technique** : `sprints/sprint-XX/TECHNICAL_DOC_USXXX.md`
2. **Créer le guide utilisateur** (si applicable) : `docs/USER_GUIDE_USXXX.md`
3. **Mettre à jour README.md** : Ajouter dans "Fonctionnalités implémentées"
4. **Mettre à jour ce fichier** : Ajouter dans "Documentation par User Story"
5. **Mettre à jour Product Backlog** : Marquer critères [x]
6. **Créer/Mettre à jour Sprint Backlog** : `sprints/sprint-XX/sprint-backlog.md`

### Conventions de nommage

- **Guides utilisateur** : `USER_GUIDE_USXXX.md` (dans `docs/`)
- **Documentation technique** : `TECHNICAL_DOC_USXXX.md` (dans `sprints/sprint-XX/`)
- **Rapports développeur** : `DEV_REPORT_USXXX.md` (racine)
- **Guides de test** : `TESTING_GUIDE_USXXX.md` (racine)

---

## Recherche dans la documentation

### Par mot-clé

| Mot-clé | Documents pertinents |
|---------|---------------------|
| **Configuration intérieur** | USER_GUIDE_US027.md, TECHNICAL_DOC_US027.md |
| **Prestige** | USER_GUIDE_US027.md, sprint-backlog.md (Sprint 6) |
| **Immatriculation** | README_US004.md, CLAUDE.md |
| **API Lumiscaphe** | architecture.md, api.js |
| **Couleurs** | CLAUDE.md, colors.js |
| **Tests** | TESTING_GUIDE_US004.md, TECHNICAL_DOC_US027.md |
| **Architecture** | architecture.md, TECHNICAL_DOC_US027.md |
| **Maintenance** | TECHNICAL_DOC_US027.md#Maintenance-future |

### Par fonctionnalité

| Fonctionnalité | Documentation |
|---------------|---------------|
| **10 paramètres intérieurs** | USER_GUIDE_US027.md |
| **Sélection Prestige** | USER_GUIDE_US027.md, TECHNICAL_DOC_US027.md |
| **Parsing XML** | TECHNICAL_DOC_US027.md, IMPLEMENTATION-XML-CAMERA-GROUP.md |
| **Payload API** | TECHNICAL_DOC_US027.md, architecture.md |
| **Event listeners** | TECHNICAL_DOC_US027.md, sprint-backlog.md |

---

## Contact et support

Pour toute question sur la documentation :

1. **Consulter la FAQ** : [USER_GUIDE_US027.md#FAQ](USER_GUIDE_US027.md#questions-fréquentes-faq)
2. **Consulter les guides techniques** : Voir sections ci-dessus
3. **Consulter le Product Backlog** : [artifacts/product-backlog.md](../artifacts/product-backlog.md)

---

## Version

**Version de l'index** : 1.0
**Dernière mise à jour** : 05/12/2025
**Documentation pour version projet** : 1.0
**Sprint actuel** : Sprint #6 (Terminé)

---

**Maintenu par** : Équipe Documentaliste (DOC)
**Framework** : Scrumban
