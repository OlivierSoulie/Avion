# Sprint Backlog - Sprint #6

**Sprint Goal** : Implémenter un configurateur intérieur complet avec 10 paramètres personnalisables (sièges, matériaux, finitions) organisés en 2 sections, visible uniquement en vue intérieure, avec initialisation depuis le sélecteur Prestige.

**Capacity** : 10 SP
**Équipe** : 6 agents (PO, ARCH, DEV, QA, DOC, COORDINATOR)
**Durée estimée** : ~5-6 heures de développement

---

## Vue d'ensemble US-027

**Contexte** :
- Cette fonctionnalité n'existe PAS dans le script Python (innovation web)
- Le sélecteur "Prestige" actuel reste et sert de **template de base**
- Ajout de 10 nouveaux dropdowns pour personnalisation individuelle
- Visible uniquement en vue intérieure

**Architecture** :
- Parser le XML pour extraire les valeurs Prestige (10 parties de config string)
- 10 dropdowns organisés en 2 sections : "Sièges" (4) + "Matériaux et finitions" (6)
- Modification de `getConfigString()` pour utiliser les valeurs individuelles au lieu de `Interior_PrestigeSelection.{prestige}`

---

## Tâches US-027 (Ordre de dépendance)

### Layer 1 : Configuration et Data (T1-T2) - 45 min

#### [T1] Créer les 10 listes de choix dans config.js (30 min)

**Description** :
Ajouter les 10 constantes exportées avec toutes les options disponibles

**Détails** :
```javascript
// Sièges (4 listes)
export const SEAT_COVERS_LIST = [
  { label: "Beige Gray 2176", value: "BeigeGray_2176_Leather_Premium" },
  // ... 45 autres couleurs de cuir
];

export const SEATBELTS_LIST = [
  { label: "Black Jet", value: "BlackJet_belt" },
  { label: "Chrome Gray", value: "ChromeGray_belt" },
  { label: "Oat Meal", value: "OatMeal_belt" },
  { label: "Soft Moon", value: "SoftMoon_belt" }
];

export const CENTRAL_SEAT_MATERIAL_LIST = [
  { label: "Cuir", value: "Leather_Premium" },
  { label: "Ultra-Suede", value: "Ultra-Suede_Premium" }
];

export const PERFORATED_SEAT_OPTIONS_LIST = [
  { label: "Sans perforation", value: "NoSeatPerforation_Premium" },
  { label: "Perforation centrale", value: "SeatCenterPerforation_Premium" }
];

// Matériaux et finitions (6 listes)
export const CARPET_LIST = [
  { label: "Charcoal Black", value: "CharcoalBlack_carpet_Premium" },
  { label: "Light Brown", value: "LightBrown_carpet_Premium" },
  { label: "Taupe Gray", value: "TaupeGray_carpet_Premium" }
];

export const TABLET_FINISH_LIST = [
  { label: "Carbon", value: "Carbon_table_wood_Premium" },
  { label: "Glossy Walnut", value: "GlossyWalnut_table_wood_Premium" },
  { label: "Koto Mat", value: "KotoMat_table_wood_Premium" },
  { label: "Sapelli Mat", value: "SapelliMat_table_wood_Premium" }
];

export const METAL_FINISH_LIST = [
  { label: "Brushed Stainless", value: "BrushedStainless_metal_Premium" },
  { label: "Flat Black", value: "FlatBlack_metal_Premium" },
  { label: "Gold", value: "Gold_metal_Premium" }
];

export const UPPER_SIDE_PANEL_LIST = SEAT_COVERS_LIST; // Réutilise la liste cuir

export const LOWER_SIDE_PANEL_LIST = SEAT_COVERS_LIST; // Réutilise la liste cuir

export const ULTRA_SUEDE_RIBBON_LIST = [
  { label: "Black Onyx 3368", value: "BlackOnyx_3368_Suede_Premium" },
  { label: "Bone 3386", value: "Bone_3386_Suede_Premium" },
  { label: "Elephant 3367", value: "Elephant_3367_Suede_Premium" },
  // ... 9 autres couleurs Ultra-Suede
];
```

**Fichier** : `code/js/config.js`

**Critères d'acceptation** :
- 10 constantes exportées
- Format { label, value } cohérent
- Réutilisation des listes communes (SEAT_COVERS pour panneaux)

---

