# Sprint Backlog - Sprint #7

**Sprint Goal** : Réorganiser l'UI en 2 colonnes et remplacer le carousel par une mosaïque
**Capacity** : 10 SP
**Équipe** : 6 agents
**Duration** : 5-6h de développement
**Date de création** : 05/12/2025

---

## Vue d'ensemble

Ce sprint transforme l'interface utilisateur avec deux améliorations majeures :
- **US-028** : Réorganisation en 2 colonnes côte à côte (Extérieur / Intérieur)
- **US-029** : Remplacement du carousel par une mosaïque d'images cliquables

**Points clés** :
- Les 2 US peuvent être développées **en parallèle** (pas de dépendance)
- L'US-028 impacte le layout global (`index.html` + `main.css`)
- L'US-029 impacte le viewport et la logique d'affichage (`ui.js` + `viewport.css`)
- L'US-029 réutilise le modal fullscreen de l'US-020 (déjà implémenté)

---

## US-028 : Réorganisation UI en 2 colonnes (5 SP)

**Objectif** : Transformer le layout actuel (contrôles en haut + intérieur en dessous) en 2 colonnes côte à côte : EXTÉRIEUR (gauche) / INTÉRIEUR (droite).

### Tâches US-028

#### [T028-1] Analyse et préparation du layout (15 min)
- **Description** : Analyser le DOM actuel et définir la nouvelle structure 2 colonnes
- **Fichiers concernés** : `code/index.html`, `code/styles/main.css`
- **Actions** :
  - Identifier tous les contrôles à déplacer
  - Définir la structure Grid ou Flexbox
  - Lister les ID/classes à modifier
- **Résultat** : Document de mapping des contrôles (mental map ou notes)

#### [T028-2] Restructuration HTML - Création des 2 colonnes (30 min)
- **Description** : Créer la nouvelle structure HTML avec 2 conteneurs côte à côte
- **Fichier** : `code/index.html`
- **Actions** :
  - Créer `<div class="column column-exterior">` (colonne gauche)
  - Créer `<div class="column column-interior">` (colonne droite)
  - Envelopper dans `<div id="main-layout" class="two-columns">`
  - Positionner le sélecteur de vue au-dessus des colonnes
- **Critères d'acceptation** :
  - Structure HTML en 2 colonnes créée
  - Sélecteur de vue (Ext/Int) reste en haut

#### [T028-3] Déplacement contrôles EXTÉRIEUR vers colonne gauche (20 min)
- **Description** : Déplacer tous les contrôles extérieurs dans la colonne gauche
- **Fichier** : `code/index.html`
- **Contrôles à déplacer** :
  - Dropdown "Modèle Avion"
  - Dropdown "Schéma Peinture"
  - Dropdown "Décor"
  - Dropdown "Hélice"
  - Toggle "Porte pilote"
  - Toggle "Porte passager"
  - Champ + bouton "Immatriculation"
  - Radio buttons "Type Police"
  - Dropdown "Style"
- **Critères d'acceptation** :
  - Tous les contrôles extérieurs dans `.column-exterior`
  - Ordre logique maintenu

#### [T028-4] Déplacement contrôles INTÉRIEUR vers colonne droite (20 min)
- **Description** : Déplacer tous les contrôles intérieurs dans la colonne droite
- **Fichier** : `code/index.html`
- **Contrôles à déplacer** :
  - Dropdown "Prestige" (déplacé depuis la partie principale)
  - Section "Sièges" (4 dropdowns)
  - Section "Matériaux et finitions" (6 dropdowns)
  - Toggle "Tablette"
  - Toggle "Lunettes de soleil"
- **Critères d'acceptation** :
  - Tous les contrôles intérieurs dans `.column-interior`
  - Sections "Sièges" et "Matériaux" conservées

#### [T028-5] CSS Grid/Flexbox - Layout 2 colonnes desktop (30 min)
- **Description** : Implémenter le layout CSS pour afficher 2 colonnes côte à côte
- **Fichier** : `code/styles/main.css`
- **Actions** :
  - Créer classe `.two-columns` avec `display: grid; grid-template-columns: 1fr 1fr;`
  - Alternative : `display: flex; gap: 2rem;`
  - Ajouter `gap` entre colonnes (1.5-2rem)
  - Styling classe `.column` (padding, background, border-radius)
  - Ajouter séparateur visuel (border ou espace)
- **Critères d'acceptation** :
  - 2 colonnes égales (50%/50%) ou (40%/60%) selon design
  - Espacement et padding cohérents
  - Séparateur visuel entre colonnes

