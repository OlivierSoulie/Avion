# User Story US-049 - Vignettes Prestige Composites (Canvas)

**Créée le** : 10/12/2025
**Priorité** : Haute
**Story Points** : 8 SP
**Sprint** : Sprint #16
**Approche** : Option 1 - Assemblage Canvas HTML5

---

## 📖 Description

**En tant qu'** utilisateur du configurateur,
**Je veux** voir des vignettes composites pour chaque Prestige dans la vue Configuration,
**Afin de** visualiser rapidement tous les matériaux d'un Prestige sur une seule vignette 300×100.

---

## 🎯 Objectif

Remplacer la vignette unique "Prestige Selection" par 8 vignettes composites (une par prestige : Oslo, London, SanPedro, Labrador, GooseBay, BlackFriars, Fjord, Atacama), chacune affichant les 10 matériaux du prestige assemblés côte à côte via Canvas HTML5.

---

## 📐 Spécifications Techniques

### Règle des produits XML
- **Produit par défaut** : "TBM 960 980" → Utilisé pour TOUTES les images
- **Produit Prestige** : "PresetThumbnail" → Utilisé UNIQUEMENT pour les vignettes Prestige

### Format des vignettes composites
- **1 vignette composite par prestige** (8 prestiges total)
- **Composition** : 10 mini-vignettes assemblées horizontalement via Canvas HTML5
  - Chaque mini-vignette : **30×100 pixels**
  - Vignette finale : **300×100 pixels** (10 × 30px)
  - Export : Data URL (JPEG quality 95%)
- **Nom affiché** : "Prestige {PrestigeName}" (ex: "Prestige Oslo")

### Processus de génération (Option 1 - Canvas)

Pour chaque prestige (ex: Oslo) :

1. **Lire le bookmark XML** : `Interior_PrestigeSelection_Oslo`
   - Parser la configuration string
   - Extraire les 10 paramètres Interior **dans l'ordre du bookmark**
   - Exemple : Interior_Carpet.XXX, Interior_SeatCovers.XXX, etc.

2. **Récupérer l'ID du produit** : "PresetThumbnail" depuis le XML
   ```javascript
   const presetProductId = await getProductIdByName("PresetThumbnail");
   ```

3. **Récupérer la caméra** : "PrestigeSelection" dans le groupe Configuration
   ```javascript
   const prestigeCamera = cameras.find(cam => cam.name === 'PrestigeSelection');
   ```

4. **Générer 10 mini-vignettes** (1 appel API par matériau) :
   - Payload avec :
     - `database` : DATABASE_ID actuel
     - `product` : ID du produit "PresetThumbnail"
     - `configuration` : Matériau complet seul (ex: "Interior_Carpet.LightBrown_carpet_Premium")
     - `camera` : ID de la caméra "PrestigeSelection"
     - Dimensions : 30×100 pixels
   - Stocker les URLs des 10 images

5. **Assembler avec Canvas HTML5** :
   - Créer canvas 300×100
   - Charger les 10 images (avec `crossOrigin='anonymous'`)
   - Dessiner les images côte à côte (0px, 30px, 60px, ..., 270px)
   - Exporter en Data URL : `canvas.toDataURL('image/jpeg', 0.95)`

6. **Ajouter à finalImages** :
   ```javascript
   {
       url: compositeDataURL,
       cameraId: prestigeCamera.id,
       cameraName: `Prestige ${prestigeName}`,
       groupName: 'Configuration',
       ratioType: '3:1'
   }
   ```

---

## ✅ Critères d'Acceptation

### Fonctionnel
1. ✅ La vue Configuration affiche 8 vignettes Prestige (une par prestige)
2. ✅ Chaque vignette affiche 10 matériaux assemblés horizontalement
3. ✅ Les vignettes ont la bonne taille (300×100 pixels)
4. ✅ L'ordre des matériaux correspond à l'ordre du bookmark XML
5. ✅ Le nom affiché est "Prestige {nom}" (ex: "Prestige Oslo")

### Technique
6. ✅ Produit "PresetThumbnail" utilisé pour les vignettes Prestige
7. ✅ Caméra "PrestigeSelection" utilisée pour les 10 mini-vignettes
8. ✅ Configuration string = matériau complet seul (ex: "Interior_Carpet.XXX")
9. ✅ Assemblage Canvas HTML5 fonctionne sans erreur CORS
10. ✅ Images exportées en Data URL (base64)