#### [T2] Ajouter valeurs par défaut dans DEFAULT_CONFIG (15 min)

**Description** :
Ajouter les 10 propriétés intérieur dans DEFAULT_CONFIG (basé sur Prestige Oslo)

**Détails** :
```javascript
export const DEFAULT_CONFIG = {
    // ... existant ...

    // US-027 : Configuration intérieur personnalisée
    carpet: "LightBrown_carpet_Premium",
    seatCovers: "BeigeGray_2176_Leather_Premium",
    tabletFinish: "SapelliMat_table_wood_Premium",
    seatbelts: "OatMeal_belt",
    metalFinish: "BrushedStainless_metal_Premium",
    upperSidePanel: "WhiteSand_2192_Leather_Premium",
    lowerSidePanel: "BeigeGray_2176_Leather_Premium",
    ultraSuedeRibbon: "Elephant_3367_Suede_Premium",
    centralSeatMaterial: "Leather_Premium",
    perforatedSeatOptions: "NoSeatPerforation_Premium"
};
```

**Fichier** : `code/js/config.js`

**Critères d'acceptation** :
- 10 propriétés ajoutées
- Valeurs correspondent au Prestige Oslo
- Cohérence avec les listes créées en T1

---

### Layer 2 : State Management (T3-T4) - 30 min

#### [T3] Ajouter 10 propriétés dans l'état initial (10 min)

**Description** :
Ajouter les 10 propriétés dans l'objet `state.config`

**Détails** :
```javascript
const state = {
    config: {
        // ... existant ...

        // US-027 : Configuration intérieur
        carpet: DEFAULT_CONFIG.carpet,
        seatCovers: DEFAULT_CONFIG.seatCovers,
        tabletFinish: DEFAULT_CONFIG.tabletFinish,
        seatbelts: DEFAULT_CONFIG.seatbelts,
        metalFinish: DEFAULT_CONFIG.metalFinish,
        upperSidePanel: DEFAULT_CONFIG.upperSidePanel,
        lowerSidePanel: DEFAULT_CONFIG.lowerSidePanel,
        ultraSuedeRibbon: DEFAULT_CONFIG.ultraSuedeRibbon,
        centralSeatMaterial: DEFAULT_CONFIG.centralSeatMaterial,
        perforatedSeatOptions: DEFAULT_CONFIG.perforatedSeatOptions
    },
    // ...
};
```

**Fichier** : `code/js/state.js`

**Critères d'acceptation** :
- 10 propriétés ajoutées dans `state.config`
- Import correct depuis DEFAULT_CONFIG

---

#### [T4] Créer 10 getters dans state.js (20 min)

**Description** :
Créer les fonctions getter pour chaque propriété intérieur

**Détails** :
```javascript
/**
 * US-027 : Retourne le tapis sélectionné
 * @returns {string} Ex: "LightBrown_carpet_Premium"
 */
export function getCarpet() {
    return state.config.carpet;
}

/**
 * US-027 : Retourne le cuir des sièges
 * @returns {string} Ex: "BeigeGray_2176_Leather_Premium"
 */
export function getSeatCovers() {
    return state.config.seatCovers;
}

// ... Idem pour les 8 autres propriétés :
// - getTabletFinish()
// - getSeatbelts()
// - getMetalFinish()
// - getUpperSidePanel()
// - getLowerSidePanel()
// - getUltraSuedeRibbon()
// - getCentralSeatMaterial()
// - getPerforatedSeatOptions()
```

**Fichier** : `code/js/state.js`

**Critères d'acceptation** :
- 10 fonctions getter créées
- Documentation JSDoc pour chacune
- Nommage cohérent (get + PascalCase)

---

### Layer 3 : Parsing XML (T5) - 45 min

#### [T5] Créer parsePrestigeConfig() dans api.js (45 min)

**Description** :
Fonction qui parse le XML pour extraire les 10 valeurs d'un prestige

**Logique** :
1. Chercher `ConfigurationBookmark[label="Interior_PrestigeSelection_{prestigeName}"]`
2. Extraire l'attribut `value` (format : `Interior_Carpet.XXX/Interior_CentralSeatMaterial.YYY/...`)
3. Splitter par `/` et parser chaque partie
4. Retourner objet avec les 10 propriétés

