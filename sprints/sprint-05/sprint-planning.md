# Sprint Planning - Sprint #5 (Contrôles avancés)

**Date** : 04/12/2025
**Sprint Goal** : Ajouter 4 contrôles UI pour les configurations avancées (Tablet, SunGlass, Door_pilot, Door_passenger)
**Capacity** : 4 Story Points
**Duration** : ~1h

---

## 📋 User Stories sélectionnées

| ID | User Story | Story Points | Priorité |
|----|-----------|--------------|----------|
| US-023 | Contrôle Tablet | 1 SP | Moyenne |
| US-024 | Contrôle SunGlass | 1 SP | Moyenne |
| US-025 | Contrôle Door_pilot | 1 SP | Moyenne |
| US-026 | Contrôle Door_passenger | 1 SP | Moyenne |
| **Total** | | **4 SP** | |

---

## 🎯 Sprint Goal

> *"Permettre aux utilisateurs de contrôler dynamiquement les configurations avancées de l'avion (tablette, lunettes de soleil, portes pilote et passager) via des toggles dans l'interface, avec génération de rendus en temps réel."*

---

## 🏗️ Architecture technique

### Pattern architectural commun (4 US)

Toutes les User Stories suivent le même pattern en 5 couches :

```
┌─────────────────────────────────────────────────┐
│ 1. UI Layer (index.html + main.css)            │
│    → Toggle buttons avec labels                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. App Layer (app.js)                           │
│    → Event listeners + triggerRender()          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. State Layer (state.js)                       │
│    → Propriétés + getters/setters               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. Configuration Layer (config.js)              │
│    → Valeurs par défaut (DEFAULT_CONFIG)        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. API Layer (api.js)                           │
│    → Intégration dans getConfigString()         │
└─────────────────────────────────────────────────┘
```

---

## 📝 Décomposition détaillée

### US-023 : Contrôle Tablet

**Tâches techniques :**

1. **[Config]** Ajouter `tablet: "Closed"` dans DEFAULT_CONFIG (config.js)
2. **[State]** Ajouter propriété `tablet: "Closed"` dans state (state.js)
3. **[State]** Ajouter getter `getTablet()` (state.js)
4. **[API]** Modifier getConfigString() : `Tablet.${config.tablet}` (api.js)
5. **[UI]** Ajouter toggle "Tablette" après "Lunettes de soleil" (index.html)
   - Boutons : `btnTabletClosed` (Fermée) / `btnTabletOpen` (Ouverte)
6. **[App]** Event listeners pour les 2 boutons (app.js)
   - Click → updateConfig('tablet', 'Closed'|'Open') → triggerRender()

**Acceptance Criteria :**
- [ ] Toggle visible dans UI
- [ ] Valeur par défaut = Fermée
- [ ] Click déclenche nouveau rendu
- [ ] Config string correct : `Tablet.Closed` ou `Tablet.Open`

---

### US-024 : Contrôle SunGlass

**Tâches techniques :**

1. **[Config]** Ajouter `sunglass: "SunGlassOFF"` dans DEFAULT_CONFIG (config.js)
2. **[State]** Ajouter propriété `sunglass: "SunGlassOFF"` dans state (state.js)
3. **[State]** Ajouter getter `getSunGlass()` (state.js)
4. **[API]** Remplacer hardcodé par `SunGlass.${config.sunglass}` (api.js)
5. **[UI]** Ajouter toggle "Lunettes de soleil" après "Hélice" (index.html)
   - Boutons : `btnSunGlassOFF` (OFF) / `btnSunGlassON` (ON)
6. **[App]** Event listeners pour les 2 boutons (app.js)
   - Click → updateConfig('sunglass', 'SunGlassOFF'|'SunGlassON') → triggerRender()

**Acceptance Criteria :**
- [ ] Toggle visible dans UI
- [ ] Valeur par défaut = OFF
- [ ] Click déclenche nouveau rendu
- [ ] Config string correct : `SunGlass.SunGlassOFF` ou `SunGlass.SunGlassON`

---

### US-025 : Contrôle Door_pilot

**Tâches techniques :**

1. **[Config]** Ajouter `doorPilot: "Closed"` dans DEFAULT_CONFIG (config.js)
2. **[State]** Ajouter propriété `doorPilot: "Closed"` dans state (state.js)
3. **[State]** Ajouter getter `getDoorPilot()` (state.js)
4. **[API]** Remplacer hardcodé par `Door_pilot.${config.doorPilot}` (api.js)
5. **[UI]** Ajouter toggle "Porte pilote" après "Tablette" (index.html)
   - Boutons : `btnDoorPilotClosed` (Fermée) / `btnDoorPilotOpen` (Ouverte)
6. **[App]** Event listeners pour les 2 boutons (app.js)
   - Click → updateConfig('doorPilot', 'Closed'|'Open') → triggerRender()

**Acceptance Criteria :**
- [ ] Toggle visible dans UI
- [ ] Valeur par défaut = Fermée
- [ ] Click déclenche nouveau rendu
- [ ] Config string correct : `Door_pilot.Closed` ou `Door_pilot.Open`

