# Sprint Planning #15 - Normalisation Décor + Analyse Patterns Multi-Versions

**Date** : 08/12/2025
**Sprint Goal** : "Normaliser le dropdown Décor pour supporter V0.1/V0.2 + Analyser exhaustivement tous les patterns de données V0.1 à V0.6"
**Équipe** : 6 agents (PO + ARCH + COORDINATOR + DEV-Généraliste + QA-Fonctionnel + DOC)
**Capacity** : 8 Story Points

---

## 📋 Contexte

### Problème identifié (US-047)
La branche `feature/decor-normalization-v01-v02-support` contient des modifications pour supporter V0.6 (nouveau pattern PaintScheme avec index), mais le dropdown Décor ne gère pas correctement les formats V0.1 et V0.2.

### Découverte en cours de sprint (US-048)
L'utilisateur demande une analyse exhaustive des patterns de tous les paramètres à travers toutes les versions V0.1 à V0.6 pour garantir que la documentation de la modale de configuration est exacte.

---

## 🎯 Sprint Goal Décomposé

### Objectif 1 : Normalisation Décor (US-047)
Adapter le code pour gérer les 3 formats de Décor :
- V0.1 : Absent (POC)
- V0.2 : `{decorName}_{cameraId}_Tx_Ty_Tz_Rx_Ry_Rz` (8 segments)
- V0.3-V0.6 : `{decorName}_{Flight|Ground}` (2 segments)

### Objectif 2 : Analyse Patterns Multi-Versions (US-048)
Analyser systématiquement tous les paramètres (25+) à travers les 6 versions pour :
- Détecter l'évolution des patterns
- Mettre à jour `database-analyzer.js` avec les patterns corrects
- Créer une documentation de référence complète

---

## 📊 User Stories du Sprint

### [US-047] Normalisation dropdown Décor pour V0.1/V0.2 (3 SP)

**En tant que** utilisateur du configurateur
**Je veux** que le dropdown Décor affiche correctement les valeurs pour toutes les versions de base
**Afin de** pouvoir utiliser le configurateur avec les bases V0.1 et V0.2 sans erreur

**Critères d'acceptation** :
1. ✅ V0.3-V0.6 : Affiche "Fjord (Ground)", "Studio (Flight)", etc.
2. ✅ V0.2 : Affiche "Fjord", "Studio", etc. (sans suffixe)
3. ✅ V0.1 : Dropdown masqué ou vide (Decor absent)
4. ✅ Formatage correct avec `formatDecorLabel()`
5. ✅ Backward compatibility : anciens états config compatibles

**Décomposition technique** :
- [T047-1] Parser V0.2 : Extraire decorName sans coordonnées (30min) - `xml-parser.js`
- [T047-2] Fonction formatDecorLabel() avec détection format (30min) - `xml-parser.js`
- [T047-3] Tests avec XML V0.1/V0.2/V0.3 (1h) - QA
- [T047-4] Mise à jour documentation patterns (30min) - DOC

**Story Points** : 3 SP
**Assignation** : DEV-Généraliste + QA-Fonctionnel + DOC

---

### [US-048] Analyse exhaustive patterns multi-versions (5 SP)

**En tant que** développeur/mainteneur du projet
**Je veux** une documentation complète et exacte de tous les patterns de données
**Afin de** garantir que la modale de configuration affiche des informations correctes

**Critères d'acceptation** :
1. ✅ Analyse des 25 paramètres à travers V0.1-V0.6
2. ✅ Rapport détaillé des patterns (nombre de segments, exemples)
3. ✅ Identification des évolutions majeures entre versions
4. ✅ Mise à jour `database-analyzer.js` avec patterns corrects
5. ✅ Document de référence `PATTERNS_REFERENCE.md` créé

**Décomposition technique** :
- [T048-1] Télécharger tous les XML (V0.1-V0.6) (30min) - DEV
- [T048-2] Créer script d'analyse `analyze_patterns.js` (45min) - DEV
- [T048-3] Exécuter analyse et générer rapport (15min) - DEV
- [T048-4] Analyser résultats et identifier évolutions (1h) - ARCH
- [T048-5] Mettre à jour `database-analyzer.js` (1h30) - DEV
  - Exterior_PaintScheme : Ajout détection V0.1 (1 segment)
  - Exterior_Colors_Zone : Correction 4→10→14 segments
  - Decor : Clarification V0.2 vs V0.3+
  - Interior_Stitching : Ajout version (V0.3+)
  - Interior_ génériques : Documentation améliorée
