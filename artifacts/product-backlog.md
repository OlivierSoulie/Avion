# Product Backlog - Configurateur_Daher

**Projet** : 005-Configurateur_Daher
**Date de creation** : 02/12/2025
**PO** : Claude (PO Agent)
**Derniere mise a jour** : 06/12/2025 - US-043 (Refactoring complet) ajoutée au Sprint #13

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

## User Stories - Sprint #3 (Nouvelles fonctionnalités UI)

### [US-020] Bouton plein écran pour les images

**Priorité** : Haute
**Story Points** : 2 SP
**Sprint** : Sprint #3 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux un bouton pour voir l'image actuelle en plein écran,
Afin d'examiner les détails du rendu avec une meilleure visibilité.

**Critères d'acceptation :**
- [ ] Bouton "Plein écran" visible sur le viewport (icône expand)
- [ ] Clic ouvre l'image actuelle en mode plein écran
- [ ] Navigation précédent/suivant fonctionne en plein écran
- [ ] Touche `ESC` ou clic sur fond ferme le plein écran
- [ ] Bouton "Fermer" (X) visible en overlay
- [ ] Indicateur de position (1/5, 2/5...) visible en plein écran
- [ ] Smooth transitions (fade in/out)

**Notes techniques :**
- Utiliser Fullscreen API (`element.requestFullscreen()`)
- Overlay modal avec `position: fixed` et `z-index: 9999`
- Event listeners : `ESC`, flèches clavier, click sur backdrop
- CSS : fond noir semi-transparent, image centrée

---

### [US-021] Téléchargement de la requête JSON

**Priorité** : Moyenne
**Story Points** : 2 SP
**Sprint** : Sprint #3 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux télécharger la requête JSON générée,
Afin de pouvoir l'analyser, la déboguer ou la réutiliser manuellement.

**Critères d'acceptation :**
- [ ] Bouton "Télécharger JSON" visible dans les contrôles
- [ ] Clic télécharge un fichier `request.json`
- [ ] JSON formaté (indenté, lisible)
- [ ] Contenu identique au payload envoyé à l'API
- [ ] Nom de fichier : `request_{timestamp}.json` ou `request_{immat}_{config}.json`
- [ ] Feedback visuel au téléchargement (toast "JSON téléchargé !")

**Notes techniques :**
- Utiliser `Blob` + `URL.createObjectURL()`
- `JSON.stringify(payload, null, 2)` pour formatage
- Lien `<a download="request.json">` créé dynamiquement
- Trigger `.click()` programmatique

---

### [US-022] Sélecteur de vue Extérieur / Intérieur

**Priorité** : Haute
**Story Points** : 5 SP
**Sprint** : Sprint #3 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux basculer entre les vues extérieures et intérieures de l'avion,
Afin de visualiser à la fois l'apparence externe et l'aménagement intérieur.