**Détails** :
```javascript
/**
 * US-027 : Parse le XML pour extraire la config intérieur d'un prestige
 *
 * @param {XMLDocument} xmlDoc - Le document XML parsé
 * @param {string} prestigeName - Nom du prestige (ex: "Oslo")
 * @returns {Object} Objet avec 10 propriétés : { carpet, seatCovers, tabletFinish, ... }
 * @throws {Error} Si le bookmark n'est pas trouvé
 */
export function parsePrestigeConfig(xmlDoc, prestigeName) {
    console.log(`🔍 Parsing prestige config: ${prestigeName}`);

    const bookmarkLabel = `Interior_PrestigeSelection_${prestigeName}`;
    const bookmark = xmlDoc.querySelector(`ConfigurationBookmark[label="${bookmarkLabel}"]`);

    if (!bookmark) {
        throw new Error(`Prestige "${prestigeName}" introuvable dans le XML`);
    }

    const value = bookmark.getAttribute('value');
    if (!value) {
        throw new Error(`Prestige "${prestigeName}" sans valeur dans le XML`);
    }

    console.log(`   Config string prestige: ${value}`);

    // Parser la config string : Interior_Carpet.XXX/Interior_CentralSeatMaterial.YYY/...
    const parts = value.split('/');
    const config = {};

    parts.forEach(part => {
        if (part.startsWith('Interior_Carpet.')) {
            config.carpet = part.replace('Interior_Carpet.', '');
        } else if (part.startsWith('Interior_CentralSeatMaterial.')) {
            config.centralSeatMaterial = part.replace('Interior_CentralSeatMaterial.', '');
        } else if (part.startsWith('Interior_LowerSidePanel.')) {
            config.lowerSidePanel = part.replace('Interior_LowerSidePanel.', '');
        } else if (part.startsWith('Interior_MetalFinish.')) {
            config.metalFinish = part.replace('Interior_MetalFinish.', '');
        } else if (part.startsWith('Interior_PerforatedSeatOptions.')) {
            config.perforatedSeatOptions = part.replace('Interior_PerforatedSeatOptions.', '');
        } else if (part.startsWith('Interior_SeatCovers.')) {
            config.seatCovers = part.replace('Interior_SeatCovers.', '');
        } else if (part.startsWith('Interior_Seatbelts.')) {
            config.seatbelts = part.replace('Interior_Seatbelts.', '');
        } else if (part.startsWith('Interior_TabletFinish.')) {
            config.tabletFinish = part.replace('Interior_TabletFinish.', '');
        } else if (part.startsWith('Interior_Ultra-SuedeRibbon.')) {
            config.ultraSuedeRibbon = part.replace('Interior_Ultra-SuedeRibbon.', '');
        } else if (part.startsWith('Interior_UpperSidePanel.')) {
            config.upperSidePanel = part.replace('Interior_UpperSidePanel.', '');
        }
    });

    console.log('   Prestige config parsed:', config);
    return config;
}
```

**Fichier** : `code/js/api.js`

**Critères d'acceptation** :
- Fonction parsePrestigeConfig() exportée
- Parse correctement les 10 parties
- Gestion d'erreur si bookmark introuvable
- Logs console pour debug

**Tests unitaires à prévoir** :
- Tester avec "Oslo", "London", "SanPedro"
- Vérifier que les 10 propriétés sont présentes

---

### Layer 4 : Modification Config String (T6) - 30 min

#### [T6] Modifier getConfigString() pour utiliser valeurs individuelles (30 min)

**Description** :
Remplacer `Interior_PrestigeSelection.{prestige}` par la construction des 10 parties individuelles

**Avant (ligne 197)** :
```javascript
const interiorConfig = getConfigFromLabel(xmlRoot, `Interior_PrestigeSelection_${config.prestige}`)
    || `Interior_PrestigeSelection.${config.prestige}`;
```

**Après** :
```javascript
// US-027 : Construire config intérieur personnalisée (10 parties)
const interiorConfig = [
    `Interior_Carpet.${config.carpet}`,
    `Interior_CentralSeatMaterial.${config.centralSeatMaterial}`,
    `Interior_LowerSidePanel.${config.lowerSidePanel}`,
    `Interior_MetalFinish.${config.metalFinish}`,
    `Interior_PerforatedSeatOptions.${config.perforatedSeatOptions}`,
    `Interior_SeatCovers.${config.seatCovers}`,
    `Interior_Seatbelts.${config.seatbelts}`,
    `Interior_TabletFinish.${config.tabletFinish}`,
    `Interior_Ultra-SuedeRibbon.${config.ultraSuedeRibbon}`,
    `Interior_UpperSidePanel.${config.upperSidePanel}`
].join('/');
```

