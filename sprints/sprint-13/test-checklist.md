# Checklist Tests Refactoring Sprint #13

**Date** : 06/12/2025
**Testeur** : QA-Fonctionnel
**Objectif** : Valider le refactoring complet sans régression

---

## ✅ Tests Fonctionnels

### Vue Extérieur (12 tests)

- [ ] **T1.1** Chargement initial avec décor Tarmac
  - Résultat attendu : Placeholder → Loader → 6 images affichées
  - Statut : ⬜ PASS / ❌ FAIL
  - Commentaire : _____

- [ ] **T1.2** Changement de base de données (TBM960 → TBM980)
  - Résultat attendu : Dropdown change, nouveau rendu généré
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T1.3** Changement de décor (Tarmac → Studio → Fjord)
  - Résultat attendu : Nouveau rendu avec décor différent
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T1.4** Changement de paint scheme (Zephir → Tehuano)
  - Résultat attendu : Nouveau rendu avec peinture différente
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T1.5** Modification zone de couleur A
  - Résultat attendu : Nouveau rendu avec couleur modifiée
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T1.6** Modification zone de couleur B, C, D, A+
  - Résultat attendu : Nouveau rendu pour chaque zone
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T1.7** Changement de spinner (Spinner1 → Spinner2)
  - Résultat attendu : Nouveau rendu avec spinner différent
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T1.8** Modification immatriculation (N960TB → N123AB)
  - Résultat attendu : Nouveau rendu avec nouvelle immat
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T1.9** Changement de style lettres (A → F → J)
  - Résultat attendu : Styles slanted puis straight affichés
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T1.10** Toggle doors (Closed → Open)
  - Résultat attendu : Portes ouvertes dans nouveau rendu
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T1.11** Toggle SunGlass (OFF → ON)
  - Résultat attendu : Lunettes visibles
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T1.12** Toggle Tablet (Closed → Open)
  - Résultat attendu : Tablette ouverte
  - Statut : ⬜ PASS / ❌ FAIL

---

### Vue Intérieur (14 tests)

- [ ] **T2.1** Basculement vers vue Intérieur
  - Résultat attendu : Contrôles intérieur affichés, extérieur masqués
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.2** Changement de Prestige (Oslo → SanPedro)
  - Résultat attendu : Tous les 11 paramètres intérieur synchronisés
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.3** Modification Carpet
  - Résultat attendu : Nouveau rendu avec tapis modifié
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.4** Modification SeatCovers (Cuir)
  - Résultat attendu : Nouveau rendu avec sièges cuir
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.5** Modification Ultra-Suede Ribbon
  - Résultat attendu : Nouveau rendu
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.6** Modification Stitching
  - Résultat attendu : Nouveau rendu avec coutures modifiées
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.7** Toggle Matériau Central (Suede ↔ Cuir)
  - Résultat attendu : Bouton actif change, nouveau rendu
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.8** Modification Perforated Seat Options
  - Résultat attendu : Nouveau rendu
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.9** Modification Seatbelts
  - Résultat attendu : Nouveau rendu avec ceintures modifiées
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.10** Modification LowerSidePanel
  - Résultat attendu : Nouveau rendu
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.11** Modification UpperSidePanel
  - Résultat attendu : Nouveau rendu
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.12** Modification MetalFinish
  - Résultat attendu : Nouveau rendu
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.13** Modification TabletFinish
  - Résultat attendu : Nouveau rendu
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T2.14** Synchronisation Prestige → Stitching + Matériau Central
  - Résultat attendu : Changement Prestige met à jour automatiquement
  - Statut : ⬜ PASS / ❌ FAIL

---

### Vue Configuration (6 tests)

- [ ] **T3.1** Basculement vers vue Configuration
  - Résultat attendu : Mosaïque mixte affichée (~26 vignettes)
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T3.2** 10 vignettes RegistrationNumber (styles A-J) affichées
  - Résultat attendu : 10 vignettes avec tous les styles
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T3.3** Vignettes correspondent au paint scheme actuel
  - Résultat attendu : Couleurs identiques à vue Extérieur
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T3.4** ~16 autres vignettes affichées (détails avion)
  - Résultat attendu : Vignettes variées (spinner, portes, etc.)
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T3.5** Immatriculation visible et correcte
  - Résultat attendu : Texte immat lisible
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T3.6** Couleurs immatriculation identiques à vue Extérieur
  - Résultat attendu : Cohérence des couleurs
  - Statut : ⬜ PASS / ❌ FAIL

---

### Modal Plein Écran (8 tests)

