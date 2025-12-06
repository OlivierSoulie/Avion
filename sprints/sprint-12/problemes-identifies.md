# Sprint #12 - Problèmes Identifiés

**Date** : 06/12/2025
**Sprint** : #12 - Mosaïque Configuration
**Status** : 🔴 BLOQUANT

---

## 🐛 Problème #1 : Parsing XML du groupe Configuration

### Priorité
🔴 **CRITIQUE - BLOQUANT**

### Description
La fonction `getCameraListFromGroup(groupId)` ne trouve aucune caméra dans le groupe Configuration du XML.

### Symptômes
```javascript
// Logs console
📊 0 caméras dans le groupe Configuration
   > Groupe trouvé: Configuration
   > Nombre de CameraRef trouvées: 0
```

### Localisation
- **Fichier** : `code/js/api.js`
- **Fonction** : `getCameraListFromGroup(groupId)`
- **Ligne** : ~640

### Code problématique
```javascript
export async function getCameraListFromGroup(groupId) {
    const xmlDoc = await getDatabaseXML();
    const group = xmlDoc.querySelector(`Group[id="${groupId}"]`);

    // ❌ Cette ligne retourne 0 éléments
    const cameraRefs = group.querySelectorAll('CameraRef');

    console.log(`> Nombre de CameraRef trouvées: ${cameraRefs.length}`); // 0

    for (let index = 0; index < cameraRefs.length; index++) {
        // Jamais exécuté car cameraRefs.length === 0
    }
}
```

### Cause racine
Le groupe Configuration dans le XML **n'utilise pas de balises `<CameraRef>`** pour référencer les caméras.

La structure attendue était :
```xml
<Group id="..." name="Configuration">
    <CameraRef cameraId="..." />
    <CameraRef cameraId="..." />
    ...
</Group>
```

Mais la structure réelle est **différente** (structure inconnue à ce stade).

### Impact
1. ✅ Les 2 appels API fonctionnent (26 images 16:9 + 26 images 1:1 générées)
2. ❌ Impossible de lister les caméras et leurs ratios
3. ❌ Impossible de sélectionner la bonne image (16:9 vs 1:1) pour chaque caméra
4. ❌ Résultat final : 0 images affichées dans la mosaïque

### Investigation nécessaire

**Étape 1** : Examiner la structure XML réelle
```javascript
// Logs de debug déjà ajoutés (ligne 636)
console.log(`> Contenu du groupe (innerHTML):`, group.innerHTML.substring(0, 500));
console.log(`> Nombre total d'enfants du groupe: ${allChildren.length}`);
for (let i = 0; i < Math.min(allChildren.length, 5); i++) {
    console.log(`> Enfant ${i}: ${allChildren[i].tagName} (id=${allChildren[i].getAttribute('id')})`);
}
```

**Étape 2** : Copier les logs de la console
- Ouvrir DevTools (F12)
- Cliquer sur l'onglet "CONFIGURATION"
- Copier les logs qui affichent la structure du groupe

**Étape 3** : Identifier la balise correcte
- Examiner le `tagName` des enfants du groupe
- Identifier l'attribut contenant le `cameraId`

### Solutions possibles

**Option A : Adapter le parsing** (Recommandée)
```javascript
// Au lieu de :
const cameraRefs = group.querySelectorAll('CameraRef');