**Critères d'acceptation :**
- [ ] Toggle/Switch "Extérieur / Intérieur" visible dans les contrôles
- [ ] Clic charge un nouveau rendu avec les caméras appropriées
- [ ] Vue Extérieur : affiche fuselage, immatriculation, peinture (comportement actuel)
- [ ] Vue Intérieur : affiche cabine, sièges, finitions intérieures
- [ ] Carrousel fonctionne pour les deux types de vues
- [ ] État de la sélection persisté (si l'utilisateur change config, garde la vue active)
- [ ] Indicateur visuel clair de la vue active (highlight, underline, ou état actif)

**Notes techniques :**
- Ajouter paramètre `viewType: "exterior" | "interior"` au state
- Modifier `findCameraGroupId()` ou créer fonction dédiée pour gérer deux types :
  - Extérieur : `cameraGroup` actuel (recherche `Exterieur_Decor{NomDecor}`)
  - Intérieur : `cameraGroup` fixe avec `name="Interieur"` (pas de suffixe décor)
- Modifier `buildPayload()` pour utiliser le bon `cameraGroup` selon `viewType`
- Toggle buttons ou radio buttons (Material Design style)
- Event listener sur changement de vue → `triggerRender()`
- **IMPORTANT** : Camera group intérieur = unique, toujours "Interieur" (pas de variation par décor)

---

### [US-019] Sélection de base de données dynamique

**Priorité** : CRITIQUE (Demande utilisateur explicite)
**Story Points** : À estimer après spécifications
**Sprint** : Sprint #3 (En attente instructions utilisateur)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux sélectionner quelle base de données utiliser,
Afin de pouvoir travailler avec différentes bases sans modifier le code.

**Critères d'acceptation :**
- [ ] À définir par l'utilisateur

**Notes techniques :**
- Actuellement DATABASE_ID est hardcodé dans `config.js`
- Instructions d'implémentation à fournir par l'utilisateur

---

## Backlog Icebox (Idées futures NON demandées)

**NOTE** : Ces US ont été créées automatiquement mais n'ont JAMAIS été demandées par l'utilisateur. Archivées ici pour référence future uniquement.

- **[US-011-ARCHIVED]** : Sélecteur de dimensions d'image (2 SP)
- **[US-012-ARCHIVED]** : Historique des configurations (5 SP)
- **[US-013-ARCHIVED]** : Mode plein écran viewport (2 SP)
- **[US-014-ARCHIVED]** : Téléchargement des images (2 SP)
- **[US-015-ARCHIVED]** : Mode sombre / clair (3 SP)
- **[IDEA-001]** : Comparaison côte à côte de 2 configurations
- **[IDEA-002]** : Partage de configuration via URL
- **[IDEA-003]** : Mode démo avec rotation automatique des configs
- **[IDEA-004]** : Intégration annotations sur images
- **[IDEA-005]** : Export PDF avec toutes les vues

---

## User Stories - Sprint #5 (Contrôles avancés)

### [US-023] Contrôle Tablet (Tablette)

**Priorité** : Moyenne
**Story Points** : 1 SP
**Sprint** : Sprint #5 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux contrôler l'état de la tablette (ouverte/fermée),
Afin de visualiser l'intérieur avec différentes configurations de tablette.

**Critères d'acceptation :**
- [ ] Toggle "Tablette" dans les contrôles (Ouverte / Fermée)
- [ ] Valeur par défaut : Fermée
- [ ] État ajouté dans state.js (`tablet: "Closed"`)
- [ ] Config string inclut `Tablet.Closed` ou `Tablet.Open`
- [ ] Changement déclenche nouveau rendu
- [ ] Fonctionne pour vues extérieure ET intérieure

**Notes techniques :**
- Valeurs possibles : `Tablet.Closed`, `Tablet.Open`
- Position dans config string : Après `SunGlass`

---

### [US-024] Contrôle SunGlass (Lunettes de soleil)

**Priorité** : Moyenne
**Story Points** : 1 SP
**Sprint** : Sprint #5 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux contrôler l'état des lunettes de soleil (ON/OFF),
Afin de voir l'avion avec ou sans pare-soleil.

**Critères d'acceptation :**
- [ ] Toggle "Lunettes de soleil" dans les contrôles (ON / OFF)
- [ ] Valeur par défaut : OFF
- [ ] État ajouté dans state.js (`sunglass: "SunGlassOFF"`)
- [ ] Config string inclut `SunGlass.SunGlassON` ou `SunGlass.SunGlassOFF`
- [ ] Changement déclenche nouveau rendu
- [ ] Fonctionne pour vues extérieure ET intérieure

**Notes techniques :**
- Valeurs possibles : `SunGlass.SunGlassON`, `SunGlass.SunGlassOFF`
- Actuellement hardcodé à `SunGlassOFF`

---

### [US-025] Contrôle Door_pilot (Porte pilote)

**Priorité** : Moyenne
**Story Points** : 1 SP
**Sprint** : Sprint #5 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux contrôler l'état de la porte pilote (ouverte/fermée),
Afin de visualiser différentes configurations d'ouverture.

**Critères d'acceptation :**
- [ ] Toggle "Porte pilote" dans les contrôles (Ouverte / Fermée)
- [ ] Valeur par défaut : Fermée
- [ ] État ajouté dans state.js (`doorPilot: "Closed"`)
- [ ] Config string inclut `Door_pilot.Closed` ou `Door_pilot.Open`
- [ ] Changement déclenche nouveau rendu
- [ ] Fonctionne pour vues extérieure ET intérieure

**Notes techniques :**
- Valeurs possibles : `Door_pilot.Closed`, `Door_pilot.Open`
- Actuellement hardcodé à `Closed`

---

### [US-026] Contrôle Door_passenger (Porte passager)

**Priorité** : Moyenne
**Story Points** : 1 SP
**Sprint** : Sprint #5 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux contrôler l'état de la porte passager (ouverte/fermée),
Afin de visualiser différentes configurations d'ouverture.

**Critères d'acceptation :**
- [ ] Toggle "Porte passager" dans les contrôles (Ouverte / Fermée)
- [ ] Valeur par défaut : Fermée
- [ ] État ajouté dans state.js (`doorPassenger: "Closed"`)
- [ ] Config string inclut `Door_passenger.Closed` ou `Door_passenger.Open`
- [ ] Changement déclenche nouveau rendu
- [ ] Fonctionne pour vues extérieure ET intérieure

**Notes techniques :**
- Valeurs possibles : `Door_passenger.Closed`, `Door_passenger.Open`
- Actuellement hardcodé à `Closed`

---

## User Stories - Sprint #6 (Configuration Intérieur Avancée)

### [US-027] Configurateur intérieur complet (10 paramètres personnalisables)

**Priorité** : Haute
**Story Points** : 10 SP
**Sprint** : Sprint #6 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur en vue intérieure,
Je veux pouvoir personnaliser individuellement chaque élément de l'intérieur de l'avion (tapis, cuir, bois, ceintures, etc.),
Afin de créer une configuration intérieur sur-mesure tout en gardant la possibilité de partir d'un template Prestige.

**Contexte :**
- **NOUVEAU** : Cette fonctionnalité n'existe PAS dans le script Python
- Le sélecteur "Prestige" actuel (Oslo, London, etc.) reste visible et sert de **template de base**
- Quand on sélectionne un Prestige, ça charge automatiquement les 10 valeurs par défaut de ce prestige dans les dropdowns
- Ensuite, l'utilisateur peut modifier individuellement chaque élément via 10 nouveaux dropdowns
- La configuration finale combine le prestige de base + les modifications individuelles

**Architecture XML :**
Chaque prestige (ex: Oslo) contient une config string avec 10 parties :
```
Interior_Carpet.LightBrown_carpet_Premium/
Interior_CentralSeatMaterial.Leather_Premium/
Interior_LowerSidePanel.BeigeGray_2176_Leather_Premium/
Interior_MetalFinish.BrushedStainless_metal_Premium/
Interior_PerforatedSeatOptions.NoSeatPerforation_Premium/
Interior_SeatCovers.BeigeGray_2176_Leather_Premium/
Interior_Seatbelts.OatMeal_belt/
Interior_TabletFinish.SapelliMat_table_wood_Premium/
Interior_Ultra-SuedeRibbon.Elephant_3367_Suede_Premium/
Interior_UpperSidePanel.WhiteSand_2192_Leather_Premium
```

**Critères d'acceptation :**

**A. Interface utilisateur (UI) - 10 nouveaux dropdowns organisés par sections**

**SECTION 1 : SIÈGES** (4 dropdowns regroupés)
- [ ] Dropdown "Cuir des sièges" avec 46 couleurs de cuir
- [ ] Dropdown "Ceintures de sécurité" avec 4 couleurs (BlackJet, ChromeGray, OatMeal, SoftMoon)
- [ ] Dropdown "Matériau siège central" avec 2 options (Leather, Ultra-Suede)
- [ ] Dropdown "Perforation des sièges" avec 2 options (NoSeatPerforation, SeatCenterPerforation)

**SECTION 2 : MATÉRIAUX ET FINITIONS** (6 dropdowns regroupés)
- [ ] Dropdown "Tapis" avec 3 options (CharcoalBlack, LightBrown, TaupeGray)
- [ ] Dropdown "Bois de la tablette" avec 4 options (Carbon, GlossyWalnut, KotoMat, SapelliMat)
- [ ] Dropdown "Finition métallique" avec 3 options (BrushedStainless, FlatBlack, Gold)
- [ ] Dropdown "Panneau latéral supérieur" avec 46 couleurs de cuir
- [ ] Dropdown "Panneau latéral inférieur" avec 46 couleurs de cuir
- [ ] Dropdown "Ruban Ultra-Suede" avec 12 couleurs (BlackOnyx, Bone, Elephant, Mink, etc.)

**GÉNÉRAL**
- [ ] Labels clairs et en français pour chaque dropdown
- [ ] Section "Configuration Intérieur" visuellement distincte avec 2 sous-sections ("Sièges" et "Matériaux et finitions")
- [ ] Design visuel cohérent : titres de section, espacement, regroupement visible

**B. Comportement - Initialisation depuis Prestige**
- [ ] Quand on sélectionne un Prestige (ex: Oslo), parser le XML pour extraire les 10 valeurs
- [ ] Remplir automatiquement les 10 dropdowns avec les valeurs du prestige sélectionné
- [ ] Fonction `parsePrestigeConfig(xmlDoc, prestigeName)` qui retourne un objet avec les 10 propriétés
- [ ] Si parsing échoue, utiliser des valeurs par défaut cohérentes

**C. Comportement - Personnalisation individuelle**
- [ ] Chaque dropdown peut être modifié indépendamment
- [ ] Changement d'un dropdown → met à jour l'état correspondant dans state.js
- [ ] Changement d'un dropdown → déclenche nouveau rendu API (triggerRender)
- [ ] Les modifications individuelles persistent même si on change de Prestige
- [ ] Exception : Si on change de Prestige, réinitialiser tous les dropdowns avec le nouveau prestige

**D. State Management**
- [ ] 10 nouvelles propriétés dans state.js :
  - `carpet` (ex: "LightBrown_carpet_Premium")
  - `seatCovers` (ex: "BeigeGray_2176_Leather_Premium")
  - `tabletFinish` (ex: "SapelliMat_table_wood_Premium")
  - `seatbelts` (ex: "OatMeal_belt")
  - `metalFinish` (ex: "BrushedStainless_metal_Premium")
  - `upperSidePanel` (ex: "WhiteSand_2192_Leather_Premium")
  - `lowerSidePanel` (ex: "BeigeGray_2176_Leather_Premium")
  - `ultraSuedeRibbon` (ex: "Elephant_3367_Suede_Premium")
  - `centralSeatMaterial` (ex: "Leather_Premium")
  - `perforatedSeatOptions` (ex: "NoSeatPerforation_Premium")
- [ ] 10 getters correspondants (ex: `getCarpet()`, `getSeatCovers()`, etc.)
- [ ] Valeurs par défaut cohérentes avec Prestige "Oslo"

**E. Construction config string**
- [ ] Modifier `getConfigString()` dans api.js pour utiliser les valeurs individuelles
- [ ] Au lieu de `Interior_PrestigeSelection.{prestige}`, construire :
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
- [ ] Config string finale correctement formatée et envoyée à l'API

**F. Event Listeners**
- [ ] Event listener sur changement du dropdown "Prestige" → parser XML et initialiser les 10 dropdowns
- [ ] 10 event listeners sur les dropdowns individuels → mettre à jour state et déclencher rendu
- [ ] Total : 11 event listeners (1 prestige + 10 individuels)

**G. Parsing XML**
- [ ] Fonction `parsePrestigeConfig(xmlDoc, prestigeName)` créée
- [ ] Cherche bookmark `Interior_PrestigeSelection_{prestigeName}` dans le XML
- [ ] Parse la valeur (format `/` séparé) et extrait les 10 parties
- [ ] Retourne un objet `{ carpet: "...", seatCovers: "...", tabletFinish: "...", etc. }`
- [ ] Gestion d'erreur si bookmark introuvable

**H. Configuration lists (config.js)**
- [ ] 10 nouvelles listes de choix exportées :
  - `CARPET_LIST` (3 options)
  - `SEAT_COVERS_LIST` (46 options)
  - `TABLET_FINISH_LIST` (4 options)
  - `SEATBELTS_LIST` (4 options)
  - `METAL_FINISH_LIST` (3 options)
  - `UPPER_SIDE_PANEL_LIST` (46 options - peut réutiliser SEAT_COVERS_LIST)
  - `LOWER_SIDE_PANEL_LIST` (46 options - peut réutiliser SEAT_COVERS_LIST)
  - `ULTRA_SUEDE_RIBBON_LIST` (12 options)
  - `CENTRAL_SEAT_MATERIAL_LIST` (2 options)
  - `PERFORATED_SEAT_OPTIONS_LIST` (2 options)
- [ ] Listes correctement formatées avec nom lisible + valeur technique

**I. Vue intérieure uniquement**
- [ ] Les 10 dropdowns sont visibles SEULEMENT en vue intérieure
- [ ] En vue extérieure, masquer les 10 dropdowns (ou griser)
- [ ] Affichage conditionnel basé sur `viewType === "interior"`

**J. Tests et validation**
- [ ] Sélectionner Prestige "Oslo" → vérifier que les 10 dropdowns se remplissent correctement
- [ ] Modifier "Tapis" → vérifier que le rendu change
- [ ] Modifier "Cuir des sièges" → vérifier que le rendu change
- [ ] Modifier plusieurs éléments → vérifier que tous les changements sont appliqués
- [ ] Changer de Prestige → vérifier que tous les dropdowns se réinitialisent
- [ ] Passer de vue extérieure → intérieure → vérifier que les dropdowns apparaissent
- [ ] Console sans erreurs
- [ ] Payload API contient bien les 10 parties `Interior_...`

**Notes techniques :**

**Fichiers à modifier :**
1. **config.js** : Ajouter les 10 listes de choix
2. **state.js** : Ajouter 10 propriétés + 10 getters
3. **api.js** :
   - Créer `parsePrestigeConfig(xmlDoc, prestigeName)`
   - Modifier `getConfigString()` pour construire la config intérieur custom
4. **index.html** : Ajouter 10 nouveaux dropdowns organisés en 2 sections
   - Section "Sièges" (4 dropdowns)
   - Section "Matériaux et finitions" (6 dropdowns)
5. **app.js** : Ajouter 11 event listeners (1 prestige + 10 individuels)
6. **main.css** : Styling pour les sections "Sièges" et "Matériaux et finitions"

**Structure HTML recommandée :**
```html
<div id="interior-config-section" class="config-section">
  <h3>Configuration Intérieur</h3>

  <!-- SECTION 1 : SIÈGES -->
  <div class="interior-subsection">
    <h4>Sièges</h4>
    <div class="control-group">
      <label>Cuir des sièges</label>
      <select id="seat-covers">...</select>
    </div>
    <div class="control-group">
      <label>Ceintures de sécurité</label>
      <select id="seatbelts">...</select>
    </div>
    <div class="control-group">
      <label>Matériau siège central</label>
      <select id="central-seat-material">...</select>
    </div>
    <div class="control-group">
      <label>Perforation des sièges</label>
      <select id="perforated-seat-options">...</select>
    </div>
  </div>

  <!-- SECTION 2 : MATÉRIAUX ET FINITIONS -->
  <div class="interior-subsection">
    <h4>Matériaux et finitions</h4>
    <div class="control-group">
      <label>Tapis</label>
      <select id="carpet">...</select>
    </div>
    <div class="control-group">
      <label>Bois de la tablette</label>
      <select id="tablet-finish">...</select>
    </div>
    <div class="control-group">
      <label>Finition métallique</label>
      <select id="metal-finish">...</select>
    </div>
    <div class="control-group">
      <label>Panneau latéral supérieur</label>
      <select id="upper-side-panel">...</select>
    </div>
    <div class="control-group">
      <label>Panneau latéral inférieur</label>
      <select id="lower-side-panel">...</select>
    </div>
    <div class="control-group">
      <label>Ruban Ultra-Suede</label>
      <select id="ultra-suede-ribbon">...</select>
    </div>
  </div>
</div>
```

**Extraction des options depuis le XML :**
```javascript
// Exemple : Parser le prestige Oslo
const bookmark = xmlDoc.querySelector('ConfigurationBookmark[label="Interior_PrestigeSelection_Oslo"]');
const value = bookmark.getAttribute('value');
// value = "Interior_Carpet.LightBrown_carpet_Premium/Interior_CentralSeatMaterial.Leather_Premium/..."
const parts = value.split('/');
parts.forEach(part => {
  if (part.startsWith('Interior_Carpet.')) {
    const carpet = part.replace('Interior_Carpet.', '');
    // carpet = "LightBrown_carpet_Premium"
  }
  // ... idem pour les 9 autres
});
```

**Affichage conditionnel (Vue intérieure uniquement) :**
```javascript
// Dans app.js, event listener sur viewType
document.getElementById('view-exterior').addEventListener('click', () => {
  document.getElementById('interior-config-section').style.display = 'none';
});
document.getElementById('view-interior').addEventListener('click', () => {
  document.getElementById('interior-config-section').style.display = 'block';
});
```

**Complexité :**
- 10 dropdowns à créer (UI)
- 10 listes de choix (data)
- 1 fonction de parsing XML
- 11 event listeners
- Modification de la config string
- Affichage conditionnel

**Estimation** : 10 Story Points (~5-6h de développement)

---

## User Stories - Sprint #7 (Réorganisation UI et Mosaïque d'images)

### [US-028] Affichage conditionnel des contrôles selon la vue active (Extérieur / Intérieur)

**Priorité** : Haute
**Story Points** : 3 SP
**Sprint** : Sprint #7 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux voir UNIQUEMENT les contrôles pertinents selon la vue active (Extérieur ou Intérieur),
Afin d'avoir une interface claire et épurée qui affiche seulement ce dont j'ai besoin.

**Contexte actuel :**
- Tous les contrôles sont visibles en même temps (Extérieur + Intérieur)
- Souhaité : **Affichage conditionnel** basé sur le sélecteur de vue

**Comportement souhaité :**
- **Vue EXTÉRIEUR** → Afficher UNIQUEMENT les contrôles extérieur, masquer les contrôles intérieur
- **Vue INTÉRIEUR** → Afficher UNIQUEMENT les contrôles intérieur, masquer les contrôles extérieur
- **PAS de 2 colonnes simultanées**, juste un switch dynamique

**Critères d'acceptation :**

**A. Contrôles EXTÉRIEUR (visibles uniquement en vue Extérieur)**
- [ ] Dropdown "Modèle Avion" (960, 980)
- [ ] Dropdown "Schéma Peinture" (Sirocco, Alize, Mistral, etc.)
- [ ] Dropdown "Décor" (Tarmac, Studio, Hangar, Onirique, Fjord)
- [ ] Dropdown "Hélice" (PolishedAluminium, MattBlack)
- [ ] Toggle/Dropdown "Porte pilote" (Ouverte/Fermée)
- [ ] Toggle/Dropdown "Porte passager" (Ouverte/Fermée)
- [ ] Champ texte + bouton "Immatriculation"
- [ ] Radio buttons "Type Police" (Slanted/Straight)
- [ ] Dropdown "Style" (A-E pour Slanted, F-J pour Straight)

**B. Contrôles INTÉRIEUR (visibles uniquement en vue Intérieur)**
- [ ] Dropdown "Prestige" (Oslo, London, SanPedro, Labrador, GooseBay, BlackFriars, Fjord, Atacama)
- [ ] Section "Sièges" (4 dropdowns US-027) :
  - Cuir des sièges (46 options)
  - Ceintures de sécurité (4 options)
  - Matériau siège central (2 options)
  - Perforation des sièges (2 options)
- [ ] Section "Matériaux et finitions" (6 dropdowns US-027) :
  - Tapis (3 options)
  - Bois de la tablette (4 options)
  - Finition métallique (3 options)
  - Panneau latéral supérieur (46 options)
  - Panneau latéral inférieur (46 options)
  - Ruban Ultra-Suede (12 options)
- [ ] Toggle "Tablette" (Ouverte/Fermée)
- [ ] Toggle "Lunettes de soleil" (ON/OFF)

**C. Sélecteur de vue**
- [ ] Le sélecteur de vue Ext/Int reste visible et accessible en permanence
- [ ] Position : En haut de la section de contrôles (ou emplacement existant)
- [ ] Toggle clair : Boutons radio OU switch OU boutons toggle
- [ ] Indicateur visuel de la vue active (highlight, underline, ou état actif)

**D. Comportement de basculement**
- [ ] **Clic sur "Vue EXTÉRIEUR"** :
  - Masquer tous les contrôles intérieur (`display: none` ou `visibility: hidden`)
  - Afficher tous les contrôles extérieur
  - Déclencher le rendu API avec les caméras extérieures
- [ ] **Clic sur "Vue INTÉRIEUR"** :
  - Masquer tous les contrôles extérieur (`display: none` ou `visibility: hidden`)
  - Afficher tous les contrôles intérieur
  - Déclencher le rendu API avec les caméras intérieures
- [ ] Transition smooth optionnelle (fade in/out)
- [ ] Pas de scroll ou saut visuel lors du changement

**E. Layout et position**
- [ ] Les contrôles restent au MÊME EMPLACEMENT visuel (pas de déplacement)
- [ ] Largeur et hauteur de la zone de contrôles cohérente
- [ ] Pas de défilement horizontal
- [ ] Scrollbar vertical si nécessaire (même comportement actuel)

**F. État de la configuration**
- [ ] Les valeurs de configuration restent en mémoire (state.js)
- [ ] Changer de vue NE réinitialise PAS les valeurs des contrôles
- [ ] Les contrôles gardent leur état même quand masqués
- [ ] Revenir sur une vue réaffiche les contrôles avec leurs valeurs actuelles

**G. Responsive**
- [ ] Comportement identique sur desktop, tablette, mobile
- [ ] Affichage conditionnel fonctionne sur tous les écrans
- [ ] Sélecteur de vue toujours accessible

**H. Tests et validation**
- [ ] Tester sur desktop (1920x1080, 1366x768)
- [ ] Tester sur tablette (iPad, 768px)
- [ ] Tester sur mobile (iPhone, 375px)
- [ ] Vérifier que TOUS les contrôles extérieur sont masqués en vue Intérieur
- [ ] Vérifier que TOUS les contrôles intérieur sont masqués en vue Extérieur
- [ ] Vérifier que le changement de vue déclenche le rendu API
- [ ] Vérifier que les valeurs de config sont préservées
- [ ] Console sans erreurs
- [ ] Pas de problème de layout ou scrolling

**Notes techniques :**

**Fichiers à modifier :**
1. **index.html** : Regrouper les contrôles dans 2 sections distinctes
   ```html
   <div id="view-selector">
     <button id="btn-view-exterior" class="view-btn active">Vue Extérieur</button>
     <button id="btn-view-interior" class="view-btn">Vue Intérieur</button>
   </div>

   <div id="controls-exterior" class="controls-section">
     <!-- Tous les contrôles extérieur -->
   </div>

   <div id="controls-interior" class="controls-section" style="display: none;">
     <!-- Tous les contrôles intérieur (Prestige + 10 dropdowns + Tablette + SunGlass) -->
   </div>
   ```

2. **main.css** : Styling pour les sections et transitions
   ```css
   .controls-section {
     display: block; /* ou none selon vue active */
   }
   .controls-section.hidden {
     display: none;
   }
   .view-btn.active {
     background: var(--color-primary);
     color: white;
   }
   ```

3. **app.js** : Event listeners sur le sélecteur de vue
   ```javascript
   document.getElementById('btn-view-exterior').addEventListener('click', () => {
     // Masquer controls-interior
     document.getElementById('controls-interior').style.display = 'none';
     // Afficher controls-exterior
     document.getElementById('controls-exterior').style.display = 'block';
     // Mettre à jour state.viewType = 'exterior'
     // Déclencher renderWithViewType('exterior')
   });

   document.getElementById('btn-view-interior').addEventListener('click', () => {
     // Masquer controls-exterior
     document.getElementById('controls-exterior').style.display = 'none';
     // Afficher controls-interior
     document.getElementById('controls-interior').style.display = 'block';
     // Mettre à jour state.viewType = 'interior'
     // Déclencher renderWithViewType('interior')
   });
   ```

4. **state.js** : Aucune modification nécessaire (viewType existe déjà)

**Complexité :**
- Regrouper les contrôles dans 2 sections HTML distinctes
- Ajouter event listeners sur sélecteur de vue
- Logique show/hide simple (style.display)
- Déclencher rendu API lors du changement de vue
- Tests de validation

**Estimation** : 3 Story Points (~1-2h de développement)

---

### [US-029] Remplacer carousel par mosaïque d'images cliquables

**Priorité** : Haute
**Story Points** : 5 SP
**Sprint** : Sprint #7 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux voir une mosaïque/grille d'images cliquables au lieu d'un carousel,
Afin de visualiser toutes les vues en un coup d'œil et cliquer sur celle que je souhaite agrandir en plein écran.

**Contexte actuel :**
- Carousel avec navigation ← → et indicateur 1/5
- Une seule image visible à la fois
- Souhaité : Mosaïque/grille d'images avec clic → plein écran

**Critères d'acceptation :**

**A. Mosaïque d'images - Vue EXTÉRIEUR**
- [ ] Affichage de **5 images** en mosaïque/grille
- [ ] Layout recommandé : Grille 3 colonnes (3 en haut, 2 en bas centrées)
- [ ] Alternative : Grille 2+3 ou autre layout équilibré
- [ ] Toutes les images visibles simultanément
- [ ] Images responsive avec aspect ratio préservé (object-fit: cover ou contain)

**B. Mosaïque d'images - Vue INTÉRIEUR**
- [ ] Affichage de **6 images** en mosaïque/grille
- [ ] Layout recommandé : Grille 3 colonnes (3 en haut, 3 en bas) OU 2 colonnes (2x3)
- [ ] Toutes les images visibles simultanément
- [ ] Images responsive avec aspect ratio préservé

**C. Interactions sur les miniatures**
- [ ] Hover effect sur chaque image (zoom léger, border highlight, ou ombre)
- [ ] Cursor pointer sur hover
- [ ] Clic sur n'importe quelle image → Ouvre en **plein écran** (modal fullscreen)
- [ ] Pas de sélection par défaut (pas d'image "active" avant clic)

**D. Modal plein écran (Réutiliser US-020)**
- [ ] **Réutiliser le code existant** du modal fullscreen (US-020)
- [ ] Affiche l'image cliquée en plein écran
- [ ] Navigation ←/→ en plein écran pour changer d'image
- [ ] Compteur "X / Y" affiché (ex: "3 / 5" ou "2 / 6")
- [ ] Touche `ESC` pour fermer
- [ ] Clic sur backdrop pour fermer
- [ ] Bouton "Fermer" (X) visible en overlay
- [ ] Smooth transitions (fade in/out)

**E. Fonctionnalités à supprimer**
- [ ] **Supprimer** les boutons ← → du carousel (navigation carousel)
- [ ] **Supprimer** l'indicateur 1/5 sous le carousel
- [ ] **Supprimer** la logique de navigation carousel (currentIndex, slideLeft/Right)
- [ ] Garder uniquement la mosaïque + modal fullscreen

**F. Viewport et layout**
- [ ] Le viewport reste au même endroit (même zone d'affichage)
- [ ] Dimensions du viewport adaptées pour contenir la mosaïque
- [ ] Pas de changement de position ou taille globale de l'interface

**G. Responsive**
- [ ] Sur desktop : Mosaïque complète (5 ou 6 images)
- [ ] Sur tablette (< 1024px) : Adapter layout (2 colonnes par exemple)
- [ ] Sur mobile (< 768px) : 1 colonne OU 2 colonnes réduites
- [ ] Images toujours cliquables et accessibles
- [ ] Modal fullscreen fonctionne sur tous les écrans

**H. Styling et Design**
- [ ] Espacement cohérent entre images (gap: 1rem ou 0.5rem)
- [ ] Border-radius ou styling moderne pour les miniatures
- [ ] Hover effect smooth (transition: transform 0.2s, box-shadow 0.2s)
- [ ] Mosaïque visuellement équilibrée (pas d'images trop déformées)
- [ ] Loader affiché pendant chargement API (avant affichage mosaïque)

**I. Comportement fonctionnel**
- [ ] Changement de configuration → Recharge les images dans la mosaïque
- [ ] Changement de vue (Ext/Int) → Met à jour le nombre d'images (5 → 6 ou inverse)
- [ ] Pas d'erreurs si moins d'images disponibles (gérer cas < 5 ou < 6 images)
- [ ] Navigation fullscreen : Flèches clavier ←/→ fonctionnent
- [ ] Navigation fullscreen : Boutons ←/→ visibles et fonctionnels

**J. Tests et validation**
- [ ] Tester sur desktop (1920x1080, 1366x768)
- [ ] Tester sur tablette (iPad, 768px)
- [ ] Tester sur mobile (iPhone, 375px)
- [ ] Vérifier hover effects sur chaque image
- [ ] Vérifier clic sur chaque image → ouvre fullscreen
- [ ] Vérifier navigation ←/→ en fullscreen
- [ ] Vérifier compteur "X / Y" en fullscreen
- [ ] Vérifier fermeture ESC et backdrop
- [ ] Console sans erreurs
- [ ] Tester avec 5 images (Ext) et 6 images (Int)
- [ ] Tester avec < 5 images (gestion d'erreur)

**Notes techniques :**

**Fichiers à modifier :**
1. **index.html** : Remplacer le carousel par une grille d'images
   ```html
   <div id="viewport-mosaic" class="mosaic-grid">
     <!-- Images générées dynamiquement -->
   </div>
   ```
2. **main.css** : Ajouter styling mosaïque + hover effects
   ```css
   .mosaic-grid {
     display: grid;
     grid-template-columns: repeat(3, 1fr); /* 3 colonnes */
     gap: 1rem;
   }
   .mosaic-grid img {
     width: 100%;
     height: auto;
     object-fit: cover;
     cursor: pointer;
     transition: transform 0.2s, box-shadow 0.2s;
   }
   .mosaic-grid img:hover {
     transform: scale(1.05);
     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
   }
   ```
3. **ui.js** : Modifier `renderCarousel()` → `renderMosaic()`
   - Générer dynamiquement les `<img>` dans la grille
   - Ajouter event listeners `click` sur chaque image → ouvrir modal fullscreen
   - Passer l'index de l'image cliquée au modal

4. **app.js** : Vérifier que le modal fullscreen (US-020) est bien intégré
   - Fonction `openFullscreen(imageIndex)` qui ouvre le modal avec l'image sélectionnée
   - Navigation ←/→ en fullscreen
   - Fermeture ESC et backdrop

**Layout mosaïque - Recommandations :**
- **5 images** : `grid-template-columns: repeat(3, 1fr);` + centrer la 2e ligne avec CSS Grid
  ```css
  .mosaic-grid.exterior {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  .mosaic-grid.exterior img:nth-child(4),
  .mosaic-grid.exterior img:nth-child(5) {
    grid-column: span 1; /* Centrer les 2 dernières */
  }
  ```
- **6 images** : `grid-template-columns: repeat(3, 1fr);` (2 lignes complètes)

**Réutilisation modal fullscreen (US-020) :**
```javascript
// ui.js
function renderMosaic(images) {
  const mosaicContainer = document.getElementById('viewport-mosaic');
  mosaicContainer.innerHTML = '';
  images.forEach((url, index) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Vue ${index + 1}`;
    img.addEventListener('click', () => openFullscreen(index));
    mosaicContainer.appendChild(img);
  });
}

// Modal fullscreen (réutiliser code US-020)
function openFullscreen(startIndex) {
  currentFullscreenIndex = startIndex;
  showFullscreenImage(currentFullscreenIndex);
  // ... navigation ←/→, ESC, backdrop
}
```

**Complexité :**
- Suppression carousel (simplification code)
- Ajout mosaïque grid layout (CSS + DOM)
- Event listeners sur chaque image (clic)
- Intégration avec modal fullscreen existant (réutilisation)
- Gestion 5 images (Ext) vs 6 images (Int)
- Responsive design

**Estimation** : 5 Story Points (~2-3h de développement)

---

### [US-030] Optimisation affichage 1920x1080 sans scroll vertical

**Priorité** : Haute
**Story Points** : 3 SP
**Sprint** : Sprint #7 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur sur un écran 1920x1080,
Je veux que toute l'interface soit visible sans avoir à scroller verticalement,
Afin de voir l'ensemble des contrôles et du viewport en un seul coup d'œil.

**Contexte actuel :**
- L'interface nécessite du scroll vertical sur un écran 1920x1080
- L'utilisateur doit scroller pour accéder à certains contrôles ou voir le viewport complet
- Souhaité : Interface complètement optimisée pour 1920x1080 (FullHD) sans aucun scroll

**Critères d'acceptation :**

**A. Optimisation viewport et layout**
- [ ] Toute l'interface (viewport + contrôles) visible sans scroll sur 1920x1080
- [ ] Hauteur maximale du viewport adaptée pour tenir dans ~1000-1020px (compte tenu header/padding)
- [ ] Largeur maximale du viewport adaptée pour ne pas empiéter sur les contrôles
- [ ] Utilisation optimale de l'espace horizontal (viewport + panneau contrôles côte à côte)

**B. Réduction de la hauteur des contrôles**
- [ ] Réduire padding/margin des contrôles sans nuire à l'UX
- [ ] Réduire hauteur des dropdowns et inputs (compact mode)
- [ ] Réduire espacement entre groupes de contrôles
- [ ] Réduire taille des labels (font-size plus petit mais lisible)
- [ ] Optimiser sections "Sièges" et "Matériaux" pour réduire hauteur totale

**C. Optimisation mosaïque d'images (US-029)**
- [ ] Adapter taille des images de la mosaïque pour tenir dans le viewport optimisé
- [ ] Vue Extérieur : 5 images en grille compacte (taille réduite)
- [ ] Vue Intérieur : 6 images en grille compacte (taille réduite)
- [ ] Images responsive mais avec max-height pour éviter débordement
- [ ] Préserver aspect ratio mais limiter hauteur totale de la mosaïque

**D. Layout général**
- [ ] Layout flexible : viewport à gauche/centre, contrôles à droite (ou layout optimal)
- [ ] Utiliser toute la largeur 1920px disponible
- [ ] Hauteur totale interface ≤ 1080px (moins barre de titre navigateur ~60-80px)
- [ ] Hauteur effective cible : ~1000-1020px
- [ ] Pas de margin/padding excessif autour du viewport

**E. Responsive breakpoints**
- [ ] 1920x1080 : Interface complète sans scroll (priorité maximale)
- [ ] 1680x1050 : Dégradation gracieuse acceptable
- [ ] 1366x768 : Peut avoir scroll vertical (acceptable)
- [ ] Tablette/Mobile : Comportement responsive existant conservé

**F. Tests de validation**
- [ ] Tester sur écran 1920x1080 (FullHD) :
  - [ ] Vue Extérieur : Pas de scroll vertical
  - [ ] Vue Intérieur : Pas de scroll vertical
  - [ ] Avec tous les contrôles affichés
  - [ ] Avec mosaïque 5 images (Ext) et 6 images (Int)
- [ ] Vérifier que le viewport et les images restent visibles et utilisables
- [ ] Vérifier que les contrôles restent accessibles et lisibles
- [ ] Console sans erreurs
- [ ] UX fluide : pas de sensation de compression excessive

**G. Ajustements CSS spécifiques**
Modifications recommandées :
- [ ] `body, html` : `height: 100vh; overflow: hidden;` (désactiver scroll page)
- [ ] Conteneur principal : `max-height: 100vh; overflow: hidden;`
- [ ] Panneau contrôles : Réduire padding, margin, line-height
- [ ] Viewport : `max-height: calc(100vh - 100px);` (ajuster selon header)
- [ ] Mosaïque : `max-height: 70vh;` ou valeur optimale
- [ ] Contrôles : `font-size: 0.875rem;` (14px) au lieu de 1rem (16px)
- [ ] Dropdowns : `padding: 0.25rem 0.5rem;` au lieu de 0.5rem 1rem
- [ ] Sections : `margin-bottom: 0.5rem;` au lieu de 1rem

**H. Alternatives si nécessaire**
- [ ] Option A : Layout 2 colonnes (viewport gauche + contrôles droite avec scroll interne)
- [ ] Option B : Layout viewport centré + contrôles en 2 colonnes compactes
- [ ] Option C : Réduire nombre de contrôles visibles simultanément (accordéon/collapse)
- [ ] Prioriser Option A ou B avant d'envisager Option C

**Notes techniques :**

**Fichiers à modifier :**
1. **main.css** : Ajustements globaux de layout et spacing
   - Réduire padding/margin généraux
   - Optimiser hauteur viewport et mosaïque
   - Ajuster font-size et line-height
   - Media query spécifique pour 1920x1080

2. **index.html** : Structure layout (si nécessaire)
   - Revoir structure conteneurs pour optimiser espace
   - Possiblement layout 2 colonnes explicite

3. **ui.js** : Ajustements taille mosaïque (si nécessaire)
   - Adapter dimensions images selon espace disponible

**Calcul de l'espace disponible (1920x1080) :**
- Hauteur totale : 1080px
- Barre de titre navigateur : ~60-80px
- Header/titre application : ~40-60px
- Padding/margin global : ~20-40px
- **Hauteur disponible pour contenu** : ~880-960px

**Répartition suggérée :**
- Viewport + mosaïque : ~700-800px (80%)
- Contrôles : ~100-160px (20%) OU scroll interne si nécessaire

**Complexité :**
- Ajustements CSS multiples (spacing, sizing)
- Tests sur résolution spécifique
- Équilibre entre compacité et UX
- Adaptation mosaïque (US-029)

**Estimation** : 3 Story Points (~1-2h de développement + tests)

---

## User Stories - Sprint #8 (Téléchargement d'images)

### [US-031] Téléchargement individuel d'images

**Priorité** : Haute
**Story Points** : 2 SP
**Sprint** : Sprint #8 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux pouvoir télécharger une image individuelle depuis la mosaïque,
Afin de sauvegarder rapidement une vue spécifique sans télécharger toutes les images.

**Contexte :**
- La mosaïque d'images (US-029) affiche 5 images en vue Extérieur et 6 images en vue Intérieur
- Actuellement, aucune option de téléchargement n'est disponible
- Besoin d'un moyen rapide de télécharger une image individuelle

**Critères d'acceptation :**

**A. Icône de téléchargement sur les vignettes**
- [ ] Icône download visible sur chaque vignette de la mosaïque
- [ ] Position de l'icône : coin supérieur droit de chaque image (overlay)
- [ ] Icône stylisée : symbole download standard (flèche vers le bas + barre)
- [ ] Icône visible en permanence OU au hover de l'image
- [ ] Icône cliquable avec cursor pointer
- [ ] Taille icône : ~24-32px (visible mais discrète)

**B. Comportement au clic sur l'icône**
- [ ] Clic sur icône → Télécharge immédiatement l'image correspondante
- [ ] Ne déclenche PAS l'ouverture en modal fullscreen (seul le clic sur l'image ouvre le modal)
- [ ] Téléchargement direct sans popup de confirmation
- [ ] Feedback visuel : icône change brièvement de couleur/taille au clic

**C. Nommage des fichiers téléchargés**
- [ ] Format : `vue_exterieur_N.png` ou `vue_interieur_N.png`
- [ ] N = numéro de la vue (1, 2, 3, 4, 5 pour extérieur ; 1-6 pour intérieur)
- [ ] Extension : `.png` (ou `.jpg` selon format de l'API)
- [ ] Exemples :
  - Vue Extérieur image 1 : `vue_exterieur_1.png`
  - Vue Intérieur image 3 : `vue_interieur_3.png`

**D. Gestion des événements**
- [ ] Event listener `click` sur l'icône download (pas sur l'image elle-même)
- [ ] Event listener séparé du clic sur l'image (qui ouvre le modal)
- [ ] Utiliser `event.stopPropagation()` pour éviter conflit avec modal

**E. Téléchargement technique**
- [ ] Utiliser `fetch()` pour récupérer l'image depuis l'URL
- [ ] Convertir en Blob
- [ ] Créer lien `<a download="vue_exterieur_1.png">` dynamique
- [ ] Trigger `.click()` programmatique
- [ ] Nettoyer URL.createObjectURL après téléchargement

**F. UX et design**
- [ ] Icône avec fond semi-transparent (ex: `background: rgba(0,0,0,0.6)`)
- [ ] Icône blanche ou couleur contrastante visible sur toutes les images
- [ ] Hover effect sur l'icône : changement de couleur, scale(1.1)
- [ ] Transition smooth (0.2s)
- [ ] Icône ne gêne pas la visualisation de l'image

**G. Responsive**
- [ ] Icône visible et fonctionnelle sur desktop (1920x1080, 1366x768)
- [ ] Icône adaptée sur tablette (taille légèrement réduite acceptable)
- [ ] Sur mobile : Icône toujours visible (pas seulement au hover)

**H. Tests et validation**
- [ ] Tester téléchargement de chaque image (5 en Ext, 6 en Int)
- [ ] Vérifier nommage correct : `vue_exterieur_1.png` à `vue_exterieur_5.png`
- [ ] Vérifier nommage correct : `vue_interieur_1.png` à `vue_interieur_6.png`
- [ ] Vérifier que clic icône ne déclenche PAS modal fullscreen
- [ ] Vérifier que clic image déclenche TOUJOURS modal fullscreen
- [ ] Console sans erreurs
- [ ] Tester sur Chrome, Firefox, Edge
- [ ] Vérifier que l'image téléchargée est identique à celle affichée

**Notes techniques :**

**Fichiers à modifier :**
1. **index.html** : Ajouter icône download dans chaque vignette (ou générer dynamiquement)
2. **ui.js** : Modifier `renderMosaic()` pour ajouter icône download
   ```javascript
   function renderMosaic(images) {
     const mosaicContainer = document.getElementById('viewport-mosaic');
     mosaicContainer.innerHTML = '';
     images.forEach((url, index) => {
       const wrapper = document.createElement('div');
       wrapper.className = 'mosaic-item';

       const img = document.createElement('img');
       img.src = url;
       img.alt = `Vue ${index + 1}`;
       img.addEventListener('click', () => openFullscreen(index));

       const downloadIcon = document.createElement('button');
       downloadIcon.className = 'download-icon';
       downloadIcon.innerHTML = '<i class="icon-download"></i>'; // Ou SVG
       downloadIcon.addEventListener('click', (e) => {
         e.stopPropagation(); // Empêcher ouverture modal
         downloadImage(url, index);
       });

       wrapper.appendChild(img);
       wrapper.appendChild(downloadIcon);
       mosaicContainer.appendChild(wrapper);
     });
   }
   ```

3. **ui.js** : Créer fonction `downloadImage(url, index)`
   ```javascript
   async function downloadImage(url, index) {
     const viewType = state.getViewType(); // 'exterior' ou 'interior'
     const filename = `vue_${viewType === 'exterior' ? 'exterieur' : 'interieur'}_${index + 1}.png`;

     try {
       const response = await fetch(url);
       const blob = await response.blob();
       const blobUrl = URL.createObjectURL(blob);

       const link = document.createElement('a');
       link.href = blobUrl;
       link.download = filename;
       link.click();

       URL.revokeObjectURL(blobUrl);
     } catch (error) {
       console.error('Erreur téléchargement image:', error);
       // Optionnel : Afficher message d'erreur à l'utilisateur
     }
   }
   ```

4. **main.css** : Styling de l'icône download
   ```css
   .mosaic-item {
     position: relative;
     display: inline-block;
   }

   .download-icon {
     position: absolute;
     top: 8px;
     right: 8px;
     width: 32px;
     height: 32px;
     background: rgba(0, 0, 0, 0.6);
     border: none;
     border-radius: var(--radius-md);
     color: white;
     cursor: pointer;
     display: flex;
     align-items: center;
     justify-content: center;
     transition: transform 0.2s, background 0.2s;
     z-index: 10;
   }

   .download-icon:hover {
     background: rgba(0, 0, 0, 0.8);
     transform: scale(1.1);
   }

   .download-icon:active {
     transform: scale(0.95);
   }

   /* Icône visible au hover de l'image (optionnel) */
   .mosaic-item .download-icon {
     opacity: 0;
     transition: opacity 0.2s;
   }

   .mosaic-item:hover .download-icon {
     opacity: 1;
   }
   ```

**Icône SVG recommandée :**
```html
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  <polyline points="7 10 12 15 17 10"></polyline>
  <line x1="12" y1="15" x2="12" y2="3"></line>
</svg>
```

**Complexité :**
- Ajouter icône download sur chaque vignette (DOM + CSS)
- Event listener avec `stopPropagation()`
- Fonction de téléchargement (fetch + Blob + download)
- Nommage dynamique selon viewType et index
- Styling et UX

**Estimation** : 2 Story Points (~1h de développement)

---

### [US-032] Téléchargement par lot avec sélection

**Priorité** : Haute
**Story Points** : 5 SP
**Sprint** : Sprint #8 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux pouvoir sélectionner plusieurs images et les télécharger en une seule action,
Afin de gagner du temps lorsque je souhaite télécharger plusieurs vues spécifiques.

**Contexte :**
- US-031 permet le téléchargement individuel (une par une)
- Besoin d'un mode sélection pour télécharger plusieurs images simultanément
- L'utilisateur veut pouvoir choisir quelles images télécharger (pas toutes obligatoirement)

**Critères d'acceptation :**

**A. Bouton d'activation du mode sélection**
- [ ] Bouton "Télécharger plusieurs images" visible au-dessus ou en-dessous de la mosaïque
- [ ] Clic sur le bouton → Active le mode sélection
- [ ] En mode sélection :
  - [ ] Des checkboxes apparaissent sur chaque vignette
  - [ ] Le bouton change de texte : "Annuler sélection" ou "Quitter mode sélection"
  - [ ] Un nouveau bouton "Télécharger la sélection (X)" apparaît (X = nombre d'images cochées)
- [ ] Clic sur "Annuler sélection" → Désactive le mode sélection, masque les checkboxes

**B. Checkboxes sur les vignettes**
- [ ] Checkbox visible sur chaque image de la mosaïque (en mode sélection uniquement)
- [ ] Position : coin supérieur gauche de chaque image (opposé à l'icône download)
- [ ] Checkbox stylisée : carré blanc avec border, coche bleue/verte quand sélectionnée
- [ ] Taille : ~24-32px (cliquable facilement)
- [ ] Clic sur checkbox → Toggle sélection (coché/décoché)
- [ ] État initial : Toutes décochées

**C. Sélection d'images**
- [ ] Clic sur checkbox → Sélectionne/désélectionne l'image correspondante
- [ ] Compteur mis à jour en temps réel : "Télécharger la sélection (3)" si 3 images cochées
- [ ] Possibilité de cocher/décocher n'importe quelle image indépendamment
- [ ] Feedback visuel : Image sélectionnée avec bordure colorée OU overlay semi-transparent
- [ ] Minimum 1 image doit être sélectionnée pour activer le bouton de téléchargement

**D. Bouton "Tout sélectionner / Tout désélectionner" (optionnel mais recommandé)**
- [ ] Bouton "Tout sélectionner" visible en mode sélection
- [ ] Clic → Coche toutes les checkboxes
- [ ] Bouton change en "Tout désélectionner" quand toutes cochées
- [ ] Clic "Tout désélectionner" → Décoche toutes les checkboxes

**E. Téléchargement de la sélection**
- [ ] Bouton "Télécharger la sélection (X)" actif uniquement si au moins 1 image sélectionnée
- [ ] Clic sur le bouton → Télécharge toutes les images sélectionnées **séquentiellement** (une par une)
- [ ] Pas de fichier ZIP : Téléchargements individuels successifs
- [ ] Délai entre chaque téléchargement : ~200-500ms (éviter surcharge navigateur)
- [ ] Progression affichée : "Téléchargement 2/5..." ou barre de progression

**F. Nommage des fichiers téléchargés**
- [ ] Même format que US-031 : `vue_exterieur_N.png` ou `vue_interieur_N.png`
- [ ] N = numéro de la vue originale (pas de renumérotation)
- [ ] Exemples : Si l'utilisateur sélectionne vues 1, 3, 5 en extérieur :
  - `vue_exterieur_1.png`
  - `vue_exterieur_3.png`
  - `vue_exterieur_5.png`

**G. Feedback UX pendant téléchargement**
- [ ] Message "Téléchargement en cours..." affiché
- [ ] Barre de progression OU compteur "2/5 téléchargées"
- [ ] Désactiver bouton "Télécharger la sélection" pendant le téléchargement
- [ ] Message de succès : "5 images téléchargées avec succès !"
- [ ] Gestion d'erreur : Si une image échoue, continuer avec les suivantes + afficher erreur

**H. Sortie du mode sélection**
- [ ] Après téléchargement, rester en mode sélection (ne pas quitter automatiquement)
- [ ] L'utilisateur peut modifier sa sélection et retélécharger
- [ ] Clic sur "Annuler sélection" → Quitte le mode, masque checkboxes

**I. Comportement en mode sélection**
- [ ] En mode sélection, clic sur l'image elle-même ne déclenche PAS le modal fullscreen
- [ ] En mode sélection, clic sur l'image → Toggle checkbox (alternative UX)
- [ ] OU : Clic image ouvre toujours modal, seul clic checkbox sélectionne
- [ ] Choix recommandé : Clic image toggle checkbox en mode sélection

**J. Icône download individuelle (US-031) en mode sélection**
- [ ] Masquer l'icône download individuelle quand mode sélection est actif
- [ ] OU : Garder icône visible mais désactivée (opacité réduite, non cliquable)
- [ ] Choix recommandé : Masquer pour éviter confusion

**K. Responsive**
- [ ] Checkboxes visibles et cliquables sur desktop, tablette, mobile
- [ ] Boutons "Télécharger plusieurs images" et "Télécharger la sélection" adaptés aux petits écrans
- [ ] Sur mobile : Boutons en pleine largeur si nécessaire

**L. Tests et validation**
- [ ] Activer mode sélection → Vérifier apparition des checkboxes
- [ ] Sélectionner 3 images → Vérifier compteur "Télécharger la sélection (3)"
- [ ] Télécharger la sélection → Vérifier que les 3 images se téléchargent séquentiellement
- [ ] Vérifier nommage correct des fichiers téléchargés
- [ ] Tester "Tout sélectionner" → Vérifier toutes cochées
- [ ] Tester "Tout désélectionner" → Vérifier toutes décochées
- [ ] Tester annulation mode sélection → Vérifier checkboxes disparaissent
- [ ] Tester avec 5 images (Ext) et 6 images (Int)
- [ ] Vérifier gestion d'erreur si téléchargement échoue
- [ ] Console sans erreurs
- [ ] Tester sur Chrome, Firefox, Edge

**Notes techniques :**

**Fichiers à modifier :**

1. **index.html** : Ajouter boutons de contrôle du mode sélection
   ```html
   <div id="mosaic-controls">
     <button id="btn-toggle-selection-mode" class="btn-secondary">
       Télécharger plusieurs images
     </button>
     <button id="btn-select-all" class="btn-secondary" style="display: none;">
       Tout sélectionner
     </button>
     <button id="btn-download-selection" class="btn-primary" style="display: none;" disabled>
       Télécharger la sélection (0)
     </button>
   </div>
   <div id="download-progress" class="hidden">
     <p>Téléchargement en cours... <span id="progress-counter">0/0</span></p>
   </div>
   ```

2. **ui.js** : Ajouter mode sélection dans `renderMosaic()`
   ```javascript
   let selectionMode = false;
   let selectedImages = new Set();

   function renderMosaic(images) {
     const mosaicContainer = document.getElementById('viewport-mosaic');
     mosaicContainer.innerHTML = '';
     images.forEach((url, index) => {
       const wrapper = document.createElement('div');
       wrapper.className = 'mosaic-item';

       const img = document.createElement('img');
       img.src = url;
       img.alt = `Vue ${index + 1}`;
       img.addEventListener('click', () => {
         if (selectionMode) {
           toggleSelection(index); // Toggle checkbox en mode sélection
         } else {
           openFullscreen(index); // Ouvrir modal en mode normal
         }
       });

       // Checkbox (visible uniquement en mode sélection)
       const checkbox = document.createElement('input');
       checkbox.type = 'checkbox';
       checkbox.className = 'selection-checkbox hidden';
       checkbox.id = `checkbox-${index}`;
       checkbox.addEventListener('change', () => toggleSelection(index));

       // Icône download (masquée en mode sélection)
       const downloadIcon = document.createElement('button');
       downloadIcon.className = 'download-icon';
       downloadIcon.innerHTML = '<svg>...</svg>';
       downloadIcon.addEventListener('click', (e) => {
         e.stopPropagation();
         downloadImage(url, index);
       });

       wrapper.appendChild(img);
       wrapper.appendChild(checkbox);
       wrapper.appendChild(downloadIcon);
       mosaicContainer.appendChild(wrapper);
     });
   }

   function toggleSelection(index) {
     const checkbox = document.getElementById(`checkbox-${index}`);
     if (selectedImages.has(index)) {
       selectedImages.delete(index);
       checkbox.checked = false;
     } else {
       selectedImages.add(index);
       checkbox.checked = true;
     }
     updateSelectionUI();
   }

   function updateSelectionUI() {
     const count = selectedImages.size;
     const btnDownload = document.getElementById('btn-download-selection');
     btnDownload.textContent = `Télécharger la sélection (${count})`;
     btnDownload.disabled = count === 0;
   }
   ```

3. **ui.js** : Créer fonction `downloadSelectedImages()`
   ```javascript
   async function downloadSelectedImages() {
     const images = Array.from(document.querySelectorAll('.mosaic-item img'));
     const selectedIndexes = Array.from(selectedImages);
     const total = selectedIndexes.length;

     const progressCounter = document.getElementById('progress-counter');
     const progressContainer = document.getElementById('download-progress');
     progressContainer.classList.remove('hidden');

     for (let i = 0; i < selectedIndexes.length; i++) {
       const index = selectedIndexes[i];
       const url = images[index].src;

       progressCounter.textContent = `${i + 1}/${total}`;

       try {
         await downloadImage(url, index);
         await new Promise(resolve => setTimeout(resolve, 300)); // Délai 300ms
       } catch (error) {
         console.error(`Erreur téléchargement image ${index + 1}:`, error);
       }
     }

     progressContainer.classList.add('hidden');
     alert(`${total} image(s) téléchargée(s) avec succès !`);
   }
   ```

4. **app.js** : Event listeners pour les boutons
   ```javascript
   document.getElementById('btn-toggle-selection-mode').addEventListener('click', () => {
     selectionMode = !selectionMode;

     const checkboxes = document.querySelectorAll('.selection-checkbox');
     const downloadIcons = document.querySelectorAll('.download-icon');
     const btnToggle = document.getElementById('btn-toggle-selection-mode');
     const btnSelectAll = document.getElementById('btn-select-all');
     const btnDownloadSelection = document.getElementById('btn-download-selection');

     if (selectionMode) {
       checkboxes.forEach(cb => cb.classList.remove('hidden'));
       downloadIcons.forEach(icon => icon.classList.add('hidden'));
       btnToggle.textContent = 'Annuler sélection';
       btnSelectAll.style.display = 'inline-block';
       btnDownloadSelection.style.display = 'inline-block';
     } else {
       checkboxes.forEach(cb => cb.classList.add('hidden'));
       downloadIcons.forEach(icon => icon.classList.remove('hidden'));
       btnToggle.textContent = 'Télécharger plusieurs images';
       btnSelectAll.style.display = 'none';
       btnDownloadSelection.style.display = 'none';
       selectedImages.clear();
     }
   });

   document.getElementById('btn-select-all').addEventListener('click', () => {
     const checkboxes = document.querySelectorAll('.selection-checkbox');
     const allSelected = selectedImages.size === checkboxes.length;

     if (allSelected) {
       selectedImages.clear();
       checkboxes.forEach(cb => cb.checked = false);
       document.getElementById('btn-select-all').textContent = 'Tout sélectionner';
     } else {
       checkboxes.forEach((cb, index) => {
         selectedImages.add(index);
         cb.checked = true;
       });
       document.getElementById('btn-select-all').textContent = 'Tout désélectionner';
     }
     updateSelectionUI();
   });

   document.getElementById('btn-download-selection').addEventListener('click', () => {
     downloadSelectedImages();
   });
   ```

5. **main.css** : Styling pour checkboxes et mode sélection
   ```css
   .selection-checkbox {
     position: absolute;
     top: 8px;
     left: 8px;
     width: 28px;
     height: 28px;
     cursor: pointer;
     z-index: 10;
     accent-color: var(--color-primary);
   }

   .selection-checkbox.hidden {
     display: none;
   }

   .mosaic-item.selected img {
     border: 3px solid var(--color-primary);
     box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
   }

   #download-progress {
     text-align: center;
     padding: var(--spacing-md);
     background: var(--color-primary-light);
     border-radius: var(--radius-md);
     margin-top: var(--spacing-md);
   }

   #download-progress.hidden {
     display: none;
   }

   #mosaic-controls {
     display: flex;
     gap: var(--spacing-sm);
     margin-bottom: var(--spacing-md);
     flex-wrap: wrap;
   }

   #btn-download-selection:disabled {
     opacity: 0.5;
     cursor: not-allowed;
   }
   ```

**Complexité :**
- Gestion du state selectionMode (toggle)
- Afficher/masquer checkboxes et icônes download
- Gestion Set() pour selectedImages
- Téléchargement séquentiel avec barre de progression
- Event listeners multiples (boutons + checkboxes)
- Feedback UX (compteur, progression, messages)
- Tests exhaustifs

**Estimation** : 5 Story Points (~2-3h de développement)

---

## User Stories - Sprint #9

### [US-033] Barre de recherche pour filtrer les zones de couleurs par tags

**Priorité** : Moyenne
**Story Points** : 5 SP
**Sprint** : Sprint #9
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux pouvoir taper du texte dans une barre de recherche pour filtrer les options des dropdowns de zones de couleurs (A, B, C, D, A+),
Afin de trouver rapidement une couleur par son nom ou ses tags (ex: "orange", "solid", "traffic") sans scroller dans une longue liste.

**Contexte métier :**
Dans le XML, chaque couleur contient des **tags de recherche** après le marqueur `A+` ou `NOA+`, séparés par des tirets.

**Exemple** :
```
TrafficRed-03020-#bc413c-#E00500-A+-03020-orange-traffic-red-solid-light
                                    └─────────────────┬───────────────────┘
                                                  Tags de recherche
