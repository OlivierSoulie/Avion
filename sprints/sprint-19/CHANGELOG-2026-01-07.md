# 📝 CHANGELOG - Session 07/01/2026

## 🚀 Résumé exécutif

**3 features majeures + 1 bug critique résolu en 4h**

---

## ✨ Nouveautés

### 1. Support format décor V0.9.2 avec index
- **Format XML** : `{DecorName}_{Ground|Flight}_{Index}`
- **Dropdown** : Affiche uniquement le nom propre
- **Tri** : Par index croissant (1, 2, 3, 4, 5, 6)
- **API** : Reçoit le nom complet avec index
- **Rétrocompatibilité** : V0.2, V0.3-V0.9.1 continuent de fonctionner

### 2. Vue PDF forcée en décor Studio
- Indépendant de la sélection dropdown
- Validation automatique selon version de base
- Ex V0.9.2 : "Studio" → "Studio_Ground_6"

### 3. Centrage optique immatriculation
- **W, M** : +5cm vers droite
- **I, 1** : -5cm vers gauche
- Décalage appliqué à la référence (toutes les lettres suivantes ajustées)

---

## 🐛 Corrections

### Bug critique : Position avion V0.9.2
- **Problème** : Position.XXX recevait nom complet au lieu du nom de base
- **Solution** : Utilisation de `decorPositionValue` depuis `buildDecorConfig()`
- **Résultat** : Avion correctement positionné pour tous les décors

---

## 🏗️ Architecture

### Refactoring majeur : Event listeners
- **Avant** : `app.js` = 2300+ lignes (orchestration + events)
- **Après** : Architecture modulaire (13 nouveaux fichiers)
- **Impact** : Code maintenable et testable

**Nouveaux modules** :
- `code/js/ui/events/` (8 fichiers) - Event listeners séparés
- `code/js/ui/color-manager.js` - Gestion couleurs
- `code/js/ui/config-schema-modal.js` - Modal documentation
- `code/js/utils/validators.js` - Validation et peuplement UI
- `code/js/utils/json-export.js` - Export JSON

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| **Commits** | 2 |
| **Fichiers modifiés** | 53 |
| **Lignes ajoutées** | +7016 |
| **Lignes supprimées** | -2778 |
| **Features majeures** | 3 |
| **Bugs critiques** | 1 |
| **Nouveaux modules** | 13 |
| **Rétrocompatibilité** | 100% |

---

## 📦 Commits

### `2602ada` - feat: Support décor V0.9.2 + PDF Studio + Centrage optique
- 52 fichiers modifiés
- +7013/-2776 lignes
- Date : 07/01/2026 11:52

### `5d7cadf` - fix: Correction position avion V0.9.2
- 1 fichier modifié (payload-builder.js)
- Date : 07/01/2026 12:12

---

## ✅ Tests validés

- ✅ V0.9.2 : Tous décors fonctionnels
- ✅ V0.9.1 : Pas de régression
- ✅ Vue PDF en Studio
- ✅ Centrage optique fonctionnel
- ✅ Position avion correcte
- ✅ Console propre (aucun warning)

---

## 🔗 Documentation complète

Voir : `sprints/sprint-19/RATIFICATION-SESSION-2026-01-07.md`

---

**COORDINATOR** : Claude Sonnet 4.5
**Date** : 07 janvier 2026
**Statut** : ✅ RATIFIÉ
