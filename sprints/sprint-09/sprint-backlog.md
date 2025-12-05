# Sprint Backlog - Sprint #9

**Projet** : 005-Configurateur_Daher
**Sprint** : Sprint #9
**Date** : 05/12/2025
**Sprint Goal** : Immatriculation dynamique selon modèle + Recherche tags couleurs
**Velocity** : 6 Story Points

---

## 📊 User Stories du Sprint

### [US-034] Immatriculation dynamique selon modèle (1 SP)
- **Priorité** : Moyenne
- **Complexité** : Faible (gestion state + event listeners)
- **Estimation** : ~30 min

### [US-033] Barre de recherche pour filtrer zones couleurs par tags (5 SP)
- **Priorité** : Moyenne
- **Complexité** : Moyenne (parsing XML, filtrage, performance)
- **Estimation** : ~2-3h

**Total Sprint** : 6 Story Points

---

## 🔧 Décomposition Technique

### US-034 : Immatriculation dynamique selon modèle (1 SP)

**Contexte** :
- Actuellement, l'immatriculation par défaut est "N960TB" (fixe)
- Le user peut la changer manuellement via l'input + bouton "Envoyer"
- On veut que l'immat change automatiquement selon le modèle (960→N960TB, 980→N980TB)
- **SAUF** si le user l'a personnalisée manuellement

**Fichiers impactés** :
- `code/js/state.js` : Ajouter flag `hasCustomImmat`
- `code/js/app.js` : Modifier listeners selectVersion et btnSubmitImmat

---

#### T1.1 : Ajouter flag `hasCustomImmat` dans `state.js`
**Durée estimée** : 5 min

**Objectif** : Tracker si l'utilisateur a modifié l'immatriculation manuellement

**Implémentation** :
1. Ajouter `hasCustomImmat: false` dans l'objet `defaultConfig` (ligne ~21)
2. Aucun export nécessaire, géré via `updateConfig('hasCustomImmat', true)`

**Code à ajouter** (après `immat: "N960TB"`) :
```javascript
hasCustomImmat: false,  // Flag pour tracker si user a customisé l'immat
```

**Tests** :
- Vérifier que `getConfig().hasCustomImmat` retourne `false` au démarrage

---

#### T1.2 : Modifier listener `btnSubmitImmat` pour set flag custom
**Durée estimée** : 5 min

**Objectif** : Quand le user clique "Envoyer", marquer l'immat comme custom

**Fichier** : `code/js/app.js` lignes 881-897

**Implémentation** :
1. Après `updateConfig('immat', currentImmat);` (ligne 890)
2. Ajouter `updateConfig('hasCustomImmat', true);`
3. Log pour debug

**Code à ajouter** (ligne 891) :
```javascript
updateConfig('immat', currentImmat);
updateConfig('hasCustomImmat', true); // Marquer comme custom
console.log('Immatriculation personnalisée:', currentImmat);
```

**Tests** :
- Changer l'immat manuellement → Cliquer "Envoyer" → Vérifier flag `true`

---

#### T1.3 : Créer fonction `updateDefaultImmatFromModel(model)`
**Durée estimée** : 10 min

**Objectif** : Fonction qui met à jour l'immat SEULEMENT si pas custom

**Fichier** : `code/js/app.js` (nouvelle fonction, ajouter avant les event listeners)

**Implémentation** :
```javascript
/**
 * US-034 : Met à jour l'immatriculation par défaut selon le modèle
 * Ne met à jour QUE si l'utilisateur n'a pas customisé l'immat
 *
 * @param {string} model - Modèle d'avion ("960" ou "980")
 */
function updateDefaultImmatFromModel(model) {
    const currentConfig = getConfig();

    // Si l'utilisateur a customisé l'immat, ne rien faire
    if (currentConfig.hasCustomImmat) {
        console.log('🔒 Immatriculation personnalisée, pas de mise à jour automatique');
        return;
    }

    // Déterminer l'immat par défaut selon le modèle
    const defaultImmat = model === '980' ? 'N980TB' : 'N960TB';

    // Mettre à jour l'immat si elle est différente
    if (currentConfig.immat !== defaultImmat) {
        console.log(`🔄 Mise à jour immat par défaut: ${defaultImmat} (modèle ${model})`);

        // Mettre à jour le state
        updateConfig('immat', defaultImmat);

        // Mettre à jour l'input visuel
        const inputImmat = document.getElementById('inputImmat');
        if (inputImmat) {
            inputImmat.value = defaultImmat;
        }
    }
}
```

