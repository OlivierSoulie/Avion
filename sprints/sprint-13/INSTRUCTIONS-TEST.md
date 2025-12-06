# Instructions pour Tests Manuels - Sprint #13

**Date** : 06/12/2025
**Objectif** : Valider le refactoring sans régression fonctionnelle

---

## 🚀 Préparation

### 1. Ouvrir l'application
1. Ouvrir le fichier : `code/index.html` dans un navigateur (Chrome/Edge recommandé)
2. Ouvrir la console développeur (F12)
3. Vérifier qu'il n'y a **AUCUNE ERREUR** au chargement

### 2. Fichiers de test
- Checklist complète : `sprints/sprint-13/test-checklist.md`
- Rapport technique : `sprints/sprint-13/VALIDATION-TECHNIQUE.md`
- Revue architecture : `sprints/sprint-13/architecture-review.md`

---

## 📋 Déroulement des Tests

### Phase 1 : Tests Techniques (15 min)

#### T6.1 - Console propre au chargement
1. Rafraîchir la page (F5)
2. Vérifier la console développeur
3. **Résultat attendu** : 0 erreur (warnings OK)
4. Cocher ✅ PASS ou ❌ FAIL dans `test-checklist.md`

#### T6.2 à T6.5 - Vérification imports
1. Dans la console, taper : `console.log(window)`
2. Vérifier qu'il n'y a pas d'erreur "Cannot find module"
3. **Résultat attendu** : Application chargée sans erreur d'import
4. Cocher ✅ PASS ou ❌ FAIL

#### T7.1 à T7.3 - Performance
1. Noter le temps de chargement initial
2. Tester transitions entre vues (Extérieur → Intérieur → Configuration)
3. **Résultat attendu** : Pas de freeze, transitions fluides
4. Cocher ✅ PASS ou ❌ FAIL

---

### Phase 2 : Tests Fonctionnels Vue Extérieur (30 min)

#### T1.1 - Chargement initial
1. Rafraîchir la page
2. Observer : Placeholder → Loader → 6 images
3. **Résultat attendu** : 6 vignettes affichées avec décor Tarmac
4. Cocher ✅ PASS ou ❌ FAIL

#### T1.2 - Changement de base de données
1. Sélectionner "TBM 980" dans le dropdown en haut
2. Attendre le nouveau rendu
3. **Résultat attendu** : Nouveau rendu TBM 980 affiché
4. Cocher ✅ PASS ou ❌ FAIL

#### T1.3 - Changement de décor
1. Sélectionner "Studio" dans le dropdown Décor
2. Sélectionner "Fjord"
3. **Résultat attendu** : Nouveau rendu avec décor différent
4. Cocher ✅ PASS ou ❌ FAIL

#### T1.4 - Changement de paint scheme
1. Sélectionner "Tehuano" dans Paint Scheme
2. **Résultat attendu** : Nouveau rendu avec peinture Tehuano
3. Cocher ✅ PASS ou ❌ FAIL

#### T1.5 à T1.6 - Modification couleurs
1. Modifier la couleur de la zone A (cliquer sur le sélecteur)
2. Choisir une couleur différente
3. Répéter pour zones B, C, D, A+
4. **Résultat attendu** : Nouveau rendu à chaque changement
5. Cocher ✅ PASS ou ❌ FAIL

#### T1.7 - Changement de spinner
1. Sélectionner "Spinner 2" dans le dropdown Spinner
2. **Résultat attendu** : Nouveau rendu avec spinner différent
3. Cocher ✅ PASS ou ❌ FAIL

#### T1.8 - Modification immatriculation
1. Changer "N960TB" → "N123AB" dans le champ immatriculation
2. Appuyer sur Entrée ou cliquer ailleurs
3. **Résultat attendu** : Nouveau rendu avec "N123AB"
4. Cocher ✅ PASS ou ❌ FAIL

#### T1.9 - Changement de style lettres
1. Sélectionner Style "F" (straight)
2. Sélectionner Style "J" (straight)
3. Sélectionner Style "A" (slanted)
4. **Résultat attendu** : Lettres droites puis penchées affichées
5. Cocher ✅ PASS ou ❌ FAIL

#### T1.10 à T1.12 - Toggles Doors/SunGlass/Tablet
1. Cliquer sur bouton "Doors" (Closed → Open)
2. Cliquer sur bouton "SunGlass" (OFF → ON)
3. Cliquer sur bouton "Tablet" (Closed → Open)
4. **Résultat attendu** : Portes ouvertes, lunettes visibles, tablette ouverte
5. Cocher ✅ PASS ou ❌ FAIL

---

### Phase 3 : Tests Fonctionnels Vue Intérieur (30 min)

#### T2.1 - Basculement vers Intérieur
1. Cliquer sur l'onglet "Intérieur"
2. **Résultat attendu** : Contrôles intérieur affichés
3. Cocher ✅ PASS ou ❌ FAIL

#### T2.2 - Changement de Prestige
1. Sélectionner "SanPedro" dans Prestige
2. **Résultat attendu** : TOUS les 11 paramètres intérieur changent
3. Vérifier que Stitching et Matériau Central sont synchronisés
4. Cocher ✅ PASS ou ❌ FAIL

#### T2.3 à T2.13 - Modifications individuelles
Tester chaque dropdown/toggle :
1. Carpet
2. SeatCovers
3. Ultra-Suede Ribbon
4. Stitching
5. Matériau Central (toggle Suede/Cuir)
6. Perforated Seat Options
7. Seatbelts
8. LowerSidePanel
9. UpperSidePanel
10. MetalFinish
11. TabletFinish

