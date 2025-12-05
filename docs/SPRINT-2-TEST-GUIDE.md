# Guide de Test - Sprint #2 : Conformité XML

**Date** : 04/12/2025
**Sprint** : Sprint #2 - Conformité XML
**Objectif** : Valider que toutes les données proviennent du XML téléchargé

---

## 📋 User Stories à tester

- **[US-016]** Extraction anchors depuis XML (5 SP)
- **[US-017]** Récupération configurations depuis XML (3 SP)
- **[US-018]** Extraction couleurs depuis XML (5 SP)

---

## 🧪 Procédure de test

### Prérequis

1. Ouvrir le configurateur dans un navigateur moderne (Chrome/Firefox/Edge)
2. Ouvrir la console développeur (F12)
3. Vérifier la connexion internet (le XML sera téléchargé depuis l'API)

---

### Test 1 : Téléchargement du XML

**US concernée** : Toutes

**Procédure** :
1. Ouvrir `code/index.html` dans le navigateur
2. Ouvrir la console (F12)
3. Cliquer sur "Générer" ou modifier une option

**Résultat attendu** :
```
   > Téléchargement du XML depuis l'API...
   > XML téléchargé et parsé avec succès
```

**Critères PASS** :
- ✅ XML téléchargé sans erreur
- ✅ Message de confirmation dans la console
- ✅ Pas d'erreur 404 ou 500

---

### Test 2 : Extraction anchors (US-016)

**Procédure** :
1. Dans la console, observer les logs lors de la génération
2. Rechercher les messages : `📍 Extraction anchors depuis XML pour scheme: XXX`

**Résultat attendu** :
```
📍 Extraction anchors depuis XML pour scheme: Sirocco
   > XX bookmarks trouvés dans le XML
   > Recherche des bookmarks contenant: "SIROCCO_REG"
   ✅ Anchors LEFT trouvés: Start=X.XX, Direction=X.X, Y=X.X
   ✅ Anchors RIGHT trouvés: Start=-X.XX, Direction=-X.X
✅ Anchors extraits: {...}
```

**Critères PASS** :
- ✅ Anchors LEFT et RIGHT trouvés dans le XML
- ✅ Start, Direction, Y extraits correctement
- ✅ Pas de valeurs par défaut (0.34, -0.34) si le bookmark existe dans le XML
- ✅ Valeurs correspondent au Python (comparer avec `generate_full_render.py`)

**Fallback** :
- ⚠️ Si bookmark absent du XML, valeurs par défaut utilisées (0.34, -0.34) → ACCEPTABLE

---

### Test 3 : Récupération configs (US-017)

**Procédure** :
1. Observer les logs lors de la génération
2. Rechercher : `🔧 Construction config string depuis XML...`

**Résultat attendu** :
```
🔧 Construction config string depuis XML...
   > Recherche Bookmark : 'Exterior_Sirocco'
   ✅ Bookmark trouvé : Exterior_PaintScheme.Sirocco_1-2_3-4_5-6_...
   > Recherche Bookmark : 'Interior_PrestigeSelection_Oslo'
   ✅ Bookmark trouvé : Interior_PrestigeSelection.Oslo_...
✅ Config string construite: Version.960/Exterior_PaintScheme.Sirocco.../...
```

**Critères PASS** :
- ✅ Bookmarks `Exterior_{PaintScheme}` trouvés dans le XML
- ✅ Bookmarks `Interior_PrestigeSelection_{Prestige}` trouvés
- ✅ Config string contient les valeurs du XML (pas hardcodées)
- ✅ Config string contient `Exterior_Colors_Zone*` (pour US-018)

**Fallback** :
- ⚠️ Si bookmark absent, fallback vers config simple → ACCEPTABLE

---

### Test 4 : Extraction couleurs (US-018)

**Procédure** :
1. Observer les logs lors de la génération des matériaux
2. Rechercher : `🎨 === Génération matériaux et couleurs ===`

**Résultat attendu** :
```
🎨 === Génération matériaux et couleurs ===
🎨 Parse des couleurs depuis config...
  Zone 1: #XXXXXX
  Zone 2: #YYYYYY
  Zone 3: #ZZZZZZ
✅ Couleurs parsées: {...}
🔍 Résolution couleurs pour style A...
  Couleurs résolues: Layer0=#XXXXXX, Layer1=#YYYYYY
```

**Critères PASS** :
- ✅ Couleurs extraites depuis la config string XML
- ✅ Pas de couleurs hardcodées (#FFFFFF, #FF0000, etc.)
- ✅ Couleurs correspondent aux zones définies dans le XML
- ✅ `materialMultiLayers` contient les bonnes couleurs

---

### Test 5 : Payload API final

**Procédure** :
1. Dans la console, rechercher : `✅ Payload construit:`
2. Copier le JSON affiché

**Critères PASS** :
- ✅ `scene[0].configuration` contient la config du XML (pas hardcodée)
- ✅ `scene[0].surfaces` contient les positions calculées depuis les anchors XML
- ✅ `scene[0].materialMultiLayers` contient les couleurs du XML
- ✅ `mode.images.cameraGroup` est un ID valide (pas null)

**Exemple payload** :
```json
{
  "scene": [{
    "database": "8ad3eaf3-0547-4558-ae34-647f17c84e88",
    "configuration": "Version.960/Exterior_PaintScheme.Sirocco_.../...",
    "materials": [...],
    "materialMultiLayers": [
      {"name": "Style_A_N", "layer": 0, "diffuseColor": "#XXXXXX"},
      {"name": "Style_A_N", "layer": 1, "diffuseColor": "#YYYYYY"}
    ],
    "surfaces": [...]
  }],
  "mode": {"images": {"cameraGroup": "XXXXXXXX-XXXX-..."}},
  ...
}
```

---

### Test 6 : Génération réelle avec l'API

**Procédure** :
1. Sélectionner une configuration dans l'interface
2. Cliquer sur "Envoyer" pour l'immatriculation
3. Observer le rendu généré

**Critères PASS** :
- ✅ Appel API réussit (pas d'erreur HTTP)
- ✅ Images retournées et affichées dans le carrousel
- ✅ Positions des lettres correctes (espacement 5cm)
- ✅ Couleurs des lettres correspondent au style choisi

---

## 🔍 Comparaison avec Python

Pour valider la conformité, comparer les logs JavaScript avec l'exécution de `generate_full_render.py` :

**Commande Python** :
```bash
python generate_full_render.py
```

**À comparer** :
1. **Anchors** : Les Start/Direction/Y doivent être identiques
2. **Config string** : Format identique (ordre peut varier)
3. **Couleurs** : Zones et couleurs hex identiques
4. **Payload** : Structure identique (vérifier avec `request.json` du Python)

---

## ✅ Critères de validation finale

### US-016 : Extraction anchors ✅
- [ ] Anchors extraits depuis le XML
- [ ] Start, Direction, Y corrects
- [ ] Fallback vers valeurs par défaut si absent

### US-017 : Récupération configs ✅
- [ ] Configs `Exterior_*` récupérées du XML
- [ ] Configs `Interior_*` récupérées du XML
- [ ] Config string complète et conforme

### US-018 : Extraction couleurs ✅
- [ ] Couleurs extraites depuis config string
- [ ] Pas de couleurs hardcodées
- [ ] `materialMultiLayers` correct

---

## 🐛 Bugs connus / Limitations

- **XML non accessible côté client** : Le XML doit être téléchargé via l'API (CORS peut poser problème en local)
- **Cache XML** : Le XML est mis en cache, vider le cache du navigateur si modification du XML

---

## 📊 Résultats des tests

**Date de test** : __________
**Testeur** : QA-Fonctionnel

| Test | Résultat | Notes |
|------|----------|-------|
| Test 1 : Téléchargement XML | ⬜ PASS / ⬜ FAIL | |
| Test 2 : Extraction anchors | ⬜ PASS / ⬜ FAIL | |
| Test 3 : Récupération configs | ⬜ PASS / ⬜ FAIL | |
| Test 4 : Extraction couleurs | ⬜ PASS / ⬜ FAIL | |
| Test 5 : Payload API | ⬜ PASS / ⬜ FAIL | |
| Test 6 : Génération réelle | ⬜ PASS / ⬜ FAIL | |

**Verdict global** : ⬜ VALIDÉ / ⬜ REJETÉ

**Commentaires** :
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**Prochaines étapes** :
- Si VALIDÉ → Passer les 3 US en Done, Sprint #2 terminé
- Si REJETÉ → Retour vers DEV avec liste des bugs
