# Glossaire - Termes Métier

## Termes Généraux

### Décor (Decor)
**Définition** : Environnement de fond pour la scène 3D
**Valeurs** : Studio, Tarmac, Fjord, Hangar, Onirique
**Utilisation** : Détermine la position de l'avion et le groupe de caméras extérieur
**Exemple XML** : `<Group name="Exterieur_DecorStudio">`

### Paint Scheme (Schéma de Peinture)
**Définition** : Schéma de peinture de l'avion avec zones de couleur
**Valeurs** : Zephir, Tehuano, Sirocco, Alize, Mistral, Meltem
**Utilisation** : Configuration peinture extérieure, noms caméras RegistrationNumber
**Exemple** : `Exterior_PaintScheme.Zephir`

### Prestige
**Définition** : Configuration intérieur prédéfinie (ensemble de 11 paramètres)
**Valeurs** : Oslo, SanPedro, London, Labrador, GooseBay, BlackFriars, Fjord, Atacama
**Utilisation** : Charge automatiquement 11 paramètres intérieur depuis un bookmark XML
**Paramètres affectés** : Carpet, SeatCovers, LowerSidePanel, MetalFinish, etc.

---

## Termes Techniques

### View Type (Type de Vue)
**Définition** : Type de vue demandé par l'utilisateur
**Valeurs** : `exterior`, `interior`, `configuration`
**Utilisation** : Détermine quel groupe de caméras utiliser
**Mapping** :
- `exterior` → Groupe `Exterieur_Decor{DecorName}`
- `interior` → Groupe `Interieur` (fixe)
- `configuration` → Groupe `Configuration` (fixe)

### Camera Group (Groupe de Caméras)
**Définition** : Ensemble de caméras dans le XML pour une vue spécifique
**Exemples** :
- `Exterieur_DecorStudio` (5-6 caméras)
- `Interieur` (4 caméras)
- `Configuration` (26 caméras)
**Structure XML** :
```xml
<Group id="..." name="Exterieur_DecorStudio">
    <Camera id="..." name="Camera1" />
    <Camera id="..." name="Camera2" />
</Group>
```

### Sensor (Capteur)
**Définition** : Capteur de caméra avec dimensions (width x height)
**Utilisation** : Détermine le ratio de l'image
**Exemples** :
- `1920x1080` → Ratio 16:9 (vues Ext/Int)
- `800x800` → Ratio 1:1 (détails Configuration)
**Code** :
```javascript
const ratio = sensorWidth / sensorHeight;
const is16by9 = Math.abs(ratio - 16/9) < 0.01;
```

---

## Termes Immatriculation

### Layer (Couche de couleur)
**Définition** : Couche de couleur pour les lettres d'immatriculation
**Important** : ⚠️ **L'API Lumiscaphe inverse les layers !**
**Mapping** :
- **Layer 0** dans payload → Applique la **2ème couleur** (zone secondaire)
- **Layer 1** dans payload → Applique la **1ère couleur** (zone principale)
**Exemple** : Pour paire `A-D` :
- Layer 0 envoyé avec couleur Zone D
- Layer 1 envoyé avec couleur Zone A

### Style (Style de lettres)
**Définition** : Style visuel des lettres d'immatriculation
**Valeurs** :
- **A-E** : Slanted (penchées) - Nécessite Left/Right dans textures
- **F-J** : Straight (droites) - Pas de Left/Right
**Mapping couleurs** :
- A ou F → Paire[0]
- B ou G → Paire[1]
- C ou H → Paire[2]
- D ou I → Paire[3]
- E ou J → Paire[4]
**Nommage textures** :
- Slanted : `Style_A_Left_N`, `Style_A_Right_N`
- Straight : `Style_F_N`

### Zone (Zone de couleur)
**Définition** : Zone de couleur sur le paint scheme
**Valeurs** : A, B, C, D, A+ (zone accent)
**Format dans config XML** :
```
Exterior_PaintScheme.Tehuano_A-0_A-D_A-D_A-D_A-D
                             └─┬─┘└─┬─┘└─┬─┘└─┬─┘└─┬─┘
                          paire[0][1][2][3][4]
```
**Parsing** : Chaque paire `X-Y` définit 2 zones (ou 1 si `X-0`)

---

## Termes Configuration

### Bookmark
**Définition** : Élément XML contenant une configuration prédéfinie
**Utilisation** : Charge des valeurs par défaut pour paint scheme, prestige, etc.
**Exemple** :
```xml
<Bookmark label="Exterior_Zephir">
    <ConfigurationString>Exterior_PaintScheme.Zephir_A-0_A-D_A-D_A-D_A-D/...</ConfigurationString>
</Bookmark>
```

### Configuration String
**Définition** : String complète décrivant toute la configuration de l'avion
**Format** : Segments séparés par `/`
**Exemple** :
```
Version.TBM960/Exterior_PaintScheme.Zephir/Interior_Carpet.BlackOnyx_5557/...
```

### Payload
**Définition** : Objet JSON envoyé à l'API Lumiscaphe pour générer un rendu
**Structure** :
```json
{
  "configuration": "Version.TBM960/...",
  "cameraGroup": "uuid-groupe-cameras",
  "materials": [...],
  "surfaces": [...]
}
```

---

## Acronymes

- **API** : Application Programming Interface (Lumiscaphe WebRender)
- **DOM** : Document Object Model
- **JSON** : JavaScript Object Notation
- **JSDoc** : Documentation JavaScript
- **SRP** : Single Responsibility Principle
- **XML** : eXtensible Markup Language
- **UI** : User Interface
- **UUID** : Universally Unique Identifier

---

## Sources de Vérité

### Pour les DONNÉES
**Source** : XML de l'API (`getDatabaseXML()`)
**Contient** :
- Valeurs de configuration (noms de schémas, couleurs)
- Paramètres de positionnement
- Groupes de caméras
**Règle** : Toujours utiliser les valeurs du XML, jamais les hardcoder

### Pour la LOGIQUE
**Source** : Code JavaScript (`code/js/`)
**Contient** :
- Structure des payloads API
- Nommage des textures et matériaux
- Algorithmes de calcul (positionnement, couleurs)
**Règle** : Le JavaScript fait AUTORITÉ pour toute la logique métier

---

**Glossaire complet ! 📖**
