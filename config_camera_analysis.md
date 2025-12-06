# Analyse des Caméras - Groupe "Configuration"

## 📊 Résumé

**Groupe ID**: 4c4154db-3245-414a-85c4-030ee180ecd4  
**Nom**: Configuration  
**Nombre total de caméras**: 27

## 🎯 Sensors utilisés et leurs ratios

### Sensor 1: "Sensor CONFIGURATION Paintscheme"
- **ID**: 88c353e7-abd3-40ad-8a04-bfb26c1f9b44
- **Dimensions**: width="36" height="20.25"
- **Ratio calculé**: 36/20.25 = 1.778 ≈ **16:9**
- **Caméras utilisant ce sensor**:
  1. `paint scheme`

### Sensor 2: "Sensor CONFIGURATION"
- **ID**: a9184a6c-e732-429b-8328-d94003787a4e
- **Dimensions**: width="36" height="36"
- **Ratio calculé**: 36/36 = 1.0 ≈ **1:1**
- **Caméras utilisant ce sensor** (21 caméras):
  1. `Spinner`
  2. `Colors`
  3. `RegistrationNumber_Sirocco`
  4. `RegistrationNumber_Alize`
  5. `RegistrationNumber_Mistral`
  6. `RegistrationNumber_Meltem`
  7. `RegistrationNumber_Tehuano`
  8. `RegistrationNumber_Zephir`
  9. `SeatCovers`
  10. `CentralSeatMaterial`
  11. `PerforatesSeatOptions`
  12. `Ultra-SuedeRibbon`
  13. `Stitching`
  14. `Seatbelts`
  15. `UpperSidePanel`
  16. `LowerSidePanel`
  17. `Carpet`
  18. `TabletFinish`
  19. `MetalFinish`
  20. `PrestigeSelection`

### Sensor 3: "SensorStudio"
- **ID**: 606eeed8-0149-4c1c-b5d6-1c61cbb28b94
- **Dimensions**: width="36" height="36"
- **Ratio calculé**: 36/36 = 1.0 ≈ **1:1**
- **Caméras utilisant ce sensor**:
  1. `DecorStudio`

### Sensor 4: "SensorFjord"
- **ID**: 5396bfb7-aac2-4c35-b9a3-c5761e7d46f7
- **Dimensions**: width="36" height="36"
- **Ratio calculé**: 36/36 = 1.0 ≈ **1:1**
- **Caméras utilisant ce sensor**:
  1. `DecorFjord`

### Sensor 5: "SensorHangar"
- **ID**: 8053ca85-cefc-4df8-8e99-216663654de7
- **Dimensions**: width="36" height="36"
- **Ratio calculé**: 36/36 = 1.0 ≈ **1:1**
- **Caméras utilisant ce sensor**:
  1. `DecorHangar`

### Sensor 6: "SensorOnirique"
- **ID**: c83572d6-6780-48c2-a6a3-6875fa57c359
- **Dimensions**: width="36" height="36"
- **Ratio calculé**: 36/36 = 1.0 ≈ **1:1**
- **Caméras utilisant ce sensor**:
  1. `DecorOnirique`

### Sensor 7: "SensorTarmac"
- **ID**: 120c8870-cc39-4918-834b-d35128984841
- **Dimensions**: width="36" height="36"
- **Ratio calculé**: 36/36 = 1.0 ≈ **1:1**
- **Caméras utilisant ce sensor**:
  1. `DecorTarmac`

## 📈 Distribution des ratios

| Ratio | Nombre de caméras | Pourcentage |
|-------|-------------------|-------------|
| 16:9  | 1                 | 3.7%        |
| 1:1   | 26                | 96.3%       |

## ✅ Conclusion

✅ **Les ratios sont DÉTERMINABLES depuis le XML !**

- Chaque caméra a un `sensorId` qui référence un sensor
- Chaque sensor a des attributs `width` et `height`
- Le ratio peut être calculé : `ratio = width / height`

### Recommandation technique :

**Approche : Détection automatique via sensors**

```javascript
// Dans api.js - Nouvelle fonction
async function getCameraSensor(cameraId) {
    const xmlDoc = await getDatabaseXML();
    const camera = xmlDoc.querySelector(`Camera[id="${cameraId}"]`);
    const sensorId = camera.getAttribute('sensorId');
    const sensor = xmlDoc.querySelector(`Sensor[id="${sensorId}"]`);
    return {
        width: parseFloat(sensor.getAttribute('width')),
        height: parseFloat(sensor.getAttribute('height')),
        ratio: parseFloat(sensor.getAttribute('width')) / parseFloat(sensor.getAttribute('height'))
    };
}
```

### Tailles de rendu recommandées :

- **16:9** (1 caméra) : 400x225px (vignette moyenne)
- **1:1** (26 caméras) : 100x100px (vignette petite)

