# Sprint Planning Notes - Sprint #9

**Projet** : 005-Configurateur_Daher
**Sprint** : Sprint #9
**Date** : 05/12/2025
**Participants** : PO, ARCH, DEV-Généraliste, QA-Fonctionnel
**Durée** : 15 minutes
**Animé par** : ARCH

---

## 📊 Contexte du Sprint

### État du Projet
- **Sprints complétés** : Sprint #1 à #8 (109 SP livrés)
- **Velocity moyenne** : 13.6 SP/sprint
- **Taux de succès** : 100% (tous sprints validés)

### Sprint Précédent (Sprint #8)
- **Livré** : 7 SP (US-031 + US-032 - Téléchargement images)
- **Statut** : ✅ DONE (05/12/2025)
- **Highlights** :
  - 3 bugs détectés et corrigés immédiatement
  - 0 bug post-QA
  - Apprentissage Blob download pattern

---

## 🎯 Sprint Goal

**"Immatriculation dynamique selon modèle + Recherche tags couleurs"**

Permettre :
1. Une cohérence automatique entre modèle et immatriculation
2. Une recherche rapide des couleurs par nom ou tags

---

## 📋 User Stories Sélectionnées

### [US-034] Immatriculation dynamique selon modèle
- **Story Points** : 1 SP
- **Priorité** : Moyenne
- **Complexité** : Faible
- **Durée estimée** : ~30 min

**Valeur métier** :
- Évite les incohérences (ex: modèle 980 avec immat N960TB)
- Améliore l'UX (moins de saisie manuelle)
- Respecte les cas d'usage personnalisés

**Critères d'acceptation** :
- Load 960 → Immat = N960TB
- Load 980 → Immat = N980TB
- Switch 960→980 → Immat = N980TB (sauf si custom)
- Custom immat → Pas de mise à jour auto

---

### [US-033] Barre de recherche pour filtrer zones couleurs par tags
- **Story Points** : 5 SP
- **Priorité** : Moyenne
- **Complexité** : Moyenne
- **Durée estimée** : ~2h30-3h

**Valeur métier** :
- Accélère la sélection de couleurs (100+ options par zone)
- Exploite les métadonnées XML (tags A+/NOA+)
- Améliore l'accessibilité (recherche vs scroll)

**Critères d'acceptation** :
- 5 inputs de recherche (un par zone A/B/C/D/A+)
- Filtrage insensible à la casse
- Recherche sur nom ET tags
- Affichage immédiat (pas de bouton)
- Sélection préservée après filtrage
- Message "Aucune correspondance" si 0 résultat

---

## 🔧 Décomposition Technique

### US-034 : 5 tâches (T1.1 à T1.5)
1. **T1.1** : Ajouter flag `hasCustomImmat` dans state.js (5 min)
2. **T1.2** : Modifier listener btnSubmitImmat (5 min)
3. **T1.3** : Créer fonction `updateDefaultImmatFromModel()` (10 min)
4. **T1.4** : Modifier listener selectVersion (5 min)
5. **T1.5** : Initialiser au chargement (5 min)

**Total** : 30 min

---

### US-033 : 8 tâches (T2.1 à T2.8)
1. **T2.1** : Modifier parseColorString() pour extraire tags (15 min)
2. **T2.2** : Vérifier getExteriorColorZones() (5 min)
3. **T2.3** : Ajouter 5 inputs de recherche HTML (20 min)
4. **T2.4** : Créer variable globale colorZonesData (5 min)
5. **T2.5** : Créer fonction filterColorDropdown() (30 min)
6. **T2.6** : Ajouter event listeners sur inputs (15 min)
7. **T2.7** : Ajouter CSS pour inputs (15 min)
8. **T2.8** : Tests fonctionnels complets (20 min)

**Total** : ~2h05 (+ marge 25 min pour debug)

---

## 📊 Estimation de Capacité

**Velocity Sprint #9** : 6 SP
- US-034 : 1 SP (~30 min)
- US-033 : 5 SP (~2h30)

**Total estimé** : ~3-4h (développement + tests)

**Répartition** :
- DEV : ~3h (implémentation)
- QA : ~30 min (tests fonctionnels)
- ARCH : ~30 min (review + documentation)

---

## 🎓 Apprentissages à Appliquer

### Depuis Sprint #8
1. **Toujours tester les cas limites dès T1.2**
   - Ne pas attendre la fin pour tester le comportement

