# Guide Utilisateur - Configuration Intérieur Personnalisée (US-027)

**Fonctionnalité** : Configuration intérieur complète avec 10 paramètres personnalisables
**Version** : 1.0
**Date** : 05/12/2025

---

## Vue d'ensemble

Le configurateur intérieur vous permet de personnaliser entièrement l'intérieur de votre avion TBM avec **10 paramètres modifiables** organisés en 2 sections : **Sièges** et **Matériaux et finitions**.

Cette fonctionnalité est **visible uniquement en vue intérieure** et permet de partir d'un template Prestige puis de personnaliser chaque élément individuellement.

---

## Accéder à la configuration intérieur

### Étape 1 : Basculer en vue intérieure

1. Dans la section Aperçu (à gauche), cliquez sur le bouton **"Intérieur"**
2. La section "Configuration Intérieur" apparaît automatiquement dans le panneau de droite

**Note** : La configuration intérieur est masquée en vue extérieure car elle ne s'applique qu'aux rendus intérieurs.

---

## Utiliser un template Prestige

### Option 1 : Initialiser depuis un Prestige

Le moyen le plus rapide de configurer l'intérieur est de choisir un **Prestige existant** qui charge automatiquement les 10 paramètres :

1. Dans le panneau de droite, localisez le dropdown **"Intérieur"**
2. Sélectionnez un des 8 prestiges disponibles :
   - Oslo
   - SanPedro
   - London
   - Labrador
   - GooseBay
   - BlackFriars
   - Fjord
   - Atacama

3. **Tous les 10 dropdowns** de la section "Configuration Intérieur" sont automatiquement remplis avec les valeurs du prestige sélectionné

4. Le rendu est généré automatiquement

**Exemple** : Sélectionner "Oslo" configure automatiquement :
- Tapis : Light Brown
- Cuir des sièges : Beige Gray 2176
- Bois de la tablette : Sapelli Mat
- Ceintures : Oat Meal
- Finition métallique : Brushed Stainless
- Et 5 autres paramètres...

---

## Personnaliser l'intérieur

### Section 1 : Sièges (4 paramètres)

Une fois un prestige chargé, vous pouvez modifier individuellement chaque élément des sièges :

#### 1. Cuir des sièges
- **Choix** : 46 couleurs de cuir disponibles
- **Exemples** : Beige Gray 2176, White Sand 2192, Charcoal 2280, Black Jet 3253...
- **Impact** : Change la couleur du cuir sur tous les sièges

#### 2. Ceintures de sécurité
- **Choix** : 4 couleurs disponibles
  - Black Jet (noir)
  - Chrome Gray (gris)
  - Oat Meal (beige)
  - Soft Moon (clair)
- **Impact** : Change la couleur des ceintures de sécurité

#### 3. Matériau siège central
- **Choix** : 2 options
  - Cuir (Leather Premium)
  - Ultra-Suede (tissu haut de gamme)
- **Impact** : Change le matériau du centre du siège

#### 4. Perforation des sièges
- **Choix** : 2 options
  - Sans perforation
  - Perforation centrale
- **Impact** : Ajoute ou retire la perforation des sièges

---

### Section 2 : Matériaux et finitions (6 paramètres)

#### 5. Tapis
- **Choix** : 3 couleurs disponibles
  - Charcoal Black (noir)
  - Light Brown (marron clair)
  - Taupe Gray (gris taupe)
- **Impact** : Change la couleur du tapis au sol

#### 6. Bois de la tablette
- **Choix** : 4 finitions bois disponibles
  - Carbon (carbone)
  - Glossy Walnut (noyer brillant)
  - Koto Mat (koto mat)
  - Sapelli Mat (sapelli mat)
- **Impact** : Change l'essence de bois de la tablette

#### 7. Finition métallique
- **Choix** : 3 finitions disponibles
  - Brushed Stainless (inox brossé)
  - Flat Black (noir mat)
  - Gold (doré)
- **Impact** : Change la finition des éléments métalliques

#### 8. Panneau latéral supérieur
- **Choix** : 46 couleurs de cuir (même liste que "Cuir des sièges")
- **Impact** : Change la couleur du panneau latéral supérieur

#### 9. Panneau latéral inférieur
- **Choix** : 46 couleurs de cuir (même liste que "Cuir des sièges")
- **Impact** : Change la couleur du panneau latéral inférieur

#### 10. Ruban Ultra-Suede
- **Choix** : 12 couleurs Ultra-Suede disponibles
  - Black Onyx 3368
  - Bone 3386
  - Elephant 3367
  - Mink 3369
  - Et 8 autres...
- **Impact** : Change la couleur du ruban décoratif Ultra-Suede

---

## Workflow recommandé

### Scénario 1 : Partir d'un template et affiner

1. **Basculer en vue intérieure**
2. **Sélectionner un Prestige** (ex: "Oslo")
3. **Modifier 1 ou 2 paramètres** selon vos préférences (ex: changer le bois de la tablette)
4. **Générer le rendu** automatiquement à chaque changement
5. **Visualiser** le résultat dans le carrousel d'images

### Scénario 2 : Comparer plusieurs configurations

1. **Noter la configuration actuelle** (option : Télécharger JSON)
2. **Changer de Prestige** pour voir une autre configuration
3. **Comparer visuellement** les rendus
4. **Revenir au Prestige précédent** si nécessaire

### Scénario 3 : Personnalisation complète

1. **Partir d'un Prestige de base** (ex: "Oslo")
2. **Modifier tous les paramètres** un par un
3. **Valider visuellement** après chaque changement
4. **Télécharger le JSON** pour sauvegarder votre configuration personnalisée

---

## Comportement de l'application

