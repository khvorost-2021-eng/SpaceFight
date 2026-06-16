// ==========================================
// ИНИЦИАЛИЗАЦИЯ SIDEBAR
// ==========================================
function initSidebar() {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    if (sidebarBtns.length === 0) {
        console.warn('⚠️ Sidebar-кнопки не найдены');
        return;
    }

    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (!view) return;

            console.log(`🎨 Sidebar клик: ${view}`);

            // Скрываем все overlay-экраны
            ['deathScreen', 'levelCompleteScreen', 'pauseScreen'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.add('hidden');
                    el.style.display = 'none';
                    el.style.pointerEvents = 'none';
                }
            });

            document.body.classList.remove('in-game');
            document.body.classList.remove('showing-overlay');

            switch(view) {
                case 'home':
                    if (typeof Game.showMainMenu === 'function') Game.showMainMenu();
                    break;
                case 'levels':
                    if (typeof Game.showLevelSelect === 'function') Game.showLevelSelect();
                    else if (typeof window.switchView === 'function') window.switchView('levels');
                    break;
                case 'profile':
                    if (typeof Game.showProfileScreen === 'function') Game.showProfileScreen();
                    else if (typeof window.switchView === 'function') window.switchView('profile');
                    break;
                case 'shop':
                    if (typeof Game.showShopScreen === 'function') Game.showShopScreen();
                    else if (typeof window.switchView === 'function') window.switchView('shop');
                    break;
                case 'settings':
                    if (typeof window.switchView === 'function') window.switchView('settings');
                    break;
            }
        });
    });

    console.log('✅ Sidebar инициализирован — обработчики навешены на', sidebarBtns.length, 'кнопок');
}
window.initSidebar = initSidebar;
console.log('✅ main/sidebar.js загружен');