```
Tags : `03020`, `orange`, `traffic`, `red`, `solid`, `light`

**Critères d'acceptation :**
- [ ] Barre de recherche ajoutée **uniquement** au-dessus des 5 dropdowns de zones de couleurs (Zone A, B, C, D, A+)
- [ ] Les autres dropdowns (PaintScheme, Prestige, Version, etc.) ne sont **PAS** concernés
- [ ] Extraction des tags depuis le XML : parser la partie après `A+` ou `NOA+`, split par tirets
- [ ] Filtrage en temps réel sur **label ET tags** : dès que l'utilisateur tape, les options sont filtrées
- [ ] Recherche insensible à la casse (case-insensitive)
- [ ] Si aucune couleur ne correspond, afficher message "Aucun résultat"
- [ ] Bouton "✕" pour effacer la recherche et réafficher toutes les options
- [ ] **Affichage** : Le dropdown affiche uniquement le label de couleur (ex: "TrafficRed"), **pas les tags**
- [ ] Performance : pas de lag lors de la saisie (même avec 100+ couleurs)
- [ ] Accessibilité : placeholder clair ("Rechercher une couleur...")

**Détails techniques :**

1. **Extraction des tags depuis le XML** (dans `app.js` lors de `initColorZones()`) :
   ```javascript
   async function initColorZones() {
       const xmlDoc = await getDatabaseXML();
       const paintScheme = getConfig().paintScheme;

       // Extraire les zones de couleurs depuis le bookmark du paint scheme
       const zones = getExteriorColorZones(xmlDoc, paintScheme);

       // Pour chaque zone (A, B, C, D, A+)
       zones.forEach((colorOptions, zoneName) => {
           const enrichedOptions = colorOptions.map(color => {
               // Format XML: "TrafficRed-03020-#bc413c-#E00500-A+-03020-orange-traffic-red-solid-light"
               const parts = color.split('-');
               const aIndexPlus = parts.indexOf('A+');
               const aIndexNOA = parts.indexOf('NOA+');
               const tagStartIndex = (aIndexPlus !== -1) ? aIndexPlus + 1 :
                                     (aIndexNOA !== -1) ? aIndexNOA + 1 : -1;

               let tags = [];
               if (tagStartIndex !== -1 && tagStartIndex < parts.length) {
                   tags = parts.slice(tagStartIndex); // Tous les éléments après A+ ou NOA+
               }

               return {
                   label: parts[0], // Premier élément = nom couleur (ex: "TrafficRed")
                   value: color,    // Valeur complète pour l'API
                   tags: tags       // Tags de recherche
               };
           });

           // Peupler le dropdown avec options enrichies
           populateColorDropdownWithSearch(`selectZone${zoneName}`, enrichedOptions);
       });
   }
   ```

2. **HTML** : Ajouter inputs de recherche au-dessus des 5 dropdowns zones
   ```html
   <!-- Zone A -->
   <div class="form-group">
       <label for="selectZoneA">Zone A</label>
       <div class="search-wrapper">
           <input type="text" id="searchZoneA" class="form-control search-input"
                  placeholder="Rechercher une couleur...">
           <button type="button" class="btn-clear-search hidden" id="btnClearZoneA">✕</button>
       </div>
       <select id="selectZoneA" name="zoneA" class="form-control"></select>
   </div>
   <!-- Répéter pour zones B, C, D, A+ -->
   ```

3. **JavaScript** : Fonction de filtrage avec tags
   ```javascript
   function populateColorDropdownWithSearch(selectId, optionsWithTags) {
       const select = document.getElementById(selectId);
       const searchId = selectId.replace('select', 'search');
       const searchInput = document.getElementById(searchId);
       const btnClear = document.getElementById(`btnClear${selectId.replace('select', '')}`);

       // Stocker les options avec tags
       let allOptions = optionsWithTags;

       // Peupler initialement
       refreshDropdown(select, allOptions);

       // Event listener recherche
       searchInput.addEventListener('input', (e) => {
           const searchTerm = e.target.value.toLowerCase().trim();
           btnClear.classList.toggle('hidden', !searchTerm);

           if (!searchTerm) {
               refreshDropdown(select, allOptions);
               return;
           }

           // Filtrer sur label ET tags
           const filtered = allOptions.filter(opt => {
               const labelMatch = opt.label.toLowerCase().includes(searchTerm);
               const tagMatch = opt.tags.some(tag => tag.toLowerCase().includes(searchTerm));
               return labelMatch || tagMatch;
           });

           if (filtered.length === 0) {
               select.innerHTML = '<option disabled>Aucun résultat</option>';
           } else {
               refreshDropdown(select, filtered);
           }
       });

       // Event listener clear
       btnClear.addEventListener('click', () => {
           searchInput.value = '';
           btnClear.classList.add('hidden');
           refreshDropdown(select, allOptions);
       });
   }

   function refreshDropdown(select, options) {
       select.innerHTML = '';
       options.forEach(opt => {
           const optionEl = document.createElement('option');
           optionEl.value = opt.value;
           optionEl.textContent = opt.label; // Afficher SEULEMENT le label, PAS les tags
           select.appendChild(optionEl);
       });
   }
   ```

4. **CSS** : Styling (identique)

**Complexité :**
- Parsing XML pour extraire tags (logique nouvelle)
- Structure de données enrichie (label + value + tags[])
- Fonction de filtrage sur label ET tags (plus complexe)
- 5 inputs de recherche à ajouter (Zone A, B, C, D, A+)
- Event listeners multiples
- Performance : filtrage rapide sur 100+ couleurs

**Estimation** : 5 Story Points (~2-3h de développement)

---

### [US-034] Immatriculation par défaut dynamique selon le modèle d'avion

**Priorité** : Moyenne
**Story Points** : 1 SP
**Sprint** : Sprint #9
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux que l'immatriculation par défaut change automatiquement selon le modèle d'avion sélectionné,
Afin d'avoir une cohérence entre le modèle et l'immatriculation affichée.

**Critères d'acceptation :**
- [ ] Au chargement initial : Si le modèle par défaut est "960", l'immatriculation est "N960TB"
- [ ] Au chargement initial : Si le modèle par défaut est "980", l'immatriculation est "N980TB"
- [ ] Quand l'utilisateur change le dropdown "Modèle" de 960 → 980, l'immatriculation devient automatiquement "N980TB"
- [ ] Quand l'utilisateur change le dropdown "Modèle" de 980 → 960, l'immatriculation devient automatiquement "N960TB"
- [ ] Si l'utilisateur a manuellement modifié l'immatriculation (autre que N960TB ou N980TB), le changement de modèle ne l'écrase PAS (garder la valeur personnalisée)
- [ ] Le state est mis à jour (`updateConfig('immat', 'N960TB')` ou `'N980TB'`)
- [ ] L'input visuel `#inputImmat` est mis à jour avec la nouvelle valeur

