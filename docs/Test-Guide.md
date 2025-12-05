# Guide de Test - US-005

**Projet** : Configurateur TBM Daher
**US** : US-005 (Intégration API Lumiscaphe)
**Date** : 03/12/2025

---

## Prérequis

1. Ouvrir `index.html` dans un navigateur moderne (Chrome, Firefox, Edge)
2. Ouvrir la console JavaScript (F12 → Console)
3. Vérifier qu'il n'y a pas d'erreurs au chargement

---

## Test 1 : Construction du Payload (SANS appel API)

**Objectif :** Vérifier que le payload est construit correctement

**Étapes :**
1. Ouvrir `index.html?test-payload`
2. Observer la console

**Résultat attendu :**
```
🧪 === TEST BUILD PAYLOAD ===
🔧 === Construction du payload API ===
📍 Extraction anchors pour scheme: Sirocco
✅ Anchors extraits: {Left: {Start: 0.34, Direction: 1}, Right: {Start: -0.34, Direction: -1}, Y: 0}
🔢 Calcul positions pour "NWM1MW" | Start=0.34, Dir=1
  Lettre 0 (N): X=0.34 (première lettre)
  Lettre 1 (W): offset=0.3000, X=0.64
  ...
✅ Positions calculées: [0.34, 0.64, 1.09, 1.39, 1.74, 1.99]
🎨 Génération des surfaces...
...
✅ Payload construit

📊 Payload généré:
{
  "scene": [{
    "database": "8ad3eaf3-0547-4558-ae34-647f17c84e88",
    "configuration": "Version.960/Exterior_PaintScheme.Sirocco/...",
    "materials": [...],  // 12 éléments
    "materialMultiLayers": [...],  // 8 éléments (4 caractères uniques × 2 layers)
    "surfaces": [...]  // 2 surfaces (RegL, RegR)
  }],
  "mode": {
    "images": {
      "cameraGroup": null
    }
  },
  "renderParameters": {
    "width": 1920,
    "height": 1080,
    "antialiasing": true,
    "superSampling": "2"
  },
  "encoder": {
    "jpeg": {
      "quality": 95
    }
  }
}

✅ Test terminé
```

**Vérifications :**
- ✅ Pas d'erreurs dans la console
- ✅ Payload présent et bien structuré
- ✅ `materials.length === 12` (6 lettres × 2 côtés)
- ✅ `materialMultiLayers.length === 8` (4 caractères uniques × 2 layers)
- ✅ `surfaces.length === 2` (RegL et RegR)

---

## Test 2 : Appel API Manuel

**Objectif :** Tester l'appel API complet avec la config par défaut

**Étapes :**
1. Ouvrir `index.html`
2. Dans la console, taper : `window.loadRender()`
3. Observer :
   - Le loader qui s'affiche
   - L'onglet Network (DevTools → Network)
   - Le résultat final

**Résultat attendu :**

**Cas de succès :**
```
Chargement du rendu...
🔧 === Construction du payload API ===
...
🚀 Appel API Lumiscaphe...
   Tentative 1/3...
✅ 5 images reçues
📥 Vérification de 5 images...
   Image 1: https://...
   ...
✅ 5/5 images validées
✅ Génération terminée avec succès
📸 Mise à jour carrousel avec 5 images
✅ Carrousel mis à jour
Rendu chargé avec succès
```

**Cas d'erreur (réseau offline) :**
```
Chargement du rendu...
...
❌ Tentative 1 échouée: Failed to fetch
   Nouvelle tentative dans 1000ms...
❌ Tentative 2 échouée: Failed to fetch
   Nouvelle tentative dans 2000ms...
❌ Tentative 3 échouée: Failed to fetch
Erreur lors du chargement du rendu: Error: Échec après 3 tentatives: Failed to fetch
❌ Erreur: Impossible de contacter le serveur. Vérifiez votre connexion.
```