---

### US-026 : Contrôle Door_passenger

**Tâches techniques :**

1. **[Config]** Ajouter `doorPassenger: "Closed"` dans DEFAULT_CONFIG (config.js)
2. **[State]** Ajouter propriété `doorPassenger: "Closed"` dans state (state.js)
3. **[State]** Ajouter getter `getDoorPassenger()` (state.js)
4. **[API]** Remplacer hardcodé par `Door_passenger.${config.doorPassenger}` (api.js)
5. **[UI]** Ajouter toggle "Porte passager" après "Porte pilote" (index.html)
   - Boutons : `btnDoorPassengerClosed` (Fermée) / `btnDoorPassengerOpen` (Ouverte)
6. **[App]** Event listeners pour les 2 boutons (app.js)
   - Click → updateConfig('doorPassenger', 'Closed'|'Open') → triggerRender()

**Acceptance Criteria :**
- [ ] Toggle visible dans UI
- [ ] Valeur par défaut = Fermée
- [ ] Click déclenche nouveau rendu
- [ ] Config string correct : `Door_passenger.Closed` ou `Door_passenger.Open`

---

## 🎨 Stratégie d'implémentation

**Approche par couche** (recommandée pour cohérence architecturale) :

### Phase 1 : Configuration (5 min)
- Modifier `code/js/config.js` : Ajouter 4 propriétés dans DEFAULT_CONFIG

### Phase 2 : State Management (10 min)
- Modifier `code/js/state.js` : Ajouter 4 propriétés + 4 getters

### Phase 3 : API Integration (10 min)
- Modifier `code/js/api.js` : Modifier getConfigString() pour les 4 valeurs

### Phase 4 : UI Layer (15 min)
- Modifier `code/index.html` : Ajouter 4 toggle groups
- Vérifier `code/styles/main.css` : Réutiliser .toggle-group existant

### Phase 5 : Event Binding (10 min)
- Modifier `code/js/app.js` : Ajouter 8 event listeners (2 par contrôle)

### Phase 6 : Tests & Validation (10 min)
- Tester chaque toggle individuellement
- Vérifier config string générée
- Valider rendus API

---

## ⚠️ Points d'attention

### 1. Ordre dans config string (api.js)

```javascript
const configParts = [
    `Version.${config.version}`,
    paintConfig,
    interiorConfig,
    `Decor.${decorData.suffix}`,
    `Position.${positionValue}`,
    `Exterior_Spinner.${config.spinner}`,
    `SunGlass.${config.sunglass}`,           // US-024 ← Remplacer hardcodé
    `Tablet.${config.tablet}`,               // US-023 ← Nouveau
    `Door_pilot.${config.doorPilot}`,        // US-025 ← Remplacer hardcodé
    `Door_passenger.${config.doorPassenger}` // US-026 ← Remplacer hardcodé
];
```

### 2. Cohérence nommage

| Layer | Convention | Exemples |
|-------|-----------|----------|
| State (state.js) | camelCase | `doorPilot`, `doorPassenger`, `sunglass`, `tablet` |
| API (api.js) | PascalCase + underscore | `Door_pilot`, `Door_passenger`, `SunGlass`, `Tablet` |
| UI IDs (index.html) | camelCase avec préfixe | `btnDoorPilotOpen`, `btnTabletClosed` |

### 3. CSS réutilisation

Utiliser les classes existantes :
- `.toggle-group` : Conteneur du toggle
- `.toggle-btn` : Bouton individuel
- `.toggle-btn.active` : Bouton actif

---

## 📂 Fichiers impactés

| Fichier | Type modification | Estimation lignes |
|---------|-------------------|-------------------|
| `code/js/config.js` | Ajout propriétés DEFAULT_CONFIG | +4 lignes |
| `code/js/state.js` | Ajout propriétés state + getters | +20 lignes |
| `code/js/api.js` | Modification getConfigString() | ~10 lignes modifiées |
| `code/index.html` | Ajout 4 toggle groups | +60 lignes |
| `code/js/app.js` | Ajout 8 event listeners | +80 lignes |

**Total estimé** : ~160 lignes de code

---

## ✅ Definition of Done

- [ ] Code fonctionnel et testé manuellement
- [ ] Les 4 toggles visibles et interactifs
- [ ] Config string correctement générée
- [ ] Changement déclenche nouveau rendu API
- [ ] Vues extérieure ET intérieure fonctionnelles
- [ ] Aucune régression sur fonctionnalités existantes
- [ ] Code commenté (fonctions complexes)
- [ ] Tests QA validés
- [ ] Validation Stakeholder obtenue

---

## 📊 Capacité Sprint

- **Story Points engagés** : 4 SP
- **Velocity Sprint #4** : 9 SP (référence)
- **Charge estimée** : ~1h
- **Confiance** : ✅ Haute (pattern répétitif, architecture stable)

---

**Sprint Planning validé ! Prêt pour implémentation.** 🚀