#### [T028-6] Styling titres et sections colonnes (15 min)
- **Description** : Ajouter styling distinctif pour les titres "EXTÉRIEUR" / "INTÉRIEUR"
- **Fichier** : `code/styles/main.css`
- **Actions** :
  - Créer style pour `<h2>EXTÉRIEUR</h2>` et `<h2>INTÉRIEUR</h2>`
  - Typographie distinctive (taille, poids, couleur)
  - Optionnel : fond ou bordure pour délimiter colonnes
- **Critères d'acceptation** :
  - Titres clairs et visibles
  - Design cohérent avec l'existant

#### [T028-7] Responsive mobile - 1 colonne (30 min)
- **Description** : Adapter le layout pour mobile/tablette (< 1024px)
- **Fichier** : `code/styles/main.css`
- **Actions** :
  - Media query `@media (max-width: 1024px)`
  - Changer `grid-template-columns: 1fr;` (1 colonne)
  - Ordre : Extérieur puis Intérieur
  - Tester sur 768px et 375px
- **Critères d'acceptation** :
  - Layout 1 colonne sur tablette/mobile
  - Tous les contrôles accessibles
  - Scrolling fonctionnel

#### [T028-8] Tests fonctionnels et event listeners (20 min)
- **Description** : Vérifier que tous les contrôles fonctionnent après restructuration
- **Fichier** : `code/js/app.js`
- **Actions** :
  - Vérifier que les ID/classes n'ont pas changé
  - Tester tous les event listeners (change, click)
  - Vérifier que les rendus API se déclenchent
  - Console sans erreurs
- **Critères d'acceptation** :
  - Tous les contrôles fonctionnels
  - Pas d'erreurs console
  - Comportement identique avant/après

---

## US-029 : Remplacer carousel par mosaïque d'images cliquables (5 SP)

**Objectif** : Remplacer le carousel par une mosaïque/grille d'images avec clic pour plein écran. Vue EXTÉRIEUR : 5 images. Vue INTÉRIEUR : 6 images.

### Tâches US-029

#### [T029-1] Analyse et spécification grille mosaïque (10 min)
- **Description** : Définir le layout Grid pour 5 et 6 images
- **Actions** :
  - Layout 5 images : Grille 3 colonnes (3 en haut, 2 en bas centrées)
  - Layout 6 images : Grille 3 colonnes (3 en haut, 3 en bas) OU 2 colonnes (2x3)
  - Définir aspect ratio et object-fit
- **Résultat** : Spécification CSS Grid claire

#### [T029-2] Modification HTML - Remplacer carousel par grille (20 min)
- **Description** : Remplacer le HTML du carousel par une grille d'images
- **Fichier** : `code/index.html`
- **Actions** :
  - Remplacer `<div class="carousel">` par `<div id="viewport-mosaic" class="mosaic-grid">`
  - Supprimer boutons ← → du carousel
  - Supprimer indicateur "1/5"
  - Conserver placeholder, loader, error
- **Critères d'acceptation** :
  - HTML carrousel supprimé
  - Container mosaïque créé

#### [T029-3] CSS Grid - Mosaïque 5 images (Vue EXTÉRIEUR) (25 min)
- **Description** : Créer le CSS Grid pour afficher 5 images en mosaïque
- **Fichier** : `code/styles/viewport.css` ou `code/styles/main.css`
- **Actions** :
  - Créer classe `.mosaic-grid` avec `display: grid;`
  - `grid-template-columns: repeat(3, 1fr);` (3 colonnes)
  - `gap: 1rem;` (espacement entre images)
  - Centrer les 2 dernières images (ligne 2) avec `grid-column`
  - Styling images : `width: 100%; height: auto; object-fit: cover;`
  - Border-radius moderne (8px)
- **Critères d'acceptation** :
  - Grille 3+2 fonctionnelle
  - Images responsive
  - Espacement cohérent

#### [T029-4] CSS Grid - Mosaïque 6 images (Vue INTÉRIEUR) (15 min)
- **Description** : Adapter le CSS Grid pour 6 images
- **Fichier** : `code/styles/viewport.css` ou `code/styles/main.css`
- **Actions** :
  - Classe `.mosaic-grid.interior` avec `grid-template-columns: repeat(3, 1fr);`
  - Grille 3x2 (2 lignes complètes de 3 images)
  - Alternative : 2 colonnes (2x3) si design préféré
- **Critères d'acceptation** :
  - Grille 6 images équilibrée
  - Layout cohérent avec Ext

#### [T029-5] Hover effects et interactions (20 min)
- **Description** : Ajouter les effets hover sur les miniatures
- **Fichier** : `code/styles/viewport.css` ou `code/styles/main.css`
- **Actions** :
  - Hover : `transform: scale(1.05);`
  - Hover : `box-shadow: 0 4px 12px rgba(0,0,0,0.3);`
  - `cursor: pointer;`
  - `transition: transform 0.2s, box-shadow 0.2s;`
