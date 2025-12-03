# Product Backlog - Configurateur_Daher

**Projet** : 005-Configurateur_Daher
**Date de creation** : 02/12/2025
**PO** : Claude (PO Agent)
**Derniere mise a jour** : 02/12/2025

---

## 🎯 Vision du Produit

Créer une interface web locale moderne permettant de configurer et visualiser des rendus TBM en temps réel via l'API Lumiscaphe. L'interface doit reproduire toutes les fonctionnalités du script Python existant avec une UX intuitive.

**Objectif métier** : Remplacer l'interaction CLI par une interface graphique accessible sans installation Python.

---

## 📊 Métriques Cibles

- **Performance** : Temps de chargement < 2s
- **UX** : Interaction fluide (< 100ms feedback)
- **Compatibilité** : Navigateurs modernes (Chrome, Firefox, Edge)
- **Simplicité** : Lancement direct via `index.html`

---

## User Stories - Sprint #1 (MVP)

### [US-001] Architecture HTML/CSS/JS de base

**Priorité** : Critique
**Story Points** : 3 SP
**Sprint** : Sprint #1 (Prévu)
**Status** : To Do

**User Story :**
En tant que développeur,
Je veux une structure HTML/CSS/JS moderne et fonctionnelle,
Afin de pouvoir lancer l'application en ouvrant simplement index.html.

**Critères d'acceptation :**
- [ ] Fichier `index.html` avec structure sémantique
- [ ] CSS moderne (Flexbox/Grid) via fichier externe ou CDN
- [ ] JavaScript ES6+ modulaire
- [ ] Architecture responsive (mobile-first)
- [ ] Pas de build step requis (pas de npm/webpack)
- [ ] Console sans erreurs au chargement

**Notes techniques :**
- Utiliser CSS moderne (Tailwind CDN ou custom)
- Structure : `index.html`, `style.css`, `app.js`
- Support async/await, fetch API

---

### [US-002] Viewport avec carrousel d'images

**Priorité** : Critique
**Story Points** : 5 SP
**Sprint** : Sprint #1 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux voir un viewport affichant un carrousel des images reçues de l'API,
Afin de visualiser toutes les vues générées (view_01, view_02, etc.).

**Critères d'acceptation :**
- [ ] Zone viewport centrée avec dimensions adaptatives
- [ ] Carrousel fonctionnel (navigation précédent/suivant)
- [ ] Indicateurs de position (1/5, 2/5...)
- [ ] Images responsive (max-width, object-fit)
- [ ] Loader affiché pendant chargement API
- [ ] Message si aucune image disponible

**Notes techniques :**
- Pas de librairie externe (carrousel custom)
- Utiliser `display: flex` pour le slider
- Transitions CSS smooth

---

### [US-003] Panel de contrôles - Sélecteurs principaux

**Priorité** : Critique
**Story Points** : 8 SP
**Sprint** : Sprint #1 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux des contrôles dropdown pour configurer mon avion,
Afin de sélectionner version, peinture, intérieur, décor, hélice, et style de police.

**Critères d'acceptation :**
- [ ] Dropdown "Modèle Avion" (960, 980)
- [ ] Dropdown "Schéma Peinture" (Sirocco, Alize, Mistral, Meltem, Tehuano, Zephyr)
- [ ] Dropdown "Intérieur" (Oslo, SanPedro, London, Labrador, GooseBay, BlackFriars, Fjord, Atacama)
- [ ] Dropdown "Décor" (Tarmac, Studio, Hangar, Onirique, Fjord)
- [ ] Dropdown "Hélice" (PolishedAluminium, MattBlack)
- [ ] Radio buttons "Type Police" (Slanted/Straight)
- [ ] Dropdown "Style" dynamique selon type police (A-E pour Slanted, F-J pour Straight)
- [ ] Valeurs par défaut identiques au script Python
- [ ] Labels clairs et traductions françaises

**Notes techniques :**
- Récupérer les listes depuis constantes JS (copie du Python)
- Event listeners sur `change` pour chaque contrôle
- État global de configuration

---

### [US-004] Gestion de l'immatriculation

**Priorité** : Critique
**Story Points** : 3 SP
**Sprint** : Sprint #1 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux saisir une immatriculation personnalisée,
Afin de personnaliser les lettres affichées sur l'avion.