**Détails techniques :**

1. **Event listener sur le dropdown Version** (dans `app.js`) :
   ```javascript
   const selectVersion = document.getElementById('selectVersion');
   selectVersion.addEventListener('change', (e) => {
       const newVersion = e.target.value;
       const currentImmat = getConfig().immat;

       // Vérifier si l'immat actuelle est une valeur par défaut
       const isDefaultImmat = (currentImmat === 'N960TB' || currentImmat === 'N980TB');

       if (isDefaultImmat) {
           // Mettre à jour avec la nouvelle valeur par défaut
           const newDefaultImmat = `N${newVersion}TB`;
           updateConfig('immat', newDefaultImmat);
           document.getElementById('inputImmat').value = newDefaultImmat;
           console.log(`Immat mise à jour automatiquement: ${newDefaultImmat}`);
       } else {
           console.log(`Immat personnalisée conservée: ${currentImmat}`);
       }

       // Déclencher le rendu
       triggerRender();
   });
   ```

2. **Initialisation** : Vérifier que `DEFAULT_CONFIG.immat` dans `config.js` est cohérent avec `DEFAULT_CONFIG.version`

**Complexité :**
- Event listener simple
- Logique conditionnelle basique
- Mise à jour du state et de l'input
- Pas d'appel API supplémentaire

