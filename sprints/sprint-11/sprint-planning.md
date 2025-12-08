# Sprint Planning #11 - Compatibilité Multi-Bases Complète

**Date** : 07/12/2025
**Sprint Goal** : "Garantir que le configurateur fonctionne correctement avec **TOUTES les 5 versions de bases de données**, en gérant automatiquement les différences via fallbacks et graceful degradation."

**Participants** : COORDINATOR, ARCH, PO
**Capacity** : 7 Story Points (US-039: 2 SP + US-040: 3 SP + US-041: 2 SP)

---

## 🎯 Vision Utilisateur (Validée)

**Objectif critique** : **SUPPORTER LES 5 BASES**, y compris V0.1 (POC) et V0.2 (transition).

**Stratégie** : Graceful degradation avec fallbacks intelligents
- Base de référence (dernière) = Fonctionnement optimal
- V0.3 / V0.4 = Fallbacks mineurs (anchors immatriculation)
- V0.2 = Fallbacks moyens (parameters, groupes caméras)
- V0.1 = Fallbacks massifs (prestiges, peinture, parameters, caméras)

**Principe** : Le site doit TOUJOURS générer un rendu, même avec une base ancienne/incomplète.

---

## 📋 User Stories à Implémenter

### [US-039] Recharger configuration par défaut lors du changement de base (2 SP) 🔴 CRITIQUE

**Problème actuel** :
```javascript
// app.js ligne 887
selectDatabase.addEventListener('change', (e) => {
    setDatabaseId(databaseId);
    setImages([]);  // ✅ Reset images OK
    // ❌ MAIS : Config reste celle de l'ancienne base !
});
```

**Objectif** :
1. Appeler `loadDefaultConfigFromXML()` après changement de base
2. Réinitialiser TOUS les dropdowns avec les nouvelles valeurs
3. Invalider cache XML ✅ (déjà fait via `setDatabaseId`)
4. Afficher un toast : "Base changée → Configuration réinitialisée"

**Critères d'acceptation** :
- [ ] `loadDefaultConfigFromXML()` appelée au changement de base
- [ ] Tous les dropdowns mis à jour (version, paintScheme, prestige, etc.)
- [ ] Immatriculation réinitialisée selon base (N960TB ou N980TB)
- [ ] Toast de confirmation affiché
- [ ] Testé avec les 5 bases (vérifier que config change bien)

**Fichier concerné** : `code/js/app.js` (event listener `selectDatabase`)

---

### [US-040] Validation des valeurs avant génération du rendu (3 SP) ⚠️ IMPORTANTE

**Problème actuel** :
```javascript
// Si user :
// 1. Sélectionne Prestige "Oslo" avec base référence
// 2. Change pour base V0.1 (qui n'a PAS "Oslo")
// 3. Clique "Générer"
// → Erreur API 400 (valeur invalide)
```

**Objectif** :
Créer une fonction de validation avant `buildPayload()` qui :
1. Vérifie chaque valeur de config dans le XML de la base actuelle
2. Si invalide → Applique un fallback intelligent
3. Logue les corrections dans la console
4. Affiche un warning à l'utilisateur (optionnel)