**Critères d'acceptation :**
- [x] Champ texte libre pour immatriculation
- [x] Validation temps réel : max 6 caractères
- [x] Conversion automatique en majuscules
- [x] Valeur par défaut : "NWM1MW"
- [x] Bouton "Envoyer" dédié (pas d'appel API automatique)
- [x] Message d'erreur si > 6 caractères
- [x] Placeholder informatif

**Notes techniques :**
- `<input type="text" maxlength="6">`
- Transformation `.toUpperCase()` sur input
- Bouton déclenche uniquement si changement détecté

---

### [US-005] Intégration API Lumiscaphe

**Priorité** : Critique
**Story Points** : 8 SP
**Sprint** : Sprint #1 (Prévu)
**Status** : To Do

**User Story :**
En tant que système,
Je veux envoyer les configurations à l'API et récupérer les images,
Afin d'afficher les rendus dans le viewport.

**Critères d'acceptation :**
- [ ] Construction du payload JSON identique au script Python
- [ ] Appel `POST https://wr-daher.lumiscaphe.com/Snapshot`
- [ ] Récupération du tableau d'URLs d'images
- [ ] Téléchargement de toutes les images
- [ ] Affichage dans le carrousel
- [ ] Gestion erreurs HTTP (404, 500, timeout)
- [ ] Retry automatique en cas d'échec réseau

**Notes techniques :**
- Utiliser `fetch()` avec async/await
- Construire payload avec :
  - `scene.database`, `configuration`, `materials`, `materialMultiLayers`, `surfaces`
  - `mode.images.cameraGroup`
  - `renderParameters` (width, height, antialiasing, superSampling)
  - `encoder.jpeg.quality`
- Parser réponse JSON et charger images via `Promise.all()`

---

### [US-006] Logique de calcul des positions

**Priorité** : Haute
**Story Points** : 5 SP
**Sprint** : Sprint #1 (Prévu)
**Status** : To Do

**User Story :**
En tant que système,
Je veux calculer les positions des lettres d'immatriculation,
Afin de générer le bon payload API avec spacing 5cm edge-to-edge.

**Critères d'acceptation :**
- [ ] Fonction `extractAnchors()` (extrait Start/Direction depuis config)
- [ ] Fonction `calculateTransformsAbsolute()` (calcul positions X)
- [ ] Utilisation de `CHAR_WIDTHS` (W: 0.30, M: 0.30, I: 0.05, DEFAULT: 0.20)
- [ ] Espacement `SPACING = 0.05` entre lettres
- [ ] Génération `surfaces` avec `translation.x` et `translation.y`
- [ ] Logique identique au script Python (lignes 159-198)

**Notes techniques :**
- Copier/adapter les fonctions Python en JavaScript
- Gérer les anchors par défaut si extraction échoue
- Tester avec "NWM1MW" pour validation

---

### [US-007] Gestion des couleurs et matériaux

**Priorité** : Haute
**Story Points** : 5 SP
**Sprint** : Sprint #1 (Prévu)
**Status** : To Do

**User Story :**
En tant que système,
Je veux construire les listes `materials` et `materialMultiLayers`,
Afin d'appliquer les bonnes couleurs aux textures d'immatriculation.

**Critères d'acceptation :**
- [ ] Fonction `parseColorsFromConfig()` (extraction couleurs zones)
- [ ] Fonction `resolveLetterColors()` (couleurs selon style)
- [ ] Génération `materials` : un par lettre (RegL0-RegLN, RegR0-RegRN)
- [ ] Génération `materialMultiLayers` : 2 layers par texture unique
- [ ] Application `diffuseColor` (color_L0, color_L1)
- [ ] Éviter doublons (caractères uniques seulement)

**Notes techniques :**
- Parser la configuration string (format `/` séparé)
- Extraire hex colors depuis `Exterior_Colors_Zone`
- Mapper style A-J vers paires de zones

---

### [US-008] Appel API automatique sur changements

**Priorité** : Haute
**Story Points** : 3 SP
**Sprint** : Sprint #1 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux que l'interface génère automatiquement un nouveau rendu à chaque changement de sélection,
Afin de voir immédiatement le résultat sans cliquer sur un bouton.

**Critères d'acceptation :**
- [ ] Event listeners sur tous les contrôles (sauf immatriculation)
- [ ] Appel API déclenché sur `change` de dropdown/radio
- [ ] Debounce de 300ms pour éviter appels multiples
- [ ] Loader affiché pendant requête
- [ ] Pas d'appel si configuration identique
- [ ] Exception : immatriculation nécessite bouton "Envoyer"

**Notes techniques :**
- Utiliser `debounce()` ou timeout simple
- Comparer hash de config avant appel
- Désactiver contrôles pendant loading

---

### [US-009] États de chargement et feedbacks UX

**Priorité** : Haute
**Story Points** : 3 SP
**Sprint** : Sprint #1 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux des feedbacks visuels clairs pendant les opérations,
Afin de comprendre l'état de l'application.

**Critères d'acceptation :**
- [ ] Loader/spinner pendant appel API
- [ ] Message "Génération en cours..." dans viewport
- [ ] Désactivation des contrôles pendant loading
- [ ] Message succès "Rendu généré !" (toast ou notification)
- [ ] Message d'erreur détaillé en cas d'échec
- [ ] Indicateur de connexion API (online/offline)

**Notes techniques :**
- CSS animations pour loader
- États UI : `idle`, `loading`, `success`, `error`
- Timeout 30s pour requêtes API

---

### [US-010] Gestion des erreurs API

**Priorité** : Moyenne
**Story Points** : 3 SP
**Sprint** : Sprint #1 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux être informé clairement des erreurs,
Afin de comprendre pourquoi un rendu a échoué.

**Critères d'acceptation :**
- [ ] Catch des erreurs HTTP (404, 500, etc.)
- [ ] Catch des erreurs réseau (timeout, no connection)
- [ ] Affichage message d'erreur user-friendly
- [ ] Bouton "Réessayer" en cas d'échec
- [ ] Log détaillé dans console (debug)
- [ ] Fallback image ou placeholder

**Notes techniques :**
- Try/catch sur fetch + .json()
- Mapper codes HTTP vers messages français
- Garder dernière config valide en cache

---

## User Stories - Sprint #2 (Améliorations)

### [US-011] Sélecteur de dimensions d'image

**Priorité** : Moyenne
**Story Points** : 2 SP
**Sprint** : Sprint #2 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux définir la résolution des rendus,
Afin d'obtenir des images adaptées à mon usage.

**Critères d'acceptation :**
- [ ] Inputs "Largeur" et "Hauteur"
- [ ] Valeurs par défaut : 1920x1080
- [ ] Validation : min 100px, max 10000px
- [ ] Presets : HD (1920x1080), 4K (3840x2160), Square (1080x1080)
- [ ] Injection dans `renderParameters`

---

### [US-012] Historique des configurations

**Priorité** : Faible
**Story Points** : 5 SP
**Sprint** : Sprint #2 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux sauvegarder mes configurations favorites,
Afin de les recharger rapidement.

**Critères d'acceptation :**
- [ ] Bouton "Sauvegarder configuration"
- [ ] Liste des configurations sauvegardées (localStorage)
- [ ] Bouton "Charger" pour chaque config
- [ ] Export/Import JSON
- [ ] Nommage personnalisé des configs

---

### [US-013] Mode plein écran viewport

**Priorité** : Faible
**Story Points** : 2 SP
**Sprint** : Sprint #2 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux afficher le viewport en plein écran,
Afin de mieux visualiser les détails du rendu.

**Critères d'acceptation :**
- [ ] Bouton "Plein écran" sur viewport
- [ ] API Fullscreen native navigateur
- [ ] Raccourci clavier Échap pour quitter
- [ ] Navigation carrousel toujours fonctionnelle

---

### [US-014] Téléchargement des images

**Priorité** : Moyenne
**Story Points** : 2 SP
**Sprint** : Sprint #2 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux télécharger les rendus générés,
Afin de les utiliser hors ligne.

**Critères d'acceptation :**
- [ ] Bouton "Télécharger l'image" sur viewport
- [ ] Téléchargement de l'image affichée
- [ ] Nom de fichier : `TBM_{version}_{immat}_{scheme}_{view}.jpg`
- [ ] Bouton "Télécharger tout" (ZIP)

---

### [US-015] Mode sombre / clair

**Priorité** : Faible
**Story Points** : 3 SP
**Sprint** : Sprint #2 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux basculer entre thème sombre et clair,
Afin d'adapter l'interface à mes préférences.

**Critères d'acceptation :**
- [ ] Toggle switch thème
- [ ] Sauvegarde préférence (localStorage)
- [ ] CSS variables pour couleurs
- [ ] Détection préférence système (prefers-color-scheme)

---

## Backlog Icebox (Idées futures)

- **[IDEA-001]** : Comparaison côte à côte de 2 configurations
- **[IDEA-002]** : Partage de configuration via URL
- **[IDEA-003]** : Mode démo avec rotation automatique des configs
- **[IDEA-004]** : Intégration annotations sur images
- **[IDEA-005]** : Export PDF avec toutes les vues

---

## Définition de terminé (DoD)

- [ ] Code fonctionnel testé manuellement
- [ ] Code commenté (fonctions complexes)
- [ ] Pas d'erreurs console
- [ ] Testé sur Chrome, Firefox, Edge
- [ ] Responsive (desktop + tablette)
- [ ] Documentation utilisateur à jour

---

**Total Sprint #1** : 48 Story Points
**Total Sprint #2** : 14 Story Points
**Total Icebox** : À estimer
