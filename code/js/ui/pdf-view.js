/**
 * @fileoverview Module de rendu de la vue PDF avec hotspots
 * @module ui/pdf-view
 * @version 1.0
 */

import { openFullscreen } from './modal.js';
import { downloadImage } from './download.js';
import { showSuccessToast, showError } from './loader.js';

/**
 * Constantes de style de base pour les hotspots
 */
const BASE_HOTSPOT_STYLES = {
    iconRadiusRatio: 0.003, // 0.3% de la largeur d'image
    iconStrokeWidthRatio: 0.001,
    iconStrokeColor: '#000000',
    iconFillColor: '#FFFFFF',
    lineStrokeWidthRatio: 0.001,
    lineStrokeColor: '#000000',
    labelFontSizeRatio: 0.012, // 1.2% de la largeur
    labelColorFontSizeRatio: 0.009, // 0.9% de la largeur
    labelSquareSizeRatio: 0.03, // 3% de la largeur
    labelSquareStrokeWidth: 1,
    labelSquareStrokeColor: '#000000',
    labelSquareInnerMargin: 2,
    labelSquareRadiusRatio: 0.004,
    labelTextOffsetRatio: 0.007
};

/**
 * Calcule les styles proportionnels en fonction de la taille de l'image
 * @param {number} width - Largeur de l'image
 * @returns {Object} Styles calculés
 */
function calculateStyles(width) {
    return {
        iconRadius: Math.max(width * BASE_HOTSPOT_STYLES.iconRadiusRatio, 3),
        iconStrokeWidth: Math.max(width * BASE_HOTSPOT_STYLES.iconStrokeWidthRatio, 1),
        iconStrokeColor: BASE_HOTSPOT_STYLES.iconStrokeColor,
        iconFillColor: BASE_HOTSPOT_STYLES.iconFillColor,
        lineStrokeWidth: Math.max(width * BASE_HOTSPOT_STYLES.lineStrokeWidthRatio, 1),
        lineStrokeColor: BASE_HOTSPOT_STYLES.lineStrokeColor,
        labelFontSize: Math.max(Math.round(width * BASE_HOTSPOT_STYLES.labelFontSizeRatio), 12),
        labelColorFontSize: Math.max(Math.round(width * BASE_HOTSPOT_STYLES.labelColorFontSizeRatio), 10),
        labelSquareSize: Math.max(Math.round(width * BASE_HOTSPOT_STYLES.labelSquareSizeRatio), 30),
        labelSquareStrokeWidth: BASE_HOTSPOT_STYLES.labelSquareStrokeWidth,
        labelSquareStrokeColor: BASE_HOTSPOT_STYLES.labelSquareStrokeColor,
        labelSquareInnerMargin: BASE_HOTSPOT_STYLES.labelSquareInnerMargin,
        labelSquareRadius: Math.max(Math.round(width * BASE_HOTSPOT_STYLES.labelSquareRadiusRatio), 4),
        labelTextOffset: Math.max(Math.round(width * BASE_HOTSPOT_STYLES.labelTextOffsetRatio), 8)
    };
}

/**
 * Affiche la vue PDF avec image + hotspots SVG overlay
 * @param {HTMLElement} container - Container pour l'affichage
 * @param {string} imageUrl - URL de l'image générée
 * @param {Array<Object>} hotspots - Hotspots complets [{name, colorName, position2D: {x, y}, visibility: "visible"}]
 */
export function renderPDFView(container, imageUrl, hotspots) {
    // Masquer les autres éléments du viewport (au lieu de les supprimer)
    const mosaicGrid = document.getElementById('mosaicGrid');
    const overviewMosaic = document.getElementById('overviewMosaic');
    const placeholder = container.querySelector('.viewport-placeholder');

    if (mosaicGrid) mosaicGrid.classList.add('hidden');
    if (overviewMosaic) overviewMosaic.classList.add('hidden');
    if (placeholder) placeholder.classList.add('hidden');

    // Supprimer l'ancien wrapper PDF s'il existe
    const oldWrapper = container.querySelector('.pdf-view-wrapper');
    if (oldWrapper) {
        oldWrapper.remove();
    }

    // Créer le wrapper relatif
    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-view-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.overflow = 'hidden';
    wrapper.dataset.url = imageUrl; // Pour le système de fullscreen

    // Créer l'image
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous'; // Permet l'export canvas depuis autre domaine
    img.src = imageUrl;
    img.alt = 'Vue PDF avec hotspots';
    img.style.display = 'block';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.cursor = 'pointer';

    // Événement click pour ouvrir en plein écran avec image composite (SVG bakés)
    img.addEventListener('click', async (e) => {
        // Ne pas déclencher si on clique sur le bouton download
        if (!e.target.classList.contains('download-btn')) {
            // Générer une image composite avec SVG bakés
            const compositeUrl = await generateCompositeImage(img, hotspots);

            // Remplacer temporairement l'image pour le fullscreen
            const originalSrc = img.src;
            img.src = compositeUrl;

            openFullscreen(0); // Index 0 car c'est la seule image

            // Restaurer l'image originale à la fermeture du modal
            const modal = document.getElementById('fullscreenModal');
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class' && modal.classList.contains('hidden')) {
                        img.src = originalSrc;
                        URL.revokeObjectURL(compositeUrl);
                        observer.disconnect();
                    }
                });
            });
            observer.observe(modal, { attributes: true });
        }
    });

    // Créer le bouton download (positionné en absolu dans le wrapper)
    const downloadBtn = document.createElement('button');
    downloadBtn.classList.add('download-btn');
    downloadBtn.innerHTML = '⬇';
    downloadBtn.setAttribute('aria-label', 'Télécharger cette image');
    downloadBtn.setAttribute('title', 'Télécharger cette image');
    downloadBtn.style.position = 'absolute';
    downloadBtn.style.top = '10px';
    downloadBtn.style.right = '10px';
    downloadBtn.style.zIndex = '100'; // Au-dessus du SVG
    downloadBtn.style.opacity = '0'; // Masqué par défaut
    downloadBtn.style.transition = 'opacity 0.2s';

    // Afficher le bouton au survol du wrapper
    wrapper.addEventListener('mouseenter', () => {
        downloadBtn.style.opacity = '1';
    });
    wrapper.addEventListener('mouseleave', () => {
        downloadBtn.style.opacity = '0';
    });

    // Event listener sur bouton download (stopPropagation pour éviter l'ouverture fullscreen)
    downloadBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const filename = 'vue_pdf_hotspots.png';
        try {
            // Générer l'image composite avec SVG bakés
            const compositeUrl = await generateCompositeImage(img, hotspots);
            await downloadImage(compositeUrl, filename);
            URL.revokeObjectURL(compositeUrl); // Nettoyer l'URL blob
            showSuccessToast('Image téléchargée avec succès !');
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            showError('Erreur lors du téléchargement de l\'image');
        }
    });

    // Fonction pour créer/recréer le SVG
    const updateSVG = () => {
        const imgWidth = img.offsetWidth;
        const imgHeight = img.offsetHeight;
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        // Calculer le ratio de scaling
        const scaleX = imgWidth / naturalWidth;
        const scaleY = imgHeight / naturalHeight;

        // Calculer la position de l'image dans le wrapper (à cause du centrage flex)
        // Utiliser offsetLeft/offsetTop au lieu de getBoundingClientRect pour plus de précision
        const offsetX = img.offsetLeft;
        const offsetY = img.offsetTop;

        // Supprimer l'ancien SVG s'il existe
        const oldSvg = wrapper.querySelector('svg');
        if (oldSvg) {
            oldSvg.remove();
        }

        // Créer le nouveau SVG overlay avec scaling
        // isSquare = true pour les vues 1:1 (index 1 et 2)
        const isSquare = !isMain;
        const svg = createSVGOverlay(imgWidth, imgHeight, hotspots, scaleX, scaleY, isSquare);

        // Positionner le SVG exactement sur l'image
        svg.style.left = `${offsetX}px`;
        svg.style.top = `${offsetY}px`;

        wrapper.appendChild(svg);
    };

    // Attendre que l'image soit chargée pour créer le SVG initial
    img.onload = () => {
        updateSVG();

        // Observer les changements de taille de l'image
        const resizeObserver = new ResizeObserver(() => {
            updateSVG();
        });
        resizeObserver.observe(img);
    };

    // Assembler les éléments
    wrapper.appendChild(img);
    wrapper.appendChild(downloadBtn);
    container.appendChild(wrapper);
}