- **Critères d'acceptation** :
  - Hover effect smooth
  - Cursor pointer sur images

#### [T029-6] JS - Fonction renderMosaic() (30 min)
- **Description** : Créer la fonction qui génère la mosaïque d'images
- **Fichier** : `code/js/ui.js`
- **Actions** :
  - Créer fonction `renderMosaic(images)` pour remplacer `updateCarousel(images)`
  - Vider `#viewport-mosaic`
  - Boucle sur `images` : créer `<img>` pour chaque URL
  - Ajouter event listener `click` sur chaque image → `openFullscreen(index)`
  - Gérer cas < 5 ou < 6 images
- **Critères d'acceptation** :
  - Fonction génère dynamiquement les images
  - Event listeners click fonctionnels

#### [T029-7] JS - Intégration avec modal fullscreen (20 min)
- **Description** : Intégrer la mosaïque avec le modal fullscreen existant (US-020)
- **Fichiers** : `code/js/ui.js`, `code/js/app.js`
- **Actions** :
  - Vérifier fonction `openFullscreen(imageIndex)` existante
  - Passer l'index de l'image cliquée au modal
  - Tester navigation ←/→ en fullscreen
  - Tester compteur "X / Y"
  - Tester fermeture ESC et backdrop
- **Critères d'acceptation** :
  - Clic sur image → ouvre fullscreen
  - Navigation fullscreen fonctionnelle
  - Compteur correct

#### [T029-8] JS - Supprimer logique carousel (15 min)
- **Description** : Nettoyer le code en supprimant la logique carousel inutilisée
- **Fichier** : `code/js/ui.js`
- **Actions** :
  - Supprimer fonction `navigateCarousel()`
  - Supprimer fonction `showSlide()`
  - Supprimer fonction `updateIndicators()`
  - Supprimer fonction `buildCarouselHTML()`
  - Garder : `showLoader()`, `hideLoader()`, `showError()`, `showPlaceholder()`
- **Critères d'acceptation** :
  - Code carousel supprimé
  - Fonctions utilitaires conservées
  - Pas d'erreurs console

#### [T029-9] Gestion vue Ext/Int - Nombre d'images dynamique (20 min)
- **Description** : Adapter l'affichage selon la vue (5 images Ext / 6 images Int)
- **Fichiers** : `code/js/ui.js`, `code/js/app.js`
- **Actions** :
  - Détecter `viewType` dans state (`exterior` ou `interior`)
  - Ajouter/retirer classe `.exterior` ou `.interior` sur `.mosaic-grid`
  - Adapter CSS Grid selon nombre d'images
  - Tester changement de vue
- **Critères d'acceptation** :
  - Ext : 5 images affichées
  - Int : 6 images affichées
  - Layout s'adapte automatiquement

#### [T029-10] Responsive mosaïque mobile (20 min)
- **Description** : Adapter la mosaïque pour mobile/tablette
- **Fichier** : `code/styles/viewport.css` ou `code/styles/main.css`
- **Actions** :
  - Media query `@media (max-width: 1024px)` : 2 colonnes
  - Media query `@media (max-width: 768px)` : 1 colonne OU 2 colonnes réduites
  - Tester sur 768px et 375px
- **Critères d'acceptation** :
  - Mosaïque responsive
  - Images toujours cliquables

#### [T029-11] Tests complets et validation (25 min)
- **Description** : Tests end-to-end de la mosaïque
- **Actions** :
  - Tester affichage 5 images (Ext) et 6 images (Int)
  - Tester hover effects sur chaque image
  - Tester clic sur chaque image → fullscreen
  - Tester navigation ←/→ en fullscreen
  - Tester compteur "X / Y"
  - Tester fermeture ESC et backdrop
  - Tester changement de configuration → recharge mosaïque
  - Tester changement de vue Ext/Int
  - Console sans erreurs
- **Critères d'acceptation** :
  - Tous les tests passent
  - Comportement fluide et sans bugs

---

## Ordre d'exécution recommandé

### Option 1 : Développement séquentiel (un dev)
1. **Phase 1 - US-028 : Réorganisation UI** (~3h)
   - T028-1 → T028-2 → T028-3 → T028-4 → T028-5 → T028-6 → T028-7 → T028-8
2. **Phase 2 - US-029 : Mosaïque** (~2-3h)
   - T029-1 → T029-2 → T029-3 → T029-4 → T029-5 → T029-6 → T029-7 → T029-8 → T029-9 → T029-10 → T029-11