- [ ] **T4.1** Clic sur image ouvre modal plein écran
  - Résultat attendu : Modal s'affiche avec image en grand
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T4.2** Navigation avec flèche droite (→)
  - Résultat attendu : Image suivante affichée
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T4.3** Navigation avec flèche gauche (←)
  - Résultat attendu : Image précédente affichée
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T4.4** Fermeture avec touche ESC
  - Résultat attendu : Modal se ferme
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T4.5** Fermeture par clic backdrop
  - Résultat attendu : Modal se ferme
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T4.6** Fermeture par bouton ✕
  - Résultat attendu : Modal se ferme
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T4.7** Compteur "X / Y" affiché
  - Résultat attendu : "1 / 6", "2 / 6", etc.
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T4.8** Métadonnées affichées (Groupe, Caméra, ID)
  - Résultat attendu : Infos visibles en plein écran
  - Statut : ⬜ PASS / ❌ FAIL

---

### Téléchargements (4 tests)

- [ ] **T5.1** Téléchargement JSON payload
  - Résultat attendu : Fichier .json téléchargé avec nom timestamp
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T5.2** Téléchargement image individuelle (icône download)
  - Résultat attendu : Image .png téléchargée
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T5.3** Mode sélection multiple activé
  - Résultat attendu : Checkboxes apparaissent sur vignettes
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T5.4** Téléchargement par lot (2+ images)
  - Résultat attendu : Barre progression + toasts succès
  - Statut : ⬜ PASS / ❌ FAIL

---

## 🧪 Tests Techniques

### Architecture (5 tests)

- [ ] **T6.1** Aucune erreur console au chargement
  - Résultat attendu : Console propre (0 erreur)
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T6.2** Imports api/index.js fonctionnent
  - Résultat attendu : Pas d'erreur "Cannot find module"
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T6.3** Imports ui/index.js fonctionnent
  - Résultat attendu : Pas d'erreur "Cannot find module"
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T6.4** Imports utils/ fonctionnent
  - Résultat attendu : colors.js, positioning.js, validators.js OK
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T6.5** Pas de dépendances circulaires
  - Résultat attendu : Aucun warning dépendance circulaire
  - Statut : ⬜ PASS / ❌ FAIL

---

### Performance (3 tests)

- [ ] **T7.1** Temps de chargement ≤ temps avant refactoring
  - Résultat attendu : Pas de régression performance
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T7.2** Pas de freeze de l'UI
  - Résultat attendu : Interface réactive
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T7.3** Transitions fluides entre vues
  - Résultat attendu : Switch Ext/Int/Config fluide
  - Statut : ⬜ PASS / ❌ FAIL

---

### Documentation (3 tests)

- [ ] **T8.1** GUIDE-DEVELOPPEUR.md existe et complet
  - Résultat attendu : Fichier présent dans docs/
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T8.2** GLOSSARY.md existe et complet
  - Résultat attendu : Fichier présent dans docs/
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **T8.3** Tous les fichiers ont headers JSDoc
  - Résultat attendu : 17 fichiers avec @fileoverview
  - Statut : ⬜ PASS / ❌ FAIL

---

## 📊 Métriques de Validation

### Lignes de code

- [ ] **M1** Total lignes ≤ avant refactoring (objectif: réduction)
  - Avant : 5500 lignes
  - Après : _____ lignes
  - Réduction : _____ lignes (___%)
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **M2** api/ < 1100 lignes par module
  - xml-parser.js : _____ lignes
  - payload-builder.js : _____ lignes
  - api-client.js : _____ lignes
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **M3** ui/ < 750 lignes par module
  - mosaic.js : _____ lignes
  - modal.js : _____ lignes
  - loader.js : _____ lignes
  - Statut : ⬜ PASS / ❌ FAIL

### Fonctions

- [ ] **M4** Aucune fonction > 50 lignes (sauf exceptions documentées)
  - Nombre de fonctions >50 lignes : _____
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **M5** Toutes les fonctions ont un nom descriptif
  - Statut : ⬜ PASS / ❌ FAIL

- [ ] **M6** Principe "une fonction = une action" respecté
  - Statut : ⬜ PASS / ❌ FAIL

---

## 🎯 Validation Finale

**Total tests** : 55 tests
**Tests PASS** : _____ / 55
**Tests FAIL** : _____ / 55
**Taux de réussite** : _____%

**Bugs critiques détectés** : _____
**Bugs mineurs détectés** : _____

**Verdict final** : ⬜ ✅ VALIDÉ / ❌ REJETÉ

**Commentaires QA** :
_____________________
_____________________

**Signature** : QA-Fonctionnel - 06/12/2025
