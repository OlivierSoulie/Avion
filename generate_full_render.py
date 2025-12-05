"""
Générateur de rendus TBM Daher - Version Python
================================================

⚠️ IMPORTANT : SYNCHRONISATION AVEC LE JAVASCRIPT
Ce script Python a été mis à jour pour refléter les concepts et corrections
implémentés dans le site web JavaScript (code/js/).

CORRECTIONS MAJEURES (05/12/2025) :
- BUG FIX CRITIQUE : Inversion des layers par l'API Lumiscaphe
  * Pour paire "A-D" : Layer 0 envoyé avec couleur Zone D, Layer 1 avec Zone A
  * Logique inversée implémentée dans resolve_letter_colors()
- Layer 1 TOUJOURS envoyé (même si zone = "0", utilise couleur Layer 0 dans ce cas)
- Nommage conditionnel des textures (slanted vs straight)

ALIGNEMENT AVEC JAVASCRIPT :
- Gestion DATABASE_ID dynamique (US-019)
- Support SunGlass/Tablet/Doors dynamique (US-023-026)
- Même logique de positionnement (espacement 5cm)
- Même logique de couleurs (mapping couples A/F, B/G, etc.)

RÉFÉRENCE : code/js/colors.js, code/js/positioning.js, code/js/api.js
"""

import requests
import xml.etree.ElementTree as ET
import json
import os
import sys

# --- VERSION ---
SCRIPT_VERSION = "v3.0 (Aligned with JavaScript - Layers inversion fix + Interior config)"

# --- CONFIGURATION ---
API_BASE_URL = "https://wr-daher.lumiscaphe.com"

# US-019: DATABASE_ID is now dynamically managed
# Valeur par défaut : TBM 960 (peut être changé au démarrage du script)
DATABASE_ID = "8ad3eaf3-0547-4558-ae34-647f17c84e88"  # TBM 960 par défaut

OUTPUT_DIR = "Rendus_TBM_Output"
IMAGE_WIDTH = 1920
IMAGE_HEIGHT = 1080

# --- DONNÉES ---
VERSION_LIST = ["960", "980"]
STYLES_SLANTED = ["A", "B", "C", "D", "E"]
STYLES_STRAIGHT = ["F", "G", "H", "I", "J"]

DECORS_CONFIG = {
    "Tarmac":   {"suffix": "Tarmac_Ground",   "type": "Ground"},
    "Studio":   {"suffix": "Studio_Ground",   "type": "Ground"},
    "Hangar":   {"suffix": "Hangar_Ground",   "type": "Ground"},
    "Onirique": {"suffix": "Onirique_Ground", "type": "Ground"},
    "Fjord":    {"suffix": "Fjord_Flight",    "type": "Flight"} 
}
PAINT_SCHEMES_LIST = ["Sirocco", "Alize", "Mistral", "Meltem", "Tehuano", "Zephir"]  # Aligné avec JavaScript
PRESTIGE_LIST = ["Oslo", "SanPedro", "London", "Labrador", "GooseBay", "BlackFriars", "Fjord", "Atacama"]
SPINNER_LIST = ["PolishedAluminium", "MattBlack"]

# --- PHYSIQUE ---
CHAR_WIDTHS = {'W': 0.30, 'M': 0.30, 'I': 0.05, 'DEFAULT': 0.20}
SPACING = 0.05

# --- FONCTIONS I/O ---
def ask_user_choice(label, options_list):
    print(f"\n--- SÉLECTION : {label.upper()} ---")
    for i, option in enumerate(options_list):
        print(f"  {i+1}. {option}")
    while True:
        try:
            choice = input(f"Votre choix (1-{len(options_list)}) : ")
            if 0 <= int(choice)-1 < len(options_list): return options_list[int(choice)-1]
        except ValueError: pass

def ask_immatriculation():
    print(f"\n--- SÉLECTION : IMMATRICULATION ---")
    val = input("Entrez l'immatriculation (Defaut: N960TB) : ").strip().upper()
    if not val:
        print("-> Utilisation par défaut : N960TB")
        return "N960TB"
    if 1 <= len(val) <= 6: return val
    print("Erreur : Max 6 caractères.")
    return "N960TB"