// Utiliser (exemple si les enfants sont des <Camera>) :
const cameraRefs = group.querySelectorAll('Camera');
// OU
const cameraRefs = group.children; // Tous les enfants directs
```

**Option B : Utiliser l'ordre de l'API**
Si l'API retourne les caméras dans l'ordre du XML :
1. Faire l'analyse via `config_camera_analysis.md` (1 caméra 16:9, 26 caméras 1:1)
2. Hardcoder : première caméra = 16:9, les 26 autres = 1:1
3. Plus rapide mais moins flexible

**Option C : Un seul appel API en taille moyenne**
- Appeler l'API une seule fois en 200x150
- Toutes les images ont la même taille
- Plus simple mais perd l'aspect "ratios mixtes"

### Estimation de correction
- **Option A** : 30-60 min (investigation + correction)
- **Option B** : 15 min (hardcoder les indices)
- **Option C** : 10 min (simplifier complètement)

### Recommandation
**Option A** - C'est la solution propre et maintenable. Une fois la structure XML identifiée, la correction est triviale.

---

## 🔍 Problème #2 : Nombre de caméras (mineur)

### Priorité
🟡 **INFORMATION**

### Description
L'analyse initiale indiquait 27 caméras, mais le XML contient **26 caméras**.

### Fichiers concernés
- `config_camera_analysis.md` : Mentionne 27 caméras
- `sprints/sprint-12/sprint-planning-notes.md` : Basé sur 27 caméras

### Impact
- ⚠️ Documentation incorrecte
- ✅ Le code gère dynamiquement le nombre de caméras (pas de hardcoding)
- ✅ Pas d'impact fonctionnel

### Action
- Mettre à jour `config_camera_analysis.md` : 27 → 26 caméras
- Mettre à jour `sprint-planning-notes.md` : 27 → 26 caméras

---

## 📋 Checklist de reprise

Quand vous reprendrez ce sprint :

### 1. Investigation XML (15 min)
- [ ] Ouvrir le site
- [ ] Ouvrir DevTools (F12) → Console
- [ ] Cliquer sur onglet "CONFIGURATION"
- [ ] Copier les logs de debug :
  ```
  > Groupe trouvé: Configuration
  > Contenu du groupe (innerHTML): ...
  > Nombre de CameraRef trouvées: 0
  > Nombre total d'enfants du groupe: ...
  > Enfant 0: ??? (id=...)
  > Enfant 1: ??? (id=...)
  ```

### 2. Correction du code (15-30 min)
- [ ] Identifier la balise correcte dans les logs
- [ ] Modifier `getCameraListFromGroup()` ligne 640
- [ ] Remplacer `querySelectorAll('CameraRef')` par la bonne balise
- [ ] Identifier l'attribut contenant le `cameraId`

### 3. Tests (15 min)
- [ ] Rafraîchir la page
- [ ] Cliquer sur "CONFIGURATION"
- [ ] Vérifier dans les logs :
  ```
  📊 26 caméras dans le groupe Configuration
  📸 Appel 1/2: Génération en 16:9 (400x225)...
     ✅ 26 images 16:9 reçues
  📸 Appel 2/2: Génération en 1:1 (100x100)...
     ✅ 26 images 1:1 reçues
     📷 Caméra 1: 16:9 ou 1:1
     📷 Caméra 2: 1:1
     ...
  ✅ 26 images Configuration triées et sélectionnées
  🖼️ Affichage mosaïque Configuration avec 26 vignettes
  ```
- [ ] Vérifier l'affichage : 1 grande vignette 16:9 + 25 petites 1:1 (ou 26x1:1)
- [ ] Tester le clic sur une vignette → modal plein écran
- [ ] Tester la navigation clavier (flèches)

### 4. Documentation (10 min)
- [ ] Mettre à jour `sprint-review.md` avec le statut final
- [ ] Créer QA test report si tout fonctionne
- [ ] Mettre à jour `kanban-board.md`

### 5. Commit Git (5 min)
- [ ] `git add .`
- [ ] `git commit -m "fix(sprint-12): Corriger parsing XML groupe Configuration"`
- [ ] `git push origin main`

---

## 📞 Contact / Questions

Si vous avez besoin d'aide pour identifier la structure XML :
1. Copiez les logs de debug dans la console
2. Partagez le contenu du `innerHTML` du groupe
3. Je pourrai vous dire quelle balise utiliser

---

**Dernière mise à jour** : 06/12/2025
**Responsable** : DEV
**Prochaine action** : Investigation logs XML