### Qualité
11. ✅ Pas de bugs visuels (images déformées, mal alignées)
12. ✅ Gestion d'erreur robuste (si un matériau échoue, continuer avec les autres)
13. ✅ Performance acceptable (< 2 min pour générer les 8 vignettes)
14. ✅ Code modulaire et réutilisable

---

## 🔧 Décomposition Technique (12 tâches)

### Phase 1 : Backend - Support Produits (2h)
- **[T049-1]** Ajouter `getProductIdByName(productName)` dans xml-parser.js (30 min)
  - Parse le XML, cherche `Product[name="..."]`
  - Retourne l'ID du produit
  - Throw error si produit introuvable

- **[T049-2]** Ajouter `getAllPrestigeNames()` dans xml-parser.js (30 min)
  - Cherche tous les bookmarks `Interior_PrestigeSelection_*`
  - Retourne tableau de noms (ex: ["Oslo", "London", ...])

- **[T049-3]** Modifier `buildPayloadBase()` pour supporter `productId` (1h)
  - Ajouter `product: config.productId` dans `scene[0]`
  - Nettoyer si null (`delete payload.scene[0].product`)
  - Tester avec et sans productId

### Phase 2 : Génération Vignettes Composites (3h30)
- **[T049-4]** Créer `parsePrestigeBookmarkOrdered(xmlDoc, prestigeName)` dans xml-parser.js (30 min)
  - Parser bookmark `Interior_PrestigeSelection_{prestigeName}`
  - Split configuration string par "/"
  - Retourner array ordonné de 10 matériaux complets
  - Exemple: ["Interior_Carpet.XXX", "Interior_SeatCovers.XXX", ...]

- **[T049-5]** Créer `assembleImagesHorizontally(imageUrls, width, height)` dans configuration.js (1h)
  - Créer canvas (width * imageUrls.length, height)
  - Charger toutes les images avec Promise.all
  - `img.crossOrigin = 'anonymous'`
  - Dessiner images côte à côte avec `ctx.drawImage(img, x, 0, width, height)`
  - Retourner `canvas.toDataURL('image/jpeg', 0.95)`

- **[T049-6]** Créer `generatePrestigeCompositeImage(prestigeName, config, cameras, configGroupId)` dans configuration.js (2h)
  - Parser le bookmark ordonné (10 matériaux)
  - Récupérer productId "PresetThumbnail"
  - Trouver caméra "PrestigeSelection"
  - Boucle sur les 10 matériaux :
    - Build payload avec productId + matériau seul + camera + 30×100
    - Call API
    - Stocker URL
  - Assembler les 10 images avec Canvas
  - Retourner objet {url, cameraId, cameraName, groupName, ratioType}
  - Gestion d'erreur : try/catch par matériau, continuer si échec

### Phase 3 : Intégration (1h30)
- **[T049-7]** Modifier `fetchConfigurationImages()` - Détecter caméra PrestigeSelection (15 min)
  - Dans la boucle for, ajouter condition `if (camera.name === 'PrestigeSelection')`
  - `continue` pour passer à la caméra suivante après traitement

- **[T049-8]** Intégrer génération des 8 vignettes Prestige (45 min)
  - Récupérer tous les noms de prestige avec `getAllPrestigeNames()`
  - Boucle for sur chaque prestige
  - Appeler `generatePrestigeCompositeImage(prestigeName, config, cameras, configGroupId)`
  - Push dans finalImages
  - Logs clairs pour debug

- **[T049-9]** Gérer cas d'erreur et robustesse (30 min)
  - try/catch global autour de la génération Prestige
  - Si un prestige échoue complètement, logger et continuer
  - Si un matériau échoue, logger warning et continuer avec les autres
  - Toast d'erreur si nécessaire

### Phase 4 : Tests et Validation (2h)
- **[T049-10]** Tests manuels end-to-end (1h)
  - Vérifier les 8 prestiges s'affichent
  - Vérifier l'ordre des matériaux (comparer avec XML)
  - Vérifier dimensions (300×100)
  - Vérifier qualité visuelle (pas de déformation)
  - Tester modal plein écran (clic sur vignette)
  - Tester avec différentes bases (V0.2, V0.3, V0.6)

- **[T049-11]** Validation visuelle et ajustements (30 min)
  - Ajuster espacement si nécessaire
  - Vérifier alignement vertical
  - Vérifier qualité JPEG (compression acceptable)