### Option 2 : Développement parallèle (deux devs)
**DEV 1 - US-028** (3h) :
- T028-1 → T028-2 → T028-3 → T028-4 → T028-5 → T028-6 → T028-7 → T028-8

**DEV 2 - US-029** (2-3h) :
- T029-1 → T029-2 → T029-3 → T029-4 → T029-5 → T029-6 → T029-7 → T029-8 → T029-9 → T029-10 → T029-11

**Merge final** : Vérifier compatibilité entre les 2 modifications

### Dépendances entre tâches
**US-028 (séquentielles)** :
- T028-2 dépend de T028-1 (analyse)
- T028-3 et T028-4 dépendent de T028-2 (structure HTML créée)
- T028-5 et T028-6 peuvent être faites en parallèle après T028-4
- T028-7 dépend de T028-5
- T028-8 dépend de toutes les précédentes

**US-029 (séquentielles)** :
- T029-2 dépend de T029-1 (analyse)
- T029-3, T029-4, T029-5 peuvent être faites en parallèle après T029-2
- T029-6 dépend de T029-2 (HTML créé)
- T029-7 dépend de T029-6 (fonction renderMosaic)
- T029-8 peut être faite en parallèle avec T029-6/T029-7
- T029-9 dépend de T029-6
- T029-10 peut être faite en parallèle avec T029-6/T029-7
- T029-11 dépend de toutes les précédentes

---

## Critères de succès du Sprint

### US-028 ✅
- [ ] Layout 2 colonnes côte à côte fonctionnel
- [ ] Colonne EXTÉRIEUR : 9 contrôles affichés
- [ ] Colonne INTÉRIEUR : Prestige + 10 dropdowns + 2 toggles affichés
- [ ] Responsive mobile (1 colonne)
- [ ] Tous les contrôles fonctionnels
- [ ] Design cohérent et professionnel

### US-029 ✅
- [ ] Mosaïque 5 images (Ext) et 6 images (Int) affichée
- [ ] Hover effects smooth
- [ ] Clic sur image → ouvre fullscreen
- [ ] Navigation fullscreen fonctionnelle (←/→, ESC, backdrop)
- [ ] Compteur "X / Y" correct
- [ ] Responsive mobile
- [ ] Code carousel supprimé

### Général ✅
- [ ] Console sans erreurs
- [ ] Testé sur Chrome, Firefox, Edge
- [ ] Testé sur desktop (1920x1080, 1366x768)
- [ ] Testé sur tablette (768px)
- [ ] Testé sur mobile (375px)
- [ ] Pas de régression fonctionnelle

---

## Fichiers impactés

### US-028
- `code/index.html` (restructuration DOM)
- `code/styles/main.css` (layout Grid/Flexbox + responsive)
- `code/js/app.js` (vérification event listeners)

### US-029
- `code/index.html` (remplacement carousel)
- `code/styles/viewport.css` OU `code/styles/main.css` (mosaïque Grid + hover)
- `code/js/ui.js` (renderMosaic, suppression carousel)
- `code/js/app.js` (intégration fullscreen)

---

## Notes techniques importantes

### US-028 - Layout 2 colonnes
- **CSS Grid recommandé** : `display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;`
- **Alternative Flexbox** : `display: flex; gap: 2rem;` avec `flex: 1` sur chaque colonne
- **Media queries** : `@media (max-width: 1024px) { grid-template-columns: 1fr; }`
- **Attention** : Vérifier que tous les ID restent identiques après déplacement pour éviter de casser les event listeners

### US-029 - Mosaïque
- **Réutiliser modal US-020** : Pas de redéveloppement, uniquement intégration
- **Layout 5 images** : Grille 3 colonnes, centrer images 4 et 5 avec CSS Grid
  ```css
  .mosaic-grid.exterior {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  .mosaic-grid.exterior img:nth-child(4) {
    grid-column: 2 / 3; /* Centrer 4e image */
  }
  ```
- **Layout 6 images** : Grille 3x2 simple (`grid-template-columns: repeat(3, 1fr);`)
- **Performance** : Utiliser `loading="lazy"` sur images pour optimisation

---

## Risques et mitigation

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Event listeners cassés après restructuration HTML | Haute | Vérifier tous les ID/classes, tester exhaustivement (T028-8) |
| Responsive cassé sur mobile | Moyenne | Tests sur plusieurs tailles d'écran (T028-7, T029-10) |
| Images déformées dans la mosaïque | Faible | Utiliser `object-fit: cover` + aspect ratio fixe |
| Modal fullscreen incompatible avec mosaïque | Faible | Réutiliser code US-020 testé (T029-7) |

---

**Prêt pour développement** : Sprint Backlog complet et détaillé. Le DEV peut commencer l'implémentation.