**Fichier** : `code/js/api.js`

**Critères d'acceptation** :
- Les 10 parties sont construites dans le bon ordre
- Format `Interior_XXX.{valeur}` correct
- Join avec `/` entre les parties
- Config string finale valide pour l'API

**Note architecturale** :
L'ordre des parties doit correspondre à l'ordre du XML pour éviter des bugs subtils

---

### Layer 5 : Interface Utilisateur (T7-T8) - 60 min

#### [T7] Créer structure HTML avec 2 sections (30 min)

**Description** :
Ajouter les 10 dropdowns organisés en 2 sections dans index.html

**Structure** :
```html
<!-- US-027 : Configuration Intérieur Personnalisée -->
<div id="interior-config-section" class="config-section" style="display: none;">
    <h3>Configuration Intérieur</h3>

    <!-- SECTION 1 : SIÈGES -->
    <div class="interior-subsection">
        <h4>Sièges</h4>

        <div class="control-group">
            <label for="seat-covers">Cuir des sièges</label>
            <select id="seat-covers">
                <!-- Options dynamiques depuis SEAT_COVERS_LIST -->
            </select>
        </div>

        <div class="control-group">
            <label for="seatbelts">Ceintures de sécurité</label>
            <select id="seatbelts">
                <!-- Options dynamiques depuis SEATBELTS_LIST -->
            </select>
        </div>

        <div class="control-group">
            <label for="central-seat-material">Matériau siège central</label>
            <select id="central-seat-material">
                <!-- Options dynamiques depuis CENTRAL_SEAT_MATERIAL_LIST -->
            </select>
        </div>

        <div class="control-group">
            <label for="perforated-seat-options">Perforation des sièges</label>
            <select id="perforated-seat-options">
                <!-- Options dynamiques depuis PERFORATED_SEAT_OPTIONS_LIST -->
            </select>
        </div>
    </div>

    <!-- SECTION 2 : MATÉRIAUX ET FINITIONS -->
    <div class="interior-subsection">
        <h4>Matériaux et finitions</h4>

        <div class="control-group">
            <label for="carpet">Tapis</label>
            <select id="carpet">
                <!-- Options dynamiques depuis CARPET_LIST -->
            </select>
        </div>

        <div class="control-group">
            <label for="tablet-finish">Bois de la tablette</label>
            <select id="tablet-finish">
                <!-- Options dynamiques depuis TABLET_FINISH_LIST -->
            </select>
        </div>

        <div class="control-group">
            <label for="metal-finish">Finition métallique</label>
            <select id="metal-finish">
                <!-- Options dynamiques depuis METAL_FINISH_LIST -->
            </select>
        </div>

        <div class="control-group">
            <label for="upper-side-panel">Panneau latéral supérieur</label>
            <select id="upper-side-panel">
                <!-- Options dynamiques depuis UPPER_SIDE_PANEL_LIST -->
            </select>
        </div>

        <div class="control-group">
            <label for="lower-side-panel">Panneau latéral inférieur</label>
            <select id="lower-side-panel">
                <!-- Options dynamiques depuis LOWER_SIDE_PANEL_LIST -->
            </select>
        </div>

        <div class="control-group">
            <label for="ultra-suede-ribbon">Ruban Ultra-Suede</label>
            <select id="ultra-suede-ribbon">
                <!-- Options dynamiques depuis ULTRA_SUEDE_RIBBON_LIST -->
            </select>
        </div>
    </div>
</div>
```

**Fichier** : `code/index.html`

**Position** : Après les contrôles existants (vue extérieur/intérieur, portes, etc.)

**Critères d'acceptation** :
- Section principale avec id="interior-config-section"
- 2 sous-sections : "Sièges" (4 dropdowns) et "Matériaux et finitions" (6 dropdowns)
- Labels en français clairs
- IDs uniques pour chaque dropdown
- Masqué par défaut (style="display: none;")

---

#### [T8] Peupler les dropdowns dynamiquement au chargement (30 min)

**Description** :
Remplir les 10 dropdowns avec les options depuis les listes config.js