**Résultat attendu** : Nouveau rendu à chaque changement
Cocher ✅ PASS ou ❌ FAIL pour chaque test

#### T2.14 - Synchronisation Prestige
1. Changer Stitching manuellement
2. Changer Prestige
3. **Résultat attendu** : Stitching revient à la valeur du Prestige
4. Cocher ✅ PASS ou ❌ FAIL

---

### Phase 4 : Tests Vue Configuration (15 min)

#### T3.1 - Basculement vers Configuration
1. Cliquer sur l'onglet "Configuration"
2. **Résultat attendu** : Mosaïque mixte affichée (~26 vignettes)
3. Cocher ✅ PASS ou ❌ FAIL

#### T3.2 - Vérification vignettes RegistrationNumber
1. Compter les vignettes avec styles A à J
2. **Résultat attendu** : 10 vignettes avec tous les styles
3. Cocher ✅ PASS ou ❌ FAIL

#### T3.3 - Cohérence couleurs paint scheme
1. Comparer les couleurs avec la vue Extérieur
2. **Résultat attendu** : Couleurs identiques
3. Cocher ✅ PASS ou ❌ FAIL

#### T3.4 à T3.6 - Autres vignettes
1. Vérifier présence vignettes détails avion
2. Vérifier immatriculation visible et correcte
3. **Résultat attendu** : Toutes les vignettes cohérentes
4. Cocher ✅ PASS ou ❌ FAIL

---

### Phase 5 : Tests Modal Plein Écran (15 min)

#### T4.1 - Ouverture modal
1. Cliquer sur n'importe quelle image
2. **Résultat attendu** : Modal plein écran s'affiche
3. Cocher ✅ PASS ou ❌ FAIL

#### T4.2 à T4.3 - Navigation clavier
1. Appuyer sur flèche droite (→)
2. Appuyer sur flèche gauche (←)
3. **Résultat attendu** : Navigation entre images
4. Cocher ✅ PASS ou ❌ FAIL

#### T4.4 - Fermeture ESC
1. Appuyer sur touche ESC
2. **Résultat attendu** : Modal se ferme
3. Cocher ✅ PASS ou ❌ FAIL

#### T4.5 - Fermeture backdrop
1. Rouvrir modal
2. Cliquer en dehors de l'image (zone sombre)
3. **Résultat attendu** : Modal se ferme
4. Cocher ✅ PASS ou ❌ FAIL

#### T4.6 - Fermeture bouton ✕
1. Rouvrir modal
2. Cliquer sur le bouton ✕ en haut à droite
3. **Résultat attendu** : Modal se ferme
4. Cocher ✅ PASS ou ❌ FAIL

#### T4.7 - Compteur images
1. Rouvrir modal
2. Vérifier compteur (ex: "1 / 6")
3. Naviguer et vérifier que le compteur change
4. **Résultat attendu** : Compteur correct
5. Cocher ✅ PASS ou ❌ FAIL

#### T4.8 - Métadonnées
1. Vérifier affichage : Groupe, Caméra, ID
2. **Résultat attendu** : Infos visibles et correctes
3. Cocher ✅ PASS ou ❌ FAIL

---

### Phase 6 : Tests Téléchargements (15 min)

#### T5.1 - Téléchargement JSON payload
1. Cliquer sur bouton "Télécharger Payload JSON"
2. **Résultat attendu** : Fichier .json téléchargé
3. Vérifier que le nom contient timestamp
4. Cocher ✅ PASS ou ❌ FAIL

#### T5.2 - Téléchargement image individuelle
1. Survoler une vignette
2. Cliquer sur l'icône téléchargement (↓)
3. **Résultat attendu** : Image .png téléchargée
4. Cocher ✅ PASS ou ❌ FAIL

#### T5.3 - Mode sélection multiple
1. Cliquer sur bouton "Sélectionner plusieurs"
2. **Résultat attendu** : Checkboxes apparaissent
3. Cocher ✅ PASS ou ❌ FAIL

#### T5.4 - Téléchargement par lot
1. Sélectionner 2 ou 3 images (cocher checkboxes)
2. Cliquer sur "Télécharger sélection"
3. **Résultat attendu** : Barre de progression + toasts de succès
4. Vérifier que les images sont téléchargées
5. Cocher ✅ PASS ou ❌ FAIL

---

## 📊 Calcul Final

Après avoir exécuté TOUS les tests :

1. Compter le nombre de ✅ PASS
2. Compter le nombre de ❌ FAIL
3. Calculer le taux de réussite : (PASS / 55) × 100

**Taux de réussite minimum accepté** : 95% (53/55 tests PASS)

---

## 🎯 Remplir les Documents

### 1. test-checklist.md
- Cocher tous les tests
- Remplir les métriques M1 à M6
- Donner le verdict final

### 2. architecture-review.md
- Remplir les 6 points de contrôle
- Valider les 6 critères US-043
- Donner le verdict final ARCH

### 3. VALIDATION-TECHNIQUE.md
- Déjà rempli automatiquement
- Vérifier cohérence avec les tests manuels

---

## ⏱️ Temps Estimé Total

- Tests techniques : 15 min
- Tests fonctionnels Extérieur : 30 min
- Tests fonctionnels Intérieur : 30 min
- Tests Vue Configuration : 15 min
- Tests Modal : 15 min
- Tests Téléchargements : 15 min
- Remplissage documents : 20 min

**TOTAL** : ~2h20 (objectif 2h pour Phase 7)

---

**Bonne chance pour les tests ! 🚀**