**Architecture proposée** :
```javascript
// Nouvelle fonction dans api/xml-parser.js
export async function validateConfigForDatabase(config) {
    const xmlDoc = await getDatabaseXML();
    const corrections = [];
    const validatedConfig = { ...config };

    // 1. Valider version (960/980)
    const versionParam = xmlDoc.querySelector('Parameter[label="Exterior_RegistrationNumber_Version"]');
    if (!versionParam) {
        // V0.1 : Parameter absent → Utiliser défaut
        validatedConfig.version = '960';
        corrections.push('version: Parameter absent → Default "960"');
    } else {
        const validVersions = extractParameterOptions(xmlDoc, 'Exterior_RegistrationNumber_Version');
        if (!validVersions.find(v => v.value === config.version)) {
            validatedConfig.version = validVersions[0].value;
            corrections.push(`version: "${config.version}" invalide → "${validVersions[0].value}"`);
        }
    }

    // 2. Valider paintScheme
    const paintSchemeParam = xmlDoc.querySelector('Parameter[label="Exterior_PaintScheme"]');
    if (!paintSchemeParam) {
        // V0.1 : Seul "Zephir" disponible
        validatedConfig.paintScheme = 'Zephir';
        corrections.push('paintScheme: Parameter absent → Default "Zephir"');
    } else {
        const validSchemes = extractParameterOptions(xmlDoc, 'Exterior_PaintScheme');
        if (!validSchemes.find(s => s.value === config.paintScheme)) {
            validatedConfig.paintScheme = validSchemes[0].value;
            corrections.push(`paintScheme: "${config.paintScheme}" invalide → "${validSchemes[0].value}"`);
        }
    }

    // 3. Valider prestige
    const prestigeBookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark[label^="Interior_PrestigeSelection_"]');
    if (prestigeBookmarks.length === 0) {
        // V0.1 : AUCUN prestige → Fallback hardcodé
        validatedConfig.prestige = 'Oslo'; // Utiliser un prestige de la référence
        corrections.push('prestige: Aucun disponible dans base → Fallback "Oslo" (WARNING: peut échouer)');
    } else {
        const validPrestiges = extractParameterOptions(xmlDoc, 'Interior_PrestigeSelection');
        if (!validPrestiges.find(p => p.value === config.prestige)) {
            validatedConfig.prestige = validPrestiges[0].value;
            corrections.push(`prestige: "${config.prestige}" invalide → "${validPrestiges[0].value}"`);
        }
    }

    // 4. Valider tous les autres parameters (décor, spinner, etc.)
    const parameterLabels = [
        'Decor',
        'Exterior_Spinner',
        'Door_pilot',
        'Door_passenger',
        'SunGlass',
        'Tablet',
        'Interior_Stitching',
        'Interior_Carpet',
        'Interior_CentralSeatMaterial',
        // ... tous les parameters utilisés
    ];

    for (const label of parameterLabels) {
        const configKey = label.replace('Exterior_', '').replace('Interior_', '').toLowerCase();
        const param = xmlDoc.querySelector(`Parameter[label="${label}"]`);

        if (!param) {
            // Parameter absent dans base ancienne
            // Garder valeur actuelle (sera ignorée dans payload si absent)
            corrections.push(`${label}: Parameter absent dans base → Valeur ignorée`);
        } else {
            const validOptions = extractParameterOptions(xmlDoc, label);
            const currentValue = config[configKey];
            if (currentValue && !validOptions.find(o => o.value === currentValue)) {
                validatedConfig[configKey] = validOptions[0].value;
                corrections.push(`${label}: "${currentValue}" invalide → "${validOptions[0].value}"`);
            }
        }
    }

    // Logger les corrections
    if (corrections.length > 0) {
        console.warn('⚠️ Configuration corrigée pour compatibilité base:');
        corrections.forEach(c => console.warn(`   - ${c}`));
    }

    return { config: validatedConfig, corrections };
}
```

**Intégration dans app.js** :
```javascript
// Avant triggerRender()
async function handleRenderButtonClick() {
    try {
        // 1. Valider config
        const { config: validatedConfig, corrections } = await validateConfigForDatabase(getConfig());

        // 2. Si corrections, afficher warning (optionnel)
        if (corrections.length > 0) {
            showWarningToast(`Configuration adaptée (${corrections.length} corrections)`);
        }

        // 3. Utiliser config validée pour render
        await triggerRender(validatedConfig);
    } catch (error) {
        showError(error.message);
    }
}
```

**Cas spéciaux à gérer** :

1. **Groupes caméras (V0.1, V0.2)** :
```javascript
// Dans findCameraGroupId()
// Chercher par ordre de priorité :
// 1. "Exterieur_Decor{name}" (référence, V0.3, V0.4)
// 2. "Decor{name}" (V0.2)
// 3. "Exterieur" (V0.1 - générique)
```

2. **Anchors immatriculation (V0.2, V0.3, V0.4)** :
```javascript
// Dans extractAnchors()
// Si anchors absents → Utiliser valeurs hardcodées par défaut
const DEFAULT_ANCHORS = {
    Zephir: { RegL: {...}, RegR: {...} },
    Sirocco: { RegL: {...}, RegR: {...} },
    // ...
};
```

3. **Prestiges V0.1** :
```javascript
// CRITIQUE : V0.1 n'a AUCUN prestige
// Fallback : Utiliser "Oslo" par défaut
// WARNING : Le payload API peut échouer si "Oslo" n'existe pas dans V0.1
// Alternative : Ne pas envoyer de config intérieur pour V0.1
```

**Critères d'acceptation** :
- [ ] Fonction `validateConfigForDatabase(config)` créée
- [ ] Validation de TOUS les parameters utilisés
- [ ] Fallbacks intelligents pour chaque type de donnée
- [ ] Corrections loggées dans console
- [ ] Testé avec les 5 bases (vérifier que ça ne plante JAMAIS)
- [ ] Cas spéciaux gérés (groupes caméras, anchors, prestiges)

