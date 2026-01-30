# Sprint Backlog - Sprint #19 (Éclairage)

**Sprint Goal** : "Corriger le bug Mood Lights et ajouter le contrôle Lighting_Ceiling"
**Capacité** : 3 SP
**Durée estimée** : ~2h

---

## US-053 : Correction bug Mood Lights (1 SP) - PRIORITÉ HAUTE

**Status** : To Do

### Tâches

| ID | Tâche | Status | Assigné | Durée |
|----|-------|--------|---------|-------|
| T053-1 | Ajouter `moodLights` dans state.config (ligne 33) | To Do | DEV | 5 min |
| T053-2 | Corriger DEFAULT_CONFIG.moodLights = "OFF" | To Do | DEV | 5 min |
| T053-3 | Corriger événements : stocker "ON"/"OFF" | To Do | DEV | 5 min |
| T053-4 | Corriger data-value HTML boutons | To Do | DEV | 5 min |
| T053-5 | Test payload (Lighting_mood.ON / .OFF) | To Do | QA | 10 min |

### Critères d'acceptation
- [ ] Cliquer ON → payload contient `Lighting_mood.ON`
- [ ] Cliquer OFF → payload contient `Lighting_mood.OFF`
- [ ] Plus de `Lighting_mood.undefined`
- [ ] L'image rendue reflète l'état Mood Lights

---

## US-054 : Contrôle Lighting_Ceiling (2 SP)

**Status** : To Do
**Dépendance** : US-053 (même pattern)

### Tâches

| ID | Tâche | Status | Assigné | Durée |
|----|-------|--------|---------|-------|
| T054-1 | Ajouter DEFAULT_CONFIG.lightingCeiling = "OFF" | To Do | DEV | 5 min |
| T054-2 | Ajouter `lightingCeiling` dans state.config | To Do | DEV | 5 min |
| T054-3 | Ajouter toggle HTML (après Mood Lights) | To Do | DEV | 10 min |
| T054-4 | Ajouter événements ON/OFF | To Do | DEV | 15 min |
| T054-5 | Ajouter dans payload-builder.js | To Do | DEV | 10 min |
| T054-6 | Affichage conditionnel (si hasLightingCeiling) | To Do | DEV | 20 min |
| T054-7 | Test payload (Lighting_Ceiling.ON / .OFF) | To Do | QA | 15 min |

### Critères d'acceptation
- [ ] Toggle visible si paramètre existe dans la base XML
- [ ] Toggle masqué si paramètre absent
- [ ] Cliquer ON → payload contient `Lighting_Ceiling.ON`
- [ ] Cliquer OFF → payload contient `Lighting_Ceiling.OFF`
- [ ] L'image rendue reflète l'état Lighting_Ceiling

---

## Progression

| US | Tâches | Complétées | % |
|----|--------|------------|---|
| US-053 | 5 | 0 | 0% |
| US-054 | 7 | 0 | 0% |
| **Total** | **12** | **0** | **0%** |

---

## Notes de développement

### US-053 - Détails techniques

**state.js ligne 33** - Ajouter après `doorPassenger`:
```javascript
moodLights: DEFAULT_CONFIG.moodLights, // US-053: Mood Lights
```

**config.js ligne 222** - Modifier:
```javascript
moodLights: "OFF", // Mood Lights par défaut OFF (pas "Lighting_Mood_OFF")
```

**interior-events.js lignes 63 et 70** - Modifier:
```javascript
// Ligne 63
updateConfig('moodLights', 'OFF');
// Ligne 70
updateConfig('moodLights', 'ON');
```

**index.html lignes 244-245** - Modifier:
```html
<button type="button" class="toggle-btn active" id="btnMoodLightsOFF" data-value="OFF">OFF</button>
<button type="button" class="toggle-btn" id="btnMoodLightsON" data-value="ON">ON</button>
```

### US-054 - Détails techniques

**Pattern identique à Tablet** (lignes 235-239 index.html)

**HTML à ajouter après ligne 247**:
```html
<div class="form-group" id="lightingCeilingGroup" style="display: none;">
    <label>Éclairage Plafond</label>
    <div class="toggle-group">
        <button type="button" class="toggle-btn active" id="btnLightingCeilingOFF" data-value="OFF">OFF</button>
        <button type="button" class="toggle-btn" id="btnLightingCeilingON" data-value="ON">ON</button>
    </div>
</div>
```

**payload-builder.js** - Ajouter après ligne 296:
```javascript
`Lighting_Ceiling.${config.lightingCeiling}`, // US-054: Éclairage plafond
```

---

**Dernière mise à jour** : 30/01/2026 - Sprint Planning terminé
