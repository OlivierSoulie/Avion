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

### 🚫 Paramètres POC - NON IMPLÉMENTÉS (CRITIQUE)

**⚠️ RÈGLE ABSOLUE** : Tous les paramètres préfixés "POC" ne doivent PAS être implémentés dans le configurateur.

**Pourquoi ?**
- Les paramètres "POC" sont des versions de test/POC (Proof of Concept) présentes uniquement dans la base V0.1
- Ces paramètres ne sont PAS destinés à la production
- Le configurateur supporte UNIQUEMENT les bases Production (V0.2+)

**Liste des paramètres POC (à IGNORER) :**
```
POC Decor
POC Door pilot
POC Door passenger
POC Sun glass
POC Lighting ceiling
POC Lighting mood 960
POC Leather
POC Stickers
POC Storage left
POC Storage right
```

**Conséquence :** Si un paramètre commence par "POC", il ne doit jamais être affiché ni utilisé dans l'interface.

**Référence :** US-046 - Séparation features POC vs Production

---

### 📖 Glossaire Métier (IMPORTANT)

**ATTENTION** : Ne pas confondre ces termes clés :

#### Décor (Decor)
- **Définition** : Environnement de fond pour la scène 3D
- **Valeurs possibles** : Studio, Tarmac, Fjord, Hangar, Onirique, SunriseVeiled
- **Format XML** :
  - V0.3-V0.9.1 : `{DecorName}_{Ground|Flight}` (ex: `Studio_Ground`, `Fjord_Flight`)
  - V0.9.2+ : `{DecorName}_{Ground|Flight}_{Index}` (ex: `Fjord_Flight_2`, `Tarmac_Ground_5`)
- **Utilisation** :
  - Position de l'avion (`Position.${decor}`)
  - Groupe de caméras extérieur (`Exterieur_Decor${decor}`)
  - Paramètre de configuration (`Decor.${decor}_Ground` ou `Decor.${decor}_Flight_X`)
- **Dropdown** : Affiche juste le nom (ex: "Fjord", "Tarmac")
- **API** : Envoie le nom complet avec index (ex: "Fjord_Flight_2")
- **Tri** : Par index croissant (1, 2, 3...) si présent dans le XML
- **Exemple V0.9.2+** : `Decor.Tarmac_Ground_5`, `Position.Tarmac`

#### Paint Scheme (Schéma de Peinture)
- **Définition** : Schéma de peinture de l'avion avec zones de couleur
- **Valeurs possibles** : Zephir, Tehuano, Sirocco, Alize, Mistral, Meltem
- **Utilisation** :
  - Configuration de peinture (`Exterior_PaintScheme.${paintScheme}`)
  - **IMPORTANT** : Les caméras RegistrationNumber sont nommées selon le paint scheme
  - Exemple : `RegistrationNumber_Zephir`, `RegistrationNumber_Tehuano`
- **Exemple** : `Exterior_PaintScheme.Zephir_B-0_B-D_B-D_B-D_B-D`

#### ⚠️ Erreur courante
```javascript
// ❌ FAUX - Confusion décor/paint scheme
const cameraName = `RegistrationNumber_${config.decor}`;
// Cherche: RegistrationNumber_Studio (n'existe pas)

// ✅ CORRECT
const cameraName = `RegistrationNumber_${config.paintScheme}`;
// Cherche: RegistrationNumber_Zephir (existe)
```

**Référence** : Sprint #12 - `sprints/sprint-12/sprint-12-suite-corrections.md` (Problème #2)

---

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

3. **Pour la LOGIQUE et l'IMPLÉMENTATION** : Le site web JavaScript (`code/js/`)
   - La structure des payloads API
   - Le nommage des textures et matériaux
   - Les algorithmes de calcul (positionnement, couleurs)
   - **Règle** : Le JavaScript dans `code/js/` fait AUTORITÉ pour toute la logique métier
   - **Note** : Le script Python `generate_full_render.py` a été mis à jour (v3.0) pour refléter la logique du JavaScript

**Processus en cas de bug ou nouvelle fonctionnalité** :
1. Vérifier l'implémentation JavaScript dans `code/js/` (source de vérité)
2. Analyser et corriger directement le JavaScript si nécessaire
3. Le JavaScript fait autorité : mettre à jour le Python si besoin pour maintenir la cohérence
4. Les deux implémentations doivent rester synchronisées sur les aspects critiques (layers, couleurs, positionnement)

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

**Layers (couches de couleur)** :
- Pour paire `A-D` :
  - **Layer 0** = couleur Zone A (1ère valeur) → Appliqué à la LETTRE
  - **Layer 1** = couleur Zone D (2ème valeur) → Appliqué au CONTOUR/OMBRE
- Pour paire `A-0` (pas de 2ème zone) :
  - **Layer 0** = couleur Zone A
  - **Layer 1** = couleur Zone A (fallback car pas de 2ème couleur)

**Nommage des textures dans materialMultiLayers** :
- **Slanted (A-E)** : Utiliser `Style_A_Left_N` et `Style_A_Right_N` (AVEC Left/Right)
- **Straight (F-J)** : Utiliser `Style_F_N` (SANS Left/Right)

---

## Artefacts Scrumban

- **Product Backlog** : `artifacts/product-backlog.md`
- **Definition of Done** : `artifacts/definition-of-done.md`
- **Kanban Board** : `artifacts/kanban-board.md`

---

## Synchronisation GitHub

### Repository
- **URL** : https://github.com/OlivierSoulie/Avion
- **Branche principale** : `main`
- **Stratégie** : Branche unique (tout sur main)

### Règles de synchronisation

**Quand synchroniser (push vers GitHub) :**
1. ✅ Après chaque **bug fix critique** (priorité haute)
2. ✅ À la fin de chaque **sprint** (regroupement des changements)
3. ✅ Avant de changer de poste de travail
4. ⚠️ Sur demande explicite de l'utilisateur

**Format des commits :**
Le projet utilise un format simple inspiré des Conventional Commits :
- `feat:` - Nouvelle fonctionnalité (User Story)
- `fix:` - Correction de bug
- `chore:` - Maintenance, nettoyage
- `docs:` - Documentation
- `refactor:` - Refactoring sans changement fonctionnel

**Exemples de messages :**
```
feat: Ajout gestion immatriculation personnalisée (US-004)
fix: Correction inversion layers couleurs lettres slanted
chore: Nettoyage fichiers temporaires
docs: Mise à jour CLAUDE.md - synchronisation GitHub
```

**Workflow de base :**
```bash
# 1. Vérifier l'état
git status

# 2. Ajouter les fichiers modifiés
git add .

# 3. Créer le commit (via Claude Code ou manuellement)
git commit -m "type: description"

# 4. Pousser vers GitHub
git push origin main
```

**⚠️ Important :**
- Toujours vérifier `git status` avant de commit
- Ne jamais commit de fichiers sensibles (.env, credentials, etc.)
- Les commits peuvent être créés par Claude Code (avec emoji 🤖)

---

## Metriques

[A completer apres Sprint #1]

- **Velocity** : X SP/sprint
- **Cycle Time** : X min
- **Defect Rate** : X bugs/sprint

---

## Changelog

Voir le fichier dédié **[CHANGELOG.md](CHANGELOG.md)** pour l'historique complet des modifications.

---

**Framework** : Scrumban
**Version** : 1.0