/**
 * Crée le SVG overlay avec hotspots, lignes et labels
 * @param {number} width - Largeur de l'image affichée
 * @param {number} height - Hauteur de l'image affichée
 * @param {Array<Object>} hotspots - Hotspots complets [{name, colorName, position2D: {x, y}, visibility}]
 * @param {number} scaleX - Ratio de scaling X (width affichée / width originale)
 * @param {number} scaleY - Ratio de scaling Y (height affichée / height originale)
 * @param {boolean} isSquare - Si true, placement dans les 4 coins pour vues 1:1
 * @returns {SVGElement} SVG overlay
 */
function createSVGOverlay(width, height, hotspots, scaleX, scaleY, isSquare = false) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';

    // Calculer les styles proportionnels
    const styles = calculateStyles(width);

    // Filtrer et préparer les hotspots visibles avec leurs positions scalées
    const visibleHotspots = [];
    hotspots.forEach((hotspot, index) => {
        // Filtrer les hotspots non visibles
        // On n'affiche QUE si visibility est true, "Visible" ou "visible"
        const isVisible = hotspot.visibility === true ||
                         hotspot.visibility === 'Visible' ||
                         hotspot.visibility === 'visible';

        if (!isVisible) {
            return; // Ignorer si false, "Hidden", "Occluded", etc.
        }

        if (!hotspot.position2D) {
            return;
        }

        const pos2D = {
            x: hotspot.position2D.x * scaleX,
            y: hotspot.position2D.y * scaleY
        };

        visibleHotspots.push({
            data: hotspot,
            pos2D: pos2D,
            originalIndex: index
        });
    });

    // === LOGIQUE SPÉCIFIQUE POUR VUES CARRÉES (1:1) ===
    if (isSquare) {
        // Séparer les hotspots par côté (gauche/droite)
        const leftHotspots = [];
        const rightHotspots = [];

        visibleHotspots.forEach((hotspot) => {
            if (hotspot.pos2D.x < width / 2) {
                leftHotspots.push(hotspot);
            } else {
                rightHotspots.push(hotspot);
            }
        });

        // Trier chaque côté par Y (haut vers bas)
        leftHotspots.sort((a, b) => a.pos2D.y - b.pos2D.y);
        rightHotspots.sort((a, b) => a.pos2D.y - b.pos2D.y);

        // Répartir équitablement entre les 3 zones de chaque côté
        const zones = {
            topLeft: [],
            topRight: [],
            middleLeft: [],
            middleRight: [],
            bottomLeft: [],
            bottomRight: []
        };

        // Côté gauche : répartir en 3 tiers
        const leftCount = leftHotspots.length;
        const leftThird = Math.ceil(leftCount / 3);
        leftHotspots.forEach((hotspot, index) => {
            if (index < leftThird) {
                zones.topLeft.push(hotspot);
            } else if (index < leftThird * 2) {
                zones.middleLeft.push(hotspot);
            } else {
                zones.bottomLeft.push(hotspot);
            }
        });

        // Côté droit : répartir en 3 tiers
        const rightCount = rightHotspots.length;
        const rightThird = Math.ceil(rightCount / 3);
        rightHotspots.forEach((hotspot, index) => {
            if (index < rightThird) {
                zones.topRight.push(hotspot);
            } else if (index < rightThird * 2) {
                zones.middleRight.push(hotspot);
            } else {
                zones.bottomRight.push(hotspot);
            }
        });

        // Définir les 6 zones fixes avec padding
        const padding = Math.min(width, height) * 0.05;
        const middleY = height * 0.55; // Zone milieu à 55% de hauteur
        const cornerSlots = {
            topLeft: { x: padding, y: padding },
            topRight: { x: width - padding, y: padding },
            middleLeft: { x: padding, y: middleY },
            middleRight: { x: width - padding, y: middleY },
            bottomLeft: { x: padding, y: height - padding },
            bottomRight: { x: width - padding, y: height - padding }
        };

        // Dessiner chaque zone
        Object.keys(zones).forEach(zoneKey => {
            const hotspotsInZone = zones[zoneKey];
            if (hotspotsInZone.length === 0) return;

            const cornerPos = cornerSlots[zoneKey];
            const align = zoneKey.includes('Right') ? 'end' : 'start';

            // Dessiner les icônes pour tous les hotspots de la zone
            hotspotsInZone.forEach((hotspot) => {
                // Icône (cercle)
                const icon = createHotspotIcon(hotspot.pos2D.x, hotspot.pos2D.y, styles);
                svg.appendChild(icon);
            });

            // Créer un label groupé pour tous les hotspots de cette zone (avec lignes)
            const isBottom = zoneKey.includes('bottom');
            const labelGroup = createCornerLabel(cornerPos, hotspotsInZone, styles, align, isBottom);
            svg.appendChild(labelGroup);
        });

        return svg;
    }

    // === LOGIQUE ORIGINALE POUR VUE 16:9 ===
    // Définir les 6 emplacements fixes
    const slots = getLabelSlots(width, height);
    const usedSlots = [];

    // Trier les hotspots par Y (haut vers bas), puis par X (gauche vers droite)
    visibleHotspots.sort((a, b) => {
        if (Math.abs(a.pos2D.y - b.pos2D.y) > 5) {
            return a.pos2D.y - b.pos2D.y;
        }
        return a.pos2D.x - b.pos2D.x;
    });

    const visibleCount = visibleHotspots.length;

    // Séparer en deux groupes : haut et bas
    const topHotspots = [];
    const bottomHotspots = [];

    visibleHotspots.forEach((hotspot, sortedIndex) => {
        const isTopHalf = sortedIndex < visibleCount / 2;
        if (isTopHalf) {
            topHotspots.push(hotspot);
        } else {
            bottomHotspots.push(hotspot);
        }
    });

    // Trier chaque groupe par X (gauche vers droite) pour éviter croisements
    topHotspots.sort((a, b) => a.pos2D.x - b.pos2D.x);
    bottomHotspots.sort((a, b) => a.pos2D.x - b.pos2D.x);

    // Attribuer les slots en ordre horizontal
    const allHotspotsSorted = [...topHotspots, ...bottomHotspots];

    // Traiter chaque hotspot
    allHotspotsSorted.forEach((hotspot) => {
        // Déterminer si ce hotspot est dans le groupe haut ou bas
        const isTopHalf = topHotspots.includes(hotspot);

        // Choisir l'emplacement fixe
        const labelSlot = chooseBestSlot(hotspot.pos2D, slots, usedSlots, isTopHalf);
        usedSlots.push(labelSlot.id);

        // Dessiner la ligne entre icône et label
        const line = createLine(hotspot.pos2D, labelSlot, styles);
        svg.appendChild(line);

        // Dessiner l'icône (cercle)
        const icon = createHotspotIcon(hotspot.pos2D.x, hotspot.pos2D.y, styles);
        svg.appendChild(icon);

        // Dessiner le label (nom + couleur)
        const label = createLabel(labelSlot, hotspot.data, styles);
        svg.appendChild(label);
    });

    return svg;
}