**Tests** :
- Appeler `updateDefaultImmatFromModel('980')` → Vérifier immat = "N980TB"
- Appeler `updateDefaultImmatFromModel('960')` → Vérifier immat = "N960TB"
- Set `hasCustomImmat = true` → Appeler fonction → Vérifier immat inchangée

---

#### T1.4 : Modifier listener `selectVersion` pour appeler la fonction
**Durée estimée** : 5 min

**Objectif** : Quand le modèle change, mettre à jour l'immat par défaut

**Fichier** : `code/js/app.js` lignes 692-699

**Implémentation** :
1. Après `updateConfig('version', e.target.value);` (ligne 695)
2. Appeler `updateDefaultImmatFromModel(e.target.value);`

**Code à ajouter** (ligne 696) :
```javascript
updateConfig('version', e.target.value);
updateDefaultImmatFromModel(e.target.value); // US-034: Mettre à jour immat par défaut
console.log('Version changée:', e.target.value);
```

**Tests** :
- Changer dropdown 960 → 980 → Vérifier immat = "N980TB"
- Changer dropdown 980 → 960 → Vérifier immat = "N960TB"

---

#### T1.5 : Initialiser immat par défaut au chargement
**Durée estimée** : 5 min

**Objectif** : Au chargement, appliquer l'immat par défaut selon le modèle initial

**Fichier** : `code/js/app.js` dans `initApp()` (après `initDefaultConfig()`)

**Implémentation** :
1. Après l'initialisation de la config (ligne ~1020)
2. Appeler `updateDefaultImmatFromModel(getConfig().version);`

**Code à ajouter** (après `await initDefaultConfig();`) :
```javascript
// US-034 : Initialiser immat par défaut selon modèle
updateDefaultImmatFromModel(getConfig().version);
```

**Tests** :
- Modifier `defaultConfig.version = "980"` dans config.js → Recharger → Vérifier immat = "N980TB"
- Modifier `defaultConfig.version = "960"` dans config.js → Recharger → Vérifier immat = "N960TB"

---

### US-033 : Barre de recherche pour filtrer zones couleurs par tags (5 SP)

**Contexte** :
- Chaque couleur dans le XML contient des tags après `A+` ou `NOA+`
- Format XML : `SocataWhite-29017-#dcdcd7-#D9D7C8-A+-29017-socata-white-solid-light`
  - Partie tags : `29017-socata-white-solid-light`
- On veut filtrer les dropdowns par nom OU tags (ex: "orange", "solid", "traffic")

**Fichiers impactés** :
- `code/js/api.js` : Modifier parseColorString() et getExteriorColorZones()
- `code/index.html` : Ajouter 5 inputs de recherche
- `code/js/app.js` : Event listeners + fonction de filtrage
- `code/styles/controls.css` : Styles pour les inputs de recherche

---

#### T2.1 : Modifier `parseColorString()` pour extraire les tags
**Durée estimée** : 15 min

**Objectif** : Extraire les mots-clés après A+/NOA+ dans un tableau `tags[]`

**Fichier** : `code/js/api.js` lignes 916-936

**Implémentation** :

**Code actuel** (lignes 916-936) :
```javascript
function parseColorString(colorStr) {
    const parts = colorStr.split('-');

    if (parts.length < 5) {
        return null;
    }

    const rawTag = parts[4] || '';
    const tag = rawTag === 'A+' ? 'A+' : '';

    return {
        name: parts[0],
        code: parts[1],
        contrastColor: parts[2],
        htmlColor: parts[3],
        tag: tag,
        keywords: parts.slice(5).join('-')
    };
}
```