### Génération automatique des rendus

Chaque modification déclenche **automatiquement** un nouveau rendu API :
- ✅ Changement de dropdown intérieur → Rendu automatique
- ✅ Changement de Prestige → Rendu automatique
- ✅ Basculement Extérieur/Intérieur → Rendu automatique

**Temps de génération** : Environ 2-5 secondes selon la complexité

### Visibilité de la section

- **Vue Intérieure** : Section "Configuration Intérieur" visible
- **Vue Extérieure** : Section "Configuration Intérieur" masquée (mais les valeurs sont conservées)

**Astuce** : Vous pouvez basculer entre Extérieur/Intérieur sans perdre vos réglages intérieurs.

### Conservation des paramètres

Les 10 paramètres intérieurs sont **conservés en mémoire** tant que vous ne :
- Rechargez pas la page
- Ne changez pas de Prestige (qui réinitialise tous les paramètres)

---

## Exemples d'utilisation

### Exemple 1 : Créer un intérieur sombre et luxueux

1. Partir du Prestige "BlackFriars"
2. Modifier :
   - Tapis → Charcoal Black
   - Cuir des sièges → Black Jet 3253
   - Finition métallique → Gold (contraste doré)
   - Bois de la tablette → Carbon
3. Résultat : Intérieur sombre avec touches dorées

### Exemple 2 : Créer un intérieur clair et aéré

1. Partir du Prestige "Oslo"
2. Modifier :
   - Tapis → Taupe Gray
   - Cuir des sièges → White Sand 2192
   - Bois de la tablette → Koto Mat (bois clair)
   - Ceintures → Soft Moon (clair)
3. Résultat : Intérieur lumineux et épuré

### Exemple 3 : Mixer plusieurs prestiges

1. Partir du Prestige "London"
2. Emprunter des éléments d'autres prestiges :
   - Tapis de "Oslo" (Light Brown)
   - Cuir de "Atacama" (Navy Blue 3215)
   - Bois de "SanPedro" (Glossy Walnut)
3. Résultat : Configuration unique

---

## Dépannage

### La section "Configuration Intérieur" n'apparaît pas

**Cause** : Vous êtes en vue extérieure
**Solution** : Cliquez sur le bouton "Intérieur" dans la section Aperçu

### Le rendu ne change pas après modification

**Cause** : Erreur de chargement ou connexion API
**Solution** :
1. Vérifier le badge "En ligne" en haut à droite (doit être vert)
2. Ouvrir la console développeur (F12) pour voir les erreurs
3. Cliquer sur "Réessayer" si un message d'erreur apparaît

### Les dropdowns sont vides

**Cause** : Erreur de chargement de la base de données
**Solution** :
1. Vérifier que la base de données est bien sélectionnée (en haut du panneau)
2. Recharger la page (F5)

### Comment revenir à la configuration d'origine ?

**Solution** :
1. Re-sélectionner le même Prestige dans le dropdown "Intérieur"
2. Tous les paramètres reviendront aux valeurs du prestige

---

## Astuces et bonnes pratiques

### Astuce 1 : Utiliser les prestiges comme point de départ

Les prestiges sont conçus par des designers professionnels. Partir d'un prestige garantit une harmonie visuelle de base.

### Astuce 2 : Modifier un seul paramètre à la fois

Pour comprendre l'impact de chaque paramètre, modifiez-les un par un et observez le rendu.

### Astuce 3 : Sauvegarder votre configuration

Utilisez le bouton "📥 Télécharger JSON" pour sauvegarder votre configuration personnalisée.

### Astuce 4 : Coordination des couleurs

Les panneaux latéraux (supérieur et inférieur) utilisent la même liste que le cuir des sièges. Vous pouvez créer un effet uni ou contrasté.

### Astuce 5 : Vue d'ensemble

Utilisez le carrousel d'images (flèches < >) pour voir l'intérieur sous plusieurs angles.

---

## Raccourcis clavier

- **Flèche gauche** : Image précédente du carrousel
- **Flèche droite** : Image suivante du carrousel
- **Échap** : Fermer le mode plein écran (si activé)
- **F** : Mode plein écran (sur l'image)

---

## Questions fréquentes (FAQ)

### Q1 : Combien de combinaisons sont possibles ?

**Réponse** : Plus de 1 milliard de combinaisons possibles avec les 10 paramètres ! (46 × 4 × 2 × 2 × 3 × 4 × 3 × 46 × 46 × 12)

### Q2 : Puis-je sauvegarder ma configuration ?

**Réponse** : Oui, utilisez le bouton "Télécharger JSON" pour exporter votre configuration. (Note : La fonctionnalité d'import n'est pas encore disponible dans cette version)

### Q3 : Les modifications affectent-elles l'extérieur ?

**Réponse** : Non, les 10 paramètres intérieurs n'affectent que les rendus en vue intérieure. L'extérieur reste inchangé.

### Q4 : Puis-je voir plusieurs vues en même temps ?

**Réponse** : Non, vous devez basculer entre vue Extérieur/Intérieur. Cependant, chaque rendu intérieur contient plusieurs angles (carrousel).

### Q5 : Comment savoir quel prestige correspond à quelle configuration ?

**Réponse** : Chaque prestige a un nom (Oslo, London, etc.). En sélectionnant un prestige, observez les valeurs qui se chargent dans les 10 dropdowns pour voir sa composition.

---

## Support et documentation

Pour plus d'informations techniques :
- Voir `sprints/sprint-06/TECHNICAL_DOC_US027.md` (documentation développeur)
- Consulter le Sprint Backlog : `sprints/sprint-06/sprint-backlog.md`

---

**Version** : 1.0
**Dernière mise à jour** : 05/12/2025