def ask_image_dimensions():
    print(f"\n--- SÉLECTION : DIMENSIONS IMAGE ---")
    width_input = input(f"Largeur en pixels (Defaut: {IMAGE_WIDTH}) : ").strip()
    height_input = input(f"Hauteur en pixels (Defaut: {IMAGE_HEIGHT}) : ").strip()

    try:
        width = int(width_input) if width_input else IMAGE_WIDTH
        height = int(height_input) if height_input else IMAGE_HEIGHT

        if width < 100 or width > 10000:
            print(f"Largeur hors limites, utilisation par défaut : {IMAGE_WIDTH}")
            width = IMAGE_WIDTH
        if height < 100 or height > 10000:
            print(f"Hauteur hors limites, utilisation par défaut : {IMAGE_HEIGHT}")
            height = IMAGE_HEIGHT

        print(f"-> Dimensions sélectionnées : {width}x{height}")
        return width, height
    except ValueError:
        print(f"-> Valeurs invalides, utilisation par défaut : {IMAGE_WIDTH}x{IMAGE_HEIGHT}")
        return IMAGE_WIDTH, IMAGE_HEIGHT

def get_database_xml(database_id):
    # Chemin du fichier XML local (dans le répertoire parent)
    xml_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), f"{database_id}.xml")

    # Si le fichier existe, on le charge
    if os.path.exists(xml_path):
        print(f"   > Utilisation du XML local : {os.path.basename(xml_path)}")
        try:
            return ET.parse(xml_path).getroot()
        except Exception as e:
            print(f"   [ERREUR] Impossible de lire le XML local : {e}")
            print(f"   > Téléchargement depuis l'API...")
    else:
        print(f"   > XML non trouvé localement, téléchargement depuis l'API...")

    # Sinon, on le télécharge et on le sauvegarde
    try:
        r = requests.get(f"{API_BASE_URL}/Database", params={'databaseId': database_id})
        r.raise_for_status()

        # Sauvegarde du XML
        with open(xml_path, 'wb') as f:
            f.write(r.content)
        print(f"   > XML sauvegardé : {xml_path}")

        return ET.fromstring(r.content)
    except Exception as e:
        print(f"ERREUR XML: {e}")
        sys.exit(1)

def find_camera_group_id(xml_root, decor_name):
    target = f"Exterieur_Decor{decor_name}"
    for g in xml_root.findall(".//Group"):
        if g.get('name') == target: return g.get('id')
    for g in xml_root.findall(".//Group"):
        if f"Decor{decor_name}" in g.get('name', ''): return g.get('id')
    raise ValueError(f"Groupe caméra introuvable pour {decor_name}")

# --- POSITIONNEMENT V2.8 (LOGIQUE SNIPPET) ---

def extract_anchors(xml_root, scheme):
    """
    Récupère le point de départ (X0) et la direction pour chaque côté.
    """
    params = {'Left': None, 'Right': None, 'Y': 0.0}
    target = f"{scheme.upper()}_REG"
    
    candidates = []
    candidates.extend(xml_root.findall(".//ConfigurationBookmark"))
    candidates.extend(xml_root.findall(".//Bookmark"))
    
    for item in candidates:
        name = (item.get('name') or item.get('label') or "").upper()
        if name.startswith(target):
            parts = name.split('_')
            if len(parts) >= 9:
                try:
                    coords = [float(x) for x in parts[2:8]]
                    y = float(parts[8])
                    
                    # Détection Direction
                    direction = 1.0
                    if len(coords) > 1 and coords[1] < coords[0]:
                        direction = -1.0

                    # On garde le point de départ (Coords 0)
                    side_data = {'Start': coords[0], 'Direction': direction}
                    
                    if "REGL" in parts[1].upper(): 
                        params['Left'] = side_data; params['Y'] = y
                    elif "REGR" in parts[1].upper(): 
                        params['Right'] = side_data
                except: continue
                
    if not params['Left']:
        params['Left'] = {'Start': 0.34, 'Direction': 1.0}
        params['Right'] = {'Start': -0.34, 'Direction': -1.0}
    return params