**Logique (dans app.js)** :
```javascript
import {
    CARPET_LIST, SEAT_COVERS_LIST, TABLET_FINISH_LIST, SEATBELTS_LIST,
    METAL_FINISH_LIST, UPPER_SIDE_PANEL_LIST, LOWER_SIDE_PANEL_LIST,
    ULTRA_SUEDE_RIBBON_LIST, CENTRAL_SEAT_MATERIAL_LIST, PERFORATED_SEAT_OPTIONS_LIST
} from './config.js';

/**
 * US-027 : Peuple un dropdown avec une liste d'options
 */
function populateDropdown(selectId, optionsList, defaultValue) {
    const select = document.getElementById(selectId);
    select.innerHTML = ''; // Clear

    optionsList.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        if (option.value === defaultValue) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });
}

// Au chargement de la page (dans initApp() ou équivalent)
const config = getConfig();

populateDropdown('carpet', CARPET_LIST, config.carpet);
populateDropdown('seat-covers', SEAT_COVERS_LIST, config.seatCovers);
populateDropdown('tablet-finish', TABLET_FINISH_LIST, config.tabletFinish);
populateDropdown('seatbelts', SEATBELTS_LIST, config.seatbelts);
populateDropdown('metal-finish', METAL_FINISH_LIST, config.metalFinish);
populateDropdown('upper-side-panel', UPPER_SIDE_PANEL_LIST, config.upperSidePanel);
populateDropdown('lower-side-panel', LOWER_SIDE_PANEL_LIST, config.lowerSidePanel);
populateDropdown('ultra-suede-ribbon', ULTRA_SUEDE_RIBBON_LIST, config.ultraSuedeRibbon);
populateDropdown('central-seat-material', CENTRAL_SEAT_MATERIAL_LIST, config.centralSeatMaterial);
populateDropdown('perforated-seat-options', PERFORATED_SEAT_OPTIONS_LIST, config.perforatedSeatOptions);
```

**Fichier** : `code/js/app.js`

**Critères d'acceptation** :
- Fonction populateDropdown() réutilisable
- Les 10 dropdowns sont peuplés au chargement
- Valeurs par défaut sélectionnées (depuis state)
- Import correct des 10 listes depuis config.js

---

### Layer 6 : Event Listeners (T9-T10) - 60 min

#### [T9] Event listener prestige (initialisation 10 dropdowns) (30 min)

**Description** :
Quand on change de prestige, parser le XML et mettre à jour les 10 dropdowns

**Logique** :
```javascript
import { parsePrestigeConfig, getDatabaseXML } from './api.js';

// Event listener sur le dropdown "Prestige"
document.getElementById('prestige-select').addEventListener('change', async (e) => {
    const prestigeName = e.target.value;
    console.log(`🎨 Changement de prestige: ${prestigeName}`);

    try {
        // 1. Télécharger le XML
        const xmlDoc = await getDatabaseXML();

        // 2. Parser la config du prestige
        const prestigeConfig = parsePrestigeConfig(xmlDoc, prestigeName);

        // 3. Mettre à jour l'état
        updateConfig('carpet', prestigeConfig.carpet);
        updateConfig('seatCovers', prestigeConfig.seatCovers);
        updateConfig('tabletFinish', prestigeConfig.tabletFinish);
        updateConfig('seatbelts', prestigeConfig.seatbelts);
        updateConfig('metalFinish', prestigeConfig.metalFinish);
        updateConfig('upperSidePanel', prestigeConfig.upperSidePanel);
        updateConfig('lowerSidePanel', prestigeConfig.lowerSidePanel);
        updateConfig('ultraSuedeRibbon', prestigeConfig.ultraSuedeRibbon);
        updateConfig('centralSeatMaterial', prestigeConfig.centralSeatMaterial);
        updateConfig('perforatedSeatOptions', prestigeConfig.perforatedSeatOptions);

        // 4. Mettre à jour les dropdowns
        document.getElementById('carpet').value = prestigeConfig.carpet;
        document.getElementById('seat-covers').value = prestigeConfig.seatCovers;
        document.getElementById('tablet-finish').value = prestigeConfig.tabletFinish;
        document.getElementById('seatbelts').value = prestigeConfig.seatbelts;
        document.getElementById('metal-finish').value = prestigeConfig.metalFinish;
        document.getElementById('upper-side-panel').value = prestigeConfig.upperSidePanel;
        document.getElementById('lower-side-panel').value = prestigeConfig.lowerSidePanel;
        document.getElementById('ultra-suede-ribbon').value = prestigeConfig.ultraSuedeRibbon;
        document.getElementById('central-seat-material').value = prestigeConfig.centralSeatMaterial;
        document.getElementById('perforated-seat-options').value = prestigeConfig.perforatedSeatOptions;

        // 5. Déclencher nouveau rendu
        triggerRender();

    } catch (error) {
        console.error('❌ Erreur parsing prestige:', error);
        showError('Erreur lors du chargement du prestige');
    }
});
```