/**
 * Crée une icône de hotspot (cercle noir/blanc)
 * @param {number} x - Position X
 * @param {number} y - Position Y
 * @param {Object} styles - Styles calculés
 * @returns {SVGElement} Groupe SVG avec cercle
 */
function createHotspotIcon(x, y, styles) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const group = document.createElementNS(svgNS, 'g');

    // Cercle intérieur (blanc)
    const innerCircle = document.createElementNS(svgNS, 'circle');
    innerCircle.setAttribute('cx', x);
    innerCircle.setAttribute('cy', y);
    innerCircle.setAttribute('r', styles.iconRadius);
    innerCircle.setAttribute('fill', styles.iconFillColor);
    innerCircle.setAttribute('stroke', styles.iconStrokeColor);
    innerCircle.setAttribute('stroke-width', styles.iconStrokeWidth);

    group.appendChild(innerCircle);
    return group;
}

/**
 * Crée une ligne entre icône et label
 * @param {Object} start - Position de départ {x, y}
 * @param {Object} end - Position d'arrivée {x, y}
 * @param {Object} styles - Styles calculés
 * @returns {SVGElement} Ligne SVG
 */
function createLine(start, end, styles) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', start.x);
    line.setAttribute('y1', start.y);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('stroke', styles.lineStrokeColor);
    line.setAttribute('stroke-width', styles.lineStrokeWidth);
    return line;
}

/**
 * Crée un label (nom zone + couleur)
 * @param {Object} position - Position {x, y, anchor}
 * @param {Object} data - Données {name, colorName, colorHtml}
 * @param {Object} styles - Styles calculés
 * @returns {SVGElement} Groupe SVG avec carré coloré + texte
 */
function createLabel(position, data, styles) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const group = document.createElementNS(svgNS, 'g');

    const squareSize = styles.labelSquareSize;
    const margin = styles.labelSquareInnerMargin;
    const halfSize = squareSize / 2;

    // Carré extérieur avec bordure noire et coins arrondis
    const outerSquare = document.createElementNS(svgNS, 'rect');
    outerSquare.setAttribute('x', position.x - halfSize);
    outerSquare.setAttribute('y', position.y - halfSize);
    outerSquare.setAttribute('width', squareSize);
    outerSquare.setAttribute('height', squareSize);
    outerSquare.setAttribute('rx', styles.labelSquareRadius);
    outerSquare.setAttribute('ry', styles.labelSquareRadius);
    outerSquare.setAttribute('fill', '#FFFFFF');
    outerSquare.setAttribute('stroke', styles.labelSquareStrokeColor);
    outerSquare.setAttribute('stroke-width', styles.labelSquareStrokeWidth);

    // Carré intérieur coloré avec marge de 2px et coins arrondis
    const innerSize = squareSize - (margin * 2);
    const innerRadius = styles.labelSquareRadius - margin;
    const innerSquare = document.createElementNS(svgNS, 'rect');
    innerSquare.setAttribute('x', position.x - halfSize + margin);
    innerSquare.setAttribute('y', position.y - halfSize + margin);
    innerSquare.setAttribute('width', innerSize);
    innerSquare.setAttribute('height', innerSize);
    innerSquare.setAttribute('rx', innerRadius);
    innerSquare.setAttribute('ry', innerRadius);
    innerSquare.setAttribute('fill', data.colorHtml || '#CCCCCC');

    // Calculer la position du texte selon l'alignement
    let textX;
    let textAnchor;
    if (position.anchor === 'end') {
        // Slot à droite : texte à gauche du carré
        textX = position.x - halfSize - styles.labelTextOffset;
        textAnchor = 'end';
    } else {
        // Slots à gauche et centre : texte à droite du carré
        textX = position.x + halfSize + styles.labelTextOffset;
        textAnchor = 'start';
    }

    // Position Y alignée sur le haut du carré
    const textYTop = position.y - halfSize;

    // Texte nom zone (en gras) - aligné en haut du carré
    const nameText = document.createElementNS(svgNS, 'text');
    nameText.setAttribute('x', textX);
    nameText.setAttribute('y', textYTop);
    nameText.setAttribute('font-size', styles.labelFontSize);
    nameText.setAttribute('font-weight', 'bold');
    nameText.setAttribute('fill', '#000000');
    nameText.setAttribute('text-anchor', textAnchor);
    nameText.setAttribute('dominant-baseline', 'hanging');
    nameText.textContent = data.name;

    // Texte nom couleur (depuis config actuelle) - en dessous du titre
    const colorText = document.createElementNS(svgNS, 'text');
    colorText.setAttribute('x', textX);
    colorText.setAttribute('y', textYTop + styles.labelFontSize + 4);
    colorText.setAttribute('font-size', styles.labelColorFontSize);
    colorText.setAttribute('fill', '#000000');
    colorText.setAttribute('text-anchor', textAnchor);
    colorText.setAttribute('dominant-baseline', 'hanging');
    colorText.textContent = data.colorName || 'Unknown';

    group.appendChild(outerSquare);
    group.appendChild(innerSquare);
    group.appendChild(nameText);
    group.appendChild(colorText);

    return group;
}