**Estimation** : 1 Story Point (~30 min de développement)

---

## Sprint #11 - Compatibilité multi-bases de données (7 SP)

### US-039 : Recharger configuration par défaut lors du changement de base

**Priorité** : CRITIQUE 🔴
**Story Points** : 2 SP
**Sprint** : Sprint #11 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux que la configuration se réinitialise automatiquement quand je change de base de données,
Afin d'éviter les erreurs dues à des valeurs incompatibles entre bases.

**Contexte technique :**
Actuellement, quand l'utilisateur change de base de données via le dropdown :
- ✅ Le DATABASE_ID change
- ✅ Les images sont reset
- ❌ Les defaults restent ceux de l'ancienne base
- ❌ Les valeurs sélectionnées peuvent être invalides pour la nouvelle base

**Critères d'acceptation :**
- [ ] Event listener sur selectDatabase appelle `loadDefaultConfigFromXML()` après changement
- [ ] Tous les dropdowns (Version, PaintScheme, Prestige, Decor, Spinner) sont rechargés depuis nouveau XML
- [ ] Les dropdowns intérieur (Prestige + 10 paramètres) sont rechargés
- [ ] Les valeurs sélectionnées sont mises à jour avec les defaults de la nouvelle base
- [ ] Toast info affiché : "Base de données changée. Configuration réinitialisée."
- [ ] Config intérieur (carpet, seatCovers, etc.) réinitialisée si prestige incompatible
- [ ] Tests : changer entre 2 bases différentes → valeurs toujours valides