**Fichier** : `code/js/app.js`

**Critères d'acceptation** :
- Event listener async sur changement prestige
- Parse le XML avec parsePrestigeConfig()
- Met à jour les 10 propriétés du state
- Met à jour les 10 dropdowns visuellement
- Déclenche un nouveau rendu API

**Note importante** :
getDatabaseXML() doit être exporté depuis api.js (actuellement privé)

---

#### [T10] Event listeners sur les 10 dropdowns individuels (30 min)

**Description** :
Ajouter un event listener sur chaque dropdown pour mettre à jour l'état et déclencher un rendu

**Logique** :
```javascript
// US-027 : Event listeners pour les 10 dropdowns intérieur

document.getElementById('carpet').addEventListener('change', (e) => {
    updateConfig('carpet', e.target.value);
    triggerRender();
});

document.getElementById('seat-covers').addEventListener('change', (e) => {
    updateConfig('seatCovers', e.target.value);
    triggerRender();
});

document.getElementById('tablet-finish').addEventListener('change', (e) => {
    updateConfig('tabletFinish', e.target.value);
    triggerRender();
});

document.getElementById('seatbelts').addEventListener('change', (e) => {
    updateConfig('seatbelts', e.target.value);
    triggerRender();
});

document.getElementById('metal-finish').addEventListener('change', (e) => {
    updateConfig('metalFinish', e.target.value);
    triggerRender();
});

document.getElementById('upper-side-panel').addEventListener('change', (e) => {
    updateConfig('upperSidePanel', e.target.value);
    triggerRender();
});

document.getElementById('lower-side-panel').addEventListener('change', (e) => {
    updateConfig('lowerSidePanel', e.target.value);
    triggerRender();
});

document.getElementById('ultra-suede-ribbon').addEventListener('change', (e) => {
    updateConfig('ultraSuedeRibbon', e.target.value);
    triggerRender();
});

document.getElementById('central-seat-material').addEventListener('change', (e) => {
    updateConfig('centralSeatMaterial', e.target.value);
    triggerRender();
});

document.getElementById('perforated-seat-options').addEventListener('change', (e) => {
    updateConfig('perforatedSeatOptions', e.target.value);
    triggerRender();
});
```

**Fichier** : `code/js/app.js`

**Critères d'acceptation** :
- 10 event listeners créés
- Chaque listener met à jour la propriété correspondante dans state
- Chaque listener déclenche triggerRender()
- Pas d'erreurs console lors des changements

---

### Layer 7 : Affichage conditionnel (T11) - 20 min

#### [T11] Masquer/Afficher la section selon viewType (20 min)

**Description** :
La section intérieur doit être visible uniquement en vue intérieure

**Logique** :
```javascript
// Fonction utilitaire
function toggleInteriorConfig(viewType) {
    const section = document.getElementById('interior-config-section');
    if (viewType === 'interior') {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

// Appeler au changement de vue
document.getElementById('view-exterior').addEventListener('click', () => {
    updateConfig('viewType', 'exterior');
    toggleInteriorConfig('exterior');
    triggerRender();
});

document.getElementById('view-interior').addEventListener('click', () => {
    updateConfig('viewType', 'interior');
    toggleInteriorConfig('interior');
    triggerRender();
});

// Appeler au chargement initial
toggleInteriorConfig(getConfig().viewType);
```

**Fichier** : `code/js/app.js`

**Critères d'acceptation** :
- Section masquée en vue extérieure
- Section visible en vue intérieure
- Transition visuelle fluide
- État initial correct au chargement

---

### Layer 8 : Styling CSS (T12) - 30 min

#### [T12] Ajouter styles pour les sections intérieur (30 min)

