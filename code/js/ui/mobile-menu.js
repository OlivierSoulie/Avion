/**
 * @fileoverview Gestion du menu burger mobile
 * @module ui/mobile-menu
 * @version 1.0
 */

/**
 * Initialise le menu burger mobile
 * Déplace les données techniques dans le sidebar en mode mobile
 */
export function initMobileMenu() {
    const burgerBtn = document.getElementById('burgerMenuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const technicalControls = document.querySelector('.technical-controls');
    const sidebarContent = document.querySelector('.mobile-sidebar-content');

    if (!burgerBtn || !mobileSidebar || !sidebarOverlay) {
        console.warn('Éléments du menu burger manquants');
        return;
    }

    /**
     * Ouvre le sidebar mobile
     */
    function openSidebar() {
        mobileSidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
        burgerBtn.classList.add('open');
        document.body.style.overflow = 'hidden'; // Empêche le scroll du body
    }

    /**
     * Ferme le sidebar mobile
     */
    function closeSidebar() {
        mobileSidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        burgerBtn.classList.remove('open');
        document.body.style.overflow = ''; // Restore le scroll
    }

    /**
     * Déplace les données techniques dans le sidebar en mode mobile/medium
     */
    function moveTechnicalControlsToSidebar() {
        if (window.innerWidth <= 1366 && technicalControls && sidebarContent) {
            // Déplacer les données techniques dans le sidebar (mobile + écrans moyens)
            if (!sidebarContent.contains(technicalControls)) {
                sidebarContent.appendChild(technicalControls);
                technicalControls.style.display = 'flex'; // Réafficher dans le sidebar
            }
        } else if (technicalControls) {
            // Remettre les données techniques à leur place d'origine en desktop grand écran
            const viewportContainer = document.querySelector('.viewport-container');
            if (viewportContainer && !viewportContainer.contains(technicalControls)) {
                // Remettre au début du viewport-container
                viewportContainer.insertBefore(technicalControls, viewportContainer.firstChild);
                technicalControls.style.display = ''; // Reset display
            }
        }
    }

    // Event listeners
    burgerBtn.addEventListener('click', () => {
        if (mobileSidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }

    sidebarOverlay.addEventListener('click', closeSidebar);

    // Fermer avec la touche Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileSidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    // Déplacer les contrôles au chargement et au resize
    moveTechnicalControlsToSidebar();
    window.addEventListener('resize', moveTechnicalControlsToSidebar);

    console.log('✅ Menu burger mobile initialisé');
}