- [T048-6] Créer `PATTERNS_REFERENCE.md` (1h) - DOC
- [T048-7] Vérifier modale affiche patterns corrects (30min) - QA

**Story Points** : 5 SP
**Assignation** : DEV-Généraliste + ARCH + QA-Fonctionnel + DOC

---

## 📅 Calendrier Sprint

### Jour 1 (08/12/2025) - Matin

**09h00-09h15 : Sprint Planning** ✅
- PO présente US-047 et US-048
- ARCH décompose techniquement
- COORDINATOR décide staffing (6 agents)

**09h15-12h00 : Développement Bloc 1** ✅
- DEV : Téléchargement XML + Script analyse (T048-1, T048-2, T048-3)
- ARCH : Analyse des résultats (T048-4)

### Jour 1 - Après-midi

**14h00-17h00 : Développement Bloc 2** ✅
- DEV : Mise à jour database-analyzer.js (T048-5)
- DEV : Normalisation Décor (T047-1, T047-2)
- DOC : Création PATTERNS_REFERENCE.md (T048-6)

**17h00-17h30 : Tests et validation** ✅
- QA : Tests US-047 (T047-3)
- QA : Vérification modale (T048-7)
- DOC : Documentation patterns (T047-4)

---

## 🎯 Définition de "Done"

### Pour US-047 (Normalisation Décor)
- [ ] Code modifié dans `xml-parser.js`
- [ ] Tests manuels avec V0.1, V0.2, V0.3 passés
- [ ] Dropdown affiche correctement pour toutes versions
- [ ] Documentation patterns mise à jour
- [ ] Aucun bug régressif

### Pour US-048 (Analyse Patterns)
- [x] Tous les XML téléchargés (V0.1-V0.6) ✅
- [x] Script `analyze_patterns.js` créé et testé ✅
- [x] Rapport `pattern_analysis.txt` généré ✅
- [x] `database-analyzer.js` mis à jour avec patterns corrects ✅
- [x] Document `PATTERNS_REFERENCE.md` créé ✅
- [ ] Modale de configuration affiche patterns corrects (à tester)
- [ ] Validation ARCH des patterns documentés

---

## 📊 Risques et Mitigation

### Risque 1 : XML V0.1/V0.2 introuvables
**Probabilité** : Faible
**Impact** : Bloquant pour US-047
**Mitigation** : Utiliser endpoint `/Databases` de l'API pour lister et télécharger

### Risque 2 : Patterns trop complexes à documenter
**Probabilité** : Moyenne
**Impact** : Retard sur US-048
**Mitigation** : Focus sur les patterns critiques en priorité

### Risque 3 : Bugs régressifs sur anciens formats
**Probabilité** : Moyenne
**Impact** : Moyen
**Mitigation** : Tests exhaustifs avec QA sur V0.1-V0.6

---

## 📈 Métriques Prévisionnelles

- **Velocity cible** : 8 SP
- **Durée estimée** : 1 journée (6-8h)
- **Équipe** : 6 agents
- **Complexité** : Moyenne (analyse + refactoring)

---

## 🔗 Références

- **Branche Git** : `feature/decor-normalization-v01-v02-support`
- **Fichiers critiques** :
  - `code/js/api/xml-parser.js`
  - `code/js/api/database-analyzer.js`
  - `temp_xml_analysis/analyze_patterns.js`
  - `temp_xml_analysis/PATTERNS_REFERENCE.md`
- **API Lumiscaphe** : `https://wr-daher.lumiscaphe.com`
- **Endpoint databases** : `/Databases`
- **Endpoint XML** : `/Database?databaseId={id}`

---

**Sprint Planning approuvé par** :
- ✅ PO (Product Owner)
- ✅ ARCH (Architecte/Scrum Master)
- ✅ COORDINATOR (Chef d'orchestre opérationnel)

**Prêt à démarrer** : ✅ OUI