**Fichier concerné** : `code/js/api/xml-parser.js` (nouvelle fonction)

---

### [US-041] Indicateur visuel de compatibilité base de données (2 SP) ℹ️ NICE TO HAVE

**Objectif** :
Afficher un badge dans l'UI pour indiquer la compatibilité de la base actuelle.

**Design** :
```html
<!-- Dans code/index.html, à côté du dropdown database -->
<div class="database-compatibility-badge" id="compatibilityBadge">
    <span class="badge badge-green">✓ Compatible</span>
    <div class="tooltip">
        Base 100% compatible. Aucune correction nécessaire.
    </div>
</div>
```

**États du badge** :
```javascript
// Vert (V0.3, V0.4, Référence)
✓ Compatible
Tooltip: "Base 100% compatible"

// Orange (V0.2)
⚠ Partiellement compatible
Tooltip: "5 parameters manquants, fallbacks appliqués"

// Rouge (V0.1)
! Compatibilité limitée
Tooltip: "Base ancienne, 24 parameters manquants, fallbacks massifs"
```

**Logique** :
```javascript
// Nouvelle fonction dans app.js
async function updateCompatibilityBadge() {
    const xmlDoc = await getDatabaseXML();

    // Compter parameters manquants
    const requiredParams = [
        'Decor', 'Exterior_Spinner', 'Door_pilot', 'Door_passenger',
        'SunGlass', 'Tablet', 'Interior_Stitching', // ... tous
    ];

    let missingCount = 0;
    requiredParams.forEach(label => {
        const param = xmlDoc.querySelector(`Parameter[label="${label}"]`);
        if (!param) missingCount++;
    });

    // Compter prestiges manquants
    const prestigeBookmarks = xmlDoc.querySelectorAll('ConfigurationBookmark[label^="Interior_PrestigeSelection_"]');
    const missingPrestiges = 8 - prestigeBookmarks.length;

    // Déterminer badge
    const badge = document.getElementById('compatibilityBadge');
    if (missingCount === 0 && missingPrestiges === 0) {
        badge.innerHTML = '<span class="badge badge-green">✓ Compatible</span>';
        badge.title = 'Base 100% compatible';
    } else if (missingCount <= 5 && missingPrestiges === 0) {
        badge.innerHTML = '<span class="badge badge-orange">⚠ Partiellement compatible</span>';
        badge.title = `${missingCount} parameters manquants, fallbacks appliqués`;
    } else {
        badge.innerHTML = '<span class="badge badge-red">! Compatibilité limitée</span>';
        badge.title = `${missingCount} parameters + ${missingPrestiges} prestiges manquants`;
    }
}

// Appeler après chargement XML
await loadDefaultConfigFromXML();
await updateCompatibilityBadge();
```

**CSS** :
```css
/* code/styles/controls.css */
.database-compatibility-badge {
    display: inline-block;
    margin-left: 10px;
}

.badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 600;
}

.badge-green {
    background: #4ec9b0;
    color: #1e1e1e;
}

.badge-orange {
    background: #dcdcaa;
    color: #1e1e1e;
}

.badge-red {
    background: #f48771;
    color: #1e1e1e;
}
```

**Critères d'acceptation** :
- [ ] Badge affiché à côté du dropdown base
- [ ] Couleur dynamique selon compatibilité
- [ ] Tooltip avec détails
- [ ] Mis à jour au changement de base
- [ ] Testé avec les 5 bases

**Fichiers concernés** :
- `code/index.html` (ajout badge)
- `code/styles/controls.css` (styles badge)
- `code/js/app.js` (logique badge)

---

## 🏗️ Décomposition Technique Globale

### Phase 1 : US-039 - Rechargement config (2 SP - 1h30)

**Tâches** :
1. [T039-1] Modifier event listener `selectDatabase` (30min)
   - Appeler `loadDefaultConfigFromXML()` après `setDatabaseId()`
   - Réinitialiser immatriculation selon version
   - Afficher toast confirmation
   - **Fichier** : `code/js/app.js` lignes 885-898

2. [T039-2] Tester avec les 5 bases (30min)
   - Changer de V0.1 → Référence : Vérifier que config change
   - Changer de Référence → V0.1 : Vérifier que config change
   - Vérifier logs console
   - **Manuel** : Navigateur

3. [T039-3] Gérer cas edge (30min)
   - Si XML ne charge pas → Garder config actuelle
   - Si default non trouvé → Utiliser première option
   - **Fichier** : `code/js/app.js`

---

### Phase 2 : US-040 - Validation config (3 SP - 2h30)

