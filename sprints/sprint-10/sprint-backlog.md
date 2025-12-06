# Sprint Backlog - Sprint #10

**Projet** : 005-Configurateur_Daher
**Sprint** : Sprint #10
**Date de début** : 06/12/2025
**Sprint Goal** : "Corriger formatage dropdowns + Compléter configuration intérieur (Stitching + Réorganisation Sièges + Radio buttons)"
**Story Points** : 5 SP
**Durée estimée** : ~2-3h

---

## 📋 User Stories du Sprint

### [US-038] Corriger formatage noms dropdowns (1 SP) - HIGH PRIORITY
**Problème** : Les dropdowns affichent "Wite San 2192" ou "BlackOnyx_5557_Suede_Premium" au lieu de "White Sand" ou "Black Onyx"

**Critères d'acceptation** :
- Afficher uniquement le nom de base (premier segment avant underscore)
- Convertir CamelCase en espaces ("BlackOnyx" → "Black Onyx")
- Ignorer codes numériques (2192, 5557, etc.)
- Ignorer suffixes (_Premium, _Suede, _Leather)

### [US-035] Réorganiser section Sièges (1 SP)
**Objectif** : Déplacer "Ruban Ultra-Suede" de "Matériaux" vers "Sièges" et réordonner

**Ordre requis** :
1. Cuir des sièges
2. Ultra-Suede Ribbon (déplacé)
3. Stitching (à ajouter - voir US-036)
4. Matériau Central
5. Perforation des sièges
6. Ceintures

### [US-036] Ajouter paramètre Stitching (2 SP)
**Objectif** : Nouveau dropdown Interior_Stitching dans section Sièges

**Critères d'acceptation** :
- Dropdown visible dans section Sièges (position 3)
- Options extraites depuis XML (`Interior_Stitching`)
- Event listener fonctionnel
- Intégration payload API
- Synchronisation avec Prestige

### [US-037] Transformer Matériau Central en radio buttons (1 SP)
**Objectif** : Remplacer dropdown par sélecteur radio buttons

**Critères d'acceptation** :
- 2 radio buttons : Suede (gauche) / Cuir (droite)
- Valeurs : `Ultra-Suede_Premium`, `Leather_Premium`
- Event listener mis à jour
- Synchronisation avec Prestige

---

## 🔧 Décomposition Technique

### [US-038] Corriger formatage noms dropdowns (1 SP)

#### T1.1 : Débugger extractParameterOptions() pour identifier source du problème
**Fichier** : `code/js/api.js`
**Ligne** : 409-445
**Action** :
- Ajouter `console.log()` pour tracer `rawLabel` avant formatage
- Vérifier que `rawLabel.split('_')[0]` extrait bien le bon segment
- Vérifier la regex CamelCase `replace(/([A-Z])/g, ' $1')`
- Identifier si le problème vient du XML ou du code JS

**Temps estimé** : 15 min

---

#### T1.2 : Corriger la logique de formatage si nécessaire
**Fichier** : `code/js/api.js`
**Ligne** : 429-433
**Action** :
- Si la regex ne fonctionne pas, la corriger
- Si le XML contient déjà des codes, filtrer AVANT le split
- Exemples à tester :
  - `"BlackOnyx_5557_Suede_Premium"` → `"Black Onyx"`
  - `"WhiteSand_2192_Leather"` → `"White Sand"`
  - `"Aegean_2242"` → `"Aegean"`

**Code actuel** :
```javascript
const namePart = rawLabel.split('_')[0];
displayLabel = namePart.replace(/([A-Z])/g, ' $1').trim();
```

**Code corrigé possible** (si nécessaire) :
```javascript
// Prendre le premier segment (avant underscore)
const namePart = rawLabel.split('_')[0];
// Enlever tout chiffre résiduel
const cleanName = namePart.replace(/\d+/g, '');
// Convertir CamelCase en espaces : "BlackOnyx" → "Black Onyx"
displayLabel = cleanName.replace(/([A-Z])/g, ' $1').trim();
```

**Temps estimé** : 15 min

---

#### T1.3 : Tester sur tous les dropdowns concernés
**Fichiers** : `code/index.html` (lignes 374-441)
**Action** :
- Tester dropdowns section Sièges : seat-covers, seatbelts, central-seat-material
- Tester dropdowns section Matériaux : upper-side-panel, lower-side-panel, ultra-suede-ribbon
- Vérifier console : 0 erreur
- Vérifier affichage : Noms propres sans codes