- **[T049-12]** Tests de robustesse (30 min)
  - Simuler erreur API (timeout)
  - Tester avec bookmark incomplet (< 10 matériaux)
  - Tester avec caméra PrestigeSelection absente
  - Tester avec produit PresetThumbnail absent

---

## 📊 Estimation

- **Complexité** : Haute (Canvas + 80 appels API + parsing XML ordonné)
- **Story Points** : 8 SP
- **Durée estimée** : ~9h (1 journée de dev + tests)
- **Dépendances** : Aucune (US indépendante)
- **Risque CORS** : Faible (API retourne déjà des images)

---

## 🎨 Exemples de Code

### Payload API (Mini-vignette Carpet pour Oslo)
```json
{
    "scene": [{
        "database": "8ad3eaf3-0547-4558-ae34-647f17c84e88",
        "product": "uuid-du-produit-PresetThumbnail",
        "configuration": "Interior_Carpet.LightBrown_carpet_Premium"
    }],
    "mode": {
        "image": {
            "camera": "uuid-camera-PrestigeSelection"
        }
    },
    "renderParameters": {
        "width": 30,
        "height": 100,
        "antialiasing": true,
        "superSampling": "2"
    },
    "encoder": {
        "jpeg": {
            "quality": 95
        }
    }
}
```

### Canvas Assemblage
```javascript
async function assembleImagesHorizontally(imageUrls, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width * imageUrls.length;  // 30 × 10 = 300
    canvas.height = height;  // 100
    const ctx = canvas.getContext('2d');

    // Charger toutes les images
    const imagePromises = imageUrls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';  // CORS
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    });

    const loadedImages = await Promise.all(imagePromises);

    // Dessiner côte à côte
    loadedImages.forEach((img, index) => {
        ctx.drawImage(img, index * width, 0, width, height);
    });

    // Export Data URL
    return canvas.toDataURL('image/jpeg', 0.95);
}
```

### Résultat Visuel
```
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│  1   │  2   │  3   │  4   │  5   │  6   │  7   │  8   │  9   │  10  │
│30×100│30×100│30×100│30×100│30×100│30×100│30×100│30×100│30×100│30×100│
│Carpet│Seat  │Tablet│Metal │Upper │Lower │Center│Suede │Perfo │Belts │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
                    Vignette composite : 300×100 pixels
                         Nom : "Prestige Oslo"
```

---

## 🚨 Risques et Mitigations

### Risque 1 : CORS bloque Canvas
**Probabilité** : Faible (images déjà utilisées dans mosaïque)
**Impact** : Bloquant
**Mitigation** :
- `img.crossOrigin = 'anonymous'`
- Vérifier headers API : `Access-Control-Allow-Origin: *`
- Si problème : Proxy côté serveur

### Risque 2 : Performance (80 appels API)
**Probabilité** : Moyenne
**Impact** : UX dégradée (temps d'attente)
**Mitigation** :
- Afficher loader + progression
- Appels parallèles par prestige (Promise.all sur les 10 matériaux)
- Cache côté client si nécessaire

### Risque 3 : Bookmark incomplet (< 10 matériaux)
**Probabilité** : Faible
**Impact** : Mineur (vignette plus courte)
**Mitigation** :
- Gérer dynamiquement le nombre de matériaux
- Canvas width = 30 × nombre_de_matériaux

### Risque 4 : Produit PresetThumbnail absent
**Probabilité** : Très faible
**Impact** : Bloquant
**Mitigation** :
- Throw error explicite
- Logger le problème
- Fallback sur produit "TBM 960 980" ?

---

## 📝 Notes Techniques

### Format configuration string (IMPORTANT)
- ✅ **Correct** : `"Interior_Carpet.LightBrown_carpet_Premium"` (matériau complet seul)
- ❌ **Incorrect** : `"Version.960/Interior_Carpet.XXX/..."` (config complète)

### Produits XML
- **"TBM 960 980"** : Produit standard (toutes vues sauf Prestige)
- **"PresetThumbnail"** : Produit spécial (vignettes Prestige uniquement)

### Ordre des matériaux
- **Source de vérité** : Bookmark XML `Interior_PrestigeSelection_{nom}`
- **Ordre** : Tel que défini dans la configuration string du bookmark
- **Parsing** : Split par "/" et garder l'ordre

---

**User Story créée par** : COORDINATOR
**Approuvée par** : Utilisateur (10/12/2025)
**Option retenue** : Option 1 (Canvas HTML5)