**Description** :
Créer les styles pour les 2 sous-sections avec regroupement visuel clair

**Styles recommandés** :
```css
/* US-027 : Configuration Intérieur */
#interior-config-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #0066cc;
}

#interior-config-section h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
    color: #333;
}

.interior-subsection {
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.interior-subsection:last-child {
    margin-bottom: 0;
}

.interior-subsection h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: #555;
    font-weight: 600;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 0.5rem;
}

.interior-subsection .control-group {
    margin-bottom: 1rem;
}

.interior-subsection .control-group:last-child {
    margin-bottom: 0;
}
```

**Fichier** : `code/styles/main.css`

**Critères d'acceptation** :
- 2 sous-sections visuellement distinctes
- Regroupement clair avec fond blanc + ombre
- Titres de section stylés
- Espacement cohérent avec le reste de l'UI
- Design responsive (mobile-friendly)

---

### Layer 9 : Tests et validation (T13) - 30 min

#### [T13] Tests complets de l'US-027 (30 min)

**Description** :
Valider tous les critères d'acceptation de l'US-027

**Checklist de tests** :

**A. Interface utilisateur**
- [ ] 10 dropdowns visibles en vue intérieure
- [ ] 10 dropdowns masqués en vue extérieure
- [ ] Labels en français clairs et cohérents
- [ ] 2 sections distinctes : "Sièges" et "Matériaux et finitions"
- [ ] Design visuel propre et cohérent

**B. Comportement - Initialisation Prestige**
- [ ] Sélectionner "Oslo" → vérifier que les 10 dropdowns se remplissent avec les valeurs Oslo
- [ ] Sélectionner "London" → vérifier que les 10 dropdowns changent
- [ ] Sélectionner "Atacama" → vérifier que les 10 dropdowns changent
- [ ] Console sans erreurs lors du changement de prestige

**C. Comportement - Personnalisation individuelle**
- [ ] Modifier "Tapis" → vérifier que le rendu change (nouveau payload API)
- [ ] Modifier "Cuir des sièges" → vérifier que le rendu change
- [ ] Modifier "Bois de la tablette" → vérifier que le rendu change
- [ ] Modifier plusieurs éléments à la suite → vérifier que tous les changements sont appliqués
- [ ] Console sans erreurs lors des modifications

**D. Persistance état**
- [ ] Modifier 3 dropdowns → Changer de vue extérieur → Revenir intérieur → Vérifier que les 3 modifications sont conservées
- [ ] Changer de prestige → Vérifier que tous les dropdowns se réinitialisent

**E. Payload API**
- [ ] Télécharger le JSON (US-021) → Vérifier la présence des 10 parties `Interior_XXX.YYY`
- [ ] Vérifier que `Interior_PrestigeSelection` n'apparaît PLUS dans le payload
- [ ] Vérifier l'ordre des 10 parties (doit correspondre au XML)

**F. Cas limites**
- [ ] Changer très rapidement plusieurs dropdowns → Vérifier pas de race condition
- [ ] Tester avec toutes les options d'un dropdown (ex: 46 couleurs de cuir)
- [ ] Tester en mobile/tablet (design responsive)

**G. Console et logs**
- [ ] Aucune erreur JavaScript
- [ ] Logs clairs lors du parsing prestige
- [ ] Logs clairs lors de la construction config string

**Fichiers à tester** :
- `code/index.html` (UI)
- `code/js/app.js` (event listeners)
- `code/js/api.js` (parsing + config string)
- `code/js/state.js` (getters)
- `code/js/config.js` (listes)

**Outils** :
- Tests manuels dans Chrome DevTools
- Inspection du payload JSON
- Network tab pour vérifier les appels API

---

## Ordre d'exécution recommandé

### Phase 1 : Fondations (1h15)
1. [T1] Listes de choix (30 min)
2. [T2] Valeurs par défaut (15 min)
3. [T3] État initial (10 min)
4. [T4] Getters (20 min)

**Checkpoint** : State + Config prêts, compilable sans erreurs

---

### Phase 2 : Logique métier (1h15)
5. [T5] parsePrestigeConfig() (45 min)
6. [T6] Modification getConfigString() (30 min)

**Checkpoint** : Parsing XML fonctionne, config string correcte

---

### Phase 3 : Interface (1h30)
7. [T7] Structure HTML (30 min)
8. [T8] Peuplement dropdowns (30 min)
9. [T12] Styling CSS (30 min)

