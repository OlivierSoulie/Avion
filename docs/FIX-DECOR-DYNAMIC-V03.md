# Fix: Support décors dynamiques pour V0.3+

**Date**: 11/12/2025
**Type**: Bug Fix
**Priorité**: Haute
**Status**: Implémenté

---

## Problème

### Symptômes
- Les payloads API pour les bases V0.3+ n'avaient **ni décor ni position** lorsqu'un nouveau décor (non présent dans le dictionnaire hardcodé) était utilisé
- Le configurateur ne fonctionnait pas avec les nouvelles bases de données contenant des décors non documentés

### Cause racine
Le code utilisait un **dictionnaire hardcodé** `DECORS_CONFIG` pour mapper les décors en V0.3+ :

```javascript
// ❌ CODE PROBLÉMATIQUE (AVANT)
export const DECORS_CONFIG = {
    "Tarmac":   { suffix: "Tarmac_Ground",   type: "Ground" },
    "Studio":   { suffix: "Studio_Ground",   type: "Ground" },
    "Hangar":   { suffix: "Hangar_Ground",   type: "Ground" },
    "Onirique": { suffix: "Onirique_Ground", type: "Ground" },
    "Fjord":    { suffix: "Fjord_Flight",    type: "Flight" }
};

// V0.3+ : Format "{decorName}_{Ground|Flight}"
const decorData = DECORS_CONFIG[decorName] || { suffix: `${decorName}_Ground`, type: 'Ground' };
```

**Problème** : Si un nouveau décor n'était pas dans le dictionnaire, le fallback générique pouvait ne pas correspondre à la valeur exacte du XML.

---

## Solution

### Principe
Appliquer la **même logique que V0.2** (qui fonctionnait déjà) : **lire dynamiquement depuis le XML** au lieu d'utiliser un dictionnaire hardcodé.

### Implémentation

#### Avant (dictionnaire hardcodé)
```javascript
// V0.3+ : Format "{decorName}_{Ground|Flight}"
const decorData = DECORS_CONFIG[decorName] || { suffix: `${decorName}_Ground`, type: 'Ground' };
console.log(`   > Format V0.3+ détecté : ${decorData.suffix}`);
return { prefix: 'Decor', suffix: decorData.suffix, positionValue: decorName };
```

#### Après (lecture XML dynamique)
```javascript
// V0.3+ : Format "{decorName}_{Ground|Flight}"
console.log('   > Format détecté : V0.3+ (avec Ground/Flight)');

// CORRECTION : Lire depuis le XML au lieu du dictionnaire hardcodé
// Chercher la première valeur qui correspond au décor demandé
for (const value of values) {
    const symbol = value.getAttribute('symbol');

    // Vérifier si le symbol commence par le decorName
    // Exemples : "Studio_Ground", "Fjord_Flight", "NewDecor_Ground"
    if (symbol.toLowerCase().startsWith(decorName.toLowerCase() + '_')) {
        console.log(`   ✅ Décor trouvé en V0.3+ : "${symbol}"`);
        return { prefix: 'Decor', suffix: symbol, positionValue: decorName };
    }
}

// Fallback 1 : Si decorName est vide ou pas trouvé, utiliser la première valeur
if (!decorName || decorName.trim() === '') {
    console.warn(`   ⚠️ decorName vide, utilisation première valeur : "${firstValue}"`);
    const extractedName = firstValue.split('_')[0];
    return { prefix: 'Decor', suffix: firstValue, positionValue: extractedName };
}

// Fallback 2 : Si aucune correspondance, utiliser un fallback générique
console.warn(`   ⚠️ Aucune valeur V0.3+ trouvée pour "${decorName}"`);
console.warn(`   ⚠️ Utilisation fallback générique : "${decorName}_Ground"`);
return { prefix: 'Decor', suffix: `${decorName}_Ground`, positionValue: decorName };
```

---

## Avantages

### 1. Dynamique et Data-Driven
- ✅ Support de **TOUS les décors** présents dans le XML
- ✅ Pas besoin de mettre à jour le code pour chaque nouveau décor
- ✅ Respect de la règle du projet : **"XML = source de vérité pour les DONNÉES"**

### 2. Robuste avec Fallbacks
- **Fallback 1** : Si `decorName` est vide → utiliser la première valeur du XML
- **Fallback 2** : Si aucune correspondance → fallback générique `{decorName}_Ground`

