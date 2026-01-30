# Sprint Planning - Sprint #19 (Éclairage)

**Date** : 30/01/2026
**Facilitateur** : ARCH
**Participants** : PO, ARCH, DEV, QA

---

## Sprint Goal

> "Corriger le bug Mood Lights et ajouter le contrôle Lighting_Ceiling pour permettre le contrôle complet de l'éclairage intérieur"

---

## User Stories sélectionnées

| US | Titre | SP | Priorité |
|----|-------|------|----------|
| US-053 | Correction bug Mood Lights | 1 | Haute (Bug) |
| US-054 | Contrôle Lighting_Ceiling | 2 | Moyenne |

**Total** : 3 Story Points

---

## Analyse Technique

### US-053 : Bug Mood Lights

**Diagnostic confirmé** :
1. `DEFAULT_CONFIG.moodLights` existe (config.js ligne 222) avec valeur `"Lighting_Mood_OFF"`
2. `state.config.moodLights` **N'EXISTE PAS** (state.js lignes 13-54)
3. `updateConfig('moodLights', ...)` échoue car `hasOwnProperty('moodLights')` retourne `false`
4. `config.moodLights` reste `undefined`
5. Payload génère `Lighting_mood.undefined`

**Second problème identifié** :
- L'événement stocke `"Lighting_Mood_ON"` / `"Lighting_Mood_OFF"` (valeur complète)
- Le payload-builder fait `Lighting_mood.${config.moodLights}`
- Résultat après fix state.js : `Lighting_mood.Lighting_Mood_ON` (doublon!)

**Format API attendu** (vérifié dans validators.js) :
- Paramètre : `Lighting_mood`
- Valeurs : `ON` ou `OFF`
- Format final : `Lighting_mood.ON` ou `Lighting_mood.OFF`

**Corrections requises** :
1. Ajouter `moodLights: DEFAULT_CONFIG.moodLights` dans state.js
2. Modifier les événements pour stocker `"ON"` / `"OFF"` (pas `"Lighting_Mood_ON"`)
3. Modifier DEFAULT_CONFIG pour `moodLights: "OFF"` (pas `"Lighting_Mood_OFF"`)

### US-054 : Contrôle Lighting_Ceiling

**Pattern à suivre** (identique à Tablet) :
1. HTML : Toggle ON/OFF dans section intérieur
2. state.js : Propriété `lightingCeiling`
3. config.js : DEFAULT_CONFIG.lightingCeiling = "OFF"
4. interior-events.js : Event listeners ON/OFF
5. payload-builder.js : Ajouter dans configParts

**Détection dynamique** :
- `database-analyzer.js` détecte déjà `hasLightingCeiling`
- Nommage variable : `Lighting_Ceiling` ou `Lighting_ceiling` selon version

---

## Décomposition en Tâches

### US-053 : Correction bug Mood Lights (1 SP)

| Tâche | Description | Fichier | Durée |
|-------|-------------|---------|-------|
| T053-1 | Ajouter `moodLights: DEFAULT_CONFIG.moodLights` dans state.config | state.js (ligne 33) | 5 min |
| T053-2 | Corriger DEFAULT_CONFIG.moodLights = "OFF" | config.js (ligne 222) | 5 min |
| T053-3 | Corriger événements : stocker "ON"/"OFF" | interior-events.js (lignes 63, 70) | 5 min |
| T053-4 | Corriger data-value HTML boutons | index.html (lignes 244-245) | 5 min |
| T053-5 | Test : vérifier payload contient `Lighting_mood.ON` ou `.OFF` | - | 10 min |

**Total US-053** : ~30 min

### US-054 : Contrôle Lighting_Ceiling (2 SP)

| Tâche | Description | Fichier | Durée |
|-------|-------------|---------|-------|
| T054-1 | Ajouter DEFAULT_CONFIG.lightingCeiling = "OFF" | config.js | 5 min |
| T054-2 | Ajouter `lightingCeiling: DEFAULT_CONFIG.lightingCeiling` | state.js | 5 min |
| T054-3 | Ajouter toggle HTML après Mood Lights | index.html (après ligne 247) | 10 min |
| T054-4 | Ajouter événements ON/OFF | interior-events.js | 15 min |
| T054-5 | Ajouter dans payload configParts | payload-builder.js (après ligne 296) | 10 min |
| T054-6 | Implémenter affichage conditionnel (si hasLightingCeiling) | interior-events.js ou app.js | 20 min |
| T054-7 | Test : vérifier payload contient `Lighting_Ceiling.ON` ou `.OFF` | - | 15 min |

**Total US-054** : ~1h20

---

## Fichiers impactés

| Fichier | US-053 | US-054 |
|---------|--------|--------|
| `code/js/config.js` | ✅ | ✅ |
| `code/js/state.js` | ✅ | ✅ |
| `code/index.html` | ✅ | ✅ |
| `code/js/ui/events/interior-events.js` | ✅ | ✅ |
| `code/js/api/payload-builder.js` | ❌ | ✅ |

---

## Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Format API différent selon version base | Moyen | Utiliser `database-analyzer.js` pour détecter le nommage exact |
| Régression autres contrôles | Faible | Ne modifier QUE les fichiers listés, tester Tablet/SunGlass après |

---

## Definition of Done (rappel)

- [ ] Code implémenté selon specs
- [ ] Tests manuels passés
- [ ] Payload vérifié (pas de `undefined`)
- [ ] Aucune régression sur contrôles existants
- [ ] Documentation mise à jour si nécessaire

---

## Décision d'équipe

**Sprint validé** : ✅ 3 SP acceptés pour Sprint #19

**Assignations** :
- DEV : Implémentation US-053 puis US-054
- QA : Tests après chaque US
- ARCH : Review si blocage

**Ordre d'exécution** :
1. US-053 (bug bloquant) - Priorité
2. US-054 (nouvelle feature) - Après validation US-053

---

**Sprint Planning terminé le 30/01/2026**