**Fichiers concernés :**
- `code/js/app.js` : Modifier event listener `selectDatabase.addEventListener('change')` (ligne ~802)
- `code/js/app.js` : Appeler `loadDefaultConfigFromXML()` après changement
- `code/js/app.js` : Appeler `initUI()` pour recharger tous les dropdowns

**Implémentation suggérée :**
```javascript
selectDatabase.addEventListener('change', async (e) => {
    const databaseId = e.target.value;
    const databaseName = e.target.options[e.target.selectedIndex].text;

    console.log(`🔄 Changement de base: ${databaseName} (${databaseId})`);
    setDatabaseId(databaseId);

    // Réinitialiser les images
    showPlaceholder(`Base changée : ${databaseName}. Chargement...`);
    setImages([]);

    // Recharger la config par défaut depuis le nouveau XML
    await loadDefaultConfigFromXML();

    // Recharger tous les dropdowns depuis le nouveau XML
    await populateExteriorDropdowns();
    await populateInteriorDropdowns();

    // Toast info
    showToast(`Base de données changée : ${databaseName}. Configuration réinitialisée.`, 'info');

    showPlaceholder('Sélectionnez une configuration pour générer le rendu.');
});
```

**Complexité :**
- Event listener modification simple
- Réutilise fonctions existantes (`loadDefaultConfigFromXML()`)
- Pas de nouvelle logique complexe

