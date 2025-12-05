# Projet Configurateur_Daher

**Numero** : 005
**Nom** : Configurateur_Daher
**Date de creation** : 02/12/2025
**Framework** : Scrumban

---

## Description

[A completer : Description du projet, objectifs, stakeholders]

---

## Equipe

- **Product Owner (PO)** : Gestion Product Backlog, priorisation
- **Architecte / Scrum Master (ARCH)** : Architecture technique + facilitation ceremonies
- **Developpeur (DEV)** : Implementation
- **QA Tester (QA)** : Tests et validation
- **Documentaliste (DOC)** : Documentation

---

## Demarrage Rapide

### 1. Demarrer avec le Product Owner

Ouvrir une conversation avec Claude et copier le prompt :

```
[Copier le contenu de agents/PO-prompt.md]
```

Ensuite, decrire votre projet au PO pour creer les premieres User Stories.

### 2. Sprint Planning

Une fois le Product Backlog rempli, lancer le Sprint Planning avec ARCH.

### 3. Developpement

Suivre le workflow Scrumban :
- DEV implemente (1h)
- Daily Scrum (5min)
- QA teste (10min)
- Validation checkpoint
- Repeter

---

## Structure du Projet

```
005-Configurateur_Daher/
├── README.md                  (ce fichier)
├── artifacts/                  Artefacts Scrum
│   ├── product-backlog.md
│   ├── definition-of-done.md
│   └── kanban-board.md
├── agents/                     Prompts pour chaque agent
│   ├── PO-prompt.md
│   ├── ARCH-prompt.md
│   ├── DEV-prompt.md
│   ├── QA-prompt.md
│   └── DOC-prompt.md
├── sprints/                    Historique des sprints
│   ├── sprint-01/
│   └── sprint-02/
├── metrics/                    Metriques du projet
├── docs/                       Documentation
└── code/                       Code source
```

---

## Règles de Développement

### ⚠️ Sources de Vérité (CRITIQUE)

**IMPORTANT** : Ce projet a trois sources de vérité distinctes :

1. **L'API Lumiscpahe Webrender** : La doc de l'API
   - Documentation API complète : https://app.swaggerhub.com/apis/Lumiscaphe/WebRender/1.0
   - Documentation viewers : https://www.npmjs.com/package/@lumiscaphe/ng-viewer
   - **Règle** : Toujours utiliser les curl pour parser ces documents. 


2. **Pour les DONNÉES et la CONFIGURATION** : Le XML de l'API
   - Les valeurs de configuration (noms de schémas, couleurs, etc.)
   - Les paramètres de positionnement
   - Les groupes de caméras
   - **Règle** : Toujours utiliser les valeurs du XML, jamais les hardcoder

3. **Pour la LOGIQUE et l'IMPLÉMENTATION** : Le script Python `generate_full_render.py`
   - La structure des payloads API
   - Le nommage des textures et matériaux
   - Les algorithmes de calcul (positionnement, couleurs)
   - **Règle** : Le code JavaScript dans `code/js/` doit reproduire EXACTEMENT la logique du Python

**Processus en cas de bug ou nouvelle fonctionnalité** :
1. Vérifier d'abord le script Python `generate_full_render.py`
2. Comparer avec l'implémentation JavaScript
3. Le Python fait autorité : corriger le JS pour correspondre au Python
4. NE JAMAIS diverger entre Python et JavaScript

### 🎨 Système de couleurs de l'immatriculation

**Mapping styles → paires de couleurs** :
```
Paire 0 : A (slanted) OU F (straight) → même couleurs
Paire 1 : B (slanted) OU G (straight) → même couleurs
Paire 2 : C (slanted) OU H (straight) → même couleurs
Paire 3 : D (slanted) OU I (straight) → même couleurs
Paire 4 : E (slanted) OU J (straight) → même couleurs
```

**Format config XML** :
```
Exterior_PaintScheme.Tehuano_A-0_A-D_A-D_A-D_A-D
                             └─┬─┘└─┬─┘└─┬─┘└─┬─┘└─┬─┘
                          paire[0][1][2][3][4]
```

