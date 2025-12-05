# Product Backlog - Configurateur_Daher

**Projet** : 005-Configurateur_Daher
**Date de creation** : 02/12/2025
**PO** : Claude (PO Agent)
**Derniere mise a jour** : 05/12/2025 - US-028 corrigée (Affichage conditionnel selon vue) + US-029 (Mosaïque d'images)

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
**Total Sprint #7** : 8 Story Points (US-028: 3 SP - Affichage conditionnel selon vue + US-029: 5 SP - Mosaïque d'images)
**Total Icebox** : ~22 Story Points (archivé, non demandé)
