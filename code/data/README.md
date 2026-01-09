# Moulinette de génération pdf-hotspots.json

## Description

Cette moulinette génère automatiquement le fichier `pdf-hotspots.json` utilisé par le configurateur à partir des fichiers sources présents dans le répertoire `Source/`.

## Fichiers

- **Script** : `generate-pdf-hotspots.js`
- **Input** : `Source/*.json` (6 fichiers paint schemes)
- **Output** : `pdf-hotspots.json`

## Usage

### Exécution du script

```bash
cd code/data
node generate-pdf-hotspots.js
```

### Résultat attendu

```
🚀 Démarrage de la génération pdf-hotspots.json...

📂 6 fichiers trouvés dans ./Source/
   - Alize.json
   - Meltem.json
   - Mistral.json
   - Sirocco.json
   - Tehuano.json
   - Zephyr.json

📄 Traitement de Alize.json → "Alize"
   ✅ 5 hotspots extraits
...

✅ Fichier généré : pdf-hotspots.json
📊 Statistiques :
   - Paint schemes : 6
   - Total hotspots : 30

🎉 Génération terminée avec succès !
```

## Workflow de mise à jour

Lorsque vous recevez de nouveaux fichiers de configuration depuis Lumiscaphe :

1. **Placer** les nouveaux fichiers JSON dans `Source/`
2. **Exécuter** le script : `node generate-pdf-hotspots.js`
3. **Vérifier** le fichier généré `pdf-hotspots.json`
4. **Tester** le configurateur avec les nouvelles données

## Structure des fichiers

### Fichier source (dans Source/)

```json
{
  "settings": { ... },
  "views": [ ... ],
  "hotspots": [
    {
      "name": " Zone A",
      "description": "Lorem ipsum...",
      "attachment": { "type": "image", "url": "..." },
      "position3D": {
        "x": -3.478896141052246,
        "y": 1.384543776512146,
        "z": 0.6332787871360779
      }
    }
  ]
}
```

### Fichier de sortie (pdf-hotspots.json)

```json
{
  "Alize": {
    "hotspots": [
      {
        "name": "Zone A",
        "position3D": {
          "x": -3.478896141052246,
          "y": 1.384543776512146,
          "z": 0.6332787871360779
        }
      }
    ]
  }
}
```

## Transformations appliquées

Le script effectue les transformations suivantes :

1. **Extraction** du nom du paint scheme (nom de fichier sans extension)
2. **Nettoyage** des noms de zones (trim des espaces)
3. **Simplification** de la structure (conservation uniquement de `name` et `position3D`)
4. **Regroupement** par paint scheme
5. **Génération** du fichier JSON consolidé

## Zones de couleur

Chaque paint scheme contient **5 zones** :

- **Zone A** : Zone principale (fuselage gauche haut)
- **Zone B** : Zone secondaire
- **Zone C** : Zone tertiaire
- **Zone D** : Zone quaternaire
- **Zone A+** : Zone spéciale (dessus/queue)

## Maintenance

### Ajouter un nouveau paint scheme

1. Placer le fichier `NouveauScheme.json` dans `Source/`
2. Exécuter le script
3. Le fichier sera automatiquement ajouté au `pdf-hotspots.json`

### Mettre à jour les coordonnées

1. Modifier le fichier correspondant dans `Source/`
2. Exécuter le script
3. Le fichier `pdf-hotspots.json` sera regénéré avec les nouvelles données

## Validation

Après génération, vérifier :

- ✅ Nombre de paint schemes correct (actuellement 6)
- ✅ Chaque paint scheme a 5 hotspots (Zone A, B, C, D, A+)
- ✅ Coordonnées 3D valides (nombres décimaux)
- ✅ Noms de zones correctement nettoyés

## Dépannage

### Erreur "Aucun fichier JSON trouvé"

- Vérifier que le répertoire `Source/` existe
- Vérifier que les fichiers ont l'extension `.json`

### Erreur de parsing JSON

- Vérifier que les fichiers sources sont bien formatés (JSON valide)
- Utiliser un validateur JSON en ligne pour vérifier la syntaxe

### Hotspots manquants

- Vérifier que le fichier source contient bien un tableau `hotspots`
- Vérifier que les hotspots ont les propriétés `name` et `position3D`

---

**Version** : 1.0
**Date de création** : 09/01/2026
**Auteur** : Équipe Configurateur_Daher