**Code modifié** :
```javascript
function parseColorString(colorStr) {
    const parts = colorStr.split('-');

    if (parts.length < 5) {
        return null;
    }

    const rawTag = parts[4] || '';
    const tag = rawTag === 'A+' ? 'A+' : '';

    // US-033 : Extraire les tags individuels depuis parts[5:]
    // Exemple: ["29017", "socata", "white", "solid", "light"]
    const tags = parts.slice(5).filter(t => t.length > 0);

    return {
        name: parts[0],              // AlbeilleBlack
        code: parts[1],              // 22505
        contrastColor: parts[2],     // #414142
        htmlColor: parts[3],         // #424243
        tag: tag,                    // "A+" ou ""
        keywords: parts.slice(5).join('-'), // Gardé pour compatibilité
        tags: tags                   // US-033 : ["22505", "albeille", "black", "dark", "metallic"]
    };
}
```

**Tests** :
- Parser `"SocataWhite-29017-#dcdcd7-#D9D7C8-A+-29017-socata-white-solid-light"` → Vérifier tags = ["29017", "socata", "white", "solid", "light"]
- Parser `"AlbeilleBlack-22505-#414142-#424243-A+-22505-albeille-black-dark-metallic"` → Vérifier tags = ["22505", "albeille", "black", "dark", "metallic"]

---

#### T2.2 : Vérifier que `getExteriorColorZones()` stocke les tags
**Durée estimée** : 5 min

**Objectif** : S'assurer que les tags sont bien propagés dans les objets retournés

**Fichier** : `code/js/api.js` lignes 1031-1121

**Vérification** :
- La fonction `getExteriorColorZones()` appelle `parseColorString()` ligne 1099
- Le retour de `parseColorString()` est directement push dans le tableau
- Donc les `tags[]` seront automatiquement inclus ✅

**Code concerné** (ligne 1099-1103) :
```javascript
const parsedColor = parseColorString(colorStr);

if (parsedColor) {
    zones[zoneKey].push(parsedColor);
}
```

**Tests** :
- Appeler `getExteriorColorZones()` → Vérifier que chaque couleur a une propriété `tags[]`
- Afficher `zones.zoneA[0].tags` dans la console → Vérifier tableau non vide

---

#### T2.3 : Ajouter 5 inputs de recherche dans `index.html`
**Durée estimée** : 20 min

**Objectif** : Ajouter un input de recherche au-dessus de chaque dropdown de zone de couleur

**Fichier** : `code/index.html` lignes 239-258 (section "Zones Personnalisées")

**Implémentation** :

**Code actuel** (lignes 239-258) :
```html
<div class="accordion-section">
    <div class="accordion-header">
        <span>Zones Personnalisées</span>
        <span class="accordion-icon">▼</span>
    </div>
    <div class="accordion-content">
        <div class="form-group">
            <label for="selectZoneA">Zone A</label>
            <select id="selectZoneA" name="zoneA" class="form-control"></select>
        </div>
        <div class="form-group">
            <label for="selectZoneB">Zone B</label>
            <select id="selectZoneB" name="zoneB" class="form-control"></select>
        </div>
        <div class="form-group">
            <label for="selectZoneC">Zone C</label>
            <select id="selectZoneC" name="zoneC" class="form-control"></select>
        </div>
        <div class="form-group">
            <label for="selectZoneD">Zone D</label>
            <select id="selectZoneD" name="zoneD" class="form-control"></select>
        </div>
        <div class="form-group">
            <label for="selectZoneAPlus">Zone A+</label>
            <select id="selectZoneAPlus" name="zoneAPlus" class="form-control"></select>
        </div>
    </div>
</div>
```