def calculate_transforms_absolute(immat_string, start_x, direction_sign):
    """
    Calcule les positions absolues avec espacement bord-à-bord de 5 cm.

    Logique :
    - Lettre 0 : centre exactement à start_x
    - Lettre N : centre = start_x + (moitié_lettre_0) + somme(largeurs_complètes 1..N-1) + (N × SPACING) + (moitié_lettre_N)
    """
    transforms = []

    for i in range(len(immat_string)):
        if i == 0:
            # Première lettre : centre exactement à start_x
            transforms.append(start_x)
        else:
            # 1. Moitié de la première lettre (pour partir de son bord droit)
            w_first = CHAR_WIDTHS.get(immat_string[0], CHAR_WIDTHS['DEFAULT'])
            half_first = w_first / 2.0

            # 2. Somme des largeurs COMPLÈTES des lettres entre la première et l'actuelle
            sum_widths_middle = 0.0
            for j in range(1, i):
                sum_widths_middle += CHAR_WIDTHS.get(immat_string[j], CHAR_WIDTHS['DEFAULT'])

            # 3. Nombre d'espaces = nombre de lettres précédentes
            num_spaces = i

            # 4. Moitié de la largeur de la lettre actuelle
            w_curr = CHAR_WIDTHS.get(immat_string[i], CHAR_WIDTHS['DEFAULT'])
            half_curr = w_curr / 2.0

            # 5. Calcul de l'offset total par rapport au Start
            offset = half_first + sum_widths_middle + (num_spaces * SPACING) + half_curr

            # 6. Application de la direction (positif = droite, négatif = gauche)
            position = start_x + (offset * direction_sign)

            transforms.append(round(position, 4))

    return transforms

# --- CONFIG & COULEURS ---
def get_config_from_label(xml_root, target_label):
    print(f"   > Recherche Bookmark : '{target_label}'")
    for node in xml_root.findall(".//ConfigurationBookmark"):
        if node.get('label') == target_label:
            val = node.get('value')
            if val: return val
    print(f"     [ERREUR] Label '{target_label}' introuvable.")
    return None

def parse_colors_from_config(full_config_str):
    color_map = {}
    parts = full_config_str.split('/')
    for part in parts:
        if part.startswith("Exterior_Colors_Zone"):
            try:
                zone_key = part.split('.')[0].replace("Exterior_Colors_Zone", "").replace("+", "")
                values = part.split('.')[1].split('-')
                hex_candidates = [v for v in values if v.startswith('#')]
                if len(hex_candidates) >= 2: color_map[zone_key] = hex_candidates[1]
                elif len(hex_candidates) == 1: color_map[zone_key] = hex_candidates[0]
            except Exception: continue
    return color_map

def resolve_letter_colors(style_letter, paint_scheme_config_part, color_map):
    """
    Résout les couleurs des lettres selon le style et la config de peinture

    BUG FIX 05/12/2025: INVERSION DES LAYERS PAR L'API
    - Pour paire "A-D" : on veut Layer 0 = Zone A, Layer 1 = Zone D
    - Mais l'API applique Layer 0 = deuxième valeur, Layer 1 = première valeur
    - Donc on inverse l'attribution : c0 = z1, c1 = z0

    Layer 1 TOUJOURS envoyé (même si z0 = '0', utilise couleur de z1 dans ce cas)
    """
    try:
        segments = paint_scheme_config_part.split('.')[1].split('_')
        config_pairs = segments[1:]
        if len(config_pairs) < 5: return "#000000", "#FFFFFF", True

        # Mapping correct : A-E -> 0-4 (slanted), F-J -> 0-4 (straight)
        if style_letter <= 'E':
            style_idx = ord(style_letter) - ord('A')  # A=0, B=1, C=2, D=3, E=4
        else:
            style_idx = ord(style_letter) - ord('F')  # F=0, G=1, H=2, I=3, J=4

        if style_idx < 0 or style_idx >= 5: style_idx = 0

        target_pair = config_pairs[style_idx]
        z0, z1 = target_pair.split('-')

        # INVERSION : L'API interprète les layers à l'envers
        # Pour "A-D" : on veut Layer 0 = Zone A, Layer 1 = Zone D
        # Mais l'API applique Layer 0 = deuxième valeur, Layer 1 = première valeur
        # Donc on inverse l'attribution
        c0 = color_map.get(z1) if z1 != '0' else None  # Layer 0 = deuxième zone (z1)
        c1 = color_map.get(z0) if z0 != '0' else None  # Layer 1 = première zone (z0)

        # Layer 1 TOUJOURS défini (flag True)
        # Si z0 = '0', utiliser la couleur de z1 (= c0)
        has_layer1 = True
        if z0 == '0':
            c1 = c0  # Utiliser la couleur du Layer 0

        return c0, c1, has_layer1
    except Exception: return "#000000", "#FFFFFF", True