/**
 * Crée un label groupé dans un coin (pour vues 1:1) avec lignes
 * @param {Object} cornerPos - Position du coin {x, y}
 * @param {Array} hotspots - Array de hotspots dans ce quadrant
 * @param {Object} styles - Styles calculés
 * @param {string} align - Alignement 'start' ou 'end'
 * @param {boolean} isBottom - Si true, empiler vers le haut au lieu de vers le bas
 * @returns {SVGElement} Groupe SVG avec lignes, carrés colorés empilés + textes
 */
function createCornerLabel(cornerPos, hotspots, styles, align, isBottom = false) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const group = document.createElementNS(svgNS, 'g');

    const squareSize = styles.labelSquareSize;
    const margin = styles.labelSquareInnerMargin;
    const spacing = 4; // Espace entre chaque hotspot

    let offsetY = 0;

    hotspots.forEach((hotspot, index) => {
        const data = hotspot.data;

        // Calculer la hauteur totale (carré + texte)
        const textHeight = styles.labelFontSize + 4 + styles.labelColorFontSize + 4;
        const totalHeight = squareSize + textHeight;

        // Si zone bottom, le BAS du texte doit être à cornerPos.y
        let baseY;
        if (isBottom) {
            baseY = cornerPos.y - totalHeight + offsetY; // offsetY sera négatif pour les suivants
        } else {
            baseY = cornerPos.y + offsetY;
        }

        // Position du carré au bord, texte en dessous du carré
        let squareX, textX, textAnchor;

        // Carré toujours au bord (selon align)
        if (align === 'end') {
            // Zone Right : carré au bord droit
            squareX = cornerPos.x - squareSize - (styles.labelTextOffset * 0.25);
        } else {
            // Zone Left : carré au bord gauche
            squareX = cornerPos.x + (styles.labelTextOffset * 0.25);
        }

        // Texte centré horizontalement sous le carré
        textX = squareX + squareSize / 2;
        textAnchor = 'middle';

        // Créer ligne vers le centre du carré
        const squareCenterX = squareX + squareSize / 2;
        const squareCenterY = baseY + squareSize / 2;
        const line = createLine(hotspot.pos2D, { x: squareCenterX, y: squareCenterY }, styles);
        group.appendChild(line);

        // Carré extérieur avec bordure noire
        const outerSquare = document.createElementNS(svgNS, 'rect');
        outerSquare.setAttribute('x', squareX);
        outerSquare.setAttribute('y', baseY);
        outerSquare.setAttribute('width', squareSize);
        outerSquare.setAttribute('height', squareSize);
        outerSquare.setAttribute('rx', styles.labelSquareRadius);
        outerSquare.setAttribute('ry', styles.labelSquareRadius);
        outerSquare.setAttribute('fill', '#FFFFFF');
        outerSquare.setAttribute('stroke', styles.labelSquareStrokeColor);
        outerSquare.setAttribute('stroke-width', styles.labelSquareStrokeWidth);

        // Carré intérieur coloré
        const innerSize = squareSize - (margin * 2);
        const innerRadius = styles.labelSquareRadius - margin;
        const innerSquare = document.createElementNS(svgNS, 'rect');
        innerSquare.setAttribute('x', squareX + margin);
        innerSquare.setAttribute('y', baseY + margin);
        innerSquare.setAttribute('width', innerSize);
        innerSquare.setAttribute('height', innerSize);
        innerSquare.setAttribute('rx', innerRadius);
        innerSquare.setAttribute('ry', innerRadius);
        innerSquare.setAttribute('fill', data.colorHtml || '#CCCCCC');

        // Texte nom zone (en gras) - en dessous du carré
        const textYStart = baseY + squareSize + 4; // 4px d'espace sous le carré
        const nameText = document.createElementNS(svgNS, 'text');
        nameText.setAttribute('x', textX);
        nameText.setAttribute('y', textYStart);
        nameText.setAttribute('font-size', styles.labelFontSize);
        nameText.setAttribute('font-weight', 'bold');
        nameText.setAttribute('fill', '#000000');
        nameText.setAttribute('text-anchor', textAnchor);
        nameText.setAttribute('dominant-baseline', 'hanging');
        nameText.textContent = data.name;

        // Texte nom couleur
        const colorText = document.createElementNS(svgNS, 'text');
        colorText.setAttribute('x', textX);
        colorText.setAttribute('y', textYStart + styles.labelFontSize + 4);
        colorText.setAttribute('font-size', styles.labelColorFontSize);
        colorText.setAttribute('fill', '#000000');
        colorText.setAttribute('text-anchor', textAnchor);
        colorText.setAttribute('dominant-baseline', 'hanging');
        colorText.textContent = data.colorName || 'Unknown';

        group.appendChild(outerSquare);
        group.appendChild(innerSquare);
        group.appendChild(nameText);
        group.appendChild(colorText);

        // Incrémenter offset pour le prochain hotspot (carré + texte + spacing)
        const heightWithSpacing = totalHeight + spacing;

        // Si bottom, on empile vers le haut (offset négatif)
        if (isBottom) {
            offsetY -= totalHeight;
        } else {
            offsetY += totalHeight;
        }
    });

    return group;
}