2. **Checklist éléments interactifs** (créée en rétro Sprint #8) :
   - ✅ `type="button"` si pas dans formulaire
   - ✅ `stopPropagation()` si imbriqué dans conteneur cliquable
   - ✅ `preventDefault()` si comportement par défaut non souhaité

3. **Tests navigateurs multiples**
   - Chrome + Firefox dès la première implémentation

---

## 🛠️ Décisions Techniques

### Architecture du Filtrage (US-033)
**Décision** : Stocker les couleurs enrichies (avec tags[]) dans une variable globale `colorZonesData`

**Alternatives considérées** :
1. ❌ Recharger le XML à chaque filtrage → Trop lent
2. ❌ Stocker dans le state → Trop volumineux (100+ couleurs × 5 zones)
3. ✅ Variable globale en mémoire → Rapide, simple

**Justification** :
- Performance : Filtrage instantané (< 100ms)
- Simplicité : Pas de gestion de cache complexe
- Scope limité : Variable utilisée uniquement pour le filtrage

---

### Gestion du Flag Custom (US-034)
**Décision** : Flag `hasCustomImmat` dans le state, set à `true` uniquement via bouton "Envoyer"

**Comportement** :
- Load initial → `hasCustomImmat = false`
- User clique "Envoyer" → `hasCustomImmat = true`
- User change modèle → Si flag = false, update immat ; sinon, rien

**Edge case** :
- User change modèle AVANT de cliquer "Envoyer" → Immat mise à jour automatiquement ✅
- User clique "Envoyer" PUIS change modèle → Immat inchangée ✅

---

## 🧪 Stratégie de Tests

### US-034
**Tests unitaires** :
- Fonction `updateDefaultImmatFromModel()` avec flag true/false
- Listener selectVersion avec différents modèles

**Tests d'intégration** :
- Scénario complet : Load → Switch → Custom → Switch

**Tests manuels** :
- Recharger avec modèle 960 vs 980 dans config

---

### US-033
**Tests unitaires** :
- parseColorString() avec différents formats
- filterColorDropdown() avec termes variés

**Tests d'intégration** :
- Filtrage simultané sur plusieurs zones
- Préservation de la sélection après filtrage

**Tests de performance** :
- Filtrage sur 100+ couleurs (< 100ms)
- Typing rapide (pas de lag)

**Tests manuels** :
- Recherche par nom, tag, insensibilité casse
- Vider la recherche → Toutes les couleurs réapparaissent

---

## 📝 Risques Identifiés

### US-034 (Faible risque)
- **Risque** : User change manuellement l'input SANS cliquer "Envoyer" → Flag pas set
- **Mitigation** : Documentation claire : "Cliquer 'Envoyer' pour appliquer"
- **Accepté** : Comportement intentionnel (user doit valider)

### US-033 (Risque moyen)
- **Risque** : Tags XML mal formatés → Parsing échoue
- **Mitigation** : Vérification dans parseColorString() (return null si invalide)
- **Fallback** : Filtrage uniquement sur le nom si tags absents

- **Risque** : Performance sur très longues listes (200+ couleurs)
- **Mitigation** : Filtrage côté client (pas d'appel API)
- **Tests** : Mesurer temps de filtrage (objectif < 100ms)

---

## 🎯 Objectifs de Qualité

- **Performance** : Filtrage < 100ms
- **UX** : Feedback immédiat (pas de bouton "Rechercher")
- **Accessibilité** : Placeholder clair, message "Aucune correspondance"
- **Tests** : 100% des critères d'acceptation validés
- **Code** : Pas d'erreurs console

---

## 📅 Planning du Sprint

### Jour 1 (05/12/2025)
- **Matin** : Sprint Planning (15 min) ✅
- **10h-11h** : DEV - US-034 (toutes tâches)
- **11h-13h** : DEV - US-033 (T2.1 à T2.4)
- **14h-16h** : DEV - US-033 (T2.5 à T2.7)
- **16h-17h** : QA - Tests US-034 + US-033
- **17h-17h30** : Sprint Review + Rétrospective

**Estimation** : Sprint complété en 1 jour (comme Sprint #8)

---

## 💬 Notes de Discussion

**ARCH** :
> "Sprint court mais focalisé. US-034 est simple, US-033 est le cœur du sprint. Attention à la performance du filtrage."

**DEV-Généraliste** :
> "Parsing XML familier (déjà fait dans Sprint #6). Filtrage similaire à une recherche classique. Pas de blocage anticipé."

**QA-Fonctionnel** :
> "Critères clairs. Je testerai particulièrement l'insensibilité à la casse et les cas limites (0 résultat, sélection préservée)."

**PO** :
> "Bonne valeur ajoutée pour l'UX. US-034 élimine les incohérences, US-033 rend l'interface plus rapide. Stakeholder devrait apprécier."

---

## ✅ Engagement d'Équipe

L'équipe s'engage à livrer les 2 User Stories (6 SP) avec :
- Tous les critères d'acceptation validés
- Tests QA passés (100%)
- Pas de bugs bloquants
- Code commité sur Git
- Documentation à jour

**Sprint Goal confirmé** : ✅ Accepté par l'équipe

---

**Rédigé par** : ARCH
**Validé par** : PO, DEV-Généraliste, QA-Fonctionnel
**Date** : 05/12/2025