# --- MAIN ---
def generate():
    global DATABASE_ID

    print(f"=== GÉNÉRATEUR TBM {SCRIPT_VERSION} ===")

    # US-019: Sélection de la base de données (TBM 960 ou 980)
    # Liste des bases connues (peut être étendue)
    DATABASES = {
        "960": "8ad3eaf3-0547-4558-ae34-647f17c84e88",
        "980": "8ad3eaf3-0547-4558-ae34-647f17c84e88"  # Placeholder - à remplacer par la vraie ID du 980
    }

    print("\n--- SÉLECTION : BASE DE DONNÉES ---")
    print("  1. TBM 960 (par défaut)")
    print("  2. TBM 980")
    db_choice = input("Votre choix (1-2, défaut: 1) : ").strip() or "1"
    db_key = "960" if db_choice == "1" else "980"
    DATABASE_ID = DATABASES[db_key]
    print(f"-> Base de données sélectionnée : TBM {db_key} ({DATABASE_ID})")

    s_version = ask_user_choice("Modèle Avion", VERSION_LIST)
    s_scheme = ask_user_choice("Schéma Peinture", PAINT_SCHEMES_LIST)
    s_prestige = ask_user_choice("Intérieur", PRESTIGE_LIST)
    s_decor = ask_user_choice("Décor", list(DECORS_CONFIG.keys()))
    s_spinner = ask_user_choice("Hélice", SPINNER_LIST)
    
    print("\n--- TYPE DE POLICE ---")
    st_input = input("1. Slanted (Penché) / 2. Straight (Droit) : ")
    s_font_style = ask_user_choice("Style", STYLES_SLANTED) if st_input=="1" else ask_user_choice("Style", STYLES_STRAIGHT)

    s_immat = ask_immatriculation()
    img_width, img_height = ask_image_dimensions()

    print(f"\n[1/5] Récupération XML...")
    xml = get_database_xml(DATABASE_ID)
    
    try:
        gid = find_camera_group_id(xml, s_decor)
        anchors = extract_anchors(xml, s_scheme)
        print(f"[DEBUG] Anchors extraits: {anchors}")
    except ValueError as e:
        print(f"Erreur Config : {e}"); return

    # --- CALCUL ABSOLU ---
    # On calcule les positions finales (X) directement
    abs_x_left = calculate_transforms_absolute(s_immat, anchors['Left']['Start'], anchors['Left']['Direction'])
    abs_x_right = calculate_transforms_absolute(s_immat, anchors['Right']['Start'], anchors['Right']['Direction'])

    # Configs
    print(f"[2/5] Construction Configuration...")
    paint_config = get_config_from_label(xml, f"Exterior_{s_scheme}") or f"Exterior_PaintScheme.{s_scheme}"
    interior_config = get_config_from_label(xml, f"Interior_PrestigeSelection_{s_prestige}") or f"Interior_PrestigeSelection.{s_prestige}"
    decor_data = DECORS_CONFIG[s_decor]

    # US-023 à US-026 : Options dynamiques pour tablette, lunettes et portes
    print("\n--- OPTIONS ADDITIONNELLES (Appuyer sur Entrée pour valeurs par défaut) ---")
    tablet_state = input("Tablette (Open/Closed, défaut: Closed) : ").strip() or "Closed"
    sunglass_state = input("Lunettes de soleil (SunGlassON/SunGlassOFF, défaut: SunGlassOFF) : ").strip() or "SunGlassOFF"
    door_pilot_state = input("Porte pilote (Open/Closed, défaut: Closed) : ").strip() or "Closed"
    door_passenger_state = input("Porte passager (Open/Closed, défaut: Closed) : ").strip() or "Closed"

    config_parts = [
        f"Version.{s_version}",
        paint_config,
        interior_config,
        f"Decor.{decor_data['suffix']}",
        f"Position.{s_decor}",
        f"Exterior_Spinner.{s_spinner}",
        f"Tablet.{tablet_state}",                    # US-023: Dynamique
        f"SunGlass.{sunglass_state}",                # US-024: Dynamique
        f"Door_pilot.{door_pilot_state}",            # US-025: Dynamique
        f"Door_passenger.{door_passenger_state}"     # US-026: Dynamique
    ]
    full_config_str = "/".join(filter(None, config_parts))

    # Couleurs
    print(f"[3/5] Calcul Couleurs...")
    color_map = parse_colors_from_config(full_config_str)
    scheme_part = next((p for p in full_config_str.split('/') if p.startswith("Exterior_PaintScheme")), "")
    color_L0, color_L1, has_layer1 = resolve_letter_colors(s_font_style, scheme_part, color_map)

    # Matériaux
    materials_list = []
    multi_layers_list = []
    processed_chars = set()

    # Déterminer si le style est slanted (penché) ou straight (droit)
    is_slanted = s_font_style in STYLES_SLANTED

    for index, char in enumerate(s_immat):
        # Pour slanted : ajouter Left/Right, pour straight : pas d'orientation
        if is_slanted:
            texture_filename_left = f"Style_{s_font_style}_Left_{char}"
            texture_filename_right = f"Style_{s_font_style}_Right_{char}"
            materials_list.append({"name": f"RegL{index}", "filename": texture_filename_left})
            materials_list.append({"name": f"RegR{index}", "filename": texture_filename_right})

            # Multi-layers pour les deux orientations
            if char not in processed_chars:
                # Layer 0 (toujours présent si color_L0 existe)
                if color_L0:
                    multi_layers_list.append({"name": texture_filename_left, "layer": 0, "diffuseColor": color_L0})
                    multi_layers_list.append({"name": texture_filename_right, "layer": 0, "diffuseColor": color_L0})

                # Layer 1 : TOUJOURS envoyé (même si has_layer1 == False)
                # Si pas de Layer 1 défini (zone = "0"), utiliser la couleur du Layer 0
                final_color_L1 = color_L1 if (has_layer1 and color_L1) else color_L0
                if final_color_L1:
                    multi_layers_list.append({"name": texture_filename_left, "layer": 1, "diffuseColor": final_color_L1})
                    multi_layers_list.append({"name": texture_filename_right, "layer": 1, "diffuseColor": final_color_L1})
                processed_chars.add(char)
        else:
            # Straight : même texture pour gauche et droite
            texture_filename = f"Style_{s_font_style}_{char}"
            materials_list.append({"name": f"RegL{index}", "filename": texture_filename})
            materials_list.append({"name": f"RegR{index}", "filename": texture_filename})

            if char not in processed_chars:
                # Layer 0 (toujours présent si color_L0 existe)
                if color_L0:
                    multi_layers_list.append({"name": texture_filename, "layer": 0, "diffuseColor": color_L0})

                # Layer 1 : TOUJOURS envoyé (même si has_layer1 == False)
                # Si pas de Layer 1 défini (zone = "0"), utiliser la couleur du Layer 0
                final_color_L1 = color_L1 if (has_layer1 and color_L1) else color_L0
                if final_color_L1:
                    multi_layers_list.append({"name": texture_filename, "layer": 1, "diffuseColor": final_color_L1})
                processed_chars.add(char)

    # Surfaces (AVEC POSITION ABSOLUE)
    # Ici on injecte directement la valeur calculée dans 'translation.x'
    surfaces = []

    labels_L = []
    for i, abs_x in enumerate(abs_x_left):
        labels_L.append({"index": i, "translation": {"x": abs_x, "y": anchors['Y']}})
    surfaces.append({"tag": "RegL", "labels": labels_L})

    labels_R = []
    for i, abs_x in enumerate(abs_x_right):
        labels_R.append({"index": i, "translation": {"x": abs_x, "y": anchors['Y']}})
    surfaces.append({"tag": "RegR", "labels": labels_R})

    payload = {
        "scene": [{
            "database": DATABASE_ID,
            "configuration": full_config_str,
            "materials": materials_list,
            "materialMultiLayers": multi_layers_list,
            "surfaces": surfaces
        }],
        "mode": {"images": {"cameraGroup": gid}},
        "renderParameters": {"width": img_width, "height": img_height, "antialiasing": True, "superSampling": "2"},
        "encoder": {"jpeg": {"quality": 95}}
    }

    # Sauvegarde
    sub_folder = f"{s_version}_{s_immat}_{s_scheme}_{s_decor}_{img_width}x{img_height}"
    folder = os.path.join(OUTPUT_DIR, sub_folder)
    os.makedirs(folder, exist_ok=True)
    json_path = os.path.join(folder, "request.json")
    with open(json_path, 'w', encoding='utf-8') as f: json.dump(payload, f, indent=2)

    print(f"[4/5] Envoi API...")
    try:
        r = requests.post(f"{API_BASE_URL}/Snapshot", json=payload)
        if r.status_code == 200 and 'application/json' in r.headers.get('content-type', ''):
            data = r.json()
            if isinstance(data, list):
                print(f"[5/5] Téléchargement de {len(data)} images...")
                for i, item in enumerate(data):
                    if 'url' in item:
                        with open(os.path.join(folder, f"view_{i+1:02d}.jpg"), 'wb') as f:
                            f.write(requests.get(item['url']).content)
                print(f"\n[SUCCÈS] Terminé ! Dossier : {folder}")
        else:
            print(f"[ERREUR API] {r.status_code} : {r.text}")
    except Exception as e:
        print(f"[ERREUR] {e}")
        
    print(f"\n[INFO] Script Version: {SCRIPT_VERSION}")

if __name__ == "__main__":
    generate()