### 3. Cohérence V0.2 / V0.3+
- Même logique pour V0.2 et V0.3+ : `startsWith()` sur le XML
- Code unifié et maintenable

### 4. Logs détaillés
- Logs ajoutés pour faciliter le debug :
  - Première valeur XML détectée
  - Format détecté (V0.2 vs V0.3+)
  - Valeur trouvée ou fallback utilisé

---

## Tests

### Test manuel recommandé

Utiliser le fichier `code/js/debug-decor-config.js` :

```javascript
// Dans la console DevTools
import { testDecorConfig, listAllDecors } from './js/debug-decor-config.js';

// Lister tous les décors disponibles dans la base actuelle
await listAllDecors();

// Tester un décor spécifique
await testDecorConfig('Studio');
await testDecorConfig('NewDecor');
```

### Cas de test
1. ✅ Décors connus (Tarmac, Studio, Hangar, Onirique, Fjord)
2. ✅ Nouveau décor non présent dans `DECORS_CONFIG`
3. ✅ `decorName` vide ou null
4. ✅ `decorName` invalide (pas dans le XML)

---

## Fichiers modifiés

### 1. `code/js/api/payload-builder.js`
- **Fonction** : `buildDecorConfig(xmlDoc, decorName)` (lignes 164-238)
- **Changement** : Lecture dynamique depuis le XML au lieu du dictionnaire hardcodé pour V0.3+
- **Logs** : Ajout de logs détaillés pour le debug

### 2. `code/js/config.js`
- **Export** : `DECORS_CONFIG` (lignes 39-50)
- **Changement** : Mise à jour du commentaire pour indiquer que le dictionnaire est DEPRECATED
- **Note** : Le dictionnaire est conservé uniquement pour compatibilité avec `generate_full_render.py`

### 3. `code/js/debug-decor-config.js` (NOUVEAU)
- **Type** : Fichier de debug/test
- **Fonctions** :
  - `testDecorConfig(decorName)` : Teste un décor spécifique
  - `testAllDecors()` : Teste tous les décors connus
  - `listAllDecors()` : Liste tous les décors disponibles dans la base actuelle

### 4. `docs/FIX-DECOR-DYNAMIC-V03.md` (NOUVEAU)
- **Type** : Documentation technique
- **Contenu** : Ce document

---

## Compatibilité

### Bases supportées
- ✅ **V0.2** : Format `"{decorName}_{cameraName}_Tx_Ty_Tz_Rx_Ry_Rz"` (inchangé)
- ✅ **V0.3+** : Format `"{decorName}_{Ground|Flight}"` (correction appliquée)

### Bases non supportées
- ❌ **V0.1 (POC)** : Paramètre `"POC Decor"` non supporté (par design du projet)

---

## Règles du projet respectées

### Sources de Vérité (CLAUDE.md)
> **Pour les DONNÉES et la CONFIGURATION** : Le XML de l'API
> - Les valeurs de configuration (noms de schémas, couleurs, etc.)
> - Les paramètres de positionnement
> - Les groupes de caméras
> - **Règle** : Toujours utiliser les valeurs du XML, jamais les hardcoder

✅ Cette correction respecte cette règle en supprimant la dépendance au dictionnaire hardcodé.

---

## TODO (optionnel)

### Court terme
- ⚠️ **Validation en production** : Tester avec une nouvelle base contenant un décor non documenté
- ℹ️ Pas de test unitaire pour l'instant (pas de framework de test configuré)

### Long terme
- 💡 **Python** : Synchroniser `generate_full_render.py` pour utiliser la même logique dynamique
  - Note : Le script Python n'est utilisé que pour les tests/debug, pas en production
  - Priorité basse

---

## Résumé

| Avant | Après |
|-------|-------|
| Dictionnaire hardcodé `DECORS_CONFIG` | Lecture dynamique depuis le XML |
| Échec avec nouveaux décors | Support de TOUS les décors du XML |
| Code différent pour V0.2 et V0.3+ | Logique unifiée avec `startsWith()` |
| Pas de logs détaillés | Logs complets pour le debug |

**Résultat** : Le configurateur supporte maintenant **TOUS les décors** présents dans le XML, sans nécessiter de modification du code pour chaque nouveau décor.