/**
 * Définit les 6 emplacements fixes pour les labels
 * 3 en haut (gauche, centre, droite) + 3 en bas (gauche, centre, droite)
 * @param {number} imgWidth - Largeur de l'image
 * @param {number} imgHeight - Hauteur de l'image
 * @returns {Array<Object>} 6 positions fixes [{x, y, anchor, id}]
 */
function getLabelSlots(imgWidth, imgHeight) {
    // Marges proportionnelles à la taille de l'image (3% pour vertical, 8% pour horizontal)
    const marginTop = Math.max(imgHeight * 0.03, 30);
    const marginBottom = Math.max(imgHeight * 0.03, 30);
    const marginSide = Math.max(imgWidth * 0.08, 80);

    return [
        // Haut gauche
        { id: 'top-left', x: marginSide, y: marginTop, anchor: 'start' },
        // Haut centre
        { id: 'top-center', x: imgWidth / 2, y: marginTop, anchor: 'middle' },
        // Haut droite
        { id: 'top-right', x: imgWidth - marginSide, y: marginTop, anchor: 'end' },
        // Bas gauche
        { id: 'bottom-left', x: marginSide, y: imgHeight - marginBottom, anchor: 'start' },
        // Bas centre
        { id: 'bottom-center', x: imgWidth / 2, y: imgHeight - marginBottom, anchor: 'middle' },
        // Bas droite
        { id: 'bottom-right', x: imgWidth - marginSide, y: imgHeight - marginBottom, anchor: 'end' }
    ];
}

/**
 * Choisit l'emplacement fixe le plus proche de l'icône
 * @param {Object} iconPos - Position de l'icône {x, y}
 * @param {Array<Object>} slots - Emplacements disponibles
 * @param {Array<string>} usedSlots - Emplacements déjà utilisés
 * @param {boolean} isTopHalf - true si le hotspot est dans la première moitié du tri (haut)
 * @returns {Object} Emplacement choisi {x, y, anchor, id}
 */
function chooseBestSlot(iconPos, slots, usedSlots, isTopHalf) {
    // Filtrer les emplacements par zone verticale (top ou bottom)
    const slotsInZone = slots.filter(slot => {
        const isTopSlot = slot.id.startsWith('top-');
        return isTopSlot === isTopHalf;
    });

    // Filtrer les emplacements déjà utilisés
    const availableSlots = slotsInZone.filter(slot => !usedSlots.includes(slot.id));

    // Si plus d'emplacements dans la zone, chercher dans toute l'image
    if (availableSlots.length === 0) {
        const anyAvailable = slots.filter(slot => !usedSlots.includes(slot.id));
        if (anyAvailable.length === 0) {
            return slots[0];
        }
        return anyAvailable[0];
    }

    // Trouver l'emplacement le plus proche horizontalement
    let bestSlot = availableSlots[0];
    let minDistance = Infinity;

    for (const slot of availableSlots) {
        // Priorité à la distance horizontale
        const distance = Math.abs(slot.x - iconPos.x);

        if (distance < minDistance) {
            minDistance = distance;
            bestSlot = slot;
        }
    }

    return bestSlot;
}

/**
 * Génère une image composite (PNG) avec l'image de base + les SVG hotspots bakés dessus
 * @param {HTMLImageElement} img - Image source
 * @param {Array<Object>} hotspots - Hotspots complets
 * @returns {Promise<string>} URL blob de l'image composite
 */