**Checkpoint** : UI visible et stylée (même sans fonctionnalité)

---

### Phase 4 : Interactivité (1h10)
10. [T9] Event listener prestige (30 min)
11. [T10] Event listeners dropdowns (30 min)
12. [T11] Affichage conditionnel (20 min)

**Checkpoint** : Tout est fonctionnel

---

### Phase 5 : Validation (30 min)
13. [T13] Tests complets (30 min)

**Checkpoint** : DoD validée

---

## Notes architecturales importantes

### 1. Source de vérité pour les valeurs Prestige
- **XML de l'API** : Autorité absolue pour les valeurs de prestige
- Ne JAMAIS hardcoder les valeurs de prestige dans le code
- Toujours parser depuis `ConfigurationBookmark[label="Interior_PrestigeSelection_{name}"]`

### 2. Ordre des parties dans config string
L'ordre DOIT correspondre au format du XML pour éviter des bugs :
```
Interior_Carpet.{carpet}/
Interior_CentralSeatMaterial.{centralSeatMaterial}/
Interior_LowerSidePanel.{lowerSidePanel}/
Interior_MetalFinish.{metalFinish}/
Interior_PerforatedSeatOptions.{perforatedSeatOptions}/
Interior_SeatCovers.{seatCovers}/
Interior_Seatbelts.{seatbelts}/
Interior_TabletFinish.{tabletFinish}/
Interior_Ultra-SuedeRibbon.{ultraSuedeRibbon}/
Interior_UpperSidePanel.{upperSidePanel}
```

### 3. Cohérence avec les US précédentes
- US-022 : viewType (exterior/interior) déjà implémenté
- US-023/024/025/026 : Tablet, SunGlass, Door_pilot, Door_passenger déjà en place
- Cette US complète la personnalisation intérieure

### 4. Export getDatabaseXML()
La fonction `getDatabaseXML()` dans api.js est actuellement privée (pas exportée).
Elle doit être exportée pour être utilisée dans app.js (T9).

### 5. Réutilisation des listes
`UPPER_SIDE_PANEL_LIST` et `LOWER_SIDE_PANEL_LIST` peuvent réutiliser `SEAT_COVERS_LIST`
(ce sont les mêmes 46 couleurs de cuir).

### 6. Performance
- Parsing XML mis en cache (cachedXML dans api.js)
- Éviter de re-parser à chaque changement de dropdown
- Parser uniquement quand on change de prestige

---

## Risques et dépendances

### Risques identifiés
1. **Ordre des parties config string** : Si l'ordre ne correspond pas au XML, l'API pourrait rejeter la requête
   - **Mitigation** : Valider avec le QA en téléchargeant le JSON (US-021)

2. **Performance parsing XML** : Parser 10 valeurs à chaque changement de prestige
   - **Mitigation** : Cache XML déjà en place, parsing rapide

3. **Valeurs introuvables dans XML** : Si un prestige n'a pas toutes les 10 parties
   - **Mitigation** : Gestion d'erreur dans parsePrestigeConfig(), fallback vers valeurs par défaut

4. **Confusion utilisateur** : 10 dropdowns = beaucoup de choix
   - **Mitigation** : Organisation en 2 sections, labels clairs

### Dépendances
- US-022 (viewType) doit être fonctionnelle
- Fonction `getDatabaseXML()` doit être exportée
- Cache XML doit fonctionner correctement

---

## Métriques de succès

- **Fonctionnel** : Tous les tests (T13) passent
- **Performance** : Changement de prestige < 1 seconde
- **UX** : Changement de dropdown déclenche rendu < 2 secondes
- **Code Quality** : Aucune erreur console
- **DoD** : Tous les critères d'acceptation validés

---

## Definition of Done (Rappel)

- [ ] Code fonctionnel testé manuellement
- [ ] Code commenté (fonctions complexes)
- [ ] Pas d'erreurs console
- [ ] Testé sur Chrome, Firefox, Edge
- [ ] Responsive (desktop + tablette)
- [ ] Documentation utilisateur à jour
- [ ] Payload API vérifié (JSON téléchargé)
- [ ] Tests avec 3+ prestiges différents
- [ ] Tests avec modifications individuelles multiples

---

**Prêt pour développement Sprint #6** ✅