**Code modifié** (avec inputs de recherche) :
```html
<div class="accordion-section">
    <div class="accordion-header">
        <span>Zones Personnalisées</span>
        <span class="accordion-icon">▼</span>
    </div>
    <div class="accordion-content">
        <!-- Zone A -->
        <div class="form-group">
            <label for="selectZoneA">Zone A</label>
            <input
                type="text"
                id="searchZoneA"
                class="form-control search-input"
                placeholder="Rechercher..."
                autocomplete="off"
            >
            <select id="selectZoneA" name="zoneA" class="form-control"></select>
        </div>

        <!-- Zone B -->
        <div class="form-group">
            <label for="selectZoneB">Zone B</label>
            <input
                type="text"
                id="searchZoneB"
                class="form-control search-input"
                placeholder="Rechercher..."
                autocomplete="off"
            >
            <select id="selectZoneB" name="zoneB" class="form-control"></select>
        </div>

        <!-- Zone C -->
        <div class="form-group">
            <label for="selectZoneC">Zone C</label>
            <input
                type="text"
                id="searchZoneC"
                class="form-control search-input"
                placeholder="Rechercher..."
                autocomplete="off"
            >
            <select id="selectZoneC" name="zoneC" class="form-control"></select>
        </div>

        <!-- Zone D -->
        <div class="form-group">
            <label for="selectZoneD">Zone D</label>
            <input
                type="text"
                id="searchZoneD"
                class="form-control search-input"
                placeholder="Rechercher..."
                autocomplete="off"
            >
            <select id="selectZoneD" name="zoneD" class="form-control"></select>
        </div>

        <!-- Zone A+ -->
        <div class="form-group">
            <label for="selectZoneAPlus">Zone A+</label>
            <input
                type="text"
                id="searchZoneAPlus"
                class="form-control search-input"
                placeholder="Rechercher..."
                autocomplete="off"
            >
            <select id="selectZoneAPlus" name="zoneAPlus" class="form-control"></select>
        </div>
    </div>
</div>
```

**Tests** :
- Recharger la page → Vérifier que 5 inputs de recherche sont visibles
- Vérifier que chaque input est au-dessus de son dropdown correspondant

---

#### T2.4 : Créer variable globale pour stocker les couleurs complètes
**Durée estimée** : 5 min

**Objectif** : Stocker les couleurs enrichies (avec tags[]) pour le filtrage

**Fichier** : `code/js/app.js` (au début du fichier, avec les imports)

**Implémentation** :
```javascript
// US-033 : Cache des couleurs avec tags pour le filtrage
let colorZonesData = {
    zoneA: [],
    zoneB: [],
    zoneC: [],
    zoneD: [],
    zoneAPlus: []
};
```

**Dans la fonction `populateColorDropdowns()`** (après `await getExteriorColorZones()`) :
```javascript
async function populateColorDropdowns() {
    console.log('🎨 Remplissage des dropdowns de couleurs...');

    try {
        // US-033 : Récupérer les couleurs avec tags
        colorZonesData = await getExteriorColorZones();

        // Remplir les dropdowns
        populateDropdownWithColors('selectZoneA', colorZonesData.zoneA);
        populateDropdownWithColors('selectZoneB', colorZonesData.zoneB);
        populateDropdownWithColors('selectZoneC', colorZonesData.zoneC);
        populateDropdownWithColors('selectZoneD', colorZonesData.zoneD);
        populateDropdownWithColors('selectZoneAPlus', colorZonesData.zoneAPlus);

        console.log('✅ Dropdowns de couleurs remplis');
    } catch (error) {
        console.error('❌ Erreur remplissage dropdowns couleurs:', error);
    }
}
```

---

#### T2.5 : Créer fonction `filterColorDropdown(zoneId, searchTerm)`
**Durée estimée** : 30 min

**Objectif** : Filtrer les options d'un dropdown selon le terme de recherche

**Fichier** : `code/js/app.js` (nouvelle fonction)