async function generateCompositeImage(img, hotspots, isSquare = false) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Utiliser les dimensions naturelles de l'image (full size)
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image de base
        ctx.drawImage(img, 0, 0, width, height);

        // Pas de scaling car on travaille en full size
        const scaleX = 1;
        const scaleY = 1;

        // Calculer les styles proportionnels pour le full size
        const styles = calculateStyles(width);

        // Filtrer et préparer les hotspots visibles
        const visibleHotspots = [];
        hotspots.forEach((hotspot, index) => {
            // Filtrer les hotspots non visibles
            // On n'affiche QUE si visibility est true, "Visible" ou "visible"
            const isVisible = hotspot.visibility === true ||
                             hotspot.visibility === 'Visible' ||
                             hotspot.visibility === 'visible';

            if (!isVisible) {
                return; // Ignorer si false, "Hidden", "Occluded", etc.
            }

            if (!hotspot.position2D) {
                return;
            }

            const pos2D = {
                x: hotspot.position2D.x * scaleX,
                y: hotspot.position2D.y * scaleY
            };

            visibleHotspots.push({
                data: hotspot,
                pos2D: pos2D,
                originalIndex: index
            });
        });

        // === LOGIQUE SPÉCIFIQUE POUR VUES CARRÉES (1:1) ===
        if (isSquare) {
            // Séparer les hotspots par côté (gauche/droite)
            const leftHotspots = [];
            const rightHotspots = [];

            visibleHotspots.forEach((hotspot) => {
                if (hotspot.pos2D.x < width / 2) {
                    leftHotspots.push(hotspot);
                } else {
                    rightHotspots.push(hotspot);
                }
            });

            // Trier chaque côté par Y (haut vers bas)
            leftHotspots.sort((a, b) => a.pos2D.y - b.pos2D.y);
            rightHotspots.sort((a, b) => a.pos2D.y - b.pos2D.y);

            // Répartir équitablement entre les 3 zones de chaque côté
            const zones = {
                topLeft: [],
                topRight: [],
                middleLeft: [],
                middleRight: [],
                bottomLeft: [],
                bottomRight: []
            };

            // Côté gauche : répartir en 3 tiers
            const leftCount = leftHotspots.length;
            const leftThird = Math.ceil(leftCount / 3);
            leftHotspots.forEach((hotspot, index) => {
                if (index < leftThird) {
                    zones.topLeft.push(hotspot);
                } else if (index < leftThird * 2) {
                    zones.middleLeft.push(hotspot);
                } else {
                    zones.bottomLeft.push(hotspot);
                }
            });

            // Côté droit : répartir en 3 tiers
            const rightCount = rightHotspots.length;
            const rightThird = Math.ceil(rightCount / 3);
            rightHotspots.forEach((hotspot, index) => {
                if (index < rightThird) {
                    zones.topRight.push(hotspot);
                } else if (index < rightThird * 2) {
                    zones.middleRight.push(hotspot);
                } else {
                    zones.bottomRight.push(hotspot);
                }
            });

            // Définir les 6 zones fixes avec padding
            const padding = Math.min(width, height) * 0.05;
            const middleY = height * 0.55; // Zone milieu à 55% de hauteur
            const cornerSlots = {
                topLeft: { x: padding, y: padding },
                topRight: { x: width - padding, y: padding },
                middleLeft: { x: padding, y: middleY },
                middleRight: { x: width - padding, y: middleY },
                bottomLeft: { x: padding, y: height - padding },
                bottomRight: { x: width - padding, y: height - padding }
            };

            // Dessiner chaque zone
            Object.keys(zones).forEach(zoneKey => {
                const hotspotsInZone = zones[zoneKey];
                if (hotspotsInZone.length === 0) return;

                const cornerPos = cornerSlots[zoneKey];
                const align = zoneKey.includes('Right') ? 'end' : 'start';
                const isBottom = zoneKey.includes('bottom');

                // Dessiner les icônes pour tous les hotspots de la zone
                hotspotsInZone.forEach((hotspot) => {
                    // Icône (cercle)
                    drawHotspotIconOnCanvas(ctx, hotspot.pos2D.x, hotspot.pos2D.y, styles);
                });

                // Créer un label groupé pour tous les hotspots de cette zone (avec lignes)
                drawCornerLabelOnCanvas(ctx, cornerPos, hotspotsInZone, styles, align, isBottom);
            });

            // Convertir le canvas en blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                } else {
                    reject(new Error('Échec de la génération de l\'image composite'));
                }
            }, 'image/png');

            return;
        }

        // === LOGIQUE ORIGINALE POUR VUE 16:9 ===
        // Calculer les slots pour les labels
        const slots = getLabelSlots(width, height);
        const usedSlots = [];

        // Trier les hotspots
        visibleHotspots.sort((a, b) => {
            if (Math.abs(a.pos2D.y - b.pos2D.y) > 5) {
                return a.pos2D.y - b.pos2D.y;
            }
            return a.pos2D.x - b.pos2D.x;
        });

        const visibleCount = visibleHotspots.length;

        // Séparer en deux groupes : haut et bas
        const topHotspots = [];
        const bottomHotspots = [];

        visibleHotspots.forEach((hotspot, sortedIndex) => {
            const isTopHalf = sortedIndex < visibleCount / 2;
            if (isTopHalf) {
                topHotspots.push(hotspot);
            } else {
                bottomHotspots.push(hotspot);
            }
        });

        // Trier chaque groupe par X (gauche vers droite) pour éviter croisements
        topHotspots.sort((a, b) => a.pos2D.x - b.pos2D.x);
        bottomHotspots.sort((a, b) => a.pos2D.x - b.pos2D.x);

        // Attribuer les slots en ordre horizontal
        const allHotspotsSorted = [...topHotspots, ...bottomHotspots];

        // Dessiner chaque hotspot
        allHotspotsSorted.forEach((hotspot) => {
            // Déterminer si ce hotspot est dans le groupe haut ou bas
            const isTopHalf = topHotspots.includes(hotspot);

            const labelSlot = chooseBestSlot(hotspot.pos2D, slots, usedSlots, isTopHalf);
            usedSlots.push(labelSlot.id);

            // Dessiner la ligne
            drawLineOnCanvas(ctx, hotspot.pos2D, labelSlot, styles);

            // Dessiner l'icône
            drawHotspotIconOnCanvas(ctx, hotspot.pos2D.x, hotspot.pos2D.y, styles);

            // Dessiner le label
            drawLabelOnCanvas(ctx, labelSlot, hotspot.data, styles);
        });

        // Convertir le canvas en blob
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                resolve(url);
            } else {
                reject(new Error('Échec de la génération de l\'image composite'));
            }
        }, 'image/png');
    });
}

/**
 * Dessine une ligne sur le canvas
 */
function drawLineOnCanvas(ctx, start, end, styles) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = styles.lineStrokeColor;
    ctx.lineWidth = styles.lineStrokeWidth;
    ctx.stroke();
}

/**
 * Dessine une icône hotspot sur le canvas
 */
function drawHotspotIconOnCanvas(ctx, x, y, styles) {
    // Cercle avec bordure noire et fond blanc
    ctx.beginPath();
    ctx.arc(x, y, styles.iconRadius, 0, 2 * Math.PI);
    ctx.fillStyle = styles.iconFillColor;
    ctx.fill();
    ctx.strokeStyle = styles.iconStrokeColor;
    ctx.lineWidth = styles.iconStrokeWidth;
    ctx.stroke();
}

/**
 * Dessine un label (carré coloré + textes) sur le canvas
 */
function drawLabelOnCanvas(ctx, position, data, styles) {
    const squareSize = styles.labelSquareSize;
    const margin = styles.labelSquareInnerMargin;
    const halfSize = squareSize / 2;

    // Carré extérieur avec bordure noire et coins arrondis
    const outerX = position.x - halfSize;
    const outerY = position.y - halfSize;
    const radius = styles.labelSquareRadius;

    ctx.beginPath();
    ctx.roundRect(outerX, outerY, squareSize, squareSize, radius);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = styles.labelSquareStrokeColor;
    ctx.lineWidth = styles.labelSquareStrokeWidth;
    ctx.stroke();

    // Carré intérieur coloré
    const innerSize = squareSize - (margin * 2);
    const innerRadius = radius - margin;
    const innerX = outerX + margin;
    const innerY = outerY + margin;

    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerSize, innerSize, innerRadius);
    ctx.fillStyle = data.colorHtml || '#CCCCCC';
    ctx.fill();

    // Calculer la position du texte selon l'alignement
    let textX;
    let textAlign;
    if (position.anchor === 'end') {
        // Slot à droite : texte à gauche du carré
        textX = position.x - halfSize - styles.labelTextOffset;
        textAlign = 'right';
    } else {
        // Slots à gauche et centre : texte à droite du carré
        textX = position.x + halfSize + styles.labelTextOffset;
        textAlign = 'left';
    }

    // Position Y alignée sur le haut du carré
    const textYTop = position.y - halfSize;

    // Texte nom zone (en gras) - aligné en haut du carré
    ctx.font = `bold ${styles.labelFontSize}px Arial`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'top';
    ctx.fillText(data.name, textX, textYTop);

    // Texte nom couleur - en dessous du titre
    ctx.font = `${styles.labelColorFontSize}px Arial`;
    ctx.fillText(data.colorName || 'Unknown', textX, textYTop + styles.labelFontSize + 4);
}