**Tâches** :
1. [T040-1] Créer `validateConfigForDatabase()` (1h)
   - Squelette fonction avec structure de base
   - Validation version, paintScheme, prestige
   - Return `{ config, corrections }`
   - **Fichier** : `code/js/api/xml-parser.js` (nouvelle fonction ~150 lignes)

2. [T040-2] Ajouter validation tous parameters (45min)
   - Loop sur liste complète parameters
   - Vérifier existence dans XML
   - Fallback vers première option si invalide
   - **Fichier** : `code/js/api/xml-parser.js`

3. [T040-3] Gérer cas spéciaux (45min)
   - Groupes caméras : Chercher formats alternatifs (V0.1, V0.2)
   - Anchors immatriculation : Utiliser defaults hardcodés
   - Prestiges V0.1 : Fallback "Oslo" avec warning
   - **Fichiers** : `code/js/api/xml-parser.js` + `code/js/utils/positioning.js`

4. [T040-4] Intégrer validation dans render flow (30min)
   - Appeler `validateConfigForDatabase()` avant `buildPayload()`
   - Afficher warning toast si corrections
   - Logger corrections console
   - **Fichier** : `code/js/app.js` (fonction `triggerRender`)

5. [T040-5] Tester avec les 5 bases (30min)
   - V0.1 : Vérifier corrections massives
   - V0.2 : Vérifier corrections moyennes
   - V0.3/V0.4 : Vérifier corrections mineures
   - Référence : Vérifier aucune correction
   - **Manuel** : Navigateur + Console

---

### Phase 3 : US-041 - Badge compatibilité (2 SP - 1h30)

**Tâches** :
1. [T041-1] HTML + CSS badge (30min)
   - Ajouter badge dans `index.html`
   - Créer styles badge vert/orange/rouge
   - **Fichiers** : `code/index.html`, `code/styles/controls.css`

2. [T041-2] Logique badge (45min)
   - Créer `updateCompatibilityBadge()`
   - Compter parameters manquants
   - Déterminer couleur badge
   - **Fichier** : `code/js/app.js`

3. [T041-3] Intégration et tests (15min)
   - Appeler après `loadDefaultConfigFromXML()`
   - Appeler au changement de base
   - Tester avec 5 bases
   - **Fichier** : `code/js/app.js`

---

## 📊 Estimation Finale

| Phase | Tâches | Story Points | Durée Estimée |
|-------|--------|--------------|---------------|
| **Phase 1: US-039** | 3 tâches | 2 SP | 1h30 |
| **Phase 2: US-040** | 5 tâches | 3 SP | 2h30 |
| **Phase 3: US-041** | 3 tâches | 2 SP | 1h30 |
| **TOTAL** | **11 tâches** | **7 SP** | **~5h30** |

---

## 🎯 Staffing Décision

**Équipe minimale requise** : 6 agents
- PO (Product Owner)
- ARCH (Architecte / Scrum Master)
- COORDINATOR (Coordination quotidienne)
- **1 DEV-Généraliste** (toutes les tâches)
- **1 QA-Fonctionnel** (tests avec 5 bases)
- **1 DOC** (documentation fallbacks)

**Justification** :
- Sprint court (7 SP, ~5h30)
- Tâches séquentielles (validation dépend de config reload)
- 1 seul DEV suffit (pas de parallélisation possible)
- QA critique (tests avec 5 bases = temps)

---

## ✅ Definition of Done

**US-039** :
- [x] Config rechargée automatiquement au changement de base
- [x] Toast de confirmation affiché
- [x] Testé avec les 5 bases
- [x] Aucune erreur console

**US-040** :
- [x] Fonction `validateConfigForDatabase()` créée
- [x] Tous les parameters validés
- [x] Cas spéciaux gérés (caméras, anchors, prestiges)
- [x] Corrections loggées
- [x] Testé avec les 5 bases
- [x] Site ne plante JAMAIS (graceful degradation)

**US-041** :
- [x] Badge affiché et dynamique
- [x] Couleurs correctes selon base
- [x] Tooltip informatif
- [x] Testé avec les 5 bases

---

## 🚀 Prochaines Étapes

1. ✅ Sprint Planning validé
2. ⏳ **ARCH décompose techniquement** (détails implémentation)
3. ⏳ **DEV commence Phase 1** (US-039)
4. ⏳ **QA prépare plan de tests** (matrice 5 bases × critères)
5. ⏳ **Lancement Sprint #11**

---

**Date de création** : 07/12/2025
**Validé par** : COORDINATOR + utilisateur
**Prochaine action** : Démarrage développement
