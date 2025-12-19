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

            // Restaurer l'image originale après un court délai
            setTimeout(() => {
                img.src = originalSrc;
                URL.revokeObjectURL(compositeUrl); // Nettoyer l'URL blob
            }, 100);
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
        const svg = createSVGOverlay(imgWidth, imgHeight, hotspots, scaleX, scaleY);

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
 * @returns {SVGElement} SVG overlay
 */
function createSVGOverlay(width, height, hotspots, scaleX, scaleY) {
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

    // Définir les 6 emplacements fixes
    const slots = getLabelSlots(width, height);
    const usedSlots = [];

    // Filtrer et préparer les hotspots visibles avec leurs positions scalées
    const visibleHotspots = [];
    hotspots.forEach((hotspot, index) => {
        if (hotspot.visibility !== 'Visible' && hotspot.visibility !== 'visible') {
            return;
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
async function generateCompositeImage(img, hotspots) {
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

        // Calculer les slots pour les labels
        const slots = getLabelSlots(width, height);
        const usedSlots = [];

        // Filtrer et préparer les hotspots visibles
        const visibleHotspots = [];
        hotspots.forEach((hotspot, index) => {
            if (hotspot.visibility !== 'Visible' && hotspot.visibility !== 'visible') {
                return;
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