/**
 * Dessine un label groupé dans un coin sur le canvas (pour vues 1:1) avec lignes
 * @param {CanvasRenderingContext2D} ctx - Contexte Canvas
 * @param {Object} cornerPos - Position du coin {x, y}
 * @param {Array} hotspots - Array de hotspots dans ce quadrant
 * @param {Object} styles - Styles calculés
 * @param {string} align - Alignement 'start' ou 'end'
 * @param {boolean} isBottom - True si c'est une zone bottom (bottomLeft ou bottomRight)
 */
function drawCornerLabelOnCanvas(ctx, cornerPos, hotspots, styles, align, isBottom = false) {
    const squareSize = styles.labelSquareSize;
    const margin = styles.labelSquareInnerMargin;
    const spacing = 4; // Espace entre chaque hotspot

    let offsetY = 0;

    hotspots.forEach((hotspot) => {
        const data = hotspot.data;

        // Calculer la hauteur totale (carré + texte)
        const textHeight = styles.labelFontSize + 4 + styles.labelColorFontSize + 4;
        const totalHeight = squareSize + textHeight;

        // Si zone bottom, le BAS du texte doit être à cornerPos.y
        let baseY;
        if (isBottom) {
            baseY = cornerPos.y - totalHeight + offsetY; // offsetY sera négatif pour les suivants
        } else {
            baseY = cornerPos.y + offsetY;
        }

        // Position du carré au bord, texte en dessous du carré
        let squareX, textX, textAlign;

        // Carré toujours au bord (selon align)
        if (align === 'end') {
            // Zone Right : carré au bord droit
            squareX = cornerPos.x - squareSize - (styles.labelTextOffset * 0.25);
        } else {
            // Zone Left : carré au bord gauche
            squareX = cornerPos.x + (styles.labelTextOffset * 0.25);
        }

        // Texte centré horizontalement sous le carré
        textX = squareX + squareSize / 2;
        textAlign = 'center';

        // Créer ligne vers le centre du carré
        const squareCenterX = squareX + squareSize / 2;
        const squareCenterY = baseY + squareSize / 2;
        drawLineOnCanvas(ctx, hotspot.pos2D, { x: squareCenterX, y: squareCenterY }, styles);

        // Carré extérieur avec bordure noire
        const radius = styles.labelSquareRadius;
        ctx.beginPath();
        ctx.roundRect(squareX, baseY, squareSize, squareSize, radius);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = styles.labelSquareStrokeColor;
        ctx.lineWidth = styles.labelSquareStrokeWidth;
        ctx.stroke();

        // Carré intérieur coloré
        const innerSize = squareSize - (margin * 2);
        const innerRadius = radius - margin;
        ctx.beginPath();
        ctx.roundRect(squareX + margin, baseY + margin, innerSize, innerSize, innerRadius);
        ctx.fillStyle = data.colorHtml || '#CCCCCC';
        ctx.fill();

        // Texte nom zone (en gras) - en dessous du carré
        const textYStart = baseY + squareSize + 4; // 4px d'espace sous le carré
        ctx.font = `bold ${styles.labelFontSize}px Arial`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'top';
        ctx.fillText(data.name, textX, textYStart);

        // Texte nom couleur
        ctx.font = `${styles.labelColorFontSize}px Arial`;
        ctx.fillText(data.colorName || 'Unknown', textX, textYStart + styles.labelFontSize + 4);

        // Incrémenter offset pour le prochain hotspot (carré + texte + spacing)
        const heightWithSpacing = totalHeight + spacing;

        // Si bottom, on empile vers le haut (offset négatif)
        if (isBottom) {
            offsetY -= totalHeight;
        } else {
            offsetY += totalHeight;
        }
    });
}

/**
 * Affiche la mosaïque PDF avec 3 vues (images + hotspots SVG overlay)
 * @param {HTMLElement} container - Container pour l'affichage
 * @param {Array<Object>} viewsData - Array de 3 objets {imageUrl, hotspots, cameraId, cameraName}
 */
export function renderPDFMosaic(container, viewsData) {
    if (!viewsData || viewsData.length !== 3) {
        console.error('renderPDFMosaic nécessite exactement 3 vues');
        return;
    }

    // Masquer les autres éléments du viewport
    const mosaicGrid = document.getElementById('mosaicGrid');
    const overviewMosaic = document.getElementById('overviewMosaic');
    const placeholder = container.querySelector('.viewport-placeholder');

    if (mosaicGrid) mosaicGrid.classList.add('hidden');
    if (overviewMosaic) overviewMosaic.classList.add('hidden');
    if (placeholder) placeholder.classList.add('hidden');

    // Supprimer les anciens wrappers PDF s'ils existent
    const oldWrapper = container.querySelector('.pdf-view-wrapper');
    if (oldWrapper) {
        oldWrapper.remove();
    }

    const oldMosaicWrapper = container.querySelector('.pdf-mosaic-wrapper');
    if (oldMosaicWrapper) {
        oldMosaicWrapper.remove();
    }

    // Créer le wrapper principal pour la mosaïque
    const mosaicWrapper = document.createElement('div');
    mosaicWrapper.className = 'pdf-mosaic-wrapper';
    mosaicWrapper.style.display = 'flex';
    mosaicWrapper.style.flexDirection = 'column';
    mosaicWrapper.style.gap = '0.5rem';
    mosaicWrapper.style.width = '100%';
    mosaicWrapper.style.maxWidth = '67.6vh'; // Largeur de la vue 16:9 (38vh × 16/9)
    mosaicWrapper.style.height = '100%';
    mosaicWrapper.style.padding = '0.5rem';
    mosaicWrapper.style.margin = '0 auto'; // Centrer la mosaïque
    mosaicWrapper.style.overflow = 'visible';

    // Créer l'image principale (caméra 4 - vue de profil) en haut - 50% de l'espace
    const mainView = viewsData[0];
    const mainWrapper = createPDFViewElement(mainView, 0, '38vh', true);
    mosaicWrapper.appendChild(mainWrapper);

    // Créer le container pour les 2 images secondaires (caméras 5 et 6 - vues top) - 50% de l'espace
    const secondaryContainer = document.createElement('div');
    secondaryContainer.style.display = 'grid';
    secondaryContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    secondaryContainer.style.gap = '0.5rem';
    secondaryContainer.style.maxHeight = '38vh';

    // Créer les 2 images secondaires (vues du dessus)
    const secondaryView1 = viewsData[1];
    const secondaryView2 = viewsData[2];

    const secondaryWrapper1 = createPDFViewElement(secondaryView1, 1, '36vh', false);
    const secondaryWrapper2 = createPDFViewElement(secondaryView2, 2, '36vh', false);

    secondaryContainer.appendChild(secondaryWrapper1);
    secondaryContainer.appendChild(secondaryWrapper2);

    mosaicWrapper.appendChild(secondaryContainer);
    container.appendChild(mosaicWrapper);
}