**Vérifications :**
- ✅ Loader affiché pendant l'appel
- ✅ Contrôles désactivés pendant l'appel
- ✅ Requête POST visible dans Network avec payload JSON
- ✅ Carrousel affiché avec images OU message d'erreur
- ✅ Contrôles réactivés après l'appel

---

## Test 3 : Changement de Configuration

**Objectif :** Vérifier l'appel API automatique au changement

**Étapes :**
1. Ouvrir `index.html`
2. Changer le dropdown "Modèle Avion" de "960" à "980"
3. Observer la console et l'interface

**Résultat attendu :**
```
Version changée: 980
(attente 300ms pour debounce)
Chargement du rendu...
🔧 === Construction du payload API ===
Config reçue: {version: "980", paintScheme: "Sirocco", ...}
...
```

**Vérifications :**
- ✅ Debounce de 300ms (pas d'appel instantané)
- ✅ Un seul appel API même si on change vite plusieurs valeurs
- ✅ Payload contient bien `Version.980`

---

## Test 4 : Changement d'Immatriculation

**Objectif :** Tester le bouton "Envoyer" de l'immatriculation

**Étapes :**
1. Ouvrir `index.html`
2. Dans le champ "Immatriculation", taper "ABC123"
3. Vérifier qu'il est converti en "ABC123" (majuscules)
4. Cliquer sur "Envoyer"
5. Observer l'appel API

**Résultat attendu :**
```
Immatriculation input: ABC123
Immatriculation mise à jour: ABC123
Chargement du rendu...
🔧 === Construction du payload API ===
Config reçue: {immat: "ABC123", ...}
🔢 Calcul positions pour "ABC123" | Start=0.34, Dir=1
...
```

**Vérifications :**
- ✅ Conversion automatique en majuscules
- ✅ Appel API uniquement au clic sur "Envoyer"
- ✅ Payload contient les 6 lettres "ABC123"
- ✅ `materials.length === 12` (6 lettres × 2 côtés)

---

## Test 5 : Gestion d'Erreurs

**Objectif :** Vérifier les messages d'erreur user-friendly

### 5.1 Erreur Réseau (Offline)

**Étapes :**
1. Ouvrir DevTools → Network
2. Cocher "Offline"
3. Appeler `window.loadRender()`
4. Observer l'erreur

**Résultat attendu :**
- Message affiché : "Impossible de contacter le serveur. Vérifiez votre connexion."
- Bouton "Réessayer" visible
- Contrôles réactivés

### 5.2 Retry

**Étapes :**
1. Remettre "Online" dans DevTools
2. Cliquer sur le bouton "Réessayer"
3. Observer l'appel réussir

**Résultat attendu :**
- Loader affiché
- Appel API réussi
- Carrousel affiché avec images
- Message d'erreur masqué

---

## Test 6 : Positions des Lettres

**Objectif :** Vérifier les calculs de positionnement

**Étapes :**
1. Dans la console, importer le module :
```javascript
import { testPositioning } from './code/js/positioning.js';
testPositioning();
```

**OU** directement dans le code :
```javascript
// Dans positioning.js, la fonction testPositioning() est déjà exportée
```

**Résultat attendu :**
```
🧪 === TEST POSITIONING ===
📍 Extraction anchors pour scheme: Sirocco
✅ Anchors extraits: {...}
🎨 Génération des surfaces...
🔢 Calcul positions pour "NWM1MW" | Start=0.34, Dir=1
  Lettre 0 (N): X=0.34 (première lettre)
  Lettre 1 (W): offset=0.3000, X=0.64
  Lettre 2 (M): offset=0.7500, X=1.09
  Lettre 3 (1): offset=1.0500, X=1.39
  Lettre 4 (M): offset=1.4000, X=1.74
  Lettre 5 (W): offset=1.6500, X=1.99
✅ Positions calculées: [0.34, 0.64, 1.09, 1.39, 1.74, 1.99]
...
```

**Vérifications :**
- ✅ Les positions respectent l'espacement de 0.05 (5cm)
- ✅ Les largeurs sont correctes : N=0.20, W=0.30, M=0.30, 1=0.20
- ✅ Les surfaces ont 2 tags (RegL, RegR)

---

## Test 7 : Couleurs et Matériaux

**Objectif :** Vérifier la génération des couleurs

**Étapes :**
1. Dans la console, importer et tester :
```javascript
import { testColors } from './code/js/colors.js';
testColors();
```

**Résultat attendu :**
```
🧪 === TEST COLORS ===
🎨 === Génération matériaux et couleurs ===
🎨 Parse des couleurs depuis config...
  Zone 1: #00FF00
  Zone 2: #FFFF00
  ...
🔍 Résolution couleurs pour style A...
  Paires de config: ["1-2", "3-4", "5-6", "7-8", "9-10"]
  Style A -> index 0
  Zones cibles: 1, 2
  Couleurs résolues: Layer0=#00FF00, Layer1=#FFFF00
🎨 Génération des matériaux...
✅ 12 matériaux générés
🎨 Génération des material multi-layers...
✅ 8 multi-layers générés pour 4 caractères uniques
...
```

**Vérifications :**
- ✅ Les couleurs sont bien parsées depuis la config
- ✅ Le style A est mappé vers les zones 1-2
- ✅ Pas de doublons dans les multi-layers (4 caractères uniques : N, W, M, 1)

---

## Test 8 : Debounce Multiple Changes

**Objectif :** Vérifier que le debounce évite les appels multiples

**Étapes :**
1. Ouvrir `index.html`
2. Changer rapidement plusieurs contrôles :
   - Version : 960 → 980
   - Peinture : Sirocco → Mistral
   - Intérieur : Oslo → London
3. Observer la console et l'onglet Network

**Résultat attendu :**
```
Version changée: 980
Schéma peinture changé: Mistral
Intérieur changé: London
(attente 300ms après le dernier changement)
Chargement du rendu...
```

**Vérifications :**
- ✅ Un seul appel API dans Network (pas 3)
- ✅ Le payload final contient les 3 changements

---

## Test 9 : Validation Maxlength Immatriculation

**Objectif :** Vérifier la validation à 6 caractères

**Étapes :**
1. Ouvrir `index.html`
2. Dans le champ immatriculation, essayer de taper "ABCDEFG" (7 lettres)
3. Observer que seules 6 lettres sont acceptées

**Résultat attendu :**
- Le champ ne permet pas de dépasser 6 caractères (HTML `maxlength="6"`)
- Le message d'erreur ne s'affiche pas (car bloqué avant)

---

## Test 10 : Rendu Initial (Optionnel)

**Objectif :** Tester le rendu au chargement de la page

**Étapes :**
1. Dans `app.js`, ligne 375, décommenter : `loadRender();`
2. Recharger la page
3. Observer le rendu automatique

**Résultat attendu :**
- Loader affiché au chargement
- Appel API avec la config par défaut
- Carrousel affiché avec les images

**NOTE :** Cette fonctionnalité est désactivée par défaut pour économiser les appels API.

---

## Checklist Finale

| Test | Description | Status |
|------|-------------|--------|
| Test 1 | Construction payload | ⏳ |
| Test 2 | Appel API manuel | ⏳ |
| Test 3 | Changement config | ⏳ |
| Test 4 | Immatriculation | ⏳ |
| Test 5 | Gestion erreurs | ⏳ |
| Test 6 | Positions lettres | ⏳ |
| Test 7 | Couleurs matériaux | ⏳ |
| Test 8 | Debounce | ⏳ |
| Test 9 | Validation maxlength | ⏳ |
| Test 10 | Rendu initial | ⏳ |

---

## Bugs Connus

Aucun bug connu à ce stade. Les limitations sont documentées dans `US-005-Implementation-Details.md`.

---

## Prochaine Étape

Une fois tous les tests passés, l'US-005 peut être marquée comme **DONE** et passée en revue QA.