**Parsing des couleurs** :
- Chaque paire `X-Y` définit 2 zones
- Format couleur dans XML : `ZoneName-code-#hex1-#hex2-tag-...`
- **IMPORTANT** : Utiliser le **2ème code hex** (#hex2) = Code HTML Lumiscaphe

**Layers (couches de couleur) - INVERSION API** :
- ⚠️ **L'API Lumiscaphe inverse les layers !**
- Pour paire `A-D` :
  - **Layer 0** envoyé avec couleur Zone D (2ème valeur)
  - **Layer 1** envoyé avec couleur Zone A (1ère valeur)
- Pour paire `A-0` (pas de 2ème zone) :
  - **Layer 0** envoyé avec couleur null ou Zone A
  - **Layer 1** TOUJOURS envoyé avec couleur Zone A (même si zone = "0")

**Nommage des textures dans materialMultiLayers** :
- **Slanted (A-E)** : Utiliser `Style_A_Left_N` et `Style_A_Right_N` (AVEC Left/Right)
- **Straight (F-J)** : Utiliser `Style_F_N` (SANS Left/Right)

---

## Artefacts Scrumban

- **Product Backlog** : `artifacts/product-backlog.md`
- **Definition of Done** : `artifacts/definition-of-done.md`
- **Kanban Board** : `artifacts/kanban-board.md`

---

## Metriques

[A completer apres Sprint #1]

- **Velocity** : X SP/sprint
- **Cycle Time** : X min
- **Defect Rate** : X bugs/sprint

---

## Changelog

### 05/12/2025
- **BUG FIX CRITIQUE** : Correction application des couleurs pour styles slanted (A-E)
  - **Problème** : Lettres penchées (slanted A-E) restaient blanches, seules les lettres droites (straight F-J) étaient colorisées
  - **Cause racine** : Deux problèmes combinés
    1. Inversion des layers par l'API : Layer 0 applique la 2ème zone, Layer 1 applique la 1ère zone
    2. Nommage différent requis pour slanted vs straight dans `materialMultiLayers`
  - **Solution** :
    1. Inversion dans `resolveLetterColors()` : Pour paire "A-D", Layer 0 = Zone D, Layer 1 = Zone A
    2. Nommage conditionnel dans `generateMaterialMultiLayers()` :
       - Slanted (A-E) : `Style_A_Left_N` et `Style_A_Right_N` (AVEC Left/Right)
       - Straight (F-J) : `Style_F_N` (SANS Left/Right)
    3. Layer 1 toujours envoyé, même pour paire "X-0" (utilise couleur Layer 0 si zone = "0")
  - Corrigé dans `code/js/colors.js` lignes 108-133 (inversion) et 209-273 (nommage)
  - **NOTE** : Cette logique ne correspond PAS au script Python (qui ne gère pas les layers correctement)
- **DOC** : Mise à jour section "Système de couleurs" dans CLAUDE.md
  - Documentation de l'inversion des layers par l'API
  - Documentation des règles de nommage slanted vs straight

### 04/12/2025
- **BUG FIX CRITIQUE** : Correction du mapping styles → couleurs
  - **Problème** : Styles slanted et straight avaient des couleurs différentes
  - **Cause** : Mauvais calcul de `style_idx = (ord(style_letter) - ord('A')) // 2`
  - **Solution** : Mapping par couple correct : A/F→paire[0], B/G→paire[1], C/H→paire[2], D/I→paire[3], E/J→paire[4]
  - Corrigé dans `generate_full_render.py` lignes 230-234
  - Corrigé dans `code/js/colors.js` lignes 93-99
- **BUG FIX** : Gestion conditionnelle du Layer 1
  - **Problème** : Layer 1 toujours envoyé même quand zone = "0"
  - **Solution** : Quand `z1 == '0'`, ne pas envoyer de Layer 1 dans le payload
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
  - Documentation des sources de vérité (XML pour données, Python pour logique)
  - Documentation du système de couleurs (mapping couples, Layer 0/Layer 1)

### 03/12/2025
- **DEV** : Implementation du telechargement XML et extraction camera group ID
  - Ajout de `getDatabaseXML()` pour telecharger le XML depuis l'API
  - Reecriture de `findCameraGroupId()` avec recherche exacte et partielle
  - Fonctions `buildPayload()`, `fetchRenderImages()`, et `testPayloadBuild()` maintenant async
  - Camera group ID maintenant dynamique au lieu de null
  - Creation de la page de test `code/test-camera-group.html`
  - Documentation technique complete dans `docs/IMPLEMENTATION-XML-CAMERA-GROUP.md`

### 02/12/2025
- Projet cree
- Structure initialisee
- Prompts agents configures

---

**Framework** : Scrumban
**Version** : 1.0