**Implémentation** :
```javascript
/**
 * US-033 : Filtre un dropdown de zone de couleur selon le terme de recherche
 * Recherche dans le nom de la couleur ET dans les tags
 * Insensible à la casse
 *
 * @param {string} zoneId - ID du dropdown (ex: "selectZoneA")
 * @param {string} searchTerm - Terme de recherche
 */
function filterColorDropdown(zoneId, searchTerm) {
    const dropdown = document.getElementById(zoneId);
    if (!dropdown) return;

    // Déterminer quelle zone on filtre
    const zoneMap = {
        'selectZoneA': 'zoneA',
        'selectZoneB': 'zoneB',
        'selectZoneC': 'zoneC',
        'selectZoneD': 'zoneD',
        'selectZoneAPlus': 'zoneAPlus'
    };

    const zoneKey = zoneMap[zoneId];
    if (!zoneKey || !colorZonesData[zoneKey]) {
        console.error('Zone inconnue:', zoneId);
        return;
    }

    const colors = colorZonesData[zoneKey];
    const currentValue = dropdown.value; // Sauvegarder la valeur sélectionnée

    // Normaliser le terme de recherche (lowercase, trim)
    const term = searchTerm.toLowerCase().trim();

    // Si pas de recherche, afficher tout
    if (term === '') {
        populateDropdownWithColors(zoneId, colors);
        dropdown.value = currentValue; // Restaurer la sélection
        return;
    }

    // Filtrer les couleurs
    const filteredColors = colors.filter(color => {
        // Recherche dans le nom (insensible à la casse)
        if (color.name.toLowerCase().includes(term)) {
            return true;
        }

        // Recherche dans les tags
        if (color.tags && Array.isArray(color.tags)) {
            return color.tags.some(tag => tag.toLowerCase().includes(term));
        }

        return false;
    });

    // Repeupler le dropdown avec les couleurs filtrées
    if (filteredColors.length > 0) {
        populateDropdownWithColors(zoneId, filteredColors);
        dropdown.value = currentValue; // Restaurer la sélection si elle est dans les résultats
    } else {
        // Aucune correspondance : afficher un message
        dropdown.innerHTML = '<option value="">Aucune correspondance</option>';
    }

    console.log(`🔍 Filtrage ${zoneKey}: "${term}" → ${filteredColors.length} résultats`);
}
```

**Tests** :
- Rechercher "white" → Vérifier que seules les couleurs avec "white" dans le nom ou tags apparaissent
- Rechercher "solid" → Vérifier filtrage par tag
- Rechercher "BLUE" (maj) → Vérifier insensibilité à la casse
- Rechercher "xyz" (inexistant) → Vérifier message "Aucune correspondance"
- Vider la recherche → Vérifier que toutes les couleurs réapparaissent

---

#### T2.6 : Ajouter event listeners sur les inputs de recherche
**Durée estimée** : 15 min

**Objectif** : Déclencher le filtrage quand l'utilisateur tape dans les inputs

**Fichier** : `code/js/app.js` (dans `initApp()`, après les event listeners existants)

**Implémentation** (à ajouter après les listeners des zones de couleurs) :
```javascript
// ======================================
// US-033 : Recherche par tags dans zones de couleurs
// ======================================

const searchZoneA = document.getElementById('searchZoneA');
const searchZoneB = document.getElementById('searchZoneB');
const searchZoneC = document.getElementById('searchZoneC');
const searchZoneD = document.getElementById('searchZoneD');
const searchZoneAPlus = document.getElementById('searchZoneAPlus');

if (searchZoneA) {
    searchZoneA.addEventListener('input', (e) => {
        filterColorDropdown('selectZoneA', e.target.value);
    });
}

if (searchZoneB) {
    searchZoneB.addEventListener('input', (e) => {
        filterColorDropdown('selectZoneB', e.target.value);
    });
}

if (searchZoneC) {
    searchZoneC.addEventListener('input', (e) => {
        filterColorDropdown('selectZoneC', e.target.value);
    });
}

if (searchZoneD) {
    searchZoneD.addEventListener('input', (e) => {
        filterColorDropdown('selectZoneD', e.target.value);
    });
}

if (searchZoneAPlus) {
    searchZoneAPlus.addEventListener('input', (e) => {
        filterColorDropdown('selectZoneAPlus', e.target.value);
    });
}
```

**Tests** :
- Taper dans chaque input → Vérifier que le dropdown correspondant se filtre
- Vérifier que les autres dropdowns ne sont pas affectés

---

#### T2.7 : Ajouter CSS pour les inputs de recherche
**Durée estimée** : 15 min

**Objectif** : Styliser les inputs de recherche pour cohérence avec l'UI

**Fichier** : `code/styles/controls.css` (à la fin du fichier)