**Estimation** : 2 Story Points (~1h de développement)

---

### US-040 : Validation des valeurs avant génération du rendu

**Priorité** : IMPORTANTE ⚠️
**Story Points** : 3 SP
**Sprint** : Sprint #11 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux que le système valide automatiquement ma configuration avant de générer le rendu,
Afin d'éviter les erreurs API dues à des valeurs incompatibles avec la base de données actuelle.

**Contexte technique :**
Si l'utilisateur :
1. Sélectionne une config avec base A
2. Change pour base B (qui n'a pas les mêmes valeurs)
3. Clique "Générer" SANS changer les dropdowns

→ Le payload envoyé contient des valeurs invalides pour base B → ERROR 400/500

**Critères d'acceptation :**
- [ ] Fonction `validateConfigBeforeRender()` créée dans `api.js` ou `app.js`
- [ ] Validation de `paintScheme` : existe dans les options du dropdown actuel
- [ ] Validation de `prestige` : existe dans les options du dropdown actuel
- [ ] Validation de `decor` : existe dans les options du dropdown actuel
- [ ] Validation de `version` : existe dans les options du dropdown actuel
- [ ] Validation de `spinner` : existe dans les options du dropdown actuel
- [ ] Si valeur invalide détectée : remplacement automatique par première option disponible
- [ ] Toast warning affiché si corrections automatiques : "Certaines valeurs ont été ajustées pour compatibilité"
- [ ] Log console détaillé des corrections effectuées
- [ ] Fonction appelée dans `loadRender()` AVANT `buildPayload()`
- [ ] Tests : config invalide → correction auto → rendu fonctionne

**Fichiers concernés :**
- `code/js/app.js` : Créer fonction `validateConfigBeforeRender()`
- `code/js/app.js` : Appeler validation dans `loadRender()` (ligne ~1489)

**Implémentation suggérée :**
```javascript
/**
 * Valide que toutes les valeurs de config existent dans les options actuelles
 * Corrige automatiquement les valeurs invalides
 * @returns {Object} Rapport { corrected: boolean, corrections: [] }
 */
function validateConfigBeforeRender() {
    const config = getConfig();
    const corrections = [];

    // Vérifier paintScheme
    const paintSchemeSelect = document.getElementById('selectPaintScheme');
    if (paintSchemeSelect && !hasOption(paintSchemeSelect, config.paintScheme)) {
        const firstOption = paintSchemeSelect.options[0]?.value;
        if (firstOption) {
            updateConfig('paintScheme', firstOption);
            paintSchemeSelect.value = firstOption;
            corrections.push(`paintScheme: ${config.paintScheme} → ${firstOption}`);
        }
    }

    // Répéter pour prestige, decor, version, spinner...

    // Si corrections effectuées
    if (corrections.length > 0) {
        console.warn('⚠️ Corrections automatiques appliquées:', corrections);
        showToast('Certaines valeurs ont été ajustées pour compatibilité', 'warning');
    }

    return { corrected: corrections.length > 0, corrections };
}

function hasOption(selectElement, value) {
    return Array.from(selectElement.options).some(opt => opt.value === value);
}
```

**Complexité :**
- Nouvelle fonction de validation
- Vérification de 5 dropdowns
- Logique de correction simple (première option)
- Gestion des toasts et logs

**Estimation** : 3 Story Points (~1h30 de développement)

---

### US-041 : Indicateur visuel de compatibilité base de données

**Priorité** : NICE TO HAVE ℹ️
**Story Points** : 2 SP
**Sprint** : Sprint #12 (Optionnel)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux voir un indicateur visuel de compatibilité de ma configuration avec la base de données sélectionnée,
Afin de savoir rapidement si ma config actuelle fonctionnera ou nécessite des ajustements.

**Contexte technique :**
Amélioration UX pour rendre visible la compatibilité :
- Badge vert ✓ Compatible : Toutes les valeurs existent dans la base actuelle
- Badge orange ⚠ Partiellement compatible : Certaines valeurs seront corrigées
- Badge rouge ✗ Incompatible : Trop de valeurs manquantes

**Critères d'acceptation :**
- [ ] Badge de compatibilité affiché à côté du dropdown "Base de données"
- [ ] Badge vert "✓ Compatible" si tous les paramètres (paintScheme, prestige, decor, version, spinner) existent dans options actuelles
- [ ] Badge orange "⚠ Partiel" si 1-2 paramètres invalides
- [ ] Badge rouge "✗ Incompatible" si 3+ paramètres invalides
- [ ] Tooltip au survol : détails des incompatibilités (ex: "PaintScheme: Sirocco introuvable")
- [ ] Badge mis à jour automatiquement quand user change un dropdown
- [ ] Badge mis à jour automatiquement quand user change de base
- [ ] Clic sur badge orange/rouge → modal avec détails + bouton "Corriger automatiquement"
- [ ] Bouton "Corriger automatiquement" appelle `validateConfigBeforeRender()`
- [ ] Tests : changer base → badge reflète correctement la compatibilité

**Fichiers concernés :**
- `code/index.html` : Ajouter badge HTML à côté du dropdown base
- `code/styles/controls.css` : Styles pour badges (vert/orange/rouge)
- `code/js/app.js` : Fonction `updateCompatibilityBadge()`
- `code/js/app.js` : Appeler mise à jour badge après changements

**Implémentation suggérée :**
```html
<!-- Dans index.html, à côté de selectDatabase -->
<div class="form-group">
    <label for="selectDatabase">Base de données</label>
    <div style="display: flex; gap: 0.5rem; align-items: center;">
        <select id="selectDatabase" class="form-control"></select>
        <span id="compatibilityBadge" class="badge badge-success" title="Configuration compatible">
            ✓ Compatible
        </span>
    </div>
</div>
```

```javascript
function updateCompatibilityBadge() {
    const config = getConfig();
    const badge = document.getElementById('compatibilityBadge');

    const invalidParams = [];

    // Check paintScheme
    const paintSchemeSelect = document.getElementById('selectPaintScheme');
    if (paintSchemeSelect && !hasOption(paintSchemeSelect, config.paintScheme)) {
        invalidParams.push('PaintScheme');
    }

    // Check autres paramètres...

    // Mettre à jour badge
    if (invalidParams.length === 0) {
        badge.className = 'badge badge-success';
        badge.textContent = '✓ Compatible';
        badge.title = 'Configuration compatible avec la base actuelle';
    } else if (invalidParams.length <= 2) {
        badge.className = 'badge badge-warning';
        badge.textContent = '⚠ Partiel';
        badge.title = `Paramètres incompatibles : ${invalidParams.join(', ')}`;
    } else {
        badge.className = 'badge badge-error';
        badge.textContent = '✗ Incompatible';
        badge.title = `Paramètres incompatibles : ${invalidParams.join(', ')}`;
    }
}
```

**Complexité :**
- HTML/CSS pour badge simple
- Fonction de vérification (réutilise logique US-040)
- Event listeners pour mise à jour automatique
- Modal optionnelle pour détails

**Estimation** : 2 Story Points (~1h de développement)

---

## Définition de terminé (DoD)

- [ ] Code fonctionnel testé manuellement
- [ ] Code commenté (fonctions complexes)
- [ ] Pas d'erreurs console
- [ ] Testé sur Chrome, Firefox, Edge
- [ ] Responsive (desktop + tablette)
- [ ] Documentation utilisateur à jour

---

**Total Sprint #1** : 48 Story Points ✅ (TERMINÉ)
**Total Sprint #2** : 13 Story Points ✅ (TERMINÉ)
**Total Sprint #3** : 3 Story Points ✅ (TERMINÉ)
**Total Sprint #4** : 9 Story Points ✅ (TERMINÉ)
**Total Sprint #5** : 4 Story Points ✅ (TERMINÉ)
**Total Sprint #6** : 10 Story Points (US-027: 10 SP - Configurateur intérieur complet)
**Total Sprint #7** : 11 Story Points (US-028: 3 SP - Affichage conditionnel selon vue + US-029: 5 SP - Mosaïque d'images + US-030: 3 SP - Optimisation 1920x1080)
**Total Sprint #8** : 7 Story Points (US-031: 2 SP - Téléchargement individuel images + US-032: 5 SP - Téléchargement par lot)
**Total Sprint #9** : 4 Story Points (US-033: 3 SP - Barre de recherche pour filtrer dropdowns + US-034: 1 SP - Immatriculation dynamique selon modèle)
**Total Sprint #10** : 5 Story Points ✅ (US-038: 1 SP - Corriger formatage noms dropdowns + US-035: 1 SP - Réorganiser section Sièges + US-036: 2 SP - Ajouter Stitching + US-037: 1 SP - Toggle buttons Matériau Central)
**Total Sprint #11** : 7 Story Points (US-039: 2 SP - Recharger defaults au changement de base + US-040: 3 SP - Validation des valeurs avant rendu + US-041: 2 SP - Indicateur de compatibilité base)
**Total Icebox** : ~22 Story Points (archivé, non demandé)

---

## User Stories - Sprint #12 (Backlog)

### [US-042] Mosaïque "Configuration" avec vignettes adaptatives (16:9 et 1:1)

**Priorité** : Haute
**Story Points** : 5 SP
**Sprint** : Sprint #12 (Prévu)
**Status** : To Do

**User Story :**
En tant qu'utilisateur,
Je veux visualiser toutes les caméras du groupe "Configuration" sous forme de mosaïque d'illustrations,
Afin d'avoir un aperçu visuel rapide de différentes vues de configuration.

**Contexte métier :**
Le groupe de caméras "Configuration" dans le XML contient plusieurs caméras avec des ratios différents (16:9 et 1:1) destinées à créer des vignettes d'illustration. Ces vignettes ne sont pas en 1920x1080 mais en résolutions plus petites optimisées pour tenir sur une page.

**Critères d'acceptation :**

**1. Nouvelle vue "Configuration"**
- [ ] Nouvel onglet "CONFIGURATION" ajouté aux onglets existants (EXTÉRIEUR | INTÉRIEUR | CONFIGURATION)
- [ ] Clic sur l'onglet charge les caméras du groupe "Configuration" depuis le XML
- [ ] La vue Configuration affiche une mosaïque de vignettes (pas de mode carousel)

**2. Gestion des ratios multiples**
- [ ] Les caméras 16:9 s'affichent en vignettes petit format (~266x150px ou équivalent)
- [ ] Les caméras 1:1 s'affichent en vignettes 100x100px
- [ ] Le système détecte automatiquement le ratio de chaque caméra (investigation nécessaire : XML ou config manuelle)
- [ ] Si le ratio n'est pas détectable dans le XML, utiliser un mapping manuel dans `config.js`

**3. Organisation en grille adaptative**
- [ ] Grille CSS Grid avec colonnes auto-adaptatives (2, 3 ou 4 colonnes selon le nombre de vignettes)
- [ ] Toutes les vignettes tiennent sur une seule page (pas de scroll excessif)
- [ ] Les vignettes respectent leur ratio sans déformation
- [ ] Espacement homogène entre les vignettes (gap: 10-15px)

**4. Interaction utilisateur**
- [ ] Au clic sur une vignette → Affichage en plein écran (modal, comme les vues Extérieur/Intérieur)
- [ ] Modal affiche l'image en résolution native ou 1920x1080 (selon disponibilité)
- [ ] Fermeture du modal avec bouton ✕ ou touche Echap
- [ ] Navigation au clavier possible (flèches gauche/droite pour changer de vignette dans le modal)

**5. Appel API optimisé**
- [ ] Les rendus utilisent le groupe "Configuration" du XML (cameraGroupId dynamique)
- [ ] Les tailles de rendu sont optimisées selon le ratio :
  - 16:9 → width: 266px, height: 150px (ou 533x300)
  - 1:1 → width: 100px, height: 100px (ou 200x200)
- [ ] Un seul appel API pour générer toutes les vignettes du groupe

**6. Intégration UI**
- [ ] L'onglet "CONFIGURATION" suit le style visuel des onglets existants
- [ ] La mosaïque réutilise le CSS existant de US-029 (`.mosaic-grid`)
- [ ] Pas de régression sur les vues EXTÉRIEUR et INTÉRIEUR

**Notes techniques :**

**Investigation requise** :
1. Vérifier si le XML expose le ratio des caméras (attributs `width`, `height`, ou `aspectRatio`)
2. Si non disponible, créer un mapping manuel dans `config.js` :
   ```javascript
   CAMERA_CONFIG_RATIOS: {
       "Configuration": [
           { name: "Camera_1", ratio: "16:9", width: 266, height: 150 },
           { name: "Camera_2", ratio: "1:1", width: 100, height: 100 },
           // ...
       ]
   }
   ```

**Fichiers impactés** :
- `code/index.html` : Ajout onglet "CONFIGURATION"
- `code/js/config.js` : Mapping ratios caméras (si nécessaire)
- `code/js/api.js` : Support viewType="configuration", gestion tailles multiples
- `code/js/ui.js` : Fonction `renderConfigMosaic()` avec gestion ratios mixtes
- `code/styles/viewport.css` : Styles pour vignettes 16:9 et 1:1

**Dépendances** :
- US-029 (Mosaïque d'images) - réutilisation du système existant
- US-022 (Sélecteur de vue) - extension avec 3ème vue

**Estimation** : 5 Story Points (~2.5-3h de développement)
- Investigation XML/API : 30min
- Logique détection ratio : 30min
- UI onglet + mosaïque : 1h
- Appel API multi-tailles : 45min
- Tests et ajustements : 30min

---

**Total Sprint #12** : 5 Story Points (US-042: 5 SP - Mosaïque Configuration avec vignettes adaptatives)

---

## User Stories - Sprint #13 (Dette Technique)

### [US-043] Refactoring complet du code pour maintenabilité et lisibilité

**Priorité** : Haute
**Story Points** : 8 SP
**Sprint** : Sprint #13 (Prévu)
**Status** : To Do
**Type** : Dette Technique

**User Story :**
En tant que développeur,
Je veux refactoriser et améliorer la qualité du code existant,
Afin de le rendre plus maintenable, lisible et facile à faire évoluer.

**Contexte :**
Suite aux 12 sprints précédents, le code a été développé rapidement avec des corrections successives. Il est temps de consolider et améliorer la qualité pour faciliter les futurs développements.

**Principe fondamental demandé par l'utilisateur :**
> **"Une fonction = une action"**
>
> Code super clean, simple, factorisé au maximum. Chaque fonction doit avoir une seule responsabilité clairement définie (Single Responsibility Principle).

**Standards de code choisis :**
- **Convention de nommage** : Airbnb JavaScript Style Guide (le plus populaire - 144k⭐ GitHub)
- **Formatage** : Prettier (standard de facto - 49k⭐ GitHub)
- **Linting** : ESLint avec config Airbnb (détection erreurs + best practices)
- **Documentation** : JSDoc (standard JavaScript pour la documentation)

**Critères d'acceptation :**

### A. Simplification du code (DRY - Don't Repeat Yourself) + Single Responsibility Principle
- [ ] **Une fonction = une action** : Chaque fonction a UNE SEULE responsabilité clairement définie
- [ ] Éliminer toute duplication de code entre `buildPayload()` et `buildPayloadForSingleCamera()`
- [ ] Créer des fonctions atomiques réutilisables :
  - `extractPaintConfig(xmlDoc, paintScheme)` → extrait config peinture
  - `buildInteriorConfigString(config)` → construit string intérieur
  - `buildDecorConfig(decor)` → construit config décor
  - `extractPaintSchemePart(configString)` → extrait partie paint scheme
- [ ] Simplifier les fonctions >30 lignes (objectif : max 20 lignes par fonction)
- [ ] Supprimer le code mort (variables, fonctions non utilisées)
- [ ] Regrouper la logique similaire dans des modules dédiés
- [ ] Chaque fonction doit avoir un nom de verbe d'action (`get`, `build`, `extract`, `validate`, `render`, etc.)

### B. Canonisation et standards (Airbnb Style Guide)
- [ ] Appliquer camelCase pour les variables/fonctions, PascalCase pour les classes
- [ ] Standardiser le format des objets retournés (toujours `{url, cameraId, cameraName, groupName}`)
- [ ] Uniformiser la gestion des erreurs (`try/catch` avec messages explicites)
- [ ] Standardiser les logs :
  - 🎬 Info : Début d'opération
  - ✅ Success : Opération réussie
  - ⚠️ Warning : Attention mais non bloquant
  - ❌ Error : Erreur bloquante
- [ ] Utiliser `const` par défaut, `let` seulement si réassignation nécessaire

### C. Maintenabilité (JSDoc)
- [ ] Ajouter JSDoc pour **TOUTES** les fonctions exportées
- [ ] Documenter les paramètres avec types TypeScript (`@param {string} name - Description`)
- [ ] Documenter les valeurs de retour (`@returns {Promise<Array>} Description`)
- [ ] Ajouter des exemples d'utilisation dans JSDoc pour fonctions complexes
- [ ] Documenter les exceptions possibles (`@throws {Error} Description`)
- [ ] Commenter uniquement la logique non évidente (pas de commentaires évidents)

### D. Lisibilité (Clean Code)
- [ ] Structure des fichiers améliorée :
  - `api.js` : Fonctions regroupées par domaine (XML, Payload, API Calls)
  - `colors.js` : Fonctions regroupées par étape (Parsing, Résolution, Génération)
  - `ui.js` : Fonctions regroupées par composant (Mosaic, Modal, Loader)
  - `app.js` : Séparation claire (Init, Event Handlers, State Management)
- [ ] Réduire la complexité cyclomatique (max 10 par fonction)
- [ ] Extraire les constantes magiques :
  - Nombres : Créer des constantes nommées (ex: `MAX_RETRIES = 3`)
  - Strings : Créer des enums ou constantes
- [ ] Noms de variables descriptifs (pas de `x`, `i` sauf boucles courtes)
- [ ] Éviter les imbrications profondes (max 3 niveaux)

### E. Accessibilité (Guide développeur)
- [ ] Créer `docs/GUIDE-DEVELOPPEUR.md` avec :
  - Architecture globale (diagramme de flux)
  - Points d'entrée principaux (`loadRender()`, `fetchRenderImages()`)
  - Explication du flux de données (User Input → Config → API → Render)
  - Exemples d'ajout de nouvelle fonctionnalité
- [ ] Documenter chaque fichier avec un header :
  ```javascript
  /**
   * @fileoverview Description du rôle du fichier
   * @author DEV
   * @version 1.0
   */
  ```
- [ ] Créer `docs/GLOSSARY.md` avec les termes métier (déjà commencé dans CLAUDE.md)

### F. Organisation des fichiers
- [ ] Créer une architecture modulaire :
  ```
  code/js/
  ├── api/
  │   ├── xml-parser.js       (getDatabaseXML, parseXML, findXXX)
  │   ├── payload-builder.js  (buildPayload, buildConfigString)
  │   ├── api-client.js       (callLumiscapheAPI, retry logic)
  │   └── index.js            (exports publics)
  ├── ui/
  │   ├── mosaic.js           (renderMosaic, renderConfigMosaic)
  │   ├── modal.js            (openFullscreenModal, navigation)
  │   ├── loader.js           (showLoader, hideLoader)
  │   └── index.js            (exports publics)
  ├── utils/
  │   ├── colors.js           (parseColorsFromConfig, resolveLetterColors)
  │   ├── positioning.js      (calculateCharPositions)
  │   └── validators.js       (validation functions)
  ├── state.js                (State management centralisé)
  ├── config.js               (Configuration et constantes)
  └── app.js                  (Point d'entrée, orchestration)
  ```

### G. Réduction du nombre de lignes
- [ ] **Objectif** : Réduire le code de **30%** minimum
- [ ] Avant refactoring : ~3000 lignes total
- [ ] Après refactoring : ~2000 lignes maximum
- [ ] Techniques :
  - Éliminer duplication → -400 lignes
  - Simplifier fonctions complexes → -300 lignes
  - Supprimer code mort → -200 lignes
  - Meilleure organisation → -100 lignes

### H. Tests et validation
- [ ] Tous les tests manuels passent après refactoring :
  - Vue Extérieur : Rendu correct avec toutes les options
  - Vue Intérieur : Rendu correct avec tous les Prestiges
  - Vue Configuration : 10 vignettes RegistrationNumber + autres
  - Modal plein écran : Navigation, métadonnées
  - Téléchargements : JSON payload, images individuelles
- [ ] Aucune régression fonctionnelle détectée
- [ ] Performance maintenue ou améliorée (temps de chargement ≤ actuel)
- [ ] Aucune erreur console
- [ ] Code validé par revue ARCH

### I. Standards appliqués (ESLint + Prettier)
- [ ] Configuration ESLint avec règles Airbnb :
  ```json
  {
    "extends": "airbnb-base",
    "rules": {
      "no-console": "off",
      "max-len": ["error", { "code": 120 }],
      "complexity": ["error", 10]
    }
  }
  ```
- [ ] Configuration Prettier :
  ```json
  {
    "singleQuote": true,
    "trailingComma": "es5",
    "printWidth": 120,
    "tabWidth": 4
  }
  ```
- [ ] Tous les fichiers `.js` passent ESLint sans erreur
- [ ] Tous les fichiers `.js` formatés avec Prettier

---

**Dépendances :**
- Bloque : Nouvelles fonctionnalités majeures (recommandé de faire avant)
- Bloqué par : Aucun

**Impact :**
- Positif : Code plus maintenable, onboarding plus facile, moins de bugs
- Risque : Régression si mal testé (mitigé par tests manuels complets)

**Alternatives considérées :**
- Option B (Refactoring incrémental) : Rejetée car préférence pour Option A
- Option C (Boy Scout Rule) : Rejetée car trop lent

**Estimation détaillée :**

| Phase | Durée | Détails |
|-------|-------|---------|
| Analyse et planification | 2h | Audit du code, identification zones critiques |
| Setup ESLint/Prettier | 1h | Configuration, ajout scripts npm si besoin |
| Refactoring `api.js` | 4h | Extraction modules, JSDoc, simplification |
| Refactoring `colors.js` | 2h | Renommage, documentation, exemples |
| Refactoring `ui.js` | 2h | Regroupement par composant, JSDoc |
| Refactoring `app.js` | 2h | Séparation logique métier/UI, event handlers |
| Organisation fichiers | 2h | Création structure modulaire, imports/exports |
| Documentation | 2h | GUIDE-DEVELOPPEUR.md, headers, JSDoc |
| Tests manuels | 2h | Suite complète de tests de non-régression |
| Revue ARCH | 1h | Validation architecture, code review |
| **Total** | **20h** | **~8 SP (2.5h/SP)** |

---

**Métriques de succès :**
- ✅ Réduction de 30% du nombre de lignes de code
- ✅ 100% des fonctions exportées documentées (JSDoc)
- ✅ 0 erreur ESLint
- ✅ Complexité cyclomatique moyenne < 5
- ✅ Temps de chargement ≤ temps actuel
- ✅ 0 régression fonctionnelle

---

**Total Sprint #13** : 8 Story Points (US-043: 8 SP - Refactoring complet pour maintenabilité)