**Temps estimé** : 10 min

**Critères de validation** :
- ✅ "BlackOnyx_5557_Suede_Premium" affiche "Black Onyx"
- ✅ "WhiteSand_2192" affiche "White Sand"
- ✅ Aucun code numérique visible
- ✅ Aucun suffixe _Premium visible

---

### [US-035] Réorganiser section Sièges (1 SP)

#### T2.1 : Déplacer Ultra-Suede Ribbon de Matériaux vers Sièges
**Fichier** : `code/index.html`
**Lignes concernées** : 374-441
**Action** :
- Couper le bloc `<div class="form-group">` pour ultra-suede-ribbon (lignes 436-439)
- Le coller dans la section Sièges APRÈS "Cuir des sièges"
- Ajuster l'indentation pour cohérence

**Avant** (Matériaux, ligne 436-439) :
```html
<div class="form-group">
    <label for="ultra-suede-ribbon">Ruban Ultra-Suede</label>
    <select id="ultra-suede-ribbon" class="form-control"></select>
</div>
```

**Après** (Sièges, position 2) : Insérer après seat-covers

**Temps estimé** : 5 min

---

#### T2.2 : Réordonner les éléments dans Sièges
**Fichier** : `code/index.html`
**Lignes** : 380-406
**Action** :
Réorganiser pour obtenir cet ordre :
1. Cuir des sièges (seat-covers) - déjà en place
2. Ultra-Suede Ribbon (ultra-suede-ribbon) - déplacé de Matériaux
3. **[PLACEHOLDER]** Stitching (stitching) - sera ajouté par US-036
4. Matériau Central (central-seat-material) - déjà en place
5. Perforation des sièges (perforated-seat) - déjà en place
6. Ceintures (seatbelts) - DÉPLACER vers la fin

**Modification** : Déplacer le bloc seatbelts (lignes 385-388) APRÈS perforation des sièges

**Temps estimé** : 5 min

---

#### T2.3 : Vérifier intégrité HTML et indentation
**Fichier** : `code/index.html`
**Action** :
- Vérifier que toutes les balises `<div>` sont fermées
- Vérifier l'indentation (cohérence espaces)
- Vérifier que les IDs restent uniques
- Tester chargement de la page : 0 erreur console

**Temps estimé** : 5 min

---

### [US-036] Ajouter paramètre Stitching (2 SP)

#### T3.1 : Ajouter extraction Interior_Stitching dans getInteriorOptionsFromXML()
**Fichier** : `code/js/api.js`
**Ligne** : 454-473
**Action** :
Ajouter l'extraction du paramètre Stitching depuis le XML

**Code actuel** (ligne 457-469) :
```javascript
const options = {
    carpet: extractParameterOptions(xmlDoc, 'Interior_Carpet'),
    seatCovers: extractParameterOptions(xmlDoc, 'Interior_SeatCovers'),
    tabletFinish: extractParameterOptions(xmlDoc, 'Interior_TabletFinish'),
    seatbelts: extractParameterOptions(xmlDoc, 'Interior_Seatbelts'),
    metalFinish: extractParameterOptions(xmlDoc, 'Interior_MetalFinish'),
    upperSidePanel: extractParameterOptions(xmlDoc, 'Interior_UpperSidePanel'),
    lowerSidePanel: extractParameterOptions(xmlDoc, 'Interior_LowerSidePanel'),
    ultraSuedeRibbon: extractParameterOptions(xmlDoc, 'Interior_Ultra-SuedeRibbon'),
    centralSeatMaterial: extractParameterOptions(xmlDoc, 'Interior_CentralSeatMaterial')
};
```

**Code modifié** (ajouter après centralSeatMaterial) :
```javascript
const options = {
    carpet: extractParameterOptions(xmlDoc, 'Interior_Carpet'),
    seatCovers: extractParameterOptions(xmlDoc, 'Interior_SeatCovers'),
    tabletFinish: extractParameterOptions(xmlDoc, 'Interior_TabletFinish'),
    seatbelts: extractParameterOptions(xmlDoc, 'Interior_Seatbelts'),
    metalFinish: extractParameterOptions(xmlDoc, 'Interior_MetalFinish'),
    upperSidePanel: extractParameterOptions(xmlDoc, 'Interior_UpperSidePanel'),
    lowerSidePanel: extractParameterOptions(xmlDoc, 'Interior_LowerSidePanel'),
    ultraSuedeRibbon: extractParameterOptions(xmlDoc, 'Interior_Ultra-SuedeRibbon'),
    centralSeatMaterial: extractParameterOptions(xmlDoc, 'Interior_CentralSeatMaterial'),
    stitching: extractParameterOptions(xmlDoc, 'Interior_Stitching') // US-036
};
```