**Implémentation** :
```css
/* ========================================
   US-033 : Inputs de recherche pour zones de couleurs
   ======================================== */

.search-input {
    margin-bottom: var(--spacing-sm);
    font-size: 14px;
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    transition: border-color 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    background: var(--color-bg-secondary);
}

.search-input::placeholder {
    color: var(--color-text-secondary);
    font-style: italic;
}

/* Ajuster l'espacement du dropdown qui suit */
.search-input + .form-control {
    margin-top: var(--spacing-xs);
}
```

**Tests** :
- Vérifier que les inputs ont le bon style (border, padding, couleur)
- Vérifier l'effet focus (border bleue)
- Vérifier le placeholder (texte gris italique)

---

#### T2.8 : Tests fonctionnels complets
**Durée estimée** : 20 min

**Objectif** : Valider tous les scénarios de recherche

**Scénarios de test** :

1. **Recherche par nom de couleur** :
   - Taper "white" → Vérifier que "SocataWhite", "PearlWhite", etc. apparaissent
   - Taper "black" → Vérifier filtrage

2. **Recherche par tag** :
   - Taper "solid" → Vérifier que toutes les couleurs avec tag "solid" apparaissent
   - Taper "metallic" → Vérifier filtrage

3. **Insensibilité à la casse** :
   - Taper "ORANGE" → Même résultat que "orange"
   - Taper "SoLiD" → Même résultat que "solid"

4. **Aucune correspondance** :
   - Taper "xyz" → Vérifier message "Aucune correspondance"

5. **Vider la recherche** :
   - Taper "white" → Effacer → Vérifier que toutes les couleurs réapparaissent

6. **Sélection préservée** :
   - Sélectionner "SocataWhite"
   - Taper "white" dans la recherche
   - Vérifier que "SocataWhite" reste sélectionnée

7. **Indépendance des zones** :
   - Rechercher "white" dans Zone A → Vérifier que Zone B n'est pas affectée

8. **Performance** :
   - Taper rapidement plusieurs caractères → Vérifier aucun lag
   - Vérifier console : pas d'erreurs

**Critères de validation** :
- ✅ Tous les scénarios passent
- ✅ Pas d'erreurs console
- ✅ Interface fluide (< 100ms de feedback)

---

## 📋 Checklist de Validation

### US-034
- [ ] Flag `hasCustomImmat` ajouté dans state.js
- [ ] Listener btnSubmitImmat modifié (set flag true)
- [ ] Fonction `updateDefaultImmatFromModel()` créée
- [ ] Listener selectVersion modifié (appel fonction)
- [ ] Initialisation au chargement (appel dans initApp)
- [ ] Tests : Load 960 → Immat = N960TB
- [ ] Tests : Load 980 → Immat = N980TB
- [ ] Tests : Switch 960→980 → Immat = N980TB
- [ ] Tests : Custom immat → Switch → Immat inchangée

### US-033
- [ ] parseColorString() modifié (extraction tags[])
- [ ] getExteriorColorZones() vérifié (propagation tags)
- [ ] 5 inputs de recherche ajoutés dans HTML
- [ ] Variable globale `colorZonesData` créée
- [ ] Fonction `filterColorDropdown()` créée
- [ ] Event listeners sur 5 inputs ajoutés
- [ ] CSS pour inputs de recherche ajouté
- [ ] Tests : Recherche par nom (white, black)
- [ ] Tests : Recherche par tag (solid, metallic)
- [ ] Tests : Insensibilité à la casse
- [ ] Tests : Aucune correspondance
- [ ] Tests : Vider la recherche
- [ ] Tests : Sélection préservée
- [ ] Tests : Indépendance des zones
- [ ] Tests : Performance (pas de lag)

---

## 🎯 Definition of Done

### Pour chaque US
- [ ] Tous les critères d'acceptation validés
- [ ] Code implémenté et testé
- [ ] Pas d'erreurs console
- [ ] Interface fluide et responsive
- [ ] Code commité sur Git
- [ ] Tests QA passés
- [ ] Validation stakeholder

---

**Estimation totale Sprint #9** : ~3-4h (6 SP)
- US-034 : ~30 min (1 SP)
- US-033 : ~2h30-3h (5 SP)

**Rédigé par** : ARCH
**Date** : 05/12/2025