/**
 * Crée un élément de vue PDF (image + SVG overlay + bouton download)
 * @param {Object} viewData - {imageUrl, hotspots, cameraId, cameraName}
 * @param {number} index - Index de la vue (pour fullscreen)
 * @param {string} maxHeight - Hauteur max CSS (ex: '36vh')
 * @param {boolean} isMain - Si c'est la vue principale (16:9) ou secondaire (1:1)
 * @returns {HTMLElement} Wrapper de la vue
 */
function createPDFViewElement(viewData, index, maxHeight, isMain) {
    // Créer le wrapper relatif
    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-view-item';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    wrapper.style.width = '100%';
    wrapper.style.maxHeight = maxHeight;
    wrapper.style.overflow = 'hidden';
    wrapper.style.borderRadius = isMain ? 'var(--radius-lg)' : 'var(--radius-md)';
    wrapper.style.boxShadow = isMain ? 'var(--shadow-xl)' : 'var(--shadow-md)';
    wrapper.dataset.url = viewData.imageUrl;

    // Créer l'image
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = viewData.imageUrl;
    img.alt = `Vue PDF ${viewData.cameraName || index + 1}`;
    img.style.display = 'block';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.cursor = 'pointer';
    if (!isMain) {
        img.style.aspectRatio = '1 / 1'; // Forcer le carré pour les vues secondaires
    }

    // Stocker les hotspots dans le wrapper pour accès ultérieur
    wrapper.dataset.hotspots = JSON.stringify(viewData.hotspots);

    // Event click pour fullscreen avec génération des 3 composites
    img.addEventListener('click', async () => {
        // Trouver toutes les images de la mosaïque PDF
        const pdfMosaicWrapper = document.querySelector('.pdf-mosaic-wrapper');
        if (!pdfMosaicWrapper) return;

        const allWrappers = pdfMosaicWrapper.querySelectorAll('.pdf-view-item');
        const allImages = Array.from(allWrappers).map(w => w.querySelector('img'));

        if (allImages.length !== 3) return;

        // Générer les images composites pour les 3 vues en parallèle
        const compositePromises = allImages.map(async (imgElement, idx) => {
            const isSquare = idx !== 0; // Première image = 16:9, les autres = 1:1
            const itemWrapper = imgElement.closest('.pdf-view-item');
            const itemHotspots = JSON.parse(itemWrapper.dataset.hotspots || '[]');
            return await generateCompositeImage(imgElement, itemHotspots, isSquare);
        });

        const compositeUrls = await Promise.all(compositePromises);

        // Remplacer temporairement les 3 images
        const originalSrcs = allImages.map(img => img.src);
        allImages.forEach((img, idx) => {
            img.src = compositeUrls[idx];
        });

        // Attendre que le DOM soit à jour
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Ouvrir fullscreen avec le bon index
        openFullscreen(index);

        // Attendre la fermeture du fullscreen pour nettoyer
        const modal = document.getElementById('fullscreenModal');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && modal.classList.contains('hidden')) {
                    allImages.forEach((img, idx) => {
                        img.src = originalSrcs[idx];
                        URL.revokeObjectURL(compositeUrls[idx]);
                    });
                    observer.disconnect();
                }
            });
        });
        observer.observe(modal, { attributes: true });
    });

    // Bouton download
    const downloadBtn = document.createElement('button');
    downloadBtn.classList.add('download-btn');
    downloadBtn.innerHTML = '⬇';
    downloadBtn.setAttribute('aria-label', 'Télécharger cette image');
    downloadBtn.setAttribute('title', 'Télécharger cette image');
    downloadBtn.style.position = 'absolute';
    downloadBtn.style.top = '10px';
    downloadBtn.style.right = '10px';
    downloadBtn.style.zIndex = '100';
    downloadBtn.style.opacity = '0';
    downloadBtn.style.transition = 'opacity 0.2s';

    wrapper.addEventListener('mouseenter', () => {
        downloadBtn.style.opacity = '1';
    });
    wrapper.addEventListener('mouseleave', () => {
        downloadBtn.style.opacity = '0';
    });

    downloadBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const filename = `vue_pdf_${viewData.cameraName || `camera_${index + 1}`}_hotspots.png`;
        try {
            const isSquare = !isMain;
            const compositeUrl = await generateCompositeImage(img, viewData.hotspots, isSquare);
            await downloadImage(compositeUrl, filename);
            URL.revokeObjectURL(compositeUrl);
            showSuccessToast('Image téléchargée avec succès !');
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            showError('Erreur lors du téléchargement de l\'image');
        }
    });

    // Fonction pour créer/recréer le SVG
    const updateSVG = () => {
        const imgWidth = img.offsetWidth;
        const imgHeight = img.offsetHeight;
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        const scaleX = imgWidth / naturalWidth;
        const scaleY = imgHeight / naturalHeight;

        const offsetX = img.offsetLeft;
        const offsetY = img.offsetTop;

        const oldSvg = wrapper.querySelector('svg');
        if (oldSvg) {
            oldSvg.remove();
        }

        const isSquare = !isMain;
        const svg = createSVGOverlay(imgWidth, imgHeight, viewData.hotspots, scaleX, scaleY, isSquare);
        svg.style.left = `${offsetX}px`;
        svg.style.top = `${offsetY}px`;

        wrapper.appendChild(svg);
    };

    // Attendre que l'image soit chargée pour créer le SVG initial
    img.onload = () => {
        updateSVG();

        const resizeObserver = new ResizeObserver(() => {
            updateSVG();
        });
        resizeObserver.observe(img);
    };

    wrapper.appendChild(img);
    wrapper.appendChild(downloadBtn);

    return wrapper;
}