**Ajouter log** (ligne 470-472) :
```javascript
log.int('✓ Stitching:', options.stitching.length, 'options');
```

**Temps estimé** : 10 min

---

#### T3.2 : Ajouter propriété stitching dans state.js
**Fichier** : `code/js/state.js`
**Ligne** : 32-41
**Action** :
Ajouter la propriété `stitching` dans la config du state

**Code actuel** (ligne 32-41) :
```javascript
// US-027 : Configuration intérieur personnalisée
carpet: DEFAULT_CONFIG.carpet,
seatCovers: DEFAULT_CONFIG.seatCovers,
tabletFinish: DEFAULT_CONFIG.tabletFinish,
seatbelts: DEFAULT_CONFIG.seatbelts,
metalFinish: DEFAULT_CONFIG.metalFinish,
upperSidePanel: DEFAULT_CONFIG.upperSidePanel,
lowerSidePanel: DEFAULT_CONFIG.lowerSidePanel,
ultraSuedeRibbon: DEFAULT_CONFIG.ultraSuedeRibbon,
centralSeatMaterial: DEFAULT_CONFIG.centralSeatMaterial,
perforatedSeatOptions: DEFAULT_CONFIG.perforatedSeatOptions,
```

**Code modifié** (ajouter après centralSeatMaterial) :
```javascript
centralSeatMaterial: DEFAULT_CONFIG.centralSeatMaterial,
stitching: DEFAULT_CONFIG.stitching, // US-036
perforatedSeatOptions: DEFAULT_CONFIG.perforatedSeatOptions,
```

**Temps estimé** : 5 min

---

#### T3.3 : Ajouter valeur par défaut stitching dans config.js
**Fichier** : `code/js/config.js`
**Action** :
Ajouter une valeur par défaut pour `stitching`

**Code à ajouter** (dans l'objet DEFAULT_CONFIG) :
```javascript
stitching: null, // US-036 : Sera initialisé depuis le XML ou Prestige
```

**Temps estimé** : 2 min

---

#### T3.4 : Ajouter dropdown Stitching dans index.html
**Fichier** : `code/index.html`
**Ligne** : Après ultra-suede-ribbon dans section Sièges
**Action** :
Insérer le dropdown Stitching à la position 3 (après Ultra-Suede, avant Matériau Central)

**Code HTML à ajouter** :
```html
<div class="form-group">
    <label for="stitching">Stitching</label>
    <select id="stitching" class="form-control"></select>
</div>
```

**Temps estimé** : 5 min

---

#### T3.5 : Peupler dropdown Stitching dans app.js (init)
**Fichier** : `code/js/app.js`
**Ligne** : ~487-495 (zone d'initialisation des dropdowns intérieur)
**Action** :
Ajouter le peuplement du dropdown stitching après ultra-suede-ribbon

**Code actuel** (ligne 487-495) :
```javascript
populateDropdown('carpet', interiorOptions.carpet, config.carpet);
populateDropdown('seat-covers', interiorOptions.seatCovers, config.seatCovers);
populateDropdown('tablet-finish', interiorOptions.tabletFinish, config.tabletFinish);
populateDropdown('seatbelts', interiorOptions.seatbelts, config.seatbelts);
populateDropdown('metal-finish', interiorOptions.metalFinish, config.metalFinish);
populateDropdown('upper-side-panel', interiorOptions.upperSidePanel, config.upperSidePanel);
populateDropdown('lower-side-panel', interiorOptions.lowerSidePanel, config.lowerSidePanel);
populateDropdown('ultra-suede-ribbon', interiorOptions.ultraSuedeRibbon, config.ultraSuedeRibbon);
populateDropdown('central-seat-material', interiorOptions.centralSeatMaterial, config.centralSeatMaterial);
```

**Code modifié** (ajouter après ultra-suede-ribbon) :
```javascript
populateDropdown('ultra-suede-ribbon', interiorOptions.ultraSuedeRibbon, config.ultraSuedeRibbon);
populateDropdown('stitching', interiorOptions.stitching, config.stitching); // US-036
populateDropdown('central-seat-material', interiorOptions.centralSeatMaterial, config.centralSeatMaterial);
```

**Temps estimé** : 5 min

---

#### T3.6 : Ajouter event listener pour Stitching
**Fichier** : `code/js/app.js`
**Ligne** : Zone des event listeners intérieur (~900-950)
**Action** :
Ajouter un event listener `change` pour le dropdown stitching

**Code à ajouter** :
```javascript
// US-036 : Event listener Stitching
const selectStitching = document.getElementById('stitching');
if (selectStitching) {
    selectStitching.addEventListener('change', (e) => {
        updateConfig('stitching', e.target.value);
        log.int(`Stitching changé : ${e.target.value}`);
        fetchRenderImages(); // Régénérer les rendus
    });
}
```

**Temps estimé** : 5 min

---

#### T3.7 : Intégrer Stitching dans payload API (buildPayload)
**Fichier** : `code/js/api.js`
**Ligne** : Zone de construction du payload (~buildPayload ou fonction similaire)
**Action** :
Ajouter `Interior_Stitching.${config.stitching}` dans la chaîne de configuration

**Note** : Vérifier où les paramètres intérieur sont ajoutés au payload (probablement dans une fonction qui construit la configuration string)

**Temps estimé** : 10 min

---

#### T3.8 : Synchroniser Stitching avec sélection Prestige
**Fichier** : `code/js/app.js`
**Ligne** : Fonction de synchronisation Prestige (~initPrestigeSync ou similaire)
**Action** :
Quand l'utilisateur sélectionne un Prestige (Oslo, SanPedro, etc.), le Stitching doit se mettre à jour automatiquement depuis le XML

**Code à localiser** : Fonction qui gère `selectPrestige.addEventListener('change', ...)`

**Code à ajouter** :
```javascript
// Extraire la valeur Stitching depuis le XML pour le prestige sélectionné
const stitchingValue = /* extraction depuis XML */;
updateConfig('stitching', stitchingValue);
const selectStitching = document.getElementById('stitching');
if (selectStitching) {
    selectStitching.value = stitchingValue;
}
```

**Temps estimé** : 15 min

---

### [US-037] Transformer Matériau Central en radio buttons (1 SP)

#### T4.1 : Remplacer dropdown par radio buttons dans index.html
**Fichier** : `code/index.html`
**Ligne** : 389-392 (dropdown central-seat-material)
**Action** :
Remplacer le dropdown par un groupe de radio buttons

**Code actuel** (lignes 389-392) :
```html
<div class="form-group">
    <label for="central-seat-material">Matériau central</label>
    <select id="central-seat-material" class="form-control"></select>
</div>
```

**Code modifié** (format radio buttons) :
```html
<div class="form-group">
    <label>Matériau central</label>
    <div class="radio-group">
        <label class="radio-label">
            <input type="radio" name="central-seat-material" value="Ultra-Suede_Premium" checked>
            <span>Suede</span>
        </label>
        <label class="radio-label">
            <input type="radio" name="central-seat-material" value="Leather_Premium">
            <span>Cuir</span>
        </label>
    </div>
</div>
```

**Note** : Supprimer l'attribut `id="central-seat-material"` car les radio buttons utilisent `name` au lieu de `id`

**Temps estimé** : 10 min

---

#### T4.2 : Modifier event listener dans app.js
**Fichier** : `code/js/app.js`
**Ligne** : Zone event listeners intérieur
**Action** :
Modifier le listener pour écouter les radio buttons au lieu d'un dropdown

**Code actuel** (format dropdown) :
```javascript
const selectCentralSeatMaterial = document.getElementById('central-seat-material');
if (selectCentralSeatMaterial) {
    selectCentralSeatMaterial.addEventListener('change', (e) => {
        updateConfig('centralSeatMaterial', e.target.value);
        log.int(`Matériau central changé : ${e.target.value}`);
        fetchRenderImages();
    });
}
```

**Code modifié** (format radio buttons) :
```javascript
// US-037 : Radio buttons Matériau Central
const radioCentralSeatMaterial = document.querySelectorAll('input[name="central-seat-material"]');
radioCentralSeatMaterial.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            updateConfig('centralSeatMaterial', e.target.value);
            log.int(`Matériau central changé : ${e.target.value}`);
            fetchRenderImages();
        }
    });
});
```

**Temps estimé** : 10 min

---

#### T4.3 : Supprimer peuplement dropdown dans app.js (init)
**Fichier** : `code/js/app.js`
**Ligne** : ~495 (ligne populateDropdown central-seat-material)
**Action** :
Supprimer la ligne `populateDropdown('central-seat-material', ...)` car les radio buttons ont des valeurs statiques dans le HTML

**Code à supprimer** :
```javascript
populateDropdown('central-seat-material', interiorOptions.centralSeatMaterial, config.centralSeatMaterial);
```

**Temps estimé** : 2 min

---

#### T4.4 : Synchroniser radio buttons avec Prestige
**Fichier** : `code/js/app.js`
**Ligne** : Fonction synchronisation Prestige
**Action** :
Quand un Prestige est sélectionné, cocher le bon radio button (Suede ou Cuir)

**Code à ajouter** :
```javascript
// Extraire la valeur Central Seat Material depuis le XML pour le prestige
const centralSeatValue = /* extraction depuis XML */;
updateConfig('centralSeatMaterial', centralSeatValue);

// Cocher le bon radio button
const radioCentralSeat = document.querySelector(`input[name="central-seat-material"][value="${centralSeatValue}"]`);
if (radioCentralSeat) {
    radioCentralSeat.checked = true;
}
```

**Temps estimé** : 10 min

---

#### T4.5 : Tester les deux options (Suede / Cuir)
**Action** :
- Cliquer sur "Suede" → Vérifier payload API contient `Interior_CentralSeatMaterial.Ultra-Suede_Premium`
- Cliquer sur "Cuir" → Vérifier payload API contient `Interior_CentralSeatMaterial.Leather_Premium`
- Vérifier que le rendu se régénère correctement
- Vérifier console : 0 erreur

**Temps estimé** : 10 min

---

## 📊 Estimation Totale

| US | Tâches | Temps Estimé |
|----|--------|--------------|
| US-038 | T1.1, T1.2, T1.3 | 40 min |
| US-035 | T2.1, T2.2, T2.3 | 15 min |
| US-036 | T3.1-T3.8 | 57 min |
| US-037 | T4.1-T4.5 | 42 min |
| **TOTAL** | **17 tâches** | **~2h30** |

---

## 🎯 Definition of Done (Sprint #10)

### Pour chaque US

- [ ] Code implémenté selon tâches techniques
- [ ] Tests manuels passés (DEV)
- [ ] Tests QA documentés (QA-Fonctionnel)
- [ ] Console sans erreurs
- [ ] Commits Git effectués avec messages clairs
- [ ] Validation Stakeholder

### Pour le Sprint

- [ ] 4 US complétées (US-038, US-035, US-036, US-037)
- [ ] Sprint Review effectuée
- [ ] Sprint Retrospective documentée
- [ ] Product Backlog mis à jour (US → Done)
- [ ] Kanban Board archivé
- [ ] sprints-summary.md mis à jour

---

## 📝 Notes Techniques

### Ordre de développement recommandé

1. **US-038 FIRST** (bug fix prioritaire) : Corriger formatage noms dropdowns
2. **US-035** : Réorganiser section Sièges (HTML simple)
3. **US-036** : Ajouter Stitching (nouvelle feature complète)
4. **US-037** : Transformer Matériau Central en radio buttons

**Raison** : Corriger le bug de formatage AVANT d'ajouter le nouveau dropdown Stitching permet de s'assurer que Stitching s'affichera correctement dès le début.

### Points d'attention

1. **Formatage (US-038)** : Si le problème vient du XML et non du code JS, documenter dans la Retrospective
2. **Prestige Sync (US-036, US-037)** : Bien tester la synchronisation automatique quand on change de Prestige
3. **Radio buttons (US-037)** : Vérifier que le CSS existant (`.radio-group`, `.radio-label`) s'applique correctement
4. **Payload API** : Vérifier que `Interior_Stitching` et `Interior_CentralSeatMaterial` sont bien envoyés à l'API

---

**Créé par** : ARCH
**Date** : 06/12/2025
**Prêt pour développement** : ✅ OUI
